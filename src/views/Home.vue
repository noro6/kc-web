<template>
  <div>
    <div class="d-flex align-end content">
      <div>{{ $t("Common.制空権シミュレータ") }}</div>
      <div class="ml-1 body-2">v{{ $store.state.siteVersion }}</div>
    </div>
    <div class="content">
      <div class="body-2">{{ $t("Home.メインメニュー") }}</div>
      <v-divider></v-divider>
      <div class="main-content-buttons">
        <v-tooltip left bottom color="black" max-width="400px" open-delay="500" v-for="page in mainPages" :key="page.title" :disabled="!page.text">
          <template v-slot:activator="{ on, attrs }">
            <button
              class="content-button"
              v-bind="attrs"
              v-on="on"
              v-ripple="{ class: `${page.color}--text` }"
              @click="clickedButton(page)"
              :disabled="page.clicked"
            >
              <div>
                <v-icon x-large :color="page.color">{{ page.icon }}</v-icon>
              </div>
              <div class="content-button-title">{{ $t(`${page.title}`) }}</div>
            </button>
          </template>
          <div v-if="page.text">
            <div v-for="t in page.text" :key="t">{{ $t(`${t}`) }}</div>
          </div>
        </v-tooltip>
      </div>
      <div class="mt-4 body-2">{{ $t("Home.おまけ") }}</div>
      <v-divider></v-divider>
      <div class="main-content-buttons">
        <v-tooltip left bottom color="black" max-width="340px" open-delay="500" v-for="page in extraPages" :key="page.title">
          <template v-slot:activator="{ on, attrs }">
            <button
              class="content-button"
              v-bind="attrs"
              v-on="on"
              v-ripple="{ class: `${page.color}--text` }"
              @click="clickedButton(page)"
              :disabled="page.clicked"
            >
              <div>
                <v-icon x-large :color="page.color">{{ page.icon }}</v-icon>
              </div>
              <div class="content-button-title">{{ $t(`${page.title}`) }}</div>
            </button>
          </template>
          <div>{{ $t(`${page.text}`) }}</div>
        </v-tooltip>
      </div>
      <div class="mt-6">{{ $t("Database.その他") }}</div>
      <v-divider></v-divider>
      <div class="expansion-area">
        <v-expansion-panels class="pa-0 mt-3" multiple>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-database-arrow-up</v-icon>
                <div class="ml-2">{{ $t("Home.データ引き継ぎ") }} ( v2 <v-icon>mdi-arrow-right-thin</v-icon> v2 )</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-4">{{ $t("Home.本サイトで作成した編成データなどを他の端末やブラウザに引き継げます") }}</div>
              <div class="mt-3">
                1. <v-btn @click="createBackUp" color="primary" small :disabled="created" depressed>{{ $t("Home.バックアップファイルを作成する") }}</v-btn>
              </div>
              <div class="mt-2">2. {{ $t("Home.作成されたバックアップファイルを、引き継ぎ先のPCや端末に移動させる") }}</div>
              <div class="mt-2">3. {{ $t("Home.引き継ぎ先で制空権シミュレータv2を開き、サイト設定を開く") }}</div>
              <div class="mt-1">
                4. 「{{ $t("Setting.編成データのバックアップ") }}」<v-icon>mdi-arrow-right-thin</v-icon>「{{
                  $t("Setting.復元するバックアップファイルを選択")
                }}」
              </div>
              <div class="mt-1">5. {{ $t("Home.手順2で移動させてきたバックアップファイルを選択すれば引き継ぎは完了です") }}</div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-database-arrow-down</v-icon>
                <div class="ml-2">{{ $t("Home.データ引き継ぎ") }} ( v1 <v-icon>mdi-arrow-right-thin</v-icon> v2 )</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-4 body-2">
                <a href="https://noro6.github.io/kcTools" target="_blank">{{ $t("Home.旧制空権シミュレータ") }}</a>
                (v1){{ $t("Home.で作成していた編成データや、登録されていた装備、艦娘情報を引き継ぎます。") }}
              </div>
              <div class="d-flex flex-wrap mt-2">
                <v-btn color="teal" class="mr-2 mb-2" @click="checkOldData()" :dark="!imported" :disabled="imported">
                  {{ $t("Home.データ引継ぎ(編成)") }}
                </v-btn>
                <v-btn color="teal" class="mr-2 mb-2" @click="checkOldStockData()" :dark="!importedStock" :disabled="importedStock">
                  {{ $t("Home.データ引継ぎ(装備/艦娘)") }}
                </v-btn>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-link-variant</v-icon>
                <div class="ml-2">{{ $t("Home.サイト連携") }}</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-4">
                <div>{{ $t("Home.デッキビルダー形式をURLに ?predeck=で埋め込めば編成を読み込めます。") }}</div>
                <div class="text--secondary">(e.g.) https://noro6.github.io/kc-web?predeck={"version":4,"hqlv":120,"f1":{"s1":...</div>
              </div>
              <div class="mt-6">
                <div>{{ $t("Home.URLが長すぎて上記の方法でエラーが出る場合は、URL fragmentsを利用した受け渡しも可能です。") }}</div>
                <div class="text--secondary">(e.g.) https://noro6.github.io/kc-web#import:{"predeck":{"version":4,"hqlv":120,"f1":{"s1":...}</div>
              </div>
              <div class="mt-6">
                <div>{{ $t("Home.また、URL fragmentsを利用した形式では艦隊分析コード(艦娘、装備)形式の読み込みも同時に行うことができます。") }}</div>
                <div class="text--secondary">
                  (e.g.)
                  https://noro6.github.io/kc-web#import:{"predeck":{...},"ships":[{"api_ship_id":1,"api_lv":1,"api_kyouka":[0,0,0,0,0,0,0],"api_exp":[0,100,0],"api_slot_ex":0,"api_sally_area":0}],"items":[{"api_slotitem_id":1,"api_level":10}]}
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-file-document</v-icon>
                <div class="ml-2">{{ $t("Home.更新履歴") }}</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-4 ml-4 body-2 d-flex align-center">
                <div class="mr-3">{{ $t("Home.雑です。") }}</div>
                <v-btn text href="https://github.com/noro6/kc-web/releases" target="_blank" outlined small>
                  <v-icon>mdi-github</v-icon>
                  <span class="mx-1">GitHub Releases</span>
                </v-btn>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header>
              <div class="d-flex align-center">
                <v-icon>mdi-party-popper</v-icon>
                <div class="ml-2">{{ $t("Home.ご支援") }}</div>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-divider />
              <div class="mt-4">
                <div>{{ $t("Home.本サイトは無料ですが、それでもご支援いただけるという方向けに支援の手段を用意しました。") }}</div>
                <div>{{ $t("Home.いつも本当にありがとうございます。") }}</div>
              </div>
              <div class="support-buttons">
                <div>
                  <v-btn color="teal darken-1" large dark target="_blank" href="https://ofuse.me/noro">
                    <span class="ofuse-label">OFUSEで応援する</span>
                  </v-btn>
                  <div class="mt-2">{{ $t("Home.匿名でも利用可能な投げ銭サービスです。") }}</div>
                </div>
                <div>
                  <v-btn color="orange darken-1" large dark target="_blank" href="https://www.amazon.jp/hz/wishlist/ls/1OX9QVZF828GD?ref_=wl_share">
                    {{ $t("Home.Amazon ほしい物リスト") }}
                  </v-btn>
                  <div class="mt-2">{{ $t("Home.物資やギフト券といった形であればこちら。") }}</div>
                </div>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </div>
    <div class="info-area">
      <v-divider class="mb-2" />
      <div>
        {{ $t("Home.著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。") }}
      </div>
      <div>
        {{ $t("Home.また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。") }}
      </div>
    </div>
    <v-dialog v-model="importConfirmDialog" transition="scroll-x-transition" width="500">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <div class="body-2">{{ $t("Home.引き継ぎ対象のデータを格納するフォルダーを作成します。") }}</div>
          <div class="mb-5 body-2">{{ $t("Home.フォルダー名を指定し、実行を押すと引き継ぎを開始します。") }}</div>
          <v-text-field v-model="importFileName" dense outlined maxlength="100" counter :label="$t('SaveData.フォルダー名')" />
          <div class="d-flex mt-3">
            <v-btn class="ml-auto" color="success" @click.stop="importOldData" :disabled="isNameEmpty || imported">{{ $t("Common.実行") }}</v-btn>
            <v-btn class="ml-4" color="secondary" @click.stop="importConfirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="480">
      <v-card class="pa-3">
        <div class="ma-4">
          <div class="body-2">{{ $t("Home.既に本サイトで装備 / 艦娘情報が登録されているようです。") }}</div>
          <div class="body-2">{{ $t("Home.引き継ぎを行うとこれらのデータは上書きされます。") }}</div>
          <div class="body-2 mt-3">{{ $t("Home.本当に引き継ぎを行いますか？") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="success" dark :disabled="!confirmDialog" @click.stop="importOldStockData()">{{ $t("Common.実行") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.content {
  margin: 20px auto;
  max-width: 1200px;
}
.main-content-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 5px;
  row-gap: 5px;
  margin-top: 16px;
}
.content-button {
  cursor: pointer;
  padding-top: 20px;
  padding-bottom: 10px;
  box-shadow: 0 1px 2px rgba(220, 225, 232, 0.5), 0 1px 2px rgba(220, 225, 232, 0.5);
  background-color: #fff;
  transition: 0.12s ease-out;
  border-radius: 3px;
}
.theme--dark .content-button {
  background-color: rgb(40, 40, 45);
  box-shadow: 0 1px 2px rgba(29, 32, 36, 0.5), 0 1px 2px rgba(29, 32, 36, 0.5);
}
.deep-sea .theme--dark .content-button {
  background-color: rgba(36, 44, 54, 0.6);
}
.content-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 2rem rgb(216, 218, 222);
}
.theme--dark .content-button:hover {
  box-shadow: 0 0.5rem 2.5rem rgb(19, 22, 24);
}
.content-button:active {
  transform: translateY(0);
  box-shadow: 0 0.125rem 0.75rem rgb(220, 225, 232);
}
.theme--dark .content-button:active {
  box-shadow: 0 0.375rem 0.55rem rgb(35, 40, 44);
}
.content-button-title {
  text-align: center;
  font-size: 14px;
  margin-top: 5px;
}

/** その他欄 */
.expansion-area {
  font-size: 14px;
}

.info-area {
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
  max-width: 1200px;
  font-size: 12px;
}
.support-buttons {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 15px;
}
/** タブレット */
@media (min-width: 600px) {
  .main-content-buttons {
    display: flex;
    flex-wrap: wrap;
  }
  .content-button {
    cursor: pointer;
    width: 146px;
    aspect-ratio: 5/4;
  }
  .content-button-title {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .support-buttons {
    grid-template-columns: 1fr 1fr;
  }
}
/** PC */
@media (min-width: 960px) {
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
  name: 'TopPage',
  mounted() {
    const saveData = this.$store.state.saveData as SaveData;
    saveData.disabledMain();
  },
  data: () => ({
    created: false,
    imported: false,
    importConfirmDialog: false,
    importFileName: '引き継ぎデータ',
    confirmDialog: false,
    importedStock: false,
    mainPages: [
      {
        title: 'Home.制空権シミュレータ',
        icon: 'mdi-calculator',
        color: 'green',
        text: [
          'Home.本サイトの主要機能です。',
          'Home.基地航空隊や艦隊、敵艦隊を編成することで、道中を含めた全ての戦闘の制空状態や艦載機の損耗、全滅率などのシミュレーションが可能です。',
        ],
        url: 'aircalc',
      },
      {
        title: 'Home.艦娘 / 装備管理',
        icon: 'mdi-database-cog',
        color: 'blue',
        text: [
          'Home.サブの機能です。',
          'Home.自分のゲーム内の艦娘、装備情報を登録すると、シミュレータ内で選択できる艦娘や装備に反映され、あの装備持ってた…？と悩む心配がなくなります。',
        ],
        url: 'manager',
      },
      {
        title: 'Home.みんなの編成',
        icon: 'mdi-human-greeting-variant',
        color: 'orange',
        text: ['Home.他の人がアップロードした編成データを閲覧できます。'],
        url: 'list',
      },
      {
        title: 'Common.サイト設定',
        icon: 'mdi-cog',
        color: 'grey',
        url: 'setting',
      },
    ],
    extraPages: [
      {
        title: 'Extra.艦娘性能一覧',
        icon: 'mdi-account-switch',
        color: 'green',
        text: 'Extra.艦娘の基本ステータスの確認と比較を行えます。',
        url: 'extra',
      },
      {
        title: 'Extra.装備性能一覧',
        icon: 'mdi-compare-horizontal',
        color: 'teal',
        text: 'Extra.装備の基本ステータスの確認と比較を行えます。',
        url: 'extra#items',
      },
      {
        title: 'Extra.対潜値計算機',
        icon: 'mdi-finance',
        color: 'light-blue',
        text: 'Extra.艦娘と装備から、指定した対潜値と必要なLvを計算します。',
        url: 'extra#asw-calculator',
      },
      {
        title: 'Extra.戦果砲管理',
        icon: 'mdi-progress-check',
        color: 'orange',
        text: 'Extra.戦果に関係する任務の進捗を管理する機能です。',
        url: 'extra#quest',
      },
      {
        title: 'Extra.敵艦生息地検索',
        icon: 'mdi-map-search',
        color: 'red',
        text: 'Extra.指定した敵艦が登場する海域を検索します。データが更新されていない場合もあるので、あくまで参考程度に。',
        url: 'extra#habitat',
      },
      {
        title: 'Extra.敵対空おばけ',
        icon: 'mdi-fire-alert',
        color: 'pink',
        text: 'Extra.敵艦の対空砲火ランキングです。見かけたら気を付けるか覚悟しましょう。',
        url: 'extra#aa-ranking',
      },
    ],
  }),
  computed: {
    isNameEmpty(): boolean {
      return this.importFileName.length <= 0;
    },
    needTrans(): boolean {
      return this.$i18n.locale !== 'ja';
    },
  },
  methods: {
    clickedButton(page: { url: string; clicked: boolean }) {
      if (page.clicked) return;
      switch (page.url) {
        case 'aircalc':
          page.clicked = true;
          this.goAirCalcPage();
          break;
        case 'setting':
          this.$emit('showSiteSetting');
          break;
        default:
          page.clicked = true;
          this.$router.push(page.url);
          break;
      }
    },
    goAirCalcPage() {
      const saveData = this.$store.state.saveData as SaveData;
      saveData.disabledMain();

      // ルートに無題のデータを生成
      const data = new SaveData();
      data.name = saveData.getNewSaveDataName();
      if (this.needTrans) {
        data.name = data.name.replace('新規データ', `${this.$t('SaveData.新規データ')} `);
      }
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

      if (this.needTrans) {
        this.importFileName = `${this.$t('SaveData.引き継ぎデータ')}`;
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
    createBackUp() {
      this.created = true;
      this.$emit('downloadBackupFile');
    },
  },
});
</script>
