
# Changelog
## Unreleased
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
