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
          <v-btn x-large dark color="blue" @click="$router.push('manager')">
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
      <!-- <div class="ma-4 pt-3">
        <v-btn dark color="teal" @click="importOldData">データ引継ぎ</v-btn>
        <div class="mt-2 body-2">
          旧<a href="https://noro6.github.io/kcTools" target="_blank">制空権シミュレータ v1.x.x</a>で作成していた編成データを引き継ぎます。
        </div>
      </div> -->
    </v-card>
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
.info-area {
  margin: 2rem auto 0.5rem auto;
  max-width: 1200px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import LZString from 'lz-string';
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

      const actives = saveData.fetchActiveData();
      if (actives.length) {
        // タブがあるならそれの最初のやつ
        actives[0].isMain = true;
        this.$store.dispatch('updateSaveData', saveData);
        this.$store.dispatch('setMainSaveData', actives[0]);
      } else {
        // ルートに無題のデータを生成
        const data = new SaveData();
        data.name = `新規データ${saveData.childItems.length}`;
        data.isActive = true;
        data.isMain = true;
        saveData.childItems.push(data);
        this.$store.dispatch('updateSaveData', saveData);
        this.$store.dispatch('setMainSaveData', data);
      }
      this.$router.push('aircalc');
    },
    importOldData() {
      // 旧データ引継ぎ
      const strage = window.localStorage;
      try {
        if (!strage) {
          return;
        }
        const presets = strage.getItem('presets');
        const json = presets ? JSON.parse(presets) : undefined;
        if (!json || !json.length) {
          return;
        }

        const data = json[0][2] as string;
        if (!data) {
          return;
        }

        const replaced = data.replaceAll('-', '_').replaceAll('+', '-');
        const ss = LZString.decompressFromEncodedURIComponent(replaced);
        if (ss) {
          console.log(ss);
          const ssss = JSON.parse(ss);
          console.log(`unko${ssss}ilpo`);
        }
      } catch (error) {
        //
      }
    },
  },
});
</script>
