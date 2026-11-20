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
use Piwik\Plugins\GroupPermissions\Dao\Rows;
use Piwik\Plugins\ScheduledReports\API as CoreScheduledReportsAPI;

/**
 * Keeps the scheduled reports of users who still have access to a website through a group.
 *
 * `UsersManager.setUserAccess` with "noaccess" always posts `UsersManager.removeSiteAccess`, on which the
 * ScheduledReports plugin deletes the user's reports for the websites, even if the user can still access them
 * through a group. The event parameters cannot be changed by other handlers, so this class saves the reports
 * that would be deleted wrongly before ScheduledReports handles the event, and restores them (with their IDs)
 * right after it, in an observer of the same event with lower priority (see config/config.php).
 */
class ReportKeeper {
    /**
     * @var array<array<mixed>> rows of the report table to restore
     */
    private static $keptReports = [];

    /**
     * Before ScheduledReports handles `UsersManager.removeSiteAccess`: remembers the reports of the user for the
     * websites they can still access through groups. The direct access is already removed at this point.
     *
     * @param array<mixed> $idSites
     */
    public static function keepReportsOfAccessibleSites(string $login, array $idSites): void {
        self::$keptReports = [];

        if ($login === '' || $login === 'anonymous' || !ReportCopy::isScheduledReportsActivated()) {
            return;
        }

        try {
            $removed = [];
            foreach ($idSites as $idSite) {
                if (is_numeric($idSite)) {
                    $removed[(int) $idSite] = true;
                }
            }

            $stillAccessible = [];
            foreach ((new Access())->getRawSitesWithSomeViewAccess($login) as $siteAccess) {
                if (isset($removed[$siteAccess['idsite']])) {
                    $stillAccessible[$siteAccess['idsite']] = $siteAccess['idsite'];
                }
            }
            if (!$stillAccessible) {
                return;
            }

            $stillAccessible = array_values($stillAccessible);
            self::$keptReports = Rows::list(Db::fetchAll(
                'SELECT * FROM `' . Common::prefixTable('report') . '`
                    WHERE login = ? AND idsite IN (' . Common::getSqlStringFieldsArray($stillAccessible) . ')',
                array_merge([$login], $stillAccessible)
            ));
        } catch (\Throwable $e) {
            self::$keptReports = [];
            self::logWarning('could not save the scheduled reports of {login} before its access was changed', $login, $e);
        }
    }

    /**
     * After ScheduledReports handled `UsersManager.removeSiteAccess`: restores the reports remembered by
     * keepReportsOfAccessibleSites (reports that still exist are skipped).
     */
    public static function restoreKeptReports(): void {
        $reports = self::$keptReports;
        self::$keptReports = [];
        if (!$reports) {
            return;
        }

        $table = Common::prefixTable('report');
        foreach ($reports as $report) {
            try {
                $columns = array_keys($report);
                Db::query(
                    "INSERT IGNORE INTO `$table` (`" . implode('`, `', $columns) . '`) VALUES ('
                        . Common::getSqlStringFieldsArray($columns) . ')',
                    array_values($report)
                );
            } catch (\Throwable $e) {
                $login = is_string($report['login'] ?? null) ? $report['login'] : '';
                self::logWarning('could not restore a scheduled report of {login}', $login, $e);
            }
        }

        CoreScheduledReportsAPI::$cache = [];
    }

    private static function logWarning(string $message, string $login, \Throwable $e): void {
        $logger = StaticContainer::get(LoggerInterface::class);
        if ($logger instanceof LoggerInterface) {
            $logger->warning(
                'GroupPermissions: ' . $message . ': {message}',
                ['login' => $login, 'message' => $e->getMessage()]
            );
        }
    }
}
