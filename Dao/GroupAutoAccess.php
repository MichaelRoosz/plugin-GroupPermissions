<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions\Dao;

use Exception;
use Piwik\Common;
use Piwik\Db;
use Piwik\DbHelper;

/**
 * Rules that give a group access to newly created websites, e.g. "role view for every new website in the
 * Matomo website group 'Shops'" or "role write for every new website with a URL matching '*.example.com'".
 */
class GroupAutoAccess {
    public const TABLE = 'gpermissions_autoaccess';

    public const MATCH_SITE_GROUP = 'sitegroup';
    public const MATCH_URL = 'url';
    public const MATCH_TYPES = [self::MATCH_SITE_GROUP, self::MATCH_URL];

    /** Length of the `pattern` column */
    public const PATTERN_MAX_LENGTH = 255;

    /** Column definition, shared with the update that creates the table for existing installations */
    public const COLUMNS = [
        'idrule' => 'INT(10) UNSIGNED NOT NULL AUTO_INCREMENT',
        'idgroup' => 'INT(10) UNSIGNED NOT NULL',
        'match_type' => 'VARCHAR(20) NOT NULL',
        'pattern' => 'VARCHAR(255) NOT NULL',
        'access' => 'VARCHAR(50) NOT NULL',
        'capabilities' => 'VARCHAR(1000) NOT NULL DEFAULT \'\'',
    ];

    public const PRIMARY_KEY = ['idrule'];

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
     * @param array<string> $capabilities
     */
    public function addRule(int $idGroup, string $matchType, string $pattern, string $access, array $capabilities): int {
        Db::query(
            "INSERT INTO `{$this->tablePrefixed}` (idgroup, match_type, pattern, access, capabilities) VALUES (?, ?, ?, ?, ?)",
            [$idGroup, $matchType, $pattern, $access, implode(',', $capabilities)]
        );

        $idRule = Db::fetchOne('SELECT LAST_INSERT_ID()');
        if (!is_numeric($idRule)) {
            throw new Exception('Could not determine the ID of the new rule');
        }

        return (int) $idRule;
    }

    /**
     * @return array<array{
     *   idrule: int,
     *   idgroup: int,
     *   match_type: string,
     *   pattern: string,
     *   access: string,
     *   capabilities: array<string>
     * }>
     */
    public function getRulesOfGroup(int $idGroup): array {
        return $this->mapRules(Db::fetchAll(
            "SELECT * FROM `{$this->tablePrefixed}` WHERE idgroup = ? ORDER BY idrule",
            [$idGroup]
        ));
    }

    /**
     * @return array<array{
     *   idrule: int,
     *   idgroup: int,
     *   match_type: string,
     *   pattern: string,
     *   access: string,
     *   capabilities: array<string>
     * }>
     */
    public function getAllRules(): array {
        return $this->mapRules(Db::fetchAll("SELECT * FROM `{$this->tablePrefixed}` ORDER BY idrule"));
    }

    /**
     * @return array{
     *   idrule: int,
     *   idgroup: int,
     *   match_type: string,
     *   pattern: string,
     *   access: string,
     *   capabilities: array<string>
     * }|null
     */
    public function getRule(int $idGroup, int $idRule): ?array {
        $rules = $this->mapRules(Db::fetchAll(
            "SELECT * FROM `{$this->tablePrefixed}` WHERE idgroup = ? AND idrule = ?",
            [$idGroup, $idRule]
        ));

        return $rules[0] ?? null;
    }

    public function removeRule(int $idGroup, int $idRule): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ? AND idrule = ?", [$idGroup, $idRule]);
    }

    public function removeAllRulesOfGroup(int $idGroup): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ?", [$idGroup]);
    }

    /**
     * @param mixed $rows
     *
     * @return array<array{
     *   idrule: int,
     *   idgroup: int,
     *   match_type: string,
     *   pattern: string,
     *   access: string,
     *   capabilities: array<string>
     * }>
     */
    private function mapRules($rows): array {
        return array_map(static function (array $row): array {
            return [
                'idrule' => Rows::int($row, 'idrule'),
                'idgroup' => Rows::int($row, 'idgroup'),
                'match_type' => Rows::string($row, 'match_type'),
                'pattern' => Rows::string($row, 'pattern'),
                'access' => Rows::string($row, 'access'),
                'capabilities' => array_values(array_filter(explode(',', Rows::string($row, 'capabilities')))),
            ];
        }, Rows::list($rows));
    }
}
