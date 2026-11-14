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
          </tr>
        </thead>
        <tbody>
          <tr v-if="showRolesHelp" class="groupPermissionsRolesHelp">
            <td colspan="2">
              <ul>
                <li v-for="role in roles" :key="role.key">
                  <strong>{{ role.value }}:</strong> {{ role.description }}
                </li>
              </ul>
            </td>
          </tr>
          <tr v-if="isLoading && !groupAccess.size">
            <td colspan="2"><ActivityIndicator :loading="true" /></td>
          </tr>
          <tr v-else-if="!groupAccess.size && !isLoading" class="groupPermissionsEmpty">
            <td colspan="2">
              {{ translate('GroupPermissions_NoGroups') }}
              <a
                v-if="hasSuperUserAccess"
                :href="manageGroupsUrl"
              >{{ translate('GroupPermissions_ManageGroups') }}</a>
            </td>
          </tr>
          <tr v-else-if="!filteredGroupAccess.length" class="groupPermissionsEmpty">
            <td colspan="2">{{ translate('GroupPermissions_NoGroupsFound') }}</td>
          </tr>
          <tr
            v-for="[groupName, access] in filteredGroupAccess"
            :key="groupName"
            class="groupPermissionsAccessRow"
          >
            <td class="groupName">{{ groupName }}</td>
            <td class="access-cell">
              <Field
                :key="`${groupName}-${rowVersions[groupName] || 0}`"
                uicontrol="select"
                :name="`groupPermissionsAccess${rowIndex(groupName)}`"
                :model-value="access"
                @update:model-value="onRoleSelected(groupName, $event)"
                :options="roleOptions"
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
import { RoleOption, SelectedSite } from './types';
import { loadRoles, noAccessOption, roleName } from './roles';

import { notifySuccess } from './notify';

export default defineComponent({
  components: {
    ActivityIndicator,
    ContentBlock,
    Field,
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
      groupAccess: new Map<string, string>(),
      rowVersions: {} as Record<string, number>,
      roles: [] as RoleOption[],
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
    this.resolveInitialSite();
  },
  computed: {
    hasSuperUserAccess(): boolean {
      return !!Matomo.hasSuperUserAccess;
    },
    isAllWebsites(): boolean {
      return !!this.site && this.site.id === 'all';
    },
    roleOptions(): RoleOption[] {
      return [noAccessOption(), ...this.roles];
    },
    groupNames(): string[] {
      return [...this.groupAccess.keys()];
    },
    filteredGroupAccess(): Array<[string, string]> {
      const term = this.searchTerm.trim().toLowerCase();
      return [...this.groupAccess.entries()]
        .filter(([name]) => !term || name.toLowerCase().includes(term));
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
    rowIndex(groupName: string): number {
      return this.groupNames.indexOf(groupName);
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
          this.isLoading = false;
          this.isInitialSiteResolved = true;
        });
    },
    onRoleSelected(groupName: string, access: string) {
      if (!this.site) {
        return;
      }
      const idSite = this.site.id;

      if (idSite === 'all') {
        this.confirmUpdateAccessToAllSitesText = translate(
          'GroupPermissions_ChangeAccessToAllSitesConfirm',
          roleName(this.roles, access),
          groupName,
        );
        Matomo.helper.modalConfirm(this.$refs.confirmUpdateAccessToAllSites as HTMLElement, {
          yes: () => this.updateGroupAccess(idSite, groupName, access),
          no: () => this.resetRow(groupName),
        });
      } else {
        this.updateGroupAccess(idSite, groupName, access);
      }
    },
    resetRow(groupName: string) {
      // re-creates the select of the row, so it shows the stored role again
      this.rowVersions[groupName] = (this.rowVersions[groupName] || 0) + 1;
    },
    updateGroupAccess(idSite: number|string, groupName: string, access: string) {
      this.isLoading = true;
      const siteName = this.site ? this.site.name : '';

      AjaxHelper.post({
        method: 'GroupPermissions.setGroupAccess',
      }, {
        idSites: idSite,
        name: groupName,
        access,
      }, {
        errorElement: '#ajaxErrorAccessGroupMember',
      }).then(() => {
        this.groupAccess.set(groupName, access);
        notifySuccess(
          'groupPermissionsAccessUpdated',
          'GroupPermissions_AccessUpdated',
          groupName,
          siteName,
          roleName(this.roles, access),
        );
      }).catch(() => {
        this.resetRow(groupName);
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
          response.map((group: { name: string }) => group.name)
            .sort((a: string, b: string) => a.localeCompare(b))
            .forEach((group: string) => {
              this.groupAccess.set(group, 'noaccess');
            });
        }).finally(() => {
          this.isLoading = false;
        });
      } else {
        AjaxHelper.post({
          method: 'GroupPermissions.getGroupAccessFromSite',
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
          Object.keys(response).sort((a, b) => a.localeCompare(b)).forEach((group) => {
            this.groupAccess.set(group, response[group]);
          });
        }).finally(() => {
          this.isLoading = false;
        });
      }
    },
  },
});
</script>
