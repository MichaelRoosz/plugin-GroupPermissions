<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsGroupList">
    <div class="row groupPermissionsToolbar">
      <div class="col s12 m8 groupPermissionsToolbarButtons">
        <a
          href=""
          class="btn groupPermissionsCreateGroup"
          @click.prevent="$emit('create')"
        >
          <span class="icon-add"></span>
          {{ translate('GroupPermissions_CreateNewGroup') }}
        </a>
        <a
          href=""
          class="btn btn-flat groupPermissionsInviteUserButton"
          :class="{ disabled: !groups.length }"
          @click.prevent="groups.length && $emit('invite')"
        >
          <span class="icon-email"></span>
          {{ translate('UsersManager_InviteNewUser') }}
        </a>
      </div>
      <div class="col s12 m4 groupPermissionsSearch" v-if="groups.length">
        <div class="input-field">
          <!-- native input: filters while typing (Matomo's text Field updates one key late) -->
          <input
            type="text"
            name="groupPermissionsGroupSearch"
            v-model="searchTerm"
            :placeholder="translate('GroupPermissions_SearchGroups')"
            :aria-label="translate('GroupPermissions_SearchGroups')"
            autocomplete="off"
          />
        </div>
      </div>
    </div>

    <ContentBlock :content-title="translate('GroupPermissions_Groups')">
      <table
        class="groupPermissionsGroupsTable"
        :class="{ loading: isLoading }"
        v-content-table
      >
        <thead>
          <tr>
            <th class="groupName">{{ translate('GroupPermissions_Group') }}</th>
            <th class="groupMembers">{{ translate('GroupPermissions_Members') }}</th>
            <th class="groupWebsites">{{ translate('GroupPermissions_Websites') }}</th>
            <th class="actions-cell-header">{{ translate('General_Actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading && !groups.length">
            <td colspan="4"><ActivityIndicator :loading="true" /></td>
          </tr>
          <tr v-else-if="!groups.length" class="groupPermissionsEmpty">
            <td colspan="4">{{ translate('GroupPermissions_NoGroups') }}</td>
          </tr>
          <tr v-else-if="!filteredGroups.length" class="groupPermissionsEmpty">
            <td colspan="4">{{ translate('GroupPermissions_NoGroupsFound') }}</td>
          </tr>
          <tr
            v-for="group in filteredGroups"
            :key="group.idGroup"
            class="groupPermissionsGroupRow"
            :data-id-group="group.idGroup"
          >
            <td class="groupName">
              <a href="" @click.prevent="$emit('edit', group)">{{ group.name }}</a>
            </td>
            <td class="groupMembers">{{ group.memberCount }}</td>
            <td class="groupWebsites">{{ group.siteCount }}</td>
            <td class="center actions-cell">
              <button
                class="table-action edit-group"
                :title="translate('General_Edit')"
                @click="$emit('edit', group)"
              >
                <span class="icon-edit"></span>
              </button>
              <button
                class="table-action delete-group"
                :title="translate('GroupPermissions_DeleteGroupButton')"
                @click="$emit('delete', group)"
              >
                <span class="icon-delete"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </ContentBlock>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  ActivityIndicator,
  ContentBlock,
  ContentTable,
} from 'CoreHome';
import { GroupOverview } from './types';

export default defineComponent({
  components: {
    ActivityIndicator,
    ContentBlock,
  },
  directives: {
    ContentTable,
  },
  props: {
    groups: {
      type: Array as PropType<GroupOverview[]>,
      required: true,
    },
    isLoading: Boolean,
  },
  emits: ['create', 'invite', 'edit', 'delete'],
  data() {
    return {
      searchTerm: '',
    };
  },
  computed: {
    filteredGroups(): GroupOverview[] {
      const term = this.searchTerm.trim().toLowerCase();
      if (!term) {
        return this.groups;
      }
      return this.groups.filter((g) => g.name.toLowerCase().includes(term));
    },
  },
});
</script>
