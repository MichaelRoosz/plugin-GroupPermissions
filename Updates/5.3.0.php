<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Plugins\GroupPermissions\Dao\GroupAutoAccess;
use Piwik\Plugins\GroupPermissions\Dao\GroupCapability;
use Piwik\Plugins\GroupPermissions\Dao\GroupReport;
use Piwik\Plugins\GroupPermissions\Dao\GroupSegment;
use Piwik\Updater;
use Piwik\Updater\Migration;
use Piwik\Updater\Migration\Factory as MigrationFactory;
use Piwik\Updates as PiwikUpdates;

/**
 * Adds the tables storing the capabilities of groups (e.g. Tag Manager capabilities) and the rules giving
 * groups access to new websites, and the tables storing the segments and scheduled reports shared with groups.
 */
class Updates_5_3_0 extends PiwikUpdates {
    /**
     * @var MigrationFactory
     */
    private $migration;

    public function __construct(MigrationFactory $factory) {
        $this->migration = $factory;
    }

    /**
     * @return array<Migration>
     */
    public function getMigrations(Updater $updater) {
        return [
            $this->migration->db->createTable(GroupCapability::TABLE, GroupCapability::COLUMNS, GroupCapability::PRIMARY_KEY),
            $this->migration->db->createTable(GroupAutoAccess::TABLE, GroupAutoAccess::COLUMNS, GroupAutoAccess::PRIMARY_KEY),
            $this->migration->db->createTable(GroupSegment::TABLE, GroupSegment::COLUMNS, GroupSegment::PRIMARY_KEY),
            $this->migration->db->createTable(GroupReport::TABLE, GroupReport::COLUMNS, GroupReport::PRIMARY_KEY),
        ];
    }

    public function doUpdate(Updater $updater): void {
        $updater->executeMigrations(__FILE__, $this->getMigrations($updater));
    }
}
