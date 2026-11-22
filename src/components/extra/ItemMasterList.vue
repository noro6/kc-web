<template>
  <div>
    <v-card class="item-list-card">
      <div class="d-flex align-center flex-wrap">
        <div class="keyword-text mr-3 my-3">
          <v-text-field v-model="keyword" dense :placeholder="$t('Database.名称検索')" prepend-inner-icon="mdi-magnify" clearable hide-details />
        </div>
        <div class="my-3 d-flex align-center">
          <template v-if="ship.id">
            <div class="d-flex align-center" @click="showShipList()" @keypress.enter="showShipList()" v-ripple="{ class: 'primary--text' }">
              <div>
                <v-img :src="`./img/ship/banner/${ship.id}.png`" height="30" width="120" />
              </div>
              <div class="ml-2 caption">{{ getShipName(ship) }}</div>
            </div>
            <v-btn icon @click="showShipList()"><v-icon>mdi-sync</v-icon></v-btn>
            <v-btn icon @click="removeShip()"><v-icon>mdi-close</v-icon></v-btn>
          </template>
          <v-btn v-else color="primary" @click="showShipList()">{{ $t("Extra.搭載可能な装備で絞り込み") }}</v-btn>
        </div>
        <div class="ml-auto my-3" v-if="itemStock.length">
          <v-checkbox v-model="isStockOnly" :disabled="isEnemyMode" @click="setItems" hide-details dense :label="$t('ItemList.所持装備反映')" />
        </div>
        <div class="ml-3 mr-3 my-3">
          <v-checkbox v-model="isEnemyMode" :disabled="!!keyword || isStockOnly" @change="setItems" dense hide-details :label="$t('ItemList.敵装備')" />
        </div>
      </div>
      <div class="d-flex flex-wrap">
        <div v-ripple="{ class: 'info--text' }" class="type-selector d-flex" :class="{ disabled: keyword }" @click="toggleType(-1)" @keypress="toggleType(-1)">
          <div class="type-all-text">ALL</div>
        </div>
        <div
          v-for="i in enabledTypes"
          :key="i.id"
          v-ripple="{ class: 'info--text' }"
          class="type-selector"
          :class="{ active: selectedTypes.includes(i.id), disabled: keyword }"
          @click="toggleType(i.id)"
          @keypress="toggleType(i.id)"
        >
          <v-img :src="`./img/type/type${i.id}.png`" height="32" width="32" />
        </div>
      </div>
      <v-divider />
      <v-data-table
        class="item-stat-table"
        dense
        fixed-header
        height="44vh"
        multi-sort
        :headers="headers"
        :items="visibleItems"
        :footer-props="{
          showFirstLastPage: true,
          firstIcon: 'mdi-chevron-double-left',
          lastIcon: 'mdi-chevron-double-right',
          prevIcon: 'mdi-chevron-left',
          nextIcon: 'mdi-chevron-right',
          'items-per-page-options': [50, 100, 150],
        }"
        mobile-breakpoint="0"
      >
        <template v-slot:[`header.name`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.fire`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.torpedo`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.bomber`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.antiAir`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.asw`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.scout`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.accuracy`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.avoid`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.armor`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.interception`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.antiBomber`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.radius`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`header.range`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
        <template v-slot:[`item.iconTypeId`]="{ item }">
          <div>
            <v-img :src="`./img/type/icon${item.iconTypeId}.png`" height="30" width="30" />
          </div>
        </template>
        <template v-slot:[`item.name`]="{ item }">
          <div class="item-name text-truncate caption" :class="{ 'is-special': item.isSpecial }" :title="item.name">
            {{ needTrans ? $t(`${item.name}`) : item.name }}
          </div>
        </template>
        <template v-slot:[`item.range`]="{ item }">
          <div class="caption">{{ rangeText[item.range] ? $t(`Common.${rangeText[item.range]}`) : "" }}</div>
        </template>
        <template v-slot:[`item.fire`]="{ item }">
          <div class="meter" :class="meterClass('fire', item.fire)">
            <i :style="{ width: meterWidth('fire', item.fire) }" />
            <span>{{ item.fire }}</span>
          </div>
        </template>
        <template v-slot:[`item.torpedo`]="{ item }">
          <div class="meter" :class="meterClass('torpedo', item.torpedo)">
            <i :style="{ width: meterWidth('torpedo', item.torpedo) }" />
            <span>{{ item.torpedo }}</span>
          </div>
        </template>
        <template v-slot:[`item.bomber`]="{ item }">
          <div class="meter" :class="meterClass('bomber', item.bomber)">
            <i :style="{ width: meterWidth('bomber', item.bomber) }" />
            <span>{{ item.bomber }}</span>
          </div>
        </template>
        <template v-slot:[`item.antiAir`]="{ item }">
          <div class="meter" :class="meterClass('antiAir', item.antiAir)">
            <i :style="{ width: meterWidth('antiAir', item.antiAir) }" />
            <span>{{ item.antiAir }}</span>
          </div>
        </template>
        <template v-slot:[`item.asw`]="{ item }">
          <div class="meter" :class="meterClass('asw', item.asw)">
            <i :style="{ width: meterWidth('asw', item.asw) }" />
            <span>{{ item.asw }}</span>
          </div>
        </template>
        <template v-slot:[`item.scout`]="{ item }">
          <div class="meter" :class="meterClass('scout', item.scout)">
            <i :style="{ width: meterWidth('scout', item.scout) }" />
            <span>{{ item.scout }}</span>
          </div>
        </template>
        <template v-slot:[`item.accuracy`]="{ item }">
          <div class="meter" :class="meterClass('accuracy', item.accuracy)">
            <i :style="{ width: meterWidth('accuracy', item.accuracy) }" />
            <span>{{ item.accuracy }}</span>
          </div>
        </template>
        <template v-slot:[`item.avoid`]="{ item }">
          <div class="meter" :class="meterClass('avoid', item.avoid)">
            <i :style="{ width: meterWidth('avoid', item.avoid) }" />
            <span>{{ item.avoid }}</span>
          </div>
        </template>
        <template v-slot:[`item.armor`]="{ item }">
          <div class="meter" :class="meterClass('armor', item.armor)">
            <i :style="{ width: meterWidth('armor', item.armor) }" />
            <span>{{ item.armor }}</span>
          </div>
        </template>
        <template v-slot:[`item.interception`]="{ item }">
          <div class="meter" :class="meterClass('interception', item.interception)">
            <i :style="{ width: meterWidth('interception', item.interception) }" />
            <span>{{ item.interception }}</span>
          </div>
        </template>
        <template v-slot:[`item.antiBomber`]="{ item }">
          <div class="meter" :class="meterClass('antiBomber', item.antiBomber)">
            <i :style="{ width: meterWidth('antiBomber', item.antiBomber) }" />
            <span>{{ item.antiBomber }}</span>
          </div>
        </template>
        <template v-slot:[`item.radius`]="{ item }">
          <div class="meter" :class="meterClass('radius', item.radius)">
            <i :style="{ width: meterWidth('radius', item.radius) }" />
            <span>{{ item.radius }}</span>
          </div>
        </template>
      </v-data-table>
    </v-card>
    <div class="section-head">{{ $t("Extra.対空射撃回避機体一覧") }}</div>
    <v-card class="item-list-card aa-card">
      <v-simple-table class="aa-table" dense fixed-header height="70vh">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-right">id</th>
              <th>{{ $t("Common.装備名") }}</th>
              <th class="text-right">{{ $t("Common.射撃回避") }}</th>
              <th class="text-right">{{ $t("Fleet.加重対空補正") }}</th>
              <th class="text-right">{{ $t("Fleet.艦隊防空補正") }}</th>
              <th class="text-center">wiki</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in aaResitItems" :key="`re-item${i}`">
              <td class="text-right">{{ item.id }}</td>
              <td class="text-left" :class="{ 'is-special': item.isSpecial }">
                <div class="d-flex align-center">
                  <div>
                    <v-img :src="`./img/type/icon${item.iconTypeId}.png`" height="30" width="30" />
                  </div>
                  <div class="ml-1" :class="{ 'is-special': item.isSpecial }">
                    {{ needTrans ? $t(`${item.name}`) : item.name }}
                  </div>
                </div>
              </td>
              <td class="text-right">{{ avoidTexts[item.avoidId] ? $t(`Common.回避性能.${avoidTexts[item.avoidId]}`) : "" }}</td>
              <td class="text-right">{{ avoidC1[item.avoidId] }}</td>
              <td class="text-right">{{ avoidC2[item.avoidId] }}</td>
              <td class="text-center">
                <a v-if="!item.isEnemyItem" :href="getWikiURL(item)" target="_blank">wiki</a>
                <div v-else>-</div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth" :fullscreen="isMobile">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
  </div>
</template>

<style scoped>
.item-list-card {
  --accent: #14b8a6;
  --surface: #fbfaf8;
  --surface-2: #f1efeb;
  padding: 8px 12px 10px;
  overflow: hidden;
  background: var(--surface) !important;
  border: 1px solid rgba(22, 26, 34, 0.08) !important;
  border-radius: 16px !important;
  box-shadow: none !important;
}
.theme--dark .item-list-card {
  --surface: rgb(32, 33, 40);
  --surface-2: rgb(42, 44, 52);
  border-color: rgba(255, 255, 255, 0.09) !important;
}
.deep-sea .theme--dark .item-list-card {
  --surface: rgb(16, 28, 48);
  --surface-2: rgb(24, 40, 64);
  background: var(--surface) !important;
  border-color: rgba(160, 196, 255, 0.14) !important;
}
.section-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 22px 2px 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.72;
}
.section-head::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(128, 128, 128, 0.35);
}
.aa-card {
  margin-bottom: 8px;
}
.keyword-text {
  width: 160px;
}
.manual-checkbox {
  position: relative;
  height: 32px;
  width: 74px;
  cursor: pointer;
}
.manual-checkbox-button {
  position: absolute;
  bottom: -6px;
}
.manual-icon {
  font-size: 20px !important;
}
.manual-checkbox img {
  position: absolute;
  left: 32px;
  top: -1px;
}
.item-name {
  min-width: 180px;
}
.is-special {
  color: #3cac42;
}
.theme--dark .is-special {
  color: #66bb6a;
}

