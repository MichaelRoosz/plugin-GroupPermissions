<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Exception;
use Piwik\Common;
use Piwik\Date;
use Piwik\Db;
use Piwik\Piwik;
use Piwik\Plugin\Manager as PluginManager;
use Piwik\Plugins\GroupPermissions\Dao\Rows;
use Piwik\Plugins\ScheduledReports\API as CoreScheduledReportsAPI;
use Piwik\Plugins\ScheduledReports\Model as ScheduledReportsModel;
use Piwik\Plugins\UsersManager\Model as UsersModel;

/**
 * Copies a scheduled email report to the members of a group: every member gets an independent copy of their own,
 * so Matomo's ScheduledReports plugin handles the copies like any other report of the member (access checks, the
 * websites of the All Websites dashboard, ...).
 *
 * The copies are sent to their member only ("Send report to me", without the additional recipients of the
 * original), otherwise the recipients of the original would get the report once per member.
 *
 * Callers are responsible for access checks.
 */
class ReportCopy {
    /** Only email reports can be copied: other types store recipients of the creator (e.g. SMS phone numbers) */
    public const REPORT_TYPE = 'email';

    public static function isScheduledReportsActivated(): bool {
        return PluginManager::getInstance()->isPluginActivated('ScheduledReports');
    }

    /**
     * Returns the email reports the current user may copy: super users all reports, other users their own. Reports
     * using a segment that is not shared with all users are left out, see getReportOrFail.
     *
     * @return array<array{
     *   idReport: int,
     *   description: string,
     *   login: string,
     *   idSite: int,
     *   siteName: string,
     *   period: string,
     *   idSegment: int
     * }>
     */
    public function getCopyableReports(): array {
        if (!self::isScheduledReportsActivated()) {
            return [];
        }

        // super users get the reports of all users, other users their own
        $reports = CoreScheduledReportsAPI::getInstance()->getReports();

        $siteNames = [];
        $result = [];
        foreach ($reports as $report) {
            if (
                !is_array($report)
                || !is_numeric($report['idreport'] ?? null)
                || !is_numeric($report['idsite'] ?? null)
                || ($report['type'] ?? null) !== self::REPORT_TYPE
            ) {
                continue;
            }

            $idSegment = is_numeric($report['idsegment'] ?? null) ? (int) $report['idsegment'] : 0;
            // copying would fail, see getReportOrFail
            if (!self::isSegmentCopyable($idSegment)) {
                continue;
            }

            $idSite = (int) $report['idsite'];
            if (!isset($siteNames[$idSite])) {
                try {
                    $siteNames[$idSite] = \Piwik\Site::getNameFor($idSite);
                } catch (Exception $e) {
                    $siteNames[$idSite] = (string) $idSite;
                }
            }

            $result[] = [
                'idReport' => (int) $report['idreport'],
                'description' => is_string($report['description'] ?? null) ? $report['description'] : '',
                'login' => is_string($report['login'] ?? null) ? $report['login'] : '',
                'idSite' => $idSite,
                'siteName' => $siteNames[$idSite],
                'period' => is_string($report['period'] ?? null) ? $report['period'] : '',
                'idSegment' => $idSegment,
            ];
        }

        usort($result, static function (array $a, array $b): int {
            return strcasecmp($a['description'], $b['description']) ?: $a['idReport'] <=> $b['idReport'];
        });

        return $result;
    }

    /**
     * Returns the stored report if the current user may copy it (super users any report, other users their own)
     * and it can be copied, otherwise throws.
     *
     * @return array<mixed> the row of the report table
     */
    public function getReportOrFail(int $idReport): array {
        if (!self::isScheduledReportsActivated()) {
            throw new Exception('The ScheduledReports plugin is not activated.');
        }

        $row = Rows::row(Db::fetchRow(
            'SELECT r.* FROM `' . Common::prefixTable('report') . '` r
                INNER JOIN `' . Common::prefixTable('site') . '` s ON s.idsite = r.idsite
                WHERE r.idreport = ? AND r.deleted = 0',
            [$idReport]
        ));

        // same error for reports that do not exist and reports of other users, to not reveal report ids
        if (
            $row === null
            || (!Piwik::hasUserSuperUserAccess() && Rows::string($row, 'login') !== Piwik::getCurrentUserLogin())
        ) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionReportNotFound', $idReport));
        }

