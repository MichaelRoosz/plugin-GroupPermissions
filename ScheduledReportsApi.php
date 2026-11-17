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
use Piwik\Access;
use Piwik\API\Request;
use Piwik\Piwik;
use Piwik\Plugins\ScheduledReports\API as CoreScheduledReportsAPI;

/**
 * Replaces the API of Matomo's ScheduledReports plugin (see config/config.php) to give the members of a group
 * shared ownership of the email reports shared with the group.
 *
 * Matomo only lets the creator of a report (and super users) see and change it. For a report shared with a
 * group of the current user, this class
 * - adds the report to `getReports` (used by the "Email reports" page, the API and internally), as long as the
 *   user has view access to the website of the report,
 * - lets the user update, send, download and delete it.
 *
 * Reports with data of other websites (see ReportSharing::CROSS_SITE_REPORTS) are never available to members.
 *
 * Changes are made with the user's own login, so Matomo's events (e.g. an activity log) record who changed the
 * report; the report keeps its creator. The core methods only accept reports of the current user and validate a
 * segment by loading it as the current user (which fails for a private segment of the creator), so they run
 * with super user access for these reports. Before that, everything that super user access would skip is
 * checked for the current user: view access to the website, the requested reports and a changed segment.
 */
class ScheduledReportsApi extends CoreScheduledReportsAPI {
    /** Matomo's period for reports that are only sent manually ("Send now") */
    private const PERIOD_NEVER = 'never';

    /**
     * @var ?ReportSharing
     */
    private $sharing = null;

    /**
     * @var bool $isSendingReport
     */
    private $isSendingReport = false;

    /**
     * @see CoreScheduledReportsAPI::getReports()
     *
     * @param bool|int $idSite
     * @param bool|string $period
     * @param bool|int $idReport
     * @param bool $ifSuperUserReturnOnlySuperUserReports
     * @param bool|int $idSegment
     *
     * @return array<mixed>
     */
    public function getReports($idSite = false, $period = false, $idReport = false, $ifSuperUserReturnOnlySuperUserReports = false, $idSegment = false): array {
        $reports = $this->getOwnAndSharedReports($idSite, $period, $idReport, $ifSuperUserReturnOnlySuperUserReports, $idSegment);

        return $this->isSendingReport ? $this->withSendableSchedule($reports) : $reports;
    }

    /**
     * @see CoreScheduledReportsAPI::updateReport()
     *
     * @param int $idReport
     * @param int $idSite
     * @param string $description
     * @param string $period
     * @param int $hour
     * @param string $reportType
     * @param string $reportFormat
     * @param array<mixed> $reports
     * @param array<mixed> $parameters
     * @param bool|int $idSegment
     * @param string $evolutionPeriodFor
     * @param int|null $evolutionPeriodN
     * @param string|null $periodParam
     */
    public function updateReport(
        $idReport,
        $idSite,
        $description,
        $period,
        $hour,
        $reportType,
        $reportFormat,
        $reports,
        $parameters,
        $idSegment = false,
        $evolutionPeriodFor = 'prev',
        $evolutionPeriodN = null,
        $periodParam = null
    ): void {
        // also for the creator: recipients added by members would otherwise get data of other websites
        if (
            is_numeric($idReport)
            && ReportSharing::containsCrossSiteReport($reports)
            && $this->getSharing()->isShared((int) $idReport)
        ) {
            throw new Exception(Piwik::translate('GroupPermissions_ExceptionCrossSiteReportNotShareable'));
        }

        $sharedReport = $this->getSharedReport($idReport);
        if ($sharedReport !== null) {
            Piwik::checkUserHasViewAccess($idSite);

            // like the core method: the report must belong to the given website
            if (!is_numeric($idSite) || (int) $idSite !== $this->intValue($sharedReport, 'idsite')) {
                throw new Exception("Requested report couldn't be found.");
            }

            // a shared report stays an email report: other types have recipients of the creator
            if ($reportType !== ReportSharing::REPORT_TYPE) {
                throw new Exception(Piwik::translate('GroupPermissions_ExceptionReportTypeNotShareable'));
            }

            $this->checkRequestedReportsAvailable($idSite, $reportType, $reports);
            $this->checkSegmentCanBeUsed($idSegment, $sharedReport);
        }

        $update = function () use (
            $idReport,
            $idSite,
            $description,
            $period,
            $hour,
            $reportType,
            $reportFormat,
            $reports,
            $parameters,
            $idSegment,
            $evolutionPeriodFor,
            $evolutionPeriodN,
            $periodParam
        ): void {
            parent::updateReport(
                $idReport,
                $idSite,
                $description,
                $period,
                $hour,
                $reportType,
                $reportFormat,
                $reports,
                $parameters,
                $idSegment,
                $evolutionPeriodFor,
                $evolutionPeriodN,
                $periodParam
            );
        };

        if ($sharedReport !== null) {
            $this->runAsSuperUser($update);
        } else {
            $update();
        }
    }

