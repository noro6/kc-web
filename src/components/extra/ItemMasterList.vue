<template>
  <div>
    <v-card class="px-3">
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
        dense
        fixed-header
        height="44vh"
        multi-sort
        :headers="headers"
        :items="items"
        :search="keyword"
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
      </v-data-table>
    </v-card>
    <div class="mt-10 mb-3 mx-2 body-2">{{ $t("Extra.対空射撃回避機体一覧") }}</div>
    <v-card class="pa-3">
      <v-divider />
      <v-simple-table class="item-master-table" dense fixed-header height="70vh">
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
  margin-right: 0.5px;
  margin-left: 0.5px;
  cursor: pointer;
  transition: 0.2s;
}
.type-selector:hover {
  background-color: rgba(128, 200, 255, 0.2);
}
.type-selector.active {
  border-color: rgba(33, 150, 243, 0.6);
  background-color: rgba(33, 150, 243, 0.1);
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
