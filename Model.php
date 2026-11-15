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
use Piwik\Plugins\GroupPermissions\Dao\GroupPermission;
use Piwik\Plugins\GroupPermissions\Dao\GroupSegment;
use Piwik\Plugins\GroupPermissions\Dao\GroupUser;
use Piwik\Plugins\GroupPermissions\Dao\MultiTable;

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
    public function addUserToGroup(int $idGroup, string $login): void {
        $user = new GroupUser();
        $user->addUserToGroup($idGroup, $login);
    }

    /**
     * @return array<array{
     *    login: string
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

    public function isUserInGroup(string $login, int $idGroup): bool {
        $user = new GroupUser();

        return $user->isUserInGroup($login, $idGroup);
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
    public function shareSegment(int $idGroup, int $idSegment): void {
        $groupSegment = new GroupSegment();
        $groupSegment->shareSegment($idGroup, $idSegment);
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
     * @return array<int> segment ids
     */
    public function getSegmentsSharedWithUser(string $login): array {
        $groupSegment = new GroupSegment();

        return $groupSegment->getSegmentsSharedWithUser($login);
    }

    public function removeAllSegmentSharesOfGroup(int $idGroup): void {
        $groupSegment = new GroupSegment();
        $groupSegment->removeAllSharesOfGroup($idGroup);
    }

    public function removeAllSharesOfSegment(int $idSegment): void {
        $groupSegment = new GroupSegment();
        $groupSegment->removeAllSharesOfSegment($idSegment);
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
