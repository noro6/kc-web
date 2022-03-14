<template>
  <v-card>
    <div class="d-flex pt-2 pb-1 pr-2">
      <div class="align-self-center ml-3">艦娘選択</div>
      <v-spacer></v-spacer>
      <div class="d-none d-sm-block mr-5">
        <v-btn-toggle dense v-model="multiLine" borderless mandatory>
          <v-btn :value="false" :class="{ 'blue darken-2 white--text': !multiLine }" @click.stop="changeMultiLine(false)">
            <v-icon>mdi-view-headline</v-icon>
            <span>一列</span>
          </v-btn>
          <v-btn :value="true" :class="{ 'blue darken-2 white--text': multiLine }" @click.stop="changeMultiLine(true)">
            <v-icon>mdi-view-comfy</v-icon>
            <span>複数列</span>
          </v-btn>
        </v-btn-toggle>
      </div>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="d-flex px-2 pt-2">
      <div class="align-self-center ship-search-text">
        <v-text-field
          label="id 名称検索"
          v-model.trim="keyword"
          @input="filter()"
          clearable
          prepend-inner-icon="mdi-magnify"
        ></v-text-field>
      </div>
      <div class="ml-5 align-self-center">
        <v-checkbox v-model="isFinal" @change="filter()" label="最終改造"></v-checkbox>
      </div>
      <div class="ml-5 align-self-center" v-if="shipStock.length">
        <v-checkbox v-model="isStockOnly" @click="clickedStockOnly" :label="'在籍艦娘反映'"></v-checkbox>
      </div>
      <v-spacer></v-spacer>
    </div>
    <div class="d-flex flex-wrap" :class="{ 'ml-3': multiLine, 'ml-1': !multiLine }">
      <div
        v-for="(i, index) in types"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: index === type, disabled: keyword }"
        @click="changeType(index)"
      >
        {{ i.text }}
      </div>
    </div>
    <v-divider :class="{ 'mx-3': multiLine }"></v-divider>
    <div class="ship-table-body pb-2" :class="{ 'mx-3': multiLine }">
      <div v-if="!multiLine && ships.length" class="ship-status-header pr-3">
        <div class="ship-status" v-for="i in 5" :key="`slot${i}`">搭載{{ i }}</div>
      </div>
      <div v-for="(typeData, i) in ships" :key="i" class="pl-3">
        <div class="type-divider">
          <div class="caption">{{ typeData.typeName }}</div>
          <div class="type-divider-border"></div>
        </div>
        <div :class="{ multi: multiLine }">
          <div
            v-for="(data, i) in typeData.ships"
            :key="i"
            class="ship-list"
            :class="{ 'pr-3': !multiLine, 'no-stock': !data.count }"
            v-ripple="{ class: data.count ? 'info--text' : 'red--text' }"
            @click="clickedShip(data)"
          >
            <div>
              <v-img :src="`./img/ship/${data.ship.id}.png`" height="30" width="120"></v-img>
            </div>
            <div class="flex-grow-1 ml-1">
              <div class="d-flex ship-caption">
                <div v-if="isStockOnly" class="primary--text ship-level">Lv:{{ data.level }}</div>
                <div v-if="isStockOnly">運:{{ data.luck }}</div>
                <div v-else class="primary--text">id:{{ data.ship.albumId }}</div>
              </div>
              <div class="d-flex">
                <div class="ship-name text-truncate">{{ data.ship.name }}</div>
              </div>
            </div>
            <div class="ship-count red--text caption" v-if="isStockOnly">
              <span>&times;</span>
              <span>{{ data.count }}</span>
            </div>
            <template v-if="!multiLine">
              <div class="ship-status" v-for="i in 5" :key="`ship_slot${i - 1}`">
                {{ data.ship.slots[i - 1] ? data.ship.slots[i - 1] : "" }}
              </div>
            </template>
          </div>
        </div>
      </div>
      <div v-show="ships.length === 0" class="caption text-center mt-10">艦娘が見つかりませんでした。</div>
    </div>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3" v-if="confirmShip.ship">
        <div class="ma-4">
          <div>{{ confirmShip.ship.name }}は既に配備されています。</div>
          <div class="caption mt-2">※ 配備 を押せば無視して配備できます。</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="info" dark @click.stop="clickedShip(confirmShip)">配備</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">戻る</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.ship-table-body {
  overflow-y: auto;
  height: 64vh;
}
.ship-search-text {
  width: 168px;
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.5rem 0.6rem;
  font-size: 0.9em;
  cursor: pointer;
}
.type-selector:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.type-selector.active {
  border-color: rgba(33, 150, 243, 0.4);
  background-color: rgba(33, 150, 243, 0.1);
}
.type-selector.disabled {
  opacity: 0.4;
  background-color: transparent;
  pointer-events: none;
}

