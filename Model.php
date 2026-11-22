<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Plugins\GroupPermissions\Dao\Group;
use Piwik\Plugins\GroupPermissions\Dao\GroupAutoAccess;
use Piwik\Plugins\GroupPermissions\Dao\GroupCapability;
use Piwik\Plugins\GroupPermissions\Dao\GroupExternal;
use Piwik\Plugins\GroupPermissions\Dao\GroupPermission;
use Piwik\Plugins\GroupPermissions\Dao\GroupSegment;
use Piwik\Plugins\GroupPermissions\Dao\GroupUser;
use Piwik\Plugins\GroupPermissions\Dao\MultiTable;
use Piwik\Plugins\UsersManager\Model as UsersModel;

class Model {
    public function install(): void {
        $group = new Group();
        $group->install();

        $permission = new GroupPermission();
        $permission->install();

        $user = new GroupUser();
        $user->install();

        $capability = new GroupCapability();
        $capability->install();

        $autoAccess = new GroupAutoAccess();
        $autoAccess->install();

        $segment = new GroupSegment();
        $segment->install();

        $external = new GroupExternal();
        $external->install();
    }

    public function uninstall(): void {
        $group = new Group();
        $group->uninstall();

        $permission = new GroupPermission();
        $permission->uninstall();

        $user = new GroupUser();
        $user->uninstall();

        $capability = new GroupCapability();
        $capability->uninstall();

        $autoAccess = new GroupAutoAccess();
        $autoAccess->uninstall();

        $segment = new GroupSegment();
        $segment->uninstall();

        $external = new GroupExternal();
        $external->uninstall();
    }

    // Group
    public function createGroup(string $name): int {
        $group = new Group();

        return $group->createGroup($name);
    }

    /**
     * @return array<array{
     *   idgroup: int,
     *   name: string
     * }>
     */
    public function getAllGroups(): array {
        $group = new Group();

        return $group->getAllGroups();
    }

    /**
     * @return array{
     *   idgroup: int,
     *   name: string
     * }
     */
    public function getGroupWithId(int $idGroup): array {
        $group = new Group();

        return $group->getGroupWithId($idGroup);
    }

    /**
     * @return array{
     *   idgroup: int,
     *   name: string
     * }
     */
    public function getGroupWithName(string $name): array {
        $group = new Group();

        return $group->getGroupWithName($name);
    }

    public function renameGroup(int $idGroup, string $newName): void {
        $group = new Group();
        $group->renameGroup($idGroup, $newName);
    }

    public function deleteGroup(int $idGroup): void {
        $group = new Group();
        $group->deleteGroup($idGroup);
    }

    // GroupUser
    /**
     * The login of a user as stored in Matomo's user table, null if no user has the login. Matomo compares logins
     * with the collation of that table (e.g. case-insensitively), so `BOB` finds the user `bob`. Memberships are
     * stored with this login.
     */
    public function getUserLogin(string $login): ?string {
        if ($login === '') {
            return null;
        }

        $user = (new UsersModel())->getUser($login);

        return is_string($user['login'] ?? null) && $user['login'] !== '' ? $user['login'] : null;
    }

    public function addUserToGroup(int $idGroup, string $login, bool $synced = false): void {
        $user = new GroupUser();
        $user->addUserToGroup($idGroup, $login, $synced);
    }

    public function setMembershipSynced(int $idGroup, string $login, bool $synced): void {
        $user = new GroupUser();
        $user->setMembershipSynced($idGroup, $login, $synced);
    }

    /**
     * @return array<int, bool> whether the membership was added by the group sync, by group id
     */
    public function getMembershipsOfUser(string $login): array {
        $user = new GroupUser();

        return $user->getMembershipsOfUser($login);
    }

    /**
     * @return array<array{
     *    login: string,
     *    synced: bool
     * }>
     */
    public function getMembersOfGroup(int $idGroup): array {
        $user = new GroupUser();

        return $user->getMembersOfGroup($idGroup);
    }

    /**
     * @return array<int, int>
     */
    public function countMembersPerGroup(): array {
        $user = new GroupUser();

        return $user->countMembersPerGroup();
    }

    /**
     * @return array<int, int>
     */
    public function countSitesPerGroup(): array {
        $permission = new GroupPermission();

        return $permission->countSitesPerGroup();
    }

    /**
     * @return array<array{
     *    idgroup: int
     * }>
     */
    public function getGroupsOfUser(string $login): array {
        $user = new GroupUser();

        return $user->getGroupsOfUser($login);
    }

    /**
     * @param string $login the login as stored in Matomo's user table, or the given login for deleted users
     *
     * @return array<string> the logins stored for the memberships of the user in the group
     */
    public function getStoredLoginsOfMember(int $idGroup, string $login): array {
        $user = new GroupUser();

        return $user->getStoredLoginsOfMember($idGroup, $login);
    }

    public function removeUserFromGroup(int $idGroup, string $login): void {
        $user = new GroupUser();
        $user->removeUserFromGroup($idGroup, $login);
    }

    public function removeAllUsersOfGroup(int $idGroup): void {
        $user = new GroupUser();
        $user->removeAllUsersOfGroup($idGroup);
    }

