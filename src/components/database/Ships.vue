<template>
  <div class="mt-3 ships-page">
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header class="px-4">
          <div><v-icon>mdi-filter</v-icon>フィルター</div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-divider class="mb-6"></v-divider>
          <div class="d-flex flex-wrap my-2">
            <v-text-field
              class="search-input"
              label="id 名称検索"
              dense
              v-model.trim="searchWord"
              @input="masterFilter"
              clearable
              hide-details
              prepend-inner-icon="mdi-magnify"
            ></v-text-field>
            <v-checkbox class="mx-2" dense v-model="onlyStock" @change="filter" label="未着任艦非表示"></v-checkbox>
            <v-checkbox class="mx-2" dense v-model="onlyNoStock" @change="filter" label="未着任艦のみ"></v-checkbox>
            <v-checkbox class="mx-2" dense v-model="is4n" @change="filter" label="耐久値4n"></v-checkbox>
            <v-checkbox class="mx-2" dense v-model="isDiahatsu" @change="masterFilter" label="大発搭載可"></v-checkbox>
            <v-checkbox class="mx-2" dense v-model="isKamisha" @change="masterFilter" label="内火艇搭載可"></v-checkbox>
          </div>
          <div class="my-5 range-inputs">
            <div class="d-flex py-5">
              <div class="range-input">
                <v-text-field
                  label="Lv下限"
                  type="number"
                  :max="levelRange[1]"
                  min="1"
                  dense
                  v-model.trim="levelRange[0]"
                  hide-details
                ></v-text-field>
              </div>
              <v-range-slider
                v-model="levelRange"
                dense
                thumb-label
                min="1"
                max="175"
                hide-details
                class="pt-2 align-center mx-2"
                @change="filter"
              >
              </v-range-slider>
              <div class="range-input">
                <v-text-field
                  label="Lv上限"
                  type="number"
                  max="200"
                  :min="levelRange[0]"
                  dense
                  v-model.trim="levelRange[1]"
                  hide-details
                ></v-text-field>
              </div>
            </div>
            <div class="d-flex py-5">
              <div class="range-input">
                <v-text-field
                  label="運下限"
                  type="number"
                  :max="luckRange[1]"
                  min="1"
                  dense
                  v-model.trim="luckRange[0]"
                  hide-details
                ></v-text-field>
              </div>
              <v-range-slider
                v-model="luckRange"
                dense
                thumb-label
                min="1"
                max="200"
                hide-details
                class="pt-2 align-center mx-2"
                @change="filter"
              >
              </v-range-slider>
              <div class="range-input">
                <v-text-field
                  label="運上限"
                  type="number"
                  max="200"
                  :min="luckRange[0]"
                  dense
                  v-model.trim="luckRange[1]"
                  hide-details
                ></v-text-field>
              </div>
            </div>
          </div>
          <div class="my-5 range-inputs">
            <v-select
              class="mt-2 py-5"
              v-model="addHP"
              :items="hpItems"
              dense
              attach
              chips
              deletable-chips
              hide-details
              label="耐久改修"
              multiple
              @change="filter"
            />
            <div class="d-flex py-5">
              <div class="range-input align-self-end">
                <v-text-field
                  label="対潜改修下限"
                  type="number"
                  :max="aswRange[1]"
                  min="0"
                  dense
                  v-model.trim="aswRange[0]"
                  hide-details
                ></v-text-field>
              </div>
              <v-range-slider
                v-model="aswRange"
                dense
                thumb-label
                min="0"
                max="9"
                hide-details
                class="pt-2 align-center mx-2"
                @change="filter"
              >
              </v-range-slider>
              <div class="range-input align-self-end">
                <v-text-field
                  label="対潜改修上限"
                  type="number"
                  max="9"
                  :min="aswRange[0]"
                  dense
                  v-model.trim="aswRange[1]"
                  hide-details
                ></v-text-field>
              </div>
            </div>
          </div>
          <v-select
            class="my-10"
            v-model="selectedTypes"
            :items="types"
            hide-details
            dense
            attach
            chips
            deletable-chips
            label="艦種"
            multiple
            @change="masterFilter"
          >
            <template v-slot:prepend-item>
              <v-list-item ripple @mousedown.prevent @click="toggleAllType">
                <v-list-item-action>
                  <v-icon :color="selectedTypes.length > 0 ? 'blue' : ''">
                    {{ icon }}
                  </v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>全選択</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider class="mt-2"></v-divider>
            </template>
          </v-select>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-card class="ship-list-body my-3 pa-4">
      <div v-if="!viewShips.length" class="body-2 text-center mt-10">該当艦娘なし</div>
      <v-pagination v-else v-model="page" :length="pageLength" class="mb-4"></v-pagination>
      <div v-if="viewShips.length" class="ship-tr header">
        <v-spacer></v-spacer>
        <div class="status-td">Lv</div>
        <div class="status-td">耐久</div>
        <div class="status-td">運</div>
        <div class="status-td">対潜</div>
        <div class="status-td">索敵</div>
        <div class="status-td">命中項</div>
        <div class="status-td">回避項</div>
        <div class="status-td">CI項</div>
      </div>
      <div
        v-for="(rowData, i) in shipList"
        :key="`row_${i}`"
        class="ship-tr"
        :class="{
          no_ship: rowData.count === 0,
          lv175: rowData.stockData.level === 175,
          lv100: rowData.stockData.level !== 175 && rowData.stockData.level > 99,
          lv99: rowData.stockData.level === 99,
        }"
      >
        <div>
          <v-img :src="`./img/ship/${rowData.ship.albumId}.png`" height="50" width="200"></v-img>
        </div>
        <div class="ml-1">{{ rowData.ship.name }}</div>
        <v-spacer></v-spacer>
        <div class="status-td">{{ rowData.stockData.level }}</div>
        <div class="status-td">{{ rowData.hp }}</div>
        <div class="status-td">{{ rowData.luck }}</div>
        <div class="status-td">{{ rowData.asw }}</div>
        <div class="status-td">{{ rowData.scout }}</div>
        <div class="status-td">{{ rowData.acurracy }}</div>
        <div class="status-td">{{ rowData.avoid }}</div>
        <div class="status-td">{{ rowData.ci }}</div>
      </div>
      <v-pagination v-if="viewShips.length" v-model="page" :length="pageLength" class="my-4" @input="scrollTop"></v-pagination>
    </v-card>
  </div>
