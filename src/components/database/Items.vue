<template>
  <div class="mt-3">
    <!-- <v-tabs v-model="tab">
      <v-tab href="#list">{{ $t("Database.一覧") }}</v-tab>
      <v-tab href="#analytics">{{ $t("Home.おまけ") }}</v-tab>
    </v-tabs>
    <v-divider class="mb-2" /> -->
    <v-tabs-items v-model="tab" :touchless="true">
      <v-tab-item value="list">
        <div class="d-flex align-center flex-wrap mt-2">
          <v-btn @click="filterDialog = true" color="info">
            <v-icon>mdi-filter-variant</v-icon>
            {{ $t("Common.絞り込み") }}
          </v-btn>
          <v-btn @click="resetFilterCondition()" text class="ml-1">
            {{ $t("Common.リセット") }}
          </v-btn>
          <div class="ml-2 caption d-none d-md-block text--secondary" v-if="!isNotJapanese">Ctrlキー + 装備をクリックでwikiを展開します。</div>
          <v-btn class="ml-auto" color="secondary" @click="showBlacklist()">
            <v-icon>mdi-skull-crossbones</v-icon>Blacklist ({{ $store.state.siteSetting.blacklistItemIds.length }})
          </v-btn>
        </div>
        <v-dialog v-model="filterDialog" transition="scroll-x-transition" width="800" @input="toggleFilterDialog">
          <v-card>
            <div class="d-flex pt-2 pb-1 px-2">
              <div class="align-self-center ml-3 body-2">{{ $t("Common.絞り込み") }}</div>
              <v-spacer />
              <v-btn class="mr-3 align-self-center" small text @click.stop="resetFilterCondition()">
                {{ $t("Common.リセット") }}
              </v-btn>
              <v-btn icon @click="closeFilterDialog()">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
            <v-divider class="mx-2" />
            <div class="filter-dialog-body pr-3">
              <div class="d-flex">
                <div class="caption">{{ $t("Database.基本条件") }}</div>
                <div class="header-divider" />
              </div>
              <div class="px-3 pt-2 d-flex flex-wrap align-center">
                <div class="keyword-input mr-5">
                  <v-text-field
                    dense
                    v-model.trim="searchWord"
                    hide-details
                    clearable
                    prepend-inner-icon="mdi-magnify"
                    :label="$t('ItemList.図鑑id 名称検索')"
                  />
                </div>
                <v-checkbox class="mr-5" dense hide-details v-model="onlyStock" :label="$t('Database.未所持装備非表示')" />
                <v-checkbox dense hide-details v-model="visibleAllCount" @change="changeVisibleAllCount()" :label="$t('Database.総所持数表示')" />
              </div>
              <div class="d-flex mt-4 align-center">
                <div class="caption">{{ $t("Database.カテゴリ") }}</div>
                <div class="header-divider" />
                <div class="pr-1 pl-3">
                  <v-btn small @click="toggleAllType()" outlined color="primary">
                    <v-icon small class="mr-1">mdi-check-all</v-icon> {{ $t("Database.一括チェック") }}
                  </v-btn>
                </div>
              </div>
              <div class="filter-input-container">
                <v-checkbox v-for="(item, i) in types" :key="`item${i}`" dense v-model="item.isChecked" :label="$t(`EType.${item.text}`)" hide-details />
              </div>
              <div class="d-flex mt-6">
                <div class="caption">{{ $t("Common.改修値") }}</div>
                <div class="header-divider" />
              </div>
              <div>
                <v-range-slider class="mt-4 px-3" v-model="remodelRange" dense thumb-label min="0" max="10" hide-details>
                  <template v-slot:prepend>
                    <v-text-field
                      :label="$t('Database.改修下限')"
                      type="number"
                      class="range-input"
                      :class="{ english: isNotJapanese }"
                      :max="remodelRange[1]"
                      min="0"
                      v-model="remodelRange[0]"
                      hide-details
                    />
                  </template>
                  <template v-slot:append>
                    <v-text-field
                      :label="$t('Database.改修上限')"
                      type="number"
                      class="range-input"
                      :class="{ english: isNotJapanese }"
                      max="10"
                      :min="remodelRange[0]"
                      v-model="remodelRange[1]"
                      hide-details
                    />
                  </template>
                </v-range-slider>
              </div>
            </div>
          </v-card>
        </v-dialog>
        <v-card class="my-3 pa-4" v-if="!viewItems.length">
          <div class="text-center my-10">
            <div>{{ $t("Common.探したけど見つからなかったよ") }}&#128546;</div>
          </div>
        </v-card>
        <div v-else class="item-all-container mt-3">
          <v-card class="py-1" v-for="(header, i) in viewItems" :key="i">
            <div class="ma-1 d-flex">
              <div class="type-img">
                <img :src="`./img/type/type${header.type.id}.png`" :alt="`type-${header.type.id}`" />
              </div>
              <div class="ml-1 align-self-center">{{ $t(`EType.${header.type.name}`) }}</div>
              <v-spacer />
              <div v-if="header.type.sortKey">
                <v-menu offset-y left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                      <v-icon>mdi-sort</v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <div
                      class="sort-key"
                      v-ripple="{ class: 'info--text' }"
                      @click="sortItems(header, 'id')"
                      :class="{ selected: header.selectedKey === 'id' }"
                      @keypress.enter="sortItems(header, 'id')"
                    >
                      {{ $t("Database.図鑑ID") }}
                    </div>
                    <div
                      v-for="(sortKey, j) in header.type.sortKey"
                      :key="`type${i}Key${j}`"
                      class="sort-key"
                      :class="{ selected: header.selectedKey === sortKey }"
                      v-ripple="{ class: 'info--text' }"
                      @click="sortItems(header, sortKey)"
                      @keypress.enter="sortItems(header, sortKey)"
                    >
                      {{ convertStatusString(sortKey) }}
                    </div>
                  </v-card>
                </v-menu>
              </div>
            </div>
            <v-divider />
            <div v-for="(itemRow, j) in header.items" :key="`${i}${j}`">
              <div
                class="item-container"
                :class="{ 'no-item': !itemRow.allCount }"
                v-ripple="{ class: 'info--text' }"
                @click="clickItem(itemRow.master, $event)"
                @keypress.enter="clickItem(itemRow.master, $event)"
                @mouseenter="bootTooltip(itemRow.master, $event)"
                @mouseleave="clearTooltip"
                @focus="clearTooltip"
                @blur="clearTooltip"
              >
                <div class="d-flex align-self-start flex-grow-1">
                  <div class="icon-img">
                    <img :src="`./img/type/icon${itemRow.master.iconTypeId}.png`" :alt="`icon-${itemRow.master.iconTypeId}`" />
                  </div>
                  <div class="item-name flex-grow-1">
                    {{ needTrans ? $t(`${itemRow.master.name}`) : itemRow.master.name }}
                  </div>
                </div>
                <div class="detail-container">
                  <div v-if="visibleAllCount && !remodelRange[0]" class="primary--text count-text">{{ itemRow.allCount }}</div>
                  <div class="d-flex remodel-container" v-for="(detail, k) in itemRow.details" :key="`${i}${j}${k}`">
                    <div class="item-remodel teal--text text--accent-4" v-if="detail.remodel">★{{ detail.remodel }}</div>
                    <div class="ml-auto">{{ detail.count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </div>
        <v-dialog v-model="editDialog" v-if="editedItem" transition="scroll-x-transition" width="600">
          <v-card class="pa-3">
            <div class="mx-2 mb-2">
              <div class="d-flex align-center">
                <div>
                  <v-img :src="`./img/type/icon${editedItem.iconTypeId}.png`" width="40" height="40" />
                </div>
                <div class="ml-1">
                  <div class="caption info--text">id {{ editedItem.id }}</div>
                  <div class="body-2">{{ needTrans ? $t(`${editedItem.name}`) : editedItem.name }}</div>
                </div>
              </div>
            </div>
            <v-divider />
            <div class="ma-3">
              <div class="caption">{{ $t("Database.所持数") }}</div>
              <div class="stock-inputs">
                <v-text-field
                  v-for="(value, i) in editedStock"
                  :key="`stock$${i}`"
                  class="stock-input"
                  type="number"
                  max="999"
                  min="0"
                  :label="`★+${i}`"
                  hide-details
                  :readonly="readOnly"
                  v-model.number="editedStock[i]"
                />
                <v-text-field class="stock-input" type="number" readonly v-model.number="sumStock" :label="$t('Fleet.合計')" />
              </div>
            </div>
            <v-divider class="mb-2" />
            <div class="d-flex">
              <v-btn class="ml-auto" color="success" :disabled="readOnly" @click.stop="commitStock">{{ $t("Common.更新") }}</v-btn>
              <v-btn class="ml-4" :disabled="!sumStock || readOnly" color="error" @click.stop="clearStock">{{ $t("Database.全破棄") }}</v-btn>
              <v-btn class="ml-4" color="secondary" @click.stop="editDialog = false">{{ $t("Common.戻る") }}</v-btn>
            </div>
          </v-card>
        </v-dialog>
        <v-dialog v-model="blacklistDialog" width="660">
          <blacklist-item-edit :handle-close="closeBlacklist" />
        </v-dialog>
      </v-tab-item>
    </v-tabs-items>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <item-tooltip v-model="tooltipItem" />
    </v-tooltip>
  </div>
</template>

<style scoped>
.filter-dialog-body {
  padding-top: 20px;
  padding-bottom: 30px;
  padding-left: 20px;
  overflow-y: auto;
  max-height: 70vh;
  overscroll-behavior: contain;
}

.keyword-input {
  width: 240px;
}
.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}
.range-input {
  margin-top: 0px;
  padding-top: 0px;
  width: 80px !important;
}
.range-input.english {
  width: 100px !important;
}
.filter-input-container {
  margin-left: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  align-items: center;
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
  .drawer-fixed .item-all-container {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
  .item-all-container {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
}
@media (min-width: 1680px) {
  .drawer-fixed .item-all-container {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
  .item-all-container {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  }
}
@media (min-width: 1960px) {
  .drawer-fixed .item-all-container {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  }
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
  background-color: rgb(220, 240, 255);
}
.theme--dark .item-container:hover {
  background-color: rgb(40, 60, 80);
}
.item-container.no-item {
  opacity: 0.6;
}
.type-img,
.type-img img {
  height: 30px;
  width: 30px;
}

.icon-img,
.icon-img img {
  height: 20px;
  width: 20px;
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
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(40, 40, 45, 1) 35%);
}
.item-container:hover .detail-container {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(220, 240, 255, 1) 35%);
}
.theme--dark .item-container:hover .detail-container {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(40, 60, 80, 1) 35%);
}

/** ダークテーマ[深海]対応 */
.deep-sea .theme--dark .item-all-container .v-card {
  background-color: rgb(30, 38, 50) !important;
}
.deep-sea .theme--dark .detail-container {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), rgb(30, 38, 50) 35%);
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

