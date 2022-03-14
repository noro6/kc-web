<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app temporary dark width="480">
      <save-data-view :root-data="saveData" :handle-inform="inform" />
    </v-navigation-drawer>
    <v-app-bar app dense dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-btn icon @click="$route.path !== '/' && $router.push({ path: '/' })" :disabled="$route.path === '/'">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn class="header-btn" :disabled="$route.path !== '/aircalc'" text @click.stop="saveCurrentData">
        <v-icon small>mdi-content-save</v-icon>
        <span class="d-none d-md-inline">編成</span>保存
      </v-btn>
      <v-btn
        class="header-btn"
        :disabled="$route.path !== '/aircalc' || mainSaveData.isUnsaved"
        text
        @click.stop="handleSaveAndRenameCurrentData"
      >
        <v-icon small>mdi-content-duplicate</v-icon>別名保存
      </v-btn>
      <v-btn class="header-btn" :disabled="$route.path !== '/aircalc'" text @click.stop="clickedShare">
        <v-icon small>mdi-share-variant</v-icon>
        <span class="d-none d-md-inline">編成</span>共有
      </v-btn>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="arrow-btn" text :disabled="$route.path !== '/aircalc' || !enabledUndo" v-bind="attrs" v-on="on" @click="undoClicked"
            ><v-icon small>mdi-undo</v-icon></v-btn
          >
        </template>
        <span>元に戻す</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="arrow-btn"
            text
            :disabled="$route.path !== '/aircalc' || !enabledRedo"
            v-bind="attrs"
            v-on="on"
            @click="redoClicked"
          >
            <v-icon small>mdi-redo</v-icon>
          </v-btn>
        </template>
        <span>やり直す</span>
      </v-tooltip>
      <div id="multipurpose-textarea" class="no-scroll">
        <v-textarea
          v-model.trim="somethingText"
          outlined
          dense
          hide-details
          no-resize
          placeholder="デッキビルダー形式データ:{version:4,hqlv:120,f1:{s1:..."
          rows="1"
          :color="getTextareaColor"
          :append-icon="somethingText ? 'mdi-send' : ''"
          clear-icon="mdi-close-circle"
          clearable
          :loading="readState"
          @click:append="readSomethingText"
        ></v-textarea>
      </div>
      <v-btn icon @click="configDialog = true"><v-icon>mdi-cog</v-icon></v-btn>
      <template v-slot:extension>
        <save-data-tab :save-data="saveData" :setting="setting" />
      </template>
    </v-app-bar>
    <v-main>
      <div class="px-2 px-md-4">
        <router-view @inform="inform" @openSidebar="drawer = true" />
      </div>
      <v-snackbar v-model="readInform" :color="readResultColor" top>
        {{ readInformText }}
        <template v-slot:action="{ attrs }">
          <v-btn icon v-bind="attrs" @click="readInform = false"><v-icon>mdi-close</v-icon></v-btn>
        </template>
      </v-snackbar>
    </v-main>
    <v-footer app dark class="d-flex justify-center">
      <span class="d-md-none text-caption">
        <span class="mr-2">要望・バグ報告:</span>
        <a href="https://odaibako.net/u/noro_006" class="blue--text text--accent-1" target="_blank">お題箱</a>
        <span class="ml-3 mr-2">連絡先:</span>
        <a href="https://twitter.com/noro_006" class="blue--text text--accent-1" target="_blank">Twitter</a>
        <span class="ml-3 mr-2">カンパ:</span>
        <a href="https://www.amazon.jp/hz/wishlist/ls/1OX9QVZF828GD?ref_=wl_share" class="blue--text text--accent-1" target="_blank"
          >こちら</a
        >
      </span>
      <span class="d-none d-md-inline text-caption">
        本サイトに関する質問・要望・バグ報告・感想などは
        <a href="https://odaibako.net/u/noro_006" class="blue--text text--accent-1" target="_blank">お題箱</a>
        へ。その他、作者へのご連絡は
        <a href="https://twitter.com/noro_006" class="blue--text text--accent-1" target="_blank">Twitter</a>
        までお願いします。カンパ等ご支援は
        <a href="https://www.amazon.jp/hz/wishlist/ls/1OX9QVZF828GD?ref_=wl_share" class="blue--text text--accent-1" target="_blank"
          >こちら</a
        >から。
      </span>
    </v-footer>
    <v-dialog v-model="configDialog" width="500" @input="toggleConfigDialog">
      <v-card>
        <div class="px-10 py-5">
          <div class="my-5">
            <div class="mb-2">カラーテーマ</div>
            <v-btn
              @click="toggleSiteTheme(false)"
              color="grey"
              :class="{
                primary: !$vuetify.theme.dark,
                secondary: $vuetify.theme.dark,
              }"
            >
              <span class="pr-2">Light</span><v-icon>mdi-brightness-5</v-icon>
            </v-btn>
            <span class="mx-1"></span>
            <v-btn
              @click="toggleSiteTheme(true)"
              :class="{
                primary: $vuetify.theme.dark,
                secondary: !$vuetify.theme.dark,
              }"
            >
              <span class="pr-2">Dark</span><v-icon>mdi-moon-waxing-crescent</v-icon>
            </v-btn>
          </div>
          <v-divider></v-divider>
          <div class="my-5">
            <div>未保存の編成タブを閉じる際の挙動</div>
            <div class="d-flex">
              <v-checkbox v-model="setting.confirmCloseTab" hide-details dense label="確認ダイアログを表示する"></v-checkbox>
              <v-spacer></v-spacer>
            </div>
          </div>
          <v-divider></v-divider>
          <div class="my-5">
            <div class="mb-1">装備選択時のデフォルト熟練度</div>
            <div class="initial-level-items">
              <setting-initial-level v-for="(item, i) in setting.planeInitialLevels" :key="i" :index="i" :setting="setting" />
              <setting-initial-level :index="-1" :setting="setting" />
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="loading" persistent width="300">
      <v-card dark>
        <v-card-text>
          <div class="pt-2">マスターデータ読込中...</div>
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="800">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <v-text-field v-model="editedName" dense outlined maxlength="100" counter label="編成データ名"></v-text-field>
          <v-textarea
            v-model.trim="editedRemarks"
            rows="10"
            dense
            outlined
            hide-details
            label="補足情報"
            class="remarks-input"
          ></v-textarea>
          <div class="d-flex mt-3">
            <v-btn class="ml-auto" color="success" @click.stop="saveAndRenameCurrentData" :disabled="isNameEmptry">保存</v-btn>
            <v-btn class="ml-4" color="secondary" @click.stop="editDialog = false">戻る</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="shareDialog" transition="scroll-x-transition" width="400">
      <share-dialog :handle-close="closeShareDialog" ref="shareDialog" />
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import * as _ from 'lodash';
import Convert from '@/classes/convert';
import SaveDataView from '@/components/saveData/SaveDataView.vue';
import SaveDataTab from '@/components/saveData/SaveDataTab.vue';
import ShareDialog from '@/components/saveData/ShareDialog.vue';
import SettingInitialLevel from './components/item/SettingInitialLevel.vue';
import SaveData from './classes/saveData/saveData';
import SiteSetting from './classes/siteSetting';

