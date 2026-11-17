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
 * Scheduled reports (ScheduledReports) shared with a group: every member of the group can manage the report.
 */
class GroupReport {
    public const TABLE = 'gpermissions_report';

    /** Column definition, shared with the update that creates the table for existing installations */
    public const COLUMNS = [
        'idgroup' => 'INT(10) UNSIGNED NOT NULL',
        'idreport' => 'INT(10) UNSIGNED NOT NULL',
    ];

    public const PRIMARY_KEY = ['idgroup', 'idreport'];

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

    public function shareReport(int $idGroup, int $idReport): void {
        Db::query(
            "INSERT IGNORE INTO `{$this->tablePrefixed}` (idgroup, idreport) VALUES (?, ?)",
            [$idGroup, $idReport]
        );
    }

    public function unshareReport(int $idGroup, int $idReport): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ? AND idreport = ?", [$idGroup, $idReport]);
    }

    /**
     * @return array<int> IDs of the reports shared with the group
     */
    public function getReportsOfGroup(int $idGroup): array {
        $rows = Rows::list(Db::fetchAll(
            "SELECT idreport FROM `{$this->tablePrefixed}` WHERE idgroup = ?",
            [$idGroup]
        ));

        return array_map(static function (array $row): int {
            return Rows::int($row, 'idreport');
        }, $rows);
    }

    /**
     * @return array<int> IDs of the groups the report is shared with
     */
    public function getGroupsOfReport(int $idReport): array {
        $rows = Rows::list(Db::fetchAll(
            "SELECT idgroup FROM `{$this->tablePrefixed}` WHERE idreport = ?",
            [$idReport]
        ));

        return array_map(static function (array $row): int {
            return Rows::int($row, 'idgroup');
        }, $rows);
    }

    /**
     * Reports of the given type shared with any group the user is a member of, without the user's own reports
     * and without deleted reports.
     *
     * @return array<int> report IDs
     */
    public function getReportsSharedWithUser(string $login, string $reportType): array {
        $userTable = Common::prefixTable(GroupUser::TABLE);
        $reportTable = Common::prefixTable('report');

        $rows = Rows::list(Db::fetchAll(
            "SELECT DISTINCT gr.idreport FROM `{$this->tablePrefixed}` gr
                INNER JOIN `$userTable` gu ON gu.idgroup = gr.idgroup
                INNER JOIN `$reportTable` r ON r.idreport = gr.idreport
                WHERE gu.login = ? AND r.login <> ? AND r.deleted = 0 AND r.type = ?",
            [$login, $login, $reportType]
        ));

        return array_map(static function (array $row): int {
            return Rows::int($row, 'idreport');
        }, $rows);
    }

    /**
     * Reports of the given type created by the user that are shared with at least one group, without deleted reports.
     *
     * @return array<array{
     *   idreport: int,
     *   idsite: int,
     *   idsegment: int
     * }>
     */
    public function getSharedReportsOfUser(string $login, string $reportType): array {
        $reportTable = Common::prefixTable('report');

        $rows = Rows::list(Db::fetchAll(
            "SELECT DISTINCT r.idreport, r.idsite, r.idsegment FROM `$reportTable` r
                INNER JOIN `{$this->tablePrefixed}` gr ON gr.idreport = r.idreport
                WHERE r.login = ? AND r.deleted = 0 AND r.type = ?
                ORDER BY r.idreport",
            [$login, $reportType]
        ));

        return array_map(static function (array $row): array {
            return [
                'idreport' => Rows::int($row, 'idreport'),
                'idsite' => Rows::int($row, 'idsite'),
                'idsegment' => is_numeric($row['idsegment'] ?? null) ? (int) $row['idsegment'] : 0,
            ];
        }, $rows);
    }

    /**
     * @return array<string> logins of the members of all groups the report is shared with, sorted
     */
    public function getMembersOfGroupsOfReport(int $idReport): array {
        $userTable = Common::prefixTable(GroupUser::TABLE);

        $rows = Rows::list(Db::fetchAll(
            "SELECT DISTINCT gu.login FROM `{$this->tablePrefixed}` gr
                INNER JOIN `$userTable` gu ON gu.idgroup = gr.idgroup
                WHERE gr.idreport = ?
                ORDER BY gu.login",
            [$idReport]
        ));

        return array_map(static function (array $row): string {
            return Rows::string($row, 'login');
        }, $rows);
    }

    /**
     * Makes the user the creator (owner) of the report.
     */
    public function setReportOwner(int $idReport, string $login): void {
        Db::query('UPDATE `' . Common::prefixTable('report') . '` SET login = ? WHERE idreport = ?', [$login, $idReport]);
    }

    public function setReportSegment(int $idReport, int $idSegment): void {
        Db::query('UPDATE `' . Common::prefixTable('report') . '` SET idsegment = ? WHERE idreport = ?', [$idSegment, $idReport]);
    }

    public function removeAllSharesOfGroup(int $idGroup): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idgroup = ?", [$idGroup]);
    }

    public function removeAllSharesOfReport(int $idReport): void {
        Db::query("DELETE FROM `{$this->tablePrefixed}` WHERE idreport = ?", [$idReport]);
    }
}
