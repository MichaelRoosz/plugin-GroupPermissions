
# Changelog
## 5.3.0
New features (requires a database update):
  - New admin UI in Matomo's style: group list with search, group editor with sections for members, website access, capabilities, automatic access, segments, scheduled reports and directory sync; deep links to groups
  - Capabilities per group (e.g. Tag Manager `tagmanager_write`, `tagmanager_publish_live_container`)
  - Automatic access: give groups a role on new websites matching a Matomo website group or URL pattern (e.g. `*.example.com`), optionally applied to existing websites
  - "Group access" field in Matomo's website create/edit form
  - Share stored segments with groups
  - Share scheduled email reports with groups: members can view, edit, send and delete them; reports of deleted users are handed over to a group member instead of being deleted (reports with the All Websites dashboard cannot be shared, it could show members data of other websites)
  - Group sync from LDAP, OIDC and SAML: map external directory groups to groups, memberships are synchronized on login (LoginLdap, LoginOIDC / RebelOIDC, LoginSaml; event `GroupPermissions.syncUserGroups` for other login plugins)
  - Invite new users directly into groups
  - Copy dashboards to all members of a group
  - New API methods for all of the above
  - `setGroupAccessById` sets the role of a group by its ID (the UI uses it, so groups with the same name from older versions are no longer mixed up)

Security:
  - `getAllGroups` and `getGroupWithId` require admin access (previously any user could read groups, members and permissions). Thanks to [ipankwave88](https://github.com/ipankwave88) for reporting this
  - The anonymous user can no longer be added to groups, and group permissions never apply to it
  - Group access to websites that no longer exist (e.g. deleted while the plugin was deactivated) is ignored, and a new user never inherits the group memberships of a deleted user with the same login

Fixes:
  - Members of groups with write/admin access can use their token_auth for tracking requests that need one (e.g. log imports)
  - `SitesManager.getSitesIdFromSiteUrl` (used e.g. by the log importer to find websites by URL) also returns websites the user can access through a group
  - While the database update of the plugin is pending, group members keep their own access instead of getting database errors
  - Capabilities given directly to a user were lost when the user was also in a group with website access
  - Group names with `&`, quotes or `<`/`>` could not be managed on Manage Access; names are trimmed, empty or overlong names are rejected, case-only renames work
  - Group names must be unique (case-insensitive), also when groups are created or renamed at the same time; names are no longer matched accent-insensitively depending on the database collation
  - Adding a member that the directory sync added makes the membership a manual one, which the sync keeps
  - "Send now" failed for reports scheduled "Never"
  - Users deleted while the plugin was deactivated can be removed from their groups (they stayed listed as members, and removing them failed)
  - Manage Access with "Apply to all websites" can remove the access of a group from all websites ("No access") and apply the same role again
  - Deleting a group is all or nothing
  - Website IDs that do not exist are rejected; better error messages for invalid access values
  - Manage Access opens with the website from the URL
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