.sort-key {
  cursor: pointer;
  font-size: 0.9em;
  padding: 0.5rem 2rem 0.5rem 1rem;
}
.sort-key:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.sort-key.selected {
  background-color: rgba(32, 148, 243, 0.2);
}

.stock-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  column-gap: 1rem;
  row-gap: 1.5rem;
}
</style>

<script lang="ts">
import Vue from 'vue';
import sum from 'lodash/sum';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import BlacklistItemEdit from '@/components/item/BlacklistItemEdit.vue';
import Const from '@/classes/const';
import ItemStock from '@/classes/item/itemStock';
import ItemMaster from '@/classes/item/itemMaster';
import Item from '@/classes/item/item';
import Convert from '@/classes/convert';
import SiteSetting from '@/classes/siteSetting';

interface ItemRowDetailData {
  remodel: number;
  count: number;
}

interface ItemRow {
  master: ItemMaster;
  allCount: number;
  details: ItemRowDetailData[];
}

interface ItemHeader {
  type: { id: number; name: string };
  items: ItemRow[];
  selectedKey: string;
}

export default Vue.extend({
  name: 'ItemsComponent',
  components: { ItemTooltip, BlacklistItemEdit },
  data: () => ({
    tab: 'list',
    filterDialog: false,
    all: [] as ItemMaster[],
    itemStock: [] as ItemStock[],
    searchWord: '' as string | undefined,
    onlyStock: false,
    visibleAllCount: false,
    remodelRange: [0, 10],
    types: [] as { text: string; value: number; isChecked: boolean }[],
    baseViewItems: [] as ItemHeader[],
    viewItems: [] as ItemHeader[],
    editDialog: false,
    editedItem: undefined as ItemMaster | undefined,
    editedStock: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    unsubscribe: undefined as unknown,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipX: 0,
    tooltipY: 0,
    readOnly: false,
    blacklistDialog: false,
  }),
  mounted() {
    if (this.$store.getters.getExistsTempStock) {
      this.readOnly = true;
    }

    const setting = this.$store.state.siteSetting as SiteSetting;
    this.visibleAllCount = setting.visibleItemStockAllCount;

    this.initialize();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setItemStock') {
        this.itemStock = state.itemStock as ItemStock[];
        this.masterFilter();
        this.editDialog = false;
      }
    });
  },
  watch: {
    completed(value) {
      if (value && !this.all.length) {
        this.initialize();
      }
    },
    isTempStockMode(value) {
      this.readOnly = !!value;
      this.initialize();
    },
    tab(value) {
      if (value === 'analytics') {
        //
      }
    },
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
    },
    sumStock(): number {
      return sum(this.editedStock);
    },
    convertStatusString() {
      return (value: string) => {
        const str = Convert.convertAttributeString(value);
        return this.isNotJapanese ? `${this.$t(`Common.${str}`)}` : str;
      };
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
      this.all = this.$store.state.items as ItemMaster[];
      this.all = this.all.filter((v) => !v.isEnemyItem);
      this.itemStock = this.$store.state.itemStock as ItemStock[];

      if (this.readOnly) {
        // 閲覧モード
        this.itemStock = this.$store.state.tempItemStock as ItemStock[];
      }

      // 種別セレクト初期化
      const masters = Const.ITEM_TYPES_ALT;
      this.types = [];
      for (let i = 0; i < masters.length; i += 1) {
        this.types.push({ text: masters[i].text, value: i, isChecked: true });
      }

      this.masterFilter();
    },
    masterFilter() {
      // カテゴリ検索
      const selectedTypes = this.types.filter((v) => v.isChecked).map((v) => v.value);
      const types = Const.ITEM_TYPES_ALT.filter((v, i) => selectedTypes.includes(i))
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
        viewItems.push({ type, items: rows, selectedKey: 'id' });
      }

      this.baseViewItems = viewItems;
      this.filter();
    },
    closeFilterDialog() {
      this.filterDialog = false;
      this.masterFilter();
    },
    toggleFilterDialog() {
      if (!this.filterDialog) {
        // 検索かける
        this.masterFilter();
      }
    },
    resetFilterCondition() {
      this.searchWord = '';
      this.remodelRange = [0, 10];
      this.onlyStock = false;

      for (let i = 0; i < this.types.length; i += 1) {
        this.types[i].isChecked = true;
      }

      this.masterFilter();
    },
    filter() {
      const bases = this.baseViewItems;
      const result = [];
      const minRemodel = this.remodelRange[0];
      const maxRemodel = this.remodelRange[1];
      const keyWord = this.searchWord ? this.searchWord.toUpperCase() : '';

      for (let i = 0; i < bases.length; i += 1) {
        const { items } = bases[i];

        const viewRow = { type: bases[i].type, items: [] as ItemRow[], selectedKey: 'id' };
        for (let j = 0; j < items.length; j += 1) {
          const { master, details, allCount } = items[j];

          // 検索語句で絞り込み
          if (keyWord && master.id !== +keyWord && master.name.toUpperCase().indexOf(keyWord) === -1) {
            continue;
          }
          // 改修値で絞り込み
          const filteredItems = details.filter((v) => v.remodel >= minRemodel && v.remodel <= maxRemodel);

          if (filteredItems.length) {
            viewRow.items.push({ master, details: filteredItems, allCount: sum(filteredItems.map((v) => v.count)) });
          } else if (minRemodel === 0 && allCount === 0 && !this.onlyStock) {
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
      // いずれか1つでも未チェックがあれば全チェック => 全チェック状態だった場合のみチェックを解除ということ。
      const checked = this.types.some((v) => !v.isChecked);
      for (let i = 0; i < this.types.length; i += 1) {
        this.types[i].isChecked = checked;
      }
    },
    sortItems(header: ItemHeader, key: string) {
      header.selectedKey = key;
      const items = header.items as unknown as { master: { [key: string]: number } }[];
      if (key === 'id' || key === 'cost') {
        items.sort((a, b) => a.master[key] - b.master[key]);
      } else {
        items.sort((a, b) => b.master[key] - a.master[key]);
      }
    },
    clickItem(master: ItemMaster, event?: MouseEvent) {
      this.clearTooltip();

      if (event && event.ctrlKey && master && !master.isEnemyItem) {
        let wikiURL = `https://wikiwiki.jp/kancolle/${encodeURI(master.name.replaceAll('/', '／').replaceAll('+', '＋').replaceAll('&', '＆'))}`;
        if (master.id === 144) {
          wikiURL = `https://wikiwiki.jp/kancolle/${encodeURI('天山(村田隊)')}`;
        }
        if (master.id === 303) {
          wikiURL = `https://wikiwiki.jp/kancolle/${encodeURI('Bofors15.2cm連装砲 Model1930')}`;
        }
        window.open(wikiURL);
        return;
      }

      this.editDialog = true;
      this.editedItem = master;

      // 所持数状況を読み込み
      const stock = this.itemStock.find((v) => v.id === master.id);
      if (stock) {
        this.editedStock = stock.num;
      } else {
        this.editedStock = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      }
    },
    clearStock() {
      this.editedStock = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    },
    commitStock() {
      if (this.editedItem) {
        const itemId = this.editedItem.id;
        const stock = this.itemStock.find((v) => v.id === itemId);

        if (stock) {
          stock.num = this.editedStock;
        } else {
          const newData = new ItemStock(itemId);
          newData.num = this.editedStock;
          this.itemStock.push(newData);
        }

        this.$store.dispatch('updateItemStock', this.itemStock);
        this.masterFilter();
        this.editDialog = false;
        window.setTimeout(() => {
          this.editedItem = undefined;
        }, 100);
      }
    },
    bootTooltip(item: ItemMaster, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (!item.id || setting.disabledItemTooltip) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width / 3;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = new Item({ master: item });
        this.enabledTooltip = true;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
    changeVisibleAllCount() {
      // 設定書き換え
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.visibleItemStockAllCount = this.visibleAllCount;
      this.$store.dispatch('updateSetting', setting);
    },
    showBlacklist() {
      this.blacklistDialog = true;
    },
    closeBlacklist() {
      this.blacklistDialog = false;
    },
  },
});
</script>
