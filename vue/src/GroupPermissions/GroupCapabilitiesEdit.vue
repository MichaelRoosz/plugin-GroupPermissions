<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<!--
  Capabilities of a group for one website, shown as chips like Matomo's own capability editor
  for users (UsersManager CapabilitiesEdit, whose styles are reused via the "capabilitiesEdit"
  class).
-->
<template>
  <div
    class="capabilitiesEdit groupPermissionsCapabilities"
    :class="{ busy: isBusy }"
  >
    <div
      v-for="capability in shownCapabilities"
      :key="capability.id"
      class="chip"
      :class="{ includedInRole: isIncludedInRole(capability) }"
      :data-capability="capability.id"
    >
      <span
        class="capability-name"
        :title="capabilityTitle(capability)"
      >{{ capability.category }}: {{ capability.name }}</span>
      <span
        v-if="!isIncludedInRole(capability)"
        class="icon-close"
        role="button"
        tabindex="0"
        :title="translate('GroupPermissions_RemoveCapability')"
        :aria-label="translate('GroupPermissions_RemoveCapability')"
        @click="confirmRemove(capability)"
        @keydown.enter="confirmRemove(capability)"
      />
    </div>
    <div
      class="addCapability"
      v-if="role !== 'noaccess' && addOptions.length"
      :title="translate('GroupPermissions_AddCapability')"
    >
      <Field
        :key="addFieldVersion"
        uicontrol="expandable-select"
        :name="`groupPermissionsAddCapability${idGroup}-${idSite}`"
        :model-value="null"
        @update:model-value="addCapability($event)"
        :options="addOptions"
        :disabled="isBusy"
        :full-width="true"
      />
    </div>

    <div class="ui-confirm" ref="confirmRemoveCapability">
      <h2>{{ confirmText }}</h2>
      <input role="yes" type="button" :value="translate('General_Yes')"/>
      <input role="no" type="button" :value="translate('General_No')"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { AjaxHelper, Matomo, translate } from 'CoreHome';
import { Field } from 'CorePluginsAdmin';
import { CapabilityOption } from './types';
import { notifySuccess } from './notify';

export default defineComponent({
  components: {
    Field,
  },
  props: {
    idGroup: {
      type: Number,
      required: true,
    },
    groupName: {
      type: String,
      required: true,
    },
    idSite: {
      type: Number,
      required: true,
    },
    siteName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    /** capabilities granted in addition to the role */
    capabilities: {
      type: Array as PropType<string[]>,
      required: true,
    },
    availableCapabilities: {
      type: Array as PropType<CapabilityOption[]>,
      required: true,
    },
    errorElement: String,
  },
  emits: ['change'],
  data() {
    return {
      isBusy: false,
      confirmText: '',
      addFieldVersion: 0,
    };
  },
  mounted() {
    this.setAddPlaceholder();
  },
  updated() {
    this.setAddPlaceholder();
  },
  computed: {
    capabilitySet(): Set<string> {
      return new Set(this.capabilities);
    },
    shownCapabilities(): CapabilityOption[] {
      if (this.role === 'noaccess') {
        return [];
      }
      return this.availableCapabilities.filter(
        (c) => this.isIncludedInRole(c) || this.capabilitySet.has(c.id),
      );
    },
    addOptions(): Array<{ group: string, key: string, value: string, tooltip: string }> {
      return this.availableCapabilities
        .filter((c) => !this.isIncludedInRole(c) && !this.capabilitySet.has(c.id))
        .map((c) => ({
          group: c.category,
          key: c.id,
          value: c.name,
          tooltip: c.description,
        }))
        .sort((a, b) => a.group.localeCompare(b.group) || a.value.localeCompare(b.value));
    },
  },
  methods: {
    /** Matomo's expandable select has no placeholder, the empty pill would be unlabelled */
    setAddPlaceholder() {
      const input = (this.$el as HTMLElement).querySelector('.addCapability input.select-dropdown');
      if (input) {
        input.setAttribute('placeholder', translate('GroupPermissions_AddCapability'));
      }
    },
    isIncludedInRole(capability: CapabilityOption): boolean {
      return (capability.includedInRoles || []).includes(this.role);
    },
    capabilityTitle(capability: CapabilityOption): string {
      if (this.isIncludedInRole(capability)) {
        return `${capability.description} (${translate('GroupPermissions_IncludedInGroupRole')})`;
      }
      return capability.description;
    },
    capabilityName(id: string): string {
      const capability = this.availableCapabilities.find((c) => c.id === id);
      return capability ? capability.name : id;
    },
    addCapability(id: string|null) {
      // re-create the select, so it is empty again
      this.addFieldVersion += 1;
      if (!id) {
        return;
      }

      this.save('GroupPermissions.addGroupCapabilities', id).then(() => {
        this.$emit('change', [...this.capabilities, id]);
        notifySuccess(
          'groupPermissionsCapabilityUpdated',
          'GroupPermissions_CapabilityAdded',
          this.groupName,
          this.capabilityName(id),
          this.siteName,
        );
      }).catch(() => undefined);
    },
    confirmRemove(capability: CapabilityOption) {
      this.confirmText = translate(
        'GroupPermissions_RemoveCapabilityConfirm',
        capability.name,
        this.groupName,
        this.siteName,
      );
      Matomo.helper.modalConfirm(this.$refs.confirmRemoveCapability as HTMLElement, {
        yes: () => this.removeCapability(capability.id),
      });
    },
    removeCapability(id: string) {
      this.save('GroupPermissions.removeGroupCapabilities', id).then(() => {
        this.$emit('change', this.capabilities.filter((c) => c !== id));
        notifySuccess(
          'groupPermissionsCapabilityUpdated',
          'GroupPermissions_CapabilityRemoved',
          this.groupName,
          this.capabilityName(id),
          this.siteName,
        );
      }).catch(() => undefined);
    },
    save(method: string, capability: string): Promise<unknown> {
      this.isBusy = true;
      return AjaxHelper.post({
        method,
      }, {
        idGroup: this.idGroup,
        capabilities: capability,
        idSites: this.idSite,
      }, this.errorElement ? { errorElement: this.errorElement } : {}).finally(() => {
        this.isBusy = false;
      });
    },
  },
});
</script>