        if (Rows::string($row, 'type') !== self::REPORT_TYPE) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionReportTypeNotCopyable'));
        }

        $idSegment = is_numeric($row['idsegment'] ?? null) ? (int) $row['idsegment'] : 0;
        if (!self::isSegmentCopyable($idSegment)) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionReportSegmentNotCopyable'));
        }

        return $row;
    }

    /**
     * Copies the report to the given users, who must exist and have view access to the website of the report
     * (see filterReceivers).
     *
     * @param array<mixed> $report row of the report table, see getReportOrFail
     * @param array<string> $logins
     *
     * @return array<string> logins of the users the report was copied to
     */
    public function copyToUsers(array $report, array $logins): array {
        $parameters = json_decode(Rows::string($report, 'parameters'), true);
        $parameters = is_array($parameters) ? $parameters : [];
        $parameters['emailMe'] = true;
        $parameters['additionalEmails'] = [];

        $copy = $report;
        unset($copy['idreport']);
        $copy['parameters'] = json_encode($parameters);
        $copy['ts_created'] = Date::now()->getDatetime();
        $copy['deleted'] = 0;
        if (array_key_exists('ts_last_sent', $copy)) {
            $copy['ts_last_sent'] = null;
        }

        // copying again (e.g. a double click, or after adding members) does not give members a second copy
        $haveCopy = $this->getLoginsWithIdenticalReport($copy, $logins);

        $scheduledReportsModel = new ScheduledReportsModel();
        $copiedTo = [];
        foreach ($logins as $login) {
            if (isset($haveCopy[$login])) {
                continue;
            }

            $copy['login'] = $login;
            $scheduledReportsModel->createReport($copy);
            $copiedTo[] = $login;
        }

        if ($copiedTo) {
            CoreScheduledReportsAPI::$cache = [];
        }

        return $copiedTo;
    }

    /**
     * The users that can get a copy of a report of the website: active users (not only invited) with view access
     * to the website, including access through groups. Looked up in a few queries for all users.
     *
     * @param array<string> $logins logins as stored in Matomo's user table
     *
     * @return array<string> the logins of these users, in the given order
     */
    public function filterReceivers(array $logins, int $idSite): array {
        $logins = array_values(array_filter($logins, static function (string $login): bool {
            return $login !== '' && $login !== 'anonymous';
        }));
        // UsersModel::getUsers() returns all users for an empty list
        if (!$logins) {
            return [];
        }

        $receivers = [];
        $candidates = [];
        $users = (new UsersModel())->getUsers($logins);
        foreach (is_array($users) ? $users : [] as $user) {
            if (!is_array($user) || !is_string($user['login'] ?? null) || !empty($user['invite_token'])) {
                continue; // only invited
            }
            if (!empty($user['superuser_access'])) {
                $receivers[$user['login']] = true;
            } else {
                $candidates[] = $user['login'];
            }
        }

        // any role gives view access, directly or through groups (capabilities only apply with a role)
        foreach (SiteAccessLoss::getIdSitesWithAccess($candidates) as $login => $idSites) {
            if (in_array($idSite, $idSites, true)) {
                $receivers[(string) $login] = true;
            }
        }

        return array_values(array_filter($logins, static function (string $login) use ($receivers): bool {
            return isset($receivers[$login]);
        }));
    }

    /**
     * The users who already have a report (not deleted) equal to the copy in every column except its id, owner and
     * timestamps, e.g. a copy made earlier. The parameters are compared decoded, independent of key order.
     *
     * @param array<mixed> $copy the copy to create, see copyToUsers
     * @param array<string> $logins
     *
     * @return array<string, true> by login
     */
    private function getLoginsWithIdenticalReport(array $copy, array $logins): array {
        if (!$logins) {
            return [];
        }

        $ignored = ['idreport' => true, 'login' => true, 'ts_created' => true, 'ts_last_sent' => true, 'deleted' => true];
        $copyParameters = json_decode(Rows::string($copy, 'parameters'), true);

        // compared exactly: the logins are the ones of Matomo's user table, which reports are stored with
        $wanted = array_flip($logins);

        $result = [];
        $rows = Rows::list(Db::fetchAll(
            'SELECT * FROM `' . Common::prefixTable('report') . '`
                WHERE deleted = 0 AND idsite = ? AND login IN (' . Common::getSqlStringFieldsArray($logins) . ')',
            array_merge([Rows::int($copy, 'idsite')], array_values($logins))
        ));
        foreach ($rows as $row) {
            $login = is_string($row['login'] ?? null) ? $row['login'] : null;
            if ($login === null || !isset($wanted[$login]) || isset($result[$login])) {
                continue;
            }

            $identical = true;
            foreach ($copy as $column => $value) {
                if (isset($ignored[$column])) {
                    continue;
                }
                $stored = $row[$column] ?? null;
                if ($column === 'parameters') {
                    $identical = is_string($stored) && json_decode($stored, true) == $copyParameters;
                } else {
                    // the database returns numbers as strings
                    $identical = ($value === null || $stored === null)
                        ? $value === $stored
                        : (is_scalar($value) && is_scalar($stored) && (string) $value === (string) $stored);
                }
                if (!$identical) {
                    break;
                }
            }

            if ($identical) {
                $result[$login] = true;
            }
        }

        return $result;
    }

    /**
     * Whether a report with this segment (0 for none) can be copied: Matomo only lets members use their own segments
     * and segments shared with all users in their reports
     */
    private static function isSegmentCopyable(int $idSegment): bool {
        if ($idSegment <= 0) {
            return true;
        }

        $segment = SegmentSharing::getStoredSegment($idSegment);

        return $segment !== null && !empty($segment['enable_all_users']);
    }
}
