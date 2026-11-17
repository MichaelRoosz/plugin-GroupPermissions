<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Access as PiwikAccess;
use Piwik\Access\CapabilitiesProvider;
use Piwik\Container\StaticContainer;
use Piwik\Log\LoggerInterface;
use Piwik\Piwik;
use Piwik\Plugin;
use Piwik\Plugins\SitesManager\API as SitesManagerAPI;
use Piwik\Plugins\UsersManager\Model as UsersModel;
use Piwik\Plugins\UsersManager\UsersManager;

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
     * @return array<string, string|array{function: string, after?: bool, before?: bool}>
     */
    public function registerEvents(): array {
        return [
            'AssetManager.getJavaScriptFiles'        => 'getJavaScriptFiles',
            'AssetManager.getStylesheetFiles'        => 'getStylesheetFiles',
            'API.Request.intercept'                  => 'interceptApiRequest',
            'API.SegmentEditor.getAll.end'           => 'addSharedSegments',
            'API.SegmentEditor.delete.end'           => 'deleteSegment',
            'API.SitesManager.getSitesIdFromSiteUrl.end' => 'addGroupSitesFromSiteUrl',
            // integration point for login plugins (e.g. SAML): sync the groups of a user with their external groups
            'GroupPermissions.syncUserGroups'        => 'syncUserGroups',
            'Login.authenticate.successful'          => 'syncGroupsAfterLogin',
            'ScheduledReports.getReportRecipients'   => ['function' => 'fixReportRecipients', 'after' => true],
            'SitesManager.addSite.end'               => 'addSite',
            'SitesManager.deleteSite.end'            => 'deleteSite',
            // after the UsersManager plugin, which resets the list
            'Tracker.Cache.getSiteAttributes'        => ['function' => 'addGroupTrackingTokens', 'after' => true],
            // before the ScheduledReports plugin deletes the reports of the user
            'UsersManager.deleteUser'                => ['function' => 'deleteUser', 'before' => true],
            'UsersManager.addUser.end'               => 'removeStaleMemberships',
            'UsersManager.inviteUser.end'            => 'removeStaleMemberships',
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
        $translations[] = 'GroupPermissions_AddExternalGroup';
        $translations[] = 'GroupPermissions_AddExternalGroupButton';
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
        $translations[] = 'GroupPermissions_CreatedBy';
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
        $translations[] = 'GroupPermissions_ExternalGroup';
        $translations[] = 'GroupPermissions_ExternalGroupAdded';
        $translations[] = 'GroupPermissions_ExternalGroupRemoved';
        $translations[] = 'GroupPermissions_ExternalGroups';
        $translations[] = 'GroupPermissions_GiveAccess';
        $translations[] = 'GroupPermissions_GiveAccessButton';
        $translations[] = 'GroupPermissions_Group';
        $translations[] = 'GroupPermissions_GroupCreated';
        $translations[] = 'GroupPermissions_GroupDeleted';
        $translations[] = 'GroupPermissions_GroupName';
        $translations[] = 'GroupPermissions_GroupNameHelp';
        $translations[] = 'GroupPermissions_GroupRenamed';
        $translations[] = 'GroupPermissions_GroupSync';
        $translations[] = 'GroupPermissions_GroupSyncDescription';
        $translations[] = 'GroupPermissions_GroupSyncHelpNames';
        $translations[] = 'GroupPermissions_GroupSyncPlainNameWarning';
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
        $translations[] = 'GroupPermissions_NoExternalGroups';
        $translations[] = 'GroupPermissions_NoGroups';
        $translations[] = 'GroupPermissions_NoGroupsFound';
        $translations[] = 'GroupPermissions_NoMembers';
        $translations[] = 'GroupPermissions_NoSharedReports';
        $translations[] = 'GroupPermissions_NoSharedSegments';
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
        $translations[] = 'GroupPermissions_RemoveExternalGroup';
        $translations[] = 'GroupPermissions_RemoveExternalGroupConfirm';
        $translations[] = 'GroupPermissions_RemoveFromGroup';
        $translations[] = 'GroupPermissions_RemoveFromGroupConfirm';
        $translations[] = 'GroupPermissions_RenameGroup';
        $translations[] = 'GroupPermissions_ReportShared';
        $translations[] = 'GroupPermissions_ReportUnshared';
        $translations[] = 'GroupPermissions_RolesOfGroupsFor';
        $translations[] = 'GroupPermissions_ScheduledReport';
        $translations[] = 'GroupPermissions_ScheduledReports';
        $translations[] = 'GroupPermissions_ScheduledReportsDescription';
        $translations[] = 'GroupPermissions_SearchGroups';
        $translations[] = 'GroupPermissions_Segment';
        $translations[] = 'GroupPermissions_SegmentShared';
        $translations[] = 'GroupPermissions_SegmentUnshared';
        $translations[] = 'GroupPermissions_Segments';
        $translations[] = 'GroupPermissions_SegmentsDescription';
        $translations[] = 'GroupPermissions_SelectNewUser';
        $translations[] = 'GroupPermissions_SelectRoleForAllWebsites';
        $translations[] = 'GroupPermissions_SelectWebsite';
        $translations[] = 'GroupPermissions_ShareReport';
        $translations[] = 'GroupPermissions_ShareReportButton';
        $translations[] = 'GroupPermissions_ShareSegment';
        $translations[] = 'GroupPermissions_ShareSegmentButton';
        $translations[] = 'GroupPermissions_SyncedMember';
        $translations[] = 'GroupPermissions_SyncedMemberHelp';
        $translations[] = 'GroupPermissions_UnshareReport';
        $translations[] = 'GroupPermissions_UnshareReportConfirm';
        $translations[] = 'GroupPermissions_UnshareSegment';
        $translations[] = 'GroupPermissions_UnshareSegmentConfirm';
        $translations[] = 'GroupPermissions_Users';
        $translations[] = 'GroupPermissions_WebsiteAccess';
        $translations[] = 'GroupPermissions_Websites';
        $translations[] = 'UsersManager_Active';
        $translations[] = 'UsersManager_AllWebsites';
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
     * Synchronizes the group memberships of a user with the groups of an external directory. Login plugins
     * without built-in support can post this event after a user logged in, without depending on this
     * plugin:
     *
     *     Piwik::postEvent('GroupPermissions.syncUserGroups', [$login, $groupsFromIdP]);
     *
     * The user becomes a member of every group mapped to one of the external groups (see
     * `GroupPermissions.addExternalGroupMapping`) and is removed from groups an earlier sync added them to but
     * that no longer match. Memberships added manually are kept.
     *
     * @param mixed $login
     * @param mixed $externalGroups array of group names or DNs
     */
    public function syncUserGroups($login, $externalGroups): void {
        if (!is_string($login) || !is_array($externalGroups)) {
            return;
        }

        (new GroupSync(new Model()))->syncUser($login, $externalGroups);
    }

    /**
     * Group sync after a login, if enabled in the system settings: from the SAML response for users logging in
     * through the LoginSaml plugin, from the ID token for users of the LoginOIDC or RebelOIDC plugin, from LDAP for
     * users of the LoginLdap plugin
     *
     * @param mixed $login
     */
    public function syncGroupsAfterLogin($login): void {
        if (!is_string($login)) {
            return;
        }

        if (SamlGroupSync::isAvailable() && SamlGroupSync::isAssertionConsumerServiceRequest()) {
            $samlGroupSync = new SamlGroupSync(new SystemSettings(), new GroupSync(new Model()));
            $samlGroupSync->syncUserAfterLogin($login);

            return;
        }

        if (OidcGroupSync::isAvailable() && OidcGroupSync::isCallbackRequest()) {
            $oidcGroupSync = new OidcGroupSync(new SystemSettings(), new GroupSync(new Model()));
            $oidcGroupSync->syncUserAfterLogin($login);

            return;
        }

        if (LdapGroupSync::isAvailable()) {
            $ldapGroupSync = new LdapGroupSync(new SystemSettings(), new GroupSync(new Model()));
            $ldapGroupSync->syncUserAfterLogin($login);
        }
    }

    /**
     * Lets `SegmentEditor.get` return segments shared with a group of the current user
     *
     * @param mixed $returnedValue
     * @param array<string, mixed> $finalParameters
     */
    public function interceptApiRequest(&$returnedValue, $finalParameters, string $pluginName, string $methodName): void {
        if ($returnedValue !== null || $pluginName !== 'SegmentEditor' || $methodName !== 'get') {
            return;
        }

        $segment = (new SegmentSharing(new Model()))->getSharedSegment($finalParameters['idSegment'] ?? null);
        if ($segment !== null) {
            $returnedValue = $segment;
        }
    }

    /**
     * Adds the segments shared with a group of the current user to the result of `SegmentEditor.getAll`
     *
     * @param mixed $segments
     * @param array<string, mixed> $extraInfo
     */
    public function addSharedSegments(&$segments, $extraInfo): void {
        $parameters = is_array($extraInfo['parameters'] ?? null) ? $extraInfo['parameters'] : [];

        (new SegmentSharing(new Model()))->addSharedSegmentsToList($segments, $parameters['idSite'] ?? false);
    }

    /**
     * Removes the group shares of a deleted segment. Not done on "SegmentEditor.deactivate", as other plugins
     * (e.g. ScheduledReports) may still prevent the deletion there. Shares of deleted segments are ignored
     * anyway, this only cleans up.
     *
     * @param mixed $result
     * @param array<string, mixed> $extraInfo
     */
    public function deleteSegment(&$result, $extraInfo): void {
        $parameters = is_array($extraInfo['parameters'] ?? null) ? $extraInfo['parameters'] : [];
        $idSegment = $parameters['idSegment'] ?? null;

        if ($result === true && is_numeric($idSegment) && SegmentSharing::getStoredSegment((int) $idSegment) === null) {
            $model = new Model();
            $model->removeAllSharesOfSegment((int) $idSegment);
        }
    }

    /**
     * `SitesManager.getSitesIdFromSiteUrl` (used e.g. by Matomo's log importer to find the website of a URL) only
     * considers Matomo's own access table for users without super user access, so it misses websites the user has
     * access to through a group. Looks the URL up again for all websites and keeps those the user can view, which
     * includes the access through groups.
     *
     * @param mixed $result list of rows `['idsite' => id]`
     * @param array<string, mixed> $extraInfo
     */
    public function addGroupSitesFromSiteUrl(&$result, $extraInfo): void {
        // super users get all websites anyway, groups never apply to the anonymous user
        if (!is_array($result) || Piwik::hasUserSuperUserAccess() || Piwik::isUserIsAnonymous()) {
            return;
        }

        $parameters = is_array($extraInfo['parameters'] ?? null) ? $extraInfo['parameters'] : [];
        $url = $parameters['url'] ?? null;
        if (!is_string($url) || $url === '') {
            return;
        }

        try {
            $viewableIdSites = [];
            foreach (PiwikAccess::getInstance()->getSitesIdWithAtLeastViewAccess() as $idSite) {
                if (is_numeric($idSite)) {
                    $viewableIdSites[(int) $idSite] = true;
                }
            }
            if (!$viewableIdSites) {
                return;
            }

            // called directly, not through the API proxy, so this event is not posted again
            $allRows = PiwikAccess::doAsSuperUser(static function () use ($url) {
                return SitesManagerAPI::getInstance()->getSitesIdFromSiteUrl($url);
            });
            if (!is_array($allRows)) {
                return;
            }

            $rows = [];
            foreach ($allRows as $row) {
                $idSite = is_array($row) ? ($row['idsite'] ?? null) : null;
                if (is_numeric($idSite) && isset($viewableIdSites[(int) $idSite])) {
                    $rows[] = $row;
                }
            }
            $result = $rows;
        } catch (\Throwable $e) {
            // keep Matomo's result
            $logger = StaticContainer::get(LoggerInterface::class);
            if ($logger instanceof LoggerInterface) {
                $logger->warning(
                    'GroupPermissions: could not add the websites accessible through groups to the site lookup by URL: {message}',
                    ['message' => $e->getMessage()]
                );
            }
        }
    }

    /**
     * Matomo lists the current user as the recipient of "Send report to me", but the report is sent to its creator.
     * Lists the creator for reports of other users, e.g. reports shared with a group of the current user.
     *
     * @param mixed $recipients
     * @param mixed $reportType
     * @param mixed $report
     */
    public function fixReportRecipients(&$recipients, $reportType, $report): void {
        if ($reportType !== ReportSharing::REPORT_TYPE || !is_array($recipients) || !is_array($report)) {
            return;
        }

        $login = is_string($report['login'] ?? null) ? $report['login'] : '';
        $parameters = is_array($report['parameters'] ?? null) ? $report['parameters'] : [];
        if ($login === '' || $login === Piwik::getCurrentUserLogin() || empty($parameters['emailMe'])) {
            return;
        }

        // the core adds the email of the current user first
        $index = array_search(Piwik::getCurrentUserEmail(), $recipients, true);
        if ($index === false) {
            return;
        }

        $creator = (new UsersModel())->getUser($login);
        $creatorEmail = is_array($creator) && is_string($creator['email'] ?? null) ? $creator['email'] : '';

        if ($creatorEmail !== '') {
            $recipients[$index] = $creatorEmail;
        } else {
            unset($recipients[$index]);
            $recipients = array_values($recipients);
        }
    }

    /**
     * The tracker accepts a token_auth (needed e.g. to import logs, track with a custom IP or a timestamp older than
     * 24 hours) only from users with write or admin access to the website, which Matomo caches per website. Adds
     * the users who have such a role through a group.
     *
     * @param mixed $attributes
     * @param mixed $idSite
     */
    public function addGroupTrackingTokens(&$attributes, $idSite): void {
        if (!is_array($attributes) || !is_numeric($idSite) || (int) $idSite <= 0) {
            return;
        }

        try {
            $logins = array_values(array_diff(
                (new Model())->getLoginsWithRoleForSite((int) $idSite, ['write', 'admin']),
                ['anonymous']
            ));
            if (!$logins) {
                return;
            }

            $tokens = [];
            foreach (is_array($attributes['tracking_token_auth'] ?? null) ? $attributes['tracking_token_auth'] : [] as $token) {
                if (is_string($token)) {
                    $tokens[$token] = true;
                }
            }

            $hashedTokens = (new UsersModel())->getAllHashedTokensForLogins($logins);
            foreach (is_array($hashedTokens) ? $hashedTokens : [] as $tokenAuth) {
                $hash = is_string($tokenAuth) ? UsersManager::hashTrackingToken($tokenAuth, (int) $idSite) : null;
                if (is_string($hash)) {
                    $tokens[$hash] = true;
                }
            }
            $attributes['tracking_token_auth'] = array_keys($tokens);
        } catch (\Throwable $e) {
            // never break the tracker, e.g. while the database update of this plugin is still pending
            $logger = StaticContainer::get(LoggerInterface::class);
            if ($logger instanceof LoggerInterface) {
                $logger->warning(
                    'GroupPermissions: could not add the tracking tokens of group members for website {idSite}: {message}',
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
     * A new user never inherits the group memberships of a deleted user with the same login: they are left behind
     * when the user was deleted while this plugin was deactivated.
     *
     * @param mixed $login
     */
    public function removeStaleMemberships($login): void {
        if (!is_string($login) || $login === '') {
            return;
        }

        try {
            $model = new Model();
            if ($model->getMembershipsOfUser($login)) {
                $model->removeUserFromAllGroups($login);
                GroupAccessUpdater::reloadAccess();
            }
        } catch (\Throwable $e) {
            // never break creating a user, e.g. while the database update of this plugin is still pending
            $logger = StaticContainer::get(LoggerInterface::class);
            if ($logger instanceof LoggerInterface) {
                $logger->warning(
                    'GroupPermissions: could not remove stale group memberships of the new user {login}: {message}',
                    ['login' => $login, 'message' => $e->getMessage()]
                );
            }
        }
    }

    /**
     * Delete group preferences associated with a particular user
     */
    public function deleteUser(string $login): void {
        $model = new Model();
        (new ReportSharing($model))->transferReportsOfDeletedUser($login);
        $model->removeUserFromAllGroups($login);
    }
}
