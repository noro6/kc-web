<template>
  <aside class="detail-pane">
    <template v-if="list.detailItem">
      <div class="detail-head">
        <img v-if="list.detailItem.data.iconTypeId" class="detail-icon"
          :src="`./img/type/icon${list.detailItem.data.iconTypeId}.png`" width="36" height="36" alt="" />
        <div class="detail-title">
          <div class="detail-id-row">
            <span class="detail-id-space" aria-hidden="true">id {{ itemId }}</span>
            <span v-if="typeLabel" class="detail-type">{{ typeLabel }}</span>
          </div>
          <div class="detail-name">{{ itemName }}<span v-if="remodel > 0" class="detail-remodel">&nbsp;★+{{ remodel }}</span></div>
        </div>
      </div>
      <div v-if="specialTexts.length" class="detail-meta">
        <span v-for="text in specialTexts" :key="text" class="item-special-text"
          :class="list.specialTextColorByText(text)">{{ text }}</span>
      </div>
      <item-tooltip v-model="list.detailItem" :bonus="list.detailBonus" :is-airbase-mode="list.isAirbaseMode" show-zero />
      <div class="detail-actions">
        <button type="button" class="filter-chip" :disabled="!list.isAirbaseMode && !list.isShipMode"
          @click="list.compareDetail()">
          {{ $t("ItemList.装備比較") }}
        </button>
        <button type="button" class="filter-chip" :disabled="list.detailItem.data.isEnemyItem"
          @click="list.openWiki(list.detailItem.data)">
          {{ $t("ItemList.wikiを開く") }}
        </button>
      </div>
    </template>
    <div v-else class="detail-empty">{{ $t("ItemList.詳細プレースホルダ") }}</div>
  </aside>
</template>

<script lang="ts">
import Vue from 'vue';
import Const from '@/classes/const';
import ItemTooltip from '@/components/item/ItemTooltip.vue';

export default Vue.extend({
  name: 'ItemListDetailPane',
  components: { ItemTooltip },
  inject: ['itemList'],
  computed: {
    list(): Vue {
      return (this as unknown as { itemList: Vue }).itemList;
    },
    itemName(): string {
      const item = (this.list as Vue & { detailItem: { data: { name: string } }; needTrans: boolean }).detailItem;
      if (!item) return '';
      if ((this.list as Vue & { needTrans: boolean }).needTrans) return `${this.$t(item.data.name)}`;
      return item.data.name;
    },
    itemId(): number {
      const item = (this.list as Vue & { detailItem: { data: { id: number } } }).detailItem;
      return item && item.data.id ? item.data.id : 0;
    },
    specialTexts(): string[] {
      const view = (this.list as Vue & { detailView: { text: string[] } | null }).detailView;
      if (!view || !view.text.length || view.text[0] === 'Saury') return [];
      return view.text;
    },
    typeLabel(): string {
      const item = (this.list as Vue & { detailItem: { data: { apiTypeId: number } } }).detailItem;
      if (!item) return '';
      const found = Const.ITEM_API_TYPE.find((type) => type.id === item.data.apiTypeId);
      return found ? `${this.$t(`EType.${found.name}`)}` : '';
    },
    remodel(): number {
      const view = (this.list as Vue & { detailView: { remodel: number } | null }).detailView;
      if (view) return view.remodel;
      const item = (this.list as Vue & { detailItem: { remodel: number } }).detailItem;
      return item ? item.remodel : 0;
    },
  },
});
</script>

<style scoped>
.detail-pane {
  position: relative;
  flex: 0 0 268px;
  width: 268px;
  height: 65vh;
  padding: 12px;
  overflow-y: auto;
  border-left: 1px solid rgba(128, 128, 128, 0.35);
}

/** ツールチップ先頭の id だけ残し、アイコンと名前はこちらで描く */
.detail-pane >>> .dense > .d-flex:first-of-type {
  display: block !important;
  height: 0;
  overflow: visible;
  margin: 0 !important;
  padding: 0 !important;
}

.detail-pane >>> .dense,
.detail-pane >>> .dense > .d-flex:first-of-type,
.detail-pane >>> .dense > .d-flex:first-of-type > .flex-grow-1 {
  position: static !important;
}

.detail-pane >>> .dense > .d-flex:first-of-type .item-icon,
.detail-pane >>> .dense > .d-flex:first-of-type .body-2 {
  display: none !important;
}

.detail-pane >>> .item-id {
  position: absolute;
  top: 12px;
  left: 56px;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.detail-icon {
  flex: 0 0 36px !important;
  width: 36px !important;
  height: 36px !important;
  max-width: 36px !important;
}

.detail-title {
  min-width: 0;
}

.detail-id-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 16px;
  min-width: 0;
}

.detail-id-space {
  flex: 0 0 auto;
  visibility: hidden;
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  white-space: nowrap;
}

.detail-name {
  /** 1行と2行で下の性能が動かないよう、常に2行分を取る */
  min-height: calc(1.35em * 2);
  font-size: 13px;
  line-height: 1.35;
  font-weight: 400;
  overflow-wrap: anywhere;
}

.detail-type {
  min-width: 0;
  overflow: hidden;
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: 0.55;
}

.detail-remodel {
  color: #00bfa5;
  font-weight: 400;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.detail-pane >>> .item-name {
  flex: 1 1 auto;
  min-width: 0 !important;
  width: auto !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  overflow-wrap: anywhere;
  line-height: 1.35;
  font-size: 13px !important;
  font-weight: 400;
}

.detail-pane >>> .item-statuses {
  grid-template-columns: minmax(0, 1fr) auto !important;
  column-gap: 8px !important;
  row-gap: 2px;
}

.detail-pane >>> .item-statuses:not(.remodel-bonus):not(.sub-sub) {
  /** 値の幅を固定し、小数や射程表記で隣の列が左右に動かないようにする */
  grid-template-columns: minmax(0, 1fr) 46px minmax(0, 1fr) 46px !important;
  column-gap: 16px !important;
}

.detail-pane >>> .item-statuses > div:nth-child(odd):not(.no-status) {
  opacity: 0.62;
  font-weight: 400;
}

.detail-pane >>> .item-statuses > div:nth-child(even) {
  text-align: right;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.detail-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.detail-actions {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}

.detail-empty {
  padding: 24px 4px;
  font-size: 12px;
  line-height: 1.6;
  opacity: 0.6;
}

.item-special-text {
  flex-shrink: 0;
  margin-left: 4px;
  padding: 0 4px;
  min-width: 22px;
  border: 1px solid #2196F3;
  border-radius: 4px;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
}

.item-special-text.color-A3 { border-color: #2196F3; }
.item-special-text.color-C2 { border-color: #4CAF50; }
.item-special-text.color-A2 { border-color: #F44336; }
.item-special-text.color-C3 { border-color: #FF9800; }
.item-special-text.color-A1 { border-color: #3F51B5; }
.item-special-text.color-B1 { border-color: #009688; }
.item-special-text.color-B2 { border-color: #9C27B0; }
.item-special-text.color-B3 { border-color: #757575; }
.item-special-text.color-B4 { border-color: #535353; }

.filter-chip {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 13px;
  background-color: transparent;
  color: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.filter-chip:hover {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
}

.filter-chip:disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
