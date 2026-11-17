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
 * Groups of an external directory (LDAP group DN or name, SAML group attribute value, ...) mapped to a group:
 * users in one of the external groups become members of the group when their groups are synchronized.
 */
class GroupExternal {
    public const TABLE = 'gpermissions_external';

    /**
     * Length of the `external_group` column. It is part of the primary key: 190 utf8mb4 characters fit the 767 byte
     * index limit of older MySQL / MariaDB versions (like `site_url.url` in Matomo core).
     */
    public const NAME_MAX_LENGTH = 190;

    /** Column definition, shared with the update that creates the table for existing installations */
    public const COLUMNS = [
        'idgroup' => 'INT(10) UNSIGNED NOT NULL',
        'external_group' => 'VARCHAR(190) NOT NULL',
    ];

    public const PRIMARY_KEY = ['idgroup', 'external_group'];

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

    public function addMapping(int $idGroup, string $externalGroup): void {
        Db::query(
            "INSERT IGNORE INTO `{$this->tablePrefixed}` (idgroup, external_group) VALUES (?, ?)",
            [$idGroup, $externalGroup]
        );
    }

    public function removeMapping(int $idGroup, string $externalGroup): void {
        Db::query(
            "DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ? AND external_group = ?",
            [$idGroup, $externalGroup]
        );
    }

    /**
     * @return array<string>
     */
    public function getMappingsOfGroup(int $idGroup): array {
        $rows = Rows::list(Db::fetchAll(
            "SELECT external_group FROM `{$this->tablePrefixed}` WHERE idgroup = ? ORDER BY external_group",
            [$idGroup]
        ));

        return array_map(static function (array $row): string {
            return Rows::string($row, 'external_group');
        }, $rows);
    }

    /**
     * @return array<array{
     *   idgroup: int,
     *   external_group: string
     * }>
     */
    public function getAllMappings(): array {
        $rows = Rows::list(Db::fetchAll("SELECT idgroup, external_group FROM `{$this->tablePrefixed}`"));

        return array_map(static function (array $row): array {
            return [
                'idgroup' => Rows::int($row, 'idgroup'),
                'external_group' => Rows::string($row, 'external_group'),
            ];
        }, $rows);
    }

    public function removeAllMappingsOfGroup(int $idGroup): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ?", [$idGroup]);
    }
}
