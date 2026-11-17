<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Common;
use Piwik\Container\StaticContainer;
use Piwik\Db;
use Piwik\Log\LoggerInterface;
use Piwik\Piwik;
use Piwik\Plugin\Manager as PluginManager;
use Piwik\Plugins\GroupPermissions\Dao\Rows;
use Piwik\Plugins\ScheduledReports\API as CoreScheduledReportsAPI;
use Piwik\Plugins\UsersManager\Model as UsersModel;

/**
 * Shared ownership of scheduled reports: the members of a group a report is shared with can manage it like
 * its creator (see ScheduledReportsApi).
 *
 * Only email reports can be shared: other report types store recipients that belong to the creator (e.g. the
 * phone numbers of SMS reports, which Matomo drops when another user saves the report).
 */
class ReportSharing {
    public const REPORT_TYPE = 'email';

    /**
     * Reports with data of other websites than the website of the scheduled report. Matomo limits them to the
     * websites of the report's creator (or not at all for super users), not of the member managing a shared report,
     * so they would show members data of websites they have no access to. Reports containing one cannot be shared,
     * and they cannot be added to a shared report.
     */
    public const CROSS_SITE_REPORTS = ['MultiSites_getAll'];

    /**
     * @var Model
     */
    private $model;

    public function __construct(Model $model) {
        $this->model = $model;
    }

    public static function isScheduledReportsActivated(): bool {
        return PluginManager::getInstance()->isPluginActivated('ScheduledReports');
    }

    /**
     * Returns a scheduled report that is not deleted and whose website exists, or null.
     *
     * @return ?array{
     *   idreport: int,
     *   idsite: int,
     *   login: string,
     *   description: string,
     *   type: string,
     *   reports: array<mixed>
     * }
     */
    public static function getStoredReport(int $idReport): ?array {
        $row = Rows::row(Db::fetchRow(
            'SELECT r.idreport, r.idsite, r.login, r.description, r.type, r.reports FROM `' . Common::prefixTable('report') . '` r
                INNER JOIN `' . Common::prefixTable('site') . '` s ON s.idsite = r.idsite
                WHERE r.idreport = ? AND r.deleted = 0',
            [$idReport]
        ));

        if ($row === null) {
            return null;
        }

        return [
            'idreport' => Rows::int($row, 'idreport'),
            'idsite' => Rows::int($row, 'idsite'),
            'login' => Rows::string($row, 'login'),
            'description' => Rows::string($row, 'description'),
            'type' => Rows::string($row, 'type'),
            'reports' => self::decodeReports($row['reports'] ?? null),
        ];
    }

