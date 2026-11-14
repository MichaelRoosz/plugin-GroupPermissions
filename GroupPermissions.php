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

class GroupPermissions extends Plugin {
    public function install(): void {
        $model = new Model();
        $model->install();
    }

    public function uninstall(): void {
        $model = new Model();
        $model->uninstall();
    }

    /**
     * @see Piwik\Plugin::registerEvents
     *
     * @return array<string, string>
     */
    public function registerEvents(): array {
        return [
            'AssetManager.getJavaScriptFiles'        => 'getJavaScriptFiles',
            'AssetManager.getStylesheetFiles'        => 'getStylesheetFiles',
            'SitesManager.deleteSite.end'            => 'deleteSite',
            'UsersManager.deleteUser'                => 'deleteUser',
            'Translate.getClientSideTranslationKeys' => 'getClientSideTranslationKeys',
        ];
    }

    /**
     * Return list of plug-in specific JavaScript files to be imported by the asset manager
     *
     * @see Piwik\AssetManager
     *
     * @param array<string> $jsFiles
     */
    public function getJavaScriptFiles(array &$jsFiles): void {
        $jsFiles[] = 'plugins/GroupPermissions/javascripts/copyDashboardToGroup.js';
    }

    /**
     * Return list of plug-in specific Stylesheet files to be imported by the asset manager
     *
     * @see Piwik\AssetManager
     *
     * @param array<string> $stylesheetFiles
     */
    public function getStylesheetFiles(array &$stylesheetFiles): void {
        $stylesheetFiles[] = 'plugins/GroupPermissions/stylesheets/vue-multiselect.css';
        $stylesheetFiles[] = 'plugins/GroupPermissions/stylesheets/groupPermissions.less';
    }

    /**
     * @param array<string> $translations
     */
    public function getClientSideTranslationKeys(array &$translations): void {
        $translations[] = 'GroupPermissions_AddUserToGroup';
        $translations[] = 'GroupPermissions_AddUserToGroupButton';
        $translations[] = 'GroupPermissions_ChangeAccessToAllSitesConfirm';
        $translations[] = 'GroupPermissions_CreateNewGroup';
        $translations[] = 'GroupPermissions_CreateNewGroupButton';
        $translations[] = 'GroupPermissions_DashboardCopiedToGroup';
        $translations[] = 'GroupPermissions_DeleteGroup';
        $translations[] = 'GroupPermissions_DeleteGroupButton';
        $translations[] = 'GroupPermissions_DeleteGroupConfirm';
        $translations[] = 'GroupPermissions_DescriptionAccessTab';
        $translations[] = 'GroupPermissions_DescriptionGroupsTab';
        $translations[] = 'GroupPermissions_ExceptionGroupDoesExist';
        $translations[] = 'GroupPermissions_ExceptionGroupDoesNotExist';
        $translations[] = 'GroupPermissions_ExceptionNoGroupSelected';
        $translations[] = 'GroupPermissions_ExceptionUserAlreadyInGroup';
        $translations[] = 'GroupPermissions_Group';
        $translations[] = 'GroupPermissions_Groups';
        $translations[] = 'GroupPermissions_GroupPermissions';
        $translations[] = 'GroupPermissions_InviteUser';
        $translations[] = 'GroupPermissions_InviteUserButton';
        $translations[] = 'GroupPermissions_InviteUserDescription';
        $translations[] = 'GroupPermissions_InviteUserSuccess';
        $translations[] = 'GroupPermissions_ManageAccess';
        $translations[] = 'GroupPermissions_ManageGroup';
        $translations[] = 'GroupPermissions_ManageGroupMembers';
        $translations[] = 'GroupPermissions_ManageGroups';
        $translations[] = 'GroupPermissions_MenuGroupPermissions';
        $translations[] = 'GroupPermissions_RemoveFromGroup';
        $translations[] = 'GroupPermissions_RemoveFromGroupConfirm';
        $translations[] = 'GroupPermissions_RenameGroup';
        $translations[] = 'GroupPermissions_RenameGroupButton';
        $translations[] = 'GroupPermissions_RenameGroupConfirm';
        $translations[] = 'GroupPermissions_SelectGroups';
        $translations[] = 'GroupPermissions_SelectNewUser';
        $translations[] = 'GroupPermissions_Users';

        $translations[] = 'UsersManager_ApplyToAllWebsites';
        $translations[] = 'UsersManager_PrivNone';
        $translations[] = 'UsersManager_PrivView';
        $translations[] = 'UsersManager_PrivWrite';
        $translations[] = 'UsersManager_PrivAdmin';

        $translations[] = 'UsersManager_Email';

        $translations[] = 'Dashboard_DashboardCopied';

        $translations[] = 'General_Username';
        $translations[] = 'General_Yes';
        $translations[] = 'General_No';
    }

    /**
     * Delete group preferences associated with a particular site
     */
    public function deleteSite(int $idSite): void {
        $model = new Model();
        $model->removeAllPermissionsForSite($idSite);
    }

    /**
     * Delete group preferences associated with a particular user
     */
    public function deleteUser(string $login): void {
        $model = new Model();
        $model->removeUserFromAllGroups($login);
    }
}
