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
    // shared ownership of scheduled reports within a group, see ScheduledReportsApi
    'Piwik\Plugins\ScheduledReports\API' => DI\autowire('Piwik\Plugins\GroupPermissions\ScheduledReportsApi'),
];
