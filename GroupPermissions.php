<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Access\CapabilitiesProvider;
use Piwik\Container\StaticContainer;
use Piwik\Log\LoggerInterface;
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
            'SitesManager.addSite.end'               => 'addSite',
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
        $translations[] = 'Dashboard_DashboardCopied';
        $translations[] = 'General_Actions';
        $translations[] = 'General_Cancel';
        $translations[] = 'General_Edit';
        $translations[] = 'General_Help';
        $translations[] = 'General_No';
        $translations[] = 'General_Save';
        $translations[] = 'General_Settings';
        $translations[] = 'General_Username';
        $translations[] = 'General_Website';
        $translations[] = 'General_Yes';
        $translations[] = 'GroupPermissions_AccessUpdated';
        $translations[] = 'GroupPermissions_AddAutoAccessRule';
        $translations[] = 'GroupPermissions_AddAutoAccessRuleButton';
        $translations[] = 'GroupPermissions_AddCapability';
        $translations[] = 'GroupPermissions_AddUserToGroup';
        $translations[] = 'GroupPermissions_AddUserToGroupButton';
        $translations[] = 'GroupPermissions_AllWebsitesNote';
        $translations[] = 'GroupPermissions_ApplyAutoAccessRule';
        $translations[] = 'GroupPermissions_ApplyAutoAccessRuleConfirm';
        $translations[] = 'GroupPermissions_AutoAccess';
        $translations[] = 'GroupPermissions_AutoAccessCapabilitiesHelp';
        $translations[] = 'GroupPermissions_AutoAccessDescription';
        $translations[] = 'GroupPermissions_AutoAccessRuleAdded';
        $translations[] = 'GroupPermissions_AutoAccessRuleApplied';
        $translations[] = 'GroupPermissions_AutoAccessRuleRemoved';
        $translations[] = 'GroupPermissions_BackToGroups';
        $translations[] = 'GroupPermissions_CapabilityAdded';
        $translations[] = 'GroupPermissions_CapabilityRemoved';
        $translations[] = 'GroupPermissions_ChangeAccessToAllSitesConfirm';
        $translations[] = 'GroupPermissions_CreateNewGroup';
        $translations[] = 'GroupPermissions_CreateNewGroupButton';
        $translations[] = 'GroupPermissions_DashboardCopiedToGroup';
        $translations[] = 'GroupPermissions_DeleteGroup';
        $translations[] = 'GroupPermissions_DeleteGroupButton';
        $translations[] = 'GroupPermissions_DeleteGroupConfirm';
        $translations[] = 'GroupPermissions_DeleteGroupDescription';
        $translations[] = 'GroupPermissions_DescriptionAccessTab';
        $translations[] = 'GroupPermissions_DescriptionGroupsTab';
        $translations[] = 'GroupPermissions_EditGroup';
        $translations[] = 'GroupPermissions_ExceptionGroupDoesNotExist';
        $translations[] = 'GroupPermissions_ExistingSiteGroups';
        $translations[] = 'GroupPermissions_GiveAccess';
        $translations[] = 'GroupPermissions_GiveAccessButton';
        $translations[] = 'GroupPermissions_Group';
        $translations[] = 'GroupPermissions_GroupCreated';
        $translations[] = 'GroupPermissions_GroupDeleted';
        $translations[] = 'GroupPermissions_GroupName';
        $translations[] = 'GroupPermissions_GroupNameHelp';
        $translations[] = 'GroupPermissions_GroupRenamed';
        $translations[] = 'GroupPermissions_Groups';
        $translations[] = 'GroupPermissions_IncludedInGroupRole';
        $translations[] = 'GroupPermissions_InviteUser';
        $translations[] = 'GroupPermissions_InviteUserButton';
        $translations[] = 'GroupPermissions_InviteUserDescription';
        $translations[] = 'GroupPermissions_InviteUserIntoGroup';
        $translations[] = 'GroupPermissions_InviteUserSuccess';
        $translations[] = 'GroupPermissions_ManageGroups';
        $translations[] = 'GroupPermissions_MatchType';
        $translations[] = 'GroupPermissions_MatchTypeSiteGroup';
        $translations[] = 'GroupPermissions_MatchTypeUrl';
        $translations[] = 'GroupPermissions_MemberAdded';
        $translations[] = 'GroupPermissions_MemberRemoved';
        $translations[] = 'GroupPermissions_Members';
        $translations[] = 'GroupPermissions_NoAutoAccessRules';
        $translations[] = 'GroupPermissions_NoGroups';
        $translations[] = 'GroupPermissions_NoGroupsFound';
        $translations[] = 'GroupPermissions_NoMembers';
        $translations[] = 'GroupPermissions_NoUsersFound';
        $translations[] = 'GroupPermissions_NoWebsiteAccess';
        $translations[] = 'GroupPermissions_Pattern';
        $translations[] = 'GroupPermissions_PatternHelpSiteGroup';
        $translations[] = 'GroupPermissions_PatternHelpUrl';
        $translations[] = 'GroupPermissions_RemoveAccess';
        $translations[] = 'GroupPermissions_RemoveAccessConfirm';
        $translations[] = 'GroupPermissions_RemoveAutoAccessRule';
        $translations[] = 'GroupPermissions_RemoveAutoAccessRuleConfirm';
        $translations[] = 'GroupPermissions_RemoveCapability';
        $translations[] = 'GroupPermissions_RemoveCapabilityConfirm';
        $translations[] = 'GroupPermissions_RemoveFromGroup';
        $translations[] = 'GroupPermissions_RemoveFromGroupConfirm';
        $translations[] = 'GroupPermissions_RenameGroup';
        $translations[] = 'GroupPermissions_RolesOfGroupsFor';
        $translations[] = 'GroupPermissions_SearchGroups';
        $translations[] = 'GroupPermissions_SelectNewUser';
        $translations[] = 'GroupPermissions_SelectWebsite';
        $translations[] = 'GroupPermissions_Users';
        $translations[] = 'GroupPermissions_WebsiteAccess';
        $translations[] = 'GroupPermissions_Websites';
        $translations[] = 'UsersManager_Active';
        $translations[] = 'UsersManager_ApplyToAllWebsites';
        $translations[] = 'UsersManager_Capabilities';
        $translations[] = 'UsersManager_CapabilitiesHelp';
        $translations[] = 'UsersManager_Email';
        $translations[] = 'UsersManager_Expired';
        $translations[] = 'UsersManager_InviteNewUser';
        $translations[] = 'UsersManager_Pending';
        $translations[] = 'UsersManager_PrivNone';
        $translations[] = 'UsersManager_Role';
        $translations[] = 'UsersManager_Status';
    }

    /**
     * Give groups access to a new website according to their automatic access rules
     */
    public function addSite(int $idSite): void {
        try {
            $capabilityProvider = StaticContainer::get(CapabilitiesProvider::class);
            if ($capabilityProvider instanceof CapabilitiesProvider) {
                $autoAccess = new AutoAccess(new Model(), $capabilityProvider);
                $autoAccess->applyToSite($idSite);
            }
        } catch (\Throwable $e) {
            // never break creating a website, e.g. while the database update of this plugin is still pending
            $logger = StaticContainer::get(LoggerInterface::class);
            if ($logger instanceof LoggerInterface) {
                $logger->warning(
                    'GroupPermissions: could not apply the automatic access rules to website {idSite}: {message}',
                    ['idSite' => $idSite, 'message' => $e->getMessage()]
                );
            }
        }
    }

    /**
     * Delete group preferences associated with a particular site
     */
    public function deleteSite(int $idSite): void {
        $model = new Model();
        $model->removeAllPermissionsForSite($idSite);
        $model->removeAllCapabilitiesForSite($idSite);
    }

    /**
     * Delete group preferences associated with a particular user
     */
    public function deleteUser(string $login): void {
        $model = new Model();
        $model->removeUserFromAllGroups($login);
    }
}
