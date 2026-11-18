<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsReports">
    <p class="groupPermissionsIntro">
      {{ translate('GroupPermissions_ScheduledReportsDescription') }}
    </p>

    <form class="groupPermissionsCopyReport" @submit.prevent="copyReport()">
      <h3>{{ translate('GroupPermissions_CopyReport') }}</h3>
      <ActivityIndicator v-if="isLoading" :loading="true" />
      <p v-else-if="!reportOptions.length" class="groupPermissionsEmpty">
        {{ translate('GroupPermissions_NoCopyableReports') }}
      </p>
      <div v-else class="groupPermissionsReportField">
        <Field
          uicontrol="select"
          name="groupPermissionsReport"
          :title="translate('GroupPermissions_ScheduledReport')"
          :model-value="selectedReport"
          @update:model-value="selectedReport = $event"
          :options="reportOptions"
        />
      </div>
      <SaveButton
        class="groupPermissionsCopyReportButton"
        :value="translate('GroupPermissions_CopyReportButton')"
        :saving="isSaving"
        :disabled="!selectedReport"
        @confirm="copyReport()"
      />
    </form>

    <div id="ajaxErrorGroupReports"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ActivityIndicator, AjaxHelper } from 'CoreHome';
import { Field, SaveButton } from 'CorePluginsAdmin';
import { CopyableReport, Group } from './types';
import { notifySuccess } from './notify';

export default defineComponent({
  components: {
    ActivityIndicator,
    Field,
    SaveButton,
  },
  props: {
    group: {
      type: Object as PropType<Group>,
      required: true,
    },
  },
  data() {
    return {
      reports: [] as CopyableReport[],
      selectedReport: '',
      isLoading: false,
      isSaving: false,
    };
  },
  mounted() {
    this.loadReports();
  },
  computed: {
    reportOptions(): Array<{ key: string, value: string }> {
      return this.reports.map((r) => ({
        key: String(r.idReport),
        value: `${r.description} (${r.siteName}, ${r.login})`,
      }));
    },
  },
  methods: {
    loadReports() {
      this.isLoading = true;
      return AjaxHelper.fetch<CopyableReport[]>({
        method: 'GroupPermissions.getCopyableReports',
        filter_limit: -1,
      }).then((reports) => {
        this.reports = reports;
      }).finally(() => {
        this.isLoading = false;
      });
    },
    copyReport() {
      const report = this.reports.find((r) => String(r.idReport) === this.selectedReport);
      if (!report || this.isSaving) {
        return;
      }

      this.isSaving = true;
      AjaxHelper.post<string[]>({
        method: 'GroupPermissions.copyReportToGroup',
      }, {
        idReport: report.idReport,
        idGroup: this.group.idGroup,
      }, {
        errorElement: '#ajaxErrorGroupReports',
      }).then((copiedTo) => {
        notifySuccess(
          'groupPermissionsReportCopied',
          'GroupPermissions_ReportCopied',
          report.description,
          String(Array.isArray(copiedTo) ? copiedTo.length : 0),
          this.group.name,
        );
        this.selectedReport = '';
      }).finally(() => {
        this.isSaving = false;
      });
    },
  },
});
</script>