export default Vue.extend({
  name: 'App',
  components: {
    SaveDataView,
    SaveDataTab,
    ShareDialog,
    SettingInitialLevel,
  },
  data: () => ({
    saveData: new SaveData(),
    mainSaveData: new SaveData(),
    drawer: null,
    configDialog: false,
    loading: true,
    somethingText: '',
    textareaHasError: false,
    readState: false as boolean | string,
    readInform: false,
    readInformText: '',
    readResultColor: 'success',
    setting: new SiteSetting(),
    editDialog: false,
    editedName: '',
    editedRemarks: '',
    shareDialog: false,
    urlParameters: {} as { data?: string; predeck?: string },
    unsbscribe: undefined as unknown,
  }),
  computed: {
    completed() {
      return this.$store.getters.getCompleted;
    },
    getTextareaColor() {
      return this.somethingText && this.textareaHasError ? 'red darken-4' : 'primary';
    },
    enabledUndo(): boolean {
      const data = this.mainSaveData;
      return data ? data.tempIndex > 0 : false;
    },
    enabledRedo(): boolean {
      const data = this.mainSaveData;
      return data ? data.tempIndex < data.tempData.length - 1 : false;
    },
    isNameEmptry(): boolean {
      return this.editedName.length <= 0;
    },
  },
  watch: {
    completed(value) {
      // 展開待ち中のデータがあれば読み込んで消す
      if (!!value && this.urlParameters) {
        if (this.urlParameters.data) {
          const urlData = SaveData.decodeURLSaveData(this.urlParameters.data);
          urlData.isMain = true;
          urlData.isActive = true;
          this.saveData.childItems.push(urlData);
          this.$store.dispatch('setMainSaveData', urlData);
          if (!this.$route.path.endsWith('/aircalc')) {
            // ページ遷移
            this.$router.push('aircalc');
          }
        } else if (this.urlParameters.predeck && this.loadAndOpenFromDeckBuilder(decodeURIComponent(this.urlParameters.predeck))) {
          this.readInformText = '編成の読み込みが完了しました。';
          this.readResultColor = 'success';
          this.readInform = true;
        }
        this.urlParameters = {};
      }

      this.loading = !value;
    },
  },
  created() {
    this.setting = this.$store.state.siteSetting as SiteSetting;
    this.saveData = this.$store.state.saveData as SaveData;
    // セーブデータの更新を購読
    this.unsbscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'updateSaveData') {
        // 計算処理更新の購読 常に最新の状態を保つ
        this.saveData = state.saveData as SaveData;
      } else if (mutation.type === 'setMainSaveData') {
        // メインデータの更新を購読 常に最新の状態を保つ
        this.mainSaveData = state.mainSaveData as SaveData;
      } else if (mutation.type === 'updateSetting') {
        // 設定情報の更新を購読 常に最新の状態を保つ
        this.setting = state.siteSetting as SiteSetting;
        this.toggleSiteTheme(this.setting.darkTheme);
      }
    });
  },
  mounted() {
    this.urlParameters = Object.freeze(this.getUrlParams());
  },
  methods: {
    readSomethingText() {
      this.readState = 'primary';
      // デッキビルダー形式データ読み込み試行
      if (this.loadAndOpenFromDeckBuilder(this.somethingText)) {
        this.readInformText = '編成の読み込みが完了しました。';
        this.readResultColor = 'success';
      } else if (this.setShipStock()) {
        // 在籍艦娘データ読み込み試行
        this.readInformText = '在籍艦娘データの更新が完了しました。';
        this.readResultColor = 'success';
      } else if (this.setItemStock()) {
        // 所持装備データ読み込み試行
        this.readInformText = '所持装備データの更新が完了しました。';
        this.readResultColor = 'success';
      } else {
        // 全部失敗
        this.readInformText = 'データの読み込みに失敗しました。正しいデータではない可能性があります。';
        this.readResultColor = 'error';
      }

      // 後始末と通知
      this.somethingText = '';
      this.readState = false;
      this.readInform = true;
    },
    loadAndOpenFromDeckBuilder(builder: string): boolean {
      // デッキビルダー形式データを計算データに設定して計算ページに移譲
      try {
        const converter = new Convert(this.$store.state.items, this.$store.state.ships);
        const manager = converter.loadDeckBuilder(builder);
        if (!manager) {
          // 何もない編成データは無意味なので返す
          return false;
        }
        let mainData = this.saveData.getMainData();
        if (mainData) {
          // もともと開いている編成があるならそこに追加
          mainData.tempData.push(manager);
          mainData.tempIndex += 1;
        } else {
          mainData = new SaveData();
          mainData.name = '外部データ';
          mainData.isActive = true;
          mainData.isMain = true;
          mainData.tempData = [manager];
          mainData.tempIndex = 0;
          mainData.tempSavedIndex = 0;
          this.saveData.childItems.push(mainData);
        }
        this.$store.dispatch('setMainSaveData', mainData);
        if (!this.$route.path.endsWith('/aircalc')) {
          // ページ遷移
          this.$router.push('aircalc');
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    setShipStock(): boolean {
      // 在籍艦娘情報を更新
      try {
        const shipList = Convert.readShipStockJson(this.somethingText);
        if (shipList.length === 0) {
          // 何もない在籍データは無意味なので返す
          return false;
        }
        // 設定書き換え
        this.setting.isStockOnlyForShipList = true;
        this.$store.dispatch('updateSetting', this.setting);
        this.$store.dispatch('updateShipStock', shipList);
        return true;
      } catch (error) {
        return false;
      }
    },
    setItemStock(): boolean {
      // 所持装備情報を更新
      try {
        const itemList = Convert.readItemStockJson(this.somethingText);
        if (itemList.length === 0) {
          // 何もない所持装備データは無意味なので返す
          return false;
        }
        this.setting.isStockOnlyForItemList = true;
        this.$store.dispatch('updateSetting', this.setting);
        this.$store.dispatch('updateItemStock', itemList);
        return true;
      } catch (error) {
        return false;
      }
    },
    saveCurrentData() {
      // 現在計算画面で開かれているデータを取得
      const data = this.saveData.getMainData();
      if (data) {
        try {
          if (data.isUnsaved) {
            // リネームダイアログを表示
            this.handleSaveAndRenameCurrentData();
            return;
          }
          data.saveManagerData();

          // DB更新を促す
          this.$store.dispatch('updateSaveData', this.saveData);

          this.readInformText = '保存しました。';
          this.readInform = true;
          this.readResultColor = 'success';
        } catch (error) {
          this.readInformText = '保存に失敗しました。';
          this.readInform = true;
          this.readResultColor = 'error';
        }
      }
    },
    handleSaveAndRenameCurrentData() {
      // 名前変更ダイアログを展開する
      const data = this.saveData.getMainData();
      if (data) {
        this.editedName = '';
        this.editedRemarks = data.remarks;
        this.editDialog = true;
      }
    },
    saveAndRenameCurrentData() {
      // 現在計算画面で開かれているデータを取得
      const data = this.saveData.getMainData();
      if (data) {
        try {
          let newData: SaveData;
          if (data.isUnsaved) {
            // 保存されていないファイル群から除去
            this.saveData.childItems = this.saveData.childItems.filter((v) => v !== data);
            newData = data;
          } else {
            newData = new SaveData();
            newData.tempData = [_.cloneDeep(data.tempData[data.tempIndex])];
            newData.tempIndex = 0;
          }

          newData.name = this.editedName;
          newData.remarks = this.editedRemarks;
          newData.editedDate = Date.now();
          newData.isUnsaved = false;
          newData.saveManagerData();

          const folder = this.saveData.childItems.find((v) => v.isDirectory);
          if (folder) {
            folder.childItems.push(newData);
            folder.sortChild();

            newData.isActive = true;

            // DB更新を促す
            this.$store.dispatch('updateSaveData', this.saveData);

            this.readInformText = '保存しました。';
            this.readInform = true;
            this.readResultColor = 'success';
          } else {
            throw new Error('「保存されたデータ」フォルダーが見つかりませんでした。');
          }
        } catch (error) {
          this.readInformText = '保存に失敗しました。';
          this.readInform = true;
          this.readResultColor = 'error';
        }
      }
      this.editDialog = false;
    },
    undoClicked() {
      // 元に戻す
      const data = this.mainSaveData;
      if (data) {
        data.tempIndex -= 1;
        this.$store.dispatch('setMainSaveData', data);
      }
    },
    redoClicked() {
      // やり直す
      const data = this.mainSaveData;
      if (data) {
        data.tempIndex += 1;
        this.$store.dispatch('setMainSaveData', data);
      }
    },
    toggleSiteTheme(isDark: boolean) {
      this.setting.darkTheme = isDark;
      this.$vuetify.theme.dark = isDark;
    },
    toggleConfigDialog() {
      if (!this.configDialog) {
        // 設定保存
        this.$store.dispatch('updateSetting', this.setting);
      }
    },
    async clickedShare() {
      await (this.shareDialog = true);
      (this.$refs.shareDialog as InstanceType<typeof ShareDialog>).createdURL = '';
    },
    closeShareDialog() {
      this.shareDialog = false;
    },
    getUrlParams() {
      const value = document.location.search;
      if (value === '') return {};
      const retVal: { [key: string]: string } = {};
      const array = value.slice(1).split('&');
      for (let i = 0; i < array.length; i += 1) {
        const str = array[i];
        const set = str.split('=');
        retVal[set[0]] = decodeURIComponent(set[1]);
      }
      window.history.replaceState(null, '', `${document.location.pathname}#/`);
      return retVal;
    },
    inform(text: string, isError = false) {
      this.readInformText = text;
      this.readInform = true;
      this.readResultColor = isError ? 'error' : 'success';
    },
  },
  beforeDestroy() {
    if (this.unsbscribe) {
      (this.unsbscribe as () => void)();
    }
  },
});
</script>

<style scoped>
.header-btn {
  font-size: 0.8em;
  padding-right: 0.2rem !important;
  padding-left: 0.2rem !important;
}
.arrow-btn {
  padding: 0 0 !important;
  min-width: 36px !important;
}

.initial-level-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
</style>

<style>
/** 日本語フォント設定 */
/* .v-application {
  font-family: "游ゴシック", sans-serif !important;
} */
/** 基本背景色変更 */
.theme--light.v-application {
  background-color: rgb(240, 235, 230) !important;
}
/** ダークテーマ 基本背景色変更 */
.theme--dark.v-application {
  background-color: rgb(20, 20, 28) !important;
}
/** ダークテーマ モーダル背景調整 */
.theme--dark.v-application .v-overlay__scrim {
  background-color: rgb(0, 0, 0) !important;
}
/** dense適用時フォントを小さく */
.v-input--dense .v-select__selection,
.v-input--dense.v-input--selection-controls .v-label {
  font-size: 0.85em;
}
.v-text-field.v-input--dense {
  font-size: 1em;
}

/** ダークテーマ card1層目 */
.theme--dark.v-card,
.theme--dark .v-expansion-panel {
  background-color: rgb(30, 30, 35) !important;
}
/** ダークテーマ card2層目 */
.theme--dark.v-card .v-card {
  background-color: rgb(42, 42, 48) !important;
}
/** ダークテーマ card3層目 */
.theme--dark.v-card .v-card .v-card {
  background-color: rgb(55, 55, 60) !important;
}

/** セーブデータ補足情報textarea指定 */
.remarks-input textarea {
  font-size: 0.8em;
  line-height: 1.2rem;
}

/** タブ内背景色を裏と合わせる */
.v-tabs-bar,
.v-tabs-items {
  background-color: transparent !important;
}

#multipurpose-textarea {
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  flex-grow: 1;
}
#multipurpose-textarea textarea {
  font-size: 0.8em;
}
.no-scroll textarea {
  overflow: hidden !important;
}

