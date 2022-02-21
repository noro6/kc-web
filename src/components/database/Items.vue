<template>
  <div class="mt-3 ships-page">
    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-header class="px-4">
          <div><v-icon>mdi-filter</v-icon>フィルタ</div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-divider class="mb-3"></v-divider>
          <div class="range-inputs">
            <div class="d-flex my-4">
              <v-text-field
                class="search-input"
                label="id 名称検索"
                dense
                v-model.trim="searchWord"
                @input="filter"
                clearable
                hide-details
                prepend-inner-icon="mdi-magnify"
              ></v-text-field>
              <v-checkbox class="mx-2" dense v-model="onlyStock" @change="filter" label="未所持装備非表示"></v-checkbox>
              <v-checkbox class="mx-2" dense v-model="onlyNoStock" @change="filter" label="未所持装備のみ"></v-checkbox>
            </div>
            <div class="d-flex my-4">
              <div class="range-input">
                <v-text-field
                  label="改修下限"
                  type="number"
                  :max="remodelRange[1]"
                  min="0"
                  dense
                  v-model.trim="remodelRange[0]"
                  hide-details
                  @input="filter"
                ></v-text-field>
              </div>
              <v-range-slider
                v-model="remodelRange"
                dense
                thumb-label
                min="0"
                max="10"
                hide-details
                class="pt-2 align-center mx-2"
                @change="filter"
              >
              </v-range-slider>
              <div class="range-input">
                <v-text-field
                  label="改修上限"
                  type="number"
                  max="10"
                  :min="remodelRange[0]"
                  dense
                  v-model.trim="remodelRange[1]"
                  hide-details
                  @input="filter"
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
            label="カテゴリ"
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
          <div>
            <v-checkbox class="mx-2" dense v-model="visibleAllCount" label="総所持数表示"></v-checkbox>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-card class="my-3 pa-4" v-if="!viewItems.length">
      <div class="text-center my-10">
        <div>みつからないよ</div>
      </div>
    </v-card>
    <div v-else class="item-all-container mt-3">
      <v-card class="py-1" v-for="(header, i) in viewItems" :key="i">
        <div class="ma-1 d-flex">
          <div>
            <v-img :src="`./img/type/type${header.type.id}.png`" height="24" width="24"></v-img>
          </div>
          <div class="ml-1 align-self-center">{{ header.type.name }}</div>
        </div>
        <v-divider></v-divider>
        <div v-for="(itemRow, j) in header.items" :key="`${i}${j}`">
          <div
            class="item-container"
            :class="{ 'no-item': !itemRow.allCount }"
            v-ripple="{ class: 'yellow--text' }"
            @mouseenter="bootTooltip(itemRow.master, $event)"
            @mouseleave="clearTooltip"
          >
            <div class="d-flex align-self-start flex-grow-1">
              <div>
                <v-img :src="`./img/type/icon${itemRow.master.iconTypeId}.png`" height="20" width="20"></v-img>
              </div>
              <div class="item-name flex-grow-1">{{ itemRow.master.name }}</div>
            </div>
            <div class="detail-container">
              <div v-if="visibleAllCount" class="primary--text count-text">{{ itemRow.allCount }}</div>
              <div class="d-flex remodel-container" v-for="(detail, k) in itemRow.details" :key="`${i}${j}${k}`">
                <div class="item-remodel teal--text text--accent-4" v-if="detail.remodel">★{{ detail.remodel }}</div>
                <div class="ml-auto">{{ detail.count }}</div>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </div>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="600">
      <v-card class="pa-3">
        <div class="mx-2 mt-2"></div>
      </v-card>
    </v-dialog>
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
  </div>
</template>

<style scoped>
.v-expansion-panels {
  z-index: 2;
}
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
@media (min-width: 1000px) {
  .range-inputs {
    grid-template-columns: 1fr 1fr;
    column-gap: 1rem;
  }
}

.item-all-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 0.5rem;
  row-gap: 0.5rem;
}
@media (min-width: 840px) {
  .item-all-container {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1120px) {
  .item-all-container {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}
@media (min-width: 1400px) {
  .item-all-container {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
}
@media (min-width: 1680px) {
  .item-all-container {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  }
}
@media (min-width: 1960px) {
  .item-all-container {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  }
}

.item-container {
  display: flex;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
  position: relative;
  margin: 0 0.25rem;
  padding: 0.25rem 0;
  overflow: hidden;
  cursor: pointer;
}
.item-container:hover {
  background-color: rgb(255, 255, 240);
}
.theme--dark .item-container:hover {
  background-color: rgb(40, 40, 25);
}
.item-container.no-item {
  opacity: 0.6;
}

.item-name {
  padding-left: 0.25rem;
  font-size: 0.85em;
  align-self: center;
  width: 10px;
  white-space: nowrap;
}
.detail-container {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(255, 255, 255, 1) 35%);
  padding-left: 20px;
  padding-right: 4px;
  text-align: right;
  font-size: 0.8em;
}
.theme--dark .detail-container {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(25, 25, 28, 1) 35%);
}
.item-container:hover .detail-container {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(255, 255, 240, 1) 35%);
}
.theme--dark .item-container:hover .detail-container {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(40, 40, 25, 1) 35%);
}

