<template>
  <div class="card">
    <div class="card-content" style="width: 600px">
      <h2>{{ translate('GroupPermissions_InviteUser') }}</h2>
      <p>{{ translate('GroupPermissions_InviteUserDescription') }}</p>

      <div class="groupPermissionsInviteUser">
        <label>
          {{ translate('General_Username') }}
          <input
            type="text"
            v-model="userLogin"
            autocomplete="off"
          />
        </label>

        <label>
          {{ translate('UsersManager_Email') }}
          <input
            type="email"
            v-model="email"
            autocomplete="off"
          />
        </label>

        <multiselect
          :options="groups"
          :multiple="true"
          :close-on-select="false"
          track-by="idGroup"
          label="name"
          :placeholder="translate('GroupPermissions_SelectGroups')"
          v-model="selectedGroups"
        ></multiselect>

        <input
          type="button"
          :value="translate('GroupPermissions_InviteUserButton')"
          :disabled="!canInvite"
          style="padding: 8px; margin-top: 8px;"
          @click="showPasswordConfirmation = true"
        />
      </div>

      <PasswordConfirmation
        v-model="showPasswordConfirmation"
        @confirmed="inviteUser"
      />

      <div id="ajaxErrorInviteUser" ref="errorContainer"></div>
      <ActivityIndicator
        :loading="isInvitingUser"
        style="padding-top: 10px;"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
  NotificationsStore,
  translate,
} from 'CoreHome';
import { PasswordConfirmation } from 'CorePluginsAdmin';
import Multiselect from 'vue-multiselect';
import { Group } from './TabManageGroups.vue';

export default defineComponent({
  components: {
    ActivityIndicator,
    Multiselect,
    PasswordConfirmation,
  },
  props: {
    groups: {
      type: Array as PropType<Group[]>,
      required: true,
    },
  },
  emits: ['user-invited'],
  data() {
    return {
      userLogin: '',
      email: '',
      selectedGroups: [] as Group[],
      showPasswordConfirmation: false,
      isInvitingUser: false,
    };
  },
  computed: {
    canInvite(): boolean {
      return !this.isInvitingUser
        && this.userLogin.trim() !== ''
        && this.email.trim() !== ''
        && this.selectedGroups.length > 0;
    },
  },
  watch: {
    groups(newGroups: Group[]) {
      // drop selected groups that were deleted in the meantime
      this.selectedGroups = this.selectedGroups.filter(
        (selected: Group) => newGroups.some((g: Group) => g.idGroup === selected.idGroup),
      );
    },
  },
  methods: {
    inviteUser(passwordConfirmation: string) {
      this.isInvitingUser = true;

      const userLogin = this.userLogin.trim();
      const idGroups = this.selectedGroups.map((g: Group) => g.idGroup);

      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.inviteUserToGroups',
      }, {
        userLogin,
        email: this.email.trim(),
        idGroups: idGroups.join(','),
        passwordConfirmation,
      },
      {
        errorElement: '#ajaxErrorInviteUser',
      }).then(() => {
        NotificationsStore.show({
          message: translate('GroupPermissions_InviteUserSuccess', userLogin),
          context: 'success',
          type: 'toast',
        });
        this.$emit('user-invited', { login: userLogin, idGroups });
        this.userLogin = '';
        this.email = '';
        this.selectedGroups = [];
      }).finally(() => {
        this.isInvitingUser = false;
      });
    },
  },
});
</script>
