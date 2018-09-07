<?php
/**
 * Piwik - free/libre analytics platform
 *
 * @link http://piwik.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */
namespace Piwik\Plugins\GroupPermissions;

use Piwik\Plugin;

class GroupPermissions extends Plugin
{
    public function install()
    {
        $model = new Model();
        $model->install();
    }

    public function uninstall()
    {
        $model = new Model();
        $model->uninstall();
    }
    
    /**
     * @see Piwik\Plugin::registerEvents
     */
    public function registerEvents()
    {
        return array(
            'AssetManager.getJavaScriptFiles'        => 'getJsFiles',
            'SitesManager.deleteSite.end'            => 'deleteSite',
            'UsersManager.deleteUser'                => 'deleteUser',
        );
    }
    
    /**
     * Return list of plug-in specific JavaScript files to be imported by the asset manager
     *
     * @see Piwik\AssetManager
     */
    public function getJsFiles(&$jsFiles)
    {
        $jsFiles[] = "plugins/GroupPermissions/javascripts/groupPermissions.js";
    }
    
    /**
     * Delete group preferences associated with a particular site
     */
    public function deleteSite($idSite)
    {
        $model = new Model();
        $model->removeAllPermissionsForSite($idSite);
    }

    /**
     * Delete group preferences associated with a particular user
     */
    public function deleteUser($login)
    {
        $model = new Model();
        $model->removeUserFromAllGroups($login);
    }
}