    public function removeUserFromAllGroups(string $login): void {
        $user = new GroupUser();
        $user->removeUserFromAllGroups($login);
    }

    /**
     * @see GroupUser::removeMembershipsOfDeletedUser
     */
    public function removeMembershipsOfDeletedUser(string $login): void {
        $user = new GroupUser();
        $user->removeMembershipsOfDeletedUser($login);
    }

    /**
     * @see GroupUser::removeMembershipsOfMissingUsers
     */
    public function removeMembershipsOfMissingUsers(): void {
        $user = new GroupUser();
        $user->removeMembershipsOfMissingUsers();
    }

    // GroupPermission
    public function createPermission(int $idGroup, int $idSite, string $access): void {
        $permission = new GroupPermission();
        $permission->createPermission($idGroup, $idSite, $access);
    }

    /**
     * @return array<array{
     *  idsite: int,
     *  access: string
     * }>
     */
    public function getPermissionsOfGroup(int $idGroup): array {
        $permission = new GroupPermission();

        return $permission->getPermissionsOfGroup($idGroup);
    }

    /**
     * @return array<array{
     *  idsite: int,
     *  name: string,
     *  access: string
     * }>
     */
    public function getPermissionsWithSiteNamesOfGroup(int $idGroup): array {
        $permission = new GroupPermission();

        return $permission->getPermissionsWithSiteNamesOfGroup($idGroup);
    }

    /**
     * @return array<array{
     *   idgroup: int,
     *   access: string
     * }>
     */
    public function getPermissionsOfSite(int $idSite): array {
        $permission = new GroupPermission();

        return $permission->getPermissionsOfSite($idSite);
    }

    public function removePermission(int $idGroup, int $idSite): void {
        $permission = new GroupPermission();
        $permission->removePermission($idGroup, $idSite);
    }

    public function removeAllPermissionsOfGroup(int $idGroup): void {
        $permission = new GroupPermission();
        $permission->removeAllPermissionsOfGroup($idGroup);
    }

    public function removeAllPermissionsForSite(int $idSite): void {
        $permission = new GroupPermission();
        $permission->removeAllPermissionsForSite($idSite);
    }

    // GroupCapability
    public function addCapability(int $idGroup, int $idSite, string $capability): void {
        $groupCapability = new GroupCapability();
        $groupCapability->addCapability($idGroup, $idSite, $capability);
    }

    public function removeCapability(int $idGroup, int $idSite, string $capability): void {
        $groupCapability = new GroupCapability();
        $groupCapability->removeCapability($idGroup, $idSite, $capability);
    }

    /**
     * @return array<int, array<string>> capabilities by website id
     */
    public function getCapabilitiesOfGroup(int $idGroup): array {
        $groupCapability = new GroupCapability();

        return $groupCapability->getCapabilitiesOfGroup($idGroup);
    }

    /**
     * @return array<int, array<string>> capabilities by group id
     */
    public function getCapabilitiesOfSite(int $idSite): array {
        $groupCapability = new GroupCapability();

        return $groupCapability->getCapabilitiesOfSite($idSite);
    }

    public function removeAllCapabilitiesOfGroupForSite(int $idGroup, int $idSite): void {
        $groupCapability = new GroupCapability();
        $groupCapability->removeAllCapabilitiesOfGroupForSite($idGroup, $idSite);
    }

    public function removeAllCapabilitiesOfGroup(int $idGroup): void {
        $groupCapability = new GroupCapability();
        $groupCapability->removeAllCapabilitiesOfGroup($idGroup);
    }

    public function removeAllCapabilitiesForSite(int $idSite): void {
        $groupCapability = new GroupCapability();
        $groupCapability->removeAllCapabilitiesForSite($idSite);
    }

    // GroupAutoAccess
    /**
     * @param array<string> $capabilities
     */
    public function addAutoAccessRule(int $idGroup, string $matchType, string $pattern, string $access, array $capabilities): int {
        $autoAccess = new GroupAutoAccess();

        return $autoAccess->addRule($idGroup, $matchType, $pattern, $access, $capabilities);
    }

    /**
     * @return array{
     *   idrule: int,
     *   idgroup: int,
     *   match_type: string,
     *   pattern: string,
     *   access: string,
     *   capabilities: array<string>
     * }|null
     */
    public function getAutoAccessRule(int $idGroup, int $idRule): ?array {
        $autoAccess = new GroupAutoAccess();

        return $autoAccess->getRule($idGroup, $idRule);
    }

    /**
     * @return array<array{
     *   idrule: int,
     *   idgroup: int,
     *   match_type: string,
     *   pattern: string,
     *   access: string,
     *   capabilities: array<string>
     * }>
     */
    public function getAutoAccessRulesOfGroup(int $idGroup): array {
        $autoAccess = new GroupAutoAccess();

        return $autoAccess->getRulesOfGroup($idGroup);
    }

    /**
     * @return array<array{
     *   idrule: int,
     *   idgroup: int,
     *   match_type: string,
     *   pattern: string,
     *   access: string,
     *   capabilities: array<string>
     * }>
     */
    public function getAllAutoAccessRules(): array {
        $autoAccess = new GroupAutoAccess();

        return $autoAccess->getAllRules();
    }

