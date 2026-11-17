
# Changelog
## Unreleased
  - Fix: members of groups with write or admin access to a website could not use their token_auth for tracking requests that need one (log imports, a custom IP, timestamps older than 24 hours); adding or removing members now also refreshes Matomo's access and tracker caches
  - Fix: `GroupPermissions.renameGroup` rejected changing only the case of a group name ("Group already exists"); `createGroup` / `renameGroup` trim the name and reject empty names
  - Group sync from LDAP / SAML: map external directory groups (LDAP group DNs or names, identity provider group values) to groups in the new "Directory sync" section of the group editor; synchronizing a user makes them a member of the mapped groups and removes them from groups an earlier sync added them to (manual memberships are kept, synced members are marked in the member list). Built-in sync after login for LoginLdap (new general settings: `memberOf`-style attribute and/or group search filter) for LoginOIDC / RebelOIDC (groups claim of the ID token, nested paths like `realm_access.roles` supported) and for LoginSaml (group attribute of the validated SAML response), the event `GroupPermissions.syncUserGroups` for other login plugins, and new API methods `GroupPermissions.addExternalGroupMapping`, `GroupPermissions.removeExternalGroupMapping`, `GroupPermissions.getExternalGroupMappings` and `GroupPermissions.syncUserGroups` (super user only); `GroupPermissions.getMembersOfGroup` also returns `synced`. Requires a database update (new table `gpermissions_external`, new column `synced` in `gpermissions_user`)
  - Shared ownership of scheduled reports within a group: members of a group an email report is shared with can see, edit, send, download and delete it like their own (as long as they have access to its website), e.g. to change the recipients while the creator is absent — without shared accounts, every change is made with the member's own login. New "Scheduled reports" section in the group editor and API methods `GroupPermissions.shareReportWithGroup`, `GroupPermissions.unshareReportFromGroup`, `GroupPermissions.getGroupsOfReport` (super users, or the creator of the report with admin access) and `GroupPermissions.getReportsForGroup` (super user only). When the creator of a shared report is deleted, the report is handed over to a member of its groups with access to the website instead of being deleted. The "Email reports" page lists the creator instead of the viewing user as recipient of "Send report to me" for reports of other users. Requires a database update (new table `gpermissions_report`)
  - Fix: "Send now" failed for reports scheduled "Never" on newer Matomo 5 versions ("The period 'never' is not supported"), and used an invalid default date on older ones; these reports are now sent like daily reports
  - Share stored segments with groups: members of the group see the segment in the segment selector (and in `SegmentEditor.getAll` / `SegmentEditor.get`) as long as they have access to its website; only the creator and super users can edit it. New "Segments" section in the group editor and API methods `GroupPermissions.shareSegmentWithGroup`, `GroupPermissions.unshareSegmentFromGroup`, `GroupPermissions.getGroupsOfSegment` (super users, or the creator of the segment with admin access) and `GroupPermissions.getSegmentsForGroup` (super user only). Requires a database update (new table `gpermissions_segment`)
  - "Group access" field in Matomo's website create/edit form (a list of group/role pairs), so the group access can be set while creating a website
  - Automatic access on website creation: rules per group give the group a role for every new website in a matching Matomo website group or with a matching URL (wildcards supported, e.g. `*.example.com`), optionally with capabilities. Rules can also be applied to existing websites. New "Automatic access" section in the group editor and API methods `GroupPermissions.addAutoAccessRule`, `GroupPermissions.removeAutoAccessRule`, `GroupPermissions.getAutoAccessRules` and `GroupPermissions.applyAutoAccessRule` (super user only). Requires a database update (new table `gpermissions_autoaccess`)
  - Capabilities per group, e.g. the Tag Manager capabilities `tagmanager_write`, `tagmanager_publish_live_container` and `tagmanager_use_custom_templates` (any capability provided by a plugin is supported): new "Capabilities" column on the Manage Access tab and in the group editor, new API methods `GroupPermissions.addGroupCapabilities`, `GroupPermissions.removeGroupCapabilities` and `GroupPermissions.getGroupPermissionsFromSite`; `getSitesAccessFromGroup` also returns the capabilities. Requires a database update (new table `gpermissions_capability`)
  - Fix: capabilities users got directly (e.g. Tag Manager "Publish Live Container") were lost as soon as the user was also a member of a group with access to any website
  - New admin UI aligned with Matomo's own admin screens: group list with search and member/website counts, group editor (members with email and status, website access with role selects, settings), role selects with Matomo's role descriptions on the Manage Access tab, toasts after changes, empty states, deep links (`#?idGroup=…&groupTab=…`)
  - New API methods `GroupPermissions.getGroupsOverview` and `GroupPermissions.getSitesAccessFromGroup` (super user only)
  - Security: `GroupPermissions.getAllGroups` and `GroupPermissions.getGroupWithId` now require admin access (previously any user could read group names, members and permissions); `setGroupAccess` checks admin access up front
  - Security: the anonymous user can no longer be added to groups, and group permissions never apply to the anonymous user (a group with admin access containing "anonymous" gave every visitor admin access)
  - Copy dashboards to all members of a group via the "Copy dashboard to user" dialog (`GroupPermissions.copyDashboardToGroup` API)
  - Invite new users directly into groups (Manage Groups tab / `GroupPermissions.inviteUserToGroups` API), no initial website access needed
  - Fix `GroupPermissions.setGroupAccess` failing with "The arguments array must contain 2 items" instead of the proper error message for an invalid access value
  - `GroupPermissions.setGroupAccess` rejects website IDs that do not exist (previously super users could store permissions for them, which a website created later with that ID would inherit)
  - Manage Access: fix setting the access of groups whose name contains `&`, quotes or `<`/`>` (the name was shown HTML-escaped and the change failed with "Group does not exist"); `GroupPermissions.getGroupAccessFromSite` now returns the unescaped group names
  - Group names longer than 64 characters (special characters count with their HTML-escaped length) are rejected instead of being truncated silently
  - Manage Access: open with the website of the URL (if administered by the user) instead of always the first website; responses for a previously selected website no longer overwrite the current one
  - `GroupPermissions.getGroupAccessFromSite` rejects website IDs that do not exist
  - Manage Groups: the group dropdown is sorted by name right after loading (previously only after creating or renaming a group), so the first group by name is selected by default
  - Manage Groups: show errors when removing a group member fails (the error container was missing)
  - Manage Groups: "Create Group", "Add Member" and "Rename Group" are disabled while there is nothing to submit (empty name, no user selected, unchanged name) instead of failing with an error
  - Add end-to-end tests (Playwright + Docker), a Docker based Matomo test instance (`tests/e2e/bin/start.sh`) and a GitHub Actions workflow running linting, PHPStan and the tests
  - Updated translations

