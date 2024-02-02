<template>
  <h3>{{ translate('GroupPermissions_ManageGroupMembers') }}</h3>

  <div class="entityContainer" style="width:600px;margin-top:16px;">
    <input type="hidden" id="groupPermissionsCurrentIdGroup" :value="selectedIdGroup" />
    <input type="hidden" id="groupPermissionsCurrentGroupName" :value="selectedGroupName" />

    <table class="entityTable dataTable" id="groupPermissionsGroup"
       style="display:inline-table;width:550px;">
      <thead>
      <tr>
        <th>{{ translate('General_Username') }}</th>
        <th>{{ translate('GroupPermissions_RemoveFromGroup') }}</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="login in assignedUsers" :key="login">
        <td class='login'>{{ login }}</td>
        <td class="text-center">
          <button class="groupPermissionsRemoveUser btn btn-flat"
            @click="removeUser(login)"
            :title="translate('GroupPermissions_RemoveFromGroup')"
            data-login="{{ login }}">
            <span class="icon-delete"></span>
          </button>
        </td>
      </tr>
      </tbody>
    </table>
    <div id="accessUpdated" style="vertical-align:top;"></div>
  </div>
  <div style="margin-top: 70px;">
    <h3>{{ translate('GroupPermissions_AddUserToGroup') }}</h3>
    <div class="groupPermissionsGroupAddUserWrapper">
      <Field
        uicontrol="select"
        id="groupPermissionsGroupAddUserSelect"
        :options="users"
        :placeholder="translate('GroupPermissions_SelectNewUser')"
        v-model="addUserName"
      />
      <input
        id="groupPermissionsGroupAddUserButton"
        type="button"
        @click="addUser"
        :value="translate('GroupPermissions_AddUserToGroupButton')"
        style="padding: 8px;"/>
    </div>
  </div>
  <ActivityIndicator :loading="isLoading" style="padding-top: 10px;"/>
  <div
    class="ui-confirm"
    id="confirmRemoveUser"
    ref="confirmRemoveUser"
  >
    <h2 v-text="getConfirmText"></h2>
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
import { defineComponent } from 'vue';
import { Field } from 'CorePluginsAdmin';
import {
  AjaxHelper,
  Matomo,
  translate,
} from 'CoreHome';
import ActivityIndicator from '../../../../CoreHome/vue/src/ActivityIndicator/ActivityIndicator.vue';

export default defineComponent({
  components: {
    ActivityIndicator,
    Field,
  },
  data() {
    return {
      addUserName: '',
      removeUserName: '',
      assignedUsers: [] as string[],
      isLoading: false,
    };
  },
  props: {
    selectedIdGroup: {
      type: Number,
      required: true,
    },
    selectedGroupName: {
      type: String,
      required: true,
    },
    users: {
      type: Object,
      required: true,
    },
    groupUsers: {
      type: Object,
      required: true,
    },
  },
  methods: {
    addUser() {
      this.isLoading = true;

      // Add the user
      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.addUserToGroup',
      }, {
        idGroup: this.selectedIdGroup,
        login: this.addUserName,
      },
      {
        errorElement: '#ajaxErrorManageGroupMember',
      }).then(() => {
        this.assignedUsers.push(this.addUserName);
        this.assignedUsers.sort();
        this.addUserName = '';
      }).finally(() => {
        this.isLoading = false;
      });
    },
    removeUser(user: string) {
      this.removeUserName = user;

      const doRemoval = () => {
        this.isLoading = true;
        // Remove the user
        AjaxHelper.post({
          module: 'API',
          format: 'json',
          method: 'GroupPermissions.removeUserFromGroup',
        }, {
          idGroup: this.selectedIdGroup,
          login: user,
        },
        {
          errorElement: '#ajaxErrorManageGroupMember',
        }).then(() => {
          const index = this.assignedUsers.indexOf(user);
          this.assignedUsers.splice(index, 1);
          this.removeUserName = '';
        }).finally(() => {
          this.isLoading = false;
        });
      };

      Matomo.helper.modalConfirm('#confirmRemoveUser', {
        yes: doRemoval,
      });
    },
  },
  computed: {
    getConfirmText() {
      return translate('GroupPermissions_RemoveFromGroupConfirm', this.removeUserName, this.selectedGroupName);
    },
  },
  created() {
    this.groupUsers.forEach((value: string) => {
      this.assignedUsers.push(value);
    });
  },
});
</script>
