<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Piwik;
use Piwik\Plugin\ControllerAdmin;
use Piwik\Request;
use Piwik\View;

class Controller extends ControllerAdmin {
    public function __construct() {
        parent::__construct();
    }

    /**
     * The "Manage Users and Permissions" Admin UI screen
     */
    public function index(): string {
        Piwik::checkUserIsNotAnonymous();
        Piwik::checkUserHasSomeAdminAccess();
        GroupPermissions::dieIfGroupsAdminIsDisabled();

        $view = new View('@GroupPermissions/index');

        $activeTab = Request::fromRequest()->getStringParameter('show', 'access');

        $validTabs = ['access', 'groups'];
        if (!in_array($activeTab, $validTabs, true)) {
            $activeTab = 'access';
        }

        $view->assign('activeTab', $activeTab);

        $this->setBasicVariablesView($view);

        return $view->render();
    }
}
