<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsManageAccess">
    <p class="groupPermissionsIntro">{{ translate('GroupPermissions_DescriptionAccessTab') }}</p>

    <div class="row groupPermissionsToolbar">
      <div class="col s12 m6 groupPermissionsSiteField">
        <label class="groupPermissionsLabel">
          {{ translate('General_Website') }}
        </label>
        <div class="sites_autocomplete">
          <SiteSelector
            v-if="isInitialSiteResolved"
            :default-to-first-site="true"
            :show-selected-site="true"
            :show-all-sites-item="hasSuperUserAccess"
            :switch-site-on-select="false"
            :only-sites-with-admin-access="true"
            :all-sites-text="translate('UsersManager_ApplyToAllWebsites')"
            :model-value="site"
            @update:model-value="site = $event; updateGroupAccessList()"
          />
        </div>
      </div>
      <div class="col s12 m6 groupPermissionsSearch" v-if="groupAccess.size">
        <div class="input-field">
          <!-- native input: filters while typing (Matomo's text Field updates one key late) -->
          <input
            type="text"
            name="groupPermissionsAccessSearch"
            v-model="searchTerm"
            :placeholder="translate('GroupPermissions_SearchGroups')"
            :aria-label="translate('GroupPermissions_SearchGroups')"
            autocomplete="off"
          />
        </div>
      </div>
    </div>

    <div
      class="groupPermissionsAllWebsitesNote"
      v-if="isAllWebsites"
    >
      <Notification context="info" type="persistent" :noclear="true">
        {{ translate('GroupPermissions_AllWebsitesNote') }}
      </Notification>
    </div>

    <div id="ajaxErrorAccessGroupMember"></div>

    <ContentBlock :content-title="accessTableTitle">
      <table
        class="groupPermissionsAccessTable"
        :class="{ loading: isLoading }"
        v-content-table
      >
        <thead>
          <tr>
            <th>{{ translate('GroupPermissions_Group') }}</th>
            <th class="role_header">
              {{ translate('UsersManager_Role') }}
              <span
                class="icon-help groupPermissionsRolesHelpToggle"
                :title="translate('General_Help')"
                @click="showRolesHelp = !showRolesHelp"
              ></span>
            </th>
            <th class="capabilities_header" v-if="showCapabilities">
              {{ translate('UsersManager_Capabilities') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="showRolesHelp" class="groupPermissionsRolesHelp">
            <td :colspan="columnCount">
              <ul>
                <li v-for="role in roles" :key="role.key">
                  <strong>{{ role.value }}:</strong> {{ role.description }}
                </li>
                <li v-if="showCapabilities">
                  <strong>{{ translate('UsersManager_Capabilities') }}:</strong>
                  {{ translate('UsersManager_CapabilitiesHelp') }}
                </li>
              </ul>
            </td>
          </tr>
          <tr v-if="isLoading && !groupAccess.size">
            <td :colspan="columnCount"><ActivityIndicator :loading="true" /></td>
          </tr>
          <tr v-else-if="!groupAccess.size && !isLoading" class="groupPermissionsEmpty">
            <td :colspan="columnCount">
              {{ translate('GroupPermissions_NoGroups') }}
              <a
                v-if="hasSuperUserAccess"
                :href="manageGroupsUrl"
              >{{ translate('GroupPermissions_ManageGroups') }}</a>
            </td>
          </tr>
          <tr v-else-if="!filteredGroupAccess.length" class="groupPermissionsEmpty">
            <td :colspan="columnCount">{{ translate('GroupPermissions_NoGroupsFound') }}</td>
          </tr>
          <tr
            v-for="group in filteredGroupAccess"
            :key="group.idGroup"
            class="groupPermissionsAccessRow"
          >
            <td class="groupName">{{ group.name }}</td>
            <td class="access-cell">
              <Field
                :key="`${group.idGroup}-${rowVersions[group.idGroup] || 0}`"
                uicontrol="select"
                :name="`groupPermissionsAccess${rowIndex(group.idGroup)}`"
                :model-value="group.access"
                @update:model-value="onRoleSelected(group, $event)"
                :options="roleOptions"
              />
            </td>
            <td class="capabilities-cell" v-if="showCapabilities && site">
              <GroupCapabilitiesEdit
                :id-group="group.idGroup"
                :group-name="group.name"
                :id-site="Number(site.id)"
                :site-name="site.name"
                :role="group.access"
                :capabilities="group.capabilities"
                :available-capabilities="capabilities"
                error-element="#ajaxErrorAccessGroupMember"
                @change="group.capabilities = $event"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </ContentBlock>

    <div
      class="ui-confirm"
      id="confirmUpdateAccessToAllSites"
      ref="confirmUpdateAccessToAllSites"
    >
      <h2 v-text="confirmUpdateAccessToAllSitesText"></h2>
      <input role="yes" type="button" :value="translate('General_Yes')"/>
      <input role="no" type="button" :value="translate('General_No')"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
  ContentBlock,
  ContentTable,
  Matomo,
  MatomoUrl,
  Notification,
  SiteSelector,
  translate,
} from 'CoreHome';
import { Field } from 'CorePluginsAdmin';
import GroupCapabilitiesEdit from './GroupCapabilitiesEdit.vue';
import {
  CapabilityOption,
  Group,
  GroupSitePermission,
  RoleOption,
  SelectedSite,
} from './types';
import {
  loadCapabilities,
  loadRoles,
  noAccessOption,
  roleName,
} from './roles';

import { notifySuccess } from './notify';

export default defineComponent({
  components: {
    ActivityIndicator,
    ContentBlock,
    Field,
    GroupCapabilitiesEdit,
    Notification,
    SiteSelector,
  },
  directives: {
    ContentTable,
  },
  data() {
    return {
      site: undefined as SelectedSite|undefined,
      isInitialSiteResolved: false,
      // by group id: names are not unique in installations from before names had to be unique
      groupAccess: new Map<number, GroupSitePermission>(),
      rowVersions: {} as Record<number, number>,
      roles: [] as RoleOption[],
      capabilities: [] as CapabilityOption[],
      searchTerm: '',
      showRolesHelp: false,
      isLoading: false,
      confirmUpdateAccessToAllSitesText: '',
    };
  },
  mounted() {
    loadRoles().then((roles) => {
      this.roles = roles;
    });
    loadCapabilities().then((capabilities) => {
      this.capabilities = capabilities;
    });
    this.resolveInitialSite();
  },
  computed: {
    hasSuperUserAccess(): boolean {
      return !!Matomo.hasSuperUserAccess;
    },
    isAllWebsites(): boolean {
      return !!this.site && this.site.id === 'all';
    },
    showCapabilities(): boolean {
      // capabilities need a role of the group for the website, which "all websites" does not show
      return this.capabilities.length > 0 && !this.isAllWebsites;
    },
    columnCount(): number {
      return this.showCapabilities ? 3 : 2;
    },
    roleOptions(): RoleOption[] {
      if (this.isAllWebsites) {
        // the roles differ per website: no role is preselected, so every role (including
        // "no access") can be chosen and applied to all websites
        return [
          { key: '', value: translate('GroupPermissions_SelectRoleForAllWebsites') },
          noAccessOption(),
          ...this.roles,
        ];
      }
      return [noAccessOption(), ...this.roles];
    },
    groupIds(): number[] {
      return [...this.groupAccess.keys()];
    },
    filteredGroupAccess(): GroupSitePermission[] {
      const term = this.searchTerm.trim().toLowerCase();
      return [...this.groupAccess.values()]
        .filter((group) => !term || group.name.toLowerCase().includes(term));
    },
    accessTableTitle(): string {
      if (!this.site) {
        return translate('GroupPermissions_Groups');
      }
      return translate('GroupPermissions_RolesOfGroupsFor', this.site.name);
    },
    manageGroupsUrl(): string {
      return `?${MatomoUrl.stringify({
        ...MatomoUrl.urlParsed.value,
        show: 'groups',
      })}`;
    },
  },
  methods: {
    rowIndex(idGroup: number): number {
      return this.groupIds.indexOf(idGroup);
    },
    /**
     * Starts with the website of the URL if the user administers it. Otherwise the site selector
     * falls back to the first website the user administers.
     */
    resolveInitialSite() {
      const idSite = parseInt(String(MatomoUrl.getSearchParam('idSite') || Matomo.idSite || ''), 10);
      if (!idSite) {
        this.isInitialSiteResolved = true;
        return;
      }

      this.isLoading = true;
      AjaxHelper.fetch<Array<number|string>>({
        method: 'SitesManager.getSitesIdWithAdminAccess',
        filter_limit: -1,
      }).then((adminSiteIds) => {
        if (!adminSiteIds.map((id) => parseInt(String(id), 10)).includes(idSite)) {
          return undefined;
        }
        return AjaxHelper.fetch<{ name: string }>({
          method: 'SitesManager.getSiteFromId',
          idSite,
        });
      }).then((siteInfo) => {
        if (siteInfo) {
          this.site = { id: idSite, name: siteInfo.name };
          this.updateGroupAccessList();
        }
      })
        // on errors the site selector falls back to the first website
        .catch(() => undefined)
        .finally(() => {
          // with a website, updateGroupAccessList() loads its groups and resets the flag itself
          if (!this.site) {
            this.isLoading = false;
          }
          this.isInitialSiteResolved = true;
        });
    },
    onRoleSelected(group: GroupSitePermission, access: string) {
      if (!this.site || !access) {
        return;
      }
      const idSite = this.site.id;

      if (idSite === 'all') {
        this.confirmUpdateAccessToAllSitesText = translate(
          'GroupPermissions_ChangeAccessToAllSitesConfirm',
          roleName(this.roles, access),
          group.name,
        );
        Matomo.helper.modalConfirm(this.$refs.confirmUpdateAccessToAllSites as HTMLElement, {
          yes: () => this.updateGroupAccess(idSite, group.idGroup, access),
          no: () => this.resetRow(group.idGroup),
        });
      } else {
        this.updateGroupAccess(idSite, group.idGroup, access);
      }
    },
    resetRow(idGroup: number) {
      // re-creates the select of the row, so it shows the stored role again
      this.rowVersions[idGroup] = (this.rowVersions[idGroup] || 0) + 1;
    },
    updateGroupAccess(idSite: number|string, idGroup: number, access: string) {
      this.isLoading = true;
      const siteName = this.site ? this.site.name : '';

      AjaxHelper.post({
        method: 'GroupPermissions.setGroupAccessById',
      }, {
        idSites: idSite,
        idGroup,
        access,
      }, {
        errorElement: '#ajaxErrorAccessGroupMember',
      }).then(() => {
        const group = this.groupAccess.get(idGroup);
        if (idSite === 'all') {
          // show the placeholder again, so the same role can be applied again later
          this.resetRow(idGroup);
        } else if (group) {
          group.access = access;
          // like the server: capabilities need a role, and the ones included in the new role
          // are redundant
          group.capabilities = access === 'noaccess' ? [] : group.capabilities.filter((id) => {
            const capability = this.capabilities.find((c) => c.id === id);
            return !capability || !capability.includedInRoles.includes(access);
          });
        }
        notifySuccess(
          'groupPermissionsAccessUpdated',
          'GroupPermissions_AccessUpdated',
          group ? group.name : '',
          siteName,
          roleName(this.roles, access),
        );
      }).catch(() => {
        this.resetRow(idGroup);
      }).finally(() => {
        this.isLoading = false;
      });
    },
    updateGroupAccessList() {
      if (!this.site) {
        return;
      }
      this.isLoading = true;

      const idSite = this.site.id;
      // ignore responses of a website that is no longer selected (e.g. when switching quickly)
      const isStale = () => !this.site || this.site.id !== idSite;

      if (idSite === 'all') {
        AjaxHelper.post({
          method: 'GroupPermissions.getAllGroups',
        }, {
          filter_limit: -1,
        }, {
          errorElement: '#ajaxErrorAccessGroupMember',
        }).then((response) => {
          if (isStale()) {
            return;
          }
          this.groupAccess.clear();
          (response as Group[])
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((group) => {
              this.groupAccess.set(group.idGroup, {
                idGroup: group.idGroup,
                name: group.name,
                access: '',
                capabilities: [],
              });
            });
        }).finally(() => {
          // a request for the newly selected website is still running
          if (!isStale()) {
            this.isLoading = false;
          }
        });
      } else {
        AjaxHelper.post({
          method: 'GroupPermissions.getGroupPermissionsFromSite',
        }, {
          idSite,
          filter_limit: -1,
        }, {
          errorElement: '#ajaxErrorAccessGroupMember',
        }).then((response) => {
          if (isStale()) {
            return;
          }
          this.groupAccess.clear();
          (response as GroupSitePermission[])
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach((group) => {
              this.groupAccess.set(group.idGroup, group);
            });
        }).finally(() => {
          // a request for the newly selected website is still running
          if (!isStale()) {
            this.isLoading = false;
          }
        });
      }
    },
  },
});
</script>
