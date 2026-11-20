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
     * they are left out (like in countMembersPerGroup). Logins are returned as stored in Matomo's user table, also
     * for memberships stored with a different spelling (e.g. `BOB` for the user `bob`).
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
            $login = $existing[Rows::string($row, 'login')] ?? null;
            if ($login === null) {
                continue;
            }
            $synced = Rows::int($row, 'synced') === 1;
            // with a binary collation, several spellings of one user could be stored: a manual membership wins
            $members[$login] = ['login' => $login, 'synced' => $synced && ($members[$login]['synced'] ?? true)];
        }

        return array_values($members);
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

        $members = [];
        foreach ($rows as $row) {
            $login = $existing[Rows::string($row, 'login')] ?? null;
            if ($login !== null) {
                $members[Rows::int($row, 'idgroup')][$login] = true;
            }
        }

        return array_map('count', $members);
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

    /**
     * The logins stored for the memberships of a user in a group, compared in PHP rather than with `login = ?` (the
     * result of the SQL comparison depends on the collation of the column, e.g. a binary one never finds `BOB` for
     * `bob`). Matches the spellings that belong to the user (see getExistingLogins), and for users that no longer
     * exist the login itself, case-insensitively.
     *
     * @param string $login the login as stored in Matomo's user table, or the given login for deleted users
     *
     * @return array<string>
     */
    public function getStoredLoginsOfMember(int $idGroup, string $login): array {
        $table = $this->tablePrefixed;

        $storedLogins = array_values(array_unique(array_map(static function (array $row): string {
            return Rows::string($row, 'login');
        }, Rows::list(Db::fetchAll("SELECT login FROM $table WHERE idgroup = ?", [$idGroup])))));
        $existing = $this->getExistingLogins($storedLogins);

        $folded = mb_strtolower($login);
        $result = [];
        foreach ($storedLogins as $storedLogin) {
            $user = $existing[$storedLogin] ?? null;
            if ($user !== null ? $user === $login : mb_strtolower($storedLogin) === $folded) {
                $result[] = $storedLogin;
            }
        }

        return $result;
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
     * @return array<string, string> the login of the user (as stored in Matomo's user table) by given login
     */
    private function getExistingLogins(array $logins): array {
        $logins = array_values(array_unique($logins));
        $tableUser = Common::prefixTable('user');

        $usersByFolded = [];
        foreach (array_chunk($logins, 500) as $chunk) {
            $rows = Rows::list(Db::fetchAll(
                "SELECT login FROM $tableUser WHERE login IN (" . Common::getSqlStringFieldsArray($chunk) . ')',
                $chunk
            ));
            foreach ($rows as $row) {
                $login = Rows::string($row, 'login');
                $usersByFolded[mb_strtolower($login)] = $login;
            }
        }

        $existing = [];
        foreach ($logins as $login) {
            if (isset($usersByFolded[mb_strtolower($login)])) {
                $existing[$login] = $usersByFolded[mb_strtolower($login)];

                continue;
            }
            if (!$usersByFolded) {
                continue;
            }

            // the collation may consider logins equal that differ by more than case (e.g. `bób` and `bob` with an
            // accent-insensitive collation), and so grant the membership to the user: ask the database which user
            $user = Db::fetchOne("SELECT login FROM $tableUser WHERE login = ?", [$login]);
            if (is_string($user)) {
                $existing[$login] = $user;
            }
        }

        return $existing;
    }
}
