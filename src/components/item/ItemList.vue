<template>
  <v-card>
    <div class="d-flex py-2 pr-2">
      <div class="align-self-center item-search-text ml-5">
        <v-text-field
          placeholder="図鑑id 名称検索"
          clearable
          v-model="keyword"
          @input="filter()"
          hide-details
          dense
          prepend-inner-icon="mdi-magnify"
        ></v-text-field>
      </div>
      <div class="ml-5 align-self-center filter-select">
        <v-select dense v-model="filterStatus" hide-details :items="filterStatusItems" @change="changedFilter()"></v-select>
      </div>
      <div class="align-self-center filter-value-select">
        <v-menu
          offset-y
          :close-on-content-click="false"
          transition="slide-y-transition"
          bottom
          right
          v-model="filterStatusValueMenu"
          @input="changedFilter()"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field v-bind="attrs" v-on="on" dense v-model="filterStatusValue" hide-details readonly></v-text-field>
          </template>
          <v-card class="px-2">
            <div class="d-flex px-2">
              <v-text-field class="filter-value-input" type="number" max="30" min="0" v-model.number="filterStatusValue"></v-text-field>
            </div>
            <v-slider max="30" min="0" v-model="filterStatusValue"></v-slider>
          </v-card>
        </v-menu>
      </div>
      <div class="align-self-end caption">以上</div>
      <v-spacer></v-spacer>
      <div class="d-none d-sm-block mr-5">
        <v-btn-toggle dense v-model="multiLine" borderless mandatory>
          <v-btn :value="false" :class="{ blue: !multiLine, secondary: multiLine }" @click.stop="changeMultiLine(false)">
            <v-icon color="white">mdi-view-headline</v-icon>
            <span class="white--text">一列</span>
          </v-btn>
          <v-btn :value="true" :class="{ blue: multiLine, secondary: !multiLine }" @click.stop="changeMultiLine(true)">
            <v-icon color="white">mdi-view-comfy</v-icon>
            <span class="white--text">複数列</span>
          </v-btn>
        </v-btn-toggle>
      </div>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="d-flex flex-wrap px-3">
      <div class="align-self-center my-3">
        <v-checkbox v-model="isEnemyMode" @change="filter()" hide-details dense label="敵装備"></v-checkbox>
      </div>
      <div class="ml-3 align-self-center my-3" v-if="itemStock.length && !isEnemyMode">
        <v-checkbox v-model="isStockOnly" @click="clickedStockOnly" hide-details dense label="所持装備反映"></v-checkbox>
      </div>
      <v-spacer></v-spacer>
    </div>
    <div class="d-flex flex-wrap" :class="{ 'ml-3': multiLine, 'ml-1': !multiLine }">
      <div
        v-ripple="{ class: 'info--text' }"
        class="type-selector d-flex"
        :class="{ active: type === -1, disabled: keyword }"
        @click="changeType(-1)"
      >
        <div class="type-all-text">ALL</div>
      </div>
      <div
        v-for="i in enabledTypes"
        :key="i.id"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: type === i.id, disabled: keyword }"
        @click="changeType(i.id)"
      >
        <v-img :src="`./img/type/type${i.id}.png`" height="32" width="32"></v-img>
      </div>
    </div>
    <v-divider :class="{ 'mx-3': multiLine }"></v-divider>
    <div id="item-table-body" class="pb-2" :class="{ 'mx-3': multiLine }">
      <div v-if="!multiLine && viewItems.length" class="item-status-header">
        <div
          class="item-status"
          v-for="(data, i) in headerItems"
          :key="`item${i}`"
          @click="toggleSortKey(data.key)"
          :class="{ desc: sortKey === data.key && isDesc, asc: sortKey === data.key && !isDesc }"
          v-show="isShow(data.key, viewStatus)"
        >
          <div><v-icon small>mdi-chevron-down</v-icon>{{ data.text }}</div>
        </div>
        <div
          class="item-status"
          @click="toggleSortKey('airPower')"
          :class="{ desc: sortKey === 'airPower' && isDesc, asc: sortKey === 'airPower' && !isDesc }"
          v-show="isShow('airPower', viewStatus)"
        >
          <div class="d-flex">
            <div class="align-self-center ml-auto">
              <v-icon small>mdi-chevron-down</v-icon>
            </div>
            <div>
              <div class="mr-1">制空</div>
              <div>({{ slot }}機)</div>
            </div>
          </div>
        </div>
        <div
          class="item-status"
          @click="toggleSortKey('defenseAirPower')"
          :class="{ desc: sortKey === 'defenseAirPower' && isDesc, asc: sortKey === 'defenseAirPower' && !isDesc }"
          v-show="isShow('defenseAirPower', viewStatus)"
        >
          <div class="d-flex">
            <div class="align-self-center ml-auto">
              <v-icon small>mdi-chevron-down</v-icon>
            </div>
            <div>
              <div>防空制空</div>
              <div>({{ slot }}機)</div>
            </div>
          </div>
        </div>
      </div>
      <div v-for="(data, i) in itemListData" :key="i">
        <div class="type-divider" v-if="multiLine">
          <div class="caption text--secondary">{{ data.typeName }}</div>
          <div class="type-divider-border"></div>
        </div>
        <div class="type-item-container" :class="{ multi: multiLine }">
          <div
            v-for="(v, i) in data.items"
            :key="i"
            v-ripple="{ class: v.count ? 'info--text' : 'red--text' }"
            class="list-item"
            :class="{ 'px-3': !multiLine, 'no-stock': !v.count }"
            @click="clickedItem(v)"
            @mouseenter="bootTooltip(v.item, $event)"
            @mouseleave="clearTooltip"
          >
            <div>
              <v-img :src="`./img/type/icon${v.item.data.iconTypeId}.png`" height="30" width="30"></v-img>
            </div>
            <div class="item-name text-truncate" :class="{ 'is-special': v.item.data.isSpecial }">
              {{ v.item.data.name }}
            </div>
            <div class="item-remodel caption mr-1" v-if="isStockOnly && v.item.remodel > 0">
              <v-icon small color="teal accent-4">mdi-star</v-icon>
              <span class="teal--text text--accent-4">{{ v.item.remodel }}</span>
            </div>
            <div class="item-count red--text caption" v-if="isStockOnly && !isEnemyMode">
              <span>&times;</span>
              <span>{{ v.count }}</span>
            </div>
            <template v-if="!multiLine">
              <div class="item-status" v-if="isShowFire">{{ formatStatus(v.item.actualFire) }}</div>
              <div class="item-status" v-if="isShowTorpedo">{{ formatStatus(v.item.actualTorpedo) }}</div>
              <div class="item-status" v-if="isShowBomber">{{ formatStatus(v.item.actualBomber) }}</div>
              <div class="item-status" v-if="isShowAntiAir">{{ v.item.data.antiAir ? v.item.data.antiAir : "" }}</div>
              <div class="item-status" v-if="isShowActAntiAir">{{ formatStatus(v.item.actualAntiAir) }}</div>
              <div class="item-status" v-if="isShowDefAntiAir">{{ formatStatus(v.item.actualDefenseAntiAir) }}</div>
              <div class="item-status" v-if="isShowArmor">{{ v.item.data.armor ? v.item.data.armor : "" }}</div>
              <div class="item-status" v-if="isShowAsw">{{ formatStatus(v.item.data.asw) }}</div>
              <div class="item-status" v-if="isShowActualAsw">{{ formatStatus(v.item.actualAsw) }}</div>
              <div class="item-status" v-if="isShowAvoid">{{ v.item.data.avoid ? v.item.data.avoid : "" }}</div>
              <div class="item-status" v-if="isShowScout">{{ formatStatus(v.item.actualScout) }}</div>
              <div class="item-status" v-if="isShowAccuracy">{{ formatStatus(v.item.actualAccuracy) }}</div>
              <div class="item-status" v-if="isShowAntiBomber">{{ v.item.data.antiBomber ? v.item.data.antiBomber : "" }}</div>
              <div class="item-status" v-if="isShowAntiAirWeight">{{ formatStatus(v.item.antiAirWeight) }}</div>
              <div class="item-status" v-if="isShowAntiAirBonus">{{ formatStatus(v.item.antiAirBonus) }}</div>
              <div class="item-status" v-if="isShowRadius">{{ v.item.data.radius ? v.item.data.radius : "" }}</div>
              <div class="item-status" v-if="isShowCost">{{ v.item.data.cost ? v.item.data.cost : "" }}</div>
              <div class="item-status" v-if="isShowTP">{{ v.item.tp ? v.item.tp : "" }}</div>
              <div class="item-status" v-if="isShowAvoidText">{{ avoidTexts[v.item.data.avoidId] }}</div>
              <div class="item-status" v-if="isShowAirPower">{{ v.item.fullAirPower ? v.item.fullAirPower : "" }}</div>
              <div class="item-status" v-if="isShowDefAirPower">
                {{ v.item.defenseAirPower ? v.item.defenseAirPower : "" }}
              </div>
            </template>
          </div>
        </div>
      </div>
      <div v-show="viewItems.length === 0" class="body-2 text-center mt-10">探したけど見つからなかったよ&#128546;</div>
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
      <item-tooltip v-model="tooltipItem" />
    </v-tooltip>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="ma-4">
          <div>既に全て配備されています。</div>
          <div class="caption mt-2">※ 配備 を押せば無視して配備できます。</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="info" dark @click.stop="clickedItem(confirmItem)">配備</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">戻る</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