    public function removeAutoAccessRule(int $idGroup, int $idRule): void {
        $autoAccess = new GroupAutoAccess();
        $autoAccess->removeRule($idGroup, $idRule);
    }

    public function removeAllAutoAccessRulesOfGroup(int $idGroup): void {
        $autoAccess = new GroupAutoAccess();
        $autoAccess->removeAllRulesOfGroup($idGroup);
    }

    // GroupSegment
    public function shareSegment(int $idGroup, int $idSegment, string $sharedBy): void {
        $groupSegment = new GroupSegment();
        $groupSegment->shareSegment($idGroup, $idSegment, $sharedBy);
    }

    public function unshareSegment(int $idGroup, int $idSegment): void {
        $groupSegment = new GroupSegment();
        $groupSegment->unshareSegment($idGroup, $idSegment);
    }

    /**
     * @return array<int> segment ids
     */
    public function getSegmentsOfGroup(int $idGroup): array {
        $groupSegment = new GroupSegment();

        return $groupSegment->getSegmentsOfGroup($idGroup);
    }

    /**
     * @return array<int> group ids
     */
    public function getGroupsOfSegment(int $idSegment): array {
        $groupSegment = new GroupSegment();

        return $groupSegment->getGroupsOfSegment($idSegment);
    }

    /**
     * @return array<array{
     *   idsegment: int,
     *   idgroup: int,
     *   shared_by: string
     * }>
     */
    public function getSegmentSharesForUser(string $login): array {
        $groupSegment = new GroupSegment();

        return $groupSegment->getSharesForUser($login);
    }

    public function removeAllSegmentSharesOfGroup(int $idGroup): void {
        $groupSegment = new GroupSegment();
        $groupSegment->removeAllSharesOfGroup($idGroup);
    }

    public function removeAllSharesOfSegment(int $idSegment): void {
        $groupSegment = new GroupSegment();
        $groupSegment->removeAllSharesOfSegment($idSegment);
    }

    public function removeAllSegmentSharesByUser(string $login): void {
        $groupSegment = new GroupSegment();
        $groupSegment->removeAllSharesByUser($login);
    }

    /**
     * @see GroupSegment::removeAllSharesByDeletedUser
     */
    public function removeAllSegmentSharesByDeletedUser(string $login): void {
        $groupSegment = new GroupSegment();
        $groupSegment->removeAllSharesByDeletedUser($login);
    }

    /**
     * @see GroupSegment::removeAllSharesByMissingUsers
     */
    public function removeAllSegmentSharesByMissingUsers(): void {
        $groupSegment = new GroupSegment();
        $groupSegment->removeAllSharesByMissingUsers();
    }

    // GroupExternal
    /**
     * @return bool false if the database considers the name equal to an existing mapping of the group
     */
    public function addExternalGroupMapping(int $idGroup, string $externalGroup): bool {
        $external = new GroupExternal();

        return $external->addMapping($idGroup, $externalGroup);
    }

    public function removeExternalGroupMapping(int $idGroup, string $externalGroup): void {
        $external = new GroupExternal();
        $external->removeMapping($idGroup, $externalGroup);
    }

    /**
     * @return array<string>
     */
    public function getExternalGroupMappingsOfGroup(int $idGroup): array {
        $external = new GroupExternal();

        return $external->getMappingsOfGroup($idGroup);
    }

    /**
     * @return array<array{
     *   idgroup: int,
     *   external_group: string
     * }>
     */
    public function getAllExternalGroupMappings(): array {
        $external = new GroupExternal();

        return $external->getAllMappings();
    }

    public function removeAllExternalGroupMappingsOfGroup(int $idGroup): void {
        $external = new GroupExternal();
        $external->removeAllMappingsOfGroup($idGroup);
    }

    // MultiTable
    /**
     * @return array<array{
     *   idsite: int,
     *   access: string
     * }>
     */
    public function getPermissionsOfUser(string $login): array {
        $multiTable = new MultiTable();

        return $multiTable->getPermissionsOfUser($login);
    }

    /**
     * @param array<string> $logins
     * @param array<string> $roles the roles of Matomo's access table to consider
     *
     * @return array<string, array<int>> ids of the websites each user has a role for, directly or through groups
     */
    public function getIdSitesWithRoleOfUsers(array $logins, array $roles): array {
        $multiTable = new MultiTable();

        return $multiTable->getIdSitesWithRoleOfUsers($logins, $roles);
    }

    /**
     * @param array<string> $roles
     *
     * @return array<string> logins of the members of groups with one of the roles for the website
     */
    public function getLoginsWithRoleForSite(int $idSite, array $roles): array {
        $multiTable = new MultiTable();

        return $multiTable->getLoginsWithRoleForSite($idSite, $roles);
    }

    /**
     * @return array<array{
     *   idsite: int,
     *   capability: string
     * }>
     */
    public function getCapabilitiesOfUser(string $login): array {
        $multiTable = new MultiTable();

        return $multiTable->getCapabilitiesOfUser($login);
    }
}
