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

class GroupPermission {
    public const TABLE = 'gpermissions_access';

    /** @var string $tablePrefixed */
    private $tablePrefixed = '';

    public function __construct() {
        $this->tablePrefixed = Common::prefixTable(self::TABLE);
    }

    public function install(): void {
        DbHelper::createTable(self::TABLE, '
                  `idgroup` int(10) UNSIGNED NOT NULL,
                  `idsite` int(10) UNSIGNED NOT NULL,
                  `access` VARCHAR(100) NOT NULL,
                  PRIMARY KEY(`idgroup`, `idsite`)');
    }

    public function uninstall(): void {
        Db::query(sprintf('DROP TABLE IF EXISTS `%s`', $this->tablePrefixed));
    }

    public function createPermission(int $idGroup, int $idSite, string $access): void {
        $query = 'INSERT INTO ' . $this->tablePrefixed
                . ' (idgroup,idsite,access) VALUES (?,?,?)'
                . ' ON DUPLICATE KEY UPDATE access=?';

        Db::query($query, [
            $idGroup,
            $idSite,
            $access,
            $access,
        ]);
    }

    /**
     * @return array<array{
     *  idsite: int,
     *  access: string
     * }>
     */
    public function getPermissionsOfGroup(int $idGroup): array {
        $idGroup = intval($idGroup);
        $table = $this->tablePrefixed;

        $rows = Rows::list(Db::fetchAll("SELECT idsite, access FROM $table WHERE idgroup = ?", [$idGroup]));

        return array_map(static function (array $row): array {
            return [
                'idsite' => Rows::int($row, 'idsite'),
                'access' => Rows::string($row, 'access'),
            ];
        }, $rows);
    }

    /**
     * @return array<array{
     *   idgroup: int,
     *   access: string
     * }>
     */
    public function getPermissionsOfSite(int $idSite): array {
        $idSite = intval($idSite);
        $table = $this->tablePrefixed;

        $rows = Rows::list(Db::fetchAll("SELECT idgroup, access FROM $table WHERE idsite = ?", [$idSite]));

        return array_map(static function (array $row): array {
            return [
                'idgroup' => Rows::int($row, 'idgroup'),
                'access' => Rows::string($row, 'access'),
            ];
        }, $rows);
    }

    public function removePermission(int $idGroup, int $idSite): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ? AND idSite = ?";
        $bind = [intval($idGroup), intval($idSite)];
        Db::query($query, $bind);
    }

    public function removeAllPermissionsOfGroup(int $idGroup): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ?";
        $bind = [intval($idGroup)];
        Db::query($query, $bind);
    }

    public function removeAllPermissionsForSite(int $idSite): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idSite = ?";
        $bind = [intval($idSite)];
        Db::query($query, $bind);
    }
}
