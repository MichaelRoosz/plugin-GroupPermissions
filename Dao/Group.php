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
use Piwik\Piwik;
use Exception;

class Group {
    public const TABLE = 'gpermissions_group';

    /** Length of the `name` column */
    public const NAME_MAX_LENGTH = 64;

    /** @var string $tablePrefixed */
    private $tablePrefixed = '';

    public function __construct() {
        $this->tablePrefixed = Common::prefixTable(self::TABLE);
    }

    public function install(): void {
        DbHelper::createTable(self::TABLE, "
                  `idgroup` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
                  `name` VARCHAR(64) NOT NULL DEFAULT '',
                  PRIMARY KEY(`idgroup`)");
    }

    public function uninstall(): void {
        Db::query(sprintf('DROP TABLE IF EXISTS `%s`', $this->tablePrefixed));
    }

    public function createGroup(string $name): int {
        Db::query("INSERT INTO `{$this->tablePrefixed}` (name) VALUES (?)", [$name]);

        $idGroup = Db::fetchOne('SELECT LAST_INSERT_ID()');
        if (!is_numeric($idGroup)) {
            throw new Exception('Could not determine the ID of the new group');
        }

        return (int) $idGroup;
    }

    /**
     * @return array<array{
     *   idgroup: int,
     *   name: string
     * }>
     */
    public function getAllGroups(): array {
        $table = $this->tablePrefixed;

        $rows = Rows::list(Db::fetchAll("SELECT * FROM $table ORDER BY idgroup"));

        return array_map([$this, 'mapGroup'], $rows);
    }

    /**
     * @return array{
     *   idgroup: int,
     *   name: string
     * }
     */
    public function getGroupWithId(int $idGroup): array {
        $idGroup = intval($idGroup);
        $table = $this->tablePrefixed;

        $group = Rows::row(Db::fetchRow("SELECT * FROM $table WHERE idgroup = ?", [$idGroup]));
        if (!$group) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $idGroup));
        }

        return $this->mapGroup($group);
    }

    /**
     * @return array{
     *   idgroup: int,
     *   name: string
     * }
     */
    public function getGroupWithName(string $name): array {
        // Compared in PHP rather than with `name = ?`: the result of the SQL comparison depends on the collation
        // of the column (e.g. utf8mb4_0900_ai_ci also ignores accents, so `Cafe` would find `Café`). Names are
        // case-insensitive; installations may contain several groups with the same name from before names had to
        // be unique, then an exact match wins, otherwise the oldest group.
        $folded = mb_strtolower($name);
        $match = null;
        foreach ($this->getAllGroups() as $group) {
            if ($group['name'] === $name) {
                return $group;
            }
            if ($match === null && mb_strtolower($group['name']) === $folded) {
                $match = $group;
            }
        }

        if ($match === null) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionGroupDoesNotExist', $name));
        }

        return $match;
    }

    public function renameGroup(int $idGroup, string $newName): void {
        Db::query("UPDATE `{$this->tablePrefixed}` SET name = ? WHERE idgroup = ?", [$newName, $idGroup]);
    }

    public function deleteGroup(int $idGroup): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ?";
        $bind = [intval($idGroup)];
        Db::query($query, $bind);
    }

    /**
     * @param array<mixed> $row
     *
     * @return array{
     *   idgroup: int,
     *   name: string
     * }
     */
    private function mapGroup(array $row): array {
        return [
            'idgroup' => Rows::int($row, 'idgroup'),
            'name' => Rows::string($row, 'name'),
        ];
    }
}
