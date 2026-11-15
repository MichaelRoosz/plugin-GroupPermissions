# Matomo GroupPermissions

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Matomo](https://img.shields.io/badge/Matomo-%E2%89%A55.0-blue)](https://matomo.org)
[![Issues](https://img.shields.io/github/issues/MichaelRoosz/plugin-GroupPermissions)](https://github.com/MichaelRoosz/plugin-GroupPermissions/issues)

## Description

Manage user permissions using groups in Matomo. This plugin adds a dedicated admin screen to manage groups, assign users to groups, and set site access for each group.

## Table of contents

- [Matomo GroupPermissions](#matomo-grouppermissions)
  - [Description](#description)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [Compatibility](#compatibility)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Navigation](#navigation)
    - [Manage Access tab](#manage-access-tab)
    - [Manage Groups tab](#manage-groups-tab)
    - [Group sync from LDAP / SAML](#group-sync-from-ldap--saml)
    - [Website create/edit form](#website-createedit-form)
  - [Permissions required](#permissions-required)
  - [API](#api)
  - [Development](#development)
  - [Support](#support)
  - [License](#license)

## Features

- Manage access by groups instead of per-user.
- Assign users to one or more groups.
- Grant or revoke site access for entire groups, including applying to all sites you administer.
- Grant capabilities to groups per website, e.g. the Tag Manager capabilities (write, publish live container, use custom templates).
- Give groups access to new websites automatically, based on the Matomo website group or the URL of the new website.
- Share stored segments with groups: the members see them in the segment selector.
- Shared ownership of scheduled email reports: group members can edit, send and delete them when the creator is absent.
- Synchronize group memberships from LDAP (LoginLdap), OpenID Connect (LoginOIDC, RebelOIDC) or SAML (LoginSaml) groups; other login plugins via an event or the API.
- Set the group access directly in Matomo's website create/edit form.
- Two clear tabs: Manage Access and Manage Groups.

## Compatibility

- Matomo: >= 5.0.0 (see `plugins/GroupPermissions/plugin.json`)
- PHP: as required by your Matomo version

## Installation

1. Copy the `GroupPermissions` directory into your Matomo `plugins/` folder so that it is available at `plugins/GroupPermissions`.
2. Activate the plugin:
   - Via Matomo UI: Go to Administration → System → Plugins and enable "GroupPermissions".
   - Or via CLI, from your Matomo root:
     ```bash
     php console plugin:activate GroupPermissions
     php console core:clear-caches
     ```

## Usage

### Navigation

- Go to Administration → System → Group Permissions.
- Super users see two tabs: "Manage Access" and "Manage Groups". Website admins only see "Manage Access" for the websites they administer.

### Manage Access tab

- Choose a website in the website selector (the page opens with the website of the URL if you administer it). Super users can also choose "Apply to all websites".
- The table lists every group with a role select (`No access`, `View`, `Write`, `Admin`, or other roles provided by Matomo). A change is saved immediately and confirmed by a notification; changes for all websites ask for confirmation first.
- The help icon next to "Role" explains the roles, the search field filters the groups by name.
- If plugins provide capabilities (e.g. the Tag Manager: Write, Publish Live Container, Use Custom Templates), the "Capabilities" column shows them for each group with a role. Capabilities included in the group's role are shown greyed out; add more with the capability select and remove them with the × icon. (Not available for "Apply to all websites".)

### Manage Groups tab

- The group list shows every group with its number of members and websites. Search by name, open a group by its name or the edit icon, or delete it with the delete icon.
- "Create a new group" asks for a name (at most 64 characters) and opens the new group.
- The group editor has seven sections (the opened group and section are part of the URL, so they can be bookmarked and survive a reload):
  - **Members**: members with email and invitation status. Add existing users with the searchable user picker, remove members with the delete icon, or invite a new user directly into the group. A user can be in multiple groups; the anonymous user cannot be added to groups.
  - **Website access**: the websites the group can access with their role. Give access to a website (or all websites) with a role, change roles inline, or remove access. Capabilities (e.g. Tag Manager) can be added per website, like on the Manage Access tab.
  - **Automatic access**: rules that give the group a role for every website created from now on that is in a matching Matomo website group or has a matching URL (main URL or alias URL). Patterns are case-insensitive and `*` matches any characters; a URL pattern without `/` is compared with the host only (e.g. `*.example.com`), one with `/` with host and path (e.g. `example.com/shop*`). A rule can also give capabilities (e.g. Tag Manager) in addition to its role. If several rules match, the highest role wins and a role the group already has is never downgraded. Existing websites are only changed when you apply a rule to them with the refresh icon ("Apply to existing websites"); removing a rule keeps the access it already gave.
  - **Segments**: stored segments shared with the group. Members of the group see a shared segment in the segment selector (in the "Shared with you" part if there is one) as long as they have access to the website the segment is restricted to. Like segments shared with all users, only the creator and super users can edit or delete it. Segments already shared with all users are not offered. Deleting the segment or the group removes the share.
  - **Scheduled reports**: email reports shared with the group (shared ownership). Members of the group see a shared report on Matomo's "Email reports" page and can edit, send, download and delete it like their own as long as they have access to its website — e.g. to change the recipients while the creator is absent, without sharing accounts. Changes are made with the member's own account, so Matomo's events (and an activity log listening to them) record who changed the report; the report keeps its creator, who still gets it with "Send report to me". A member can keep the report's segment or choose one visible to them (including segments shared with their groups), but cannot move the report to another website or change its type. Only email reports can be shared (other types store recipients of the creator, such as the phone numbers of SMS reports). If the creator is deleted, Matomo would delete their reports; a shared report is instead handed over to a member of its groups who has access to its website (the first by login), who then also receives "Send report to me" (without such a member it is deleted as before). Deleting the report or the group removes the share.
  - **Directory sync**: external groups (LDAP, SAML) mapped to the group, see [Group sync from LDAP / SAML](#group-sync-from-ldap--saml).
  - **Settings**: rename or delete the group. Deleting a group removes the access its members got through it; the users themselves are kept.
- "Invite a new user" invites a user by email directly into one or more groups.

### Group sync from LDAP / SAML

Group memberships can be synchronized from the groups of an external directory, so users get their Matomo access from their LDAP or identity provider groups. Supported out of the box: LoginLdap, LoginOIDC, RebelOIDC and LoginSaml; other login plugins can trigger the sync with an event.

- **Map external groups** in the "Directory sync" section of the group editor: enter the name of the group as the identity provider sends it, or the distinguished name (DN) of an LDAP group. Names are compared case-insensitively. A DN like `CN=Matomo Admins,OU=Groups,DC=example,DC=com` also matches its first value (`Matomo Admins`) when the other side is a plain name; two DNs must match completely (spaces after `,` / `=` are ignored). Several external groups can be mapped to one group, and one external group to several groups.
- **On every sync** the user becomes a member of each group mapped to one of their external groups, and is removed from the groups an earlier sync added them to that no longer match. Memberships added manually (or by an invitation) are never removed, and a user who already is a manual member stays one. Synced members are marked "synced" in the member list. Removing a mapping keeps the members it added until their next sync.
- **LDAP** (with the [LoginLdap](https://plugins.matomo.org/LoginLdap) plugin): enable "Synchronize group memberships from LDAP groups" under Administration → System → General settings → GroupPermissions (the settings only appear while LoginLdap is activated). After an LDAP user logs in with their password, the plugin reads their groups with LoginLdap's server configuration and admin bind:
  - from an attribute of the user entry, by default `memberOf` (Active Directory, OpenLDAP with the memberOf overlay; the attribute is requested explicitly, so operational attributes work), and/or
  - with a group search filter where `?` is replaced by the DN of the user, e.g. `(&(objectClass=groupOfNames)(member=?))` or `(&(objectClass=groupOfUniqueNames)(uniqueMember=?))`, below an optional group search base DN. The DNs of the matching groups are used.

  LoginLdap fires no event of its own, so the sync runs on Matomo's `Login.authenticate.successful` event. It does not run for logins with a token (API) or for users created by `loginldap:synchronize-users` until they log in. If the LDAP query fails, the memberships are left unchanged and a warning is logged. Group access of the plugin is independent of LoginLdap's own access synchronization (`enable_synchronize_access_from_ldap`), which only resets the direct permissions of the user.
- **OpenID Connect** (with the [LoginOIDC](https://plugins.matomo.org/LoginOIDC) or [RebelOIDC](https://plugins.matomo.org/RebelOIDC) plugin): enable "Synchronize group memberships from OpenID Connect groups" in the same settings (shown while one of them is activated) and set the claim listing the groups:
  - `groups` (default): Keycloak with a "Group Membership" mapper (add it to the ID token; turn off "Full group path" to get `Matomo Admins` instead of `/Matomo Admins`), Microsoft Entra ID (sends group object IDs by default, so map the IDs), Authentik and most other providers,
  - a namespaced claim such as `https://example.com/groups` (Auth0 actions),
  - or a path into nested claims such as `realm_access.roles` or `resource_access.matomo.roles` (Keycloak roles).

  The groups must be in the **ID token**: both plugins keep only the ID token after the login (not the access token or the userinfo response), and neither fires an event with the claims. The plugin reads the token from the session while the plugin's login callback starts the Matomo session (`Login.authenticate.successful`). The token comes directly from the provider's token endpoint, so its signature is not checked again (OpenID Connect Core 3.1.3.7). The sync runs on every OIDC login, including the first one that creates the user. If the token has no such claim, memberships are left unchanged (an empty list removes all synced memberships).
- **SAML** (with the [LoginSaml](https://plugins.matomo.org/LoginSaml) plugin): enable "Synchronize group memberships from SAML groups" in the same settings (shown while LoginSaml is activated) and set the attribute of the SAML response listing the groups, e.g. `groups`, `memberOf`, `http://schemas.microsoft.com/ws/2008/06/identity/claims/groups` (Microsoft Entra ID, group object IDs) or `http://schemas.xmlsoap.org/claims/Group` (AD FS). Use the attribute's FriendlyName instead if LoginSaml is set to use friendly names. The attribute name is matched exactly first, then case-insensitively.

  LoginSaml fires no event with the attributes and does not keep them, so while its Assertion Consumer Service starts the Matomo session (`Login.authenticate.successful`), the plugin reads them from LoginSaml's SAML handler (php-saml). If that handler has not validated the response yet, the plugin validates the posted SAML response again with LoginSaml's own settings (signature, audience, validity), so only validated attributes are used. The sync runs on every SAML login, including just-in-time provisioning of new users; a response without the attribute leaves the memberships unchanged. This relies on internals of LoginSaml (`Saml\SamlFactory`, tested with LoginSaml 5.5.11), so check it after LoginSaml updates. It is independent of LoginSaml's own access synchronization, which sets the direct permissions of the user.
- **Other login plugins**: a login plugin (or a small custom plugin) can trigger the sync after a login without depending on this plugin:
  ```php
  \Piwik\Piwik::postEvent('GroupPermissions.syncUserGroups', [$login, $groupsFromTheIdentityProvider]);
  ```
  Provisioning scripts can call the `GroupPermissions.syncUserGroups` API method (super user) instead, see [API](#api).

### Website create/edit form

- When creating or editing a website (Administration → Websites → Manage), the "Group Permissions" section has a "Group access" field: a list of group/role pairs. It shows the current roles of the groups for the website, and saving the website saves them, like the Manage Access tab does. Groups that are not listed have no access through groups.
- Super users can set it when creating a website, admins of a website when editing it. If automatic access rules also match a new website, the higher role wins.
- Via the API, pass it as a measurable setting of `SitesManager.addSite` / `SitesManager.updateSite`, e.g. `settingValues[GroupPermissions][0][name]=group_access&settingValues[GroupPermissions][0][value][0][group]=1&settingValues[GroupPermissions][0][value][0][role]=view`.

## Permissions required

- Managing groups (create/rename/delete groups, add/remove members, invite users to groups, the group editor) requires Super User access.
- Changing the access of groups requires Admin access on the selected website(s).
- Changing the capabilities of groups requires Admin access on the selected website(s) as well.
- Managing the automatic access rules of groups requires Super User access. The rules apply to every new website, no matter who creates it.
- Sharing segments with groups: super users can share any segment, users with Admin access to at least one website their own segments (via the API). Matomo itself does not restrict which segment definitions a user may apply, so sharing controls which stored segments are listed, not which data can be seen.
- Sharing scheduled reports with groups: super users can share any email report, users with Admin access to at least one website their own reports (via the API). Members of the group need view access to the website of the report to see or change it. Matomo only lets the creator manage a report, so the plugin runs the core actions on a shared report with super user rights, after checking everything those rights would skip for the member (website access, the requested reports and a newly chosen segment).
- Mapping external groups and synchronizing the groups of a user via the API require Super User access. The LDAP, OpenID Connect and SAML sync runs for the user logging in; it only adds them to groups mapped to their groups in the directory.
- Members get the highest role of all their groups and their own permissions for each website, plus all capabilities of their groups and their own capabilities.
- Like in Matomo core, a capability only applies while the group has a role for the website: removing the role removes the group's capabilities for it, and capabilities included in a new role are dropped (others are kept when the role changes).

## API

Matomo exposes plugin APIs via HTTP. The following methods are available in `Piwik\Plugins\GroupPermissions\API` and can be called using the `module=API&method=` pattern:

- Get all groups:
  ```text
  index.php?module=API&method=GroupPermissions.getAllGroups&format=JSON&token_auth=YOUR_TOKEN
  ```
- Get members of a group:
  ```text
  index.php?module=API&method=GroupPermissions.getMembersOfGroup&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  ```
- Get all groups with their number of members and websites (super user):
  ```text
  index.php?module=API&method=GroupPermissions.getGroupsOverview&format=JSON&token_auth=YOUR_TOKEN
  ```
- Get the websites a group can access with its role and capabilities (super user):
  ```text
  index.php?module=API&method=GroupPermissions.getSitesAccessFromGroup&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  ```
- Get the role of every group for a website:
  ```text
  index.php?module=API&method=GroupPermissions.getGroupAccessFromSite&idSite=1&format=JSON&token_auth=YOUR_TOKEN
  ```
- Get every group with its id, role and capabilities for a website:
  ```text
  index.php?module=API&method=GroupPermissions.getGroupPermissionsFromSite&idSite=1&format=JSON&token_auth=YOUR_TOKEN
  ```
- Add or remove capabilities of a group (the group needs a role for the websites; see `UsersManager.getAvailableCapabilities` for the capability IDs):
  ```text
  index.php?module=API&method=GroupPermissions.addGroupCapabilities&idGroup=1&capabilities[]=tagmanager_write&capabilities[]=tagmanager_publish_live_container&idSites=1,2&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.removeGroupCapabilities&idGroup=1&capabilities=tagmanager_write&idSites=1&format=JSON&token_auth=YOUR_TOKEN
  ```
- Give a group a role for every new website in a Matomo website group or with a matching URL, list and remove these rules (super user):
  ```text
  index.php?module=API&method=GroupPermissions.addAutoAccessRule&idGroup=1&matchType=sitegroup&pattern=Shops&access=view&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.addAutoAccessRule&idGroup=1&matchType=url&pattern=*.example.com&access=write&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.getAutoAccessRules&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.removeAutoAccessRule&idGroup=1&idRule=1&format=JSON&token_auth=YOUR_TOKEN
  ```
  Rules can give capabilities as well (`&capabilities[]=tagmanager_write`). To apply a rule to the websites that already exist (returns the IDs of the matching websites):
  ```text
  index.php?module=API&method=GroupPermissions.applyAutoAccessRule&idGroup=1&idRule=1&format=JSON&token_auth=YOUR_TOKEN
  ```
- Share a stored segment with a group, stop sharing it, list the groups of a segment (super users: any segment, users with admin access: their own segments):
  ```text
  index.php?module=API&method=GroupPermissions.shareSegmentWithGroup&idSegment=1&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.unshareSegmentFromGroup&idSegment=1&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.getGroupsOfSegment&idSegment=1&format=JSON&token_auth=YOUR_TOKEN
  ```
  All segments with whether they are shared with a group (super user):
  ```text
  index.php?module=API&method=GroupPermissions.getSegmentsForGroup&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  ```
  Members of the group get the shared segments from `SegmentEditor.getAll` and `SegmentEditor.get`. Their own scheduled reports cannot use a segment shared with a group (Matomo's ScheduledReports plugin checks the segment directly, not through the API); scheduled reports shared with their group can.
- Share a scheduled email report with a group, stop sharing it, list the groups of a report (super users: any report, users with admin access: their own reports):
  ```text
  index.php?module=API&method=GroupPermissions.shareReportWithGroup&idReport=1&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.unshareReportFromGroup&idReport=1&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.getGroupsOfReport&idReport=1&format=JSON&token_auth=YOUR_TOKEN
  ```
  All email reports with whether they are shared with a group (super user):
  ```text
  index.php?module=API&method=GroupPermissions.getReportsForGroup&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  ```
  Members of the group manage shared reports with Matomo's own API (`ScheduledReports.getReports`, `updateReport`, `sendReport`, `generateReport`, `deleteReport`). To make this possible the plugin replaces the API class of the ScheduledReports plugin with a subclass (via dependency injection, like it does for `Piwik\Access`); another plugin replacing the same class would conflict.
- Map external directory groups (LDAP group DN or name, SAML group value) to a group, remove a mapping, list the mappings (super user):
  ```text
  index.php?module=API&method=GroupPermissions.addExternalGroupMapping&idGroup=1&externalGroup=CN%3DMatomo%20Admins%2COU%3DGroups%2CDC%3Dexample%2CDC%3Dcom&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.removeExternalGroupMapping&idGroup=1&externalGroup=matomo-editors&format=JSON&token_auth=YOUR_TOKEN
  index.php?module=API&method=GroupPermissions.getExternalGroupMappings&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  ```
  Synchronize the groups of a user with their external groups (super user; returns the names of the groups the user was added to and removed from). `externalGroups` is an array or one group per line; an empty list removes all memberships added by the sync:
  ```text
  index.php?module=API&method=GroupPermissions.syncUserGroups&userLogin=jane&externalGroups[]=matomo-editors&externalGroups[]=matomo-admins&format=JSON&token_auth=YOUR_TOKEN
  ```
  `GroupPermissions.getMembersOfGroup` returns `synced: true` for memberships added by the sync.
- Invite a new user directly into groups (super user):
  ```text
  index.php?module=API&method=GroupPermissions.inviteUserToGroups&userLogin=jane&email=jane@example.org&idGroups=1,2&format=JSON&token_auth=YOUR_TOKEN
  ```
- Set group access for site(s):
  ```text
  index.php?module=API&method=GroupPermissions.setGroupAccess&name=Marketing&access=view&idSites=all&format=JSON&token_auth=YOUR_TOKEN
  ```
- Copy one of your dashboards to all members of a group (returns the logins it was copied to):
  ```text
  index.php?module=API&method=GroupPermissions.copyDashboardToGroup&idDashboard=1&idGroup=1&dashboardName=Marketing&format=JSON&token_auth=YOUR_TOKEN
  ```
  The same is available in the dashboard menu under "Copy dashboard to user", where groups are listed below the users.

Notes:
- Use `idSites=all` to apply to all sites you administer, or `idSites=1,2,3` for a list.
- Valid access roles are those returned by Matomo's role provider (commonly `view`, `write`, `admin`).

## Development

- Frontend is built with Vue 3 and `vue-multiselect`.
- If you build the Vue assets locally and encounter a TypeScript nullish chain issue, apply this temporary workaround in `node_modules/vue-multiselect`:
  - Replace `if (this.$refs.list?.scrollTop` with `if (this.$refs.list && this.$refs.list.scrollTop`

Typical steps:
```bash
cd plugins/GroupPermissions
npm install
# build steps depend on your environment; compiled assets are committed in vue/dist
```

### Test instance and tests

A Docker based Matomo test instance and Playwright end-to-end tests live in `tests/e2e` (see [tests/e2e/README.md](tests/e2e/README.md)):

```bash
tests/e2e/bin/start.sh      # Matomo with the plugin and demo data on http://localhost:8089
tests/e2e/bin/run.sh        # run all tests in docker, screenshots end up in tests/e2e/screenshots
tests/e2e/bin/teardown.sh   # stop everything
```

Linting and static analysis: `composer lint` (after `composer install --working-dir=linting`) and `composer phpstan`.
GitHub Actions runs linting, PHPStan and the end-to-end tests for every push and pull request.

Contributions are welcome via pull requests on the repository homepage.

## Support

- Issues: `https://github.com/MichaelRoosz/plugin-GroupPermissions/issues`
- Source: `https://github.com/MichaelRoosz/plugin-GroupPermissions`

## License
GPL v3 or later. See the `LICENSE.txt` file for details.
