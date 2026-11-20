<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Menu\MenuAdmin;
use Piwik\Piwik;

class Menu extends \Piwik\Plugin\Menu {
    public function configureAdminMenu(MenuAdmin $menu): void {
        // like the user management of Matomo, the page is hidden while managing groups is disabled
        if (Piwik::isUserHasSomeAdminAccess() && GroupPermissions::isGroupsAdminEnabled()) {
            $menu->addSystemItem('GroupPermissions_MenuGroupPermissions', $this->urlForAction('index'), $order = 17);
        }
    }
}
