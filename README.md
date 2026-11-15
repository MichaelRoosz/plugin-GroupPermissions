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
- The group editor has four sections (the opened group and section are part of the URL, so they can be bookmarked and survive a reload):
  - **Members**: members with email and invitation status. Add existing users with the searchable user picker, remove members with the delete icon, or invite a new user directly into the group. A user can be in multiple groups; the anonymous user cannot be added to groups.
  - **Website access**: the websites the group can access with their role. Give access to a website (or all websites) with a role, change roles inline, or remove access. Capabilities (e.g. Tag Manager) can be added per website, like on the Manage Access tab.
  - **Automatic access**: rules that give the group a role for every website created from now on that is in a matching Matomo website group or has a matching URL (main URL or alias URL). Patterns are case-insensitive and `*` matches any characters; a URL pattern without `/` is compared with the host only (e.g. `*.example.com`), one with `/` with host and path (e.g. `example.com/shop*`). A rule can also give capabilities (e.g. Tag Manager) in addition to its role. If several rules match, the highest role wins and a role the group already has is never downgraded. Existing websites are only changed when you apply a rule to them with the refresh icon ("Apply to existing websites"); removing a rule keeps the access it already gave.
  - **Settings**: rename or delete the group. Deleting a group removes the access its members got through it; the users themselves are kept.
- "Invite a new user" invites a user by email directly into one or more groups.

### Website create/edit form

- When creating or editing a website (Administration → Websites → Manage), the "Group Permissions" section has a "Group access" field: a list of group/role pairs. It shows the current roles of the groups for the website, and saving the website saves them, like the Manage Access tab does. Groups that are not listed have no access through groups.
- Super users can set it when creating a website, admins of a website when editing it. If automatic access rules also match a new website, the higher role wins.
- Via the API, pass it as a measurable setting of `SitesManager.addSite` / `SitesManager.updateSite`, e.g. `settingValues[GroupPermissions][0][name]=group_access&settingValues[GroupPermissions][0][value][0][group]=1&settingValues[GroupPermissions][0][value][0][role]=view`.

## Permissions required

- Managing groups (create/rename/delete groups, add/remove members, invite users to groups, the group editor) requires Super User access.
- Changing the access of groups requires Admin access on the selected website(s).
- Changing the capabilities of groups requires Admin access on the selected website(s) as well.
- Managing the automatic access rules of groups requires Super User access. The rules apply to every new website, no matter who creates it.
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