.type-selector {
  border: 1px solid transparent;
  padding: 6px;
  margin-top: 1px;
  margin-right: 2px;
  margin-left: 2px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease;
}
.type-selector:hover {
  background-color: color-mix(in srgb, var(--accent) 12%, transparent);
}
.type-selector.active {
  border-color: color-mix(in srgb, var(--accent) 55%, transparent);
  background-color: color-mix(in srgb, var(--accent) 14%, transparent);
}
.type-selector.disabled {
  opacity: 0.4;
  background-color: transparent;
  pointer-events: none;
}
.type-all-text {
  user-select: none;
  width: 32px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9em;
  align-self: center;
}

.meter {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 48px;
  min-height: 22px;
  overflow: hidden;
  font-variant-numeric: tabular-nums;
}
.meter i {
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--accent) 30%, transparent);
  pointer-events: none;
}
.meter.best {
  box-shadow: inset 3px 0 0 var(--accent);
}
.meter.best i {
  background: color-mix(in srgb, var(--accent) 58%, transparent);
}
.meter span {
  position: relative;
}
.meter.best span {
  color: #0f766e;
  font-weight: 700;
}
.theme--dark .meter.best span {
  color: #5eead4;
}
.meter.down span {
  color: #dc2626;
}
.theme--dark .meter.down span {
  color: #fca5a5;
}

