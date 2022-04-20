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

class API extends \Piwik\Plugin\API
{
    /**
     * @var Model
     */
    private $model;

    /**
     * @var Access\RolesProvider
     */
    private $roleProvider;
    
    private static $instance = null;

    public function __construct(Model $model)
    {
        $this->model = $model;
        $this->roleProvider = StaticContainer::get(RolesProvider::class);
    }

    public static function getInstance()
    {
        try {
            $instance = StaticContainer::get('GroupPermissions_API');
            if (!($instance instanceof API)) {
                // Exception is caught below and corrected
                throw new Exception('GroupPermissions_API must inherit API');
            }
            self::$instance = $instance;
        } catch (Exception $e) {
            self::$instance = StaticContainer::get('Piwik\Plugins\GroupPermissions\API');
            StaticContainer::getContainer()->set('GroupPermissions_API', self::$instance);
        }

        return self::$instance;
    }

    public function getGroupAccessFromSite($idSite)
    {
        Piwik::checkUserHasAdminAccess($idSite);
        
        $groups = $this->model->getAllGroups();
        $groupAccess = $this->model->getPermissionsOfSite($idSite);
        
        $data = array();
        
        foreach ($groups as $group) {
            $data[$group['idgroup']] = array('name' => $group['name'], 'access' => 'noaccess');
        }
        
        foreach ($groupAccess as $ga) {
            $data[$ga['idgroup']]['access'] =  $ga['access'];
        }
        
        $return = array();
        foreach ($data as $group) {
            $return[$group['name']] = $group['access'];
        }
        
        return $return;
    }
    

    public function getAllGroups()
    {
        return $this->model->getAllGroups();
    }
    
    public function getMembersOfGroup($idGroup)
    {
        Piwik::checkUserHasSuperUserAccess();
        
        return $this->model->getMembersOfGroup($idGroup);
    }
    
    public function addUserToGroup($idGroup, $login)
    {
        Piwik::checkUserHasSuperUserAccess();
        
        $idGroup = $this->model->getGroupWithId($idGroup);
        if (empty($idGroup['idgroup'])) {
            throw new Exception(Piwik::translate("GroupPermissions_ExceptionGroupDoesNotExist", $idGroup));
        }
        $idGroup = $idGroup['idgroup'];
        
        $usersManagerApi = UsersManagerAPI::getInstance();
        if (!$usersManagerApi->userExists($login)) {
            throw new Exception(Piwik::translate("UsersManager_ExceptionUserDoesNotExist", $login));
        }

        if ($this->model->isUserInGroup($login, $idGroup)) {
            throw new Exception(Piwik::translate("GroupPermissions_ExceptionUserAlreadyInGroup", $login));
        }
        
        $this->model->removeUserFromGroup($idGroup, $login);
        
        return $this->model->addUserToGroup($idGroup, $login);
    }

    public function removeUserFromGroup($idGroup, $login)
    {
        Piwik::checkUserHasSuperUserAccess();
        
        $idGroup = $this->model->getGroupWithId($idGroup);
        if (empty($idGroup['idgroup'])) {
            throw new Exception(Piwik::translate("GroupPermissions_ExceptionGroupDoesNotExist", $idGroup));
        }
        $idGroup = $idGroup['idgroup'];
        
        $usersManagerApi = UsersManagerAPI::getInstance();
        if (!$usersManagerApi->userExists($login)) {
            throw new Exception(Piwik::translate("UsersManager_ExceptionUserDoesNotExist", $login));
        }
        
        return $this->model->removeUserFromGroup($idGroup, $login);
    }
    
    public function setGroupAccess($name, $access, $idSites)
    {
        if ($access != 'noaccess') {
            $this->checkAccessType($access);
        }
        
        $idGroup = $this->model->getGroupWithName($name);
        if (empty($idGroup['idgroup'])) {
            throw new Exception(Piwik::translate("GroupPermissions_ExceptionGroupDoesNotExist", $name));
        }
        $idGroup = $idGroup['idgroup'];
        
        // in case idSites is all we grant access to all the websites on which the current connected user has an 'admin' access
        if ($idSites === 'all') {
            $idSites = \Piwik\Plugins\SitesManager\API::getInstance()->getSitesIdWithAdminAccess();
        } // in case the idSites is an integer we build an array
        else {
            $idSites = Site::getIdSitesFromIdSitesString($idSites);
        }

        if (empty($idSites)) {
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
    
    private function checkAccessType($access)
    {
        $roles = $this->roleProvider->getAllRoleIds();
        
        if (!in_array($access, $roles, true)) {
            throw new Exception(Piwik::translate("UsersManager_ExceptionAccessValues", implode(", ", $roles), $access));
        }
    }
    
    public function createGroup($groupName)
    {
        Piwik::checkUserHasSuperUserAccess();
        
        $idGroup = $this->model->getGroupWithName($groupName);
        if (!empty($idGroup['idgroup'])) {
            throw new Exception(Piwik::translate("GroupPermissions_ExceptionGroupDoesExist", $idGroup));
        }
        
        return $this->model->createGroup($groupName);
    }

    public function renameGroup($idGroup, $newName)
    {
        Piwik::checkUserHasSuperUserAccess();
        
        $idGroup = $this->model->getGroupWithId($idGroup);
        if (empty($idGroup['idgroup'])) {
            throw new Exception(Piwik::translate("GroupPermissions_ExceptionGroupDoesNotExist", $idGroup));
        }
        $idGroup = $idGroup['idgroup'];
        
        if ($this->model->getGroupWithName($newName)) {
            throw new Exception(Piwik::translate("GroupPermissions_ExceptionGroupDoesExist", $idGroup));
        }

        return $this->model->renameGroup($idGroup, $newName);
    }

    public function deleteGroup($idGroup)
    {
        Piwik::checkUserHasSuperUserAccess();
        
        $idGroup = $this->model->getGroupWithId($idGroup);
        if (empty($idGroup['idgroup'])) {
            throw new Exception(Piwik::translate("GroupPermissions_ExceptionGroupDoesNotExist", $idGroup));
        }
        $idGroup = $idGroup['idgroup'];
        
        $this->model->removeAllPermissionsOfGroup($idGroup);
        $this->model->removeAllUsersOfGroup($idGroup);
        
        return $this->model->deleteGroup($idGroup);
    }
}
