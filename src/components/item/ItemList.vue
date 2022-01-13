<template>
  <v-card>
    <div class="d-flex pt-2 pb-1 pr-2">
      <div class="align-self-center ml-3">装備選択</div>
      <v-spacer></v-spacer>
      <div class="d-none d-sm-block mr-10">
        <v-btn depressed class="px-2" :class="{ info: !multiLine }" @click="multiLine = false">
          <v-icon>mdi-view-headline</v-icon>
          <span>一列</span>
        </v-btn>
        <v-btn depressed class="ml-2 px-2" :class="{ info: multiLine }" @click="multiLine = true">
          <v-icon>mdi-view-comfy</v-icon>
          <span>複数列</span>
        </v-btn>
      </div>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="d-flex px-5 pt-2">
      <div class="align-self-center item-search-text">
        <v-text-field label="図鑑No 名称検索" clearable v-model="keyword" @input="filter()" prepend-inner-icon="mdi-magnify"></v-text-field>
      </div>
      <div class="ml-5 align-self-center">
        <v-checkbox v-model="isEnemyMode" @change="filter()" :label="'敵装備'"></v-checkbox>
      </div>
      <v-spacer></v-spacer>
    </div>
    <div class="d-flex flex-wrap mx-3">
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
    <v-divider class="mx-3"></v-divider>
    <div id="item-table-body" class="ml-3" :class="{ 'pr-3': multiLine }">
      <div :class="{ multi: multiLine }">
        <div v-if="!multiLine && viewItems.length" class="item-status-header pr-3">
          <div
            class="item-status"
            v-for="(data, i) in headerItems"
            :key="`item${i}`"
            @click="toggleSortKey(data.key)"
            :class="{ desc: sortKey === data.key && isDesc, asc: sortKey === data.key && !isDesc }"
            v-show="isShow(data.key, selectedType.viewStatus)"
          >
            <div><v-icon small>mdi-chevron-down</v-icon>{{ data.text }}</div>
          </div>
          <div
            class="item-status"
            @click="toggleSortKey('airPower')"
            :class="{ desc: sortKey === 'airPower' && isDesc, asc: sortKey === 'airPower' && !isDesc }"
            v-show="isShow('airPower', selectedType.viewStatus)"
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
            @click="toggleSortKey('defAirPower')"
            :class="{ desc: sortKey === 'defAirPower' && isDesc, asc: sortKey === 'defAirPower' && !isDesc }"
            v-show="isShow('defAirPower', selectedType.viewStatus)"
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
        <div
          v-ripple="{ class: 'info--text' }"
          :class="{ 'pr-3': !multiLine }"
          v-for="(item, i) in viewItems"
          :key="i"
          class="list-item"
          @click="clickedItem(item.data)"
        >
          <div>
            <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="24" width="24"></v-img>
          </div>
          <div class="item-name text-truncate" :class="{ 'is-special': item.data.isSpecial }">
            {{ item.data.name }}
          </div>
          <div class="item-remodel caption">
            <v-icon small color="teal accent-4">mdi-star</v-icon>
            <span class="teal--text text--accent-4">{{ item.remodel }}</span>
          </div>
          <div class="item-count red--text caption">
            <span>&times;</span>
            <span>{{ i % 20 }}</span>
          </div>
          <template v-if="!multiLine">
            <div class="item-status" v-show="isShow('fire', selectedType.viewStatus)">{{ item.data.fire }}</div>
            <div class="item-status" v-show="isShow('torpedo', selectedType.viewStatus)">{{ item.data.torpedo }}</div>
            <div class="item-status" v-show="isShow('bomber', selectedType.viewStatus)">{{ item.data.bomber }}</div>
            <div class="item-status" v-show="isShow('antiAir', selectedType.viewStatus)">{{ item.data.antiAir }}</div>
            <div class="item-status" v-show="isShow('actAntiAir', selectedType.viewStatus)">
              {{ Math.floor(10 * item.actualAntiAir) / 10 }}
            </div>
            <div class="item-status" v-show="isShow('defAntiAir', selectedType.viewStatus)">
              {{ Math.floor(10 * item.actualDefenseAntiAir) / 10 }}
            </div>
            <div class="item-status" v-show="isShow('armor', selectedType.viewStatus)">{{ item.data.armor }}</div>
            <div class="item-status" v-show="isShow('asw', selectedType.viewStatus)">{{ item.data.asw }}</div>
            <div class="item-status" v-show="isShow('avoid', selectedType.viewStatus)">{{ item.data.avoid }}</div>
            <div class="item-status" v-show="isShow('scout', selectedType.viewStatus)">{{ item.data.scout }}</div>
            <div class="item-status" v-show="isShow('accuracy', selectedType.viewStatus)">{{ item.data.accuracy }}</div>
            <div class="item-status" v-show="isShow('antiAirWeight', selectedType.viewStatus)">{{ item.antiAirWeight.toFixed(1) }}</div>
            <div class="item-status" v-show="isShow('antiAirBonus', selectedType.viewStatus)">{{ item.antiAirBonus.toFixed(1) }}</div>
            <div class="item-status" v-show="isShow('radius', selectedType.viewStatus)">{{ item.data.radius }}</div>
            <div class="item-status" v-show="isShow('cost', selectedType.viewStatus)">{{ item.data.cost }}</div>
            <div class="item-status" v-show="isShow('tP', selectedType.viewStatus)">{{ item.tp }}</div>
            <div class="item-status" v-show="isShow('avoidText', selectedType.viewStatus)">{{ avoidTexts[item.data.avoidId] }}</div>
            <div class="item-status" v-show="isShow('airPower', selectedType.viewStatus)">{{ item.fullAirPower }}</div>
            <div class="item-status" v-show="isShow('defAirPower', selectedType.viewStatus)">{{ item.defenseAirPower }}</div>
          </template>
        </div>
      </div>
      <div v-show="items.length === 0" class="caption text-center mt-10">搭載可能な装備が見つかりませんでした。</div>
    </div>
  </v-card>