/** 編成タブのやつ */
.v-toolbar--dense.v-app-bar {
  height: 76px !important;
}
.v-toolbar--dense.v-app-bar .v-toolbar__extension {
  padding: 0;
  border-top: 1px solid #363636;
  background-color: #0a0a0c;
  height: 31px !important;
}

/** アイコン毎の背景色 */
.item-input.type-1,
.item-input.type-2,
.item-input.type-3,
.item-input.type-7 {
  box-shadow: inset 0 0 24px rgba(255, 0, 0, 0.15) !important;
}
.item-input.type-1:hover,
.item-input.type-2:hover,
.item-input.type-3:hover,
.item-input.type-7:hover {
  box-shadow: inset 0 0 24px rgba(255, 0, 0, 0.4) !important;
}
.item-input.type-4,
.item-input.type-9,
.item-input.type-19,
.item-input.type-27,
.item-input.type-39,
.item-input.type-40 {
  box-shadow: inset 0 0 24px rgba(255, 255, 70, 0.15) !important;
}
.item-input.type-4:hover,
.item-input.type-9:hover,
.item-input.type-19:hover,
.item-input.type-27:hover,
.item-input.type-39:hover,
.item-input.type-40:hover {
  box-shadow: inset 0 0 24px rgba(255, 255, 70, 0.4) !important;
}
.item-input.type-5,
.item-input.type-8,
.item-input.type-46 {
  box-shadow: inset 0 0 24px rgba(0, 190, 255, 0.15) !important;
}
.item-input.type-5:hover,
.item-input.type-8:hover,
.item-input.type-46:hover {
  box-shadow: inset 0 0 24px rgba(0, 190, 255, 0.4) !important;
}
.item-input.type-6,
.item-input.type-12,
.item-input.type-15,
.item-input.type-16,
.item-input.type-21,
.item-input.type-44,
.item-input.type-45 {
  box-shadow: inset 0 0 24px rgba(0, 255, 100, 0.15) !important;
}
.item-input.type-6:hover,
.item-input.type-12:hover,
.item-input.type-15:hover,
.item-input.type-16:hover,
.item-input.type-21:hover,
.item-input.type-44:hover,
.item-input.type-45:hover {
  box-shadow: inset 0 0 24px rgba(0, 255, 100, 0.4) !important;
}
.item-input.type-10,
.item-input.type-33,
.item-input.type-43 {
  box-shadow: inset 0 0 24px rgba(86, 255, 122, 0.15) !important;
}
.item-input.type-10:hover,
.item-input.type-33:hover,
.item-input.type-43:hover {
  box-shadow: inset 0 0 24px rgba(86, 255, 122, 0.4) !important;
}
.item-input.type-11 {
  box-shadow: inset 0 0 24px rgba(210, 120, 20, 0.15) !important;
}
.item-input.type-11:hover {
  box-shadow: inset 0 0 24px rgba(210, 120, 20, 0.4) !important;
}
.item-input.type-13 {
  box-shadow: inset 0 0 24px rgba(255, 125, 125, 0.15) !important;
}
.item-input.type-13:hover {
  box-shadow: inset 0 0 24px rgba(255, 125, 125, 0.4) !important;
}
.item-input.type-14,
.item-input.type-34 {
  box-shadow: inset 0 0 20px rgba(196, 196, 196, 0.25) !important;
}
.item-input.type-14:hover,
.item-input.type-34:hover {
  box-shadow: inset 0 0 20px rgba(196, 196, 196, 0.4) !important;
}
.item-input.type-17,
.item-input.type-18,
.item-input.type-22 {
  box-shadow: inset 0 0 24px rgba(27, 187, 255, 0.15) !important;
}
.item-input.type-17:hover,
.item-input.type-18:hover,
.item-input.type-22:hover {
  box-shadow: inset 0 0 24px rgba(27, 187, 255, 0.4) !important;
}
.item-input.type-20,
.item-input.type-36 {
  box-shadow: inset 0 0 24px rgba(155, 165, 95, 0.15) !important;
}
.item-input.type-20:hover,
.item-input.type-36:hover {
  box-shadow: inset 0 0 24px rgba(155, 165, 95, 0.4) !important;
}
.item-input.type-23 {
  box-shadow: inset 0 0 20px rgba(150, 125, 175, 0.25) !important;
}
.item-input.type-23:hover {
  box-shadow: inset 0 0 20px rgba(150, 125, 175, 0.5) !important;
}
.item-input.type-24 {
  box-shadow: inset 0 0 24px rgba(240, 130, 60, 0.15) !important;
}
.item-input.type-24:hover {
  box-shadow: inset 0 0 24px rgba(240, 130, 60, 0.4) !important;
}
.item-input.type-25 {
  box-shadow: inset 0 0 20px rgba(128, 128, 128, 0.25) !important;
}
.item-input.type-25:hover {
  box-shadow: inset 0 0 20px rgba(128, 128, 128, 0.5) !important;
}
.item-input.type-26,
.item-input.type-29 {
  box-shadow: inset 0 0 24px rgba(205, 165, 100, 0.15) !important;
}
.item-input.type-26:hover,
.item-input.type-29:hover {
  box-shadow: inset 0 0 24px rgba(205, 165, 100, 0.4) !important;
}
.item-input.type-28 {
  box-shadow: inset 0 0 24px rgba(140, 120, 170, 0.15) !important;
}
.item-input.type-28:hover {
  box-shadow: inset 0 0 24px rgba(140, 120, 170, 0.4) !important;
}
.item-input.type-30 {
  box-shadow: inset 0 0 24px rgba(135, 150, 75, 0.15) !important;
}
.item-input.type-30:hover {
  box-shadow: inset 0 0 24px rgba(135, 150, 75, 0.4) !important;
}
.item-input.type-31 {
  box-shadow: inset 0 0 24px rgba(255, 55, 55, 0.15) !important;
}
.item-input.type-31:hover {
  box-shadow: inset 0 0 24px rgba(255, 55, 55, 0.4) !important;
}
.item-input.type-32 {
  box-shadow: inset 0 0 24px rgba(190, 240, 150, 0.15) !important;
}
.item-input.type-32:hover {
  box-shadow: inset 0 0 24px rgba(190, 240, 150, 0.4) !important;
}
.item-input.type-35 {
  box-shadow: inset 0 0 24px rgba(95, 195, 155, 0.15) !important;
}
.item-input.type-35:hover {
  box-shadow: inset 0 0 24px rgba(95, 195, 155, 0.4) !important;
}
.item-input.type-37,
.item-input.type-38,
.item-input.type-41,
.item-input.type-49 {
  box-shadow: inset 0 0 24px rgba(53, 199, 17, 0.15) !important;
}
.item-input.type-37:hover,
.item-input.type-38:hover,
.item-input.type-41:hover,
.item-input.type-49:hover {
  box-shadow: inset 0 0 24px rgba(53, 199, 17, 0.4) !important;
}
.item-input.type-44 {
  box-shadow: inset 0 0 24px rgba(36, 255, 91, 0.15) !important;
}
.item-input.type-44:hover {
  box-shadow: inset 0 0 24px rgba(36, 255, 91, 0.4) !important;
}
/* アイコンで判別つきにくいので背景色を紫にしない */
/* .item-input.type-45,
.item-input.type-46 {
  box-shadow: inset 0 0 24px rgba(122, 98, 255, 0.15) !important;
}
.item-input.type-45:hover,
.item-input.type-46:hover {
  box-shadow: inset 0 0 24px rgba(122, 98, 255, 0.4) !important;
} */
.item-input.type-47 {
  box-shadow: inset 0 0 24px rgba(0, 110, 255, 0.15) !important;
}
.item-input.type-47:hover {
  box-shadow: inset 0 0 24px rgba(0, 110, 255, 0.4) !important;
}

