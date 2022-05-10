<template>
  <v-app v-resize="onResize">
    <v-navigation-drawer v-model="drawer" app dark width="390" :permanent="drawerFixed" :temporary="!drawerFixed">
      <save-data-view
        :root-data="saveData"
        :handle-inform="inform"
        :enabled-fix-drawer="enabledFixDrawer"
        :fixed-drawer="setting.fixedDrawer"
      />
    </v-navigation-drawer>
    <v-app-bar app dense dark>
      <v-app-bar-nav-icon v-if="!drawerFixed" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-btn icon @click="$route.path !== '/' && $router.push({ path: '/' })" :disabled="$route.path === '/'">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn class="header-btn" :disabled="!isAirCalcPage" text @click.stop="saveCurrentData">
        <v-icon small>mdi-content-save</v-icon>
        <span class="d-none d-md-inline">編成</span>保存
      </v-btn>
      <v-btn class="header-btn" :disabled="!isAirCalcPage || mainSaveData.isUnsaved" text @click.stop="handleSaveAndRenameCurrentData">
        <v-icon small>mdi-content-duplicate</v-icon>別名保存
      </v-btn>
      <v-btn class="header-btn" :disabled="!isAirCalcPage" text @click.stop="clickedShare">
        <v-icon small>mdi-share-variant</v-icon>
        <span class="d-none d-md-inline">編成</span>共有
      </v-btn>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="arrow-btn" text :disabled="!isAirCalcPage || !enabledUndo" v-bind="attrs" v-on="on" @click="undoClicked">
            <v-icon small>mdi-undo-variant</v-icon></v-btn
          >
        </template>
        <span>元に戻す</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="arrow-btn" text :disabled="!isAirCalcPage || !enabledRedo" v-bind="attrs" v-on="on" @click="redoClicked">
            <v-icon small>mdi-redo-variant</v-icon>
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
        <save-data-tab :save-data="saveData" ref="saveDataTab" />
      </template>
    </v-app-bar>
    <v-main>
      <div v-if="readOnlyMode" :class="{ 'px-2 px-md-4': !isManagerPage, 'px-6 px-md-8': isManagerPage }">
        <v-alert border="left" outlined type="info" :class="{ 'info-container': !isManagerPage }">
          <div class="body-2">URL情報より復元された艦娘在籍情報、装備所持情報が適用されています。</div>
          <div class="d-flex body-2">
            <div class="align-self-center">自分の登録情報に戻す場合は</div>
            <v-btn class="mx-1" color="info" small dark @click="resetTempData()">このボタン</v-btn>
            <div class="align-self-center">を押下してください。</div>
          </div>
        </v-alert>
      </div>
      <div :class="routerViewClass">
        <router-view @inform="inform" @openSidebar="drawer = true" />
      </div>
      <v-snackbar v-model="readInform" :color="readResultColor" top>
        {{ readInformText }}
        <template v-slot:action="{ attrs }">
          <v-btn icon v-bind="attrs" @click="readInform = false"><v-icon>mdi-close</v-icon></v-btn>
        </template>
      </v-snackbar>
    </v-main>
    <v-footer app class="d-flex justify-center">
      <v-fab-transition>
        <v-btn color="grey darken-3" class="footer-btn" v-show="isAirCalcPage" fab small dark @click="toggleMenuButton()">
          <v-icon small v-if="showFooterBtn">mdi-close</v-icon>
          <v-icon small v-else>mdi-menu</v-icon>
        </v-btn>
      </v-fab-transition>
      <v-tooltip left color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-fab-transition>
            <v-btn
              color="grey darken-2"
              class="footer-btn no-2 white--text"
              v-show="showFooterBtn"
              fab
              small
              dark
              v-bind="attrs"
              v-on="on"
              @click="$route.path !== '/' && $router.push({ path: '/' })"
              :disabled="$route.path === '/'"
            >
              <v-icon small>mdi-home</v-icon>
            </v-btn>
          </v-fab-transition>
        </template>
        <span>トップ画面へ戻る</span>
      </v-tooltip>
      <v-tooltip left color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-fab-transition>
            <v-btn
              color="blue-grey"
              class="footer-btn no-3 white--text"
              v-show="showFooterBtn"
              fab
              small
              dark
              v-bind="attrs"
              v-on="on"
              @click="$router.push('manager')"
            >
              <v-icon small>mdi-database-cog</v-icon>
            </v-btn>
          </v-fab-transition>
        </template>
        <span>艦娘 / 装備管理ページ</span>
      </v-tooltip>
      <v-tooltip left color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-fab-transition>
            <v-btn
              color="teal darken-1"
              class="footer-btn no-4 white--text"
              v-show="showFooterBtn"
              fab
              small
              v-bind="attrs"
              v-on="on"
              :disabled="!isAirCalcPage || !enabledRedo"
              @click="redoClicked()"
            >
              <v-icon small>mdi-redo-variant</v-icon>
            </v-btn>
          </v-fab-transition>
        </template>
        <span>やり直す</span>
      </v-tooltip>
      <v-tooltip left color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-fab-transition>
            <v-btn
              color="teal"
              class="footer-btn no-5 white--text"
              v-show="showFooterBtn"
              fab
              small
              v-bind="attrs"
              v-on="on"
              :disabled="!isAirCalcPage || !enabledUndo"
              @click="undoClicked()"
            >
              <v-icon small>mdi-undo-variant</v-icon>
            </v-btn>
          </v-fab-transition>
        </template>
        <span>元に戻す</span>
      </v-tooltip>
      <v-tooltip left color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-fab-transition>
            <v-btn
              color="green"
              class="footer-btn no-6"
              v-show="showFooterBtn"
              dark
              fab
              small
              v-bind="attrs"
              v-on="on"
              @click="clickedShare()"
            >
              <v-icon small>mdi-share-variant</v-icon>
            </v-btn>
          </v-fab-transition>
        </template>
        <span>編成共有</span>
      </v-tooltip>
      <v-tooltip left color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-fab-transition>
            <v-btn
              color="blue"
              class="footer-btn no-7"
              v-show="showFooterBtn"
              dark
              fab
              small
              v-bind="attrs"
              v-on="on"
              @click="clickCommentButton()"
            >
              <v-icon small>mdi-comment-processing</v-icon>
            </v-btn>
          </v-fab-transition>
        </template>
        <span>編成名 / 補足情報</span>
      </v-tooltip>
      <v-tooltip left color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-fab-transition>
            <v-btn
              color="indigo lighten-1"
              class="footer-btn no-8"
              v-show="showFooterBtn"
              dark
              fab
              small
              v-bind="attrs"
              v-on="on"
              @click="saveCurrentData()"
            >
              <v-icon small>mdi-content-save</v-icon>
            </v-btn>
          </v-fab-transition>
        </template>
        <span>編成保存</span>
      </v-tooltip>
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
    <v-dialog v-model="configDialog" width="1000" @input="toggleConfigDialog">
      <v-card>
        <div class="site-setting-container px-5 pb-2">
          <div class="mt-5">
            <div class="d-flex">
              <div class="body-2">サイトカラーテーマ</div>
              <div class="header-divider"></div>
            </div>
            <div class="ml-3 mt-2">
              <v-btn @click="changeSiteTheme('light')" class="mr-2" :class="{ primary: isLight, secondary: !isLight }">通常</v-btn>
              <v-btn @click="changeSiteTheme('ice')" class="mr-2" :class="{ primary: isIce, secondary: !isIce }">空色</v-btn>
              <v-btn @click="changeSiteTheme('pink')" class="mr-2" :class="{ primary: isPink, secondary: !isPink }">桜色</v-btn>
              <v-btn @click="changeSiteTheme('dark')" class="mr-2" :class="{ primary: isDark, secondary: !isDark }">暗色</v-btn>
              <v-btn @click="changeSiteTheme('deep-sea')" class="mr-2" :class="{ primary: isDeepSea, secondary: !isDeepSea }">深海</v-btn>
            </div>
            <div class="d-flex mt-5">
              <div class="body-2">装備表示UI調整</div>
              <div class="header-divider"></div>
            </div>
            <div class="ml-3 mt-2 d-flex">
              <v-btn @click="toggleItemUIHasBorder()" class="mr-2" :class="{ primary: HasItemUIBorder, secondary: !HasItemUIBorder }">
                枠線
              </v-btn>
              <v-btn
                :disabled="!HasItemUIBorder"
                @click="toggleItemUIIsBold()"
                class="mr-2"
                :class="{ primary: IsItemUIBold, secondary: !IsItemUIBold }"
              >
                太枠
              </v-btn>
              <v-btn
                :disabled="!HasItemUIBorder"
                @click="toggleItemUIIsRadius()"
                class="mr-2"
                :class="{ primary: IsItemUIRadius, secondary: !IsItemUIRadius }"
              >
                角丸
              </v-btn>
              <div class="align-self-center flex-grow-1">
                <v-divider v-if="!HasItemUIBorder"></v-divider>
                <div class="item-input my-0 type-6 d-flex">
                  <div class="align-self-center body-2 ml-2">24</div>
                  <div class="mx-1 item-icon">
                    <v-img :src="`./img/type/icon6.png`" height="30" width="30" />
                  </div>
                  <div class="align-self-center body-2 flex-grow-1 text-truncate">さんぷる</div>
                  <div class="ml-1 align-self-center">
                    <v-btn icon x-small><v-icon small class="text--secondary">mdi-close</v-icon></v-btn>
                  </div>
                </div>
              </div>
            </div>
            <div class="d-flex mt-5">
              <div class="body-2">未保存の編成タブを閉じる際の挙動</div>
              <div class="header-divider"></div>
            </div>
            <div class="ml-3">
              <div class="d-flex">
                <v-checkbox v-model="setting.confirmCloseTab" hide-details dense label="確認ダイアログを表示する"></v-checkbox>
                <v-spacer></v-spacer>
              </div>
            </div>
          </div>
          <div class="mt-5">
            <div class="d-flex">
              <div class="body-2">装備選択時のデフォルト熟練度</div>
              <div class="header-divider"></div>
            </div>
            <div class="ml-3">
              <div class="initial-level-items">
                <setting-initial-level v-for="(item, i) in setting.planeInitialLevels" :key="i" :index="i" :setting="setting" />
                <setting-initial-level :index="-1" :setting="setting" />
              </div>
            </div>
          </div>
          <div>
            <div class="d-flex mt-3">
              <div class="body-2">制空計算時のシミュレーション回数</div>
              <div class="header-divider"></div>
            </div>
            <div class="ml-3">
              <v-alert class="mt-3 caption" border="left" outlined type="warning" dense>
                <div>数値が大きいほど計算の精度が上がりますが、</div>
                <div>計算時のパフォーマンスが低下します。</div>
              </v-alert>
              <div class="d-flex">
                <v-text-field
                  class="mt-0 pt-0 text-right"
                  type="number"
                  max="100000"
                  min="100"
                  v-model.number="setting.simulationCount"
                  :rules="[rules.simulationCountRange]"
                ></v-text-field>
                <div class="ml-3 align-self-center">回</div>
              </div>
            </div>
          </div>
          <div>
            <div class="d-flex mt-3">
              <div class="body-2">編成データのバックアップ</div>
              <div class="header-divider"></div>
            </div>
            <div class="ml-3 mt-2">
              <div class="d-flex">
                <v-btn color="primary" @click="downloadBackupFile()">作成</v-btn>
                <div class="caption align-self-center ml-4">… 保存した編成データのバックアップファイルを作成します</div>
              </div>
              <div class="d-flex mt-3">
                <v-btn class="align-self-center mr-2" color="success" :disabled="!backupString" @click="importBackupData()">復元</v-btn>
                <div class="flex-grow-1 align-self-center mt-3">
                  <v-file-input
                    v-model="fileValue"
                    label="復元するバックアップファイルを選択"
                    @change="handleFileSelect"
                    dense
                  ></v-file-input>
                </div>
              </div>
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
    <v-dialog v-model="disabledIndexedDB" persistent width="520">
      <v-card class="pt-5 pb-3 px-5">
        <v-alert border="left" dense outlined type="error">本ブラウザではデータ保存機能が利用できません。</v-alert>
        <div class="mt-2 body-2">お使いのブラウザはIndexedDB非対応のようです。</div>
        <div class="body-2">編成、設定、艦娘/装備を含む全データは本サイトを閉じた時点で削除されます。</div>
        <div class="body-2">別のブラウザのご利用をお勧めします。</div>
        <v-divider class="my-3"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="secondary" @click.stop="disabledIndexedDB = false">OK</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDialog" width="800">
      <v-card class="pa-3">
        <v-tabs v-model="saveDialogTab" @change="changeUploadTabs">
          <v-tab href="#save">編成保存</v-tab>
          <v-tab href="#upload" :disabled="disabledUpload">編成アップロード</v-tab>
        </v-tabs>
        <v-divider></v-divider>
        <v-tabs-items v-model="saveDialogTab">
          <v-tab-item value="save">
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
          </v-tab-item>
          <v-tab-item value="upload">
            <upload-save-data
              ref="uploadSaveDataComp"
              @inform="inform"
              :dataName="editedName"
              :dataRemarks="editedRemarks"
              :saveData="saveData"
            />
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-dialog>
    <v-dialog v-model="shareDialog" width="500">
      <share-dialog :handle-close="closeShareDialog" ref="shareDialog" />
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { saveAs } from 'file-saver';
import cloneDeep from 'lodash/cloneDeep';
import colors from 'vuetify/lib/util/colors';
import Convert from '@/classes/convert';
import SaveDataView from '@/components/saveData/SaveDataView.vue';
import SaveDataTab from '@/components/saveData/SaveDataTab.vue';
import ShareDialog from '@/components/saveData/ShareDialog.vue';
import UploadSaveData from '@/components/saveData/UploadSaveData.vue';
import SettingInitialLevel from '@/components/item/SettingInitialLevel.vue';
import SaveData from '@/classes/saveData/saveData';
import SiteSetting from '@/classes/siteSetting';
import FirebaseManager from '@/classes/firebaseManager';
import LZString from 'lz-string';
import ShipStock from './classes/fleet/shipStock';
import ItemStock from './classes/item/itemStock';

