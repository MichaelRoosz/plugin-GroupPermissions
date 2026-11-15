<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsManageGroups">
    <p class="groupPermissionsIntro">{{ translate('GroupPermissions_DescriptionGroupsTab') }}</p>

    <div id="ajaxErrorManageGroups"></div>

    <GroupList
      v-if="view === 'list'"
      :groups="groups"
      :is-loading="isLoadingGroups"
      @create="navigate({ groupView: 'create' })"
      @invite="navigate({ groupView: 'invite' })"
      @edit="navigate({ idGroup: $event.idGroup })"
      @delete="confirmDeleteGroup($event)"
    />

    <GroupCreate
      v-else-if="view === 'create'"
      @created="onGroupCreated($event)"
      @cancel="navigate({})"
    />

    <InviteUser
      v-else-if="view === 'invite'"
      :groups="groups"
      :preselected-group-ids="inviteGroupIds"
      @user-invited="onUserInvited($event)"
      @cancel="goBackFromInvite()"
    />

    <GroupEdit
      v-else-if="view === 'edit' && editedGroup"
      :key="editedGroup.idGroup"
      :group="editedGroup"
      :active-tab="editTab"
      @change-tab="navigate({ idGroup: editedGroup.idGroup, groupTab: $event })"
      @back="navigate({})"
      @changed="loadGroups()"
      @renamed="onGroupRenamed($event)"
      @delete="confirmDeleteGroup($event)"
      @invite="navigate({ groupView: 'invite', inviteGroup: $event.idGroup })"
    />

    <ActivityIndicator
      v-else
      :loading="isLoadingGroups"
    />

    <div class="ui-confirm" ref="confirmDeleteGroup">
      <h2>{{ confirmDeleteGroupText }}</h2>
      <p>{{ translate('GroupPermissions_DeleteGroupDescription') }}</p>
      <input role="yes" type="button" :value="translate('General_Yes')"/>
      <input role="no" type="button" :value="translate('General_No')"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
  Matomo,
  MatomoUrl,
  NotificationsStore,
  translate,
} from 'CoreHome';
import GroupList from './GroupList.vue';
import GroupCreate from './GroupCreate.vue';
import GroupEdit from './GroupEdit.vue';
import InviteUser from './InviteUser.vue';
import { notifySuccess } from './notify';
import { Group, GroupOverview } from './types';

const OWN_HASH_PARAMS = ['idGroup', 'groupTab', 'groupView', 'inviteGroup'];
const EDIT_TABS = ['members', 'access', 'autoaccess', 'segments', 'reports', 'settings'];