.captured .item-input.type-1,
.captured .item-input.type-2,
.captured .item-input.type-3,
.captured .item-input.type-7 {
  background: rgba(255, 0, 0, 0.05) !important;
}
.captured .item-input.type-4,
.captured .item-input.type-9,
.captured .item-input.type-19,
.captured .item-input.type-27,
.captured .item-input.type-39,
.captured .item-input.type-40 {
  background: rgba(255, 255, 70, 0.05) !important;
}
.captured .item-input.type-5,
.captured .item-input.type-8,
.captured .item-input.type-46 {
  background: rgba(0, 190, 255, 0.05) !important;
}
.captured .item-input.type-6,
.captured .item-input.type-12,
.captured .item-input.type-15,
.captured .item-input.type-16,
.captured .item-input.type-21,
.captured .item-input.type-44,
.captured .item-input.type-45 {
  background: rgba(0, 255, 100, 0.05) !important;
}
.captured .item-input.type-10,
.captured .item-input.type-33,
.captured .item-input.type-43 {
  background: rgba(86, 255, 122, 0.05) !important;
}
.captured .item-input.type-11 {
  background: rgba(210, 120, 20, 0.05) !important;
}
.captured .item-input.type-13 {
  background: rgba(255, 125, 125, 0.05) !important;
}
.captured .item-input.type-14,
.captured .item-input.type-34 {
  background: rgba(196, 196, 196, 0.1) !important;
}
.captured .item-input.type-17,
.captured .item-input.type-18,
.captured .item-input.type-22 {
  background: rgba(27, 187, 255, 0.05) !important;
}
.captured .item-input.type-20,
.captured .item-input.type-36 {
  background: rgba(155, 165, 95, 0.05) !important;
}
.captured .item-input.type-23 {
  background: rgba(150, 125, 175, 0.1) !important;
}
.captured .item-input.type-24 {
  background: rgba(240, 130, 60, 0.05) !important;
}
.captured .item-input.type-25 {
  background: rgba(128, 128, 128, 0.1) !important;
}
.captured .item-input.type-26,
.captured .item-input.type-29 {
  background: rgba(205, 165, 100, 0.05) !important;
}
.captured .item-input.type-28 {
  background: rgba(140, 120, 170, 0.05) !important;
}
.captured .item-input.type-30 {
  background: rgba(135, 150, 75, 0.1) !important;
}
.captured .item-input.type-31 {
  background: rgba(255, 55, 55, 0.05) !important;
}
.captured .item-input.type-32 {
  background: rgba(190, 240, 150, 0.2) !important;
}
.captured .item-input.type-35 {
  background: rgba(95, 195, 155, 0.05) !important;
}
.captured .item-input.type-37,
.captured .item-input.type-38,
.captured .item-input.type-41,
.captured .item-input.type-49 {
  background: rgba(53, 199, 17, 0.05) !important;
}
.captured .item-input.type-44 {
  background: rgba(36, 255, 91, 0.05) !important;
}
.captured .item-input.type-47 {
  background: rgba(0, 110, 255, 0.05) !important;
}
</style>
