<template>

    <ManageGroupMembers
        :group="group"
    ></ManageGroupMembers>

    <!-- Rename group -->
    <div style="margin-top: 70px;">
        <h3>{{ translate('GroupPermissions_RenameGroup') }}</h3>
        <div>
            <input
                type="text"
                v-model="this.newGroupName"
            />
            <input
                type="button"
                :value="translate('GroupPermissions_RenameGroupButton')"
                :disabled="isRenaming || !newGroupName.trim() || newGroupName === group.name"
                style="padding: 8px;"
                @click="confirmRenameGroup()"
            />
        </div>
    </div>

    <div class="ui-confirm" id="confirmRenameGroup">
        <h2>{{ confirmRenameGroupText }}</h2>
        <input role="yes" type="button" :value="translate('General_Yes')"/>
        <input role="no" type="button" :value="translate('General_No')"/>
    </div>

    <div id="ajaxErrorRenameGroup" ref="errorContainer"></div>
    <ActivityIndicator
      :loading="isRenaming"
      style="padding-top: 10px;"
    />

    <!-- Delete group -->
    <div style="margin-top: 70px;">
        <h3>{{ translate('GroupPermissions_DeleteGroup') }}</h3>
        <input
            type="button"
            :value="translate('GroupPermissions_DeleteGroupButton')"
            style="padding: 8px;"
            @click="confirmDeleteGroup()"
        />
    </div>

    <div class="ui-confirm" id="confirmDeleteGroup">
        <h2>{{ confirmDeleteGroupText }}</h2>
        <input role="yes" type="button" :value="translate('General_Yes')"/>
        <input role="no" type="button" :value="translate('General_No')"/>
    </div>

    <div id="ajaxErrorDeleteGroup" ref="errorContainer"></div>
    <ActivityIndicator
      :loading="isDeleting"
      style="padding-top: 10px;"
    />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
  Matomo,
  MatomoUrl,
  translate,
} from 'CoreHome';
import ManageGroupMembers from './ManageGroupMembers.vue';
import { Group } from './TabManageGroups.vue';

export default defineComponent({
  components: {
    ActivityIndicator,
    ManageGroupMembers,
  },
  data() {
    return {
      newGroupName: '',
      confirmRenameGroupText: '',
      confirmDeleteGroupText: '',
      isRenaming: false,
      isDeleting: false,
    };
  },
  props: {
    group: {
      type: Object as PropType<Group>,
      required: true,
    },
  },
  emits: ['group-renamed', 'group-deleted'],
  mounted() {
    this.onGroupUpdated();
  },
  methods: {
    onGroupUpdated() {
      this.newGroupName = this.group.name;
      MatomoUrl.updateHash({
        ...MatomoUrl.hashParsed.value,
        idGroup: this.group.idGroup,
      });
    },
    confirmRenameGroup() {
      this.confirmRenameGroupText = translate('GroupPermissions_RenameGroupConfirm', this.group.name, this.newGroupName);
      Matomo.helper.modalConfirm('#confirmRenameGroup', {
        yes: () => this.renameGroup(),
      });
    },
    renameGroup() {
      this.isRenaming = true;

      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.renameGroup',
      }, {
        idGroup: this.group.idGroup,
        newName: this.newGroupName,
      },
      {
        errorElement: '#ajaxErrorRenameGroup',
      }).then(() => {
        this.$emit('group-renamed', {
          idGroup: this.group.idGroup,
          name: this.newGroupName,
        });
      }).finally(() => {
        this.isRenaming = false;
      });
    },
    confirmDeleteGroup() {
      this.confirmDeleteGroupText = translate('GroupPermissions_DeleteGroupConfirm', this.group.name);
      Matomo.helper.modalConfirm('#confirmDeleteGroup', {
        yes: () => this.deleteGroup(),
      });
    },
    deleteGroup() {
      this.isDeleting = true;

      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.deleteGroup',
      }, {
        idGroup: this.group.idGroup,
      },
      {
        errorElement: '#ajaxErrorDeleteGroup',
      }).then(() => {
        this.$emit('group-deleted', this.group);
      }).finally(() => {
        this.isDeleting = false;
      });
    },
  },
  watch: {
    group() {
      this.onGroupUpdated();
    },
  },
});
</script>
