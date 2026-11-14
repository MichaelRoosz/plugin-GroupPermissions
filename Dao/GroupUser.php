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

    /** @var string $tablePrefixed */
    private $tablePrefixed = '';

    public function __construct() {
        $this->tablePrefixed = Common::prefixTable(self::TABLE);
    }

    public function install(): void {
        DbHelper::createTable(self::TABLE, '
                  `idgroup` int(10) UNSIGNED NOT NULL,
                  `login` VARCHAR(100) NOT NULL,
                  PRIMARY KEY(`idgroup`, `login`)');
    }

    public function uninstall(): void {
        Db::query(sprintf('DROP TABLE IF EXISTS `%s`', $this->tablePrefixed));
    }

    public function addUserToGroup(int $idGroup, string $login): void {
        $db = $this->getDb();

        /** @phpstan-ignore method.notFound */
        $db->insert($this->tablePrefixed, [
            'idgroup' => $idGroup,
            'login' => $login,
        ]);
    }

    /**
     * @return array<array{
     *    login: string
     * }>
     */
    public function getMembersOfGroup(int $idGroup): array {
        $idGroup = intval($idGroup);
        $table = $this->tablePrefixed;

        $rows = Rows::list($this->getDb()->fetchAll("SELECT login FROM $table WHERE idgroup = ?", [$idGroup]));

        return array_map(static function (array $row): array {
            return ['login' => Rows::string($row, 'login')];
        }, $rows);
    }

    public function isUserInGroup(string $login, int $idGroup): bool {
        $idGroup = intval($idGroup);
        $table = $this->tablePrefixed;

        return (bool) $this->getDb()->fetchAll("SELECT login FROM $table WHERE login = ? AND idgroup = ?", [$login, $idGroup]);
    }

    /**
     * @return array<array{
     *    idgroup: int
     * }>
     */
    public function getGroupsOfUser(string $login): array {
        $table = $this->tablePrefixed;

        $rows = Rows::list($this->getDb()->fetchAll("SELECT idgroup FROM $table WHERE login = ?", [$login]));

        return array_map(static function (array $row): array {
            return ['idgroup' => Rows::int($row, 'idgroup')];
        }, $rows);
    }

    public function removeUserFromGroup(int $idGroup, string $login): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ? AND login = ?";
        $bind = [intval($idGroup), $login];
        $this->getDb()->query($query, $bind);
    }

    public function removeAllUsersOfGroup(int $idGroup): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ?";
        $bind = [intval($idGroup)];
        $this->getDb()->query($query, $bind);
    }

    public function removeUserFromAllGroups(string $login): void {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE login = ?";
        $bind = [$login];
        $this->getDb()->query($query, $bind);
    }

    /**
     * @return \Piwik\Tracker\Db|\Piwik\Db
     */
    private function getDb() {
        /** @phpstan-ignore return.type */
        return Db::get();
    }
}
