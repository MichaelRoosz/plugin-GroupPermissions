<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsGroupSync">
    <p class="groupPermissionsIntro">{{ translate('GroupPermissions_GroupSyncDescription') }}</p>

    <form class="groupPermissionsAddExternalGroup" @submit.prevent="addExternalGroup()">
      <h3>{{ translate('GroupPermissions_AddExternalGroup') }}</h3>
      <div>
        <TextField
          name="groupPermissionsExternalGroup"
          :model-value="newExternalGroup"
          @update:model-value="newExternalGroup = $event"
          :title="translate('GroupPermissions_ExternalGroup')"
          :inline-help="translate('GroupPermissions_GroupSyncHelpNames')"
          :maxlength="190"
        />
      </div>
      <SaveButton
        class="groupPermissionsAddExternalGroupButton"
        :value="translate('GroupPermissions_AddExternalGroupButton')"
        :saving="isSaving"
        :disabled="!newExternalGroup.trim()"
        @confirm="addExternalGroup()"
      />
    </form>

    <div id="ajaxErrorGroupSync"></div>

    <table
      class="groupPermissionsExternalGroupsTable"
      :class="{ loading: isLoading }"
      v-content-table
    >
      <thead>
        <tr>
          <th>{{ translate('GroupPermissions_ExternalGroups') }}</th>
          <th class="actions-cell-header">{{ translate('General_Actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading && !externalGroups.length">
          <td colspan="2"><ActivityIndicator :loading="true" /></td>
        </tr>
        <tr v-else-if="!externalGroups.length" class="groupPermissionsEmpty">
          <td colspan="2">{{ translate('GroupPermissions_NoExternalGroups') }}</td>
        </tr>
        <tr
          v-for="externalGroup in externalGroups"
          :key="externalGroup"
          class="groupPermissionsExternalGroupRow"
        >
          <td class="externalGroup">{{ externalGroup }}</td>
          <td class="center actions-cell">
            <button
              class="table-action groupPermissionsRemoveExternalGroup"
              :title="translate('GroupPermissions_RemoveExternalGroup')"
              @click="confirmRemoveExternalGroup(externalGroup)"
            >
              <span class="icon-delete"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="groupPermissionsPlainNameWarning" v-if="plainNameMappings.length">
      <Notification context="warning" type="persistent" :noclear="true">
        {{ translate('GroupPermissions_GroupSyncPlainNameWarning', plainNameMappings.join(', ')) }}
      </Notification>
    </div>

    <div class="ui-confirm" ref="confirmRemoveExternalGroup">
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
  Notification,
  translate,
} from 'CoreHome';
import { SaveButton } from 'CorePluginsAdmin';
import TextField from './TextField.vue';
import { Group } from './types';
import { notifySuccess } from './notify';

export default defineComponent({
  components: {
    ActivityIndicator,
    Notification,
    SaveButton,
    TextField,
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
  data() {
    return {
      externalGroups: [] as string[],
      newExternalGroup: '',
      confirmText: '',
      isLoading: false,
      isSaving: false,
    };
  },
  mounted() {
    this.loadExternalGroups();
  },
  computed: {
    /**
     * Mappings that are not distinguished names: they also match LDAP groups with this first value
     * anywhere in the directory (see GroupSync::matches)
     */
    plainNameMappings(): string[] {
      const dn = /^[a-z][a-z0-9-]*\s*=(?:[^,\\]|\\.)+,\s*[a-z][a-z0-9-]*\s*=/i;
      return this.externalGroups.filter((externalGroup) => !dn.test(externalGroup.trim()));
    },
  },
  methods: {
    loadExternalGroups() {
      this.isLoading = true;
      return AjaxHelper.fetch<string[]>({
        method: 'GroupPermissions.getExternalGroupMappings',
        idGroup: this.group.idGroup,
        filter_limit: -1,
      }).then((externalGroups) => {
        this.externalGroups = externalGroups;
      }).finally(() => {
        this.isLoading = false;
      });
    },
    addExternalGroup() {
      const externalGroup = this.newExternalGroup.trim();
      if (!externalGroup || this.isSaving) {
        return;
      }

      this.isSaving = true;
      AjaxHelper.post({
        method: 'GroupPermissions.addExternalGroupMapping',
      }, {
        idGroup: this.group.idGroup,
        externalGroup,
      }, {
        errorElement: '#ajaxErrorGroupSync',
      }).then(() => {
        notifySuccess(
          'groupPermissionsExternalGroupAdded',
          'GroupPermissions_ExternalGroupAdded',
          externalGroup,
          this.group.name,
        );
        this.newExternalGroup = '';
        return this.loadExternalGroups();
      }).finally(() => {
        this.isSaving = false;
      });
    },
    confirmRemoveExternalGroup(externalGroup: string) {
      this.confirmText = translate(
        'GroupPermissions_RemoveExternalGroupConfirm',
        externalGroup,
        this.group.name,
      );
      Matomo.helper.modalConfirm(this.$refs.confirmRemoveExternalGroup as HTMLElement, {
        yes: () => this.removeExternalGroup(externalGroup),
      });
    },
    removeExternalGroup(externalGroup: string) {
      AjaxHelper.post({
        method: 'GroupPermissions.removeExternalGroupMapping',
      }, {
        idGroup: this.group.idGroup,
        externalGroup,
      }, {
        errorElement: '#ajaxErrorGroupSync',
      }).then(() => {
        notifySuccess(
          'groupPermissionsExternalGroupRemoved',
          'GroupPermissions_ExternalGroupRemoved',
          externalGroup,
          this.group.name,
        );
        return this.loadExternalGroups();
      });
    },
  },
});
</script>
