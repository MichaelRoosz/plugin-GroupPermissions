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
- Invite a new user by email directly into one or more groups. Unlike the core "Invite user" form, no initial website has to be granted: the user's access comes only from the selected groups. (Internally, Matomo still requires an initial website for invitations, so the plugin temporarily grants view access to a website of the selected groups — which is also the website named in the invitation email — and removes it right after the invite. If none of the selected groups has access to a website yet, the first existing website is used for this step instead; its access is removed right after the invite as well, so the user has no website access until one of their groups is granted one.)

## Permissions required

- Managing group membership (create/rename/delete groups, add/remove users, invite users to groups) requires Super User access.
- Changing site access for groups requires Admin access on the selected site(s).
