<template>
  <div class="ma-4">
    <div class="mb-3">
      <v-icon x-large>mdi-database-cog</v-icon>
      <span class="ml-1">{{ $t("Home.艦娘 / 装備管理") }}</span>
    </div>
    <v-tabs v-model="tab">
      <v-tab>{{ $t("Fleet.艦娘") }}</v-tab>
      <v-tab :disabled="loading">{{ $t("Fleet.装備") }}</v-tab>
      <v-tab :disabled="readOnlyMode || loading">{{ $t("Database.反映") }}</v-tab>
      <v-tab :disabled="loading">{{ $t("Common.共有") }}</v-tab>
    </v-tabs>
    <v-divider />
    <v-tabs-items v-model="tab" :touchless="true">
      <v-tab-item>
        <ships />
      </v-tab-item>
      <v-tab-item>
        <items />
      </v-tab-item>
      <v-tab-item>
        <div class="general-container px-4 my-2">
          <div class="tutorial_box pa-0">
            <v-card v-if="$i18n.locale === 'ja'" elevation="0">
              <v-alert border="left" dense outlined type="warning">
                <div>以下の手順は、艦これサーバーから正常に送られてきた情報を、通常のブラウザの機能を使って閲覧しているだけのものであり、</div>
                <div class="font-weight-bold">艦これサーバーへの不正なアクセスや、通常プレイ以外の方法でサーバーへの接続を試みるものではありません。</div>
              </v-alert>
            </v-card>
            <v-card v-if="$i18n.locale === 'ja'" elevation="0">
              <v-alert border="left" dense outlined type="info">
                <div>2023/06/22</div>
                <div>反映方法を簡略化しました。また、Firefoxでの反映に対応しました。</div>
              </v-alert>
            </v-card>
            <v-btn class="mt-3" :class="{ secondary: showHowToDoIt, primary: !showHowToDoIt }" @click="showHowToDoIt = !showHowToDoIt">
              <template v-if="showHowToDoIt"> <v-icon>mdi-close</v-icon>{{ $t("Database.反映手順を隠す") }}</template>
              <template v-else><v-icon>mdi-plus</v-icon>{{ $t("Database.反映手順を表示") }}</template>
            </v-btn>
          </div>
          <v-card class="tutorial_box" v-if="showHowToDoIt">
            <div>
              1.
              {{ $t("Database.手順1") }}
            </div>
            <div class="tutorial_img">
              <a :href="`./img/tutorial/step1.webp`" target="_blank">
                <span class="d-none">step1</span>
                <v-img :src="`./img/tutorial/step1.webp`" max-height="900" max-width="1300" />
              </a>
            </div>
            <div class="mt-10">※ {{ $t("Database.下記はGoogle Chromeの場合です。") }}</div>
            <div class="tutorial_img">
              <a :href="`./img/tutorial/step1-2.webp`" target="_blank">
                <span class="d-none">step1-2</span>
                <v-img :src="`./img/tutorial/step1-2.webp`" max-height="900" max-width="1300" />
              </a>
            </div>
          </v-card>
          <v-card class="tutorial_box" v-if="showHowToDoIt">
            <div>2. {{ $t("Database.手順2") }}</div>
            <div class="tutorial_img">
              <a :href="`./img/tutorial/step2.webp`" target="_blank">
                <span class="d-none">step2</span>
                <v-img :src="`./img/tutorial/step2.webp`" max-height="900" max-width="1300" />
              </a>
            </div>
          </v-card>
          <v-card class="tutorial_box" v-if="showHowToDoIt">
            <div>3. {{ $t("Database.手順3") }}</div>
            <div>※ {{ $t("Database.注意事項") }}</div>
            <div class="tutorial_img">
              <a :href="`./img/tutorial/step3.webp`" target="_blank">
                <span class="d-none">step3</span>
                <v-img :src="`./img/tutorial/step3.webp`" max-height="900" max-width="1300" />
              </a>
            </div>
            <div class="mt-10">※ {{ $t("Database.ブラウザによって一部表記が変わります。") }}</div>
            <div class="tutorial_img">
              <a :href="`./img/tutorial/step3-1.webp`" target="_blank">
                <span class="d-none">step3-1</span>
                <v-img :src="`./img/tutorial/step3-1.webp`" max-height="570" max-width="1250" />
              </a>
            </div>
          </v-card>
          <v-card class="tutorial_box" v-if="showHowToDoIt">
            <div>4. {{ $t("Database.手順4") }}</div>
            <div class="d-flex align-center mt-3">
              <v-radio-group v-model="includeUnLockedShip" row hide-details @change="toggleUnLocked()" class="mt-0">
                <v-radio :label="$t('Database.未ロックの艦娘も含める')" :value="true" />
                <v-radio :label="$t('Database.ロック済みの艦娘のみ')" :value="false" />
              </v-radio-group>
              <div class="min-level-input">
                <v-text-field
                  type="number"
                  :max="maxLevel"
                  min="1"
                  v-model.number="importMinLevel"
                  :label="$t('Database.取込Lv下限')"
                  hide-details
                  outlined
                  dense
                  @change="changeMinLevel()"
                />
              </div>
            </div>
            <v-textarea class="mt-4" v-model.trim="inputText" outlined dense hide-details no-resize :label="$t('Database.反映エリア')" />
            <v-btn class="mt-4" color="primary" block @click="readJson()">{{ $t("Database.反映") }}</v-btn>
          </v-card>
          <v-card class="tutorial_box" v-if="showHowToDoIt">
            <div>5. {{ $t("Database.手順5") }}</div>
            <div>※ {{ $t("Database.注意事項") }}</div>
            <div class="tutorial_img">
              <a :href="`./img/tutorial/step5.webp`" target="_blank">
                <span class="d-none">step3</span>
                <v-img :src="`./img/tutorial/step5.webp`" max-height="900" max-width="1300" />
              </a>
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div v-if="showHowToDoIt">6. {{ $t("Database.手順4") }}</div>
            <div class="d-flex flex-wrap align-center">
              <v-radio-group v-if="!showHowToDoIt" v-model="includeUnLockedShip" row hide-details class="mt-0" @change="toggleUnLocked()">
                <v-radio :label="$t('Database.未ロックの艦娘も含める')" :value="true" />
                <v-radio :label="$t('Database.ロック済みの艦娘のみ')" :value="false" />
              </v-radio-group>
              <div class="min-level-input" v-if="!showHowToDoIt">
                <v-text-field
                  type="number"
                  :max="maxLevel"
                  min="1"
                  v-model.number="importMinLevel"
                  :label="$t('Database.取込Lv下限')"
                  hide-details
                  outlined
                  dense
                  @change="changeMinLevel()"
                />
              </div>
            </div>
            <v-radio-group v-model="includeUnLockedItem" row hide-details class="" @change="toggleUnLocked()">
              <v-radio :label="$t('Database.未ロックの装備も含める')" :value="true" />
              <v-radio :label="$t('Database.ロック済みの装備のみ')" :value="false" />
            </v-radio-group>
            <v-textarea class="mt-4" v-model.trim="inputText" outlined dense hide-details no-resize :label="$t('Database.反映エリア')" />
            <v-btn class="mt-4" color="primary" block @click="readJson()">{{ $t("Database.反映") }}</v-btn>
          </v-card>
        </div>
      </v-tab-item>
      <v-tab-item>
        <v-card class="my-3 pa-2">
          <div class="d-flex pt-3 pb-4">
            <div class="align-self-center ml-3">{{ $t("Database.共有URL発行機能") }}</div>
          </div>
          <v-divider />
          <div class="pa-4">
            <div class="mb-2">{{ $t("Database.URL発行") }}</div>
            <div class="body-2">{{ $t("Database.自分の艦隊、装備情報を他の人に見てもらうためのURLを発行します。") }}</div>
            <div class="body-2">
              {{ $t("Database.発行された情報は閲覧専用です。発行されたURLを他人に公開しても、自分の艦娘や装備情報が書き換えられてしまうことはありません。") }}
            </div>
            <div class="body-2 mb-3">{{ $t("Database.閲覧する側は、共有された艦娘や装備情報を元に編成を作成することができます。") }}</div>
            <div class="shared-url-container">
              <v-btn color="primary" v-show="!createdURL" :loading="loadingURL" :disabled="loadingURL || readOnlyMode" @click="requestURLKey()">{{
                $t("Database.共有URL作成")
              }}</v-btn>
              <v-text-field
                id="created-url"
                v-show="createdURL"
                readonly
                append-icon="mdi-content-copy"
                v-model="createdURL"
                :hint="copiedURLHint ? $t(`Common.${copiedURLHint}`) : ''"
                @click:append="copyURL"
                @blur="clearURLHint"
              />
            </div>
          </div>
          <v-divider />
          <div class="pa-4">
            <div class="mb-2">{{ $t("Database.発行履歴") }}</div>
            <v-tabs v-model="yearTab">
              <v-tab>ALL</v-tab>
              <v-tab v-for="year in years" :key="`year${year}`">{{ year }}</v-tab>
            </v-tabs>
            <v-divider></v-divider>
            <div class="d-flex flex-column-reverse">
              <template v-for="(data, i) in outputHistories">
                <v-card
                  :key="`history_${i}`"
                  class="mt-3 pa-2 d-flex"
                  v-if="!yearTab || (data.createdAt && data.createdAt.startsWith && data.createdAt.startsWith(`${years[yearTab - 1]}`))"
                >
                  <div class="mr-2 align-self-center caption">
                    <div>{{ $t("Database.発行日") }}:</div>
                    <div>{{ data.createdAt }}</div>
                  </div>
                  <div class="mr-2 align-self-center">
                    <v-btn color="primary" :disabled="expandBtnClicked || readOnlyMode" @click="expandHistory(data.id)">{{ $t("Database.展開") }}</v-btn>
                  </div>
                  <div class="mr-2 align-self-center">
                    <v-btn color="error" @click="clickedDeleteHistory(data.id)">{{ $t("Common.削除") }}</v-btn>
                  </div>
                  <div class="mr-2 align-self-center">
                    <v-btn color="success" :disabled="!data.remarks || !data.remarks.length" @click="updateHistory(data.id)">{{ $t("Common.更新") }}</v-btn>
                  </div>
                  <div class="align-self-center flex-grow-1">
                    <v-text-field v-model="data.remarks" dense outlined hide-details label="memo" />
                  </div>
                </v-card>
              </template>
            </div>
          </div>
        </v-card>
        <v-card class="my-3 pa-2">
          <div class="d-flex pt-3 pb-4">
            <div class="align-self-center ml-3">{{ $t("Database.他サイト連携") }}</div>
          </div>
          <v-divider />
          <div class="pa-4">
            <div class="mb-2">{{ $t("Database.艦隊分析コード") }}</div>
            <div class="body-2">
              {{ $t("Database.艦隊分析コードが出力されています。この文字列を別の端末で反映することで、艦隊情報を復元することができます。") }}
            </div>
            <div class="mt-4">
              <v-text-field
                id="analytics-ship-code"
                v-model="kantaiAnalyticsShipsCode"
                outlined
                readonly
                dense
                :label="$t('Database.艦隊コード')"
                append-icon="mdi-content-copy"
                :hint="copiedShipCodeHint ? $t(`Common.${copiedShipCodeHint}`) : ''"
                @click:append="copyShipCode"
                @blur="clearShipCodeHint"
              />
            </div>
            <div>
              <v-text-field
                id="analytics-item-code"
                v-model="kantaiAnalyticsItemsCode"
                outlined
                readonly
                dense
                :label="$t('Database.装備コード')"
                append-icon="mdi-content-copy"
                :hint="copiedItemCodeHint ? $t(`Common.${copiedItemCodeHint}`) : copiedItemCodeHint"
                @click:append="copyItemCode"
                @blur="clearItemCodeHint"
              />
            </div>
          </div>
          <v-divider />
          <div class="pa-4">
            <div class="mb-2">艦隊晒しページ(仮)</div>
            <div class="body-2">
              <a :href="kantaiSarashiURL" target="_blank">{{ $t("Database.艦隊晒しページ(仮)で展開する場合はこちらから") }}</a>
            </div>
          </div>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
    <div class="info-area">
      <v-divider class="mb-2" />
      <div class="caption">
        {{ $t("Home.著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。") }}
      </div>
      <div class="caption">
        {{ $t("Home.また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。") }}
      </div>
    </div>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="ma-4">
          <div>{{ $t("Common.本当に削除しますか？") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="primary" dark :disabled="!confirmDialog" @click.stop="deleteHistory()">{{ $t("Common.削除") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="loading" persistent width="300">
      <v-card dark>
        <v-card-text>
          <div class="pt-2">{{ $t("Database.在籍艦娘 / 所持装備データ読込中") }}...</div>
          <v-progress-linear indeterminate color="white" class="mb-0" />
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="areaOverwriteConfirmDialog" transition="scroll-x-transition" width="700">
      <v-card class="pa-3">
        <div class="ma-4">
          <div class="body-2">{{ $t("Database.札上書き注意") }}</div>
          <div class="body-2 mt-1">{{ $t("Database.このまま取り込むと") }}</div>
          <div class="d-flex flex-wrap justify-space-around">
            <v-btn color="primary" class="mt-3" @click="overwriteAreaImport()">{{ $t("Database.札データを上書きして取り込む") }}</v-btn>
            <v-btn color="success" class="mt-3" @click="importWithoutArea()">{{ $t("Database.札データを上書きせず取り込む") }}</v-btn>
          </div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="secondary" @click.stop="areaOverwriteConfirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.v-window.v-item-group {
  height: 100%;
  overflow: unset;
}
.info-area {
  margin: 1rem auto 0.5rem auto;
}
.tutorial_box {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
}
.copy_code {
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 1rem;
  display: flex;
  min-height: 80px;
  cursor: text;
  align-items: center;
  transition: 0.2s;
}
.copy_code:hover {
  border-color: #888 !important;
}

#ships-read-code,
#item-read-code {
  margin-left: auto;
  width: 1px;
  opacity: 0;
}

.warning_box {
  border-radius: 0.25rem;
  border: 2px solid rgb(218, 183, 80);
  padding: 0.5rem 1rem;
}

.shared-url-container {
  max-width: 400px;
}

.min-level-input {
  width: 120px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import max from 'lodash/max';
import Ships from '@/components/database/Ships.vue';
import Items from '@/components/database/Items.vue';
import Convert from '@/classes/convert';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import ShipStock from '@/classes/fleet/shipStock';
import {
  child, getDatabase, push, ref, set,
} from 'firebase/database';
import { getAuth, signInAnonymously, UserCredential } from 'firebase/auth';
import OutputHistory from '@/classes/saveData/outputHistory';
import FirebaseManager from '@/classes/firebaseManager';
import ShipMaster from '@/classes/fleet/shipMaster';
import SaveData from '@/classes/saveData/saveData';
import Const from '@/classes/const';

export default Vue.extend({
  name: 'FleetManager',
  components: { Ships, Items },
  data: () => ({
    tab: 0,
    includeUnLockedShip: true,
    includeUnLockedItem: false,
    inputText: '',
    readOnlyMode: false,
    loadingURL: false,
    createdURL: '',
    copiedURLHint: '',
    outputHistories: [] as OutputHistory[],
    confirmDialog: false,
    deleteId: -1,
    expandBtnClicked: false,
    kantaiAnalyticsShipsCode: '',
    kantaiAnalyticsItemsCode: '',
    copiedShipCodeHint: '',
    copiedItemCodeHint: '',
    unsubscribe: undefined as unknown,
    kantaiSarashiURL: '',
    loading: false,
    successCopy: false,
    showHowToDoIt: false,
    areaOverwriteConfirmDialog: false,
    readyImportShipStock: [] as ShipStock[],
    maxLevel: Const.MAX_LEVEL,
    importMinLevel: 1,
    yearTab: 0,
  }),
  mounted() {
    const saveData = this.$store.state.saveData as SaveData;
    saveData.disabledMain();

    // まず読み専か判定
    this.readOnlyMode = this.$store.getters.getExistsTempStock;

    const histories = this.$store.state.outputHistories as OutputHistory[];
    if (histories && histories.length) {
      this.outputHistories = histories.concat();
    }

    this.generateKCAnalyticsCode();
    this.generateKantaiSarashiURL();
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'setShipStock' || mutation.type === 'setItemStock') {
        this.expandBtnClicked = false;
        this.generateKCAnalyticsCode();
        this.generateKantaiSarashiURL();
      }
    });

    this.loading = !this.$store.getters.getCompletedAll;

    const setting = this.$store.state.siteSetting as SiteSetting;
    this.includeUnLockedShip = setting.isIncludeUnLockShip;
    this.includeUnLockedItem = setting.isIncludeUnLockItem;
    this.importMinLevel = setting.importShipMinLevel;

    // 何もデータがなかったら反映タブに飛ばす
    const shipStock = this.$store.state.shipStock as ShipStock[];
    const itemStock = this.$store.state.itemStock as ItemStock[];
    if (!this.readOnlyMode && !shipStock.length && !itemStock.length) {
      this.tab = 2;
      this.showHowToDoIt = true;
    }
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
    },
    years(): number[] {
      const array: number[] = [];
      for (let i = 0; i < this.outputHistories.length; i += 1) {
        const date = this.outputHistories[i].createdAt;
        const year = date && +date.slice(0, 4);

        if (year && !array.some((v) => v === year)) {
          array.push(year);
        }
      }

      return array;
    },
  },
  watch: {
    completed(value) {
      if (value) {
        this.loading = false;
        const histories = this.$store.state.outputHistories as OutputHistory[];
        if (histories && histories.length) {
          this.outputHistories = histories.concat();
        }
        this.generateKCAnalyticsCode();
        this.generateKantaiSarashiURL();
      }
    },
    isTempStockMode(value) {
      this.readOnlyMode = !!value;
      this.expandBtnClicked = false;
      this.generateKCAnalyticsCode();
      this.generateKantaiSarashiURL();
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      (this.unsubscribe as () => void)();
    }
  },
  methods: {
    readJson() {
      // デッキビルダー形式データ読み込み試行
      if (this.setShipStock()) {
        // 在籍艦娘データ読み込み試行
        if (this.areaOverwriteConfirmDialog) {
          this.inputText = '';
          return;
        }
        this.$emit('inform', '在籍艦娘データの更新が完了しました。');
        this.loadingURL = false;
      } else if (this.setItemStock()) {
        // 所持装備データ読み込み試行
        this.$emit('inform', '所持装備データの更新が完了しました。');
        this.loadingURL = false;
      } else {
        // 全部失敗
        this.$emit('inform', 'データの読み込みに失敗しました。正しいデータではない可能性があります。', true);
      }

      // 後始末と通知
      this.inputText = '';
      this.generateKCAnalyticsCode();
      this.generateKantaiSarashiURL();
    },
    overwriteAreaImport() {
      // 上書きして取り込み
      if (this.readyImportShipStock) {
        this.$store.dispatch('updateShipStock', this.readyImportShipStock);
        this.areaOverwriteConfirmDialog = false;
        this.$emit('inform', '在籍艦娘データの更新が完了しました。');
        // 後始末と通知
        this.inputText = '';
        this.generateKCAnalyticsCode();
        this.generateKantaiSarashiURL();
      }
    },
    importWithoutArea() {
      // 札情報を無視して取り込み
      if (this.readyImportShipStock) {
        const shipStock = this.$store.state.shipStock as ShipStock[];
        for (let i = 0; i < this.readyImportShipStock.length; i += 1) {
          const stock = this.readyImportShipStock[i];
          // 過去の(現在登録されている)札を取得
          const old = shipStock.find((v) => v.uniqueId === stock.uniqueId);
          if (old) {
            stock.area = old.area;
          }
        }
        this.$store.dispatch('updateShipStock', this.readyImportShipStock);
        this.areaOverwriteConfirmDialog = false;
        this.$emit('inform', '在籍艦娘データの更新が完了しました。');
        // 後始末と通知
        this.inputText = '';
        this.generateKCAnalyticsCode();
        this.generateKantaiSarashiURL();
      }
    },
    setShipStock(): boolean {
      // 在籍艦娘情報を更新
      try {
        if (!this.importMinLevel || this.importMinLevel < 0) {
          this.importMinLevel = 1;
        } else if (this.importMinLevel > this.maxLevel) {
          this.importMinLevel = this.maxLevel;
        }

        const shipList = Convert.readShipStockJson(this.inputText, !this.includeUnLockedShip, this.importMinLevel);
        this.readyImportShipStock = [];
        if (shipList.length === 0) {
          // 何もない在籍データは無意味なので返す
          return false;
        }

        // 設定書き換え
        const setting = this.$store.state.siteSetting as SiteSetting;
        setting.isStockOnlyForShipList = true;
        setting.importShipMinLevel = this.importMinLevel;
        this.$store.dispatch('updateSetting', setting);

        const shipStock = this.$store.state.shipStock as ShipStock[];

        // 旧版かどうかチェック => uniqueIdが仕事しているなら札置き換え判定が出せる (今までは連番を振ってきたので、ユニークidの最大と登録隻数が一致しているかで判定できる)
        if (shipStock.length && shipStock[shipStock.length - 1].uniqueId !== shipStock.length && shipList[shipList.length - 1].uniqueId !== shipList.length) {
          // 札の置き換えが発生しそうか？
          if (shipList.some((w) => shipStock.find((v) => v.uniqueId === w.uniqueId && v.area !== w.area))) {
            // 札が置き換わりそうじゃ。
            this.areaOverwriteConfirmDialog = true;
            this.readyImportShipStock = shipList;
            return true;
          }
        }

        this.$store.dispatch('updateShipStock', shipList);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    setItemStock(): boolean {
      // 所持装備情報を更新
      try {
        const itemList = Convert.readItemStockJson(this.inputText, !this.includeUnLockedItem);
        if (itemList.length === 0) {
          // 何もない所持装備データは無意味なので返す
          return false;
        }
        const setting = this.$store.state.siteSetting as SiteSetting;
        setting.isStockOnlyForItemList = true;
        this.$store.dispatch('updateSetting', setting);
        this.$store.dispatch('updateItemStock', itemList);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    async requestURLKey() {
      this.loadingURL = true;
      const shipStock = this.$store.state.shipStock as ShipStock[];
      const itemStock = this.$store.state.itemStock as ItemStock[];
      const stockData = FirebaseManager.createFirebaseStockObject(shipStock, itemStock);

      if (!stockData.ships && !stockData.items) {
        this.$emit('inform', '艦娘、装備情報が登録されていません。', true);
        return;
      }

      const submitData = {
        ships: stockData.ships,
        items: stockData.items,
        date: Convert.formatDate(new Date(), 'yy/MM/dd HH:mm:ss'),
        uid: '',
        ver: 3,
      };

      try {
        const db = getDatabase();
        const { key } = push(child(ref(db), 'stocks'));
        if (!key) {
          this.$emit('inform', '共有URLの生成に失敗しました。', true);
          return;
        }

        const { location } = document;
        const url = `${location.protocol}//${location.host}${location.pathname}?stockid=${key}`;

        // 匿名ログイン
        const auth = getAuth();
        signInAnonymously(auth)
          .then((d: UserCredential) => {
            if (d && d.user && d.user.uid) {
              // uidを設定する
              submitData.uid = d.user.uid;
            }

            set(ref(db, `stocks/${key}`), submitData)
              .then(() => {
                this.generateShortURL(url).then((res) => {
                  if (res) {
                    // 正常にURLが発行できたので履歴を作成
                    this.createHistory(key);
                  } else {
                    this.$emit('inform', '共有URLの生成に失敗しました。', true);
                  }
                });
              })
              .catch((error) => {
                console.error(error);
                this.$emit('inform', '共有URLの生成に失敗しました。', true);
              });
          })
          .catch((error) => {
            console.error(error);
            this.$emit('inform', '共有URLの生成に失敗しました。', true);
          });
      } catch (error) {
        console.error(error);
        this.$emit('inform', '共有URLの生成に失敗しました。', true);
      }
    },
    async generateShortURL(longURL: string): Promise<boolean> {
      let resultStatus = false;
      const url = await FirebaseManager.getShortURL(longURL);
      if (!url) {
        this.createdURL = 'URLの発行に失敗しました';
        this.loadingURL = false;
      } else {
        this.createdURL = url;
        this.loadingURL = false;
        resultStatus = true;
      }
      return resultStatus;
    },
    createHistory(key: string) {
      // URL発行履歴追加
      const histories = this.$store.state.outputHistories as OutputHistory[];
      const maxId = max(histories.map((v) => v.id)) || 0;

      const newHistories = histories.concat();
      const history = new OutputHistory();
      history.id = maxId + 1;
      history.key = key;

      newHistories.push(history);
      this.outputHistories = newHistories;
      this.$store.dispatch('updateOutputHistories', newHistories);
      this.$emit('inform', '共有URLを生成しました。');
    },
    copyURL() {
      const textToCopy = document.getElementById('created-url') as HTMLInputElement;
      textToCopy.select();
      document.execCommand('copy');
      this.copiedURLHint = 'コピーされました。';
    },
    clearURLHint() {
      this.copiedURLHint = '';
    },
    async expandHistory(id: number) {
      this.expandBtnClicked = true;

      const history = this.outputHistories.find((v) => v.id === id);
      if (history) {
        // 所持情報データ解析
        const stockData = await FirebaseManager.getAndRestoreStockData(history.key);
        if (stockData.shipStocks.length || stockData.itemStocks.length) {
          // 一時所持情報にセット
          this.$store.dispatch('updateTempShipStock', stockData.shipStocks);
          this.$store.dispatch('updateTempItemStock', stockData.itemStocks);
          this.$emit('inform', '編成を展開しました。');
        } else {
          this.$emit('inform', '編成の展開に失敗しました。', true);
        }
      }
    },
    clickedDeleteHistory(id: number) {
      this.confirmDialog = true;
      this.deleteId = id;
    },
    deleteHistory() {
      this.confirmDialog = false;
      const history = this.outputHistories.find((v) => v.id === this.deleteId);
      if (history) {
        const histories = this.$store.state.outputHistories as OutputHistory[];
        const newHistories = histories.filter((v) => v.id !== history.id);
        this.outputHistories = newHistories;
        this.$store.dispatch('updateOutputHistories', newHistories);
        this.$emit('inform', '出力履歴を削除しました。');
      }
    },
    updateHistory(id: number) {
      const index = this.outputHistories.findIndex((v) => v.id === id);
      if (index >= 0) {
        const history = this.outputHistories[index];
        const histories = this.$store.state.outputHistories as OutputHistory[];
        const newHistories = histories.concat();
        newHistories[index] = history;
        this.outputHistories = newHistories;
        this.$store.dispatch('updateOutputHistories', newHistories);
        this.$emit('inform', '更新が完了しました。');
      }
    },
    generateKCAnalyticsCode() {
      this.kantaiAnalyticsShipsCode = '';
      this.kantaiAnalyticsItemsCode = '';

      let shipStock = this.$store.state.shipStock as ShipStock[];
      let itemStock = this.$store.state.itemStock as ItemStock[];

      if (this.readOnlyMode) {
        // 閲覧モード
        shipStock = this.$store.state.tempShipStock as ShipStock[];
        itemStock = this.$store.state.tempItemStock as ItemStock[];
      }

      this.kantaiAnalyticsShipsCode = ShipStock.createFleetAnalyticsCode(shipStock);
      this.kantaiAnalyticsItemsCode = ItemStock.createFleetAnalyticsCode(itemStock);
    },
    copyShipCode() {
      const textToCopy = document.getElementById('analytics-ship-code') as HTMLInputElement;
      textToCopy.select();
      document.execCommand('copy');
      this.copiedShipCodeHint = 'コピーされました。';
    },
    clearShipCodeHint() {
      this.copiedShipCodeHint = '';
    },
    copyItemCode() {
      const textToCopy = document.getElementById('analytics-item-code') as HTMLInputElement;
      textToCopy.select();
      document.execCommand('copy');
      this.copiedItemCodeHint = 'コピーされました。';
    },
    clearItemCodeHint() {
      this.copiedItemCodeHint = '';
    },
    copyCode(elementId: string) {
      const textToCopy = document.getElementById(elementId) as HTMLInputElement;
      if (textToCopy) {
        textToCopy.select();
        document.execCommand('copy');

        this.$emit('inform', 'コピーされました。');
        this.successCopy = true;
        window.setTimeout(() => {
          this.successCopy = false;
        }, 3000);
      }
    },
    generateKantaiSarashiURL() {
      this.kantaiSarashiURL = 'http://kancolle-calc.net/kanmusu_list.html';

      let shipStock = this.$store.state.shipStock as ShipStock[];

      if (this.readOnlyMode) {
        // 閲覧モード
        shipStock = this.$store.state.tempShipStock as ShipStock[];
      }
      if (shipStock && shipStock.length) {
        const all = this.$store.state.ships as ShipMaster[];
        const firsts = all.filter((v) => v.version === 0);

        const text = [];
        for (let i = 0; i < firsts.length; i += 1) {
          const first = firsts[i];
          const versions = all.filter((v) => v.originalId === first.id);
          const versionIds = versions.map((v) => v.id);
          const stocks = shipStock.filter((v) => versionIds.includes(v.id));
          if (stocks.length) {
            // 明細データ
            const levels = [];
            for (let j = 0; j < stocks.length; j += 1) {
              const stock = stocks[j];
              const ver = all.find((v) => v.id === stock.id)?.version;
              if (ver || ver === 0) {
                levels.push({ lv: stock.level, ver: ver + 1 });
              }
            }

            levels.sort((a, b) => b.lv - a.lv);
            text.push(`${first.id === 699 ? 645 : first.id}:${levels.map((v) => `${v.lv}.${v.ver}`).join(',')}`);
          }
        }
        this.kantaiSarashiURL = `http://kancolle-calc.net/kanmusu_list.html?data=${Convert.encode64(`.2|${text.join('|')}`)}`;
      }
    },
    toggleUnLocked(): void {
      // 未ロック艦を含むかどうかのアレ変更時
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.isIncludeUnLockShip = this.includeUnLockedShip;
      setting.isIncludeUnLockItem = this.includeUnLockedItem;
      this.$store.dispatch('updateSetting', setting);
    },
    changeMinLevel() {
      // 取り込み最小レベル変更時
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (this.importMinLevel > 0 && this.importMinLevel <= this.maxLevel) {
        setting.importShipMinLevel = +this.importMinLevel;
      } else {
        setting.importShipMinLevel = 1;
      }
      this.$store.dispatch('updateSetting', setting);
    },
  },
});
</script>
