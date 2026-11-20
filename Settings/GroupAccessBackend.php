<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions\Settings;

use Piwik\Access\CapabilitiesProvider;
use Piwik\Common;
use Piwik\Container\StaticContainer;
use Piwik\Plugins\GroupPermissions\Access;
use Piwik\Plugins\GroupPermissions\GroupAccessUpdater;
use Piwik\Plugins\GroupPermissions\Model;
use Piwik\Plugins\GroupPermissions\SiteAccessLoss;
use Piwik\Settings\Storage\Backend\BackendInterface;

/**
 * Storage of the "Group access" field in the website create/edit form: instead of storing a value in the site
 * settings table, it reads and writes the roles of the groups for the website. So the field always shows the
 * current roles, and there is no second copy of the permissions that could get out of sync.
 *
 * The value is a list of rows `['group' => idGroup, 'role' => role]`. Groups without a row have no access.
 */
class GroupAccessBackend implements BackendInterface {
    public const SETTING_NAME = 'group_access';

    /** @var int */
    private $idSite;

    public function __construct(int $idSite) {
        $this->idSite = $idSite;
    }

    public function getStorageId() {
        return 'GroupPermissions_GroupAccess_' . $this->idSite;
    }

    /**
     * @return array<string, array<array{group: string, role: string}>>
     */
    public function load() {
        // a website that is being created has no group access yet
        if ($this->idSite <= 0) {
            return [self::SETTING_NAME => []];
        }

        $model = new Model();

        $names = [];
        foreach ($model->getAllGroups() as $group) {
            $names[$group['idgroup']] = Common::unsanitizeInputValue($group['name']);
        }

        $rows = [];
        foreach ($model->getPermissionsOfSite($this->idSite) as $permission) {
            if (!isset($names[$permission['idgroup']])) {
                continue;
            }
            $rows[] = ['group' => (string) $permission['idgroup'], 'role' => $permission['access']];
        }

        usort($rows, static function (array $a, array $b) use ($names): int {
            return strcasecmp($names[(int) $a['group']], $names[(int) $b['group']]);
        });

        return [self::SETTING_NAME => $rows];
    }

    /**
     * @param array<mixed> $values
     */
    public function save($values): void {
        // while a website is being created, the settings are first validated with idSite 0; they are saved again
        // with the id of the new website
        if ($this->idSite <= 0) {
            return;
        }

        $rows = $values[self::SETTING_NAME] ?? [];
        $wanted = self::parseRows(is_array($rows) ? $rows : []);

        $model = new Model();
        $current = [];
        foreach ($model->getPermissionsOfSite($this->idSite) as $permission) {
            $current[$permission['idgroup']] = $permission['access'];
        }

        $capabilityProvider = StaticContainer::get(CapabilitiesProvider::class);
        if (!($capabilityProvider instanceof CapabilitiesProvider)) {
            throw new \Exception('CapabilitiesProvider must inherit Access\CapabilitiesProvider');
        }
        $updater = new GroupAccessUpdater($model, $capabilityProvider);

        $removedGroups = array_keys(array_diff_key($current, $wanted));
        $changedGroups = [];
        foreach ($wanted as $idGroup => $access) {
            if (($current[$idGroup] ?? null) !== $access) {
                $changedGroups[$idGroup] = $access;
            }
        }
        if (!$removedGroups && !$changedGroups) {
            return;
        }

        $apply = function () use ($updater, $removedGroups, $changedGroups): void {
            foreach ($removedGroups as $idGroup) {
                $updater->setAccess($idGroup, [$this->idSite], 'noaccess', false);
            }
            foreach ($changedGroups as $idGroup => $access) {
                $updater->setAccess($idGroup, [$this->idSite], $access, false);
            }

            GroupAccessUpdater::reloadAccess();
        };

        // members of groups that no longer have access may lose access to the website
        $logins = [];
        foreach ($removedGroups as $idGroup) {
            $logins = array_merge($logins, array_column($model->getMembersOfGroup($idGroup), 'login'));
        }
        SiteAccessLoss::notifyAfter($logins, $apply);
    }

    public function delete(): void {
        // the permissions of a deleted website are removed by the SitesManager.deleteSite.end event
    }

    /**
     * Returns the role per group id. Empty rows are ignored; for a group listed several times the highest role wins.
     *
     * @param array<mixed> $rows
     *
     * @return array<int, string>
     */
    public static function parseRows(array $rows): array {
        $access = new Access();

        $roles = [];
        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }
            $idGroup = $row['group'] ?? '';
            $role = $row['role'] ?? '';
            if (!is_numeric($idGroup) || (int) $idGroup <= 0 || !is_string($role) || $role === '' || $role === 'noaccess') {
                continue;
            }
            $idGroup = (int) $idGroup;
            $roles[$idGroup] = isset($roles[$idGroup]) ? $access->getHigherPermission($roles[$idGroup], $role) : $role;
        }

        return $roles;
    }
}