    /**
     * @see CoreScheduledReportsAPI::deleteReport()
     *
     * @param int $idReport
     *
     * @return mixed
     */
    public function deleteReport($idReport) {
        $delete = function () use ($idReport) {
            return parent::deleteReport($idReport);
        };

        $result = $this->getSharedReport($idReport) !== null ? $this->runAsSuperUser($delete) : $delete();

        if (is_numeric($idReport)) {
            $this->getSharing()->removeAllSharesOfReport((int) $idReport);
        }

        return $result;
    }

    /**
     * @see CoreScheduledReportsAPI::generateReport()
     *
     * @param int $idReport
     * @param string $date
     * @param bool|string $language
     * @param bool|int $outputType
     * @param bool|string $period
     * @param bool|string $reportFormat
     * @param bool|array<mixed> $parameters
     *
     * @return mixed
     */
    public function generateReport(
        $idReport,
        $date,
        $language = false,
        $outputType = false,
        $period = false,
        $reportFormat = false,
        $parameters = false
    ) {
        $generate = function () use ($idReport, $date, $language, $outputType, $period, $reportFormat, $parameters) {
            return parent::generateReport($idReport, $date, $language, $outputType, $period, $reportFormat, $parameters);
        };

        return $this->getSharedReport($idReport) !== null ? $this->runAsSuperUser($generate) : $generate();
    }

    /**
     * @see CoreScheduledReportsAPI::sendReport()
     *
     * Reports scheduled "never" are sent like daily reports (see withSendableSchedule()).
     *
     * @param int $idReport
     * @param bool|string $period
     * @param bool|string $date
     * @param bool $force
     */
    public function sendReport($idReport, $period = false, $date = false, $force = false): void {
        $send = function () use ($idReport, $period, $date, $force): void {
            parent::sendReport($idReport, $period, $date, $force);
        };

        $isShared = $this->getSharedReport($idReport) !== null;

        $this->isSendingReport = true;

        try {
            if ($isShared) {
                $this->runAsSuperUser($send);
            } else {
                $send();
            }
        } finally {
            $this->isSendingReport = false;
        }
    }

    /**
     * @param bool|int $idSite
     * @param bool|string $period
     * @param bool|int $idReport
     * @param bool $ifSuperUserReturnOnlySuperUserReports
     * @param bool|int $idSegment
     *
     * @return array<mixed>
     */
    private function getOwnAndSharedReports($idSite, $period, $idReport, $ifSuperUserReturnOnlySuperUserReports, $idSegment): array {
        $sharedIds = $this->getSharing()->getReportsSharedWithCurrentUser((bool) $ifSuperUserReturnOnlySuperUserReports);

        $isSharedReportRequested = !empty($idReport) && is_numeric($idReport) && isset($sharedIds[(int) $idReport]);
        if (
            !$sharedIds
            || (!empty($idReport) && !$isSharedReportRequested)
            || (!empty($idSite) && !is_numeric($idSite)) // invalid, left to the core method
        ) {
            return parent::getReports($idSite, $period, $idReport, $ifSuperUserReturnOnlySuperUserReports, $idSegment);
        }

        // the checks the core method does for the current user (shared reports are loaded as super user)
        Piwik::checkUserHasSomeViewAccess();
        if (!empty($idSite)) {
            Piwik::checkUserHasViewAccess((int) $idSite);
        }

        // a requested shared report is never one of the user's own reports
        $ownReports = $isSharedReportRequested
            ? []
            : parent::getReports($idSite, $period, $idReport, $ifSuperUserReturnOnlySuperUserReports, $idSegment);

        $sharedReports = $this->getSharedReports($sharedIds, $idSite, $period, $isSharedReportRequested ? (int) $idReport : false, $idSegment);

        if ($isSharedReportRequested && !$sharedReports) {
            throw new Exception("Requested report couldn't be found.");
        }

        return array_merge($ownReports, $sharedReports);
    }

    /**
     * While a report is sent, reports scheduled "never" (only sent manually with "Send now") are treated as daily
     * reports, like Matomo already does for their data period. Matomo uses the schedule as a period to determine
     * the default date (5.1: an invalid date) and, since 5.x, to prevent sending a report twice, which fails for
     * "never" ("The period 'never' is not supported"), so "Send now" did not work for these reports at all.
     *
     * @param array<mixed> $reports
     *
     * @return array<mixed>
     */
    private function withSendableSchedule(array $reports): array {
        foreach ($reports as &$report) {
            if (is_array($report) && ($report['period'] ?? null) === self::PERIOD_NEVER) {
                $report['period'] = 'day';
            }
        }
        unset($report);

        return $reports;
    }

