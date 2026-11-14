<template>
    <p>{{ translate('GroupPermissions_DescriptionGroupsTab') }}</p>

    <CreateGroup
        @group-created="onGroupCreated($event)"
    ></CreateGroup>

    <InviteUser
        :groups="groups"
        @user-invited="onUserInvited($event)"
    ></InviteUser>

    <div class="card">
        <div class="card-content" style="width: 600px">
            <h2>{{ translate('GroupPermissions_ManageGroup') }}</h2>

            <multiselect
                :options="groups"
                track-by="idGroup"
                label="name"
                v-model="selectedGroup"
            ></multiselect>

            <ManageGroup
                v-if="selectedGroup"
                :key="`${selectedGroup.idGroup}-${membersVersion}`"
                :group="selectedGroup"
                @group-renamed="onGroupRenamed($event)"
                @group-deleted="onGroupDeleted($event)"
            ></ManageGroup>
        </div>
    </div>

    <div id="ajaxErrorManageGroups" ref="errorContainer"></div>
    <ActivityIndicator
      :loading="isLoadingGroups || isLoadingDefaultGroup"
      style="padding-top: 10px;"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
  MatomoUrl,
} from 'CoreHome';
import Multiselect from 'vue-multiselect';
import CreateGroup from './CreateGroup.vue';
import InviteUser from './InviteUser.vue';
import ManageGroup from './ManageGroup.vue';

export interface Group {
  idGroup: number;
  name: string;
}

export default defineComponent({
  components: {
    ActivityIndicator,
    Multiselect,
    CreateGroup,
    InviteUser,
    ManageGroup,
  },
  data() {
    return {
      groups: [] as Group[],
      selectedGroup: undefined as Group | undefined,
      isLoadingGroups: false,
      isLoadingDefaultGroup: false,
      membersVersion: 0,
    };
  },
  mounted() {
    this.loadGroupList();
  },
  methods: {
    loadGroupList() {
      this.isLoadingGroups = true;

      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.getAllGroups',
      }, {
        filter_limit: -1,
      },
      {
        errorElement: '#ajaxErrorManageGroups',
      }).then((response) => {
        this.groups = response;
        this.sortGroups();
      }).finally(() => {
        this.isLoadingGroups = false;
        this.loadDefaultGroup();
      });
    },
    loadDefaultGroup() {
      const idGroup = MatomoUrl.getSearchParam('idGroup');

      if (idGroup) {
        this.isLoadingDefaultGroup = true;

        AjaxHelper.post({
          module: 'API',
          format: 'json',
          method: 'GroupPermissions.getGroupWithId',
        }, {
          idGroup,
        },
        {
          errorElement: '#ajaxErrorManageGroups',
        }).then((response) => {
          this.selectedGroup = {
            idGroup: response.idGroup,
            name: response.name,
          };
        }).finally(() => {
          this.isLoadingDefaultGroup = false;
        });
      } else if (this.groups.length > 0) {
        [this.selectedGroup] = this.groups;
      }
    },
    onGroupCreated(group: Group) {
      this.groups.push(group);
      this.sortGroups();
      this.selectedGroup = group;
    },
    onUserInvited(event: { login: string, idGroups: number[] }) {
      // reload the member list if the invited user was added to the currently shown group
      if (this.selectedGroup && event.idGroups.includes(this.selectedGroup.idGroup)) {
        this.membersVersion += 1;
      }
    },
    onGroupRenamed(group: Group) {
      const groupIndex = this.groups.findIndex(
        (g: Group) => g.idGroup === group.idGroup,
      );
      this.groups[groupIndex].name = group.name;
      this.sortGroups();
      this.selectedGroup = group;
    },
    onGroupDeleted(group: Group) {
      this.groups = this.groups.filter((g: Group) => g.idGroup !== group.idGroup);
      this.selectedGroup = this.groups.length > 0 ? this.groups[0] : undefined;
    },
    sortGroups() {
      this.groups.sort((a: Group, b: Group) => a.name.localeCompare(b.name));
    },
  },
});
</script>
