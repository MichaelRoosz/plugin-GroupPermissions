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
use Piwik\Common;
use Piwik\Access\CapabilitiesProvider;
use Piwik\Access\RolesProvider;
use Piwik\Container\StaticContainer;
use Piwik\API\Request;
use Piwik\Piwik;
use Piwik\Plugin\Manager as PluginManager;
use Piwik\Plugins\Dashboard\Dashboard;
use Piwik\Plugins\Dashboard\Model as DashboardModel;
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
     * @var CapabilitiesProvider $capabilityProvider
     */
    private $capabilityProvider;

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

        $capabilityProvider = StaticContainer::get(CapabilitiesProvider::class);
        if (!($capabilityProvider instanceof CapabilitiesProvider)) {
            throw new Exception('CapabilitiesProvider must inherit Access\CapabilitiesProvider');
        }
        $this->capabilityProvider = $capabilityProvider;
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

        // throws for websites that do not exist (super users pass the access check for any id)
        new Site($idSite);

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
            if (!isset($data[$ga['idgroup']])) {
                continue;
            }
            $data[$ga['idgroup']]['access'] = $ga['access'];
        }

        // names are stored sanitized (e.g. `&` as `&amp;`); the API response only unsanitizes values, not keys,
        // so return the original name here. Otherwise the name shown and sent back by the UI would not match
        // the group anymore (setGroupAccess sanitizes it again).
        $return = [];
        foreach ($data as $group) {
            $return[Common::unsanitizeInputValue($group['name'])] = $group['access'];
        }

        return $return;
    }

    /**
     * Returns all groups sorted by name, with their role and capabilities for a website.
     *
     * @return array<array{
     *   idGroup: int,
     *   name: string,
     *   access: string,
     *   capabilities: array<string>
     * }>
     */
    public function getGroupPermissionsFromSite(int $idSite): array {
        Piwik::checkUserHasAdminAccess($idSite);

        // throws for websites that do not exist (super users pass the access check for any id)
        new Site($idSite);

        $access = [];
        foreach ($this->model->getPermissionsOfSite($idSite) as $permission) {
            $access[$permission['idgroup']] = $permission['access'];
        }
        $capabilities = $this->model->getCapabilitiesOfSite($idSite);

        $groups = [];
        foreach ($this->model->getAllGroups() as $group) {
            $role = $access[$group['idgroup']] ?? 'noaccess';
            $groups[] = [
                'idGroup' => $group['idgroup'],
                'name' => $group['name'],
                'access' => $role,
                'capabilities' => $role === 'noaccess'
                    ? []
                    : $this->filterCapabilities($capabilities[$group['idgroup']] ?? [], $role),
            ];
        }

        usort($groups, static function (array $a, array $b): int {
            return strcasecmp($a['name'], $b['name']);
        });

        return $groups;
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
     * Returns all groups sorted by name, with the number of members and of websites they have access to.
     *
     * @return array<array{
     *   idGroup: int,
     *   name: string,
     *   memberCount: int,
     *   siteCount: int
     * }>
     */
    public function getGroupsOverview(): array {
        Piwik::checkUserHasSuperUserAccess();

        $memberCounts = $this->model->countMembersPerGroup();
        $siteCounts = $this->model->countSitesPerGroup();

        $groups = [];
        foreach ($this->model->getAllGroups() as $group) {
            $groups[] = [
                'idGroup' => intval($group['idgroup']),
                'name' => $group['name'],
                'memberCount' => $memberCounts[$group['idgroup']] ?? 0,
                'siteCount' => $siteCounts[$group['idgroup']] ?? 0,
            ];
        }

        usort($groups, static function (array $a, array $b): int {
            return strcasecmp($a['name'], $b['name']);
        });

        return $groups;
    }

    /**
     * Returns the websites a group has access to, sorted by website name.
     *
     * @return array<array{
     *   idSite: int,
     *   name: string,
     *   access: string,
     *   capabilities: array<string>
     * }>
     */
    public function getSitesAccessFromGroup(int $idGroup): array {
        Piwik::checkUserHasSuperUserAccess();

        $group = $this->model->getGroupWithId($idGroup);
        if (empty($group['idgroup'])) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }

        $capabilities = $this->model->getCapabilitiesOfGroup($group['idgroup']);

        $sites = [];
        foreach ($this->model->getPermissionsOfGroup($group['idgroup']) as $permission) {
            $site = SitesManagerAPI::getInstance()->getSiteFromId($permission['idsite']);
            if (!is_array($site) || !isset($site['name']) || !is_string($site['name'])) {
                continue;
            }

            $sites[] = [
                'idSite' => $permission['idsite'],
                'name' => $site['name'],
                'access' => $permission['access'],
                'capabilities' => $this->filterCapabilities(
                    $capabilities[$permission['idsite']] ?? [],
                    $permission['access']
                ),
            ];
        }

        usort($sites, static function (array $a, array $b): int {
            return strcasecmp($a['name'], $b['name']);
        });

        return $sites;
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

        if ($login === 'anonymous') {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionAnonymousNotAllowed'));
        }

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

    /**
     * Invites a new user by email and directly adds them to the given groups.
     *
     * Matomo core requires an initial website when inviting a user. This method picks a website the
     * selected groups have access to (so the invitation email mentions a relevant site), invites the
     * user via UsersManager.inviteUser, then removes that direct website access again so the user's
     * permissions come only from the groups.
     *
     * @param string $userLogin Login name for the invited user.
     * @param string $email Email address for the invited user.
     * @param array<int|string>|string $idGroups Group IDs, as an array or comma separated string.
     * @param int|null $expiryInDays Number of days before the invite expires. Uses the configured default when empty.
     * @param string|null $passwordConfirmation Current user's password confirmation when required by session auth.
     */
    public function inviteUserToGroups(
        string $userLogin,
        string $email,
        $idGroups,
        $expiryInDays = null,
        #[\SensitiveParameter]
        ?string $passwordConfirmation = null
    ): void {
        Piwik::checkUserHasSuperUserAccess();

        $idGroups = $this->parseIdGroups($idGroups);
        if (!$idGroups) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionNoGroupSelected'));
        }

        foreach ($idGroups as $idGroup) {
            $group = $this->model->getGroupWithId($idGroup);
            if (empty($group['idgroup'])) {
                throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
            }
        }

        $initialIdSite = $this->getInitialIdSiteForGroups($idGroups);

        $usersManagerApi = UsersManagerAPI::getInstance();
        $usersManagerApi->inviteUser($userLogin, $email, $initialIdSite, $expiryInDays, $passwordConfirmation);

        // permissions are granted through the groups only, remove the initial direct access again
        $usersManagerApi->setUserAccess($userLogin, 'noaccess', $initialIdSite);

        foreach ($idGroups as $idGroup) {
            $this->model->addUserToGroup($idGroup, $userLogin);
        }

        Access::getInstance()->reloadAccess();
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

        $idSites = $this->getIdSitesCheckAdminAccess($idSites);

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

        $this->removeCapabilitiesNotApplyingToRole($idGroup, $idSites, $access);

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

        $this->checkGroupName($groupName);

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

        $this->checkGroupName($newName);

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

        $this->model->removeAllCapabilitiesOfGroup($idGroup);
        $this->model->removeAllPermissionsOfGroup($idGroup);
        $this->model->removeAllUsersOfGroup($idGroup);

        $this->model->deleteGroup($idGroup);
    }

    /**
     * Adds capabilities (e.g. `tagmanager_write`) to a group for the given websites.
     *
     * Works like UsersManager.addCapabilities: the group needs a role for each website, and capabilities that
     * the group's role already includes are not stored. To fetch the available capabilities call
     * "UsersManager.getAvailableCapabilities".
     *
     * @param int $idGroup
     * @param string|array<string> $capabilities One capability ID or a list of capability IDs
     * @param string $idSites Website ID, comma separated list of website IDs or "all"
     */
    public function addGroupCapabilities(int $idGroup, $capabilities, string $idSites): void {
        Piwik::checkUserHasSomeAdminAccess();

        $capabilities = $this->parseCapabilities($capabilities);
        $group = $this->getGroupOrFail($idGroup);
        $idSites = $this->getIdSitesCheckAdminAccess($idSites);

        $roles = [];
        foreach ($this->model->getPermissionsOfGroup($group['idgroup']) as $permission) {
            $roles[$permission['idsite']] = $permission['access'];
        }

        foreach ($idSites as $idSite) {
            if (!isset($roles[$idSite])) {
                throw new Exception(Piwik::translate(
                    'GroupPermissions_ExceptionNoCapabilitiesWithoutRole',
                    [Common::unsanitizeInputValue($group['name']), $idSite]
                ));
            }
        }

        foreach ($capabilities as $capabilityId) {
            $capability = $this->capabilityProvider->getCapability($capabilityId);

            foreach ($idSites as $idSite) {
                // the role already grants this capability
                if ($capability && $capability->hasRoleCapability($roles[$idSite])) {
                    continue;
                }

                $this->model->addCapability($group['idgroup'], $idSite, $capabilityId);
            }
        }

        Access::getInstance()->reloadAccess();
        Cache::deleteTrackerCache();
    }

    /**
     * Removes capabilities from a group for the given websites.
     *
     * @param int $idGroup
     * @param string|array<string> $capabilities One capability ID or a list of capability IDs
     * @param string $idSites Website ID, comma separated list of website IDs or "all"
     */
    public function removeGroupCapabilities(int $idGroup, $capabilities, string $idSites): void {
        Piwik::checkUserHasSomeAdminAccess();

        $capabilities = $this->parseCapabilities($capabilities);
        $group = $this->getGroupOrFail($idGroup);
        $idSites = $this->getIdSitesCheckAdminAccess($idSites);

        foreach ($capabilities as $capabilityId) {
            foreach ($idSites as $idSite) {
                $this->model->removeCapability($group['idgroup'], $idSite, $capabilityId);
            }
        }

        Access::getInstance()->reloadAccess();
        Cache::deleteTrackerCache();
    }

    /**
     * Copies a dashboard of the current user to all members of a group.
     *
     * Like Dashboard.copyDashboardToUser, the dashboard is only copied to users the current user is allowed to
     * see (super users see everyone, admins see the users of their websites). The current user and the anonymous
     * user are skipped.
     *
     * @param int $idDashboard Id of the current user's dashboard that should be copied
     * @param int $idGroup Group whose members receive a copy
     * @param string $dashboardName Name of the new dashboards
     *
     * @return array<string> Logins of the users the dashboard was copied to
     */
    public function copyDashboardToGroup(int $idDashboard, int $idGroup, string $dashboardName = ''): array {
        Piwik::checkUserHasSomeAdminAccess();

        if (!PluginManager::getInstance()->isPluginActivated('Dashboard')) {
            throw new Exception('The Dashboard plugin is not activated.');
        }

        $group = $this->model->getGroupWithId($idGroup);
        if (empty($group['idgroup'])) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }

        $currentLogin = Piwik::getCurrentUserLogin();

        $dashboard = StaticContainer::get(Dashboard::class);
        if (!($dashboard instanceof Dashboard)) {
            throw new Exception('Dashboard plugin could not be loaded.');
        }

        $layout = $dashboard->getLayoutForUser($currentLogin, $idDashboard);
        if ($layout === false) {
            throw new Exception('Dashboard not found');
        }

        // UsersManager.getUsers only returns users the current user is allowed to manage
        $visibleLogins = [];
        $users = Request::processRequest('UsersManager.getUsers', ['filter_limit' => -1]);
        if (is_array($users)) {
            foreach ($users as $user) {
                if (is_array($user) && isset($user['login']) && is_string($user['login'])) {
                    $visibleLogins[$user['login']] = true;
                }
            }
        }

        $dashboardModel = StaticContainer::get(DashboardModel::class);
        if (!($dashboardModel instanceof DashboardModel)) {
            throw new Exception('Dashboard plugin could not be loaded.');
        }

        $copiedTo = [];
        foreach ($this->model->getMembersOfGroup($group['idgroup']) as $member) {
            $login = $member['login'];

            if ($login === $currentLogin || $login === 'anonymous' || !isset($visibleLogins[$login])) {
                continue;
            }

            $dashboardModel->createNewDashboardForUser($login, $dashboardName, $layout);
            $copiedTo[] = $login;
        }

        return $copiedTo;
    }

    /**
     * @return array{
     *   idgroup: int,
     *   name: string
     * }
     */
    private function getGroupOrFail(int $idGroup): array {
        $group = $this->model->getGroupWithId($idGroup);
        if (empty($group['idgroup'])) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }

        return $group;
    }

    /**
     * Resolves the `idSites` parameter ("all" means all websites the current user administers) and checks that
     * the current user administers all of them and that they exist.
     *
     * @return array<int>
     */
    private function getIdSitesCheckAdminAccess(string $idSites): array {
        if ($idSites === 'all') {
            $idSites = SitesManagerAPI::getInstance()->getSitesIdWithAdminAccess();
        } else {
            $idSites = Site::getIdSitesFromIdSitesString($idSites);
        }

        $idSites = array_map(static function ($idSite): int {
            if (!is_numeric($idSite)) {
                throw new Exception('Invalid website ID in &idSites=');
            }

            return (int) $idSite;
        }, $idSites);

        if (!$idSites) {
            throw new Exception('Specify at least one website ID in &idSites=');
        }

        // it is possible to set group access on websites only for the websites admin
        Piwik::checkUserHasAdminAccess($idSites);

        // super users pass the access check above for any id, make sure the websites exist
        foreach ($idSites as $idSite) {
            new Site($idSite);
        }

        return $idSites;
    }

    /**
     * @param mixed $capabilities
     *
     * @return array<string>
     */
    private function parseCapabilities($capabilities): array {
        if (is_string($capabilities)) {
            $capabilities = [$capabilities];
        }

        if (!is_array($capabilities)) {
            throw new Exception('Invalid capability in &capabilities=');
        }

        $parsed = [];
        foreach ($capabilities as $capability) {
            if (!is_string($capability)) {
                throw new Exception('Invalid capability in &capabilities=');
            }
            $capability = trim($capability);
            // not using CapabilitiesProvider::checkValidCapability(), its error message is broken in Matomo 5
            if (!$this->capabilityProvider->isValidCapability($capability)) {
                throw new Exception(Piwik::translate('UsersManager_ExceptionAccessValues', [
                    implode(', ', $this->capabilityProvider->getAllCapabilityIds()),
                    $capability,
                ]));
            }
            $parsed[] = $capability;
        }

        if (!$parsed) {
            throw new Exception('Specify at least one capability in &capabilities=');
        }

        return array_values(array_unique($parsed));
    }

    /**
     * Returns the capabilities that apply in addition to a role: unknown capabilities (e.g. of a deactivated
     * plugin) and capabilities the role already includes are left out.
     *
     * @param array<string> $capabilities
     *
     * @return array<string>
     */
    private function filterCapabilities(array $capabilities, string $role): array {
        $result = [];
        foreach ($capabilities as $capabilityId) {
            $capability = $this->capabilityProvider->getCapability($capabilityId);
            if ($capability && !$capability->hasRoleCapability($role)) {
                $result[] = $capabilityId;
            }
        }

        return $result;
    }

    /**
     * After the role of a group changed: capabilities never apply without a role, and the ones included in the
     * new role are redundant. Other capabilities are kept (unlike UsersManager.setUserAccess), so changing the
     * role from "view" to "write" does not lose e.g. the Tag Manager publish capability.
     *
     * @param array<int> $idSites
     */
    private function removeCapabilitiesNotApplyingToRole(int $idGroup, array $idSites, string $access): void {
        if ($access === 'noaccess') {
            foreach ($idSites as $idSite) {
                $this->model->removeAllCapabilitiesOfGroupForSite($idGroup, $idSite);
            }

            return;
        }

        $capabilitiesBySite = $this->model->getCapabilitiesOfGroup($idGroup);
        foreach ($idSites as $idSite) {
            foreach ($capabilitiesBySite[$idSite] ?? [] as $capabilityId) {
                $capability = $this->capabilityProvider->getCapability($capabilityId);
                if ($capability && $capability->hasRoleCapability($access)) {
                    $this->model->removeCapability($idGroup, $idSite, $capabilityId);
                }
            }
        }
    }

    /**
     * @param mixed $idGroups
     *
     * @return array<int>
     */
    private function parseIdGroups($idGroups): array {
        if (is_string($idGroups)) {
            $idGroups = $idGroups === '' ? [] : explode(',', $idGroups);
        } elseif (is_int($idGroups)) {
            $idGroups = [$idGroups];
        }

        if (!is_array($idGroups)) {
            throw new Exception('Invalid group ID in &idGroups=');
        }

        $parsed = [];
        foreach ($idGroups as $idGroup) {
            if (is_string($idGroup)) {
                $idGroup = trim($idGroup);
            }
            if (!is_numeric($idGroup) || (int) $idGroup <= 0) {
                throw new Exception('Invalid group ID in &idGroups=');
            }
            $parsed[] = (int) $idGroup;
        }

        return array_values(array_unique($parsed));
    }

    /**
     * Returns a website one of the groups has access to, or any existing website as fallback.
     *
     * @param array<int> $idGroups
     */
    private function getInitialIdSiteForGroups(array $idGroups): int {
        foreach ($idGroups as $idGroup) {
            foreach ($this->model->getPermissionsOfGroup($idGroup) as $permission) {
                if ($permission['idsite'] > 0) {
                    return $permission['idsite'];
                }
            }
        }

        foreach (SitesManagerAPI::getInstance()->getAllSitesId() as $idSite) {
            if (is_numeric($idSite) && (int) $idSite > 0) {
                return (int) $idSite;
            }
        }

        throw new Exception(Piwik::translate('UsersManager_AddUserNoInitialAccessError'));
    }

    /**
     * Group names are stored in a VARCHAR column, longer names would be truncated silently.
     * Note: the length is checked on the sanitized value Matomo stores (e.g. `"` is stored as `&quot;`).
     */
    private function checkGroupName(string $name): void {
        if (mb_strlen($name) > Dao\Group::NAME_MAX_LENGTH) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupNameTooLong', [Dao\Group::NAME_MAX_LENGTH]));
        }
    }

    private function checkAccessType(string $access): void {
        $roles = $this->roleProvider->getAllRoleIds();

        if (!in_array($access, $roles, true)) {
            throw new Exception(Piwik::translate('UsersManager_ExceptionAccessValues', [implode(', ', $roles), $access]));
        }
    }
}
