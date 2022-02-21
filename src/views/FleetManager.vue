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
    <div class="info-area">
      <v-divider class="mb-2"></v-divider>
      <div class="caption">
        著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。
      </div>
      <div class="caption">また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。</div>
    </div>
  </div>
</template>

<style scoped>
.v-window.v-item-group {
  height: 100%;
  overflow: unset;
}
.info-area {
  margin: 2rem auto 0.5rem auto;
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
