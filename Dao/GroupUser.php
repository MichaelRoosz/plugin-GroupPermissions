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
        $idGroup = intval($idGroup);
        $table = $this->tablePrefixed;
        $tableUser = Common::prefixTable('user');

        $rows = Rows::list(Db::fetchAll(
            "SELECT gu.login, gu.synced FROM $table AS gu
                INNER JOIN $tableUser AS u ON u.login = gu.login
                WHERE gu.idgroup = ?",
            [$idGroup]
        ));

        return array_map(static function (array $row): array {
            return ['login' => Rows::string($row, 'login'), 'synced' => Rows::int($row, 'synced') === 1];
        }, $rows);
    }

    /**
     * Users deleted while this plugin was deactivated are not counted (like websites in
     * GroupPermission::countSitesPerGroup). Invited users are counted.
     *
     * @return array<int, int> number of members by group id (groups without members are missing)
     */
    public function countMembersPerGroup(): array {
        $table = $this->tablePrefixed;
        $tableUser = Common::prefixTable('user');
        $sql = "SELECT gu.idgroup, COUNT(*) AS cnt FROM $table AS gu
                INNER JOIN $tableUser AS u ON u.login = gu.login
                GROUP BY gu.idgroup";
        $counts = [];
        foreach (Rows::list(Db::fetchAll($sql)) as $row) {
            $counts[Rows::int($row, 'idgroup')] = Rows::int($row, 'cnt');
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
}
