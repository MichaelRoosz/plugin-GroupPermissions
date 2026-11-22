<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <ContentBlock
    class="groupPermissionsInviteUser"
    :content-title="translate('GroupPermissions_InviteUser')"
  >
    <p class="groupPermissionsIntro">{{ translate('GroupPermissions_InviteUserDescription') }}</p>

    <form @submit.prevent="requestInvite()" autocomplete="off">
      <div>
        <TextField
          name="groupPermissionsInviteLogin"
          :model-value="userLogin"
          @update:model-value="userLogin = $event"
          :title="translate('General_Username')"
          :maxlength="100"
        />
      </div>
      <div>
        <TextField
          name="groupPermissionsInviteEmail"
          type="email"
          :model-value="email"
          @update:model-value="email = $event"
          :title="translate('UsersManager_Email')"
          :maxlength="100"
        />
      </div>

      <div class="groupPermissionsInviteGroups">
        <label class="fieldRadioTitle">{{ translate('GroupPermissions_Groups') }}</label>
        <div class="groupPermissionsCheckboxList">
          <p
            v-for="group in groups"
            :key="group.idGroup"
            class="checkbox"
          >
            <label>
              <input
                type="checkbox"
                :value="group.idGroup"
                v-model="selectedGroupIds"
                :name="`groupPermissionsInviteGroup${group.idGroup}`"
              />
              <span>{{ group.name }}</span>
            </label>
          </p>
        </div>
      </div>

      <Notification
        v-if="selectedGroupsHaveNoSites"
        context="warning"
        type="persistent"
        :noclear="true"
      >
        {{ translate('GroupPermissions_InviteUserNoWebsiteWarning') }}
      </Notification>

      <div id="ajaxErrorInviteUser"></div>

      <div class="groupPermissionsFormActions">
        <SaveButton
          class="groupPermissionsSendInvite"
          :value="translate('GroupPermissions_InviteUserButton')"
          :saving="isInvitingUser"
          :disabled="!canInvite"
          @confirm="requestInvite()"
        />
        <a href="" class="entityCancelLink" @click.prevent="$emit('cancel')">
          {{ translate('General_Cancel') }}
        </a>
      </div>
    </form>

    <PasswordConfirmation
      v-model="showPasswordConfirmation"
      @confirmed="inviteUser"
    />
  </ContentBlock>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  AjaxHelper,
  ContentBlock,
  Notification,
  translate,
} from 'CoreHome';
import { PasswordConfirmation, SaveButton } from 'CorePluginsAdmin';
import TextField from './TextField.vue';
import { notifySuccess } from './notify';
import { GroupOverview } from './types';

export default defineComponent({
  components: {
    ContentBlock,
    Notification,
    TextField,
    PasswordConfirmation,
    SaveButton,
  },
  props: {
    groups: {
      type: Array as PropType<GroupOverview[]>,
      required: true,
    },
    preselectedGroupIds: {
      type: Array as PropType<number[]>,
      default: () => [],
    },
  },
  emits: ['user-invited', 'cancel'],
  data() {
    return {
      userLogin: '',
      email: '',
      selectedGroupIds: [...this.preselectedGroupIds] as number[],
      showPasswordConfirmation: false,
      isInvitingUser: false,
    };
  },
  computed: {
    canInvite(): boolean {
      return !this.isInvitingUser
        && this.userLogin.trim() !== ''
        && this.email.trim() !== ''
        && this.selectedGroupIds.length > 0;
    },
    selectedGroupsHaveNoSites(): boolean {
      // the server then invites with another website, which Matomo names in the invitation email
      const selected = this.groups.filter((g) => this.selectedGroupIds.includes(g.idGroup));
      return selected.length > 0 && selected.every((g) => g.siteCount === 0);
    },
  },
  watch: {
    groups(newGroups: GroupOverview[]) {
      // drop selected groups that were deleted in the meantime
      this.selectedGroupIds = this.selectedGroupIds.filter(
        (id: number) => newGroups.some((g: GroupOverview) => g.idGroup === id),
      );
    },
  },
  methods: {
    requestInvite() {
      if (this.canInvite) {
        this.showPasswordConfirmation = true;
      }
    },
    inviteUser(passwordConfirmation: string) {
      this.isInvitingUser = true;

      const userLogin = this.userLogin.trim();
      const idGroups = [...this.selectedGroupIds];

      AjaxHelper.post({
        method: 'GroupPermissions.inviteUserToGroups',
      }, {
        userLogin,
        email: this.email.trim(),
        idGroups: idGroups.join(','),
        passwordConfirmation,
      }, {
        errorElement: '#ajaxErrorInviteUser',
      }).then(() => {
        notifySuccess(
          'groupPermissionsUserInvited',
          'GroupPermissions_InviteUserSuccess',
          userLogin,
        );
        this.$emit('user-invited', { login: userLogin, idGroups });
      }).finally(() => {
        this.isInvitingUser = false;
      });
    },
  },
});
</script>
