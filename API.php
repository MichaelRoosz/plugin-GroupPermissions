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
use Piwik\Db;
use Piwik\API\Request;
use Piwik\Log\LoggerInterface;
use Piwik\Piwik;
use Piwik\Plugin\Manager as PluginManager;
use Piwik\Plugins\Dashboard\Dashboard;
use Piwik\Plugins\Dashboard\Model as DashboardModel;
use Piwik\Plugins\SegmentEditor\Model as SegmentEditorModel;
use Piwik\Site;
use Piwik\Tracker\Cache;
use Piwik\Plugins\UsersManager\API as UsersManagerAPI;
use Piwik\Plugins\UsersManager\Model as UsersModel;
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
     * Returns the role of every group for a website, by group name.
     *
     * @deprecated use getGroupPermissionsFromSite: group names are used as keys here, so numeric names (e.g. `2024`)
     *             become numeric keys, which Matomo's API treats as a list (a JSON array, or renumbered keys with
     *             `filter_limit`). Kept unchanged for compatibility.
     *
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

        $group = $this->getGroupOrFail($idGroup);

        $capabilities = $this->model->getCapabilitiesOfGroup($group['idgroup']);

        $sites = [];
        foreach ($this->model->getPermissionsWithSiteNamesOfGroup($group['idgroup']) as $permission) {
            $sites[] = [
                'idSite' => $permission['idsite'],
                'name' => $permission['name'],
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

        $group = $this->getGroupOrFail($idGroup);

        return [
            'idGroup' => intval($group['idgroup']),
            'name' => $group['name'],
        ];
    }

    /**
     * @return array<array{
     *    login: string,
     *    synced: bool
     * }> `synced` is true for memberships added by the group sync from an external directory (LDAP, SAML)
     */
    public function getMembersOfGroup(int $idGroup): array {
        Piwik::checkUserHasSuperUserAccess();

        $group = $this->getGroupOrFail($idGroup);

        return $this->model->getMembersOfGroup($group['idgroup']);
    }

    /**
     * Adds a user to a group. If the group sync added the user to the group, the membership becomes a manual one:
     * the sync no longer removes it.
     */
    public function addUserToGroup(int $idGroup, string $login): void {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $group = $this->getGroupOrFail($idGroup);
        $idGroup = $group['idgroup'];

        $login = $this->getUserLoginOrFail($login);

        $memberships = $this->model->getMembershipsOfUser($login);
        if (array_key_exists($idGroup, $memberships)) {
            if (!$memberships[$idGroup]) {
                throw new Exception(Piwik::translate('GroupPermissions_ExceptionUserAlreadyInGroup', $login));
            }

            // a membership added by the group sync becomes a manual one, which the sync never removes
            $this->model->setMembershipSynced($idGroup, $login, false);

            return;
        }

        $this->model->addUserToGroup($idGroup, $login);

        GroupAccessUpdater::reloadAccess();
    }

    /**
     * Invites a new user by email and directly adds them to the given groups.
     *
     * Matomo core requires an initial website when inviting a user. This method picks a website the
     * selected groups have access to (so the invitation email mentions a relevant site), invites the
     * user via UsersManager.inviteUser, then removes that direct website access again so the user's
     * permissions come only from the groups. If none of the groups has access to a website, any existing website
     * is used: the invitation email then names a website the user has no access to.
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
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $idGroups = $this->parseIdGroups($idGroups);
        if (!$idGroups) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionNoGroupSelected'));
        }

        foreach ($idGroups as $idGroup) {
            $this->getGroupOrFail($idGroup);
        }

        $initialIdSite = $this->getInitialIdSiteForGroups($idGroups);

        $usersManagerApi = UsersManagerAPI::getInstance();
        $userExisted = $this->model->getUserLogin($userLogin) !== null;

        try {
            $usersManagerApi->inviteUser($userLogin, $email, $initialIdSite, $expiryInDays, $passwordConfirmation);
        } catch (\Throwable $e) {
            // Matomo creates the user (with access to the initial website) before it sends the invitation email: if a
            // later step fails, e.g. sending the email, do not leave that user behind
            if (!$userExisted && $this->model->getUserLogin($userLogin) !== null) {
                $this->rollBackInvite($userLogin, $passwordConfirmation);
                GroupAccessUpdater::reloadAccess();
            }

            throw $e;
        }

        try {
            foreach ($idGroups as $idGroup) {
                $this->model->addUserToGroup($idGroup, $userLogin);
            }

            // permissions are granted through the groups only, remove the initial direct access again
            $usersManagerApi->setUserAccess($userLogin, 'noaccess', $initialIdSite);
        } catch (\Throwable $e) {
            // do not leave an invited user with direct website access or only some of the groups behind
            if (!$this->rollBackInvite($userLogin, $passwordConfirmation)) {
                throw $e;
            }

            // Matomo has already sent the invitation email, its link no longer works
            throw new Exception(
                Piwik::translate('GroupPermissions_ExceptionInviteCancelled', [$userLogin, $e->getMessage()]),
                0,
                $e
            );
        } finally {
            GroupAccessUpdater::reloadAccess();
        }
    }

    public function removeUserFromGroup(int $idGroup, string $login): void {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $group = $this->getGroupOrFail($idGroup);
        $idGroup = $group['idgroup'];

        // memberships are stored with the login of the user table (e.g. `bob` when `BOB` is given); memberships of
        // users deleted while this plugin was deactivated can still be removed
        $userLogin = $this->model->getUserLogin($login);
        $storedLogins = $this->model->getStoredLoginsOfMember($idGroup, $userLogin ?? $login);
        if (!$storedLogins) {
            if ($userLogin === null) {
                throw new Exception(Piwik::translate('UsersManager_ExceptionUserDoesNotExist', $login));
            }

            throw new Exception(Piwik::translate('GroupPermissions_ExceptionUserNotInGroup', $login));
        }

        SiteAccessLoss::notifyAfter([$userLogin ?? $login], function () use ($idGroup, $storedLogins): void {
            // with a binary collation, several spellings of one user could be stored
            foreach ($storedLogins as $storedLogin) {
                $this->model->removeUserFromGroup($idGroup, $storedLogin);
            }

            GroupAccessUpdater::reloadAccess();
        });
    }

    /**
     * Sets the role of a group, identified by its name, for websites.
     *
     * Prefer setGroupAccessById: names are compared case-insensitively, and installations created before group
     * names had to be unique may contain several groups with the same name (an exact match of the name wins).
     *
     * @param string $name
     * @param string $access Role ("view", "write", "admin") or "noaccess"
     * @param string $idSites Website ID, comma separated list of website IDs or "all"
     */
    public function setGroupAccess(string $name, string $access, string $idSites): void {
        Piwik::checkUserHasSomeAdminAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        // throws for groups that do not exist
        $group = $this->model->getGroupWithName($name);

        $this->updateGroupAccess($group['idgroup'], $access, $idSites);
    }

    /**
     * Sets the role of a group for websites.
     *
     * @param int $idGroup
     * @param string $access Role ("view", "write", "admin") or "noaccess"
     * @param string $idSites Website ID, comma separated list of website IDs or "all"
     */
    public function setGroupAccessById(int $idGroup, string $access, string $idSites): void {
        Piwik::checkUserHasSomeAdminAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $group = $this->getGroupOrFail($idGroup);

        $this->updateGroupAccess($group['idgroup'], $access, $idSites);
    }

    /**
     * @return array{
     *   idGroup: int,
     *   name: string
     * }
     */
    public function createGroup(string $groupName): array {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $groupName = $this->checkGroupName($groupName);

        $idGroup = $this->withGroupNameLock(function () use ($groupName): int {
            if ($this->isGroupNameTaken($groupName)) {
                throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesExist', $groupName));
            }

            return $this->model->createGroup($groupName);
        });

        return [
            'idGroup' => $idGroup,
            'name' => $groupName,
        ];
    }

    public function renameGroup(int $idGroup, string $newName): void {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $newName = $this->checkGroupName($newName);

        $group = $this->getGroupOrFail($idGroup);
        $idGroup = $group['idgroup'];

        $this->withGroupNameLock(function () use ($idGroup, $newName): void {
            // names are compared case-insensitively, changing only the case of the name is allowed
            if ($this->isGroupNameTaken($newName, $idGroup)) {
                throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesExist', $newName));
            }

            $this->model->renameGroup($idGroup, $newName);
        });
    }

    public function deleteGroup(int $idGroup): void {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $group = $this->getGroupOrFail($idGroup);
        $idGroup = $group['idgroup'];

        SiteAccessLoss::notifyAfter($this->getMemberLogins($idGroup), function () use ($idGroup): void {
            $this->deleteGroupData($idGroup);
        });
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
        GroupPermissions::dieIfGroupsAdminIsDisabled();

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
        GroupPermissions::dieIfGroupsAdminIsDisabled();

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
     * Returns the rules that give a group access to newly created websites.
     *
     * @return array<array{
     *   idRule: int,
     *   matchType: string,
     *   pattern: string,
     *   access: string,
     *   capabilities: array<string>
     * }>
     */
    public function getAutoAccessRules(int $idGroup): array {
        Piwik::checkUserHasSuperUserAccess();

        $group = $this->getGroupOrFail($idGroup);

        return array_map(static function (array $rule): array {
            return [
                'idRule' => $rule['idrule'],
                'matchType' => $rule['match_type'],
                'pattern' => $rule['pattern'],
                'access' => $rule['access'],
                'capabilities' => $rule['capabilities'],
            ];
        }, $this->model->getAutoAccessRulesOfGroup($group['idgroup']));
    }

    /**
     * Adds a rule that gives a group a role for every website created from now on that matches the rule.
     * Existing websites are not changed.
     *
     * @param int $idGroup
     * @param string $matchType "sitegroup" to match the Matomo website group of the new website, "url" to match
     *                          its URLs (main URL and alias URLs)
     * @param string $pattern Website group name or URL, case-insensitive, `*` matches any characters. URL patterns
     *                        without `/` are compared with the host only (e.g. `*.example.com`), others with host and
     *                        path (e.g. `example.com/shop*`). The port of the URLs is only compared for patterns
     *                        with a port (e.g. `example.com:8080`), URLs without a port have the default port
     *                        of their scheme (80 or 443). At most 255 characters as stored by Matomo, which counts
     *                        characters like `&` or `"` as their HTML entities (`&amp;`, `&quot;`)
     * @param string $access Role to give, e.g. "view", "write" or "admin"
     * @param string|array<string> $capabilities Optional capabilities to give in addition to the role (e.g.
     *                                           `tagmanager_write`), see "UsersManager.getAvailableCapabilities"
     *
     * @return int ID of the new rule
     */
    public function addAutoAccessRule(int $idGroup, string $matchType, string $pattern, string $access, $capabilities = []): int {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $group = $this->getGroupOrFail($idGroup);

        if (!in_array($matchType, Dao\GroupAutoAccess::MATCH_TYPES, true)) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionInvalidMatchType', [
                implode(', ', Dao\GroupAutoAccess::MATCH_TYPES),
                $matchType,
            ]));
        }

        $pattern = trim($pattern);
        if ($matchType === Dao\GroupAutoAccess::MATCH_URL) {
            $pattern = AutoAccess::normalizeUrlPattern($pattern);
        }
        if ($pattern === '') {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionEmptyPattern'));
        }
        // checked (and below compared with existing rules) on the sanitized value Matomo stores, like group names:
        // the column holds the sanitized value, and sanitizing is one-to-one, so comparing is the same as unsanitized
        if (mb_strlen($pattern) > Dao\GroupAutoAccess::PATTERN_MAX_LENGTH) {
            throw new Exception(Piwik::translate(
                'GroupPermissions_ExceptionPatternTooLong',
                [Dao\GroupAutoAccess::PATTERN_MAX_LENGTH]
            ));
        }

        $this->checkAccessType($access);

        $capabilities = ($capabilities === '' || $capabilities === []) ? [] : $this->parseCapabilities($capabilities);
        // capabilities the role already includes are not stored, like for addGroupCapabilities
        $capabilities = array_values(array_filter($capabilities, function (string $capabilityId) use ($access): bool {
            $capability = $this->capabilityProvider->getCapability($capabilityId);

            return !$capability || !$capability->hasRoleCapability($access);
        }));

        $idGroup = $group['idgroup'];

        // locked, so concurrent requests cannot both pass the duplicate check and add the same rule twice
        return $this->withLock('gpermissions_autoaccess_', Dao\GroupAutoAccess::TABLE, function () use ($idGroup, $matchType, $pattern, $access, $capabilities): int {
            foreach ($this->model->getAutoAccessRulesOfGroup($idGroup) as $rule) {
                if ($rule['match_type'] === $matchType && mb_strtolower($rule['pattern']) === mb_strtolower($pattern)) {
                    throw new Exception(Piwik::translate('GroupPermissions_ExceptionRuleDoesExist'));
                }
            }

            return $this->model->addAutoAccessRule($idGroup, $matchType, $pattern, $access, $capabilities);
        });
    }

    /**
     * Applies a rule to all existing websites (rules normally only apply to websites created after them): groups
     * get the role of the rule for every matching website unless they already have a higher one, plus the
     * capabilities of the rule.
     *
     * @return array<int> IDs of the matching websites
     */
    public function applyAutoAccessRule(int $idGroup, int $idRule): array {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $group = $this->getGroupOrFail($idGroup);

        $rule = $this->model->getAutoAccessRule($group['idgroup'], $idRule);
        if (!$rule) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionRuleDoesNotExist', $idRule));
        }

        $autoAccess = new AutoAccess($this->model, $this->capabilityProvider);

        return $autoAccess->applyToAllSites([$rule]);
    }

    /**
     * Removes a rule giving a group access to new websites. Access already given by the rule is kept.
     */
    public function removeAutoAccessRule(int $idGroup, int $idRule): void {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $group = $this->getGroupOrFail($idGroup);

        if (!$this->model->getAutoAccessRule($group['idgroup'], $idRule)) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionRuleDoesNotExist', $idRule));
        }

        $this->model->removeAutoAccessRule($group['idgroup'], $idRule);
    }

    /**
     * Returns the external directory groups (LDAP group DNs or names, SAML group attribute values, ...) mapped to
     * a group.
     *
     * @return array<string>
     */
    public function getExternalGroupMappings(int $idGroup): array {
        Piwik::checkUserHasSuperUserAccess();

        $group = $this->getGroupOrFail($idGroup);

        return $this->model->getExternalGroupMappingsOfGroup($group['idgroup']);
    }

    /**
     * Maps an external directory group to a group: when the groups of a user are synchronized (LDAP login with
     * the LDAP group sync enabled, the `GroupPermissions.syncUserGroups` event or API method), users in the
     * external group become members of the group. Users already in the external group are only added on their
     * next sync.
     *
     * @param int $idGroup
     * @param string $externalGroup Name or distinguished name of the external group, case-insensitive. A plain
     *                              name like `Matomo Admins` also matches DNs with this first value (e.g.
     *                              `CN=Matomo Admins,OU=Groups,DC=example,DC=com`), a DN only matches that DN
     */
    public function addExternalGroupMapping(int $idGroup, string $externalGroup): void {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $group = $this->getGroupOrFail($idGroup);

        // stored and compared like the directory returns it, e.g. `R&D` instead of the sanitized `R&amp;D`
        $externalGroup = trim(Common::unsanitizeInputValue($externalGroup));
        if ($externalGroup === '') {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionEmptyExternalGroup'));
        }
        if (mb_strlen($externalGroup) > Dao\GroupExternal::NAME_MAX_LENGTH) {
            throw new Exception(Piwik::translate(
                'GroupPermissions_ExceptionExternalGroupTooLong',
                [Dao\GroupExternal::NAME_MAX_LENGTH]
            ));
        }

        foreach ($this->model->getExternalGroupMappingsOfGroup($group['idgroup']) as $existing) {
            if (GroupSync::isSameMapping($existing, $externalGroup)) {
                throw new Exception(Piwik::translate('GroupPermissions_ExceptionExternalGroupDoesExist', $externalGroup));
            }
        }

        if (!$this->model->addExternalGroupMapping($group['idgroup'], $externalGroup)) {
            // the database considers it equal to an existing mapping, e.g. `Cafe` and `Café`
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionExternalGroupDoesExist', $externalGroup));
        }
    }

    /**
     * Removes the mapping of an external directory group from a group. Members added by the sync keep their
     * membership until their next sync.
     */
    public function removeExternalGroupMapping(int $idGroup, string $externalGroup): void {
        Piwik::checkUserHasSuperUserAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $group = $this->getGroupOrFail($idGroup);
        $externalGroup = Common::unsanitizeInputValue($externalGroup);

        $removed = false;
        foreach ($this->model->getExternalGroupMappingsOfGroup($group['idgroup']) as $existing) {
            if (GroupSync::isSameMapping($existing, $externalGroup)) {
                $this->model->removeExternalGroupMapping($group['idgroup'], $existing);
                $removed = true;
            }
        }

        if (!$removed) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionExternalGroupDoesNotExist', $externalGroup));
        }
    }

    /**
     * Synchronizes the group memberships of a user with their groups in an external directory, e.g. from a
     * provisioning script or an identity provider integration: the user becomes a member of every group mapped
     * to one of the external groups and is removed from groups an earlier sync added them to but that no longer
     * match. Memberships added manually are kept.
     *
     * @param string $userLogin
     * @param string|array<string> $externalGroups Names or DNs of the external groups of the user, as an array or
     *                                             one per line. Empty removes all memberships added by the sync
     *
     * @return array{added: array<string>, removed: array<string>} names of the groups the user was added to and
     *                                                              removed from
     */
    public function syncUserGroups(string $userLogin, $externalGroups = []): array {
        Piwik::checkUserHasSuperUserAccess();

        $userLogin = $this->getUserLoginOrFail($userLogin);

        if (is_string($externalGroups)) {
            $externalGroups = preg_split('/\r\n|\r|\n/', $externalGroups) ?: [];
        }
        if (!is_array($externalGroups)) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionInvalidExternalGroups'));
        }
        $externalGroups = array_map(static function ($externalGroup) {
            return is_string($externalGroup) ? Common::unsanitizeInputValue($externalGroup) : $externalGroup;
        }, $externalGroups);

        $result = (new GroupSync($this->model))->syncUser($userLogin, $externalGroups);

        $groupNames = [];
        foreach ($this->model->getAllGroups() as $group) {
            $groupNames[$group['idgroup']] = $group['name'];
        }
        $names = ['added' => [], 'removed' => []];
        foreach ($result as $key => $idGroups) {
            foreach ($idGroups as $idGroup) {
                $names[$key][] = $groupNames[$idGroup] ?? (string) $idGroup;
            }
        }

        return $names;
    }

    /**
     * Copies a dashboard of the current user to all members of a group.
     *
     * Like Dashboard.copyDashboardToUser, the dashboard is only copied to users the current user is allowed to
     * see (super users see everyone, admins see the users with access to their websites, including access through
     * groups). The current user, the anonymous user and members who already have a dashboard with the same name and
     * layout (e.g. from an earlier copy) are skipped.
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

        $group = $this->getGroupOrFail($idGroup);

        $currentLogin = Piwik::getCurrentUserLogin();

        $dashboard = StaticContainer::get(Dashboard::class);
        if (!($dashboard instanceof Dashboard)) {
            throw new Exception('Dashboard plugin could not be loaded.');
        }

        $layout = $dashboard->getLayoutForUser($currentLogin, $idDashboard);
        if ($layout === false) {
            throw new Exception('Dashboard not found');
        }

        $dashboardModel = StaticContainer::get(DashboardModel::class);
        if (!($dashboardModel instanceof DashboardModel)) {
            throw new Exception('Dashboard plugin could not be loaded.');
        }

        $copiedTo = [];
        foreach ($this->getMembersVisibleToCurrentUser($group['idgroup']) as $login) {
            // copying again (e.g. a double click, or after adding members) does not give members a second copy
            if ($this->hasDashboard($dashboardModel, $login, $dashboardName, $layout)) {
                continue;
            }

            $dashboardModel->createNewDashboardForUser($login, $dashboardName, $layout);
            $copiedTo[] = $login;
        }

        return $copiedTo;
    }

    /**
     * Shares a stored segment with a group.
     *
     * Members of the group see the segment in the segment selector (and in `SegmentEditor.getAll` /
     * `SegmentEditor.get`) as long as they have view access to the website the segment is restricted to.
     * Like segments shared with all users, only the creator and super users can edit or delete the segment.
     * Super users can share any segment with any group. Users with admin access to at least one website can share
     * their own segments with groups that have a role for the website of the segment, or, for segments available on
     * all websites, for a website they administer. The share only applies while the user who shared the segment
     * still meets these conditions (e.g. not after losing the admin access).
     */
    public function shareSegmentWithGroup(int $idSegment, int $idGroup): void {
        Piwik::checkUserHasSomeAdminAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $segment = $this->getSegmentOrFailForSharing($idSegment);
        $group = $this->getGroupOrFail($idGroup);

        if (!Piwik::hasUserSuperUserAccess() && !$this->canShareSegmentWithGroup($segment['idsite'], $group['idgroup'])) {
            throw new Exception(Piwik::translate(
                'GroupPermissions_ExceptionSegmentGroupWithoutAccess',
                [Common::unsanitizeInputValue($group['name'])]
            ));
        }

        $this->model->shareSegment($group['idgroup'], $segment['idsegment'], Piwik::getCurrentUserLogin());
    }

    /**
     * Stops sharing a stored segment with a group. Same permissions as `shareSegmentWithGroup`, except that
     * segments can be unshared from any group.
     */
    public function unshareSegmentFromGroup(int $idSegment, int $idGroup): void {
        Piwik::checkUserHasSomeAdminAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $segment = $this->getSegmentOrFailForSharing($idSegment);
        $group = $this->getGroupOrFail($idGroup);

        $this->model->unshareSegment($group['idgroup'], $segment['idsegment']);
    }

    /**
     * Returns the groups a stored segment is shared with, sorted by name. Same permissions as
     * `shareSegmentWithGroup`.
     *
     * @return array<array{
     *   idGroup: int,
     *   name: string
     * }>
     */
    public function getGroupsOfSegment(int $idSegment): array {
        Piwik::checkUserHasSomeAdminAccess();

        $segment = $this->getSegmentOrFailForSharing($idSegment);
        $idGroups = array_flip($this->model->getGroupsOfSegment($segment['idsegment']));

        $groups = [];
        foreach ($this->model->getAllGroups() as $group) {
            if (isset($idGroups[$group['idgroup']])) {
                $groups[] = ['idGroup' => $group['idgroup'], 'name' => $group['name']];
            }
        }

        usort($groups, static function (array $a, array $b): int {
            return strcasecmp($a['name'], $b['name']);
        });

        return $groups;
    }

    /**
     * Returns all stored segments sorted by name, with whether they are shared with the group.
     * `idSite` is 0 for segments available on all websites.
     *
     * @return array<array{
     *   idSegment: int,
     *   name: string,
     *   definition: string,
     *   login: string,
     *   idSite: int,
     *   siteName: string,
     *   enabledAllUsers: bool,
     *   isShared: bool
     * }>
     */
    public function getSegmentsForGroup(int $idGroup): array {
        Piwik::checkUserHasSuperUserAccess();

        $group = $this->getGroupOrFail($idGroup);

        if (!SegmentSharing::isSegmentEditorActivated()) {
            return [];
        }

        $shared = array_flip($this->model->getSegmentsOfGroup($group['idgroup']));
        $siteNames = [];

        $segments = (new SegmentEditorModel())->getAllSegmentsForAllUsers();
        if (!is_array($segments)) {
            return [];
        }

        $result = [];
        foreach ($segments as $segment) {
            if (!is_array($segment) || !is_numeric($segment['idsegment'] ?? null)) {
                continue;
            }

            $idSegment = (int) $segment['idsegment'];
            $idSite = is_numeric($segment['enable_only_idsite'] ?? null) ? (int) $segment['enable_only_idsite'] : 0;

            if ($idSite && !isset($siteNames[$idSite])) {
                try {
                    $siteNames[$idSite] = Site::getNameFor($idSite);
                } catch (Exception $e) {
                    // segment of a deleted website
                    $siteNames[$idSite] = (string) $idSite;
                }
            }

            $result[] = [
                'idSegment' => $idSegment,
                'name' => is_string($segment['name'] ?? null) ? $segment['name'] : '',
                'definition' => is_string($segment['definition'] ?? null) ? $segment['definition'] : '',
                'login' => is_string($segment['login'] ?? null) ? $segment['login'] : '',
                'idSite' => $idSite,
                'siteName' => $idSite ? $siteNames[$idSite] : '',
                'enabledAllUsers' => !empty($segment['enable_all_users']),
                'isShared' => isset($shared[$idSegment]),
            ];
        }

        usort($result, static function (array $a, array $b): int {
            return strcasecmp($a['name'], $b['name']) ?: $a['idSegment'] <=> $b['idSegment'];
        });

        return $result;
    }

    /**
     * Copies a scheduled email report to the members of a group: every member gets an independent copy of their
     * own, which they manage like any other report. The copies are sent to their member only ("Send report to
     * me"), the additional recipients of the original are not copied.
     *
     * Like copyDashboardToGroup, the report is only copied to members the current user is allowed to see. Members
     * without view access to the website of the report, invited users that did not accept yet, the owner of the
     * report, members who already have an identical copy (e.g. from an earlier copy), the current user and the anonymous
     * user are skipped. Super users can copy any email report, users with admin access to at least one website their
     * own reports. Reports using a segment must use one shared with all users (Matomo does not
     * let members use private segments of other users).
     *
     * @return array<string> Logins of the users the report was copied to
     */
    public function copyReportToGroup(int $idReport, int $idGroup): array {
        Piwik::checkUserHasSomeAdminAccess();

        $reportCopy = new ReportCopy();
        $report = $reportCopy->getReportOrFail($idReport);
        $group = $this->getGroupOrFail($idGroup);

        // the owner of the report already has it (e.g. when a super user copies the report of a member)
        $owner = Dao\Rows::string($report, 'login');
        $members = array_values(array_filter(
            $this->getMembersVisibleToCurrentUser($group['idgroup']),
            static function (string $login) use ($owner): bool {
                return $login !== $owner;
            }
        ));

        $logins = $reportCopy->filterReceivers($members, Dao\Rows::int($report, 'idsite'));

        return $reportCopy->copyToUsers($report, $logins);
    }

    /**
     * Returns the scheduled email reports the current user can copy to a group, sorted by description: super users
     * get the reports of all users, other users their own. `idSegment` is 0 for reports without segment. Reports using
     * a segment that is not shared with all users cannot be copied and are left out.
     *
     * @return array<array{
     *   idReport: int,
     *   description: string,
     *   login: string,
     *   idSite: int,
     *   siteName: string,
     *   period: string,
     *   idSegment: int
     * }>
     */
    public function getCopyableReports(): array {
        Piwik::checkUserHasSomeAdminAccess();

        return (new ReportCopy())->getCopyableReports();
    }

    /**
     * Whether the user already has a dashboard with this name and layout
     *
     * @param mixed $layout
     */
    private function hasDashboard(DashboardModel $dashboardModel, string $login, string $name, $layout): bool {
        if (!is_string($layout)) {
            return false;
        }

        $dashboards = $dashboardModel->getAllDashboardsForUser($login);
        foreach (is_array($dashboards) ? $dashboards : [] as $dashboard) {
            if (
                is_array($dashboard)
                && ($dashboard['name'] ?? '') === $name
                && ($dashboard['layout'] ?? null) === $layout
            ) {
                return true;
            }
        }

        return false;
    }

    private function deleteGroupData(int $idGroup): void {
        // all or nothing, so a failure never leaves a group with only part of its data behind
        // (the API always uses Matomo's Zend based adapter, the tracker one is only used while tracking)
        $db = Db::get();
        $db = $db instanceof \Zend_Db_Adapter_Abstract ? $db : null;
        if ($db) {
            $db->beginTransaction();
        }

        try {
            $this->model->removeAllAutoAccessRulesOfGroup($idGroup);
            $this->model->removeAllExternalGroupMappingsOfGroup($idGroup);
            $this->model->removeAllSegmentSharesOfGroup($idGroup);
            $this->model->removeAllCapabilitiesOfGroup($idGroup);
            $this->model->removeAllPermissionsOfGroup($idGroup);
            $this->model->removeAllUsersOfGroup($idGroup);

            $this->model->deleteGroup($idGroup);

            if ($db) {
                $db->commit();
            }
        } catch (\Throwable $e) {
            if ($db) {
                $db->rollBack();
            }

            throw $e;
        }

        GroupAccessUpdater::reloadAccess();
    }

    /**
     * Removes a user invited by inviteUserToGroups again after a later step failed.
     *
     * @return bool whether the user was removed
     */
    private function rollBackInvite(
        string $userLogin,
        #[\SensitiveParameter]
        ?string $passwordConfirmation
    ): bool {
        try {
            $this->model->removeUserFromAllGroups($userLogin);
            UsersManagerAPI::getInstance()->deleteUser($userLogin, $passwordConfirmation);

            return true;
        } catch (\Throwable $e) {
            $logger = StaticContainer::get(LoggerInterface::class);
            if ($logger instanceof LoggerInterface) {
                $logger->warning(
                    'GroupPermissions: could not remove the invited user {login} after the invitation failed: {message}',
                    ['login' => $userLogin, 'message' => $e->getMessage()]
                );
            }

            return false;
        }
    }

    private function updateGroupAccess(int $idGroup, string $access, string $idSites): void {
        if ($access !== 'noaccess') {
            $this->checkAccessType($access);
        }

        $idSites = $this->getIdSitesCheckAdminAccess($idSites);

        $updater = new GroupAccessUpdater($this->model, $this->capabilityProvider);

        if ($access !== 'noaccess') {
            // members keep at least view access to the websites
            $updater->setAccess($idGroup, $idSites, $access);

            return;
        }

        SiteAccessLoss::notifyAfter($this->getMemberLogins($idGroup), static function () use ($updater, $idGroup, $idSites): void {
            $updater->setAccess($idGroup, $idSites, 'noaccess');
        });
    }

    /**
     * @return array<string>
     */
    private function getMemberLogins(int $idGroup): array {
        return array_column($this->model->getMembersOfGroup($idGroup), 'login');
    }

    /**
     * Logins of the members of a group the current user is allowed to see, like Dashboard.copyDashboardToUser:
     * super users see everyone, admins see the users with access to their websites, including access through
     * groups. The current user and the anonymous user are left out.
     *
     * @return array<string>
     */
    private function getMembersVisibleToCurrentUser(int $idGroup): array {
        $currentLogin = Piwik::getCurrentUserLogin();

        // UsersManager.getUsers only returns users the current user is allowed to manage. Called with an empty
        // default request: otherwise the parameters of the current request (e.g. `filter_offset` or
        // `filter_pattern`) would also filter the users and silently skip members.
        $visibleLogins = [];
        $users = Request::processRequest('UsersManager.getUsers', ['filter_limit' => -1], []);
        if (is_array($users)) {
            foreach ($users as $user) {
                if (is_array($user) && isset($user['login']) && is_string($user['login'])) {
                    $visibleLogins[$user['login']] = true;
                }
            }
        }

        // websites the current user administers, to also find users who only have access through groups (super
        // users already see everyone)
        $adminIdSites = null;
        if (!Piwik::hasUserSuperUserAccess()) {
            $adminIdSites = [];
            foreach (Access::getInstance()->getSitesIdWithAdminAccess() as $idSite) {
                if (is_numeric($idSite)) {
                    $adminIdSites[(int) $idSite] = true;
                }
            }
        }

        $members = [];
        $hidden = [];
        foreach ($this->model->getMembersOfGroup($idGroup) as $member) {
            $login = $member['login'];

            if ($login === $currentLogin || $login === 'anonymous') {
                continue;
            }

            $members[] = $login;
            if (!isset($visibleLogins[$login])) {
                $hidden[] = $login;
            }
        }

        $visibleThroughGroups = array_flip($this->getLoginsVisibleThroughGroups($hidden, $adminIdSites, $currentLogin));

        return array_values(array_filter($members, static function (string $login) use ($visibleLogins, $visibleThroughGroups): bool {
            return isset($visibleLogins[$login]) || isset($visibleThroughGroups[$login]);
        }));
    }

    /**
     * The users that Matomo's user list hides from the current (non super) user but that may be seen anyway, because
     * a group gives them a role for a website the current user administers. Matomo only considers its own access
     * table there. Like Matomo, pending invitations are only visible to the user who sent them. Looked up in a few
     * queries for all users.
     *
     * @param array<string> $logins logins as stored in Matomo's user table
     * @param array<int, true>|null $adminIdSites ids of the websites the current user administers as keys, null for
     *                                           super users
     *
     * @return array<string>
     */
    private function getLoginsVisibleThroughGroups(array $logins, ?array $adminIdSites, string $currentLogin): array {
        if (!$logins || !$adminIdSites) {
            return [];
        }

        $candidates = [];
        $users = (new UsersModel())->getUsers($logins);
        foreach (is_array($users) ? $users : [] as $user) {
            if (!is_array($user) || !is_string($user['login'] ?? null)) {
                continue;
            }
            if (!empty($user['invite_token']) && ($user['invited_by'] ?? null) !== $currentLogin) {
                continue;
            }
            $candidates[] = $user['login'];
        }
        if (!$candidates) {
            return []; // deleted or invited by someone else
        }

        // only the access through groups is missing from Matomo's user list
        $visible = [];
        foreach ($this->model->getIdSitesWithRoleOfUsers($candidates, []) as $login => $idSites) {
            foreach ($idSites as $idSite) {
                if (isset($adminIdSites[$idSite])) {
                    $visible[] = (string) $login;

                    break;
                }
            }
        }

        return $visible;
    }

    /**
     * Returns a stored segment the current user may share: super users any segment, other users their own.
     *
     * @return array{
     *   idsegment: int,
     *   login: string,
     *   idsite: int
     * } `idsite` is 0 for segments available on all websites
     */
    private function getSegmentOrFailForSharing(int $idSegment): array {
        if (!SegmentSharing::isSegmentEditorActivated()) {
            throw new Exception('The SegmentEditor plugin is not activated.');
        }

        $segment = SegmentSharing::getStoredSegment($idSegment);
        $login = is_string($segment['login'] ?? null) ? $segment['login'] : '';

        // same error for segments that do not exist and segments of other users, to not reveal segment ids
        if ($segment === null || (!Piwik::hasUserSuperUserAccess() && $login !== Piwik::getCurrentUserLogin())) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionSegmentNotFound', $idSegment));
        }

        return [
            'idsegment' => $idSegment,
            'login' => $login,
            'idsite' => is_numeric($segment['enable_only_idsite'] ?? null) ? (int) $segment['enable_only_idsite'] : 0,
        ];
    }

    /**
     * Whether the current user (without super user access) may share a segment with a group, see
     * SegmentSharing::isSharingAllowed
     */
    private function canShareSegmentWithGroup(int $idSite, int $idGroup): bool {
        $adminIdSites = array_map('intval', array_filter(
            Access::getInstance()->getSitesIdWithAdminAccess(),
            'is_numeric'
        ));

        return SegmentSharing::isSharingAllowed(
            $idSite,
            array_column($this->model->getPermissionsOfGroup($idGroup), 'idsite'),
            array_values($adminIdSites)
        );
    }

    /**
     * The login of an existing user other than anonymous, as stored in Matomo's user table (see Model::getUserLogin)
     */
    private function getUserLoginOrFail(string $login): string {
        $userLogin = $this->model->getUserLogin($login);
        if ($userLogin === null) {
            throw new Exception(Piwik::translate('UsersManager_ExceptionUserDoesNotExist', $login));
        }
        if (strcasecmp($userLogin, 'anonymous') === 0) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionAnonymousNotAllowed'));
        }

        return $userLogin;
    }

    /**
     * @return array{
     *   idgroup: int,
     *   name: string
     * }
     */
    private function getGroupOrFail(int $idGroup): array {
        // throws for groups that do not exist
        return $this->model->getGroupWithId($idGroup);
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
     * Whether another group already has the name (case-insensitive, like Dao\Group::getGroupWithName)
     */
    private function isGroupNameTaken(string $name, ?int $exceptIdGroup = null): bool {
        $folded = mb_strtolower($name);
        foreach ($this->model->getAllGroups() as $group) {
            if ($group['idgroup'] !== $exceptIdGroup && mb_strtolower($group['name']) === $folded) {
                return true;
            }
        }

        return false;
    }

    /**
     * Runs the callback while holding a lock for group names, so concurrent requests cannot create two groups with
     * the same name (the name column has no unique index, installations may already contain duplicates).
     *
     * @template T
     *
     * @param callable(): T $callback
     *
     * @return T
     */
    private function withGroupNameLock(callable $callback) {
        return $this->withLock('gpermissions_group_name_', Dao\Group::TABLE, $callback);
    }

    /**
     * Runs the callback while holding a named database lock.
     *
     * @template T
     *
     * @param string $prefix name of the lock
     * @param string $table unprefixed table the lock protects: the lock is per Matomo installation, several may share
     *                      a database server
     * @param callable(): T $callback
     *
     * @return T
     */
    private function withLock(string $prefix, string $table, callable $callback) {
        $lockName = $prefix . md5(Common::prefixTable($table));
        if (!Db::getDbLock($lockName)) {
            throw new Exception('Could not acquire a database lock, please try again.');
        }

        try {
            return $callback();
        } finally {
            Db::releaseDbLock($lockName);
        }
    }

    /**
     * Returns the name without surrounding whitespace. Group names are stored in a VARCHAR column, longer names
     * would be truncated silently.
     * Note: the length is checked on the sanitized value Matomo stores (e.g. `"` is stored as `&quot;`).
     */
    private function checkGroupName(string $name): string {
        $name = trim($name);
        if ($name === '') {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionEmptyGroupName'));
        }
        if (mb_strlen($name) > Dao\Group::NAME_MAX_LENGTH) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupNameTooLong', [Dao\Group::NAME_MAX_LENGTH]));
        }

        return $name;
    }

    private function checkAccessType(string $access): void {
        $roles = $this->roleProvider->getAllRoleIds();

        if (!in_array($access, $roles, true)) {
            throw new Exception(Piwik::translate('UsersManager_ExceptionAccessValues', [implode(', ', $roles), $access]));
        }
    }
}
