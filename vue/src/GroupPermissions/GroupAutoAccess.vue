<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<template>
  <div class="groupPermissionsAutoAccess">
    <p class="groupPermissionsIntro">{{ translate('GroupPermissions_AutoAccessDescription') }}</p>

    <form class="groupPermissionsAddRule" @submit.prevent="addRule()">
      <h3>{{ translate('GroupPermissions_AddAutoAccessRule') }}</h3>
      <div class="groupPermissionsMatchTypeField">
        <Field
          uicontrol="select"
          name="groupPermissionsMatchType"
          :title="translate('GroupPermissions_MatchType')"
          :model-value="matchType"
          @update:model-value="matchType = $event"
          :options="matchTypes"
        />
      </div>
      <div class="groupPermissionsPatternField">
        <TextField
          name="groupPermissionsPattern"
          :model-value="pattern"
          @update:model-value="pattern = $event"
          :title="patternTitle"
          :inline-help="patternHelp"
          :maxlength="255"
        />
      </div>
      <div class="groupPermissionsRoleField">
        <Field
          uicontrol="select"
          name="groupPermissionsRuleRole"
          :title="translate('UsersManager_Role')"
          :model-value="role"
          @update:model-value="role = $event"
          :options="roles"
        />
      </div>
      <div class="groupPermissionsRuleCapabilities" v-if="capabilityOptions.length">
        <Field
          uicontrol="checkbox"
          var-type="array"
          name="groupPermissionsRuleCapabilities"
          :title="translate('UsersManager_Capabilities')"
          :model-value="selectedCapabilities"
          @update:model-value="selectedCapabilities = $event"
          :options="capabilityOptions"
          :inline-help="translate('GroupPermissions_AutoAccessCapabilitiesHelp')"
        />
      </div>
      <SaveButton
        class="groupPermissionsAddRuleButton"
        :value="translate('GroupPermissions_AddAutoAccessRuleButton')"
        :saving="isSaving"
        :disabled="!pattern.trim() || !role"
        @confirm="addRule()"
      />
    </form>

    <div id="ajaxErrorGroupAutoAccess"></div>

    <table
      class="groupPermissionsRulesTable"
      :class="{ loading: isLoading }"
      v-content-table
    >
      <thead>
        <tr>
          <th>{{ translate('GroupPermissions_MatchType') }}</th>
          <th>{{ translate('GroupPermissions_Pattern') }}</th>
          <th>{{ translate('UsersManager_Role') }}</th>
          <th v-if="hasCapabilities">{{ translate('UsersManager_Capabilities') }}</th>
          <th class="actions-cell-header">{{ translate('General_Actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="isLoading && !rules.length">
          <td :colspan="columnCount"><ActivityIndicator :loading="true" /></td>
        </tr>
        <tr v-else-if="!rules.length" class="groupPermissionsEmpty">
          <td :colspan="columnCount">{{ translate('GroupPermissions_NoAutoAccessRules') }}</td>
        </tr>
        <tr
          v-for="rule in rules"
          :key="rule.idRule"
          class="groupPermissionsRuleRow"
          :data-id-rule="rule.idRule"
        >
          <td class="matchType">{{ matchTypeName(rule.matchType) }}</td>
          <td class="pattern">{{ rule.pattern }}</td>
          <td class="role">{{ roleName(rule.access) }}</td>
          <td class="capabilities" v-if="hasCapabilities">
            {{ capabilityNames(rule.capabilities) }}
          </td>
          <td class="center actions-cell">
            <button
              class="table-action groupPermissionsApplyRule"
              :title="translate('GroupPermissions_ApplyAutoAccessRule')"
              @click="confirmApplyRule(rule)"
            >
              <span class="icon-refresh"></span>
            </button>
            <button
              class="table-action groupPermissionsRemoveRule"
              :title="translate('GroupPermissions_RemoveAutoAccessRule')"
              @click="confirmRemoveRule(rule)"
            >
              <span class="icon-delete"></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="ui-confirm" ref="confirmApplyRule">
      <h2>{{ confirmText }}</h2>
      <input role="yes" type="button" :value="translate('General_Yes')"/>
      <input role="no" type="button" :value="translate('General_No')"/>
    </div>
    <div class="ui-confirm" ref="confirmRemoveRule">
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
import TextField from './TextField.vue';
import {
  AutoAccessRule,
  CapabilityOption,
  Group,
  RoleOption,
} from './types';
import { loadCapabilities, loadRoles, roleName } from './roles';
import { notifySuccess } from './notify';

export default defineComponent({
  components: {
    ActivityIndicator,
    Field,
    SaveButton,
    TextField,
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
  emits: ['changed'],
  data() {
    return {
      rules: [] as AutoAccessRule[],
      roles: [] as RoleOption[],
      capabilities: [] as CapabilityOption[],
      selectedCapabilities: [] as string[],
      siteGroups: [] as string[],
      matchType: 'sitegroup',
      pattern: '',
      role: 'view',
      confirmText: '',
      isLoading: false,
      isSaving: false,
    };
  },
  mounted() {
    loadRoles().then((roles) => {
      this.roles = roles;
    });
    loadCapabilities().then((capabilities) => {
      this.capabilities = capabilities;
    });
    AjaxHelper.fetch<string[]>({ method: 'SitesManager.getSitesGroups' }).then((groups) => {
      this.siteGroups = groups.filter((g) => g !== '');
    }).catch(() => {
      // only used for the help text
    });
    this.loadRules();
  },
  watch: {
    role() {
      // capabilities included in the new role cannot be selected anymore
      const available = this.capabilityOptions.map((o) => o.key);
      this.selectedCapabilities = this.selectedCapabilities.filter((c) => available.includes(c));
    },
  },
  computed: {
    hasCapabilities(): boolean {
      return this.capabilities.length > 0;
    },
    columnCount(): number {
      return this.hasCapabilities ? 5 : 4;
    },
    capabilityOptions(): Array<{ key: string, value: string }> {
      return this.capabilities
        .filter((c) => !c.includedInRoles.includes(this.role))
        .map((c) => ({ key: c.id, value: `${c.category}: ${c.name}` }));
    },
    matchTypes(): Array<{ key: string, value: string }> {
      return [
        { key: 'sitegroup', value: translate('GroupPermissions_MatchTypeSiteGroup') },
        { key: 'url', value: translate('GroupPermissions_MatchTypeUrl') },
      ];
    },
    patternTitle(): string {
      return this.matchType === 'url'
        ? translate('GroupPermissions_MatchTypeUrl')
        : translate('GroupPermissions_MatchTypeSiteGroup');
    },
    patternHelp(): string {
      if (this.matchType === 'url') {
        return translate('GroupPermissions_PatternHelpUrl');
      }
      const help = translate('GroupPermissions_PatternHelpSiteGroup');
      if (!this.siteGroups.length) {
        return help;
      }
      return `${help} ${translate('GroupPermissions_ExistingSiteGroups', this.siteGroups.join(', '))}`;
    },
  },
  methods: {
    roleName(access: string): string {
      return roleName(this.roles, access);
    },
    capabilityNames(ids: string[]): string {
      return ids.map((id) => {
        const capability = this.capabilities.find((c) => c.id === id);
        return capability ? `${capability.category}: ${capability.name}` : id;
      }).join(', ');
    },
    matchTypeName(matchType: string): string {
      const type = this.matchTypes.find((t) => t.key === matchType);
      return type ? type.value : matchType;
    },
    loadRules() {
      this.isLoading = true;
      return AjaxHelper.fetch<AutoAccessRule[]>({
        method: 'GroupPermissions.getAutoAccessRules',
        idGroup: this.group.idGroup,
        filter_limit: -1,
      }).then((rules) => {
        this.rules = rules;
      }).finally(() => {
        this.isLoading = false;
      });
    },
    addRule() {
      const pattern = this.pattern.trim();
      if (!pattern || !this.role || this.isSaving) {
        return;
      }

      this.isSaving = true;
      AjaxHelper.post({
        method: 'GroupPermissions.addAutoAccessRule',
      }, {
        idGroup: this.group.idGroup,
        matchType: this.matchType,
        pattern,
        access: this.role,
        capabilities: this.selectedCapabilities,
      }, {
        errorElement: '#ajaxErrorGroupAutoAccess',
      }).then(() => {
        notifySuccess('groupPermissionsAutoAccessRuleAdded', 'GroupPermissions_AutoAccessRuleAdded');
        this.pattern = '';
        this.selectedCapabilities = [];
        return this.loadRules();
      }).finally(() => {
        this.isSaving = false;
      });
    },
    confirmApplyRule(rule: AutoAccessRule) {
      this.confirmText = translate(
        'GroupPermissions_ApplyAutoAccessRuleConfirm',
        rule.pattern,
        this.group.name,
        roleName(this.roles, rule.access),
      );
      Matomo.helper.modalConfirm(this.$refs.confirmApplyRule as HTMLElement, {
        yes: () => this.applyRule(rule),
      });
    },
    applyRule(rule: AutoAccessRule) {
      AjaxHelper.post<number[]>({
        method: 'GroupPermissions.applyAutoAccessRule',
      }, {
        idGroup: this.group.idGroup,
        idRule: rule.idRule,
      }, {
        errorElement: '#ajaxErrorGroupAutoAccess',
      }).then((idSites) => {
        notifySuccess(
          'groupPermissionsAutoAccessRuleApplied',
          'GroupPermissions_AutoAccessRuleApplied',
          String(idSites.length),
        );
        if (idSites.length) {
          this.$emit('changed');
        }
      });
    },
    confirmRemoveRule(rule: AutoAccessRule) {
      this.confirmText = translate('GroupPermissions_RemoveAutoAccessRuleConfirm', rule.pattern);
      Matomo.helper.modalConfirm(this.$refs.confirmRemoveRule as HTMLElement, {
        yes: () => this.removeRule(rule),
      });
    },
    removeRule(rule: AutoAccessRule) {
      AjaxHelper.post({
        method: 'GroupPermissions.removeAutoAccessRule',
      }, {
        idGroup: this.group.idGroup,
        idRule: rule.idRule,
      }, {
        errorElement: '#ajaxErrorGroupAutoAccess',
      }).then(() => {
        notifySuccess('groupPermissionsAutoAccessRuleRemoved', 'GroupPermissions_AutoAccessRuleRemoved');
        return this.loadRules();
      });
    },
  },
});
</script>
