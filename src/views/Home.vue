<template>
  <div class="site-top-container">
    <div class="site-title content">
      制空権シミュレータ <span class="body-1">v{{ $store.state.siteVersion }}</span>
    </div>
    <v-card class="site-body content">
      <div class="menu-buttons">
        <div class="my-2 mx-4">
          <v-btn x-large color="green" dark @click="goAirCalcPage">
            <v-icon>mdi-calculator</v-icon>
            <span class="ml-1">{{ $t("Home.title") }}</span>
          </v-btn>
          <div class="mt-2 body-2">
            <div>{{ $t("Home.description1") }}</div>
            <div class="mt-2">
              {{ $t("Home.description2") }}
            </div>
          </div>
        </div>
        <div class="my-2 mx-4">
          <v-btn x-large dark color="blue" @click="$router.push('manager')">
            <v-icon>mdi-database-cog</v-icon>
            <span class="ml-1">{{ $t("Manager.title") }}</span>
          </v-btn>
          <div class="mt-2 body-2">
            <div>{{ $t("Manager.description1") }}</div>
            <div class="mt-2">
              {{ $t("Manager.description2") }}
            </div>
          </div>
        </div>
        <div class="mt-4 mx-4">
          <v-btn x-large dark color="blue darken-4" @click="$router.push('list')">
            <v-icon>mdi-human-greeting-variant</v-icon>
            <span class="ml-1">{{ $t("OtherData.title") }}</span>
          </v-btn>
          <div class="mt-2 body-2">
            <div>{{ $t("OtherData.description1") }}</div>
          </div>
        </div>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="ma-2">
        <div class="ml-2">{{ $t("DataImport.title") }}</div>
        <div class="ml-4 mt-2 body-2">
          <a href="https://noro6.github.io/kcTools" target="_blank">{{ $t("DataImport.oldVersion") }}</a>
          {{ $t("DataImport.description1") }}
        </div>
        <div class="d-flex flex-wrap ml-2">
          <v-btn class="ma-2" color="teal" @click="checkOldData()" :dark="!imported" :disabled="imported">
            {{ $t("DataImport.importSaveData") }}
          </v-btn>
          <v-btn class="ma-2" color="teal" @click="checkOldStockData()" :dark="!importedStock" :disabled="importedStock">
            {{ $t("DataImport.importShipAndItem") }}
          </v-btn>
        </div>
      </div>
      <v-divider class="my-4"></v-divider>
      <div class="ma-2">
        <div class="ml-2">{{ $t("Linkage.title") }}</div>
        <div class="ml-4 mt-2 body-2">
          <div>{{ $t("Linkage.description1") }}</div>
          <div class="text--secondary">(e.g.) https://noro6.github.io/kc-web?predeck={"version":4,"hqlv":120,"f1":{"s1":...</div>
        </div>
      </div>
    </v-card>
    <div class="info-area">
      <v-divider class="mb-2"></v-divider>
      <div class="caption">{{ $t("Warning.message1") }}</div>
      <div class="caption">{{ $t("Warning.message2") }}</div>
    </div>
    <v-dialog v-model="importConfirmDialog" transition="scroll-x-transition" width="500">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <div class="body-2">{{ $t("DataImport.confirm1.description1") }}</div>
          <div class="mb-5 body-2">{{ $t("DataImport.confirm1.description2") }}</div>
          <v-text-field v-model="importFileName" dense outlined maxlength="100" counter label="フォルダー名"></v-text-field>
          <div class="d-flex mt-3">
            <v-btn class="ml-auto" color="success" @click.stop="importOldData" :disabled="isNameEmpty || imported">{{ $t("Common.OK") }}</v-btn>
            <v-btn class="ml-4" color="secondary" @click.stop="importConfirmDialog = false">{{ $t("Common.Cancel") }}</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="440">
      <v-card class="pa-3">
        <div class="ma-4">
          <div class="body-2">{{ $t("DataImport.confirm2.description1") }}</div>
          <div class="body-2">{{ $t("DataImport.confirm2.description2") }}</div>
          <div class="body-2 mt-3">{{ $t("DataImport.confirm2.description3") }}</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="success" dark :disabled="!confirmDialog" @click.stop="importOldStockData()">{{ $t("Common.OK") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Common.Cancel") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.content {
  margin: 0 auto;
  max-width: 1200px;
}
.site-title {
  margin-top: 1rem;
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
import SaveData from '@/classes/saveData/saveData';
import Convert, { OldShipStockJson } from '@/classes/convert';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import ShipMaster from '@/classes/fleet/shipMaster';

export default Vue.extend({
  name: 'Home',
  mounted() {
    const saveData = this.$store.state.saveData as SaveData;
    saveData.disabledMain();
  },
  data: () => ({
    imported: false,
    importConfirmDialog: false,
    importFileName: '引き継ぎデータ',
    confirmDialog: false,
    importedStock: false,
  }),
  computed: {
    isNameEmpty(): boolean {
      return this.importFileName.length <= 0;
    },
  },
  methods: {
    goAirCalcPage() {
      const saveData = this.$store.state.saveData as SaveData;
      saveData.disabledMain();

      // ルートに無題のデータを生成
      const data = new SaveData();
      data.name = saveData.getNewSaveDataName();
      data.isActive = true;
      data.isMain = true;
      saveData.childItems.push(data);
      this.$store.dispatch('updateSaveData', saveData);
      this.$store.dispatch('setMainSaveData', data);
      this.$router.push('aircalc');
    },
    checkOldData() {
      // 過去データが存在するかチェック
      const storage = window.localStorage;
      if (!storage) {
        this.$emit('inform', '旧編成データが見つかりませんでした。', true);
        this.imported = true;
        return;
      }

      const presets = storage.getItem('presets');
      const presetJSON = presets ? JSON.parse(presets) : undefined;
      if (!presetJSON || !presetJSON.length) {
        this.$emit('inform', '旧編成データが見つかりませんでした。', true);
        this.imported = true;
        return;
      }

      this.imported = false;
      this.importConfirmDialog = true;
    },
    checkOldStockData() {
      this.importedStock = true;

      // 過去データが存在するかチェック
      const storage = window.localStorage;
      if (!storage) {
        this.$emit('inform', '所持装備 / 艦娘データが見つかりませんでした。', true);
        return;
      }

      const shipStocks = storage.getItem('shipStock');
      const itemStocks = storage.getItem('planeStock');
      const shipStocksJSON = shipStocks ? JSON.parse(shipStocks) : undefined;
      const itemStocksJSON = itemStocks ? JSON.parse(itemStocks) : undefined;
      if ((!shipStocksJSON || !shipStocksJSON.length) && (!itemStocksJSON || !itemStocksJSON.length)) {
        this.$emit('inform', '所持装備 / 艦娘データが見つかりませんでした。', true);
        return;
      }

      const hasCurrentStock = !!this.$store.state.shipStock.length || !!this.$store.state.itemStock.length;
      if (hasCurrentStock) {
        // 既にデータがあるならダイアログ
        this.confirmDialog = true;
        this.importedStock = false;
      } else {
        this.importOldStockData();
      }
    },
    importOldStockData() {
      this.importedStock = true;

      // 過去データが存在するかチェック
      const storage = window.localStorage;
      if (!storage) {
        this.$emit('inform', '所持装備 / 艦娘データが見つかりませんでした。', true);
        return;
      }

      const shipStocks = storage.getItem('shipStock');
      const itemStocks = storage.getItem('planeStock');
      const shipStocksJSON = shipStocks ? JSON.parse(shipStocks) : undefined;
      const itemStocksJSON = itemStocks ? JSON.parse(itemStocks) : undefined;
      if ((!shipStocksJSON || !shipStocksJSON.length) && (!itemStocksJSON || !itemStocksJSON.length)) {
        this.$emit('inform', '所持装備 / 艦娘データが見つかりませんでした。', true);
        return;
      }

      try {
        const setting = this.$store.state.siteSetting as SiteSetting;
        let restoreResult = false;
        if (shipStocksJSON && shipStocksJSON.length) {
          // 在籍艦娘情報変換 & 上書き
          const newStocks = Convert.restoreShipStock(shipStocksJSON as OldShipStockJson[], this.$store.state.ships as ShipMaster[]);
          if (newStocks.length) {
            restoreResult = true;
            // 設定書き換え
            setting.isStockOnlyForShipList = true;
            this.$store.dispatch('updateShipStock', newStocks);
          }
        }

        if (itemStocksJSON && itemStocksJSON.length) {
          // 所持装備情報変換 & 上書き
          const newStocks = Convert.restoreItemStock(itemStocksJSON as ItemStock[]);
          if (newStocks.length) {
            restoreResult = true;
            // 設定書き換え
            setting.isStockOnlyForItemList = true;
            this.$store.dispatch('updateItemStock', newStocks);
          }
        }

        this.$store.dispatch('updateSetting', setting);

        if (!restoreResult) {
          this.$emit('inform', 'データを読み込みましたが、引き継ぎ可能な編成データがありませんでした。', true);
          return;
        }

        this.$emit('inform', '所持装備 / 艦娘データの引き継ぎが完了しました。');
      } catch (error) {
        this.$emit('inform', 'データ引継ぎに失敗しました。', true);
        console.error(error);
      }
      this.confirmDialog = false;
    },
    importOldData() {
      this.imported = true;
      // 旧データ引継ぎ
      const storage = window.localStorage;
      try {
        const presets = storage.getItem('presets');
        const presetJSON = presets ? JSON.parse(presets) : undefined;
        if (!presetJSON || !presetJSON.length) {
          return;
        }

        const setting = storage.getItem('setting');
        const settingJSON = setting ? JSON.parse(setting) : undefined;
        const converter = new Convert(this.$store.state.items, this.$store.state.ships, this.$store.state.defaultEnemies);
        const oldData = converter.convertOldSimulatorToSaveData(presetJSON, settingJSON);

        if (oldData && oldData.childItems.length) {
          oldData.name = this.importFileName ? this.importFileName : '引き継ぎデータ';
          // セーブデータルート取得
          const saveData = this.$store.state.saveData as SaveData;
          const root = saveData.childItems.find((v) => v.isDirectory);
          if (root) {
            root.childItems.push(oldData);
            root.sortChild();
            this.$store.dispatch('updateSaveData', saveData);

            // 旧データ取り込み完了通知
            this.$emit('inform', '編成データの引き継ぎが完了しました。');
            this.$emit('openSidebar');
          }
        } else {
          this.$emit('inform', 'データを読み込みましたが、引き継ぎ可能な編成データがありませんでした。', true);
        }
      } catch (error) {
        this.$emit('inform', 'データ引継ぎに失敗しました。', true);
        console.error(error);
      }

      this.importConfirmDialog = false;
    },
  },
});
</script>