</template>

<style scoped>
#item-table-body {
  overflow-y: auto;
  height: 64vh;
}
.item-search-text {
  width: 168px;
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  transition: 0.2s;
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
.type-all-text {
  width: 32px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9em;
  align-self: center;
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

.list-item {
  display: flex;
  cursor: pointer;
  padding-left: 0.25rem;
  padding-right: 0.1rem;
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
  transition: 0.1s;
  border-radius: 0.2rem;
}
.list-item:hover {
  background-color: rgba(0, 164, 255, 0.1);
}
.list-item > div {
  align-self: center;
}
.item-name {
  flex-grow: 1;
  font-size: 0.8em;
  width: 10px;
  margin-left: 0.1rem;
}
.is-special {
  color: #388e3c;
}
.theme--dark .is-special {
  color: #66bb6a;
}
.item-remodel {
  width: 32px;
}
.item-count {
  margin-left: 1px;
  width: 22px;
}

.item-status-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  background-color: #f8f8f8;
  position: sticky;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 1;
  top: 0;
}
.theme--dark .item-status-header {
  background-color: #333;
}
.item-status {
  align-self: center;
  text-align: right;
  width: 10%;
  font-size: 0.8em;
}
.item-status-header .item-status {
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
  background-color: rgba(0, 164, 255, 0.1);
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
import ItemMaster from '@/classes/item/itemMaster';
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import Const from '@/classes/const';
import Item from '@/classes/item/item';
import SiteSetting from '@/classes/siteSetting';

type sortItem = { actualAntiAir: number; data: { [key: string]: number } };

export default Vue.extend({
  name: 'ItemList',
  props: {
    handleEquipItem: {
      type: Function,
      required: true,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    all: [] as ItemMaster[],
    baseItems: [] as ItemMaster[],
    items: [] as ItemMaster[],
    types: Const.ITEM_TYPES_ALT,
    avoids: Const.AVOID_TYPE,
    type: 0,
    multiLine: true,
    keyword: '',
    isEnemyMode: false,
    slot: 0,
    avoidTexts: Const.AVOID_TYPE.map((v) => v.text),
    selectedType: Const.ITEM_TYPES_ALT[0],
    setting: new SiteSetting(),
    sortKey: '',
    isDesc: false,
    viewItems: [] as Item[],
    headerItems: [
      { text: '火力', key: 'fire' },
      { text: '雷装', key: 'torpedo' },
      { text: '爆装', key: 'bomber' },
      { text: '対空', key: 'antiAir' },
      { text: '出撃対空', key: 'actAntiAir' },
      { text: '防空対空', key: 'defAntiAir' },
      { text: '装甲', key: 'armor' },
      { text: '対潜', key: 'asw' },
      { text: '回避', key: 'avoid' },
      { text: '索敵', key: 'scout' },
      { text: '命中', key: 'accuracy' },
      { text: '加重対空', key: 'antiAirWeight' },
      { text: '艦隊防空', key: 'antiAirBonus' },
      { text: '半径', key: 'radius' },
      { text: 'コスト', key: 'cost' },
      { text: 'TP', key: 'tp' },
      { text: '射撃回避', key: 'avoidText' },
    ],
  }),
  mounted() {
    const items = this.$store.state.items as ItemMaster[];
    for (let i = 0; i < items.length; i += 1) {
      this.all.push(items[i]);
    }
    this.all.sort((a, b) => a.apiTypeId - b.apiTypeId);

    this.avoidTexts[0] = '';

    this.setting = this.$store.state.siteSetting as SiteSetting;
  },
  computed: {
    isShow() {
      return (key: string, items: string[]) => items.includes(key);
    },
    enabledTypes() {
      const apis = this.baseItems.map((v) => v.apiTypeId);
      const enableds = [];
      for (let i = 0; i < this.types.length; i += 1) {
        const d = this.types[i].types;
        if (apis.find((api) => d.includes(api))) {
          enableds.push(this.types[i]);
        }
      }
      return enableds;
    },
  },
  methods: {
    changeType(type = 0): void {
      this.type = type;
      this.filter();
    },
    initialFilter(parent: Ship | Enemy | Airbase, slotIndex = 0) {
      // 搭載数情報を格納
      const isExpand = slotIndex === Const.EXPAND_SLOT_INDEX;
      if (isExpand) {
        this.slot = 0;
      } else {
        this.slot = parent.items[slotIndex] ? parent.items[slotIndex].fullSlot : 0;
      }

      // 装備可能フィルタ
      let types: number[] = [];
      if (parent instanceof Ship && parent.data.id) {
        // 渡された艦娘情報より装備可能種別を取得
        this.baseItems = this.all.filter((item) => parent.data.isValidItem(item, slotIndex));
        if (this.enabledTypes.length && !this.enabledTypes.find((v) => v.id === this.type)) {
          // カテゴリがおかしかったら最初のカテゴリにする
          this.type = this.enabledTypes[0].id;
        }
        this.filter();
        return;
      }
      if (parent instanceof Ship) {
        // 空の艦娘 全部盛り
        for (let i = 1; i <= 60; i += 1) {
          if (Const.LB_PLANE_TYPES.includes(i)) {
            continue;
          }
          types.push(i);
        }
      } else if (parent instanceof Airbase) {
        // 基地航空隊 全艦載機装備可能
        types = Const.PLANE_TYPES.concat();
        // 陸攻を初期位置に
        this.type = 47;
        if (!this.slot) {
          // 搭載数を18に
          this.slot = 18;
        }
      } else if (parent instanceof Enemy) {
        // 渡された敵艦種より装備可能種別を取得
        const info = Const.SHIP_TYPES_INFO.find((v) => v.id === parent.data.type);
        if (info) {
          types = info.itemType;
        }
      }

      if (isExpand) {
        // 補強増設枠フィルタ
        const enableds = Const.EXPANDED_ITEM_TYPE;
        types = types.filter((v) => enableds.includes(v));
      }

      this.baseItems = this.all.filter((v) => types.includes(v.apiTypeId));
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
        this.selectedType = t;
        result = result.filter((v) => t.types.includes(v.apiTypeId));
      }

      this.items = result;

      const viewItems = [];
      const iniLevels = this.setting.planeInitialLevels;
      for (let i = 0; i < result.length; i += 1) {
        const master = result[i];
        // todo 改修値
        const iniLevel = iniLevels.find((v) => v.id === master.apiTypeId);
        const level = iniLevel ? iniLevel.level : 0;
        viewItems.push(
          new Item({
            master,
            slot: this.slot,
            remodel: master.id % 11,
            level,
          }),
        );
      }

      this.viewItems = viewItems;
    },
    clickedItem(item: ItemMaster) {
      this.handleEquipItem(item);
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
      }

      const key = this.sortKey;
      const isAsc = !this.isDesc;
      if (this.sortKey) {
        (this.viewItems as []).sort((a: sortItem, b: sortItem) => {
          if (key === 'actualAntiAir') {
            return (isAsc ? -1 : 1) * (b.actualAntiAir - a.actualAntiAir);
          }
          return (isAsc ? -1 : 1) * (b.data[key] - a.data[key]);
        });
      } else {
        // ソート解除 もう一回取得しなおして自然順序に
        this.filter();
      }
    },
  },
});
</script>
