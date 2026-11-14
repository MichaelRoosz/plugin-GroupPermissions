<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <ContentBlock
    class="groupPermissionsCreateGroupForm"
    :content-title="translate('GroupPermissions_CreateNewGroup')"
  >
    <form @submit.prevent="createGroup()">
      <div>
        <TextField
          name="groupPermissionsNewGroupName"
          :model-value="groupName"
          @update:model-value="groupName = $event"
          :title="translate('GroupPermissions_GroupName')"
          :inline-help="translate('GroupPermissions_GroupNameHelp')"
          :maxlength="64"
          autofocus
        />
      </div>

      <div id="ajaxErrorCreateGroup"></div>

      <div class="groupPermissionsFormActions">
        <SaveButton
          class="groupPermissionsSaveNewGroup"
          :value="translate('GroupPermissions_CreateNewGroupButton')"
          :saving="isCreatingGroup"
          :disabled="!groupName.trim()"
          @confirm="createGroup()"
        />
        <a href="" class="entityCancelLink" @click.prevent="$emit('cancel')">
          {{ translate('General_Cancel') }}
        </a>
      </div>
    </form>
  </ContentBlock>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  AjaxHelper,
  ContentBlock,
  translate,
} from 'CoreHome';
import { SaveButton } from 'CorePluginsAdmin';
import TextField from './TextField.vue';
import { notifySuccess } from './notify';
import { Group } from './types';

export default defineComponent({
  components: {
    ContentBlock,
    TextField,
    SaveButton,
  },
  emits: ['created', 'cancel'],
  data() {
    return {
      groupName: '',
      isCreatingGroup: false,
    };
  },
  methods: {
    createGroup() {
      const groupName = this.groupName.trim();
      if (!groupName || this.isCreatingGroup) {
        return;
      }

      this.isCreatingGroup = true;
      AjaxHelper.post<Group>({
        method: 'GroupPermissions.createGroup',
      }, {
        groupName,
      }, {
        errorElement: '#ajaxErrorCreateGroup',
      }).then((group) => {
        notifySuccess('groupPermissionsGroupCreated', 'GroupPermissions_GroupCreated', group.name);
        this.$emit('created', group);
      }).finally(() => {
        this.isCreatingGroup = false;
      });
    },
  },
});
</script>