.item-list-card >>> .v-data-table.v-data-table--fixed-header thead th,
.theme--dark .item-list-card >>> .v-data-table.v-data-table--fixed-header thead th,
.deep-sea .item-list-card >>> .v-data-table.v-data-table--fixed-header thead th {
  background-color: var(--surface) !important;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.item-list-card >>> .item-stat-table thead th:nth-child(2),
.item-list-card >>> .item-stat-table thead th:nth-child(3) {
  position: sticky;
  top: 0;
  z-index: 4;
}
.item-list-card >>> .item-stat-table th:nth-child(2),
.item-list-card >>> .item-stat-table td:nth-child(2),
.item-list-card >>> .item-stat-table th:nth-child(3),
.item-list-card >>> .item-stat-table td:nth-child(3) {
  position: sticky;
  z-index: 2;
  background: var(--surface);
}
.item-list-card >>> .item-stat-table th:nth-child(2),
.item-list-card >>> .item-stat-table td:nth-child(2) {
  left: 0;
  width: 36px;
  min-width: 36px;
}
.item-list-card >>> .item-stat-table th:nth-child(3),
.item-list-card >>> .item-stat-table td:nth-child(3) {
  left: 36px;
}
.item-list-card >>> .item-stat-table tbody tr:hover td:nth-child(2),
.item-list-card >>> .item-stat-table tbody tr:hover td:nth-child(3) {
  background: color-mix(in srgb, rgb(128, 128, 128) 10%, var(--surface));
}
.aa-table >>> tbody td:nth-child(2),
.aa-table >>> thead th:nth-child(2) {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--surface);
}
.aa-table >>> thead th:nth-child(2) {
  z-index: 4;
}
.aa-table >>> tbody tr:hover td:nth-child(2) {
  background: var(--surface-2);
}

