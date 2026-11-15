<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsSegments">
    <p class="groupPermissionsIntro">{{ translate('GroupPermissions_SegmentsDescription') }}</p>

    <form class="groupPermissionsShareSegment" @submit.prevent="shareSegment()">
      <h3>{{ translate('GroupPermissions_ShareSegment') }}</h3>
      <div class="groupPermissionsSegmentField">
        <Field
          uicontrol="select"
          name="groupPermissionsSegment"
          :title="translate('GroupPermissions_Segment')"
          :model-value="selectedSegment"
          @update:model-value="selectedSegment = $event"
          :options="segmentOptions"
          :disabled="!segmentOptions.length"
        />
      </div>
      <SaveButton
        class="groupPermissionsShareSegmentButton"
        :value="translate('GroupPermissions_ShareSegmentButton')"
        :saving="isSaving"
        :disabled="!selectedSegment"
        @confirm="shareSegment()"
      />
    </form>

    <div id="ajaxErrorGroupSegments"></div>

    <table
      class="groupPermissionsSegmentsTable"
      :class="{ loading: isLoading }"
      v-content-table
    >
      <thead>
        <tr>
          <th>{{ translate('GroupPermissions_Segment') }}</th>
          <th>{{ translate('General_Website') }}</th>
          <th>{{ translate('GroupPermissions_CreatedBy') }}</th>
          <th class="actions-cell-header">{{ translate('General_Actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading && !sharedSegments.length">
          <td colspan="4"><ActivityIndicator :loading="true" /></td>
        </tr>
        <tr v-else-if="!sharedSegments.length" class="groupPermissionsEmpty">
          <td colspan="4">{{ translate('GroupPermissions_NoSharedSegments') }}</td>
        </tr>
        <tr
          v-for="segment in sharedSegments"
          :key="segment.idSegment"
          class="groupPermissionsSegmentRow"
          :data-id-segment="segment.idSegment"
        >
          <td class="segmentName" :title="segment.definition">{{ segment.name }}</td>
          <td class="segmentSite">{{ siteName(segment) }}</td>
          <td class="segmentLogin">{{ segment.login }}</td>
          <td class="center actions-cell">
            <button
              class="table-action groupPermissionsUnshareSegment"
              :title="translate('GroupPermissions_UnshareSegment')"
              @click="confirmUnshareSegment(segment)"
            >
              <span class="icon-delete"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="ui-confirm" ref="confirmUnshareSegment">
      <h2>{{ confirmText }}</h2>
      <input role="yes" type="button" :value="translate('General_Yes')"/>
      <input role="no" type="button" :value="translate('General_No')"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
  ContentTable,
  Matomo,
  translate,
} from 'CoreHome';
import { Field, SaveButton } from 'CorePluginsAdmin';
import { Group, GroupSegment } from './types';
import { notifySuccess } from './notify';

export default defineComponent({
  components: {
    ActivityIndicator,
    Field,
    SaveButton,
  },
  directives: {
    ContentTable,
  },
  props: {
    group: {
      type: Object as PropType<Group>,
      required: true,
    },
  },
  data() {
    return {
      segments: [] as GroupSegment[],
      selectedSegment: '',
      confirmText: '',
      isLoading: false,
      isSaving: false,
    };
  },
  mounted() {
    this.loadSegments();
  },
  computed: {
    sharedSegments(): GroupSegment[] {
      return this.segments.filter((s) => s.isShared);
    },
    segmentOptions(): Array<{ key: string, value: string }> {
      return this.segments
        .filter((s) => !s.isShared && !s.enabledAllUsers)
        .map((s) => ({
          key: String(s.idSegment),
          value: `${s.name} (${this.siteName(s)}, ${s.login})`,
        }));
    },
  },
  methods: {
    siteName(segment: GroupSegment): string {
      return segment.idSite ? segment.siteName : translate('UsersManager_AllWebsites');
    },
    loadSegments() {
      this.isLoading = true;
      return AjaxHelper.fetch<GroupSegment[]>({
        method: 'GroupPermissions.getSegmentsForGroup',
        idGroup: this.group.idGroup,
        filter_limit: -1,
      }).then((segments) => {
        this.segments = segments;
        if (!this.segmentOptions.some((o) => o.key === this.selectedSegment)) {
          this.selectedSegment = '';
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    shareSegment() {
      const segment = this.segments.find((s) => String(s.idSegment) === this.selectedSegment);
      if (!segment || this.isSaving) {
        return;
      }

      this.isSaving = true;
      AjaxHelper.post({
        method: 'GroupPermissions.shareSegmentWithGroup',
      }, {
        idSegment: segment.idSegment,
        idGroup: this.group.idGroup,
      }, {
        errorElement: '#ajaxErrorGroupSegments',
      }).then(() => {
        notifySuccess(
          'groupPermissionsSegmentShared',
          'GroupPermissions_SegmentShared',
          segment.name,
          this.group.name,
        );
        this.selectedSegment = '';
        return this.loadSegments();
      }).finally(() => {
        this.isSaving = false;
      });
    },
    confirmUnshareSegment(segment: GroupSegment) {
      this.confirmText = translate(
        'GroupPermissions_UnshareSegmentConfirm',
        segment.name,
        this.group.name,
      );
      Matomo.helper.modalConfirm(this.$refs.confirmUnshareSegment as HTMLElement, {
        yes: () => this.unshareSegment(segment),
      });
    },
    unshareSegment(segment: GroupSegment) {
      AjaxHelper.post({
        method: 'GroupPermissions.unshareSegmentFromGroup',
      }, {
        idSegment: segment.idSegment,
        idGroup: this.group.idGroup,
      }, {
        errorElement: '#ajaxErrorGroupSegments',
      }).then(() => {
        notifySuccess(
          'groupPermissionsSegmentUnshared',
          'GroupPermissions_SegmentUnshared',
          segment.name,
          this.group.name,
        );
        return this.loadSegments();
      });
    },
  },
});
</script>