export default defineComponent({
  components: {
    ActivityIndicator,
    GroupList,
    GroupCreate,
    GroupEdit,
    InviteUser,
  },
  data() {
    return {
      groups: [] as GroupOverview[],
      isLoadingGroups: false,
      hasLoadedGroups: false,
      confirmDeleteGroupText: '',
    };
  },
  mounted() {
    this.loadGroups();
  },
  computed: {
    hashParams(): Record<string, string> {
      const params = (MatomoUrl.hashParsed.value || {}) as Record<string, unknown>;
      const result: Record<string, string> = {};
      OWN_HASH_PARAMS.forEach((name) => {
        const value = params[name] ?? MatomoUrl.urlParsed.value[name];
        if (value !== undefined && value !== null && value !== '') {
          result[name] = String(value);
        }
      });
      return result;
    },
    idGroup(): number|null {
      const idGroup = parseInt(this.hashParams.idGroup || '', 10);
      return idGroup > 0 ? idGroup : null;
    },
    view(): string {
      if (this.idGroup) {
        return 'edit';
      }
      if (this.hashParams.groupView === 'create') {
        return 'create';
      }
      if (this.hashParams.groupView === 'invite' && this.groups.length) {
        return 'invite';
      }
      return 'list';
    },
    editTab(): string {
      const tab = this.hashParams.groupTab;
      return tab && EDIT_TABS.includes(tab) ? tab : 'members';
    },
    editedGroup(): GroupOverview|undefined {
      return this.groups.find((g) => g.idGroup === this.idGroup);
    },
    inviteGroupIds(): number[] {
      const idGroup = parseInt(this.hashParams.inviteGroup || '', 10);
      return idGroup > 0 ? [idGroup] : [];
    },
  },
  watch: {
    editedGroup(group: GroupOverview|undefined) {
      if (!group && this.idGroup && this.hasLoadedGroups && !this.isLoadingGroups) {
        this.onUnknownGroup();
      }
    },
  },
  methods: {
    /**
     * Shows a view by changing the URL hash
     * (keeps the browser history and allows reloading the page).
     */
    navigate(params: Record<string, string|number>) {
      const hash = { ...(MatomoUrl.hashParsed.value || {}) } as Record<string, unknown>;
      OWN_HASH_PARAMS.forEach((name) => {
        delete hash[name];
      });
      Object.entries(params).forEach(([name, value]) => {
        hash[name] = String(value);
      });
      // the parameters may also come from the query string (e.g. links from other pages)
      if (OWN_HASH_PARAMS.some((name) => MatomoUrl.urlParsed.value[name] !== undefined)) {
        const url = new URL(window.location.href);
        OWN_HASH_PARAMS.forEach((name) => url.searchParams.delete(name));
        window.history.replaceState(window.history.state, '', url.toString());
      }
      MatomoUrl.updateHash(hash as Parameters<typeof MatomoUrl.updateHash>[0]);
      window.scrollTo(0, 0);
    },
    loadGroups() {
      this.isLoadingGroups = true;
      return AjaxHelper.fetch<GroupOverview[]>({
        method: 'GroupPermissions.getGroupsOverview',
        filter_limit: -1,
      }, {
        errorElement: '#ajaxErrorManageGroups',
      }).then((groups) => {
        this.groups = groups;
      }).finally(() => {
        this.isLoadingGroups = false;
        this.hasLoadedGroups = true;
        if (this.idGroup && !this.editedGroup) {
          this.onUnknownGroup();
        }
      });
    },
    onUnknownGroup() {
      NotificationsStore.show({
        message: translate('GroupPermissions_ExceptionGroupDoesNotExist'),
        context: 'error',
        type: 'toast',
        id: 'groupPermissionsUnknownGroup',
      });
      this.navigate({});
    },
    onGroupCreated(group: Group) {
      this.loadGroups().then(() => {
        this.navigate({ idGroup: group.idGroup, groupTab: 'members' });
      });
    },
    onGroupRenamed(group: Group) {
      const edited = this.groups.find((g) => g.idGroup === group.idGroup);
      if (edited) {
        edited.name = group.name;
      }
      this.loadGroups();
    },
    onUserInvited(event: { login: string, idGroups: number[] }) {
      this.loadGroups().then(() => {
        if (this.inviteGroupIds.length) {
          this.navigate({ idGroup: this.inviteGroupIds[0], groupTab: 'members' });
        } else {
          this.navigate({});
        }
      });
      return event;
    },
    goBackFromInvite() {
      if (this.inviteGroupIds.length) {
        this.navigate({ idGroup: this.inviteGroupIds[0], groupTab: 'members' });
      } else {
        this.navigate({});
      }
    },
    confirmDeleteGroup(group: Group) {
      this.confirmDeleteGroupText = translate('GroupPermissions_DeleteGroupConfirm', group.name);
      Matomo.helper.modalConfirm(this.$refs.confirmDeleteGroup as HTMLElement, {
        yes: () => this.deleteGroup(group),
      });
    },
    deleteGroup(group: Group) {
      AjaxHelper.post({
        method: 'GroupPermissions.deleteGroup',
      }, {
        idGroup: group.idGroup,
      }, {
        errorElement: '#ajaxErrorManageGroups',
      }).then(() => {
        notifySuccess('groupPermissionsGroupDeleted', 'GroupPermissions_GroupDeleted', group.name);
        this.navigate({});
        this.loadGroups();
      });
    },
  },
});
</script>
