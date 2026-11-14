<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsGroupSettings">
    <form class="groupPermissionsRenameGroup" @submit.prevent="renameGroup()">
      <h3>{{ translate('GroupPermissions_RenameGroup') }}</h3>
      <div>
        <TextField
          name="groupPermissionsGroupName"
          :model-value="newGroupName"
          @update:model-value="newGroupName = $event"
          :title="translate('GroupPermissions_GroupName')"
          :inline-help="translate('GroupPermissions_GroupNameHelp')"
          :maxlength="64"
        />
      </div>
      <div id="ajaxErrorRenameGroup"></div>
      <SaveButton
        class="groupPermissionsRenameGroupButton"
        :value="translate('General_Save')"
        :saving="isRenaming"
        :disabled="!canRename"
        @confirm="renameGroup()"
      />
    </form>

    <div class="groupPermissionsDeleteGroup">
      <h3>{{ translate('GroupPermissions_DeleteGroup') }}</h3>
      <p>{{ translate('GroupPermissions_DeleteGroupDescription') }}</p>
      <div id="ajaxErrorDeleteGroup"></div>
      <a
        href=""
        class="btn groupPermissionsDeleteGroupButton"
        @click.prevent="$emit('delete', group)"
      >
        <span class="icon-delete"></span>
        {{ translate('GroupPermissions_DeleteGroupButton') }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  AjaxHelper,
  translate,
} from 'CoreHome';
import { SaveButton } from 'CorePluginsAdmin';
import TextField from './TextField.vue';
import { notifySuccess } from './notify';
import { Group } from './types';

export default defineComponent({
  components: {
    TextField,
    SaveButton,
  },
  props: {
    group: {
      type: Object as PropType<Group>,
      required: true,
    },
  },
  emits: ['renamed', 'delete'],
  data() {
    return {
      newGroupName: this.group.name,
      isRenaming: false,
    };
  },
  computed: {
    canRename(): boolean {
      const name = this.newGroupName.trim();
      return !this.isRenaming && name !== '' && name !== this.group.name;
    },
  },
  watch: {
    group(newGroup: Group) {
      this.newGroupName = newGroup.name;
    },
  },
  methods: {
    renameGroup() {
      if (!this.canRename) {
        return;
      }
      const newName = this.newGroupName.trim();
      this.isRenaming = true;

      AjaxHelper.post({
        method: 'GroupPermissions.renameGroup',
      }, {
        idGroup: this.group.idGroup,
        newName,
      }, {
        errorElement: '#ajaxErrorRenameGroup',
      }).then(() => {
        notifySuccess('groupPermissionsGroupRenamed', 'GroupPermissions_GroupRenamed', newName);
        this.$emit('renamed', { idGroup: this.group.idGroup, name: newName });
      }).finally(() => {
        this.isRenaming = false;
      });
    },
  },
});
</script>
