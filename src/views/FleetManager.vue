<template>
  <div class="ma-4">
    <div class="mb-3">
      <v-icon x-large>mdi-database-cog</v-icon>
      <span class="ml-1">艦娘 / 装備管理</span>
    </div>
    <v-tabs v-model="tab">
      <v-tab href="#ships">艦娘</v-tab>
      <v-tab href="#items" :disabled="loading">装備</v-tab>
      <v-tab href="#read" :disabled="readOnlyMode || loading">反映</v-tab>
      <v-tab href="#share" :disabled="loading">共有</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-tabs-items v-model="tab">
      <v-tab-item value="ships">
        <ships />
      </v-tab-item>
      <v-tab-item value="items">
        <items />
      </v-tab-item>
      <v-tab-item value="read">
        <div class="general-container pa-4 my-2">
          <v-card class="tutorial_box">
            <div>1. 艦これにログイン後、艦これ画面上で右クリックし、コンテキストメニューから「検証」を選択</div>
            <div>※ 以降、反映手順については、PC版ブラウザ『Google Chrome』における説明となっています。</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial1.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>2. ウインドウが開くので、「Console」タブを開き、「Clear console」ボタンを押下</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial2.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>3. consoleに「this.KCS」と入力してEnterを押下、表示されたオブジェクトについて矢印を選択して内容を展開</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial3.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>4. 4つあるオブジェクトのなかで、内容が「{__esModule: true, default: ƒ}」となっているオブジェクトを探す</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial4.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>5. 4で見つけたオブジェクトのうち、「default」まで展開したときに中に「model」が存在するものを探す</div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial5.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>
              6. 「model」が存在する方の「default」の上で右クリックし、「Store function as global variable」（なければ「Store as global
              variable」）を選択
            </div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial6.jpg`" />
            </div>
            <div>
              選択すると、下記のように「temp1」と出てきます。もし、temp2など数字が違っている場合、次の手順7.の注意事項欄を見てください。
            </div>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial6_2.jpg`" />
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>
              7. 下記のJavaScriptコードをconsoleに貼り付け、Enterを押下。※
              押下後、『undefined』と表示されれば、クリップボードに自動コピーされており、そのまま手順8の入力欄に貼り付けることができます。
            </div>
            <div class="d-flex">
              <v-radio-group v-model="includeUnLocked" row hide-details class="py-0">
                <v-radio label="未ロックも含める" :value="true"></v-radio>
                <v-radio label="ロック済みのみ" :value="false"></v-radio>
              </v-radio-group>
            </div>
            <div>
              <v-tabs v-model="code_tab">
                <v-tab href="#ship_code">艦娘</v-tab>
                <v-tab href="#item_code">装備</v-tab>
              </v-tabs>
            </div>
            <v-tabs-items v-model="code_tab">
              <v-tab-item value="ship_code">
                <v-card class="copy_code">
                  copy(JSON.stringify(Object.entries(<span class="red--text">temp1</span>.model.ship._map).map(([,v])=>{return{'id':
                  v._o.api_ship_id,'lv': v._o.api_lv,'locked': v._o.api_locked,'st':
                  v._o.api_kyouka,'exp':v._o.api_exp,'ex':v._o.api_slot_ex,'area':v._o.api_sally_area}})<span v-if="!includeUnLocked"
                    >.filter(v=>v.locked)</span
                  >,['id','lv','st','exp','ex','area']))
                </v-card>
              </v-tab-item>
              <v-tab-item value="item_code">
                <v-card class="copy_code">
                  copy(JSON.stringify(Object.entries(<span class="red--text">temp1</span>.model.slot._map).map(([,v])=>{return
                  {'id':v._o.api_slotitem_id,'lv': v._o.api_level,'locked':v._o.api_locked}})<span v-if="!includeUnLocked"
                    >.filter(v=>v.locked)</span
                  >,['id','lv']))
                </v-card>
              </v-tab-item>
            </v-tabs-items>
            <div class="tutorial_img">
              <v-img :src="`./img/tutorial/tutorial7.jpg`" />
            </div>
            <div class="warning_box mt-3">
              <div>注意事項</div>
              <div class="mt-1">
                手順6.「Store function as global variable」を選択した際に出てくる「<span class="red--text">temp○○</span>」と、
                上記JavaScript内の「<span class="red--text">temp○○</span>」は一致させる必要があります。
              </div>
              <div>
                手順通りやるとtemp1となりますが、手順6.で例えば「temp2」と出てきていたら、JavaScriptコードの「temp1」の部分を「temp2」と自分で書き換えて実行してください。
              </div>
              <div class="tutorial_img">
                <v-img :src="`./img/tutorial/tutorial7_2.jpg`" />
              </div>
            </div>
          </v-card>
          <v-card class="tutorial_box">
            <div>8. 下記の反映エリアに、手順7.でコピーされた文字列を貼り付けて「反映」を押下</div>
            <v-textarea class="mt-4" v-model.trim="inputText" outlined dense hide-details no-resize label="反映エリア"></v-textarea>
            <v-btn class="mt-4" color="primary" block @click="readJson()">反映</v-btn>
          </v-card>
        </div>
      </v-tab-item>
      <v-tab-item value="share">
        <v-card class="my-3 pa-2">
          <div class="d-flex pt-3 pb-4">
            <div class="align-self-center ml-3">共有URL発行機能</div>
          </div>
          <v-divider></v-divider>
          <div class="pa-4">
            <div class="mb-2">URL発行</div>
            <div class="body-2">自分の艦隊、装備情報を他の人に見てもらうためのURLを発行します。</div>
            <div class="body-2">
              発行された情報は閲覧専用です。発行されたURLを他人に公開しても、自分の艦娘や装備情報が書き換えられてしまうことはありません。
            </div>
            <div class="body-2 mb-3">閲覧する側は、共有された艦娘や装備情報を元に編成を作成することができます。</div>
            <div class="shared-url-container">
              <v-btn
                color="primary"
                v-show="!createdURL"
                :loading="loadingURL"
                :disabled="loadingURL || readOnlyMode"
                @click="requestURLKey()"
                >共有URL作成</v-btn
              >
              <v-text-field
                id="created-url"
                v-show="createdURL"
                readonly
                append-icon="mdi-content-copy"
                v-model="createdURL"
                :hint="copiedURLHint"
                @click:append="copyURL"
                @blur="clearURLHint"
              ></v-text-field>
            </div>
          </div>
          <v-divider></v-divider>
          <div class="pa-4">
            <div class="mb-2">発行履歴</div>
            <v-card v-for="(data, i) in outputHistories" :key="`history_${i}`" class="ma-2 pa-3">
              <div class="d-flex">
                <div class="mr-2 align-self-center caption">
                  <div>発行日:</div>
                  <div>{{ data.createdAt }}</div>
                </div>
                <div class="mr-2 align-self-center">
                  <v-btn color="info" :disabled="expandBtnClicked || readOnlyMode" @click="expandHistory(i)">展開</v-btn>
                </div>
                <div class="mr-2 align-self-center">
                  <v-btn color="error" @click="clickedDeleteHistory(i)">削除</v-btn>
                </div>
                <div class="mr-2 align-self-center">
                  <v-btn color="success" :disabled="!data.remarks || !data.remarks.length" @click="updateHistory(i)">更新</v-btn>
                </div>
                <div class="align-self-center flex-grow-1">
                  <v-text-field v-model="data.remarks" dense outlined hide-details label="Memo"></v-text-field>
                </div>
              </div>
            </v-card>
          </div>
        </v-card>
        <v-card class="my-3 pa-2">
          <div class="d-flex pt-3 pb-4">
            <div class="align-self-center ml-3">他サイト連携</div>
          </div>
          <v-divider></v-divider>
          <div class="pa-4">
            <div class="mb-2">艦隊分析コード</div>
            <div class="body-2">
              <a href="https://docs.google.com/spreadsheets/d/1NuLlff6EXM0XQ_qNHP9lEOosbwHXamaVNJb72M7ZLoY" target="_blank"
                >艦隊分析スプレッドシート</a
              >等で読み込めるコードです。現在閲覧中の情報が出力されています。
            </div>
            <div class="mt-4">
              <v-text-field
                id="analytics-ship-code"
                v-model="kantaiAnalyticsShipsCode"
                outlined
                readonly
                dense
                label="艦隊コード"
                append-icon="mdi-content-copy"
                :hint="copiedShipCodeHint"
                @click:append="copyShipCode"
                @blur="clearShipCodeHint"
              ></v-text-field>
            </div>
            <div>
              <v-text-field
                id="analytics-item-code"
                v-model="kantaiAnalyticsItemsCode"
                outlined
                readonly
                dense
                label="装備コード"
                append-icon="mdi-content-copy"
                :hint="copiedItemCodeHint"
                @click:append="copyItemCode"
                @blur="clearItemCodeHint"
              ></v-text-field>
            </div>
          </div>
          <v-divider></v-divider>
          <div class="pa-4">
            <div class="mb-2">艦隊晒しページ(仮)</div>
            <div class="body-2"><a :href="kantaiSarashiURL" target="_blank">艦隊晒しページ(仮)で展開する場合はこちらから</a></div>
          </div>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
    <div class="info-area">
      <v-divider class="mb-2"></v-divider>
      <div class="caption">
        著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。
      </div>
      <div class="caption">また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。</div>
    </div>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="ma-4">
          <div>本当に削除しますか？</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="info" dark :disabled="!confirmDialog" @click.stop="deleteHistory()">削除</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">戻る</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="loading" persistent width="300">
      <v-card dark>
        <v-card-text>
          <div class="pt-2">在籍艦娘 / 所持装備データ読込中...</div>
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
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
  margin: 2rem auto 0.5rem auto;
}
.tutorial_box {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1.5rem;
}
.copy_code {
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 4px;
  margin-bottom: 1rem;
  padding: 1rem;
}
.warning_box {
  border-radius: 0.25rem;
  border: 2px solid rgb(218, 183, 80);
  padding: 0.5rem 1rem;
}

