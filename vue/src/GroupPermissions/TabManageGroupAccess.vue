<template>
  <p>{{ translate('GroupPermissions_DescriptionAccessTab') }}</p>

  <div id="ajaxErrorAccessGroupMember" ref="errorContainer"></div>

  <div class="card">
    <div class="card-content">

      <div class="sites_autocomplete">
        <SiteSelector
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

      <div class="entityContainer" style="width:600px;margin-top:16px;">
            <table
                class="entityTable dataTable"
                style="display:inline-table;width:550px;"
            >
                <thead>
                <tr>
                    <th class='first'>{{ translate('GroupPermissions_Group') }}</th>
                    <th>{{ translate('UsersManager_PrivNone') }}</th>
                    <th>{{ translate('UsersManager_PrivView') }}</th>
                    <th>{{ translate('UsersManager_PrivWrite') }}</th>
                    <th>{{ translate('UsersManager_PrivAdmin') }}</th>
                </tr>
                </thead>

                <tbody>
                  <tr v-for="[groupName, groupAccess] in groupAccess" :key="groupName">
                      <td>{{ groupName }}</td>

                      <template
                        v-for="access in ['noaccess', 'view', 'write', 'admin']"
                        :key="access"
                      >
                        <td>
                          <img
                            v-if="groupAccess == access"
                            src='plugins/UsersManager/images/ok.png'
                            class='accessGranted'
                          />
                          <img
                            v-else
                            src='plugins/UsersManager/images/no-access.png'
                            class='updateAccess'
                            @click="onSetAccessClicked($event, groupName, access)"
                          />
                          &nbsp;
                        </td>
                      </template>
                  </tr>
                </tbody>
            </table>
      </div>

      <ActivityIndicator
        :loading="isLoading"
        style="padding-top: 10px;
      "/>

      <div
        class="ui-confirm"
        id="confirmUpdateAccessToAllSites"
        ref="confirmUpdateAccessToAllSites"
      >
        <h2 v-text="confirmUpdateAccessToAllSitesText"></h2>
        <input
          role="yes"
          type="button"
          :value="translate('General_Yes')"
        />
        <input
          role="no"
          type="button"
          :value="translate('General_No')"
        />
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
  Matomo,
  SiteSelector,
  translate,
} from 'CoreHome';

export default defineComponent({
  components: {
    ActivityIndicator,
    SiteSelector,
  },
  data() {
    return {
      site: {
        id: Matomo.idSite,
        name: Matomo.currentSiteName,
      },
      groupAccess: new Map<string, string>(),
      isLoading: false,
      confirmUpdateAccessToAllSitesText: '',
    };
  },
  methods: {
    onSetAccessClicked(event: MouseEvent, groupName: string, access: string) {
      const idSite = this.site.id;

      if (idSite === 'all') {
        this.confirmUpdateAccessToAllSitesText = translate('GroupPermissions_ChangeAccessToAllSitesConfirm', access, groupName);
        Matomo.helper.modalConfirm('#confirmUpdateAccessToAllSites', {
          yes: () => this.updateGroupAccess(idSite, groupName, access),
        });
      } else {
        this.updateGroupAccess(idSite, groupName, access);
      }
    },
    updateGroupAccess(idSite: number|string, groupName: string, access: string) {
      this.isLoading = true;

      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.setGroupAccess',
      }, {
        idSites: idSite,
        name: groupName,
        access,
      },
      {
        errorElement: '#ajaxErrorAccessGroupMember',
      }).then(() => {
        this.groupAccess.set(groupName, access);
      }).finally(() => {
        this.isLoading = false;
      });
    },
    updateGroupAccessList() {
      this.isLoading = true;

      const idSite = this.site.id;

      if (idSite === 'all') {
        AjaxHelper.post({
          module: 'API',
          format: 'json',
          method: 'GroupPermissions.getAllGroups',
        }, {
          filter_limit: -1,
        },
        {
          errorElement: '#ajaxErrorAccessGroupMember',
        }).then((response) => {
          this.groupAccess.clear();

          const groupAccessTmp: string[] = [];

          response.forEach((group: { name: string }) => {
            groupAccessTmp.push(group.name);
          });

          groupAccessTmp.sort().forEach((group) => {
            this.groupAccess.set(group, 'noaccess');
          });
        }).finally(() => {
          this.isLoading = false;
        });
      } else {
        AjaxHelper.post({
          module: 'API',
          format: 'json',
          method: 'GroupPermissions.getGroupAccessFromSite',
        }, {
          idSite: this.site.id,
          filter_limit: -1,
        },
        {
          errorElement: '#ajaxErrorAccessGroupMember',
        }).then((response) => {
          this.groupAccess.clear();

          Object.keys(response).sort().forEach((group) => {
            this.groupAccess.set(group, response[group]);
          });
        }).finally(() => {
          this.isLoading = false;
        });
      }
    },
  },
  computed: {
    hasSuperUserAccess() {
      return !!Matomo.hasSuperUserAccess;
    },
  },
});
</script>
