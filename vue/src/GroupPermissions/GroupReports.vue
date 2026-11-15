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

    <form class="groupPermissionsShareReport" @submit.prevent="shareReport()">
      <h3>{{ translate('GroupPermissions_ShareReport') }}</h3>
      <div class="groupPermissionsReportField">
        <Field
          uicontrol="select"
          name="groupPermissionsReport"
          :title="translate('GroupPermissions_ScheduledReport')"
          :model-value="selectedReport"
          @update:model-value="selectedReport = $event"
          :options="reportOptions"
          :disabled="!reportOptions.length"
        />
      </div>
      <SaveButton
        class="groupPermissionsShareReportButton"
        :value="translate('GroupPermissions_ShareReportButton')"
        :saving="isSaving"
        :disabled="!selectedReport"
        @confirm="shareReport()"
      />
    </form>

    <div id="ajaxErrorGroupReports"></div>

    <table
      class="groupPermissionsReportsTable"
      :class="{ loading: isLoading }"
      v-content-table
    >
      <thead>
        <tr>
          <th>{{ translate('GroupPermissions_ScheduledReport') }}</th>
          <th>{{ translate('General_Website') }}</th>
          <th>{{ translate('GroupPermissions_CreatedBy') }}</th>
          <th class="actions-cell-header">{{ translate('General_Actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading && !sharedReports.length">
          <td colspan="4"><ActivityIndicator :loading="true" /></td>
        </tr>
        <tr v-else-if="!sharedReports.length" class="groupPermissionsEmpty">
          <td colspan="4">{{ translate('GroupPermissions_NoSharedReports') }}</td>
        </tr>
        <tr
          v-for="report in sharedReports"
          :key="report.idReport"
          class="groupPermissionsReportRow"
          :data-id-report="report.idReport"
        >
          <td class="reportDescription">{{ report.description }}</td>
          <td class="reportSite">{{ report.siteName }}</td>
          <td class="reportLogin">{{ report.login }}</td>
          <td class="center actions-cell">
            <button
              class="table-action groupPermissionsUnshareReport"
              :title="translate('GroupPermissions_UnshareReport')"
              @click="confirmUnshareReport(report)"
            >
              <span class="icon-delete"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="ui-confirm" ref="confirmUnshareReport">
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
import { Group, GroupReport } from './types';
import { notifySuccess } from './notify';

// only email reports can be shared (see ReportSharing.php)
const SHAREABLE_REPORT_TYPE = 'email';

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
      reports: [] as GroupReport[],
      selectedReport: '',
      confirmText: '',
      isLoading: false,
      isSaving: false,
    };
  },
  mounted() {
    this.loadReports();
  },
  computed: {
    sharedReports(): GroupReport[] {
      return this.reports.filter((r) => r.isShared);
    },
    reportOptions(): Array<{ key: string, value: string }> {
      return this.reports
        .filter((r) => !r.isShared && r.type === SHAREABLE_REPORT_TYPE)
        .map((r) => ({
          key: String(r.idReport),
          value: `${r.description} (${r.siteName}, ${r.login})`,
        }));
    },
  },
  methods: {
    loadReports() {
      this.isLoading = true;
      return AjaxHelper.fetch<GroupReport[]>({
        method: 'GroupPermissions.getReportsForGroup',
        idGroup: this.group.idGroup,
        filter_limit: -1,
      }).then((reports) => {
        this.reports = reports;
        if (!this.reportOptions.some((o) => o.key === this.selectedReport)) {
          this.selectedReport = '';
        }
      }).finally(() => {
        this.isLoading = false;
      });
    },
    shareReport() {
      const report = this.reports.find((r) => String(r.idReport) === this.selectedReport);
      if (!report || this.isSaving) {
        return;
      }

      this.isSaving = true;
      AjaxHelper.post({
        method: 'GroupPermissions.shareReportWithGroup',
      }, {
        idReport: report.idReport,
        idGroup: this.group.idGroup,
      }, {
        errorElement: '#ajaxErrorGroupReports',
      }).then(() => {
        notifySuccess(
          'groupPermissionsReportShared',
          'GroupPermissions_ReportShared',
          report.description,
          this.group.name,
        );
        this.selectedReport = '';
        return this.loadReports();
      }).finally(() => {
        this.isSaving = false;
      });
    },
    confirmUnshareReport(report: GroupReport) {
      this.confirmText = translate(
        'GroupPermissions_UnshareReportConfirm',
        report.description,
        this.group.name,
      );
      Matomo.helper.modalConfirm(this.$refs.confirmUnshareReport as HTMLElement, {
        yes: () => this.unshareReport(report),
      });
    },
    unshareReport(report: GroupReport) {
      AjaxHelper.post({
        method: 'GroupPermissions.unshareReportFromGroup',
      }, {
        idReport: report.idReport,
        idGroup: this.group.idGroup,
      }, {
        errorElement: '#ajaxErrorGroupReports',
      }).then(() => {
        notifySuccess(
          'groupPermissionsReportUnshared',
          'GroupPermissions_ReportUnshared',
          report.description,
          this.group.name,
        );
        return this.loadReports();
      });
    },
  },
});
</script>