## 5.2.1
  - Fix plugin version in plugin.json

## 5.2.0
  - Fix only first 100 groups beging shown, now showing all
  - Fix only first 100 group members beging shown, now showing all
  - Clear new group name input after adding a new group
  - Clear new group member name inpit after adding a new group member
  - Select default group if none selected

## 5.1.1
  - Update readme file

## 5 1.0
  - Fix Web UI for Matomo 5

## 5.0.0
  - Compatibility with Matomo 5

## 4.0.5
  - Fix js crash

## 4.0.4
  - Show all users in "add-to-group" user selection in "Manage groups"

## 4.0.3
  - Fix site selection in "Manage access"
  - Add dropdown for "add-to-group" user selection in "Manage groups"
  - Fix "Apply to all websites" text
  - Do not allow multiple groups with the same name
  - Check if a user is already in a group

## 4.0.2
  - Fix config page getting endlessly reloaded on Matomo 4.5.0

## 4.0.1
  - Compatibility with Matomo 4
  - Fix SQL Exception when updating permissions

## 3.9.1
  - Fixed "noaccess" check for newer Matomo versions

## 3.6.1
  - Fixed Issue #1 reported by EmTeedee

## 3.6.0
  - Added support for 'write' access
  - Compatibility with Matomo 3.6.0
  
## 3.0.2
  - First stable release
