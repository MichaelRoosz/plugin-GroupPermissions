<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Exception;
use Piwik\Access;
use Piwik\Access\RolesProvider;
use Piwik\Container\StaticContainer;
use Piwik\Piwik;
use Piwik\Site;
use Piwik\Tracker\Cache;
use Piwik\Plugins\UsersManager\API as UsersManagerAPI;
use Piwik\Plugins\SitesManager\API as SitesManagerAPI;

class API extends \Piwik\Plugin\API {
    /**
     * @var Model $model
     */
    private $model;

    /**
     * @var Access\RolesProvider $roleProvider
     */
    private $roleProvider;

    /**
     * @var ?self $instance
     */
    private static $instance = null;

    public function __construct(Model $model) {
        $this->model = $model;

        $roleProvider = StaticContainer::get(RolesProvider::class);
        if (!($roleProvider instanceof RolesProvider)) {
            throw new Exception('RolesProvider must inherit Access\RolesProvider');
        }
        $this->roleProvider = $roleProvider;
    }

    /**
     * @return self
     */
    public static function getInstance() {
        try {
            $instance = StaticContainer::get('GroupPermissions_API');
            if (!($instance instanceof API)) {
                // Exception is caught below and corrected
                throw new Exception('GroupPermissions_API must inherit API');
            }
            self::$instance = $instance;

        } catch (Exception $e) {
            $instance = StaticContainer::get('Piwik\Plugins\GroupPermissions\API');
            if (!($instance instanceof API)) {
                // Exception is caught below and corrected
                throw new Exception('GroupPermissions_API must inherit API');
            }

            self::$instance = $instance;

            StaticContainer::getContainer()->set('GroupPermissions_API', self::$instance);
        }

        return self::$instance;
    }

    /**
     * @return array<string, string>
     */
    public function getGroupAccessFromSite(int $idSite): array {
        Piwik::checkUserHasAdminAccess($idSite);

        $groups = $this->model->getAllGroups();
        $groupAccess = $this->model->getPermissionsOfSite($idSite);

        $data = [];

        foreach ($groups as $group) {
            $data[$group['idgroup']] = [
                'name' => $group['name'],
                'access' => 'noaccess',
            ];
        }

        foreach ($groupAccess as $ga) {
            $data[$ga['idgroup']]['access'] = $ga['access'];
        }

        $return = [];
        foreach ($data as $group) {
            $return[$group['name']] = $group['access'];
        }

        return $return;
    }

    /**
     * @return array<array{
     *   idGroup: int,
     *   name: string
     * }>
     */
    public function getAllGroups(): array {
        Piwik::checkUserHasSomeAdminAccess();

        $groups = $this->model->getAllGroups();
        if (!$groups) {
            return [];
        }

        $mappedGroups = [];
        foreach ($groups as $group) {
            $mappedGroups[] = [
                'idGroup' => intval($group['idgroup']),
                'name' => $group['name'],
            ];
        }

        return $mappedGroups;
    }

    /**
     * @return array{
     *   idGroup: int,
     *   name: string
     * }
     */
    public function getGroupWithId(int $idGroup): array {
        Piwik::checkUserHasSomeAdminAccess();

        $group = $this->model->getGroupWithId($idGroup);
        if (!$group) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }

