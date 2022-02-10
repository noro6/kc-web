<template>
  <div class="ma-4">
    <div class="mb-3">
      <v-icon x-large>mdi-database-cog</v-icon>
      <span class="ml-1">艦娘 / 装備管理</span>
    </div>
    <v-tabs v-model="tab">
      <v-tab href="#ships">艦娘</v-tab>
      <v-tab href="#items">装備</v-tab>
      <v-tab href="#share">共有</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-tabs-items v-model="tab">
      <v-tab-item value="ships">
        <ships />
      </v-tab-item>
      <v-tab-item value="items">
        <items />
      </v-tab-item>
      <v-tab-item value="share">
        <v-card class="my-3 pa-4">共有</v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<style scoped>
.v-window.v-item-group {
  height: 100%;
  overflow: unset;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Ships from '@/components/database/Ships.vue';
import Items from '@/components/database/Items.vue';

export default Vue.extend({
  name: 'FleetManager',
  components: { Ships, Items },
  data: () => ({
    tab: 'ship',
  }),
});
</script>
