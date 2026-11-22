
# Changelog
## 6.0.0
  - Compatible with Matomo 6 (for Matomo 5, use version 5.3.0)
  - Includes all features and fixes of 5.3.0
  - Tracking with the token_auth of a group member only accepts tokens that may track, like Matomo 6 does for direct access (not tokens limited to view access)
  - Adapted to Matomo 6's new look: the user picker in the group editor matches Matomo's other select fields

## 5.3.0
Requires a database update.

New features:
  - Redesigned admin UI in Matomo's style: searchable group list and a group editor for members, website access, capabilities and everything below
  - Capabilities per group, e.g. Tag Manager `tagmanager_write`
  - Automatic access: give groups a role on new websites by Matomo website group or URL pattern (e.g. `*.example.com`), optionally also on existing websites
  - "Group access" field in Matomo's website create/edit form
  - Group sync from LDAP, OpenID Connect and SAML: map directory groups to groups, memberships are updated on login (LoginLdap, LoginOIDC / RebelOIDC, LoginSaml; other login plugins can post the `GroupPermissions.syncUserGroups` event)
  - Share segments with groups
  - Copy dashboards and scheduled email reports to all members of a group
  - Invite new users directly into groups
  - `[GroupPermissions] enable_groups_admin = 0` disables changing groups, like `enable_users_admin` for users
  - API methods for all of the above; new `setGroupAccessById` (preferred over `setGroupAccess`, which can mix up groups with the same name from older versions); `getGroupAccessFromSite` is deprecated in favour of `getGroupPermissionsFromSite`

Security:
  - `getAllGroups` and `getGroupWithId` require admin access, before any user could read groups. Thanks to [ipankwave88](https://github.com/ipankwave88) for reporting this
  - Groups never grant access to the anonymous user, who can no longer be added to groups
  - A new user never inherits the group memberships of a deleted user with the same login, also if the user was deleted while the plugin was deactivated
  - Group access to deleted websites is ignored

Fixes:
  - Group members with write or admin access can use their token_auth for tracking requests that need one (e.g. log imports), and the log importer finds websites they can access through a group
  - Removing a user's direct access no longer deletes their scheduled reports for websites they can still access through a group; users losing all access through a group change are cleaned up like with direct access changes
  - Capabilities given directly to a user are no longer lost when the user is also in a group
  - Group names with `&`, quotes or `<`/`>` work everywhere; names must be unique (case-insensitive) and are trimmed
  - Logins with different spelling (e.g. `BOB` for `bob`) are handled correctly when adding, removing and deleting users; existing memberships are converted by the database update
  - Users deleted while the plugin was deactivated are no longer listed as members
  - Changing the role of a group never removes its access for a moment, and deleting a group is all or nothing
  - "Apply to all websites" on Manage Access can also remove access from all websites
  - Manage Access opens with the website from the URL
  - Group members keep their own access while the plugin's database update is pending
  - Works when the plugin's tables and Matomo's have different collations (e.g. after a MySQL upgrade)
  - Clearer errors for unknown websites, groups, members and access values
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
