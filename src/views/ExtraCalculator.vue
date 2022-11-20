<template>
  <div class="mb-5">
    <div class="general-container">
      <v-tabs v-model="tab" show-arrows>
        <v-tab>{{ $t("Extra.艦娘性能一覧") }}</v-tab>
        <v-tab>{{ $t("Extra.対潜値計算機") }}</v-tab>
        <v-tab>{{ $t("Extra.戦果砲管理") }}</v-tab>
        <v-tab>{{ $t("Extra.敵艦生息地検索") }}</v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <v-tabs-items v-model="tab" :touchless="true">
        <v-tab-item>
          <div class="my-3 mx-2 body-2">{{ $t("Extra.艦娘の基本ステータスの確認と比較を行えます。") }}</div>
          <div class="pa-2">
            <ship-master-list />
          </div>
        </v-tab-item>
        <v-tab-item>
          <div class="my-3 mx-2 body-2">{{ $t("Extra.艦娘と装備から、指定した対潜値と必要なLvを計算します。") }}</div>
          <div class="pa-2">
            <required-asw-calculator />
          </div>
        </v-tab-item>
        <v-tab-item>
          <div class="mt-3 mx-3 body-2">{{ $t("Extra.戦果に関係する任務の進捗を管理する機能です。") }}</div>
          <quest-manager />
        </v-tab-item>
        <v-tab-item>
          <div class="my-3 mx-2 body-2">
            {{ $t("Extra.指定した敵艦が登場する海域を検索します。データが更新されていない場合もあるので、あくまで参考程度に。") }}
          </div>
          <div class="pa-2">
            <enemy-searcher />
          </div>
        </v-tab-item>
      </v-tabs-items>
    </div>
    <div class="info-area">
      <v-divider class="mb-2"></v-divider>
      <div class="caption">
        {{ $t("Home.著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。") }}
      </div>
      <div class="caption">
        {{ $t("Home.また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。") }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-area {
  margin: 2rem auto 0.5rem auto;
  max-width: 1200px;
}
.general-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipMasterList from '@/components/fleet/ShipMasterList.vue';
import RequiredAswCalculator from '@/components/result/RequiredAswCalculator.vue';
import EnemySearcher from '@/components/map/EnemySearcher.vue';
import QuestManager from '@/components/result/QuestManager.vue';

export default Vue.extend({
  name: 'ExtraCalculator',
  components: {
    ShipMasterList,
    RequiredAswCalculator,
    EnemySearcher,
    QuestManager,
  },
  data: () => ({
    tab: 0,
  }),
  mounted() {
    //
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
  },
  watch: {},
  methods: {},
});
</script>
