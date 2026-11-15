<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsMembers">
    <div class="groupPermissionsAddMember">
      <label class="groupPermissionsLabel" for="groupPermissionsAddMemberSelect">
        {{ translate('GroupPermissions_AddUserToGroup') }}
      </label>
      <div class="groupPermissionsInlineForm">
        <multiselect
          id="groupPermissionsAddMemberSelect"
          class="groupPermissionsUserSelect"
          :options="availableUsers"
          :custom-label="userLabel"
          track-by="login"
          :placeholder="translate('GroupPermissions_SelectNewUser')"
          :select-label="''"
          :deselect-label="''"
          :selected-label="''"
          v-model="selectedUser"
        >
          <template #noResult>{{ translate('GroupPermissions_NoUsersFound') }}</template>
          <template #noOptions>{{ translate('GroupPermissions_NoUsersFound') }}</template>
        </multiselect>
        <SaveButton
          class="groupPermissionsAddMemberButton"
          :value="translate('GroupPermissions_AddUserToGroupButton')"
          :saving="isAddingMember"
          :disabled="!selectedUser"
          @confirm="addMember()"
        />
      </div>
      <a
        href=""
        class="groupPermissionsInviteIntoGroup"
        @click.prevent="$emit('invite')"
      >
        <span class="icon-email"></span>
        {{ translate('GroupPermissions_InviteUserIntoGroup') }}
      </a>
    </div>

    <div id="ajaxErrorAddMember"></div>
    <div id="ajaxErrorManageGroupMembers"></div>

    <table
      class="groupPermissionsMembersTable"
      :class="{ loading: isLoading }"
      v-content-table
    >
      <thead>
        <tr>
          <th>{{ translate('General_Username') }}</th>
          <th>{{ translate('UsersManager_Email') }}</th>
          <th>{{ translate('UsersManager_Status') }}</th>
          <th class="actions-cell-header">{{ translate('General_Actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading && !members.length">
          <td colspan="4"><ActivityIndicator :loading="true" /></td>
        </tr>
        <tr v-else-if="!members.length" class="groupPermissionsEmpty">
          <td colspan="4">{{ translate('GroupPermissions_NoMembers') }}</td>
        </tr>
        <tr
          v-for="login in members"
          :key="login"
          class="groupPermissionsMemberRow"
        >
          <td class="login">
            <span class="memberLogin">{{ login }}</span>
            <span
              v-if="syncedMembers.includes(login)"
              class="groupPermissionsSyncedBadge"
              :title="translate('GroupPermissions_SyncedMemberHelp')"
            >{{ translate('GroupPermissions_SyncedMember') }}</span>
          </td>
          <td class="email">{{ usersByLogin[login]?.email || '' }}</td>
          <td class="status">
            <span :class="statusClass(login)">{{ statusText(login) }}</span>
          </td>
          <td class="center actions-cell">
            <button
              class="table-action groupPermissionsRemoveMember"
              :title="translate('GroupPermissions_RemoveFromGroup')"
              @click="confirmRemoveMember(login)"
            >
              <span class="icon-delete"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="ui-confirm" id="confirmRemoveMember" ref="confirmRemoveMember">
      <h2>{{ confirmRemoveMemberText }}</h2>
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
  translate,
} from 'CoreHome';
import { SaveButton } from 'CorePluginsAdmin';
import Multiselect from 'vue-multiselect';
import { notifySuccess } from './notify';
import { Group, MatomoUser } from './types';

export default defineComponent({
  components: {
    ActivityIndicator,
    Multiselect,
    SaveButton,
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
  emits: ['changed', 'invite'],
  data() {
    return {
      members: [] as string[],
      syncedMembers: [] as string[],
      users: [] as MatomoUser[],
      selectedUser: null as MatomoUser|null,
      confirmRemoveMemberText: '',
      isLoadingMembers: false,
      isLoadingUsers: false,
      isAddingMember: false,
    };
  },
  mounted() {
    this.loadGroupMembers();
    this.loadUsers();
  },
  computed: {
    isLoading(): boolean {
      return this.isLoadingMembers || this.isLoadingUsers;
    },
    usersByLogin(): Record<string, MatomoUser> {
      const result: Record<string, MatomoUser> = {};
      this.users.forEach((user) => {
        result[user.login] = user;
      });
      return result;
    },
    availableUsers(): MatomoUser[] {
      // the anonymous user cannot be member of a group
      return this.users.filter(
        (user) => user.login !== 'anonymous' && !this.members.includes(user.login),
      );
    },
  },
  methods: {
    userLabel(user: MatomoUser): string {
      return user.email ? `${user.login} (${user.email})` : user.login;
    },
    statusText(login: string): string {
      const status = this.usersByLogin[login]?.invite_status;
      if (status === undefined || status === 'active') {
        return translate('UsersManager_Active');
      }
      if (status === 'expired') {
        return translate('UsersManager_Expired');
      }
      return translate('UsersManager_Pending');
    },
    statusClass(login: string): string {
      const status = this.usersByLogin[login]?.invite_status;
      if (status === undefined || status === 'active') {
        return 'active';
      }
      return status === 'expired' ? 'expired' : 'pending';
    },
    loadGroupMembers() {
      this.isLoadingMembers = true;
      AjaxHelper.fetch<Array<{ login: string, synced?: boolean }>>({
        method: 'GroupPermissions.getMembersOfGroup',
        idGroup: this.group.idGroup,
        filter_limit: -1,
      }).then((response) => {
        this.members = response.map((member) => member.login)
          .sort((a, b) => a.localeCompare(b));
        this.syncedMembers = response.filter((member) => member.synced)
          .map((member) => member.login);
      }).finally(() => {
        this.isLoadingMembers = false;
      });
    },
    loadUsers() {
      this.isLoadingUsers = true;
      AjaxHelper.fetch<MatomoUser[]>({
        method: 'UsersManager.getUsers',
        filter_limit: -1,
      }).then((response) => {
        this.users = response.sort((a, b) => a.login.localeCompare(b.login));
      }).finally(() => {
        this.isLoadingUsers = false;
      });
    },
    addMember() {
      if (!this.selectedUser || this.isAddingMember) {
        return;
      }
      const { login } = this.selectedUser;
      this.isAddingMember = true;

      AjaxHelper.post({
        method: 'GroupPermissions.addUserToGroup',
      }, {
        idGroup: this.group.idGroup,
        login,
      }, {
        errorElement: '#ajaxErrorAddMember',
      }).then(() => {
        this.members = [...this.members, login].sort((a, b) => a.localeCompare(b));
        this.selectedUser = null;
        notifySuccess('groupPermissionsMemberAdded', 'GroupPermissions_MemberAdded', login);
        this.$emit('changed');
      }).finally(() => {
        this.isAddingMember = false;
      });
    },
    confirmRemoveMember(login: string) {
      this.confirmRemoveMemberText = translate('GroupPermissions_RemoveFromGroupConfirm', login, this.group.name);
      Matomo.helper.modalConfirm(this.$refs.confirmRemoveMember as HTMLElement, {
        yes: () => this.removeMember(login),
      });
    },
    removeMember(login: string) {
      AjaxHelper.post({
        method: 'GroupPermissions.removeUserFromGroup',
      }, {
        idGroup: this.group.idGroup,
        login,
      }, {
        errorElement: '#ajaxErrorManageGroupMembers',
      }).then(() => {
        this.members = this.members.filter((member) => member !== login);
        this.syncedMembers = this.syncedMembers.filter((member) => member !== login);
        notifySuccess('groupPermissionsMemberRemoved', 'GroupPermissions_MemberRemoved', login);
        this.$emit('changed');
      });
    },
  },
});
</script>