#item-table-body {
  overflow-y: auto;
  height: 64vh;
}
.item-search-text {
  width: 160px;
}

.filter-select {
  width: 100px;
}
.filter-value-select {
  width: 40px;
}
.filter-value-select input {
  text-align: right !important;
}
.filter-value-input {
  width: 160px;
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  transition: 0.2s;
}
.type-selector:hover {
  background-color: rgba(128, 200, 255, 0.2);
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
.type-all-text {
  width: 32px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9em;
  align-self: center;
}

.type-divider {
  margin-top: 1.25rem;
  display: flex;
  width: 100%;
}
.type-divider-border {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}

.type-item-container.multi {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 600px) {
  .type-item-container.multi {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 880px) {
  .type-item-container.multi {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1100px) {
  .type-item-container.multi {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.list-item {
  display: flex;
  cursor: pointer;
  padding-left: 0.25rem;
  padding-right: 0.1rem;
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  transition: 0.1s;
  border-radius: 0.2rem;
}
.list-item:hover {
  background-color: rgba(0, 164, 255, 0.1);
}
.list-item.no-stock:hover {
  background-color: rgba(255, 128, 128, 0.1);
}
.list-item > div {
  align-self: center;
}
.item-name {
  flex-grow: 1;
  font-size: 0.82em;
  width: 10px;
  margin-left: 0.1rem;
}
.is-special {
  color: #3cac42;
}
.theme--dark .is-special {
  color: #66bb6a;
}
.no-stock .item-name {
  color: rgb(255, 100, 100);
}
.item-remodel {
  width: 32px;
}
.opacity0 {
  opacity: 0;
}
.item-count {
  margin-left: 1px;
  width: 22px;
}

.item-status-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  /** 追従するためrgba使用できない */
  background-color: rgb(248, 248, 248);
  position: sticky;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 1;
  top: 0;
}
.theme--dark .item-status-header {
  /** 追従するためrgba使用できない */
  background-color: rgb(62, 62, 66);
}
.deep-sea .theme--dark .item-status-header {
  /** 追従するためrgba使用できない */
  background-color: rgb(52, 56, 72);
}
.item-status {
  align-self: center;
  text-align: right;
  width: 10%;
  font-size: 0.8em;
}
.item-status-header .item-status {
  padding-right: 4px;
  font-size: 11px;
  opacity: 0.8;
  cursor: pointer;
  transition: 0.2s;
  user-select: none;
  min-height: 34px;
  display: table;
}
.item-status-header .item-status > div {
  display: table-cell;
  vertical-align: middle;
}
.item-status-header .item-status.desc,
.item-status-header .item-status.asc,
.item-status-header .item-status:hover {
  opacity: 1;
}
.item-status-header .item-status:hover {
  background-color: rgba(128, 200, 255, 0.1);
}
.item-status-header .item-status .v-icon {
  opacity: 0;
}
.item-status-header .item-status.desc .v-icon,
.item-status-header .item-status.asc .v-icon {
  opacity: 1;
}
.item-status-header .item-status.asc .v-icon {
  transform: rotate(180deg);
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import ItemMaster from '@/classes/item/itemMaster';
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import Const from '@/classes/const';
import Item from '@/classes/item/item';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import SaveData from '@/classes/saveData/saveData';
import ShipValidation from '@/classes/fleet/shipValidation';

type sortItem = { [key: string]: number | { [key: string]: number } };

export default Vue.extend({
  name: 'ItemList',
  components: { ItemTooltip },
  props: {
    handleEquipItem: {
      type: Function,
      required: true,
    },
    handleClose: {
      type: Function,
      required: true,
    },
    handleChangeWidth: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    itemParent: undefined as undefined | Ship | Airbase | Enemy,
    all: [] as ItemMaster[],
    baseItems: [] as ItemMaster[],
    types: Const.ITEM_TYPES_ALT,
    avoids: Const.AVOID_TYPE,
    type: 0,
    multiLine: true,
    keyword: '',
    isEnemyMode: false,
    isStockOnly: false,
    slot: 0,
    avoidTexts: Const.AVOID_TYPE.map((v) => v.text),
    viewStatus: Const.ITEM_TYPES_ALT[0].viewStatus,
    setting: new SiteSetting(),
    sortKey: '',
    isDesc: false,
    viewItems: [] as { item: Item; count: number }[],
    itemStock: [] as ItemStock[],
    usedItems: [] as Item[],
    confirmDialog: false,
    confirmItem: { item: new Item(), count: 0 },
    headerItems: [
      { text: '火力', key: 'actualFire' },
      { text: '雷装', key: 'actualTorpedo' },
      { text: '爆装', key: 'actualBomber' },
      { text: '対空', key: 'antiAir' },
      { text: '出撃対空', key: 'actualAntiAir' },
      { text: '防空対空', key: 'actualDefenseAntiAir' },
      { text: '装甲', key: 'armor' },
      { text: '対潜', key: 'asw' },
      { text: '対潜', key: 'actualAsw' },
      { text: '回避', key: 'avoid' },
      { text: '索敵', key: 'actualScout' },
      { text: '命中', key: 'actualAccuracy' },
      { text: '対爆', key: 'antiBomber' },
      { text: '加重対空', key: 'antiAirWeight' },
      { text: '艦隊防空', key: 'antiAirBonus' },
      { text: '半径', key: 'radius' },
      { text: 'コスト', key: 'cost' },
      { text: 'TP', key: 'tp' },
      { text: '射撃回避', key: 'avoidId' },
    ],
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipX: 0,
    tooltipY: 0,
    filterStatus: 'radius',
    filterStatusItems: [] as { text: string; value: string }[],
    filterStatusValue: 0,
    filterStatusValueMenu: false,
  }),
  mounted() {
    const items = this.$store.state.items as ItemMaster[];
    for (let i = 0; i < items.length; i += 1) {
      this.all.push(items[i]);
    }
    this.all.sort((a, b) => a.apiTypeId - b.apiTypeId);
    this.avoidTexts[0] = '';
    this.setting = this.$store.state.siteSetting as SiteSetting;
    this.changeMultiLine(this.setting.isMultiLineForItemList);

    for (let i = 0; i < this.headerItems.length; i += 1) {
      const { text, key } = this.headerItems[i];
      if (text === '対潜' && this.filterStatusItems.find((v) => v.text === '対潜')) {
        continue;
      }
      this.filterStatusItems.push({ text, value: key });
    }
  },
  computed: {
    itemListData(): { typeName: string; items: { item: Item; count: number }[] }[] {
      const targetItems = this.viewItems;
      if (this.multiLine) {
        // 種別に応じて分けたい
        const types = Const.ITEM_API_TYPE;
        const resultItems = [];
        for (let i = 0; i < types.length; i += 1) {
          const type = types[i];
          const items = targetItems.filter((v) => v.item.data.apiTypeId === type.id);
          if (items.length) {
            // 存在する艦型を生成
            resultItems.push({ typeName: type.name, items });
          }
        }
        return resultItems;
      }

      // 複数列モードじゃないならなかよし
      return [{ typeName: '', items: targetItems }];
    },
    enabledTypes() {
      const apis = this.baseItems.map((v) => v.apiTypeId);
      const enabledItems = [];
      for (let i = 0; i < this.types.length; i += 1) {
        const d = this.types[i].types;
        if (apis.find((api) => d.includes(api))) {
          enabledItems.push(this.types[i]);
        }
      }
      return enabledItems;
    },
    isShow() {
      return (key: string, items: string[]) => items.includes(key);
    },
    isShowFire(): boolean {
      return this.viewStatus.includes('actualFire');
    },
    isShowTorpedo(): boolean {
      return this.viewStatus.includes('actualTorpedo');
    },
    isShowBomber(): boolean {
      return this.viewStatus.includes('actualBomber');
    },
    isShowAntiAir(): boolean {
      return this.viewStatus.includes('antiAir');
    },
    isShowActAntiAir(): boolean {
      return this.viewStatus.includes('actualAntiAir');
    },
    isShowDefAntiAir(): boolean {
      return this.viewStatus.includes('actualDefenseAntiAir');
    },
    isShowArmor(): boolean {
      return this.viewStatus.includes('armor');
    },
    isShowAsw(): boolean {
      return this.viewStatus.includes('asw');
    },
    isShowActualAsw(): boolean {
      return this.viewStatus.includes('actualAsw');
    },
    isShowAvoid(): boolean {
      return this.viewStatus.includes('avoid');
    },
    isShowScout(): boolean {
      return this.viewStatus.includes('actualScout');
    },
    isShowAccuracy(): boolean {
      return this.viewStatus.includes('actualAccuracy');
    },
    isShowAntiBomber(): boolean {
      return this.viewStatus.includes('antiBomber');
    },
    isShowAntiAirWeight(): boolean {
      return this.viewStatus.includes('antiAirWeight');
    },
    isShowAntiAirBonus(): boolean {
      return this.viewStatus.includes('antiAirBonus');
    },
    isShowRadius(): boolean {
      return this.viewStatus.includes('radius');
    },
    isShowCost(): boolean {
      return this.viewStatus.includes('cost');
    },
    isShowTP(): boolean {
      return this.viewStatus.includes('tp');
    },
    isShowAvoidText(): boolean {
      return this.viewStatus.includes('avoidId');
    },
    isShowAirPower(): boolean {
      return this.viewStatus.includes('airPower');
    },
    isShowDefAirPower(): boolean {
      return this.viewStatus.includes('defenseAirPower');
    },
    formatStatus() {
      return (value: number) => (value ? `${Math.floor(10 * value) / 10}` : '');
    },
  },
  methods: {
    changeType(type = 0): void {
      this.type = type;
      this.filter();
    },
    clickedStockOnly() {
      this.setting.isStockOnlyForItemList = this.isStockOnly;
      this.$store.dispatch('updateSetting', this.setting);
      this.filter();
    },
    initialFilter(parent: Ship | Enemy | Airbase, slotIndex = 0) {
      this.itemParent = parent;
      this.isEnemyMode = false;

      this.filterStatus = 'radius';
      this.filterStatusValue = 0;

      // 現行の所持装備情報を更新
      this.itemStock = this.$store.state.itemStock as ItemStock[];
      this.setting = this.$store.state.siteSetting as SiteSetting;
      this.isStockOnly = this.setting.isStockOnlyForItemList;

      // 一時所持情報データがあるなら
      if (this.$store.getters.getExistsTempStock) {
        this.itemStock = this.$store.state.tempItemStock as ItemStock[];
        this.isStockOnly = true;
      }

      // 搭載数情報を格納
      const isExpand = slotIndex === Const.EXPAND_SLOT_INDEX;
      if (isExpand) {
        this.slot = 0;
      } else {
        this.slot = parent.items[slotIndex] ? parent.items[slotIndex].fullSlot : 0;
      }

      // 現在の計算画面内で配備されている装備を列挙する
      this.usedItems = [];
      const mainData = this.$store.state.mainSaveData as SaveData;
      const manager = mainData.tempData[mainData.tempIndex];
      if (manager) {
        let allItems: Item[] = [];
        // 艦隊データから装備全取得
        for (let i = 0; i < manager.fleetInfo.fleets.length; i += 1) {
          if (i === 4) {
            // 友軍は除外
            continue;
          }

          const { ships } = manager.fleetInfo.fleets[i];
          for (let j = 0; j < ships.length; j += 1) {
            allItems = allItems.concat(ships[j].items.filter((v) => v.data.id > 0));
            if (ships[j].exItem.data.id > 0) allItems.push(ships[j].exItem);
          }
        }

        // 基地航空隊データから装備全取得
        const { airbases } = manager.airbaseInfo;
        for (let i = 0; i < airbases.length; i += 1) {
          allItems = allItems.concat(airbases[i].items.filter((v) => v.data.id > 0));
        }

        this.usedItems = allItems;
      }

      // 装備可能フィルタ
      let types: number[] = [];
      if (parent instanceof Ship && parent.data.id) {
        // 渡された艦娘情報より装備可能種別を取得
        this.baseItems = this.all.filter((item) => ShipValidation.isValidItem(parent.data, item, slotIndex));
        if (this.enabledTypes.length && this.type !== -1 && !this.enabledTypes.find((v) => v.id === this.type)) {
          // カテゴリがおかしかったら最初のカテゴリにする
          this.type = this.enabledTypes[0].id;
        }

        const filterData = this.setting.savedItemListFilter.find((v) => v.parent === 'ship');
        if (filterData && filterData.key) {
          this.filterStatus = filterData.key;
        }
        if (filterData && filterData.value) {
          this.filterStatusValue = filterData.value;
        }

        this.filter();
        return;
      }
      if (parent instanceof Ship) {
        // 空の艦娘 全部盛り
        for (let i = 1; i <= 60; i += 1) {
          if (Const.AB_PLANE_TYPES.includes(i)) {
            continue;
          }
          types.push(i);
        }
      } else if (parent instanceof Airbase) {
        // 基地航空隊 全艦載機装備可能
        types = Const.PLANE_TYPES.concat();
        if (this.type !== -1 && !types.includes(this.type)) {
          // なんか変だったら陸攻を初期位置に
          this.type = 47;
        }
        if (!this.slot) {
          // 搭載数を18に
          this.slot = 18;
        }

        const filterData = this.setting.savedItemListFilter.find((v) => v.parent === 'airbase');
        if (filterData && filterData.key) {
          this.filterStatus = filterData.key;
        }
        if (filterData && filterData.value) {
          this.filterStatusValue = filterData.value;
        }
      } else if (parent instanceof Enemy) {
        // 基本は全装備
        types = Const.ITEM_API_TYPE.map((v) => v.id);
        // 敵装備マスタに存在しない装備カテゴリは抜いておく
        const enemyItems = this.all.filter((v) => v.id > 500);
        types = types.filter((v) => enemyItems.some((x) => x.apiTypeId === v));

        // 敵装備フラグ強制ON
        this.isEnemyMode = true;

        // 初手フィルタ
        if (!types.includes(this.type)) {
          this.type = +types[0];
        }
      }

      if (isExpand) {
        // 補強増設枠フィルタ
        const enabledItems = Const.EXPANDED_ITEM_TYPE;
        types = types.filter((v) => enabledItems.includes(v));
      }

      this.baseItems = this.all.filter((v) => types.includes(v.apiTypeId));
      this.filter();
    },
    changedFilter() {
      const filterData = { parent: 'ship' as 'ship' | 'airbase', key: this.filterStatus, value: this.filterStatusValue };
      if (this.itemParent instanceof Ship) {
        filterData.parent = 'ship';
      } else if (this.itemParent instanceof Airbase) {
        filterData.parent = 'airbase';
      } else {
        this.filter();
        return;
      }

      if (!this.setting.savedItemListFilter) {
        this.filter();
        return;
      }

      const index = this.setting.savedItemListFilter.findIndex((v) => v.parent === filterData.parent);
      if (index >= 0) {
        this.setting.savedItemListFilter[index] = filterData;
        this.$store.dispatch('updateSetting', this.setting);
      }
      this.filter();
    },
    filter() {
      const word = this.keyword;
      let result = this.baseItems.concat();

      if (this.isEnemyMode) {
        // 敵装備
        result = result.filter((v) => v.id > 500);
      } else {
        result = result.filter((v) => v.id < 500);
      }

      // 検索語句あれば最優先 カテゴリ検索を飛ばす
      if (word) {
        result = result.filter((v) => v.id === +word || v.name.indexOf(word) >= 0);
      }

      // カテゴリ検索
      const t = this.types.find((v) => v.id === this.type);
      if (!word && this.type && t) {
        this.viewStatus = t.viewStatus;
        result = result.filter((v) => t.types.includes(v.apiTypeId));
      } else if (!word && this.type === -1) {
        // カテゴリ全て検索
        if (this.itemParent instanceof Ship) {
          // 艦娘 -全て
          this.viewStatus = ['actualFire', 'antiAir', 'actualAccuracy', 'actualScout', 'actualTorpedo', 'asw'];
        } else if (this.itemParent instanceof Airbase) {
          // 基地 -全て
          this.viewStatus = ['actualTorpedo', 'actualBomber', 'actualAntiAir', 'radius', 'airPower', 'defenseAirPower'];
        } else {
          this.viewStatus = ['actualFire', 'actualAntiAir', 'actualAccuracy', 'actualScout', 'avoid', 'armor'];
        }
      }

      let usedItem = this.usedItems.concat();
      const viewItems = [];
      const iniLevels = this.setting.planeInitialLevels;
      const { slot } = this;
      if (!this.isEnemyMode && this.isStockOnly) {
        // 所持装備考慮
        const stock = this.itemStock;
        for (let i = 0; i < result.length; i += 1) {
          const master = result[i];
          const iniLevel = iniLevels.find((v) => v.id === master.apiTypeId);
          const stockData = stock.find((v) => v.id === master.id);
          if (!stockData) {
            // 未所持 出さない
            continue;
          }

          // 熟練度 設定値より
          const level = iniLevel ? iniLevel.level : 0;

          // 改修値★10～0 だけ回す
          for (let remodel = 10; remodel >= 0; remodel -= 1) {
            let count = stockData.num[remodel];
            if (!count) continue;
            const item = new Item({
              master,
              slot,
              remodel,
              level,
            });

            // id 改修値を見て配備済みかどうか判定
            const usedCount = usedItem.filter((v) => v.data.id === master.id && v.remodel === remodel).length;
            // 減らす
            count -= usedCount;
            usedItem = usedItem.filter((v) => v.data.id !== master.id || v.remodel !== remodel);
            viewItems.push({ item, count: Math.max(count, 0) });
          }
        }
      } else {
        // 所持装備考慮なし 愚直に追加
        for (let i = 0; i < result.length; i += 1) {
          const master = result[i];
          const iniLevel = iniLevels.find((v) => v.id === master.apiTypeId);
          const level = iniLevel ? iniLevel.level : 0;
          const item = new Item({
            master,
            slot,
            level,
          });
          viewItems.push({ item, count: 1 });
        }
      }

      this.viewItems = viewItems;

      if (this.filterStatus && this.filterStatusValue) {
        const filterKey = this.filterStatus;
        const value = this.filterStatusValue;
        const isActualFilterKey = filterKey.indexOf('actual') >= 0
          || filterKey === 'tp'
          || filterKey === 'airPower'
          || filterKey === 'defenseAirPower'
          || filterKey === 'antiAirWeight'
          || filterKey === 'antiAirBonus';
        this.viewItems = (this.viewItems as []).filter((v: { item: sortItem }) => {
          if (isActualFilterKey) {
            return v.item[filterKey] >= value;
          }
          return (v.item.data as { [key: string]: number })[filterKey] >= value;
        });
      }

      if (this.sortKey) {
        this.sortItems();
      }
    },
    clickedItem(data: { item: Item; count: number }) {
      this.clearTooltip();
      if (data.count || this.confirmDialog) {
        this.confirmDialog = false;
        this.handleEquipItem(data.item);
      } else {
        this.confirmItem = data;
        this.confirmDialog = true;
      }
    },
    changeMultiLine(isMulti: boolean) {
      this.handleChangeWidth(isMulti ? 1200 : 900);
      this.multiLine = isMulti;

      // 設定書き換え
      this.setting.isMultiLineForItemList = isMulti;
      this.$store.dispatch('updateSetting', this.setting);
    },
    close() {
      this.handleClose();
    },
    toggleSortKey(value: string) {
      if (this.sortKey !== value) {
        // 初回 降順
        this.isDesc = true;
        this.sortKey = value;
      } else if (this.sortKey === value && this.isDesc) {
        // 2回目 昇順
        this.isDesc = false;
      } else if (this.sortKey === value && !this.isDesc) {
        // 3回目 ソート解除
        this.sortKey = '';
        this.filter();
        return;
      }

      this.sortItems();
    },
    sortItems() {
      const key = this.sortKey;
      const desc = this.isDesc ? 1 : -1;
      const isActualValue = key.indexOf('actual') >= 0
        || key === 'tp'
        || key === 'airPower'
        || key === 'defenseAirPower'
        || key === 'antiAirWeight'
        || key === 'antiAirBonus';
      (this.viewItems as []).sort((a: { item: sortItem }, b: { item: sortItem }) => {
        if (isActualValue) {
          return desc * ((b.item[key] as number) - (a.item[key] as number));
        }
        return desc * ((b.item.data as { [key: string]: number })[key] - (a.item.data as { [key: string]: number })[key]);
      });
    },
    bootTooltip(item: Item, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledItemTooltip) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = this.multiLine ? rect.x + rect.width / 3 : e.clientX;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
        this.enabledTooltip = true;
      }, 400);
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