.type-divider {
  margin-top: 1rem;
  display: flex;
  width: 100%;
}
.type-divider-border {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.multi {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 600px) {
  .multi {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 880px) {
  .multi {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1100px) {
  .multi {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.ship-list {
  display: flex;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: 0.1s;
  border-radius: 0.2rem;
}
.ship-list:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.ship-list.no-stock:hover {
  background-color: rgba(255, 128, 128, 0.1);
}
.ship-list > div {
  align-self: center;
}
.ship-caption {
  font-size: 11px;
  margin-left: 0.1rem;
}
.ship-level {
  width: 38px;
}
.ship-name {
  flex-grow: 1;
  font-size: 0.8em;
  width: 10px;
  margin-left: 0.1rem;
  overflow: hidden;
  white-space: nowrap;
}
.no-stock .ship-name {
  color: rgb(255, 100, 100);
}
.ship-count {
  align-self: flex-end !important;
  margin-left: 1px;
  width: 22px;
}

.is-special {
  color: #388e3c;
}
.theme--dark .is-special {
  color: #66bb6a;
}

.ship-status-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  background-color: #f8f8f8;
  position: sticky;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5rem 0;
  z-index: 1;
  top: 0;
}
.theme--dark .ship-status-header {
  background-color: #333;
}
.ship-status {
  align-self: center;
  text-align: right;
  width: 9%;
  font-size: 0.8em;
}
.ship-status-header .ship-status {
  font-size: 11px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipMaster from '@/classes/fleet/shipMaster';
import Const from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';
import ShipStock from '@/classes/fleet/shipStock';
import SaveData from '@/classes/saveData/saveData';
import Ship from '@/classes/fleet/ship';

export interface ViewShip {
  ship: ShipMaster;
  count: number;
  area: number;
  level: number;
  luck: number;
  expanded: boolean;
}

export default Vue.extend({
  name: 'ShipList',
  props: {
    handleDecideShip: {
      type: Function,
      required: true,
    },
    handleChangeWidth: {
      type: Function,
      required: true,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    all: [] as ShipMaster[],
    ships: [] as { typeName: string; ships: ViewShip[] }[],
    types: [] as { text: string; types: number[] }[],
    type: 0,
    isFinal: true,
    keyword: '',
    multiLine: true,
    isStockOnly: false,
    shipStock: [] as ShipStock[],
    usedShips: [] as Ship[],
    confirmDialog: false,
    confirmShip: {} as ViewShip,
    setting: new SiteSetting(),
  }),
  mounted() {
    const existTypes: number[] = [];
    const ships = this.$store.state.ships as ShipMaster[];
    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];
      this.all.push(ship);
      if (!existTypes.includes(ship.type)) {
        existTypes.push(ship.type);
      }
    }
    for (let i = 0; i < Const.SHIP_TYPES_ALT.length; i += 1) {
      const data = Const.SHIP_TYPES_ALT[i];
      if (data.types.some((v) => existTypes.includes(v))) {
        this.types.push({ text: data.text, types: data.types });
      }
    }
    this.filter();
  },
  methods: {
    changeType(index = 0) {
      this.type = index;
      this.filter();
    },
    clickedStockOnly() {
      this.setting.isStockOnlyForShipList = this.isStockOnly;
      this.$store.dispatch('updateSetting', this.setting);
      this.filter();
    },
    initialize() {
      // 現行の在籍艦娘情報を更新
      this.shipStock = this.$store.state.shipStock as ShipStock[];

      this.setting = this.$store.state.siteSetting as SiteSetting;
      this.isStockOnly = this.setting.isStockOnlyForShipList;

      // 現在の計算画面内で配備されている艦娘を列挙する
      this.usedShips = [];
      const mainData = this.$store.state.mainSaveData as SaveData;
      const manager = mainData.tempData[mainData.tempIndex];
      if (manager) {
        let allShips: Ship[] = [];
        for (let i = 0; i < manager.fleetInfo.fleets.length; i += 1) {
          if (i === 4) {
            // 友軍は除外
            continue;
          }
          const fleet = manager.fleetInfo.fleets[i];
          allShips = allShips.concat(fleet.ships.filter((v) => v.data.id > 0));
        }

        this.usedShips = allShips;
      }

      this.changeMultiLine(this.setting.isMultiLineForShipList);
      this.filter();
    },
    filter() {
      const word = this.keyword;
      let result = this.all.concat();
      const t = this.types[this.type];

      // 検索語句あればこれ以外の検索はしない
      if (word) {
        result = result.filter((v) => v.albumId === +word || v.name.indexOf(word) >= 0);
      } else {
        if (this.isFinal) {
          // 最終改造状態ONLY
          result = result.filter((v) => v.isFinal);
        }
        // カテゴリ検索
        result = result.filter((v) => t.types.includes(v.type));
      }

      let usedShips = this.usedShips.concat();
      let viewShips: ViewShip[] = [];
      if (this.isStockOnly && this.shipStock.length) {
        // 在籍艦娘考慮
        const stock = this.shipStock;
        for (let i = 0; i < result.length; i += 1) {
          const master = result[i];
          const stockData = stock.filter((v) => v.id === master.id);
          if (!stockData.length) {
            // 未所持 出さない
            continue;
          }

          const ships: ViewShip[] = [];
          for (let j = 0; j < stockData.length; j += 1) {
            const shipData = stockData[j];
            const viewShip = {
              ship: master,
              count: 1,
              level: shipData.level,
              luck: shipData.improvement.luck + master.luck,
              area: shipData.area,
              expanded: shipData.releaseExpand,
            };

            // id 練度 運 を見て配備済みかどうか判定
            const usedIndex = usedShips.findIndex((v) => v.data.id === master.id && v.level === viewShip.level && v.luck === viewShip.luck);
            if (usedIndex >= 0) {
              // 減らす
              viewShip.count = 0;
              usedShips = usedShips.filter((v, index) => index !== usedIndex);
            }

            // まとめられそうな艦娘がいないか？
            const serach = ships.find(
              (v) => v.ship.id === viewShip.ship.id
                && v.level === viewShip.level
                && v.luck === viewShip.luck
                && v.area === viewShip.area
                && v.expanded === viewShip.expanded,
            );
            if (serach) {
              // いたらcountだけインクリメント
              serach.count += viewShip.count;
            } else {
              // いなければ追加
              ships.push(viewShip);
            }
          }

          if (ships.length) {
            viewShips = viewShips.concat(ships);
          }
        }
      } else {
        // 所持装備考慮なし 愚直に追加
        for (let i = 0; i < result.length; i += 1) {
          const master = result[i];
          viewShips.push({
            ship: master,
            count: 1,
            level: 99,
            luck: master.luck,
            area: -1,
            expanded: false,
          });
        }
      }

      // 艦型に応じて分けたい
      const altTypes = Const.SHIP_TYPES_ALT_INFO;
      const resultShips = [];
      for (let i = 0; i < altTypes.length; i += 1) {
        const type = altTypes[i];
        const ships = viewShips.filter((v) => v.ship.type2 === type.id);
        if (ships.length) {
          // 存在する艦型を生成
          resultShips.push({ typeName: type.name, ships });
        }
      }

      this.ships = resultShips;
    },
    clickedShip(ship: ViewShip) {
      if (ship.count || this.confirmDialog) {
        this.confirmDialog = false;
        this.handleDecideShip(ship);
      } else {
        this.confirmShip = ship;
        this.confirmDialog = true;
      }
    },
    close() {
      this.handleClose();
    },
    changeMultiLine(isMulti: boolean) {
      this.handleChangeWidth(isMulti ? 1200 : 660);
      this.multiLine = isMulti;
      // 設定書き換え
      this.setting.isMultiLineForShipList = isMulti;
      this.$store.dispatch('updateSetting', this.setting);
    },
  },
});
</script>
