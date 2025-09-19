<template>
  <div class="card">
    <div class="card-content" style="width: 600px">
        <div>
            <h2>{{ translate('GroupPermissions_CreateNewGroup') }}</h2>

            <div>
                <input
                  type="text"
                  v-model="groupName"
                />
                <input
                  type="button"
                  :value="translate('GroupPermissions_CreateNewGroupButton')"
                  style="padding: 8px;"
                  @click="createGroup(groupName)"
                />
            </div>

            <div id="ajaxErrorCreateGroup" ref="errorContainer"></div>
            <ActivityIndicator
              :loading="isCreatingGroup"
              style="padding-top: 10px;"
            />
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  ActivityIndicator,
  AjaxHelper,
} from 'CoreHome';

export default defineComponent({
  components: {
    ActivityIndicator,
  },
  data() {
    return {
      groupName: '',
      isCreatingGroup: false,
    };
  },
  emits: ['group-created'],
  methods: {
    createGroup(groupName: string) {
      this.isCreatingGroup = true;

      AjaxHelper.post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.createGroup',
      }, {
        groupName,
      },
      {
        errorElement: '#ajaxErrorCreateGroup',
      }).then((response) => {
        this.$emit('group-created', response);
        this.groupName = '';
      }).finally(() => {
        this.isCreatingGroup = false;
      });
    },
  },
});
</script>
