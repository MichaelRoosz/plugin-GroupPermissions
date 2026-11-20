<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions\Dao;

use Piwik\Common;
use Piwik\Db;
use Piwik\DbHelper;

class GroupUser {
    public const TABLE = 'gpermissions_user';

    /**
     * Memberships added by the group sync (see GroupSync) have `synced` = 1, the sync only ever removes those.
     * Shared with the update that adds the column for existing installations.
     */
    public const COLUMN_SYNCED = 'TINYINT(1) UNSIGNED NOT NULL DEFAULT 0';

    /** @var string $tablePrefixed */
    private $tablePrefixed = '';

    public function __construct() {
        $this->tablePrefixed = Common::prefixTable(self::TABLE);
    }

    public function install(): void {
        DbHelper::createTable(self::TABLE, '
                  `idgroup` int(10) UNSIGNED NOT NULL,
                  `login` VARCHAR(100) NOT NULL,
                  `synced` ' . self::COLUMN_SYNCED . ',
                  PRIMARY KEY(`idgroup`, `login`)');
    }

    public function uninstall(): void {
        Db::query(sprintf('DROP TABLE IF EXISTS `%s`', $this->tablePrefixed));
    }

    /**
     * Does nothing if the user is already a member (e.g. added by a concurrent request), keeping that membership.
     */
    public function addUserToGroup(int $idGroup, string $login, bool $synced = false): void {
        Db::query(
            "INSERT IGNORE INTO `{$this->tablePrefixed}` (idgroup, login, synced) VALUES (?, ?, ?)",
            [$idGroup, $login, $synced ? 1 : 0]
        );
    }

    public function setMembershipSynced(int $idGroup, string $login, bool $synced): void {
        Db::query(
            "UPDATE `{$this->tablePrefixed}` SET synced = ? WHERE idgroup = ? AND login = ?",
            [$synced ? 1 : 0, $idGroup, $login]
        );
    }

    /**
     * Members that are existing users: users deleted while this plugin was deactivated can leave memberships behind,
     * they are left out (like in countMembersPerGroup).
     *
     * @return array<array{
     *    login: string,
     *    synced: bool
     * }>
     */
    public function getMembersOfGroup(int $idGroup): array {
        $table = $this->tablePrefixed;

        $rows = Rows::list(Db::fetchAll("SELECT login, synced FROM $table WHERE idgroup = ?", [$idGroup]));
        $existing = $this->getExistingLogins(array_map(static function (array $row): string {
            return Rows::string($row, 'login');
        }, $rows));

        $members = [];
        foreach ($rows as $row) {
            $login = Rows::string($row, 'login');
            if (isset($existing[mb_strtolower($login)])) {
                $members[] = ['login' => $login, 'synced' => Rows::int($row, 'synced') === 1];
            }
        }

        return $members;
    }

    /**
     * Users deleted while this plugin was deactivated are not counted (like websites in
     * GroupPermission::countSitesPerGroup). Invited users are counted.
     *
     * @return array<int, int> number of members by group id (groups without members are missing)
     */
    public function countMembersPerGroup(): array {
        $rows = Rows::list(Db::fetchAll("SELECT idgroup, login FROM {$this->tablePrefixed}"));
        $existing = $this->getExistingLogins(array_map(static function (array $row): string {
            return Rows::string($row, 'login');
        }, $rows));

        $counts = [];
        foreach ($rows as $row) {
            if (isset($existing[mb_strtolower(Rows::string($row, 'login'))])) {
                $idGroup = Rows::int($row, 'idgroup');
                $counts[$idGroup] = ($counts[$idGroup] ?? 0) + 1;
            }
        }

        return $counts;
    }

    /**
     * @return array<array{
     *    idgroup: int
     * }>
     */
    public function getGroupsOfUser(string $login): array {
        $table = $this->tablePrefixed;

        $rows = Rows::list(Db::fetchAll("SELECT idgroup FROM $table WHERE login = ?", [$login]));

        return array_map(static function (array $row): array {
            return ['idgroup' => Rows::int($row, 'idgroup')];
        }, $rows);
    }

    /**
     * @return array<int, bool> whether the membership was added by the group sync, by group id
     */
    public function getMembershipsOfUser(string $login): array {
        $table = $this->tablePrefixed;
        $memberships = [];
        foreach (Rows::list(Db::fetchAll("SELECT idgroup, synced FROM $table WHERE login = ?", [$login])) as $row) {
            $memberships[Rows::int($row, 'idgroup')] = Rows::int($row, 'synced') === 1;
        }

        return $memberships;
    }

    public function removeUserFromGroup(int $idGroup, string $login): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ? AND login = ?";
        $bind = [intval($idGroup), $login];
        Db::query($query, $bind);
    }

    public function removeAllUsersOfGroup(int $idGroup): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ?";
        $bind = [intval($idGroup)];
        Db::query($query, $bind);
    }

    public function removeUserFromAllGroups(string $login): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE login = ?";
        $bind = [$login];
        Db::query($query, $bind);
    }

    /**
     * Which of the logins belong to existing users. Looked up with the logins as values instead of joining the
     * user table: the login columns of this plugin's and Matomo's tables can have different collations (e.g. tables
     * created before and after a MySQL upgrade), which makes MySQL reject a join ("Illegal mix of collations").
     * Like the join, the lookup uses the collation of the user table, e.g. it is case-insensitive.
     *
     * @param array<string> $logins
     *
     * @return array<string, true> the lowercased logins of existing users as keys
     */
    private function getExistingLogins(array $logins): array {
        $logins = array_values(array_unique($logins));
        $tableUser = Common::prefixTable('user');

        $existing = [];
        foreach (array_chunk($logins, 500) as $chunk) {
            $rows = Rows::list(Db::fetchAll(
                "SELECT login FROM $tableUser WHERE login IN (" . Common::getSqlStringFieldsArray($chunk) . ')',
                $chunk
            ));
            foreach ($rows as $row) {
                $existing[mb_strtolower(Rows::string($row, 'login'))] = true;
            }
        }

        // lowercased, so with a case-insensitive collation a membership of `Bob` finds the user `bob`
        return $existing;
    }
}
