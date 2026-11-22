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
  - **Automatic access**: rules that give the group a role for every website created from now on that is in a matching Matomo website group or has a matching URL (main URL or alias URL). Patterns are case-insensitive and `*` matches any characters; a URL pattern without `/` is compared with the host only (e.g. `*.example.com`), one with `/` with host and path (e.g. `example.com/shop*`). The port of a URL is only compared when the pattern has one (e.g. `example.com:8080`); URLs without a port use the default port of their scheme (`example.com:443` matches `https://example.com`). A rule can also give capabilities (e.g. Tag Manager) in addition to its role. If several rules match, the highest role wins and a role the group already has is never downgraded. Existing websites are only changed when you apply a rule to them with the refresh icon ("Apply to existing websites"); removing a rule keeps the access it already gave.
  - **Segments**: stored segments shared with the group. Members of the group see a shared segment in the segment selector (in the "Shared with you" part if there is one) as long as they have access to the website the segment is restricted to. Like segments shared with all users, only the creator and super users can edit or delete it. Segments already shared with all users are not offered. Deleting the segment or the group removes the share.
  - **Scheduled reports**: copy an email report to the members of the group. Every member with access to the website of the report gets an independent copy of their own, which they change, send, download or delete like their own reports on Matomo's "Email reports" page. The copies are sent to their member only ("Send report to me"); the other recipients of the report are not copied, so they do not get the report once per member. Later changes of the report are not applied to the copies. Members who only have a pending invitation are skipped. A report with a segment can only be copied if the segment is shared with all users (Matomo does not let members use private segments of other users in their reports). Only email reports can be copied (other types have recipients of the creator, such as the phone numbers of SMS reports).
  - **Directory sync**: external groups (LDAP, SAML) mapped to the group, see [Group sync from LDAP / SAML](#group-sync-from-ldap--saml).
  - **Settings**: rename or delete the group. Deleting a group removes the access its members got through it; the users themselves are kept.
- "Invite a new user" invites a user by email directly into one or more groups. Unlike the core "Invite user" form, no initial website has to be granted: the user's access comes only from the selected groups. (Internally, Matomo still requires an initial website for invitations, so the plugin temporarily grants view access to a website of the selected groups — which is also the website named in the invitation email — and removes it right after the invite. If none of the selected groups has access to a website yet, the first existing website is used for this step instead; its access is removed right after the invite as well, so the user has no website access until one of their groups is granted one.)

### Group sync from LDAP / SAML

Group memberships can be synchronized from the groups of an external directory, so users get their Matomo access from their LDAP or identity provider groups. Supported out of the box: LoginLdap, LoginOIDC, RebelOIDC and LoginSaml; other login plugins can trigger the sync with an event.

- **Map external groups** in the "Directory sync" section of the group editor: enter the name of the group as the identity provider sends it, or the distinguished name (DN) of an LDAP group. Names are compared case-insensitively. A plain name like `Matomo Admins` also matches LDAP DNs with this first value (e.g. `CN=Matomo Admins,OU=Groups,DC=example,DC=com`) in any part of the directory. A DN only matches the same DN (spaces after `,` / `=` are ignored), never a plain name sent by an identity provider, so it pins the group to one location. Several external groups can be mapped to one group, and one external group to several groups.
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
- Sharing segments with groups: super users can share any segment with any group, users with Admin access to at least one website their own segments (via the API) with groups that have a role for the website of the segment (for segments of all websites: for a website they administer). They can unshare their segments from any group. A share applies only while the user who shared the segment could still share it (e.g. not after losing the Admin access); shares by super users always apply. Matomo itself does not restrict which segment definitions a user may apply, so sharing controls which stored segments are listed, not which data can be seen.
- Copying scheduled reports to groups: super users can copy any email report, users with Admin access to at least one website their own reports (via the API). Like dashboards, a report is only copied to members the current user is allowed to see. The copies are ordinary reports of the members, so Matomo applies its own checks to them (e.g. the All Websites dashboard shows the websites of the member).
- Mapping external groups and synchronizing the groups of a user via the API require Super User access. The LDAP, OpenID Connect and SAML sync runs for the user logging in; it only adds them to groups mapped to their groups in the directory.
- Members get the highest role of all their groups and their own permissions for each website, plus all capabilities of their groups and their own capabilities.
- Like in Matomo core, a capability only applies while the group has a role for the website: removing the role removes the group's capabilities for it, and capabilities included in a new role are dropped (others are kept when the role changes).
- When a user loses all access to a website through a change of groups (the group's access is removed, the user is removed from the group or the group is deleted), Matomo's `UsersManager.removeSiteAccess` event is posted, like when direct access is removed: e.g. the user's scheduled reports for that website are deleted. Access the user still has directly or through another group is kept. The other way round, when direct access is removed (Matomo then posts the event as well), the user's scheduled reports for websites they can still access through a group are kept.
- Changing groups can be disabled in `config/config.ini.php`, like `enable_users_admin` disables Matomo's user management:

  ```ini
  [GroupPermissions]
  enable_groups_admin = 0
  ```

  Then the Groups page and the "Group access" field of the website form are hidden, and API methods that change groups, members, access, capabilities, automatic access rules, external group mappings or the segments shared with groups fail. Group permissions still apply, the group sync on login (and `syncUserGroups`) and the automatic access rules for new websites keep working, and dashboards and reports can still be copied to groups.

