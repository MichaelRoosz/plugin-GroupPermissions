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
- The group editor has three sections (the opened group and section are part of the URL, so they can be bookmarked and survive a reload):
  - **Members**: members with email and invitation status. Add existing users with the searchable user picker, remove members with the delete icon, or invite a new user directly into the group. A user can be in multiple groups; the anonymous user cannot be added to groups.
  - **Website access**: the websites the group can access with their role. Give access to a website (or all websites) with a role, change roles inline, or remove access. Capabilities (e.g. Tag Manager) can be added per website, like on the Manage Access tab.
  - **Settings**: rename or delete the group. Deleting a group removes the access its members got through it; the users themselves are kept.
- "Invite a new user" invites a user by email directly into one or more groups. Unlike the core "Invite user" form, no initial website has to be granted: the user's access comes only from the selected groups. (Internally, Matomo still requires an initial website for invitations, so the plugin temporarily grants view access to a website of the selected groups — which is also the website named in the invitation email — and removes it right after the invite. If none of the selected groups has access to a website yet, the first existing website is used for this step instead; its access is removed right after the invite as well, so the user has no website access until one of their groups is granted one.)

## Permissions required

- Managing groups (create/rename/delete groups, add/remove members, invite users to groups, the group editor) requires Super User access.
- Changing the access of groups requires Admin access on the selected website(s).
- Changing the capabilities of groups requires Admin access on the selected website(s) as well.
- Members get the highest role of all their groups and their own permissions for each website, plus all capabilities of their groups and their own capabilities.
- Like in Matomo core, a capability only applies while the group has a role for the website: removing the role removes the group's capabilities for it, and capabilities included in a new role are dropped (others are kept when the role changes).

