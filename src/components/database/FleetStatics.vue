<template>
  <div class="mt-3">
    <div><v-btn @click="fetchAnalyticsResult()">取得</v-btn></div>
    <div class="mx-auto my-2">
      <v-btn-toggle dense v-model="isShipMode" borderless mandatory>
        <v-btn :value="true" :class="{ 'blue darken-2 white--text': isShipMode }" @click.stop="setShipTables()" block>
          <span>{{ $t("Fleet.艦娘") }}</span>
        </v-btn>
        <v-btn :value="false" :class="{ 'red darken-2 white--text': !isShipMode }" @click.stop="setItemTables()" block>
          <span>{{ $t("Fleet.装備") }}</span>
        </v-btn>
      </v-btn-toggle>
    </div>
    <div v-if="isShipMode">
      <!-- 艦娘分析モード -->
      <div class="d-flex flex-wrap">
        <!-- カテゴリ選択欄 -->
        <div
          v-ripple="{ class: 'info--text' }"
          class="type-selector d-flex"
          :class="{ active: shipType === -1 }"
          @click="changeShipType(-1)"
          @keypress="changeShipType(-1)"
        >
          <div class="type-all-text">ALL</div>
        </div>
        <div
          v-for="(i, index) in shipTypes"
          :key="index"
          v-ripple="{ class: 'info--text' }"
          class="type-selector"
          :class="{ active: index === shipType }"
          @click="changeShipType(index)"
          @keypress="changeShipType(index)"
        >
          {{ isNotJapanese ? $t(`SType.${i.text}`) : i.text }}
        </div>
      </div>
      <div class="d-flex flex-wrap">
        <v-checkbox
          v-model="includeInitial"
          dense
          hide-details
          :label="$t('Fleet.未改造')"
          :error="!includeInitial && !includeIntermediate && !includeFinal"
          class="mr-sm-3"
          @click="setShipTables()"
        />
        <v-checkbox
          v-model="includeIntermediate"
          dense
          hide-details
          :label="$t('Fleet.中間改造')"
          :error="!includeInitial && !includeIntermediate && !includeFinal"
          class="mr-sm-3"
          @click="setShipTables()"
        />
        <v-checkbox
          v-model="includeFinal"
          dense
          hide-details
          :label="$t('Fleet.最終改造')"
          :error="!includeInitial && !includeIntermediate && !includeFinal"
          @click="setShipTables()"
        />
      </div>
    </div>
    <div v-else class="d-flex flex-wrap">
      <!-- 装備分析モード -->
      <!-- カテゴリ選択欄 -->
      <div
        v-ripple="{ class: 'info--text' }"
        class="type-selector d-flex"
        :class="{ active: itemType === -1 }"
        @click="changeItemType(-1)"
        @keypress="changeItemType(-1)"
      >
        <div class="type-all-text">ALL</div>
      </div>
      <div
        v-for="i in itemTypes"
        :key="i.id"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: itemType === i.id }"
        @click="changeItemType(i.id)"
        @keypress="changeItemType(i.id)"
      >
        <v-img :src="`./img/type/type${i.id}.png`" height="32" width="32" />
      </div>
    </div>
    <div class="ranking-cards">
      <v-card v-for="(table, i) in viewTables" :key="`table${i}`">
        <div class="pa-2 d-flex align-end">
          <div>{{ table.title }}</div>
          <v-spacer></v-spacer>
          <v-btn color="secondary" small @click="showFullTable(table)" :disabled="!table.top10.length">さらに見る</v-btn>
        </div>
        <v-divider></v-divider>
        <v-simple-table dense :class="{ 'my-6': !table.top10.length }">
          <tbody>
            <tr v-for="(row, rank) in table.top10" :key="rank">
              <td class="py-1 text-right">{{ rank + 1 }}</td>
              <td class="py-1 px-0">
                <div class="d-flex align-center">
                  <template v-if="isShipMode">
                    <!-- 艦娘モードの時 -->
                    <div>
                      <v-img v-if="row.data.id" :src="`./img/ship/${row.data.id}.png`" height="30" width="120" />
                    </div>
                    <div class="ml-1 ship-name text-caption text-truncate">{{ getShipName(row.data) }}</div>
                  </template>
                  <template v-else>
                    <!-- 装備モードの時 -->
                    <div>
                      <v-img v-if="row.data.id" :src="`./img/type/icon${row.data.iconTypeId}.png`" height="30" width="30" />
                    </div>
                    <div class="ml-1 ship-name text-caption text-truncate">{{ needTrans ? $t(`${row.data.name}`) : row.data.name }}</div>
                  </template>
                </div>
              </td>
              <td class="py-1 text-right">{{ row.value }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>
    </div>
    <v-dialog v-model="fullTableDialog" width="500" :fullscreen="isMobile">
      <v-card class="full-table-card">
        <div class="pt-2 pb-1 px-2 d-flex align-center">
          <div>{{ fullTable.title }}</div>
          <v-btn class="ml-auto" icon @click="fullTableDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="full-table-container">
          <v-simple-table dense>
            <tbody>
              <tr v-for="(row, rank) in fullTable.items" :key="rank">
                <td class="py-1 text-right">{{ rank + 1 }}</td>
                <td class="py-1 px-0">
                  <div class="d-flex align-center">
                    <template v-if="isShipMode">
                      <div>
                        <v-img v-if="row.data.id" :src="`./img/ship/${row.data.id}.png`" height="30" width="120" />
                      </div>
                      <div class="ml-1 ship-name text-caption text-truncate">{{ getShipName(row.data) }}</div>
                    </template>
                    <template v-else>
                      <!-- 装備モードの時 -->
                      <div>
                        <v-img v-if="row.data.id" :src="`./img/type/icon${row.data.iconTypeId}.png`" height="30" width="30" />
                      </div>
                      <div class="ml-1 ship-name text-caption text-truncate">{{ needTrans ? $t(`${row.data.name}`) : row.data.name }}</div>
                    </template>
                  </div>
                </td>
                <td class="py-1 text-right">{{ row.value }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.ranking-cards {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr;
  flex-wrap: wrap;
  row-gap: 1rem;
  column-gap: 1rem;
}
@media (min-width: 800px) {
  .ranking-cards {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1200px) {
  .ranking-cards {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1480px) {
  .drawer-fixed .ranking-cards {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1600px) {
  .drawer-fixed .ranking-cards {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1960px) {
  .ranking-cards {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.ship-name {
  flex-grow: 1;
  width: 100px;
}

.full-table-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.full-table-container {
  overflow-y: auto;
}

@media (min-width: 600px) {
  .full-table-card {
    display: block;
    flex-direction: unset;
    height: unset;
  }

  .full-table-container {
    height: 74vh;
  }
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.5rem;
  font-size: 14px;
  cursor: pointer;
  min-width: 50px;
  text-align: center;
}
@media (min-width: 600px) {
  .type-selector {
    min-width: unset;
  }
}
.type-selector:hover {
  background-color: rgba(17, 9, 9, 0.2);
}
.type-selector.active {
  border-color: rgba(33, 150, 243, 0.4);
  background-color: rgba(33, 150, 243, 0.1);
}
.type-all-text {
  width: 32px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9em;
  align-self: center;
}
</style>

<script lang="ts">
import Vue from 'vue';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import ItemMaster from '@/classes/item/itemMaster';
import ShipStock from '@/classes/fleet/shipStock';
import ShipMaster from '@/classes/fleet/shipMaster';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { decompressFromEncodedURIComponent } from 'lz-string';
import mockData from '@/classes/mockData';
import Const from '../../classes/const';

interface MinifyAnalyzeResult {
  a: number;
  d: number;
  ic: number;
  sc: number;
  se: number;
  is: {
    i: number;
    oc: number;
    tc: number;
    rm: number[];
  }[];
  ss: {
    i: number;
    rc: number;
    lu: number;
    hp: number;
    as: number;
    av: number;
    dv: number;
    mc: number;
    oc: number;
    tc: number;
  }[];
}

interface AnalyzeShipResult {
  /** 艦娘マスタid */
  id: number;
  /** 本艦娘の補強増設が開放された総数 */
  releaseExCount: number;
  /** 本艦娘に施された運改修の合計値 */
  totalImproveLuck: number;
  /** 本艦娘に施された耐久改修の合計値 */
  totalImproveHP: number;
  /** 本艦娘に施された対潜改修の合計値 */
  totalImproveASW: number;
  /** 本艦娘の練度の平均 */
  avgLevel: number;
  /** 本艦娘の練度の標準偏差 */
  divLevel: number;
  /** 本艦娘に指輪を渡したの提督の総数 */
  onceMarriageCount: number;
  /** 本艦娘が着任している提督数 */
  onceCount: number;
  /** 本艦娘の全体在籍数 */
  totalCount: number;
  /** 艦娘マスタデータ(あとで紐づけ) */
  data: ShipMaster;
}

interface AnalyzeItemResult {
  /** 装備マスタid */
  id: number;
  /** 本装備の所持提督数 */
  onceCount: number;
  /** 本装備の全体所持数 */
  totalCount: number;
  /** 装備マスタデータ(あとで紐づけ) */
  data: ItemMaster;
}

interface AnalyzeResult {
  /** 総経験値合計 */
  sumTotalExp: number;
  /** 総経験値平均 */
  avgTotalExp: number;
  /** 総経験値標準偏差 */
  divTotalExp: number;
  /** 装備有効データ総数 */
  itemCount: number;
  /** 艦娘有効データ総数 */
  shipCount: number;
  /** 装備分析データ一覧 */
  items: AnalyzeItemResult[];
  /** 艦娘分析データ一覧 */
  ships: AnalyzeShipResult[];
}

interface ShipRankingTable {
  title: string;
  top10: { data: ShipMaster; value: number | string }[];
  items: { data: ShipMaster; value: number | string }[];
}

interface ItemRankingTable {
  title: string;
  top10: { data: ItemMaster; value: number | string }[];
  items: { data: ItemMaster; value: number | string }[];
}

export default Vue.extend({
  name: 'FleetStatics',
  components: {},
  data: () => ({
    isShipMode: true,
    allShipMaster: [] as ShipMaster[],
    allItemMaster: [] as ItemMaster[],
    itemStock: [] as ItemStock[],
    shipStock: [] as ShipStock[],
    shipTypes: [] as { text: string; types: number[] }[],
    shipType: -1,
    itemTypes: [] as { id: number; types: number[] }[],
    itemType: -1,
    includeInitial: true,
    includeIntermediate: true,
    includeFinal: true,
    unsubscribe: undefined as unknown,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipX: 0,
    tooltipY: 0,
    readOnly: false,
    isMobile: true,
    fullTable: {} as ShipRankingTable | ItemRankingTable,
    fullTableDialog: false,
    analyzeResult: {
      ships: [],
      items: [],
      sumTotalExp: 0,
      avgTotalExp: 0,
      divTotalExp: 0,
      itemCount: 0,
      shipCount: 0,
    } as AnalyzeResult,
    viewTables: [] as ShipRankingTable[] | ItemRankingTable[],
  }),
  mounted() {
    if (this.$store.getters.getExistsTempStock) {
      this.readOnly = true;
    }

    this.initialize();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setItemStock') {
        this.itemStock = state.itemStock as ItemStock[];
      } else if (mutation.type === 'setShipStock') {
        this.shipStock = state.shipStock as ShipStock[];
      }
    });
  },
  watch: {
    completed(value) {
      if (value && !this.allItemMaster.length && !this.allShipMaster.length) {
        this.initialize();
      }
    },
    isTempStockMode(value) {
      this.readOnly = !!value;
      this.initialize();
    },
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      (this.unsubscribe as () => void)();
    }
  },
  methods: {
    initialize() {
      // 全データ取得
      this.allItemMaster = this.$store.state.items as ItemMaster[];
      this.allItemMaster = this.allItemMaster.filter((v) => !v.isEnemyItem);
      this.itemStock = this.$store.state.itemStock as ItemStock[];

      this.allShipMaster = this.$store.state.ships as ShipMaster[];
      this.shipStock = this.$store.state.shipStock as ShipStock[];

      if (this.readOnly) {
        // 閲覧モード
        this.itemStock = this.$store.state.tempItemStock as ItemStock[];
        this.shipStock = this.$store.state.tempShipStock as ShipStock[];
      }

      // 艦娘カテゴリ一覧セット
      this.shipTypes = [];
      for (let i = 0; i < Const.SHIP_TYPES_ALT2.length; i += 1) {
        const data = Const.SHIP_TYPES_ALT2[i];
        this.shipTypes.push({ text: data.text, types: data.types });
      }

      // 装備カテゴリ一覧セット
      this.itemTypes = [];
      for (let i = 0; i < Const.ITEM_TYPES_ALT.length; i += 1) {
        const type = Const.ITEM_TYPES_ALT[i];
        this.itemTypes.push({ id: type.id, types: type.types });
      }
    },
    async fetchAnalyticsResult() {
      // 匿名ログイン
      // const auth = getAuth();
      // await signInAnonymously(auth);

      // const db = getDatabase();
      // onValue(
      //   ref(db, '/analyze_result'),
      //   (snapshot) => {
      //     const raw = snapshot.val();
      //     console.log(raw);

      //     const decoded = decompressFromEncodedURIComponent(raw);
      //     if (decoded) {
      //       const min = JSON.parse(decoded) as MinifyAnalyzeResult;
      //       this.analyzeResult = {
      //         avgTotalExp: min.a,
      //         divTotalExp: min.d,
      //         sumTotalExp: min.se,
      //         itemCount: min.ic,
      //         items: min.is.map((v) => {
      //           const data = this.allItemMaster.find((x) => x.id === v.i) ?? new ItemMaster();
      //           return {
      //             id: v.i,
      //             data,
      //             onceCount: v.oc,
      //             totalCount: v.tc,
      //           };
      //         }),
      //         shipCount: min.sc,
      //         ships: min.ss.map((v) => {
      //           const data = this.allShipMaster.find((x) => x.id === v.i) ?? new ShipMaster();
      //           return {
      //             id: v.i,
      //             data,
      //             totalCount: v.tc,
      //             totalImproveHP: v.hp,
      //             totalImproveASW: v.as,
      //             totalImproveLuck: v.lu,
      //             releaseExCount: v.rc,
      //             onceMarriageCount: v.mc,
      //             onceCount: v.oc,
      //             avgLevel: v.av,
      //             divLevel: v.dv,
      //           };
      //         }),
      //       };
      //     } else {
      //       this.analyzeResult = {
      //         ships: [],
      //         items: [],
      //         sumTotalExp: 0,
      //         avgTotalExp: 0,
      //         divTotalExp: 0,
      //         itemCount: 0,
      //         shipCount: 0,
      //       };
      //     }

      //     this.setItemTables();
      //     this.setShipTables();
      //   },
      //   { onlyOnce: true },
      // );

      const mock = mockData;
      const decoded = decompressFromEncodedURIComponent(mock);
      if (decoded) {
        const min = JSON.parse(decoded) as MinifyAnalyzeResult;
        this.analyzeResult = {
          avgTotalExp: min.a,
          divTotalExp: min.d,
          sumTotalExp: min.se,
          itemCount: min.ic,
          items: min.is.map((v) => {
            const data = this.allItemMaster.find((x) => x.id === v.i) ?? new ItemMaster();
            return {
              id: v.i,
              data,
              onceCount: v.oc,
              totalCount: v.tc,
            };
          }),
          shipCount: min.sc,
          ships: min.ss.map((v) => {
            const data = this.allShipMaster.find((x) => x.id === v.i) ?? new ShipMaster();
            return {
              id: v.i,
              data,
              totalCount: v.tc,
              totalImproveHP: v.hp,
              totalImproveASW: v.as,
              totalImproveLuck: v.lu,
              releaseExCount: v.rc,
              onceMarriageCount: v.mc,
              onceCount: v.oc,
              avgLevel: v.av,
              divLevel: v.dv,
            };
          }),
        };
      } else {
        this.analyzeResult = {
          ships: [],
          items: [],
          sumTotalExp: 0,
          avgTotalExp: 0,
          divTotalExp: 0,
          itemCount: 0,
          shipCount: 0,
        };
      }

      this.setItemTables();
      this.setShipTables();
    },
    changeShipType(type = 0) {
      this.shipType = type;
      this.setShipTables();
    },
    changeItemType(type = 0) {
      this.itemType = type;
      this.setItemTables();
    },
    setShipTables() {
      this.isShipMode = true;
      this.viewTables = [] as ShipRankingTable[];
      /** 有効登録母数 */
      const baseCount = this.analyzeResult.shipCount;
      let ships = this.analyzeResult.ships.concat() as AnalyzeShipResult[];

      // カテゴリ検索
      const t = this.shipTypes[this.shipType];
      if (t) {
        ships = ships.filter((v) => t.types.includes(v.data.type));
      }

      // 初期改造状態で絞る
      if (!this.includeInitial) {
        ships = ships.filter((v) => v.data.version !== 0 || v.data.isFinal);
      }
      // 中間改造状態で絞る
      if (!this.includeIntermediate) {
        ships = ships.filter((v) => v.data.version === 0 || v.data.isFinal);
      }
      // 最終改造状態で絞る
      if (!this.includeFinal) {
        ships = ships.filter((v) => !v.data.isFinal);
      }

      const maxTableRows = this.shipType === -1 ? 200 : 300;

      ships.sort((a, b) => b.totalCount - a.totalCount);
      this.viewTables.push({
        title: '総在籍数',
        top10: ships.slice(0, 10).map((v) => ({ data: v.data, value: v.totalCount })),
        items: ships.slice(0, maxTableRows).map((v) => ({ data: v.data, value: v.totalCount })),
      });

      ships.sort((a, b) => b.onceCount - a.onceCount);
      this.viewTables.push({
        title: '在籍率',
        top10: ships.slice(0, 10).map((v) => ({ data: v.data, value: `${(100 * (v.onceCount / baseCount)).toFixed(1)} %` })),
        items: ships.slice(0, maxTableRows).map((v) => ({ data: v.data, value: `${(100 * (v.onceCount / baseCount)).toFixed(1)} %` })),
      });

      ships.sort((a, b) => b.onceMarriageCount - a.onceMarriageCount);
      this.viewTables.push({
        title: 'ケッコン率',
        top10: ships
          .filter((v) => v.onceMarriageCount)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: `${(100 * (v.onceMarriageCount / baseCount)).toFixed(1)} %` })),
        items: ships
          .filter((v) => v.onceMarriageCount)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: `${(100 * (v.onceMarriageCount / baseCount)).toFixed(1)} %` })),
      });

      ships.sort((a, b) => b.releaseExCount - a.releaseExCount);
      this.viewTables.push({
        title: '補強増設開放数',
        top10: ships
          .filter((v) => v.releaseExCount)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: v.releaseExCount })),
        items: ships
          .filter((v) => v.releaseExCount)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: v.releaseExCount })),
      });

      ships.sort((a, b) => b.totalImproveLuck - a.totalImproveLuck);
      this.viewTables.push({
        title: '総運改修値',
        top10: ships
          .filter((v) => v.totalImproveLuck)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: v.totalImproveLuck })),
        items: ships
          .filter((v) => v.totalImproveLuck)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: v.totalImproveLuck })),
      });

      ships.sort((a, b) => b.totalImproveHP - a.totalImproveHP);
      this.viewTables.push({
        title: '総耐久改修値',
        top10: ships
          .filter((v) => v.totalImproveHP)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: v.totalImproveHP })),
        items: ships
          .filter((v) => v.totalImproveHP)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: v.totalImproveHP })),
      });

      ships.sort((a, b) => b.totalImproveASW - a.totalImproveASW);
      this.viewTables.push({
        title: '総対潜改修値',
        top10: ships
          .filter((v) => v.totalImproveASW)
          .slice(0, 10)
          .map((v) => ({ data: v.data, value: v.totalImproveASW })),
        items: ships
          .filter((v) => v.totalImproveASW)
          .slice(0, maxTableRows)
          .map((v) => ({ data: v.data, value: v.totalImproveASW })),
      });
    },
    setItemTables() {
      this.isShipMode = false;
      this.viewTables = [] as ItemRankingTable[];
      /** 有効登録母数 */
      const baseCount = this.analyzeResult.itemCount;
      let items = this.analyzeResult.items.concat() as AnalyzeItemResult[];

      const t = this.itemTypes.find((v) => v.id === this.itemType);
      if (t) {
        items = items.filter((v) => t.types.includes(v.data.apiTypeId));
      }

      items.sort((a, b) => b.totalCount - a.totalCount);
      this.viewTables.push({
        title: '総在庫数',
        top10: items.slice(0, 10).map((v) => ({ data: v.data, value: v.totalCount })),
        items: items.slice(0, 300).map((v) => ({ data: v.data, value: v.totalCount })),
      });

      items.sort((a, b) => b.onceCount - a.onceCount);
      this.viewTables.push({
        title: '所持率',
        top10: items.slice(0, 10).map((v) => ({ data: v.data, value: `${(100 * (v.onceCount / baseCount)).toFixed(1)} %` })),
        items: items.map((v) => ({ data: v.data, value: `${(100 * (v.onceCount / baseCount)).toFixed(1)} %` })),
      });

      items.sort((a, b) => b.totalCount - a.totalCount);
      this.viewTables.push({
        title: '平均所持数',
        top10: items.slice(0, 10).map((v) => ({ data: v.data, value: (v.totalCount / baseCount).toFixed(1) })),
        items: items.slice(0, 300).map((v) => ({ data: v.data, value: (v.totalCount / baseCount).toFixed(1) })),
      });
    },
    showFullTable(tableData: ShipRankingTable | ItemRankingTable) {
      this.isMobile = window.innerWidth < 600;
      this.fullTable = tableData;
      this.fullTableDialog = true;
    },
    translate(v: string): string {
      return v ? `${this.$t(v)}` : '';
    },
    getShipName(ship: ShipMaster) {
      if (this.needTrans) {
        const array = ShipMaster.getSuffix(ship);
        return `${array.map((v) => this.translate(v)).join('')}`;
      }
      return ship.name ? ship.name : '';
    },
  },
});
</script>
