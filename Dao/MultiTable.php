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

class MultiTable {
    /** @var string $tablePrefixedGroupPermission */
    private $tablePrefixedGroupPermission = '';

    /** @var string $tablePrefixedGroupUser */
    private $tablePrefixedGroupUser = '';

    /** @var string $tablePrefixedGroupCapability */
    private $tablePrefixedGroupCapability = '';

    public function __construct() {
        $this->tablePrefixedGroupPermission = Common::prefixTable(GroupPermission::TABLE);
        $this->tablePrefixedGroupUser = Common::prefixTable(GroupUser::TABLE);
        $this->tablePrefixedGroupCapability = Common::prefixTable(GroupCapability::TABLE);
    }

    /**
     * Roles the groups of a user grant. Like Matomo core, joined with the site table: rows of deleted websites (e.g.
     * deleted while this plugin was deactivated) never grant access.
     *
     * @return array<array{
     *   idsite: int,
     *   access: string
     * }>
     */
    public function getPermissionsOfUser(string $login): array {
        $tablePermission = $this->tablePrefixedGroupPermission;
        $tableUser = $this->tablePrefixedGroupUser;
        $tableSite = Common::prefixTable('site');
        $sql = "SELECT ga.idsite, ga.access FROM $tablePermission AS ga
                INNER JOIN $tableUser AS gu ON ga.idgroup = gu.idgroup
                INNER JOIN $tableSite AS s ON s.idsite = ga.idsite
                WHERE gu.login = ?";

        $rows = Rows::list(Db::fetchAll($sql, [$login]));

        return array_map(static function (array $row): array {
            return [
                'idsite' => Rows::int($row, 'idsite'),
                'access' => Rows::string($row, 'access'),
            ];
        }, $rows);
    }

    /**
     * The websites each user has a role for, directly (Matomo's access table) or through groups, in a few queries for
     * all users. Logins are compared like in Matomo core and getPermissionsOfUser (`login = ?`, with the collation of
     * the column), using a CASE expression to tell which of the given logins a row belongs to.
     *
     * @param array<string> $logins
     * @param array<string> $roles the roles of Matomo's access table to consider (it also stores capabilities)
     *
     * @return array<string, array<int>> ids of the websites by given login
     */
    public function getIdSitesWithRoleOfUsers(array $logins, array $roles): array {
        $logins = array_values(array_unique($logins));
        $result = array_fill_keys($logins, []);
        if (!$logins) {
            return $result;
        }

        $tableAccess = Common::prefixTable('access');
        $tableSite = Common::prefixTable('site');
        $tablePermission = $this->tablePrefixedGroupPermission;
        $tableUser = $this->tablePrefixedGroupUser;

        foreach (array_chunk($logins, 100) as $chunk) {
            $case = 'CASE';
            foreach (array_keys($chunk) as $index) {
                $case .= ' WHEN {column} = ? THEN ' . (int) $index;
            }
            $case .= ' END';
            $in = Common::getSqlStringFieldsArray($chunk);

            $queries = [[
                'SELECT ' . str_replace('{column}', 'gu.login', $case) . " AS idx, ga.idsite FROM $tablePermission AS ga
                    INNER JOIN $tableUser AS gu ON ga.idgroup = gu.idgroup
                    INNER JOIN $tableSite AS s ON s.idsite = ga.idsite
                    WHERE gu.login IN ($in)",
                array_merge($chunk, $chunk),
            ]];
            if ($roles) {
                $queries[] = [
                    'SELECT ' . str_replace('{column}', 'a.login', $case) . " AS idx, a.idsite FROM $tableAccess AS a
                        INNER JOIN $tableSite AS s ON s.idsite = a.idsite
                        WHERE a.login IN ($in) AND a.access IN (" . Common::getSqlStringFieldsArray($roles) . ')',
                    array_merge($chunk, $chunk, array_values($roles)),
                ];
            }

            foreach ($queries as [$sql, $bind]) {
                foreach (Rows::list(Db::fetchAll($sql, $bind)) as $row) {
                    if (!is_numeric($row['idx'] ?? null) || !isset($chunk[(int) $row['idx']])) {
                        continue;
                    }
                    $idSite = Rows::int($row, 'idsite');
                    $result[$chunk[(int) $row['idx']]][$idSite] = $idSite;
                }
            }
        }

        return array_map('array_values', $result);
    }

    /**
     * Logins of the members of groups that have one of the given roles for a website.
     *
     * @param array<string> $roles
     *
     * @return array<string>
     */
    public function getLoginsWithRoleForSite(int $idSite, array $roles): array {
        if (!$roles) {
            return [];
        }

        $tablePermission = $this->tablePrefixedGroupPermission;
        $tableUser = $this->tablePrefixedGroupUser;
        $sql = "SELECT DISTINCT gu.login FROM $tablePermission AS ga
                INNER JOIN $tableUser AS gu ON ga.idgroup = gu.idgroup
                WHERE ga.idsite = ? AND ga.access IN (" . Common::getSqlStringFieldsArray($roles) . ')';

        $rows = Rows::list(Db::fetchAll($sql, array_merge([$idSite], array_values($roles))));

        return array_map(static function (array $row): string {
            return Rows::string($row, 'login');
        }, $rows);
    }

    /**
     * Capabilities the groups of a user grant. Only capabilities of groups that also have a role for the
     * website are returned (a capability never applies without a role).
     *
     * @return array<array{
     *   idsite: int,
     *   capability: string
     * }>
     */
    public function getCapabilitiesOfUser(string $login): array {
        $tableCapability = $this->tablePrefixedGroupCapability;
        $tablePermission = $this->tablePrefixedGroupPermission;
        $tableUser = $this->tablePrefixedGroupUser;
        $tableSite = Common::prefixTable('site');
        $sql = "SELECT DISTINCT gc.idsite, gc.capability FROM $tableCapability AS gc
                INNER JOIN $tableUser AS gu ON gc.idgroup = gu.idgroup
                INNER JOIN $tablePermission AS ga ON ga.idgroup = gc.idgroup AND ga.idsite = gc.idsite
                INNER JOIN $tableSite AS s ON s.idsite = gc.idsite
                WHERE gu.login = ?";

        $rows = Rows::list(Db::fetchAll($sql, [$login]));

        return array_map(static function (array $row): array {
            return [
                'idsite' => Rows::int($row, 'idsite'),
                'capability' => Rows::string($row, 'capability'),
            ];
        }, $rows);
    }
}
