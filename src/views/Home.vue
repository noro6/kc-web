<template>
  <div class="site-top-container">
    <div class="site-title content">制空権シミュレータ v2.0.0</div>
    <v-card class="site-body content">
      <div class="menu-buttons">
        <div class="ma-4">
          <v-btn x-large color="green" dark @click="goAirCalcPage">
            <v-icon>mdi-calculator</v-icon>
            <span class="ml-1">制空権シミュレータ</span>
          </v-btn>
          <div class="mt-5 body-2">
            <div>本サイトの主要機能です。</div>
            <div class="mt-2">
              基地航空隊や艦隊を構築し、実際に出撃する海域から敵艦隊を選択することで、道中を含めた全ての戦闘の制空状態や艦載機の損耗、全滅率などのシミュレーションが可能です。
            </div>
          </div>
        </div>
        <div class="ma-4">
          <v-btn x-large color="blue" dark @click="$router.push('manager')">
            <v-icon>mdi-database-cog</v-icon>
            <span class="ml-1">艦娘 / 装備管理</span>
          </v-btn>
          <div class="mt-5 body-2">
            <div>サブの機能です。</div>
            <div class="mt-2">
              自分のゲーム内の艦娘、装備情報を登録することで、シミュレータ内で選択できる艦娘や装備を絞り込むことができるようになり、あの装備持ってたっけ…？と迷う心配がなくなります。
            </div>
          </div>
        </div>
      </div>
      <v-divider class="my-3"></v-divider>
    </v-card>
  </div>
</template>

<style scoped>
.content {
  margin: 0 auto;
  max-width: 1200px;
}
.site-title {
  font-size: 1.2em;
}
.site-body {
  margin-top: 2rem;
  padding: 1rem;
}
.menu-buttons {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 800px) {
  .menu-buttons {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import SaveData from '@/classes/saveData/saveData';

export default Vue.extend({
  name: 'Home',
  data: () => ({}),
  mounted() {
    const saveData = this.$store.state.saveData as SaveData;
    saveData.disabledMain();
  },
  methods: {
    goAirCalcPage() {
      const saveData = this.$store.state.saveData as SaveData;
      saveData.disabledMain();
      // ルートに無題のデータを生成
      const data = new SaveData();
      data.name = `新規データ${saveData.childItems.length}`;
      data.isActive = true;
      data.isMain = true;
      saveData.childItems.push(data);
      this.$store.dispatch('updateSaveData', saveData);
      this.$store.dispatch('setMainSaveData', data);
      this.$router.push('aircalc');
    },
  },
});
</script>
