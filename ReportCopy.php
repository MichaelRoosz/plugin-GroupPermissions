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
     * Returns the email reports the current user may copy: super users all reports, other users their own.
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
                'idSegment' => is_numeric($report['idsegment'] ?? null) ? (int) $report['idsegment'] : 0,
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
        if ($idSegment > 0) {
            // Matomo only lets members use their own segments and segments shared with all users in their reports
            $segment = SegmentSharing::getStoredSegment($idSegment);
            if ($segment === null || empty($segment['enable_all_users'])) {
                throw new Exception(Piwik::translate('GroupPermissions_ExceptionReportSegmentNotCopyable'));
            }
        }

        return $row;
    }

    /**
     * Copies the report to the given users, who must exist and have view access to the website of the report
     * (see canReceiveCopy).
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

        $scheduledReportsModel = new ScheduledReportsModel();
        $copiedTo = [];
        foreach ($logins as $login) {
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
     * Whether the user can get a copy of a report of the website: an active user (not only invited) with view
     * access to the website, including access through groups.
     */
    public function canReceiveCopy(string $login, int $idSite): bool {
        if ($login === '' || $login === 'anonymous') {
            return false;
        }

        $user = (new UsersModel())->getUser($login);
        if (!is_array($user) || !$user || !empty($user['invite_token'])) {
            return false; // deleted or only invited
        }

        if (!empty($user['superuser_access'])) {
            return true;
        }

        // this plugin's Access (see config/config.php): includes the access users get through groups
        $access = \Piwik\Access::getInstance();
        if (!($access instanceof Access)) {
            return false;
        }
        foreach ($access->getRawSitesWithSomeViewAccess($login) as $siteAccess) {
            if ($siteAccess['idsite'] === $idSite) {
                return true;
            }
        }

        return false;
    }
}