    private function getSharing(): ReportSharing {
        if ($this->sharing === null) {
            $this->sharing = new ReportSharing(new Model());
        }

        return $this->sharing;
    }

    /**
     * Returns the report if it is shared with a group of the current user, is not one of the user's own reports
     * and the user has view access to its website, otherwise null (the core method handles the request then).
     *
     * @param mixed $idReport
     *
     * @return ?array<mixed>
     */
    private function getSharedReport($idReport): ?array {
        if (!is_numeric($idReport)) {
            return null;
        }

        $sharedIds = $this->getSharing()->getReportsSharedWithCurrentUser(false);
        if (!isset($sharedIds[(int) $idReport])) {
            return null;
        }

        $reports = $this->getSharedReports($sharedIds, false, false, (int) $idReport, false);

        return $reports[0] ?? null;
    }

    /**
     * Loads the shared reports matching the filters the current user has view access to.
     *
     * @param array<int, true> $sharedIds
     * @param bool|int $idSite
     * @param bool|string $period
     * @param false|int $idReport
     * @param bool|int $idSegment
     *
     * @return array<array<mixed>>
     */
    private function getSharedReports(array $sharedIds, $idSite, $period, $idReport, $idSegment): array {
        $login = Piwik::getCurrentUserLogin();

        try {
            $reports = $this->runAsSuperUser(function () use ($idSite, $period, $idReport, $idSegment) {
                return parent::getReports($idSite, $period, $idReport, false, $idSegment);
            });
        } catch (Exception $e) {
            if ($idReport === false) {
                throw $e;
            }

            // e.g. deleted in the meantime
            return [];
        }

        $sharedReports = [];
        foreach (is_array($reports) ? $reports : [] as $report) {
            if (
                is_array($report)
                && isset($sharedIds[$this->intValue($report, 'idreport')])
                && ($report['login'] ?? null) !== $login
                && ($report['type'] ?? null) === ReportSharing::REPORT_TYPE
                // shared before such reports could not be shared: members must not get data of other websites
                && !ReportSharing::containsCrossSiteReport($report['reports'] ?? null)
                && Piwik::isUserHasViewAccess($this->intValue($report, 'idsite'))
            ) {
                $sharedReports[] = $report;
            }
        }

        return $sharedReports;
    }

    /**
     * The core method validates the requested reports with super user access, so check them for the current user.
     *
     * @param mixed $idSite
     * @param mixed $reportType
     * @param mixed $reports
     */
    private function checkRequestedReportsAvailable($idSite, $reportType, $reports): void {
        if (!is_array($reports)) {
            return; // rejected by the core method
        }

        if (!self::allowMultipleReports($reportType)) {
            // like the core method, which ignores all others
            $reports = array_slice($reports, 0, 1);
        }

        $availableReportIds = [];
        $metadata = self::getReportMetadata($idSite, $reportType);
        foreach (is_array($metadata) ? $metadata : [] as $reportMetadata) {
            if (is_array($reportMetadata) && is_string($reportMetadata['uniqueId'] ?? null)) {
                $availableReportIds[$reportMetadata['uniqueId']] = true;
            }
        }

        foreach ($reports as $report) {
            if (!is_string($report) || !isset($availableReportIds[$report])) {
                $reportName = is_scalar($report) ? (string) $report : '';

                throw new Exception("Report $reportName is unknown or not available for report type '" . ReportSharing::REPORT_TYPE . "'.");
            }
        }
    }

    /**
     * The segment of the report can be kept (the creator chose it). Another segment must be visible to the current
     * user, which includes segments shared with a group of the user.
     *
     * @param mixed $idSegment
     * @param array<mixed> $report
     */
    private function checkSegmentCanBeUsed($idSegment, array $report): void {
        if (empty($idSegment) || !is_numeric($idSegment) || (int) $idSegment === $this->intValue($report, 'idsegment')) {
            return; // no segment, unchanged, or rejected by the core method
        }

        try {
            $segment = Request::processRequest('SegmentEditor.get', ['idSegment' => (int) $idSegment]);
        } catch (Exception $e) {
            $segment = null;
        }

        if (empty($segment)) {
            throw new Exception('Segment with id ' . (int) $idSegment . ' does not exist or SegmentEditor is not activated.');
        }
    }

    /**
     * Runs the callback with super user access (keeping the login of the current user). The core caches reports
     * per request without distinguishing users, so the cache is cleared before and after: otherwise the super user
     * result could be returned to the current user later, or a cached result of the current user be used here.
     *
     * @return mixed
     */
    private function runAsSuperUser(callable $callback) {
        self::$cache = [];

        try {
            return Access::doAsSuperUser($callback);
        } finally {
            self::$cache = [];
        }
    }

    /**
     * @param array<mixed> $row
     */
    private function intValue(array $row, string $column): int {
        return is_numeric($row[$column] ?? null) ? (int) $row[$column] : 0;
    }
}
