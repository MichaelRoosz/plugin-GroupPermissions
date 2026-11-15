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
 * Capabilities (e.g. `tagmanager_write`) a group has for a website, in addition to its role.
 * Like in Matomo core, a capability only applies while the group also has a role for the website.
 */
class GroupCapability {
    public const TABLE = 'gpermissions_capability';

    /** Column definition, shared with the update that creates the table for existing installations */
    public const COLUMNS = [
        'idgroup' => 'INT(10) UNSIGNED NOT NULL',
        'idsite' => 'INT(10) UNSIGNED NOT NULL',
        'capability' => 'VARCHAR(100) NOT NULL',
    ];

    public const PRIMARY_KEY = ['idgroup', 'idsite', 'capability'];

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

    public function addCapability(int $idGroup, int $idSite, string $capability): void {
        Db::query(
            "INSERT IGNORE INTO `{$this->tablePrefixed}` (idgroup, idsite, capability) VALUES (?, ?, ?)",
            [$idGroup, $idSite, $capability]
        );
    }

    public function removeCapability(int $idGroup, int $idSite, string $capability): void {
        Db::query(
            "DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ? AND idsite = ? AND capability = ?",
            [$idGroup, $idSite, $capability]
        );
    }

    /**
     * @return array<int, array<string>> capabilities by website id
     */
    public function getCapabilitiesOfGroup(int $idGroup): array {
        $rows = Rows::list(Db::fetchAll(
            "SELECT idsite, capability FROM `{$this->tablePrefixed}` WHERE idgroup = ? ORDER BY capability",
            [$idGroup]
        ));

        $capabilities = [];
        foreach ($rows as $row) {
            $capabilities[Rows::int($row, 'idsite')][] = Rows::string($row, 'capability');
        }

        return $capabilities;
    }

    /**
     * @return array<int, array<string>> capabilities by group id
     */
    public function getCapabilitiesOfSite(int $idSite): array {
        $rows = Rows::list(Db::fetchAll(
            "SELECT idgroup, capability FROM `{$this->tablePrefixed}` WHERE idsite = ? ORDER BY capability",
            [$idSite]
        ));

        $capabilities = [];
        foreach ($rows as $row) {
            $capabilities[Rows::int($row, 'idgroup')][] = Rows::string($row, 'capability');
        }

        return $capabilities;
    }

    public function removeAllCapabilitiesOfGroupForSite(int $idGroup, int $idSite): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ? AND idsite = ?", [$idGroup, $idSite]);
    }

    public function removeAllCapabilitiesOfGroup(int $idGroup): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ?", [$idGroup]);
    }

    public function removeAllCapabilitiesForSite(int $idSite): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idsite = ?", [$idSite]);
    }
}
