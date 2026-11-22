<!--
  Matomo - free/libre analytics platform

  @link    https://matomo.org
  @license https://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
-->

<!--
  Text input with the markup of Matomo's Field component (label, inline help), but updating
  its value on every input. Matomo's text Field debounces its updates by 50ms, so pressing
  Enter right after typing would submit an outdated value.
-->
<template>
  <div class="form-group row matomo-form-field groupPermissionsTextField">
    <div class="col s12 input-field" :class="{ m6: !fullWidth }">
      <input
        :id="name"
        :name="name"
        class="control_text"
        :type="type"
        :value="modelValue"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        @input="onInput"
        @focus="hasFocus = true"
        @blur="hasFocus = false"
      />
      <label :for="name" :class="{ active: hasFocus || !!modelValue }">{{ title }}</label>
    </div>
    <div class="col s12" :class="{ m6: !fullWidth }" v-if="inlineHelp">
      <div class="form-help">
        <span class="inline-help">{{ inlineHelp }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
    },
    title: String,
    inlineHelp: String,
    type: {
      type: String,
      default: 'text',
    },
    maxlength: Number,
    autocomplete: {
      type: String,
      default: 'off',
    },
    autofocus: Boolean,
    fullWidth: Boolean,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      hasFocus: false,
    };
  },
  mounted() {
    if (this.autofocus) {
      (this.$el.querySelector('input') as HTMLInputElement).focus();
    }
  },
  methods: {
    onInput(event: Event) {
      this.$emit('update:modelValue', (event.target as HTMLInputElement).value);
    },
  },
});
</script>
