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
- The page shows two tabs: "Manage Access" and "Manage Groups".

### Manage Access tab

- Select the target website(s). You can apply changes to a specific site ID or to all sites you administer.
- For each group, choose one of the available roles for the selected site(s): `view`, `write`, or `admin`.

### Manage Groups tab

- Create, rename, and delete groups.
- Add or remove users to/from a group. A user can be in multiple groups.
- Duplicates are prevented; attempts to add an existing member will show an error.

## Permissions required

- Managing group membership (create/rename/delete groups, add/remove users) requires Super User access.
- Changing site access for groups requires Admin access on the selected site(s).

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
- Set group access for site(s):
  ```text
  index.php?module=API&method=GroupPermissions.setGroupAccess&name=Marketing&access=view&idSites=all&format=JSON&token_auth=YOUR_TOKEN
  ```

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

Contributions are welcome via pull requests on the repository homepage.

## Support

- Issues: `https://github.com/MichaelRoosz/plugin-GroupPermissions/issues`
- Source: `https://github.com/MichaelRoosz/plugin-GroupPermissions`

## License
GPL v3 or later. See the `LICENSE.txt` file for details.
