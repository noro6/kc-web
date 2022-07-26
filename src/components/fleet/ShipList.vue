<template>
  <v-card>
    <div class="d-flex py-2 pr-2">
      <div class="align-self-center ship-search-text ml-5">
        <v-text-field
          dense
          hide-details
          :placeholder="$t('ItemList.図鑑id 名称検索')"
          v-model.trim="keyword"
          @input="filter()"
          clearable
          prepend-inner-icon="mdi-magnify"
        ></v-text-field>
      </div>
      <v-spacer></v-spacer>
      <div class="d-none d-sm-block mr-5">
        <v-btn-toggle dense v-model="multiLine" borderless mandatory>
          <v-btn :value="false" :class="{ blue: !multiLine, secondary: multiLine }" @click.stop="changeMultiLine(false)">
            <v-icon color="white">mdi-view-headline</v-icon>
            <span class="white--text">{{ $t('ItemList.一列') }}</span>
          </v-btn>
          <v-btn :value="true" :class="{ blue: multiLine, secondary: !multiLine }" @click.stop="changeMultiLine(true)">
            <v-icon color="white">mdi-view-comfy</v-icon>
            <span class="white--text">{{ $t('ItemList.複数列') }}</span>
          </v-btn>
        </v-btn-toggle>
      </div>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="d-flex pl-4 pt-1 pb-2 flex-wrap">
      <div class="mr-3 align-self-center">
        <v-checkbox v-model="isFinalOnly" :disabled="!!keyword" @change="filter()" dense hide-details :label="$t('Fleet.最終改造')"></v-checkbox>
      </div>
      <div class="mr-3 align-self-center">
        <v-checkbox v-model="daihatsuOK" :disabled="!!keyword" @click="filter()" dense hide-details :label="$t('Fleet.大発搭載可')"></v-checkbox>
      </div>
      <div class="mr-3 align-self-center">
        <v-checkbox v-model="naikateiOK" :disabled="!!keyword" @click="filter()" dense hide-details :label="$t('Fleet.内火艇搭載可')"></v-checkbox>
      </div>
      <div class="mr-3 align-self-center">
        <v-checkbox v-model="fighterOK" :disabled="!!keyword" @click="filter()" dense hide-details :label="$t('Fleet.戦闘機搭載可')"></v-checkbox>
      </div>
      <div class="mr-3 align-self-center" v-if="isStockOnly">
        <v-checkbox v-model="hasAreaOnly" @click="filter()" dense hide-details :label="$t('Fleet.札あり')"></v-checkbox>
      </div>
      <div class="mr-3 align-self-center" v-if="isStockOnly">
        <v-checkbox v-model="isReleaseExSlotOnly" @click="filter()" dense hide-details :label="$t('Fleet.補強増設あり')"></v-checkbox>
      </div>
      <div class="mr-3 align-self-center" v-if="shipStock.length">
        <v-checkbox
          v-model="isStockOnly"
          @click="clickedStockOnly()"
          dense
          hide-details
          :label="$t('Fleet.在籍艦娘反映')"
          :disabled="disabledStockOnlyChange"
        ></v-checkbox>
      </div>
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
        {{ needTrans ? $t(`SType.${i.text}`) : i.text }}
      </div>
    </div>
    <v-divider :class="{ 'ml-3': multiLine }"></v-divider>
    <div class="ship-table-body pb-2" :class="{ 'ml-3': multiLine }">
      <div v-if="!multiLine && ships.length" class="ship-status-header pr-3">
        <div class="ship-status" v-for="i in 5" :key="`slot${i}`">{{ $t('Fleet.搭載') }}{{ i }}</div>
      </div>
      <div v-for="(typeData, i) in ships" :key="i" class="pl-3">
        <div class="type-divider">
          <div class="caption text--secondary">{{ typeData.typeName }}</div>
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
            @mouseenter="bootTooltip(data, $event)"
            @mouseleave="clearTooltip"
          >
            <div class="ship-img">
              <div>
                <v-img :src="`./img/ship/${data.ship.id}.png`" height="30" width="120" />
              </div>
              <div class="area-banner" v-if="data.area > 0 && data.area <= maxAreas">
                <v-img :src="`https://res.cloudinary.com/aircalc/kc-web/area/area${data.area}.png`" height="40" width="27" />
              </div>
              <div class="slot-ex-img" v-if="data.expanded">
                <v-img :src="`./img/util/slot_ex.png`" height="25" width="25"></v-img>
              </div>
            </div>
            <div class="flex-grow-1 ml-1">
              <div class="d-flex ship-caption">
                <div v-if="isStockOnly" class="primary--text ship-level">Lv:{{ data.level }}</div>
                <div v-if="isStockOnly">運:{{ data.luck }}</div>
                <div v-else class="primary--text">id:{{ data.ship.albumId }}</div>
              </div>
              <div class="d-flex">
                <div class="ship-name text-truncate">{{ getShipName(data.ship) }}</div>
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
      <div v-show="ships.length === 0" class="body-2 text-center mt-10">{{ $t('Common.探したけど見つからなかったよ') }}&#128546;</div>
    </div>
    <v-tooltip
      v-model="enabledTooltip"
      color="black"
      bottom
      right
      transition="slide-y-transition"
      :position-x="tooltipX"
      :position-y="tooltipY"
    >
      <ship-tooltip v-model="tooltipShip" />
    </v-tooltip>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3" v-if="confirmShip.ship">
        <div class="ma-4">
          <div>{{ $t("Common.既に配備されています。") }}</div>
          <div class="caption mt-2">※ {{ $t("Common.配備を押せば無視して配備できます。") }}</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="info" dark @click.stop="clickedShip(confirmShip)">{{ $t("Common.配備") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
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
  width: 200px;
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
  padding: 0.15rem 0.3rem;
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

.ship-img {
  position: relative;
}
.area-banner {
  position: absolute;
  top: -4px;
  left: 22px;
}
.slot-ex-img {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 25px;
  height: 25px;
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

.ship-status-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  /** 追従するためrgba使用できない */
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
  /** 追従するためrgba使用できない */
  background-color: rgb(62, 62, 66);
}
.deep-sea .theme--dark .ship-status-header {
  /** 追従するためrgba使用できない */
  background-color: rgb(52, 56, 72);
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
import ShipTooltip from '@/components/fleet/ShipTooltip.vue';
import ShipMaster from '@/classes/fleet/shipMaster';
import Const from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';
import ShipStock from '@/classes/fleet/shipStock';
import SaveData from '@/classes/saveData/saveData';
import Ship from '@/classes/fleet/ship';
import ItemMaster from '@/classes/item/itemMaster';
import ShipValidation from '@/classes/fleet/shipValidation';

export interface ViewShip {
  ship: ShipMaster;
  count: number;
  area: number;
  level: number;
  /** 耐久 表示値 */
  hp: number;
  /** 運 表示値 */
  luck: number;
  /** 対潜 改修値!! */
  asw: number;
  expanded: boolean;
}

export default Vue.extend({
  name: 'ShipList',
  components: { ShipTooltip },
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
    isFinalOnly: true,
    keyword: '',
    multiLine: true,
    isStockOnly: false,
    shipStock: [] as ShipStock[],
    usedShips: [] as Ship[],
    confirmDialog: false,
    confirmShip: {} as ViewShip,
    setting: new SiteSetting(),
    daihatsuOK: false,
    naikateiOK: false,
    fighterOK: false,
    hasAreaOnly: false,
    isReleaseExSlotOnly: false,
    maxAreas: 0,
    disabledStockOnlyChange: false,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipShip: new Ship(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  mounted() {
    this.maxAreas = this.$store.state.areaCount as number;
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
  },
  computed: {
    needTrans() {
      return this.$i18n.locale !== 'ja';
    },
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
    initialize(enabledUserShip = true) {
      // 現行の在籍艦娘情報を更新
      this.shipStock = this.$store.state.shipStock as ShipStock[];
      this.setting = this.$store.state.siteSetting as SiteSetting;
      this.isStockOnly = this.setting.isStockOnlyForShipList || this.disabledStockOnlyChange;

      // 設置値復元
      this.isFinalOnly = this.setting.savedShipListFilter.isFinalOnly;

      // 一時所持情報データがあるなら
      if (this.$store.getters.getExistsTempStock) {
        this.shipStock = this.$store.state.tempShipStock as ShipStock[];
        this.isStockOnly = !!this.shipStock.length;
      }

      // 現在の計算画面内で配備されている艦娘を列挙する
      this.usedShips = [];
      const mainData = this.$store.state.mainSaveData as SaveData;
      const manager = mainData.tempData[mainData.tempIndex];
      if (enabledUserShip && manager) {
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
      const word = this.keyword.toUpperCase();
      let result = this.all.concat();
      const t = this.types[this.type];

      this.setting.savedShipListFilter.isFinalOnly = this.isFinalOnly;
      this.$store.dispatch('updateSetting', this.setting);

      // 検索語句あればこれ以外の検索はしない
      if (word) {
        result = result.filter((v) => v.albumId === +word || v.name.toUpperCase().indexOf(word) >= 0);
      } else {
        // カテゴリ検索
        result = result.filter((v) => t.types.includes(v.type));
        const isValid = ShipValidation.isValidItem;
        if (this.isFinalOnly) {
          // 最終改造状態ONLY
          result = result.filter((v) => v.isFinal);
        }
        if (this.daihatsuOK) {
          // 大発搭載可能
          const daihatsu = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 68);
          if (daihatsu) {
            result = result.filter((v) => isValid(v, daihatsu));
          }
        }
        if (this.naikateiOK) {
          // 内火艇搭載可能
          const naikatei = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 167);
          if (naikatei) {
            result = result.filter((v) => isValid(v, naikatei));
          }
        }
        if (this.fighterOK) {
          // 戦闘機搭載可
          const fighter = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 19);
          const fighter2 = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 165);
          if (fighter && fighter2) {
            result = result.filter((v) => isValid(v, fighter) || isValid(v, fighter2));
          }
        }
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
            const viewShip: ViewShip = {
              ship: master,
              count: 1,
              level: shipData.level,
              hp: shipData.improvement.hp + (shipData.level > 99 ? master.hp2 : master.hp),
              luck: shipData.improvement.luck + master.luck,
              asw: shipData.improvement.asw,
              area: shipData.area <= this.maxAreas ? Math.max(shipData.area, 0) : 0,
              expanded: shipData.releaseExpand,
            };

            // 補強増設開放済み検索
            if (this.isReleaseExSlotOnly && !viewShip.expanded) {
              continue;
            }
            // 札あり限定検索
            if (this.hasAreaOnly && viewShip.area <= 0) {
              continue;
            }

            // id 練度 運 対潜 耐久 海域を見て配備済みかどうか判定
            const usedIndex = usedShips.findIndex(
              (v) => v.data.id === master.id
                && v.level === viewShip.level
                && v.hp === viewShip.hp
                && v.luck === viewShip.luck
                && v.area === viewShip.area
                && v.improveAsw === viewShip.asw,
            );
            if (usedIndex >= 0) {
              // 配備済みなら減らす
              viewShip.count = 0;
              usedShips = usedShips.filter((v, index) => index !== usedIndex);
            }

            // まとめられそうな艦娘がいないか？(id 練度 運 対潜 耐久 海域 増設 が一致)
            const search = ships.find(
              (v) => v.ship.id === viewShip.ship.id
                && v.level === viewShip.level
                && v.luck === viewShip.luck
                && v.area === viewShip.area
                && v.hp === viewShip.hp
                && v.asw === viewShip.asw
                && v.expanded === viewShip.expanded,
            );
            if (search) {
              // いたらcountだけインクリメント
              search.count += viewShip.count;
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
            hp: master.hp,
            luck: master.luck,
            area: -1,
            asw: 0,
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
          // 母港ソート
          ships.sort((a, b) => a.ship.sort - b.ship.sort);
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
    bootTooltip(viewShip: ViewShip, e: MouseEvent) {
      this.tooltipTimer = window.setTimeout(() => {
        this.tooltipX = e.clientX;
        this.tooltipY = e.clientY;

        const baseAsw = Ship.getStatusFromLevel(viewShip.level, viewShip.ship.maxAsw, viewShip.ship.minAsw);
        const ship = new Ship({
          master: viewShip.ship,
          hp: viewShip.hp,
          level: viewShip.level,
          luck: viewShip.luck,
          asw: baseAsw + viewShip.asw,
        });
        this.tooltipShip = ship;
        this.enabledTooltip = true;
      }, 400);
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
    getShipName(ship: ShipMaster) {
      if (this.needTrans) {
        const shipName = ShipMaster.getSuffix(ship);
        return `${this.$t(`${shipName[0]}`)}${shipName[1] ? this.$t(`${shipName[1]}`) : ''}`;
      }
      return ship.name || '';
    },
  },
});
</script>
