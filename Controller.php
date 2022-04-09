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
use Piwik\API\Request;
use Piwik\Common;
use Piwik\Piwik;
use Piwik\Plugin\ControllerAdmin;
use Piwik\Site;
use Piwik\Translation\Translator;
use Piwik\View;

class Controller extends ControllerAdmin
{
    /**
     * @var Translator
     */
    private $translator;

    public function __construct(Translator $translator)
    {
        $this->translator = $translator;

        parent::__construct();
    }

    static function orderByName($a, $b)
    {
        return strcmp($a['name'], $b['name']);
    }

    /**
     * The "Manage Users and Permissions" Admin UI screen
     */
    public function index()
    {
        Piwik::checkUserIsNotAnonymous();
        Piwik::checkUserHasSomeAdminAccess();

        $view = new View('@GroupPermissions/index');

        $view->activeTab = Common::getRequestVar('show', 'access');
        $validTabs = array('access', 'groups');
        if (!in_array($view->activeTab, $validTabs)) {
           $view->activeTab = 'access'; 
        }
        
        $view->hasOnlyAdminAccess = Piwik::isUserHasSomeAdminAccess() && !Piwik::hasUserSuperUserAccess();
                
        if ($view->activeTab === 'access') {
            $this->tabAccess($view);    
        }
        else if (Piwik::hasUserSuperUserAccess()) {
            
            if ($view->activeTab === 'groups') {
                $this->tabGroups($view);   
            }
        }

        $this->setBasicVariablesView($view);   
        
        return $view->render();
    }
    
    private function tabAccess(&$view)
    {
        $IdSitesAdmin = Request::processRequest('SitesManager.getSitesIdWithAdminAccess');
        $idSiteSelected = 1;

        if (count($IdSitesAdmin) > 0) {
            $defaultWebsiteId = $IdSitesAdmin[0];
            $idSiteSelected = Common::getRequestVar('idSite', $defaultWebsiteId);
        }

        if ($idSiteSelected === 'all') {
            
            $defaultReportSiteName = $this->translator->translate('UsersManager_ApplyToAllWebsites');
            $groups = Request::processRequest('GroupPermissions.getAllGroups');
            $groupAccessByWebsite = array();
            foreach ($groups as $group) {
                $groupAccessByWebsite[$group['name']] = '';
            }
         
        } else {

            if (!Piwik::isUserHasAdminAccess($idSiteSelected) && count($IdSitesAdmin) > 0) {
                // make sure to show a website where user actually has admin access
                $idSiteSelected = $IdSitesAdmin[0];
            }

            $defaultReportSiteName = Site::getNameFor($idSiteSelected);
            $groupAccessByWebsite = Request::processRequest('GroupPermissions.getGroupAccessFromSite', array('idSite' => $idSiteSelected));
        }

        ksort($groupAccessByWebsite);

        $view->idSiteSelected = $idSiteSelected;
        $view->defaultReportSiteName = $defaultReportSiteName;
    
        $view->groupAccessByWebsite = $groupAccessByWebsite;

        $websites = Request::processRequest('SitesManager.getSitesWithAdminAccess');
        uasort($websites, array('Piwik\Plugins\GroupPermissions\Controller', 'orderByName'));
        $view->websites = $websites;
    }
    
    
    private function tabGroups(&$view)
    {
        $defaultGroupId = -1;
        $rawGroups = Request::processRequest('GroupPermissions.getAllGroups');
        $groups = array();
        
        if (!empty($rawGroups)) {
            
            $defaultGroupId = current($rawGroups)['idgroup'];
            
            foreach ($rawGroups as $group) {
                $groups[$group['idgroup']] = $group['name'];
            }
            
            asort($groups);
        }
        
        $idGroup = Common::getRequestVar('idGroup', $defaultGroupId);
        
        $view->groups = $groups;
        
        if ($idGroup > 0) {
            $rawGroupUsers = Request::processRequest('GroupPermissions.getMembersOfGroup', array('idGroup' => $idGroup));
            $groupUsers = array();
            
            if (!empty($rawGroupUsers)) {
                foreach ($rawGroupUsers as $user) {
                    $groupUsers[] = $user['login'];
                }
                
                natcasesort($groupUsers);
            }
            
            $view->groupUsers = $groupUsers;
        }
        else {
            $view->groupUsers = array();
        }
        
        $view->selectedIdGroup = $idGroup;
        $view->selectedGroupName = isset($groups[$idGroup]) ? $groups[$idGroup] : '';
    }
}
