<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsWebsiteAccess">
    <div class="groupPermissionsGiveAccess">
      <label class="groupPermissionsLabel">{{ translate('GroupPermissions_GiveAccess') }}</label>
      <div class="groupPermissionsInlineForm">
        <div class="groupPermissionsSiteField">
          <SiteSelector
            :model-value="siteToAdd"
            @update:model-value="siteToAdd = $event"
            :show-selected-site="true"
            :show-all-sites-item="true"
            :switch-site-on-select="false"
            :only-sites-with-admin-access="true"
            :all-sites-text="translate('UsersManager_ApplyToAllWebsites')"
            :placeholder="translate('GroupPermissions_SelectWebsite')"
          />
        </div>
        <div class="groupPermissionsRoleField">
          <Field
            uicontrol="select"
            name="groupPermissionsRoleToAdd"
            :model-value="roleToAdd"
            @update:model-value="roleToAdd = $event"
            :options="roles"
            :full-width="true"
          />
        </div>
        <SaveButton
          class="groupPermissionsGiveAccessButton"
          :value="translate('GroupPermissions_GiveAccessButton')"
          :saving="isSaving"
          :disabled="!siteToAdd || !roleToAdd"
          @confirm="giveAccess()"
        />
      </div>
    </div>

    <div id="ajaxErrorGroupWebsiteAccess"></div>

    <table
      class="groupPermissionsWebsitesTable"
      :class="{ loading: isLoading }"
      v-content-table
    >
      <thead>
        <tr>
          <th>{{ translate('General_Website') }}</th>
          <th class="role_header">
            {{ translate('UsersManager_Role') }}
            <span
              class="icon-help groupPermissionsRolesHelpToggle"
              :title="translate('General_Help')"
              @click="showRolesHelp = !showRolesHelp"
            ></span>
          </th>
          <th class="actions-cell-header">{{ translate('General_Actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="showRolesHelp" class="groupPermissionsRolesHelp">
          <td colspan="3">
            <ul>
              <li v-for="role in roles" :key="role.key">
                <strong>{{ role.value }}:</strong> {{ role.description }}
              </li>
            </ul>
          </td>
        </tr>
        <tr v-if="isLoading && !sites.length">
          <td colspan="3"><ActivityIndicator :loading="true" /></td>
        </tr>
        <tr v-else-if="!sites.length" class="groupPermissionsEmpty">
          <td colspan="3">{{ translate('GroupPermissions_NoWebsiteAccess') }}</td>
        </tr>
        <tr
          v-for="site in sites"
          :key="site.idSite"
          class="groupPermissionsWebsiteRow"
          :data-id-site="site.idSite"
        >
          <td class="siteName">{{ site.name }}</td>
          <td class="access-cell">
            <Field
              uicontrol="select"
              :name="`groupPermissionsSiteRole${site.idSite}`"
              :model-value="site.access"
              @update:model-value="setAccess(site.idSite, site.name, $event)"
              :options="roles"
            />
          </td>
          <td class="center actions-cell">
            <button
              class="table-action groupPermissionsRemoveAccess"
              :title="translate('GroupPermissions_RemoveAccess')"
              @click="confirmRemoveAccess(site)"
            >
              <span class="icon-delete"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="ui-confirm" ref="confirmRemoveAccess">
      <h2>{{ confirmText }}</h2>
      <input role="yes" type="button" :value="translate('General_Yes')"/>
      <input role="no" type="button" :value="translate('General_No')"/>
    </div>
    <div class="ui-confirm" ref="confirmAllWebsites">
      <h2>{{ confirmText }}</h2>
      <input role="yes" type="button" :value="translate('General_Yes')"/>
      <input role="no" type="button" :value="translate('General_No')"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
  ContentTable,
  Matomo,
  SiteSelector,
  translate,
} from 'CoreHome';
import { Field, SaveButton } from 'CorePluginsAdmin';
import {
  Group,
  RoleOption,
  SelectedSite,
  SiteAccess,
} from './types';
import { loadRoles, roleName } from './roles';

import { notifySuccess } from './notify';

export default defineComponent({
  components: {
    ActivityIndicator,
    Field,
    SaveButton,
    SiteSelector,
  },
  directives: {
    ContentTable,
  },
  props: {
    group: {
      type: Object as PropType<Group>,
      required: true,
    },
  },
  emits: ['changed'],
  data() {
    return {
      sites: [] as SiteAccess[],
      roles: [] as RoleOption[],
      siteToAdd: null as SelectedSite|null,
      roleToAdd: 'view',
      confirmText: '',
      showRolesHelp: false,
      isLoading: false,
      isSaving: false,
    };
  },
  mounted() {
    loadRoles().then((roles) => {
      this.roles = roles;
    });
    this.loadSites();
  },
  methods: {
    loadSites() {
      this.isLoading = true;
      return AjaxHelper.fetch<SiteAccess[]>({
        method: 'GroupPermissions.getSitesAccessFromGroup',
        idGroup: this.group.idGroup,
        filter_limit: -1,
      }).then((sites) => {
        this.sites = sites;
      }).finally(() => {
        this.isLoading = false;
      });
    },
    giveAccess() {
      const site = this.siteToAdd;
      const role = this.roleToAdd;
      if (!site || !role) {
        return;
      }

      if (site.id === 'all') {
        this.confirmText = translate(
          'GroupPermissions_ChangeAccessToAllSitesConfirm',
          roleName(this.roles, role),
          this.group.name,
        );
        Matomo.helper.modalConfirm(this.$refs.confirmAllWebsites as HTMLElement, {
          yes: () => this.saveAccess('all', translate('UsersManager_ApplyToAllWebsites'), role),
        });
        return;
      }

      this.saveAccess(site.id, site.name, role);
    },
    setAccess(idSite: number, siteName: string, role: string) {
      this.saveAccess(idSite, siteName, role);
    },
    confirmRemoveAccess(site: SiteAccess) {
      this.confirmText = translate('GroupPermissions_RemoveAccessConfirm', this.group.name, site.name);
      Matomo.helper.modalConfirm(this.$refs.confirmRemoveAccess as HTMLElement, {
        yes: () => this.saveAccess(site.idSite, site.name, 'noaccess'),
      });
    },
    saveAccess(idSites: number|string, siteName: string, access: string) {
      this.isSaving = true;
      AjaxHelper.post({
        method: 'GroupPermissions.setGroupAccess',
      }, {
        name: this.group.name,
        access,
        idSites,
      }, {
        errorElement: '#ajaxErrorGroupWebsiteAccess',
      }).then(() => {
        notifySuccess(
          'groupPermissionsAccessUpdated',
          'GroupPermissions_AccessUpdated',
          this.group.name,
          siteName,
          roleName(this.roles, access),
        );
        this.siteToAdd = null;
        this.$emit('changed');
        return this.loadSites();
      }).catch(() => {
        // reload to reset the role selects to the stored values
        this.loadSites();
      }).finally(() => {
        this.isSaving = false;
      });
    },
  },
});
</script>