.v-card >>> .v-data-table th,
.v-card >>> .v-data-table td {
  white-space: nowrap;
  padding: 0 8px !important;
}

.v-card >>> .v-data-table th:nth-child(2),
.v-card >>> .v-data-table td:nth-child(2) {
  padding: 0 !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipList, { ViewShip } from '@/components/fleet/ShipList.vue';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipValidation from '@/classes/fleet/shipValidation';
import ItemMaster from '@/classes/item/itemMaster';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';

function buildStatRange(rows: Record<string, number>[], keys: string[]) {
  const range: Record<string, { max: number; min: number; maxCount: number }> = {};
  keys.forEach((key) => {
    let maxValue = 0;
    let minValue = Number.POSITIVE_INFINITY;
    let maxCount = 0;
    rows.forEach((row) => {
      const value = Number(row[key]) || 0;
      if (value > maxValue) {
        maxValue = value;
        maxCount = 1;
      } else if (value === maxValue) {
        maxCount += 1;
      }
      if (value < minValue) minValue = value;
    });
    range[key] = {
      max: maxValue,
      min: Number.isFinite(minValue) ? minValue : 0,
      maxCount,
    };
  });
  return range;
}

function peakWidth(range: { max: number } | undefined, value: number) {
  const peak = range ? range.max : 0;
  if (!peak || value <= 0) return '0%';
  return `${Math.min(100, Math.round((value / peak) * 100))}%`;
}

export default Vue.extend({
  name: 'ItemMasterList',
  components: { ShipList },
  data: () => ({
    rangeText: ['', '短', '中', '長', '超長', '超長+'],
    keyword: '',
    ship: new ShipMaster(),
    isStockOnly: false,
    isEnemyMode: false,
    types: [] as { id: number; text: string; types: number[] }[],
    selectedTypes: [] as number[],
    headers: [
      {
        text: 'id',
        value: 'id',
        align: 'end',
      },
      {
        text: '',
        value: 'iconTypeId',
        align: 'end',
      },
      {
        text: '装備名',
        value: 'name',
      },
      {
        text: '火力',
        filterable: false,
        align: 'end',
        value: 'fire',
      },
      {
        text: '雷装',
        filterable: false,
        align: 'end',
        value: 'torpedo',
      },
      {
        text: '爆装',
        filterable: false,
        align: 'end',
        value: 'bomber',
      },
      {
        text: '対空',
        filterable: false,
        align: 'end',
        value: 'antiAir',
      },
      {
        text: '対潜',
        filterable: false,
        align: 'end',
        value: 'asw',
      },
      {
        text: '索敵',
        filterable: false,
        align: 'end',
        value: 'scout',
      },
      {
        text: '命中',
        filterable: false,
        align: 'end',
        value: 'accuracy',
      },
      {
        text: '回避',
        filterable: false,
        align: 'end',
        value: 'avoid',
      },
      {
        text: '装甲',
        filterable: false,
        align: 'end',
        value: 'armor',
      },
      {
        text: '迎撃',
        filterable: false,
        align: 'end',
        value: 'interception',
      },
      {
        text: '対爆',
        filterable: false,
        align: 'end',
        value: 'antiBomber',
      },
      {
        text: '半径',
        filterable: false,
        align: 'end',
        value: 'radius',
      },
      {
        text: '射程',
        filterable: false,
        align: 'end',
        value: 'range',
      },
    ],
    items: [] as ItemMaster[],
    baseItems: [] as ItemMaster[],
    aaResitItems: [] as ItemMaster[],
    avoidTexts: Const.AVOID_TYPE.map((v) => v.text),
    avoidC1: Const.AVOID_TYPE.map((v) => v.c1),
    avoidC2: Const.AVOID_TYPE.map((v) => v.c2),
    shipListDialog: false,
    shipDialogWidth: 1200,
    itemStock: [] as ItemStock[],
    isMobile: true,
  }),
  mounted() {
    const all = this.$store.state.items as ItemMaster[];
    this.baseItems = all;
    this.aaResitItems = all.filter((v) => v.avoidId).concat();
    this.aaResitItems.sort((a, b) => {
      if (a.apiTypeId === b.apiTypeId) {
        return a.avoidId - b.avoidId;
      }
      return a.apiTypeId - b.apiTypeId;
    });

    // カテゴリセレクト初期化
    this.types = [];
    for (let i = 0; i < Const.ITEM_TYPES_ALT.length; i += 1) {
      const type = Const.ITEM_TYPES_ALT[i];
      this.types.push({
        id: type.id,
        text: type.text,
        types: type.types,
      });

      this.selectedTypes.push(type.id);
    }

    // 現行の所持装備情報を更新
    this.itemStock = this.$store.state.itemStock as ItemStock[];
    const setting = this.$store.state.siteSetting as SiteSetting;
    this.isStockOnly = setting.isStockOnlyForItemList;

    // 一時所持情報データがあるなら
    if (this.$store.getters.getExistsTempStock) {
      this.itemStock = this.$store.state.tempItemStock as ItemStock[];
      this.isStockOnly = true;
    }

    this.avoidTexts[0] = '';
    this.setItems();
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    getShipName() {
      return (ship: ShipMaster) => {
        if (this.needTrans) {
          const array = ShipMaster.getSuffix(ship);
          return `${array.map((v) => (v ? `${this.$t(v)}` : '')).join('')}`;
        }
        return ship.name ? ship.name : '';
      };
    },
    statRange(): Record<string, { max: number; min: number; maxCount: number }> {
      const keys = ['fire', 'torpedo', 'bomber', 'antiAir', 'asw', 'scout', 'accuracy', 'avoid', 'armor', 'interception', 'antiBomber', 'radius'];
      return buildStatRange(this.visibleItems.map((item) => item as unknown as Record<string, number>), keys);
    },
    visibleItems(): ItemMaster[] {
      const keyword = (this.keyword || '').trim().toLowerCase();
      if (!keyword) return this.items;
      return this.items.filter((item) => {
        const translated = this.needTrans ? `${this.$t(`${item.name}`)}` : '';
        return `${item.id} ${item.name} ${translated}`.toLowerCase().includes(keyword);
      });
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
  },
  watch: {
    completed(value) {
      if (value) {
        this.removeShip();
      }
    },
  },
  methods: {
    meterClass(key: string, value: number) {
      return {
        best: this.isPeak(this.statRange[key], value),
        down: value < 0,
      };
    },
    meterWidth(key: string, value: number) {
      return peakWidth(this.statRange[key], value);
    },
    isPeak(range: { max: number; min: number; maxCount: number } | undefined, value: number) {
      if (!range || value <= 0 || range.max === range.min) return false;
      return value === range.max && range.maxCount <= 4;
    },
    toggleType(id: number) {
      if (id === -1) {
        const all = Const.ITEM_TYPES_ALT.map((v) => v.id);
        if (this.selectedTypes.length === all.length) {
          this.selectedTypes = [];
        } else {
          this.selectedTypes = all;
        }
      } else if (this.selectedTypes.includes(id)) {
        this.selectedTypes = this.selectedTypes.filter((v) => v !== id);
      } else {
        this.selectedTypes.push(id);
      }

      this.setItems();
    },
    setItems() {
      this.isMobile = window.innerWidth < 600;
      const items = [];
      const types = Const.ITEM_TYPES_ALT.filter((v) => this.selectedTypes.includes(v.id))
        .map((v) => v.types)
        .flat();

      for (let i = 0; i < this.baseItems.length; i += 1) {
        const item = this.baseItems[i];

        if (!types.includes(item.apiTypeId)) {
          // カテゴリフィルタ
          continue;
        }

        if ((!this.isEnemyMode && item.isEnemyItem) || (this.isEnemyMode && !item.isEnemyItem)) {
          // 敵装備フィルタ
          continue;
        }
        if (this.isStockOnly && !this.itemStock.find((v) => v.id === item.id)) {
          // 所持装備フィルタ
          continue;
        }
        items.push(item);
      }
      this.items = items.sort((a, b) => a.id - b.id);
    },
    async showShipList() {
      await (this.shipListDialog = true);
      (this.$refs.shipList as InstanceType<typeof ShipList>).initialize(false);
    },
    putShip(viewShip: ViewShip) {
      this.shipListDialog = false;
      this.ship = viewShip.ship;

      const all = this.$store.state.items as ItemMaster[];
      this.baseItems = all.filter((v) => ShipValidation.isValidItem(viewShip.ship, v));
      this.setItems();
    },
    removeShip() {
      this.ship = new ShipMaster();
      const all = this.$store.state.items as ItemMaster[];
      this.baseItems = all;
      this.setItems();
    },
    changeShipWidth(width: number) {
      this.shipDialogWidth = width;
    },
    closeDialog() {
      this.shipListDialog = false;
    },
    getWikiURL(item: ItemMaster) {
      return ItemMaster.getWikiURL(item);
    },
  },
});
</script>
