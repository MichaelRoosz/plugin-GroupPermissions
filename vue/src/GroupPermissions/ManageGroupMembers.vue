<template>
  <h3>{{ translate('GroupPermissions_ManageGroupMembers') }}</h3>

  <div class="entityContainer" style="width:600px;margin-top:16px;">
    <table class="entityTable dataTable"
       style="display:inline-table;width:550px;">
      <thead>
      <tr>
        <th>{{ translate('General_Username') }}</th>
        <th>{{ translate('GroupPermissions_RemoveFromGroup') }}</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="login in members" :key="login">
        <td class='login'>{{ login }}</td>
        <td class="text-center">
          <button class="groupPermissionsRemoveMember btn btn-flat"
            @click="confirmRemoveMember(login)"
            :title="translate('GroupPermissions_RemoveFromGroup')"
          >
            <span class="icon-delete"></span>
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <div id="ajaxErrorLoadMembers" ref="errorContainer"></div>
  <ActivityIndicator
    :loading="isLoadingMembers"
    style="padding-top: 10px;"
  />

  <div style="margin-top: 70px;">
    <h3>{{ translate('GroupPermissions_AddUserToGroup') }}</h3>
    <div class="groupPermissionsGroupAddMemberWrapper">
      <multiselect
        :options="logins"
        :placeholder="translate('GroupPermissions_SelectNewUser')"
        v-model="selectedLoginToAdd"
      />
      <input
        type="button"
        @click="addMember()"
        :value="translate('GroupPermissions_AddUserToGroupButton')"
        style="padding: 8px; margin-top: 8px;"/>
    </div>
  </div>

  <div id="ajaxErrorLoadLogins" ref="errorContainer"></div>
  <div id="ajaxErrorAddMember" ref="errorContainer"></div>
  <ActivityIndicator
    :loading="isLoadingLogins || isAddingMember"
    style="padding-top: 10px;"
  />

  <div
    class="ui-confirm"
    id="confirmRemoveMember"
    ref="confirmRemoveMember"
  >
    <h2>{{ confirmRemoveMemberText }}</h2>
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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
  Matomo,
  translate,
} from 'CoreHome';
import Multiselect from 'vue-multiselect';
import { Group } from './TabManageGroups.vue';

export default defineComponent({
  components: {
    ActivityIndicator,
    Multiselect,
  },
  data() {
    return {
      members: [] as string[],
      logins: [] as string[],
      selectedLoginToAdd: '',
      confirmRemoveMemberText: '',
      isLoadingMembers: false,
      isLoadingLogins: false,
      isAddingMember: false,
      isRemovingMember: false,
    };
  },
  props: {
    group: {
      type: Object as PropType<Group>,
      required: true,
    },
  },
  mounted() {
    this.loadGroupMembers();
    this.loadLogins();
  },
  methods: {
    loadGroupMembers() {
      this.isLoadingMembers = true;

      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.getMembersOfGroup',
      }, {
        idGroup: this.group.idGroup,
        filter_limit: -1,
      },
      {
        errorElement: '#ajaxErrorLoadMembers',
      }).then((response) => {
        this.members = response.reduce((acc: string[], member: { login: string }) => {
          acc.push(member.login);
          return acc;
        }, []);
        this.members.sort();
      }).finally(() => {
        this.isLoadingMembers = false;
      });
    },
    loadLogins() {
      this.isLoadingLogins = true;

      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'UsersManager.getUsersLogin',
      }, {
        filter_limit: -1,
      },
      {
        errorElement: '#ajaxErrorLoadLogins',
      }).then((response) => {
        this.logins = response;
        this.logins.sort();
      }).finally(() => {
        this.isLoadingLogins = false;
      });
    },
    addMember() {
      this.isAddingMember = true;

      const loginToAdd = this.selectedLoginToAdd;
      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.addUserToGroup',
      }, {
        idGroup: this.group.idGroup,
        login: loginToAdd,
      },
      {
        errorElement: '#ajaxErrorAddMember',
      }).then(() => {
        this.members.push(loginToAdd);
        this.members.sort();
        this.selectedLoginToAdd = '';
      }).finally(() => {
        this.isAddingMember = false;
      });
    },
    confirmRemoveMember(member: string) {
      this.confirmRemoveMemberText = translate('GroupPermissions_RemoveFromGroupConfirm', member, this.group.name);
      Matomo.helper.modalConfirm('#confirmRemoveMember', {
        yes: () => this.removeMember(member),
      });
    },
    removeMember(member: string) {
      this.isRemovingMember = true;
      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.removeUserFromGroup',
      }, {
        idGroup: this.group.idGroup,
        login: member,
      },
      {
        errorElement: '#ajaxErrorManageGroupMembers',
      }).then(() => {
        this.members = this.members.filter((login) => login !== member);
      }).finally(() => {
        this.isRemovingMember = false;
      });
    },
  },
  watch: {
    group() {
      this.loadGroupMembers();
    },
  },
});
</script>