</template>

<style scoped>
.search-input {
  width: 130px;
}
.range-input {
  width: 80px;
}

.range-inputs {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 800px) {
  .range-inputs {
    grid-template-columns: 1fr 1fr;
    column-gap: 1rem;
  }
}

.ship-list-body {
  min-height: 300px;
}
.ship-tr {
  display: flex;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.ship-tr > div {
  align-self: center;
}
.ship-tr .status-td {
  text-align: right;
  width: 9%;
}

.ship-tr.header {
  position: -webkit-sticky;
  position: sticky;
  top: 74px;
  padding: 0;
  background-color: #eee;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}
.ship-tr.header .status-td {
  opacity: 0.8;
  font-size: 0.8em;
  padding: 0.5rem 0;
}

.ship-tr.lv175 {
  background-color: rgba(131, 220, 255, 0.3);
}
.ship-tr.lv100 {
  background-color: rgba(255, 131, 131, 0.3);
}
.ship-tr.lv99 {
  background-color: rgba(131, 255, 131, 0.3);
}
.ship-tr:not(.header):hover {
  background-color: rgba(128, 128, 128, 0.05);
}
.ship-tr.lv175:hover {
  background-color: rgba(131, 220, 255, 0.5);
}
.ship-tr.lv100:hover {
  background-color: rgba(255, 131, 131, 0.5);
}
.ship-tr.lv99:hover {
  background-color: rgba(131, 255, 131, 0.5);
}
.theme--dark .ship-tr.lv175 {
  background-color: rgba(131, 220, 255, 0.2);
}
.theme--dark .ship-tr.lv100 {
  background-color: rgba(255, 131, 131, 0.2);
}
.theme--dark .ship-tr.lv99 {
  background-color: rgba(131, 255, 131, 0.2);
}
.theme--dark .ship-tr.lv175:hover {
  background-color: rgba(131, 220, 255, 0.25);
}
.theme--dark .ship-tr.lv100:hover {
  background-color: rgba(255, 131, 131, 0.25);
}
.theme--dark .ship-tr.lv99:hover {
  background-color: rgba(131, 255, 131, 0.25);
}
.ship-tr.no_ship {
  opacity: 0.7;
  background-color: rgba(43, 43, 43, 0.2);
}
.ship-tr.no_ship:hover {
  opacity: 0.7;
  background-color: rgba(43, 43, 43, 0.25);
}
.theme--dark .ship-tr.no_ship {
  background-color: rgba(0, 0, 0, 1);
}
.theme--dark .ship-tr.no_ship:hover {
  background-color: rgb(15, 15, 15);
}
.ship-tr.no_ship img {
  filter: grayscale(60%);
}
</style>

<script lang="ts">
import Vue from 'vue';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipStock from '@/classes/fleet/shipStock';
import Ship from '@/classes/fleet/ship';

interface ShipRowData {
  count: number;
  ship: ShipMaster;
  stockData: ShipStock;
  hp: number;
  luck: number;
  asw: number;
  scout: number;
  acurracy: number;
  avoid: number;
  ci: number;
}

export default Vue.extend({
  name: 'Ships',
  data: () => ({
    all: [] as ShipMaster[],
    filteredShips: [] as ShipMaster[],
    viewShips: [] as ShipRowData[],
    shipStock: [] as ShipStock[],
    page: 1,
    searchWord: '',
    onlyStock: false,
    onlyNoStock: false,
    is4n: false,
    isDiahatsu: false,
    isKamisha: false,
    luckRange: [1, 200],
    levelRange: [1, 175],
    aswRange: [0, 9],
    okDaihatsu: [] as number[],
    okKamisha: [] as number[],
    hpItems: [] as { text: string; value: number }[],
    addHP: [] as number[],
    aswItems: [] as { text: string; value: number }[],
    addASW: [] as { text: string; value: number }[],
    types: [] as { text: string; value: number }[],
    selectedTypes: [] as number[],
  }),
  mounted() {
    // 全データ取得
    this.all = this.$store.state.ships as ShipMaster[];
    this.shipStock = this.$store.state.shipStock as ShipStock[];

    for (let i = 0; i < this.all.length; i += 1) {
      const { id, type } = this.all[i];
      const itemLink = Const.SHIP_ITEM_LINK.find((v) => v.id === id);
      const baseItemLink = Const.SHIP_TYPES_INFO.find((v) => v.id === type);
      // 大発チェック
      if (itemLink && itemLink.itemType.includes(24)) {
        this.okDaihatsu.push(id);
      } else if (baseItemLink && baseItemLink.itemType.includes(24)) {
        this.okDaihatsu.push(id);
      }

      // カミ車チェック
      if (itemLink && itemLink.itemType.includes(46)) {
        this.okKamisha.push(id);
      } else if (baseItemLink && baseItemLink.itemType.includes(46)) {
        this.okKamisha.push(id);
      }
    }

    // 艦種セレクト初期化
    const masters = Const.SHIP_TYPES_ALT;
    for (let i = 0; i < masters.length; i += 1) {
      this.types.push({ text: masters[i].text, value: i });
      this.selectedTypes.push(i);
    }

    // 耐久改修セレクト初期化
    for (let i = 0; i <= 2; i += 1) {
      this.hpItems.push({ text: `+${i}`, value: i });
      this.addHP.push(i);
    }

    this.masterFilter();
  },
  computed: {
    selectedAllType(): boolean {
      return this.selectedTypes.length === this.types.length;
    },
    selectedSomeType(): boolean {
      return this.selectedTypes.length > 0 && !this.selectedAllType;
    },
    icon(): string {
      if (this.selectedAllType) return 'mdi-close-box';
      if (this.selectedSomeType) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
    shipList(): ShipRowData[] {
      const start = (this.page - 1) * 100;
      return this.viewShips.slice(start, start + 100);
    },
    pageLength(): number {
      return Math.ceil(this.viewShips.length / 100);
    },
  },
  methods: {
    filter() {
      const masters = this.filteredShips;
      const stock = this.shipStock;
      this.viewShips = [];
      let rowData: ShipRowData[] = [];
      const maxLevel = this.levelRange[1];
      const minLevel = this.levelRange[0];
      const maxLuck = this.luckRange[1];
      const minLuck = this.luckRange[0];
      const maxAsw = this.aswRange[1];
      const minAsw = this.aswRange[0];
      const buffHP = this.addHP;

      // ベースのループは未改造艦娘のみ
      const baseShips = masters.filter((v) => v.version === 0);

      for (let i = 0; i < baseShips.length; i += 1) {
        const base = baseShips[i];
        // 改造先を含めて全て取得
        const versions = masters.filter((v) => v.originalId === base.albumId);

        // 在籍艦娘のなかから versions に含まれる艦娘を抽出
        const versionsIds = versions.map((v) => v.id);
        const stockList = stock.filter((v) => versionsIds.includes(v.id));

        const pushedData = [];

        // 改造先含めて1隻でもいいからいるかどうか
        if (!stockList.length) {
          if (this.onlyStock) {
            // 未着任艦非表示なら処理を飛ばす
            continue;
          }
          // 未着任データ
          pushedData.push({
            count: 0,
            ship: base,
            stockData: new ShipStock(),
            hp: base.hp,
            luck: base.luck,
            asw: 0,
            scout: 0,
            acurracy: 0,
            avoid: 0,
            ci: 0,
          });
        } else if (!this.onlyNoStock) {
          // いるだけ回す
          for (let j = 0; j < stockList.length; j += 1) {
            const stockData = stockList[j];

            // 練度で絞る
            if (stockData.level < minLevel || stockData.level > maxLevel) {
              continue;
            }
            // 対潜改修で絞る
            if (stockData.improvement.asw < minAsw || stockData.improvement.asw > maxAsw) {
              continue;
            }
            // 耐久改修で絞る
            if (!buffHP.includes(stockData.improvement.hp)) {
              continue;
            }

            // 着任済みデータ
            const master = versions.find((v) => v.id === stockData.id) as ShipMaster;
            const luck = stockData.improvement.luck + master.luck;

            // 運で絞る
            if (luck < minLuck || luck > maxLuck) {
              continue;
            }

            const avoid = Ship.getStatusFromLevel(stockData.level, master.maxAvoid, master.minAvoid);
            pushedData.push({
              count: 1,
              ship: master,
              stockData,
              hp: stockData.improvement.hp + (stockData.level > 99 ? master.hp2 : master.hp),
              luck,
              asw: Ship.getStatusFromLevel(stockData.level, master.maxAsw, master.minAsw),
              scout: Ship.getStatusFromLevel(stockData.level, master.maxScout, master.minScout),
              acurracy: Ship.getAccuracyValue(stockData.level, luck),
              avoid: Ship.getAvoidValue(avoid, luck),
              ci: Ship.getCIValue(stockData.level, luck),
            });
          }

          // 改造順ソート
          pushedData.sort((a, b) => {
            if (a.ship.version === b.ship.version) {
              return b.stockData.level - a.stockData.level;
            }
            return a.ship.version - b.ship.version;
          });
        }

        rowData = rowData.concat(pushedData);
      }

      // ページ数チェック
      const maxPage = Math.ceil(rowData.length / 100);
      this.page = this.page > maxPage ? maxPage : this.page;
      this.page = this.page < 1 && maxPage > 0 ? 1 : this.page;

      this.viewShips = rowData;
    },
    masterFilter() {
      // マスターの条件でフィルタリング可能なものはここでフィルタリング
      const keyword = this.searchWord ? this.searchWord.trim() : '';
      const typeIndexs = this.selectedTypes;
      const types = Const.SHIP_TYPES_ALT.filter((v, i) => typeIndexs.includes(i))
        .map((v) => v.types)
        .flat();

      this.filteredShips = this.all.filter((v) => {
        // 艦種別で絞る
        if (!types.includes(v.type)) return false;
        // キーワードで絞る
        if (keyword && keyword !== v.id.toString() && v.name.indexOf(keyword) < 0) return false;
        // 大発OKで絞る
        if (this.isDiahatsu && !this.okDaihatsu.includes(v.id)) return false;
        // カミ車OKで絞る
        if (this.isKamisha && !this.okKamisha.includes(v.id)) return false;

        return true;
      });

      this.filter();
    },
    toggleAllType() {
      this.$nextTick(() => {
        if (this.selectedAllType) {
          this.selectedTypes = [];
        } else {
          this.selectedTypes = this.types.map((v) => v.value).slice();
        }

        this.masterFilter();
      });
    },
    scrollTop() {
      const page = document.getElementsByClassName('v-pagination')[0] as HTMLUListElement;
      window.scrollTo(0, page.getBoundingClientRect().y + window.pageYOffset - 80);
    },
  },
});
</script>
