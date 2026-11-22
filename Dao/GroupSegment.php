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

/**
 * Stored segments (SegmentEditor) shared with a group: every member of the group can see and use the segment.
 */
class GroupSegment {
    public const TABLE = 'gpermissions_segment';

    /** Column definition, shared with the update that creates the table for existing installations */
    public const COLUMNS = [
        'idgroup' => 'INT(10) UNSIGNED NOT NULL',
        'idsegment' => 'INT(10) UNSIGNED NOT NULL',
        // login of the user who shared the segment: shares only apply while that user may still share it
        'shared_by' => 'VARCHAR(100) NOT NULL',
    ];

    public const PRIMARY_KEY = ['idgroup', 'idsegment'];

    /** @var string $tablePrefixed */
    private $tablePrefixed = '';

    public function __construct() {
        $this->tablePrefixed = Common::prefixTable(self::TABLE);
    }

    public function install(): void {
        $columns = [];
        foreach (self::COLUMNS as $name => $definition) {
            $columns[] = "`$name` $definition";
        }
        $columns[] = 'PRIMARY KEY(`' . implode('`, `', self::PRIMARY_KEY) . '`)';

        DbHelper::createTable(self::TABLE, implode(",\n", $columns));
    }

    public function uninstall(): void {
        Db::query(sprintf('DROP TABLE IF EXISTS `%s`', $this->tablePrefixed));
    }

    /**
     * Sharing a segment again records the new user as the one who shared it.
     */
    public function shareSegment(int $idGroup, int $idSegment, string $sharedBy): void {
        Db::query(
            "INSERT INTO `{$this->tablePrefixed}` (idgroup, idsegment, shared_by) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE shared_by = ?",
            [$idGroup, $idSegment, $sharedBy, $sharedBy]
        );
    }

    public function unshareSegment(int $idGroup, int $idSegment): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ? AND idsegment = ?", [$idGroup, $idSegment]);
    }

    /**
     * @return array<int> IDs of the segments shared with the group
     */
    public function getSegmentsOfGroup(int $idGroup): array {
        $rows = Rows::list(Db::fetchAll(
            "SELECT idsegment FROM `{$this->tablePrefixed}` WHERE idgroup = ?",
            [$idGroup]
        ));

        return array_map(static function (array $row): int {
            return Rows::int($row, 'idsegment');
        }, $rows);
    }

    /**
     * @return array<int> IDs of the groups the segment is shared with
     */
    public function getGroupsOfSegment(int $idSegment): array {
        $rows = Rows::list(Db::fetchAll(
            "SELECT idgroup FROM `{$this->tablePrefixed}` WHERE idsegment = ?",
            [$idSegment]
        ));

        return array_map(static function (array $row): int {
            return Rows::int($row, 'idgroup');
        }, $rows);
    }

    /**
     * @return array<array{
     *   idsegment: int,
     *   idgroup: int,
     *   shared_by: string
     * }> the shares of segments with any group the user is a member of
     */
    public function getSharesForUser(string $login): array {
        $userTable = Common::prefixTable(GroupUser::TABLE);

        $rows = Rows::list(Db::fetchAll(
            "SELECT DISTINCT gs.idsegment, gs.idgroup, gs.shared_by FROM `{$this->tablePrefixed}` gs
                INNER JOIN `$userTable` gu ON gu.idgroup = gs.idgroup
                WHERE gu.login = ?",
            [$login]
        ));

        return array_map(static function (array $row): array {
            return [
                'idsegment' => Rows::int($row, 'idsegment'),
                'idgroup' => Rows::int($row, 'idgroup'),
                'shared_by' => Rows::string($row, 'shared_by'),
            ];
        }, $rows);
    }

    public function removeAllSharesOfGroup(int $idGroup): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ?", [$idGroup]);
    }

    public function removeAllSharesOfSegment(int $idSegment): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idsegment = ?", [$idSegment]);
    }

    /**
     * Removes the shares made by a user (compared like Matomo compares logins, with the collation of the column)
     */
    public function removeAllSharesByUser(string $login): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE shared_by = ?", [$login]);
    }

    /**
     * Removes the shares made by users that no longer exist, see GroupUser::removeMembershipsOfMissingUsers
     */
    public function removeAllSharesByMissingUsers(): void {
        $table = $this->tablePrefixed;

        foreach ((new GroupUser())->getStoredLoginsOfMissingUsers($table, 'shared_by') as $storedLogin) {
            Db::query(
                "DELETE FROM `$table` WHERE shared_by = ? AND CAST(shared_by AS BINARY) = CAST(? AS BINARY)",
                [$storedLogin, $storedLogin]
            );
        }
    }

    /**
     * Removes the shares made by a user Matomo has just deleted, see GroupUser::removeMembershipsOfDeletedUser
     */
    public function removeAllSharesByDeletedUser(string $login): void {
        $table = $this->tablePrefixed;

        foreach ((new GroupUser())->getStoredLoginsOfDeletedUser($table, 'shared_by', $login) as $storedLogin) {
            Db::query(
                "DELETE FROM `$table` WHERE shared_by = ? AND CAST(shared_by AS BINARY) = CAST(? AS BINARY)",
                [$storedLogin, $storedLogin]
            );
        }
    }
}
