<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Access\RolesProvider;
use Piwik\Container\StaticContainer;
use Piwik\Piwik;
use Piwik\Plugins\UsersManager\Model as UsersModel;

/**
 * Posts Matomo's `UsersManager.removeSiteAccess` event for users who lose all access to websites through a change of
 * group permissions or memberships, like UsersManager.setUserAccess does when it removes direct access. Plugins clean
 * up the data of the user for these websites on this event, e.g. ScheduledReports deletes the user's reports.
 *
 * Only websites the user can no longer access at all count: access the user still has directly or through another
 * group is compared before and after the change. Super users are skipped, they keep access to every website.
 */
class SiteAccessLoss {
    /**
     * Runs the change and posts the event for the users who lost access to websites through it.
     *
     * @template T
     *
     * @param array<string> $logins users whose access the change may reduce
     * @param callable(): T $change
     *
     * @return T
     */
    public static function notifyAfter(array $logins, callable $change) {
        $affected = self::getAffectedLogins($logins);
        $before = self::getIdSitesWithAccess($affected);

        $result = $change();

        $after = self::getIdSitesWithAccess($affected);
        foreach ($before as $login => $idSites) {
            $lost = array_values(array_diff($idSites, $after[$login] ?? []));
            if ($lost) {
                // numeric logins become integer array keys
                Piwik::postEvent('UsersManager.removeSiteAccess', [(string) $login, $lost]);
            }
        }

        return $result;
    }

    /**
     * Existing users without super user access
     *
     * @param array<string> $logins
     *
     * @return array<string>
     */
    private static function getAffectedLogins(array $logins): array {
        $logins = array_values(array_unique(array_filter($logins, static function (string $login): bool {
            return $login !== '' && $login !== 'anonymous';
        })));
        // UsersModel::getUsers() returns all users for an empty list
        if (!$logins) {
            return [];
        }

        $users = (new UsersModel())->getUsers($logins);

        $affected = [];
        foreach (is_array($users) ? $users : [] as $user) {
            if (is_array($user) && is_string($user['login'] ?? null) && empty($user['superuser_access'])) {
                $affected[] = $user['login'];
            }
        }

        return $affected;
    }

    /**
     * Websites the users have any role for, directly or through groups (capabilities only apply with a role), in a
     * few queries for all users instead of some per user
     *
     * @param array<string> $logins
     *
     * @return array<string, array<int>> by login
     */
    private static function getIdSitesWithAccess(array $logins): array {
        if (!$logins) {
            return [];
        }

        $roleProvider = StaticContainer::get(RolesProvider::class);
        $roles = $roleProvider instanceof RolesProvider ? $roleProvider->getAllRoleIds() : ['view', 'write', 'admin'];

        return (new Model())->getIdSitesWithRoleOfUsers($logins, array_values(array_filter($roles, 'is_string')));
    }
}