.shared-url-container {
  max-width: 400px;
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
import Const from '@/classes/const';
import OutputHistory from '@/classes/saveData/outputHistory';
import FirebaseManager from '@/classes/firebaseManager';
import ShipMaster from '@/classes/fleet/shipMaster';

export default Vue.extend({
  name: 'FleetManager',
  components: { Ships, Items },
  data: () => ({
    tab: 'ship',
    code_tab: 'ship_code',
    includeUnLocked: false,
    readResultColor: 'success',
    inputText: '',
    readOnlyMode: false,
    loadingURL: false,
    createdURL: '',
    copiedURLHint: '',
    outputHistories: [] as OutputHistory[],
    confirmDialog: false,
    deleteIndex: -1,
    expandBtnClicked: false,
    kantaiAnalyticsShipsCode: '',
    kantaiAnalyticsItemsCode: '',
    copiedShipCodeHint: '',
    copiedItemCodeHint: '',
    unsbscribe: undefined as unknown,
    kantaiSarashiURL: '',
    loading: false,
  }),
  mounted() {
    // まず読み専か判定
    this.readOnlyMode = this.$store.getters.getExistsTempStock;

    const histories = this.$store.state.outputHistories as OutputHistory[];
    if (histories && histories.length) {
      this.outputHistories = histories.concat();
    }

    this.generateKCAnalyticsCode();
    this.generateKantaiSarashiURL();
    this.unsbscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'setShipStock' || mutation.type === 'setItemStock') {
        this.expandBtnClicked = false;
        this.generateKCAnalyticsCode();
        this.generateKantaiSarashiURL();
      }
    });

    this.loading = !this.$store.getters.getCompletedAll;
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
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
    if (this.unsbscribe) {
      (this.unsbscribe as () => void)();
    }
  },
  methods: {
    readJson() {
      // デッキビルダー形式データ読み込み試行
      if (this.setShipStock()) {
        // 在籍艦娘データ読み込み試行
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
    setShipStock(): boolean {
      // 在籍艦娘情報を更新
      try {
        const shipList = Convert.readShipStockJson(this.inputText);
        if (shipList.length === 0) {
          // 何もない在籍データは無意味なので返す
          return false;
        }
        // 設定書き換え
        const setting = this.$store.state.siteSetting as SiteSetting;
        setting.isStockOnlyForShipList = true;
        this.$store.dispatch('updateSetting', setting);
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
        const itemList = Convert.readItemStockJson(this.inputText);
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
        this.$emit('inform', '艦娘、装備情報が登録されていません', true);
        return;
      }

      const registData = {
        ships: stockData.ships,
        items: stockData.items,
        date: Convert.formatDate(new Date(), 'yy/MM/dd HH:mm:ss'),
        ver: 2,
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

        set(ref(db, `stocks/${key}`), registData)
          .then(() => {
            this.generateShortURL(url).then((res) => {
              if (res) {
                // 正常にURLが発行できたので履歴を作成
                this.createHistory(key);
              }
            });
          })
          .catch((error) => {
            console.error(error);
          });
      } catch (error) {
        console.error(error);
        this.$emit('inform', '共有URLの生成に失敗しました。', true);
      }
    },
    async generateShortURL(longURL: string): Promise<boolean> {
      let resutlStatus = false;
      const url = await FirebaseManager.getShortURL(longURL);
      if (!url) {
        this.createdURL = 'URLの発行に失敗しました';
        this.loadingURL = false;
      } else {
        this.createdURL = url;
        this.loadingURL = false;
        resutlStatus = true;
      }
      return resutlStatus;
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
      this.copiedURLHint = 'URLがコピーされました。';
    },
    clearURLHint() {
      this.copiedURLHint = '';
    },
    async expandHistory(index: number) {
      this.expandBtnClicked = true;

      const history = this.outputHistories[index];
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
    },
    clickedDeleteHistory(index: number) {
      this.confirmDialog = true;
      this.deleteIndex = index;
    },
    deleteHistory() {
      this.confirmDialog = false;
      const history = this.outputHistories[this.deleteIndex];
      if (history) {
        const histories = this.$store.state.outputHistories as OutputHistory[];
        const newHistories = histories.filter((v) => v.id !== history.id);
        this.outputHistories = newHistories;
        this.$store.dispatch('updateOutputHistories', newHistories);
        this.$emit('inform', '出力履歴を削除しました。');
      }
    },
    updateHistory(index: number) {
      const history = this.outputHistories[index];
      if (history) {
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

      if (shipStock && shipStock.length) {
        const shipJSONRows = [];
        for (let i = 0; i < shipStock.length; i += 1) {
          const stock = shipStock[i];
          const nextLvObj = Const.LEVEL_BORDERS.find((v) => v.lv === stock.level + 1);
          const nextExp = nextLvObj ? nextLvObj.req - stock.exp : 0;
          const data = {
            id: stock.id,
            lv: stock.level,
            st: [
              stock.improvement.fire ? stock.improvement.fire : 0,
              stock.improvement.torpedo ? stock.improvement.torpedo : 0,
              stock.improvement.antiAir ? stock.improvement.antiAir : 0,
              stock.improvement.armor ? stock.improvement.armor : 0,
              stock.improvement.luck ? stock.improvement.luck : 0,
              stock.improvement.hp ? stock.improvement.hp : 0,
              stock.improvement.asw ? stock.improvement.asw : 0,
            ],
            exp: [stock.exp, nextExp, 0],
          };
          shipJSONRows.push(data);
        }

        this.kantaiAnalyticsShipsCode = JSON.stringify(shipJSONRows);
      }

      if (itemStock && itemStock.length && itemStock.some((v) => v.num.some((x) => x > 0))) {
        const itemJSONRows = [];
        for (let i = 0; i < itemStock.length; i += 1) {
          const stock = itemStock[i];
          for (let remodel = 0; remodel < stock.num.length; remodel += 1) {
            const count = stock.num[remodel];
            for (let j = 0; j < count; j += 1) {
              itemJSONRows.push({ id: stock.id, lv: remodel });
            }
          }
        }
        this.kantaiAnalyticsItemsCode = JSON.stringify(itemJSONRows);
      }
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
          const versions = all.filter((v) => v.originalId === first.albumId);
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
  },
});
</script>