        return [
            'idGroup' => intval($group['idgroup']),
            'name' => $group['name'],
        ];
    }

    /**
     * @return array<array{
     *    login: string
     * }>
     */
    public function getMembersOfGroup(int $idGroup): array {
        Piwik::checkUserHasSuperUserAccess();

        return $this->model->getMembersOfGroup($idGroup);
    }

    public function addUserToGroup(int $idGroup, string $login): void {
        Piwik::checkUserHasSuperUserAccess();

        $group = $this->model->getGroupWithId($idGroup);
        if (empty($group['idgroup'])) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }
        $idGroup = $group['idgroup'];

        $usersManagerApi = UsersManagerAPI::getInstance();
        if (!$usersManagerApi->userExists($login)) {
            throw new Exception(Piwik::translate('UsersManager_ExceptionUserDoesNotExist', $login));
        }

        if ($this->model->isUserInGroup($login, $idGroup)) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionUserAlreadyInGroup', $login));
        }

        $this->model->removeUserFromGroup($idGroup, $login);

        $this->model->addUserToGroup($idGroup, $login);
    }

    public function removeUserFromGroup(int $idGroup, string $login): void {
        Piwik::checkUserHasSuperUserAccess();

        $group = $this->model->getGroupWithId($idGroup);
        if (empty($group['idgroup'])) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }
        $idGroup = $group['idgroup'];

        $usersManagerApi = UsersManagerAPI::getInstance();
        if (!$usersManagerApi->userExists($login)) {
            throw new Exception(Piwik::translate('UsersManager_ExceptionUserDoesNotExist', $login));
        }

        $this->model->removeUserFromGroup($idGroup, $login);
    }

    public function setGroupAccess(string $name, string $access, string $idSites): void {
        Piwik::checkUserHasSomeAdminAccess();

        if ($access != 'noaccess') {
            $this->checkAccessType($access);
        }

        $group = $this->model->getGroupWithName($name);
        if (empty($group['idgroup'])) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $name));
        }
        $idGroup = $group['idgroup'];

        // in case idSites is all we grant access to all the websites on which the current connected user has an 'admin' access
        if ($idSites === 'all') {
            $idSites = SitesManagerAPI::getInstance()->getSitesIdWithAdminAccess();
        } // in case the idSites is an integer we build an array
        else {
            $idSites = Site::getIdSitesFromIdSitesString($idSites);
        }

        if (!$idSites) {
            throw new Exception('Specify at least one website ID in &idSites=');
        }
        // it is possible to set user access on websites only for the websites admin
        // basically an admin can give the view or the admin access to any user for the websites he manages
        Piwik::checkUserHasAdminAccess($idSites);

        foreach ($idSites as $idSite) {
            $this->model->removePermission($idGroup, $idSite);
        }

        // if the access is noaccess then we don't save it as this is the default value
        // when no access are specified
        if ($access != 'noaccess') {
            foreach ($idSites as $idSite) {
                $this->model->createPermission($idGroup, $idSite, $access);
            }
        }

        // we reload the access list which doesn't yet take in consideration this new user access
        Access::getInstance()->reloadAccess();
        Cache::deleteTrackerCache();
    }

    /**
     * @return array{
     *   idGroup: int,
     *   name: string
     * }
     */
    public function createGroup(string $groupName): array {
        Piwik::checkUserHasSuperUserAccess();

        try {
            $existingGroup = $this->model->getGroupWithName($groupName);
        } catch (Exception $e) {
            $existingGroup = null;
        }

        if ($existingGroup) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesExist', $groupName));
        }

        $idGroup = $this->model->createGroup($groupName);
        if (!$idGroup) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }

        return [
            'idGroup' => $idGroup,
            'name' => $groupName,
        ];
    }

    public function renameGroup(int $idGroup, string $newName): void {
        Piwik::checkUserHasSuperUserAccess();

        $group = $this->model->getGroupWithId($idGroup);
        if (empty($group['idgroup'])) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }
        $idGroup = $group['idgroup'];

        try {
            $existingGroup = $this->model->getGroupWithName($newName);
        } catch (Exception $e) {
            $existingGroup = null;
        }

        if ($existingGroup) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesExist', $newName));
        }

        $this->model->renameGroup($idGroup, $newName);
    }

    public function deleteGroup(int $idGroup): void {
        Piwik::checkUserHasSuperUserAccess();

        $group = $this->model->getGroupWithId($idGroup);
        if (empty($group['idgroup'])) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }
        $idGroup = $group['idgroup'];

        $this->model->removeAllPermissionsOfGroup($idGroup);
        $this->model->removeAllUsersOfGroup($idGroup);

        $this->model->deleteGroup($idGroup);
    }

    private function checkAccessType(string $access): void {
        $roles = $this->roleProvider->getAllRoleIds();

        if (!in_array($access, $roles, true)) {
            throw new Exception(Piwik::translate('UsersManager_ExceptionAccessValues', implode(', ', $roles), $access));
        }
    }
}
