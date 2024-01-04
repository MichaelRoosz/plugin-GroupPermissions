<?php
/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
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
            'AssetManager.getStylesheetFiles'        => 'getStylesheetFiles',
            'SitesManager.deleteSite.end'            => 'deleteSite',
            'UsersManager.deleteUser'                => 'deleteUser',
            'Translate.getClientSideTranslationKeys' => 'getClientSideTranslationKeys',
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
        $jsFiles[] = "plugins/GroupPermissions/javascripts/choices.min.js";
    }
    
    /**
     * Return list of plug-in specific Stylesheet files to be imported by the asset manager
     *
     * @see Piwik\AssetManager
     */
    public function getStylesheetFiles(&$stylesheetFiles)
    {
        $stylesheetFiles[] = "plugins/GroupPermissions/stylesheets/groupPermissions.less";
        $stylesheetFiles[] = "plugins/GroupPermissions/stylesheets/choices.less";
    }

    public function getClientSideTranslationKeys(&$translations)
    {
        $translations[] = 'GroupPermissions_AddUserToGroup';
        $translations[] = 'GroupPermissions_AddUserToGroupButton';
        $translations[] = 'GroupPermissions_ManageGroupMembers';
        $translations[] = 'GroupPermissions_RemoveFromGroup';
        $translations[] = 'GroupPermissions_RemoveFromGroupConfirm';
        $translations[] = 'GroupPermissions_SelectNewUser';
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
