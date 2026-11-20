<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

return [
    'Piwik\Access' => DI\get('Piwik\Plugins\GroupPermissions\Access'),

    // a plugin can register only one handler per event: GroupPermissions::keepReportsOfAccessibleSites saves the
    // reports before the ScheduledReports plugin deletes them on this event, this observer restores them afterwards,
    // also when UsersManager.setUserAccess is called directly (not through the API proxy), e.g. by other plugins
    'observers.global' => DI\add([
        [
            'UsersManager.removeSiteAccess',
            DI\value([
                'function' => ['Piwik\Plugins\GroupPermissions\ReportKeeper', 'restoreKeptReports'],
                'after' => true,
            ]),
        ],
    ]),
];
