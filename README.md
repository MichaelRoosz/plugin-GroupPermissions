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
  - [Permissions required](#permissions-required)
  - [API](#api)
  - [Development](#development)
  - [Support](#support)
  - [License](#license)

## Features

- Manage access by groups instead of per-user.
- Assign users to one or more groups.
- Grant or revoke site access for entire groups, including applying to all sites you administer.
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

### Manage Groups tab

- The group list shows every group with its number of members and websites. Search by name, open a group by its name or the edit icon, or delete it with the delete icon.
- "Create a new group" asks for a name (at most 64 characters) and opens the new group.
- The group editor has three sections (the opened group and section are part of the URL, so they can be bookmarked and survive a reload):
  - **Members**: members with email and invitation status. Add existing users with the searchable user picker, remove members with the delete icon, or invite a new user directly into the group. A user can be in multiple groups; the anonymous user cannot be added to groups.
  - **Website access**: the websites the group can access with their role. Give access to a website (or all websites) with a role, change roles inline, or remove access.
  - **Settings**: rename or delete the group. Deleting a group removes the access its members got through it; the users themselves are kept.
- "Invite a new user" invites a user by email directly into one or more groups.

## Permissions required

- Managing groups (create/rename/delete groups, add/remove members, invite users to groups, the group editor) requires Super User access.
- Changing the access of groups requires Admin access on the selected website(s).
- Members get the highest role of all their groups and their own permissions for each website.

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
- Get the websites a group can access with its role (super user):
  ```text
  index.php?module=API&method=GroupPermissions.getSitesAccessFromGroup&idGroup=1&format=JSON&token_auth=YOUR_TOKEN
  ```
- Get the role of every group for a website:
  ```text
  index.php?module=API&method=GroupPermissions.getGroupAccessFromSite&idSite=1&format=JSON&token_auth=YOUR_TOKEN
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