.detail-container > div {
  min-height: 20px;
}

.remodel-container:not(:last-child) {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.item-remodel {
  margin-right: 0.5rem;
  width: 32px;
  text-align: left;
}
.remodel-container div {
  padding-bottom: 0.15rem;
}
</style>

<script lang="ts">
import Vue from 'vue';
import * as _ from 'lodash';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import Const from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import ItemMaster from '@/classes/item/itemMaster';
import Item from '@/classes/item/item';

interface ItemRowDetailData {
  remodel: number;
  count: number;
}

interface ItemRow {
  master: ItemMaster;
  allCount: number;
  details: ItemRowDetailData[];
}

export default Vue.extend({
  name: 'Items',
  components: { ItemTooltip },
  data: () => ({
    all: [] as ItemMaster[],
    itemStock: [] as ItemStock[],
    searchWord: '',
    onlyStock: false,
    onlyNoStock: false,
    visibleAllCount: true,
    remodelRange: [0, 10],
    selectedTypes: [] as number[],
    types: [] as { text: string; value: number }[],
    baseViewItems: [] as { type: { id: number; name: string }; items: ItemRow[] }[],
    viewItems: [] as { type: { id: number; name: string }; items: ItemRow[] }[],
    editDialog: false,
    unsbscribe: undefined as unknown,
    setting: new SiteSetting(),
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  mounted() {
    // 全データ取得
    this.all = this.$store.state.items as ItemMaster[];
    this.all = this.all.filter((v) => v.id < 500);
    this.itemStock = this.$store.state.itemStock as ItemStock[];

    // 種別セレクト初期化
    const masters = Const.ITEM_TYPES_ALT;
    for (let i = 0; i < masters.length; i += 1) {
      this.types.push({ text: masters[i].text, value: i });
      this.selectedTypes.push(i);
    }

    this.unsbscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'updateItemStock') {
        this.itemStock = state.itemStock as ItemStock[];
        this.editDialog = false;
      }
    });
    this.setting = this.$store.state.siteSetting as SiteSetting;

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
  },
  beforeDestroy() {
    if (this.unsbscribe) {
      (this.unsbscribe as () => void)();
    }
  },
  methods: {
    masterFilter() {
      // カテゴリ検索
      const typeIndexs = this.selectedTypes;
      const types = Const.ITEM_TYPES_ALT.filter((v, i) => typeIndexs.includes(i))
        .map((v) => v.types)
        .flat();

      const allItems = this.all;
      const allTypes = Const.ITEM_API_TYPE.filter((v) => types.includes(v.id));
      const viewItems = [];
      for (let i = 0; i < allTypes.length; i += 1) {
        const type = allTypes[i];
        const masters = allItems.filter((v) => v.apiTypeId === type.id);
        const rows = [];
        for (let j = 0; j < masters.length; j += 1) {
          const master = masters[j];
          const itemRow: ItemRow = { master, allCount: 0, details: [] };
          const details: ItemRowDetailData[] = [];
          let sumCount = 0;
          // 所持品検索
          const stock = this.itemStock.find((v) => v.id === master.id);
          for (let remodel = 10; remodel >= 0; remodel -= 1) {
            const count = stock ? stock.num[remodel] : 0;
            if (count) {
              details.push({ remodel, count });
              sumCount += count;
            }
          }

          itemRow.details = details;
          itemRow.allCount = sumCount;
          rows.push(itemRow);
        }
        viewItems.push({ type, items: rows });
      }

      this.baseViewItems = viewItems;
      this.filter();
    },
    filter() {
      const bases = this.baseViewItems;
      const result = [];
      const minRemodel = this.remodelRange[0];
      const maxRemodel = this.remodelRange[1];

      for (let i = 0; i < bases.length; i += 1) {
        const { items } = bases[i];

        const viewRow = { type: bases[i].type, items: [] as ItemRow[] };
        for (let j = 0; j < items.length; j += 1) {
          const { master, details, allCount } = items[j];
          // 改修値で絞り込み
          const filteredItems = details.filter((v) => v.remodel >= minRemodel && v.remodel <= maxRemodel);

          if (filteredItems.length) {
            viewRow.items.push({ master, details: filteredItems, allCount: _.sum(filteredItems.map((v) => v.count)) });
          } else if (minRemodel === 0 && allCount === 0) {
            // 元から0ならそのまま投入
            viewRow.items.push(items[j]);
          }
        }

        if (viewRow.items.length) {
          result.push(viewRow);
        }
      }

      this.viewItems = result;
    },
    toggleAllType() {
      this.$nextTick(() => {
        if (this.selectedAllType) {
          this.selectedTypes = [];
          this.masterFilter();
        } else {
          this.selectedTypes = this.types.map((v) => v.value).slice();
          this.masterFilter();
        }
      });
    },
    bootTooltip(item: ItemMaster, e: MouseEvent) {
      if (!item.id) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      this.tooltipTimer = setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width / 3;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = new Item({ master: item });
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
