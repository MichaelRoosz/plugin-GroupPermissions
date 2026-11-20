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
 *
 * A second, hidden setting holds the roles as they were when the form was loaded (`idGroup:role,...`). When both are
 * sent, only the groups whose role was changed in the form are updated, so changes made by others while the form was
 * open are kept. Without it (e.g. API calls that only send the roles), the roles sent replace all roles.
 */
class GroupAccessBackend implements BackendInterface {
    public const SETTING_NAME = 'group_access';
    public const LOADED_SETTING_NAME = 'group_access_loaded';

    /** @var int */
    private $idSite;

    /**
     * @var array<string, true> names of the settings set in this request
     */
    private $submitted = [];

    public function __construct(int $idSite) {
        $this->idSite = $idSite;
    }

    public function getStorageId() {
        return 'GroupPermissions_GroupAccess_' . $this->idSite;
    }

    /**
     * @return array{group_access: array<array{group: string, role: string}>, group_access_loaded: string}
     */
    public function load() {
        // a website that is being created has no group access yet
        if ($this->idSite <= 0) {
            return [self::SETTING_NAME => [], self::LOADED_SETTING_NAME => ''];
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

        return [self::SETTING_NAME => $rows, self::LOADED_SETTING_NAME => self::formatSnapshot($rows)];
    }

    /**
     * Called when a value is set for one of the settings of this backend in the current request
     */
    public function markSubmitted(string $settingName): void {
        $this->submitted[$settingName] = true;
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

        if (!isset($this->submitted[self::SETTING_NAME])) {
            return;
        }

        $rows = $values[self::SETTING_NAME] ?? [];
        $wanted = self::parseRows(is_array($rows) ? $rows : []);

        $model = new Model();
        $current = [];
        foreach ($model->getPermissionsOfSite($this->idSite) as $permission) {
            $current[$permission['idgroup']] = $permission['access'];
        }

        $loaded = isset($this->submitted[self::LOADED_SETTING_NAME])
            ? self::parseSnapshot($values[self::LOADED_SETTING_NAME] ?? null)
            : null;
        if ($loaded !== null) {
            $wanted = self::mergeChanges($current, $loaded, $wanted);
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
     * Applies the changes made in the form (from the loaded roles to the wanted ones) to the current roles.
     *
     * @param array<int, string> $current
     * @param array<int, string> $loaded
     * @param array<int, string> $wanted
     *
     * @return array<int, string>
     */
    public static function mergeChanges(array $current, array $loaded, array $wanted): array {
        $result = $current;
        foreach (array_keys($loaded + $wanted) as $idGroup) {
            if (($wanted[$idGroup] ?? null) === ($loaded[$idGroup] ?? null)) {
                continue;
            }

            if (isset($wanted[$idGroup])) {
                $result[$idGroup] = $wanted[$idGroup];
            } else {
                unset($result[$idGroup]);
            }
        }

        return $result;
    }

    /**
     * @param array<array{group: string, role: string}> $rows
     */
    public static function formatSnapshot(array $rows): string {
        $parts = [];
        foreach ($rows as $row) {
            $parts[] = $row['group'] . ':' . $row['role'];
        }

        return implode(',', $parts);
    }

    /**
     * @param mixed $snapshot
     *
     * @return array<int, string>|null the role per group id, null if the value is not a snapshot
     */
    public static function parseSnapshot($snapshot): ?array {
        if (!is_string($snapshot)) {
            return null;
        }

        $roles = [];
        foreach ($snapshot === '' ? [] : explode(',', $snapshot) as $part) {
            if (!preg_match('/^([1-9][0-9]*):([a-z_]+)$/', $part, $matches)) {
                return null;
            }
            $roles[(int) $matches[1]] = $matches[2];
        }

        return $roles;
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