export default Vue.extend({
  name: 'App',
  components: {
    SaveDataView,
    SaveDataTab,
    ShareDialog,
    SettingInitialLevel,
    UploadSaveData,
  },
  data: () => ({
    saveData: new SaveData(),
    mainSaveData: new SaveData(),
    drawer: false,
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
    urlParameters: {} as { data?: string; predeck?: string; stockid?: string },
    urlFragments: {} as { predeck?: string; ships?: ShipStock[]; items?: ItemStock[] },
    unsbscribe: undefined as unknown,
    rules: {
      simulationCountRange: (value: number) => !(value < 100 || value > 100000) || '100 ～ 100000で指定してください。',
    },
    readOnlyMode: false,
    disabledUpload: true,
    saveDialogTab: 'save',
    enabledFixDrawer: false,
    backupString: undefined as undefined | string,
    fileValue: undefined as File | undefined,
    disabledIndexedDB: false,
  }),
  computed: {
    getCompletedAll() {
      return this.$store.getters.getCompletedAll;
    },
    isTempStockMode(): boolean {
      // 一時所持情報データがあるなら
      return this.$store.getters.getExistsTempStock;
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
    isManagerPage(): boolean {
      return this.$route.path.endsWith('/manager');
    },
    isAirCalcPage(): boolean {
      return this.$route.path.endsWith('/aircalc');
    },
    isLight(): boolean {
      return !this.setting.darkTheme && this.setting.themeDetail === 'light';
    },
    isIce(): boolean {
      return !this.setting.darkTheme && this.setting.themeDetail === 'ice';
    },
    isPink(): boolean {
      return !this.setting.darkTheme && this.setting.themeDetail === 'pink';
    },
    isDark(): boolean {
      return this.setting.darkTheme && this.setting.themeDetail === 'dark';
    },
    isDeepSea(): boolean {
      return this.setting.darkTheme && this.setting.themeDetail === 'deep-sea';
    },
    HasItemUIBorder(): boolean {
      return this.setting.itemUI.border;
    },
    IsItemUIBold(): boolean {
      return this.setting.itemUI.bold;
    },
    IsItemUIRadius(): boolean {
      return this.setting.itemUI.radius;
    },
    showFooterBtn(): boolean {
      return this.isAirCalcPage && this.setting.visibleAirCalcMenuButton;
    },
    drawerFixed(): boolean {
      return this.enabledFixDrawer && this.setting.fixedDrawer;
    },
    routerViewClass(): string {
      if (this.showFooterBtn && this.drawerFixed) {
        return 'pl-2 pl-md-4 pr-12 pr-xl-4';
      }
      if (this.showFooterBtn && !this.drawerFixed) {
        return 'pl-2 pl-md-4 pr-12 pr-lg-4';
      }
      return 'px-2 px-md-4';
    },
  },
  watch: {
    getCompletedAll(value) {
      this.loading = !value;
      if (value) {
        this.loadURLInfomation();
      }
      this.disabledIndexedDB = this.$store.state.disabledDatabase;
    },
    isTempStockMode(value) {
      this.readOnlyMode = !!value;
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
        if (this.setting.themeDetail) {
          this.changeSiteTheme(this.setting.themeDetail);
        } else {
          // 基本のテーマ2種
          this.changeSiteTheme(this.setting.darkTheme ? 'dark' : 'light');
        }

        if (!this.setting.fixedDrawer) {
          this.drawer = false;
        }
        this.onResize();
      }
    });

    // URLパラメータ or fragments取得 & 一時退避 => マスタ読み込み完了後に処理
    const { search, hash } = document.location;
    if (search || hash) {
      this.getUrlParams(search);
      this.setUrlFragments(hash);
      if (!this.loading) {
        this.loadURLInfomation();
      }
    }
  },
  methods: {
    async loadURLInfomation() {
      // 展開待ち中のデータがあれば読み込んで消す
      if (Object.keys(this.urlParameters).length) {
        if (this.urlParameters.data) {
          // 編成データ解析
          const urlData = SaveData.decodeURLSaveData(this.urlParameters.data);
          urlData.isMain = true;
          urlData.isActive = true;
          this.saveData.childItems.push(urlData);
          this.$store.dispatch('setMainSaveData', urlData);
          if (!this.isAirCalcPage) {
            // ページ遷移
            this.$router.push('aircalc');
          }
        } else if (this.urlParameters.predeck && this.loadAndOpenFromDeckBuilder(this.urlParameters.predeck)) {
          // デッキビルダー解析
          this.inform('編成の読み込みが完了しました。');
        } else if (this.urlParameters.stockid) {
          // 所持情報データ解析
          const stockData = await FirebaseManager.getAndRestoreStockData(this.urlParameters.stockid);

          // 一時所持情報にセットして管理ページを展開
          let available = false;
          if (stockData.shipStocks.length) {
            this.$store.dispatch('updateTempShipStock', stockData.shipStocks);
            available = true;
          }
          if (stockData.itemStocks.length) {
            this.$store.dispatch('updateTempItemStock', stockData.itemStocks);
            available = true;
          }

          if (available) {
            if (!this.$route.path.endsWith('/manager')) {
              // ページ遷移
              this.$router.push('manager');
            }
          } else {
            this.inform('所持情報の読み取りに失敗しました。', true);
          }
        }
        // 処理完了後除去
        this.urlParameters = {};
      } else if (Object.keys(this.urlFragments).length) {
        const informText: string[] = [];
        if (this.urlFragments.ships && this.urlFragments.ships.length) {
          // 艦隊反映
          informText.push('在籍艦娘の更新');
          this.setting.isStockOnlyForShipList = true;
          this.$store.dispatch('updateSetting', this.setting);
          this.$store.dispatch('updateShipStock', this.urlFragments.ships);
        }
        if (this.urlFragments.items && this.urlFragments.items.length) {
          // 装備反映
          informText.push('所持装備の更新');
          this.setting.isStockOnlyForItemList = true;
          this.$store.dispatch('updateSetting', this.setting);
          this.$store.dispatch('updateItemStock', this.urlFragments.items);
        }
        if (this.urlFragments.predeck && this.loadAndOpenFromDeckBuilder(this.urlFragments.predeck)) {
          informText.push('編成の読み込み');
        }
        if (informText.length) {
          this.inform(`URL fragmentより、${informText.join(', ')}が実行されました。`);
        }
        // 処理完了後除去
        this.urlFragments = {};
      }
    },
    readSomethingText() {
      this.readState = 'primary';
      // デッキビルダー形式データ読み込み試行
      if (this.loadAndOpenFromDeckBuilder(this.somethingText)) {
        this.inform('編成の読み込みが完了しました。');
      } else if (this.setShipStock()) {
        // 在籍艦娘データ読み込み試行
        this.inform('在籍艦娘データの更新が完了しました。');
      } else if (this.setItemStock()) {
        // 所持装備データ読み込み試行
        this.inform('所持装備データの更新が完了しました。');
      } else {
        // 全部失敗
        this.inform('データの読み込みに失敗しました。正しいデータではない可能性があります。', true);
      }

      // 後始末と通知
      this.somethingText = '';
      this.readState = false;
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
        if (!this.isAirCalcPage) {
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

          this.inform('保存しました。');
        } catch (error) {
          this.inform('保存に失敗しました。', true);
        }
      }
    },
    handleSaveAndRenameCurrentData() {
      // 名前変更ダイアログを展開する
      const data = this.saveData.getMainData();
      if (data) {
        this.editedName = data.name;
        this.editedRemarks = data.remarks;
        this.saveDialogTab = 'save';
        this.disabledUpload = data.isDirectory;
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
            newData.tempData = [cloneDeep(data.tempData[data.tempIndex])];
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

            this.inform('保存しました。');
          } else {
            throw new Error('「保存されたデータ」フォルダーが見つかりませんでした。');
          }
        } catch (error) {
          this.inform('保存に失敗しました。', true);
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
    changeSiteTheme(theme: 'light' | 'dark' | 'deep-sea' | 'ice' | 'pink') {
      const isDarkTheme = theme === 'dark' || theme === 'deep-sea';
      this.setting.darkTheme = isDarkTheme;
      this.$vuetify.theme.dark = isDarkTheme;
      this.$vuetify.theme.themes.light.secondary = colors.grey.darken2;
      this.$vuetify.theme.themes.dark.primary = colors.blue.base;

      document.body.classList.remove('deep-sea', 'ice', 'pink');
      if (theme === 'deep-sea') {
        this.$vuetify.theme.themes.dark.primary = colors.blue.lighten1;
        document.body.classList.add(theme);
      }
      if (theme === 'ice' || theme === 'pink') {
        document.body.classList.add(theme);
      }

      this.setting.themeDetail = theme;
      this.updateItemUI();
    },
    toggleItemUIHasBorder() {
      this.setting.itemUI.border = !this.setting.itemUI.border;
      this.updateItemUI();
    },
    toggleItemUIIsBold() {
      this.setting.itemUI.bold = !this.setting.itemUI.bold;
      this.updateItemUI();
    },
    toggleItemUIIsRadius() {
      this.setting.itemUI.radius = !this.setting.itemUI.radius;
      this.updateItemUI();
    },
    updateItemUI() {
      if (!this.setting.itemUI) {
        return;
      }
      // 装備UI設定値を反映
      document.body.classList.remove('item-ui-border', 'item-ui-bold', 'item-ui-radius');
      if (this.setting.itemUI.border) {
        document.body.classList.add('item-ui-border');
      }
      if (this.setting.itemUI.bold) {
        document.body.classList.add('item-ui-bold');
      }
      if (this.setting.itemUI.radius) {
        document.body.classList.add('item-ui-radius');
      }
    },
    toggleConfigDialog() {
      if (!this.configDialog) {
        // 設定ダイアログを閉じると同時に保存
        // へんなのチェック
        if (this.setting.simulationCount > 100000) {
          this.setting.simulationCount = 100000;
        } else if (this.setting.simulationCount < 100) {
          this.setting.simulationCount = 100;
        }

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
    getUrlParams(value: string) {
      this.urlParameters = {};
      if (!value) return;
      const retVal: { [key: string]: string } = {};
      const array = value.slice(1).split('&');
      for (let i = 0; i < array.length; i += 1) {
        const str = array[i];
        const set = str.split('=');
        retVal[set[0]] = decodeURIComponent(set[1]);
      }
      this.urlParameters = Object.freeze(retVal);
      window.history.replaceState(null, '', `${document.location.pathname}#/`);
    },
    setUrlFragments(value: string) {
      // URLフラグメントより編成、装備、艦隊状況を読み込む
      this.urlFragments = {};
      if (!value) return;
      const sp = value.split('import:');
      if (!sp || sp.length < 2) return;
      this.$router.push({ path: '/' });

      const dataString = decodeURIComponent(sp[1]);
      let json;
      try {
        json = JSON.parse(dataString) as { ships?: unknown; items?: unknown; predeck?: unknown };
      } catch (error) {
        // 読み込んだデータが何かおかしい
        console.error(error);
        return;
      }
      try {
        this.urlFragments.predeck = JSON.stringify(json.predeck);
      } catch (e) {
        console.error(e);
      }
      try {
        this.urlFragments.ships = Convert.readShipStockJson(json.ships ? JSON.stringify(json.ships) : '');
      } catch (e) {
        console.error(e);
      }
      try {
        this.urlFragments.items = Convert.readItemStockJson(json.items ? JSON.stringify(json.items) : '');
      } catch (e) {
        console.error(e);
      }
    },
    inform(text: string, isError = false) {
      this.readInformText = text;
      this.readInform = true;
      this.readResultColor = isError ? 'error' : 'success';
    },
    async resetTempData() {
      this.$store.dispatch('updateTempShipStock', []);
      this.$store.dispatch('updateTempItemStock', []);
      this.inform('閲覧モードを終了しました');
    },
    changeUploadTabs(value: string) {
      if (value !== 'upload') return;

      const form = this.$refs.uploadSaveDataComp as InstanceType<typeof UploadSaveData>;
      if (form) {
        form.initControl();
      }
    },
    toggleMenuButton() {
      this.setting.visibleAirCalcMenuButton = !this.setting.visibleAirCalcMenuButton;
      this.$store.dispatch('updateSetting', this.setting);
    },
    clickCommentButton() {
      const form = this.$refs.saveDataTab as InstanceType<typeof SaveDataTab>;
      const mainData = this.saveData.getMainData();
      if (form && mainData) {
        form.showNameEditDialog(mainData);
      }
    },
    onResize() {
      if (this.enabledFixDrawer && window.innerWidth < 1480) {
        this.enabledFixDrawer = false;
      } else if (!this.enabledFixDrawer && window.innerWidth >= 1480) {
        this.enabledFixDrawer = true;
      }
    },
    downloadBackupFile() {
      const data = JSON.stringify(this.saveData.getMinifyData());
      const minify = LZString.compressToUTF16(data);
      const blob = new Blob([minify], { type: 'application/octet-stream' });
      saveAs(blob, `backup_${Convert.formatDate(new Date(), 'yyyyMMdd')}`);
    },
    async handleFileSelect(file: File) {
      this.backupString = undefined;
      if (!file) {
        return;
      }
      try {
        const minify = await file.text();
        const saveDataString = LZString.decompressFromUTF16(minify);
        // セーブデータとして復元できるかチェック
        if (saveDataString && SaveData.IsSaveData(JSON.parse(saveDataString) as SaveData)) {
          this.backupString = saveDataString;
        } else {
          throw new Error('復号に失敗');
        }
      } catch (error) {
        console.error(error);
        this.inform('読み込み失敗 -バックアップデータが壊れてるか、なんか違うファイル', true);
      }
    },
    importBackupData() {
      const str = this.backupString;
      this.backupString = undefined;
      this.fileValue = undefined;
      if (str) {
        if (this.isAirCalcPage) {
          // ページ遷移
          this.$router.push('/');
        }
        const saveData = SaveData.getInstance(JSON.parse(str) as SaveData);
        saveData.isReadonly = true;

        for (let i = 0; i < saveData.childItems.length; i += 1) {
          const unsavedData = saveData.childItems[i];
          // ディレクトリ以外は非保存データなので書き換え
          if (!unsavedData.isDirectory) {
            unsavedData.isUnsaved = true;
            unsavedData.isActive = true;
          } else {
            unsavedData.isOpen = true;
            unsavedData.isReadonly = true;
          }
        }

        this.$store.dispatch('updateSaveData', saveData);
        this.inform('バックアップデータを復元しました。');
      }
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

.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.info-container {
  max-width: 1200px;
  margin: 0 auto;
}

.v-footer {
  background-color: rgb(39, 39, 39) !important;
  color: #fff !important;
}
.footer-btn {
  position: absolute;
  top: -48px;
  right: 2px;
}
.footer-btn.no-2 {
  top: -92px;
}
.footer-btn.no-3 {
  top: -136px;
}
.footer-btn.no-4 {
  top: -180px;
}
.footer-btn.no-5 {
  top: -224px;
}
.footer-btn.no-6 {
  top: -268px;
}
.footer-btn.no-7 {
  top: -312px;
}
.footer-btn.no-8 {
  top: -356px;
}

.site-setting-container {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 900px) {
  .site-setting-container {
    grid-template-columns: 1fr 1fr;
  }
  .site-setting-container > div:nth-child(2n) {
    margin-left: 1rem;
    padding-left: 1rem;
    border-left: 1px solid rgba(128, 128, 128, 0.6);
  }
}
</style>

<style>
/** システム共通CSS定義 */

/** dense適用時フォントを小さく */
.v-input--dense .v-select__selection,
.v-input--dense.v-input--selection-controls .v-label {
  font-size: 0.85em;
}
.v-text-field.v-input--dense {
  font-size: 1em;
}

/** v-btn 自動で大文字にさせない */
.v-btn {
  text-transform: none;
}

/* スクロールバー webkit系 */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar:horizontal {
  height: 8px;
}
::-webkit-scrollbar-track {
  background: rgba(128, 128, 128, 0.2);
}
::-webkit-scrollbar-thumb {
  border-radius: 1px;
  background: rgb(128, 128, 128, 0.7);
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(177, 177, 177);
}

/* Firefox ScrollBar */
* {
  scrollbar-width: thin;
}
.theme--dark {
  scrollbar-color: rgba(255, 255, 255, 0.4) rgba(255, 255, 255, 0.2);
}

/** 基本背景色 */
.theme--light.v-application {
  background-color: rgb(240, 235, 230) !important;
  background-attachment: fixed !important;
}
/** テーマ空色 */
.ice .theme--light.v-application {
  background-color: rgb(225, 245, 255) !important;
  background: linear-gradient(rgb(200, 230, 255), rgb(245, 250, 255)) !important;
  background-attachment: fixed !important;
}
/** テーマ桜色 */
.pink .theme--light.v-application {
  background-color: rgb(255, 225, 225) !important;
  background: linear-gradient(rgb(255, 225, 225), rgb(255, 245, 245)) !important;
  background-attachment: fixed !important;
}

/** ダークテーマ 基本背景色変更 */
.theme--dark.v-application {
  background-color: rgb(25, 25, 32) !important;
  background: linear-gradient(rgb(22, 22, 28), 90%, rgb(40, 40, 46)) !important;
  background-attachment: fixed !important;
}
/** ダークテーマ[深海] 基本背景色変更 */
.deep-sea .theme--dark.v-application {
  background-color: rgb(16, 24, 36) !important;
  background: linear-gradient(rgb(20, 40, 80), rgb(2, 4, 12)) !important;
  background-attachment: fixed !important;
}

/** ダークテーマ モーダル背景調整 */
.theme--dark.v-application .v-overlay__scrim {
  background-color: rgb(0, 0, 0) !important;
}

/** ダークテーマ card1層目 */
.theme--dark.v-card,
.theme--dark .v-expansion-panel {
  background-color: rgb(40, 40, 45) !important;
}
/** ダークテーマ card2層目 */
.theme--dark.v-card .v-card {
  background-color: rgb(52, 52, 56) !important;
}
/** ダークテーマ card3層目 */
.theme--dark.v-card .v-card .v-card {
  background-color: rgb(65, 65, 70) !important;
}

/** ダークテーマ[深海] card1層目 */
.deep-sea .theme--dark.v-card,
.deep-sea .theme--dark .v-expansion-panel {
  background-color: rgba(36, 44, 54, 0.6) !important;
}
/** ダークテーマ[深海] card2層目 */
.deep-sea .theme--dark.v-card .v-card {
  background-color: rgba(48, 56, 68, 0.6) !important;
}
/** ダークテーマ[深海] card3層目 */
.deep-sea .theme--dark.v-card .v-card .v-card {
  background-color: rgba(60, 68, 80, 0.6) !important;
}
/** ダークテーマ[深海] ダイアログ */
.deep-sea .theme--dark .v-dialog {
  background-color: rgb(10, 15, 30) !important;
}
/** ダークテーマ[深海] メニュー背景 */
.deep-sea .theme--dark .v-menu__content {
  background-color: rgb(30, 38, 60) !important;
}
/** ダークテーマ ボタン背景範囲 */
.theme--dark .v-btn-toggle {
  background: none !important;
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

body:not(.item-ui-border) .item-input {
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid rgba(128, 128, 128, 0.25) !important;
}
body.item-ui-border .item-input {
  border: 1px solid rgba(128, 128, 128, 0.5);
  margin: 2px 1px;
}
body.item-ui-border.item-ui-bold .item-input {
  border: 2px solid rgba(128, 128, 128, 0.5);
}
body.item-ui-border.item-ui-radius .item-input {
  border-radius: 3px;
}
body.item-ui-border.item-ui-bold.item-ui-radius .item-input {
  border-radius: 4px;
}

/** アイコン毎の背景色 */
.item-input.type-1,
.item-input.type-2,
.item-input.type-3,
.item-input.type-7 {
  box-shadow: inset 0 0 24px rgba(255, 0, 0, 0.15) !important;
  border-color: rgb(247, 110, 110) !important;
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
  border-color: rgb(255, 200, 10) !important;
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
  border-color: rgb(100, 190, 255) !important;
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
  border-color: rgb(100, 200, 120) !important;
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
  border-color: rgb(140, 205, 150) !important;
}
.item-input.type-10:hover,
.item-input.type-33:hover,
.item-input.type-43:hover {
  box-shadow: inset 0 0 24px rgba(86, 255, 122, 0.4) !important;
}
.item-input.type-11 {
  box-shadow: inset 0 0 24px rgba(210, 120, 20, 0.15) !important;
  border-color: rgb(210, 150, 70) !important;
}
.item-input.type-11:hover {
  box-shadow: inset 0 0 24px rgba(210, 120, 20, 0.4) !important;
}
.item-input.type-13 {
  box-shadow: inset 0 0 24px rgba(255, 125, 125, 0.15) !important;
  border-color: rgb(255, 125, 125) !important;
}
.item-input.type-13:hover {
  box-shadow: inset 0 0 24px rgba(255, 125, 125, 0.4) !important;
}
.item-input.type-14,
.item-input.type-34 {
  box-shadow: inset 0 0 20px rgba(196, 196, 196, 0.25) !important;
  border-color: rgb(196, 196, 196) !important;
}
.item-input.type-14:hover,
.item-input.type-34:hover {
  box-shadow: inset 0 0 20px rgba(196, 196, 196, 0.4) !important;
}
.item-input.type-17,
.item-input.type-18,
.item-input.type-22 {
  box-shadow: inset 0 0 24px rgba(27, 187, 255, 0.15) !important;
  border-color: rgb(128, 216, 255) !important;
}
.item-input.type-17:hover,
.item-input.type-18:hover,
.item-input.type-22:hover {
  box-shadow: inset 0 0 24px rgba(27, 187, 255, 0.4) !important;
}
.item-input.type-20,
.item-input.type-36 {
  box-shadow: inset 0 0 24px rgba(155, 165, 95, 0.15) !important;
  border-color: rgb(155, 165, 95) !important;
}
.item-input.type-20:hover,
.item-input.type-36:hover {
  box-shadow: inset 0 0 24px rgba(155, 165, 95, 0.4) !important;
}
.item-input.type-23 {
  box-shadow: inset 0 0 20px rgba(150, 125, 175, 0.25) !important;
  border-color: rgb(150, 125, 175) !important;
}
.item-input.type-23:hover {
  box-shadow: inset 0 0 20px rgba(150, 125, 175, 0.5) !important;
}
.item-input.type-24 {
  box-shadow: inset 0 0 24px rgba(240, 130, 60, 0.15) !important;
  border-color: rgba(240, 130, 60) !important;
}
.item-input.type-24:hover {
  box-shadow: inset 0 0 24px rgba(240, 130, 60, 0.4) !important;
}
.item-input.type-25 {
  box-shadow: inset 0 0 20px rgba(128, 128, 128, 0.25) !important;
  border-color: rgb(128, 128, 128) !important;
}
.item-input.type-25:hover {
  box-shadow: inset 0 0 20px rgba(128, 128, 128, 0.5) !important;
}
.item-input.type-26,
.item-input.type-29 {
  box-shadow: inset 0 0 24px rgba(205, 165, 100, 0.15) !important;
  border-color: rgb(205, 165, 100) !important;
}
.item-input.type-26:hover,
.item-input.type-29:hover {
  box-shadow: inset 0 0 24px rgba(205, 165, 100, 0.4) !important;
}
.item-input.type-28 {
  box-shadow: inset 0 0 24px rgba(140, 120, 170, 0.15) !important;
  border-color: rgb(140, 120, 170) !important;
}
.item-input.type-28:hover {
  box-shadow: inset 0 0 24px rgba(140, 120, 170, 0.4) !important;
}
.item-input.type-30 {
  box-shadow: inset 0 0 24px rgba(135, 150, 75, 0.15) !important;
  border-color: rgb(135, 150, 75) !important;
}
.item-input.type-30:hover {
  box-shadow: inset 0 0 24px rgba(135, 150, 75, 0.4) !important;
}
.item-input.type-31 {
  box-shadow: inset 0 0 24px rgba(255, 55, 55, 0.15) !important;
  border-color: rgb(255, 55, 55) !important;
}
.item-input.type-31:hover {
  box-shadow: inset 0 0 24px rgba(255, 55, 55, 0.4) !important;
}
.item-input.type-32 {
  box-shadow: inset 0 0 24px rgba(190, 240, 150, 0.15) !important;
  border-color: rgb(190, 240, 150) !important;
}
.item-input.type-32:hover {
  box-shadow: inset 0 0 24px rgba(190, 240, 150, 0.4) !important;
}
.item-input.type-35 {
  box-shadow: inset 0 0 24px rgba(95, 195, 155, 0.15) !important;
  border-color: rgb(95, 195, 155) !important;
}
.item-input.type-35:hover {
  box-shadow: inset 0 0 24px rgba(95, 195, 155, 0.4) !important;
}
.item-input.type-37,
.item-input.type-38,
.item-input.type-41,
.item-input.type-48,
.item-input.type-49 {
  box-shadow: inset 0 0 24px rgba(53, 199, 17, 0.15) !important;
  border-color: rgb(60, 170, 30) !important;
}
.item-input.type-37:hover,
.item-input.type-38:hover,
.item-input.type-41:hover,
.item-input.type-48:hover,
.item-input.type-49:hover {
  box-shadow: inset 0 0 24px rgba(53, 199, 17, 0.4) !important;
}
.item-input.type-44 {
  box-shadow: inset 0 0 24px rgba(36, 255, 91, 0.15) !important;
  border-color: rgb(150, 230, 165) !important;
}
.item-input.type-44:hover {
  box-shadow: inset 0 0 24px rgba(36, 255, 91, 0.4) !important;
}
.item-input.type-47 {
  box-shadow: inset 0 0 24px rgba(0, 110, 255, 0.15) !important;
  border-color: rgb(110, 135, 205) !important;
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
.captured .item-input.type-48,
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