    /**
     * Whether the list of reports (unique IDs like `VisitsSummary_get`) contains a report with data of other websites
     *
     * @param mixed $reports
     */
    public static function containsCrossSiteReport($reports): bool {
        if (is_string($reports)) {
            $reports = self::decodeReports($reports);
        }
        if (!is_array($reports)) {
            return false;
        }

        foreach ($reports as $report) {
            if (is_string($report) && in_array($report, self::CROSS_SITE_REPORTS, true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param mixed $reports the `reports` column (JSON list)
     *
     * @return array<mixed>
     */
    private static function decodeReports($reports): array {
        if (!is_string($reports) || $reports === '') {
            return [];
        }

        $decoded = json_decode($reports, true);

        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Whether the report is shared with at least one group
     */
    public function isShared(int $idReport): bool {
        return $this->model->getGroupsOfReport($idReport) !== [];
    }

    /**
     * IDs of the reports shared with a group of the current user, without the user's own reports. Empty if
     * group sharing does not apply to the current user: the anonymous user, and super users unless only their
     * own reports are requested (otherwise they get all reports anyway).
     *
     * @return array<int, true> report IDs as keys
     */
    public function getReportsSharedWithCurrentUser(bool $superUserOnlyOwnReports): array {
        if (Piwik::isUserIsAnonymous() || (Piwik::hasUserSuperUserAccess() && !$superUserOnlyOwnReports)) {
            return [];
        }

        try {
            $ids = $this->model->getReportsSharedWithUser(Piwik::getCurrentUserLogin(), self::REPORT_TYPE);
        } catch (\Throwable $e) {
            // never break Matomo's scheduled reports, e.g. while the database update of this plugin is pending
            self::logWarning('could not read the scheduled reports shared with groups: {message}', $e);

            return [];
        }

        return array_fill_keys($ids, true);
    }

    public function removeAllSharesOfReport(int $idReport): void {
        try {
            $this->model->removeAllSharesOfReport($idReport);
        } catch (\Throwable $e) {
            // only a cleanup, shares of deleted reports are ignored anyway
            self::logWarning('could not remove the group shares of a deleted scheduled report: {message}', $e);
        }
    }

    /**
     * Keeps the shared reports of a deleted user: Matomo deletes all reports of a deleted user, so each report shared
     * with a group is handed over to a member of these groups who can access its website (the first by login; an
     * active user, not an invited one). Reports without such a member are deleted by Matomo as before.
     * A private segment of the deleted user that a transferred report uses goes to the new owner as well (see
     * ReportSegmentTransfer), otherwise Matomo would give it to a super user and the new owner could no longer edit,
     * send or download the report.
     * Must run before the ScheduledReports plugin handles the deletion of the user.
     */
    public function transferReportsOfDeletedUser(string $login): void {
        if (!self::isScheduledReportsActivated()) {
            return;
        }

        try {
            $usersModel = new UsersModel();
            // this plugin's Access (see config/config.php): includes the access users get through groups
            $access = \Piwik\Access::getInstance();
            if (!($access instanceof Access)) {
                return;
            }

            $segmentTransfer = new ReportSegmentTransfer($this->model, $login);

            foreach ($this->model->getSharedReportsOfUser($login, self::REPORT_TYPE) as $report) {
                $newOwner = $this->findNewOwner($report['idreport'], $report['idsite'], $login, $usersModel, $access);
                if ($newOwner === null) {
                    continue;
                }

                $this->model->setReportOwner($report['idreport'], $newOwner);
                self::log('info', 'transferred the scheduled report {idReport} of the deleted user {from} to {to}', [
                    'idReport' => $report['idreport'],
                    'from' => $login,
                    'to' => $newOwner,
                ]);

                $segmentTransfer->transfer($report['idreport'], $report['idsegment'], $newOwner);
            }

            CoreScheduledReportsAPI::$cache = [];
        } catch (\Throwable $e) {
            // never break deleting a user, e.g. while the database update of this plugin is pending
            self::logWarning('could not transfer the shared scheduled reports of a deleted user: {message}', $e);
        }
    }

    private function findNewOwner(int $idReport, int $idSite, string $deletedLogin, UsersModel $usersModel, Access $access): ?string {
        foreach ($this->model->getMembersOfGroupsOfReport($idReport) as $member) {
            if ($member === $deletedLogin || $member === 'anonymous') {
                continue;
            }

            $user = $usersModel->getUser($member);
            if (!is_array($user) || !$user || !empty($user['invite_token'])) {
                continue; // deleted or only invited
            }

            if (!empty($user['superuser_access'])) {
                return $member;
            }

            foreach ($access->getRawSitesWithSomeViewAccess($member) as $siteAccess) {
                if ($siteAccess['idsite'] === $idSite) {
                    return $member;
                }
            }
        }

        return null;
    }

    /**
     * @param array<string, mixed> $context
     */
    private static function log(string $level, string $message, array $context): void {
        $logger = StaticContainer::get(LoggerInterface::class);
        if ($logger instanceof LoggerInterface) {
            $logger->log($level, 'GroupPermissions: ' . $message, $context);
        }
    }

    private static function logWarning(string $message, \Throwable $e): void {
        $logger = StaticContainer::get(LoggerInterface::class);
        if ($logger instanceof LoggerInterface) {
            $logger->warning('GroupPermissions: ' . $message, ['message' => $e->getMessage()]);
        }
    }
}
