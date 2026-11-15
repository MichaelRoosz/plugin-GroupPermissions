<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <ContentBlock
    class="groupPermissionsEditGroup"
    :content-title="translate('GroupPermissions_EditGroup', group.name)"
  >
    <div class="row">
      <div class="col s12 m3 entityList">
        <ul class="listCircle">
          <li
            v-for="item in menu"
            :key="item.tab"
            :class="{ active: activeTab === item.tab }"
            :data-tab="item.tab"
          >
            <a href="" @click.prevent="$emit('change-tab', item.tab)">
              {{ item.title }}
              <span
                v-if="item.count !== undefined"
                class="groupPermissionsCount"
              >{{ item.count }}</span>
            </a>
          </li>
        </ul>
        <div class="entityCancel">
          <a
            href=""
            class="entityCancelLink groupPermissionsBackToGroups"
            @click.prevent="$emit('back')"
          >
            <span class="icon-arrow-left"></span>
            {{ translate('GroupPermissions_BackToGroups') }}
          </a>
        </div>
      </div>
      <div class="col s12 m9 visibleTab">
        <GroupMembers
          v-if="activeTab === 'members'"
          :group="group"
          @changed="$emit('changed')"
          @invite="$emit('invite', group)"
        />
        <GroupWebsiteAccess
          v-else-if="activeTab === 'access'"
          :group="group"
          @changed="$emit('changed')"
        />
        <GroupAutoAccess
          v-else-if="activeTab === 'autoaccess'"
          :group="group"
          @changed="$emit('changed')"
        />
        <GroupSegments
          v-else-if="activeTab === 'segments'"
          :group="group"
        />
        <GroupReports
          v-else-if="activeTab === 'reports'"
          :group="group"
        />
        <GroupSync
          v-else-if="activeTab === 'sync'"
          :group="group"
        />
        <GroupSettings
          v-else-if="activeTab === 'settings'"
          :group="group"
          @renamed="$emit('renamed', $event)"
          @delete="$emit('delete', group)"
        />
      </div>
    </div>
  </ContentBlock>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ContentBlock, translate } from 'CoreHome';
import GroupMembers from './GroupMembers.vue';
import GroupWebsiteAccess from './GroupWebsiteAccess.vue';
import GroupAutoAccess from './GroupAutoAccess.vue';
import GroupSegments from './GroupSegments.vue';
import GroupReports from './GroupReports.vue';
import GroupSync from './GroupSync.vue';
import GroupSettings from './GroupSettings.vue';
import { GroupOverview } from './types';

export default defineComponent({
  components: {
    ContentBlock,
    GroupMembers,
    GroupWebsiteAccess,
    GroupAutoAccess,
    GroupSegments,
    GroupReports,
    GroupSync,
    GroupSettings,
  },
  props: {
    group: {
      type: Object as PropType<GroupOverview>,
      required: true,
    },
    activeTab: {
      type: String,
      default: 'members',
    },
  },
  emits: ['back', 'change-tab', 'changed', 'renamed', 'delete', 'invite'],
  computed: {
    menu(): Array<{ tab: string, title: string, count?: number }> {
      return [
        { tab: 'members', title: translate('GroupPermissions_Members'), count: this.group.memberCount },
        { tab: 'access', title: translate('GroupPermissions_WebsiteAccess'), count: this.group.siteCount },
        { tab: 'autoaccess', title: translate('GroupPermissions_AutoAccess') },
        { tab: 'segments', title: translate('GroupPermissions_Segments') },
        { tab: 'reports', title: translate('GroupPermissions_ScheduledReports') },
        { tab: 'sync', title: translate('GroupPermissions_GroupSync') },
        { tab: 'settings', title: translate('General_Settings') },
      ];
    },
  },
});
</script>
