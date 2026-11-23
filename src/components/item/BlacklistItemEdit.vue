<template>
  <v-card class="blacklist-card">
    <div class="blacklist-header">
      <div class="blacklist-heading">
        <div class="blacklist-title">{{ $t("ItemList.ブラックリスト") }}</div>
        <div class="blacklist-hint">{{ $t("ItemList.ブラックリストに登録された装備は、装備一覧画面にて表示されなくなります。") }}</div>
      </div>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <div class="blacklist-body">
      <section class="pane hidden-pane">
        <div class="pane-head">
          <span>{{ $t("ItemList.ブラックリスト") }}</span>
          <span class="pane-count">{{ hiddenItems.length }}</span>
          <button v-if="hiddenItems.length" type="button" class="text-action" @click="removeAll">
            {{ $t("ItemList.すべて解除") }}
          </button>
        </div>
        <div v-if="!hiddenItems.length" class="pane-empty">{{ $t("ItemList.まだ隠している装備はありません") }}</div>
        <div v-else class="pane-list">
          <div v-for="item in hiddenItems" :key="`hidden-${item.id}`" class="item-row">
            <v-img v-if="item.iconTypeId" class="item-icon" :src="`./img/type/icon${item.iconTypeId}.png`" height="28" width="28" />
            <div class="item-text">
              <div class="item-id">id {{ item.id }}</div>
              <div class="item-name" :class="{ 'is-special': item.isSpecial }">{{ itemName(item) }}</div>
            </div>
            <button type="button" class="row-action" @click="toggleId(item.id)">{{ $t("ItemList.一覧に戻す") }}</button>
          </div>
        </div>
      </section>
      <section class="pane browse-pane">
        <div class="browse-tools">
          <div class="item-search-text">
            <v-text-field :placeholder="$t('ItemList.図鑑id 名称検索')" clearable v-model="keyword" @input="filter()" hide-details
              dense prepend-inner-icon="mdi-magnify" />
          </div>
        </div>
        <div class="type-selector-container">
          <button
            v-for="category in types"
            :key="category.id"
            type="button"
            class="type-selector"
            :class="{ active: type === category.id && !keyword, disabled: !!keyword }"
            :title="$t(`EType.${category.text}`)"
            @click="changeType(category.id)"
          >
            <v-img class="type-icon" :src="`./img/type/type${category.id}.png`" height="28" width="28" />
          </button>
        </div>
        <div v-if="!items.length" class="pane-empty">{{ browseEmptyText }}</div>
        <div v-else class="pane-list">
          <div
            v-for="item in items"
            :key="`browse-${item.data.id}`"
            class="item-row"
            :class="{ 'is-hidden': isHidden(item.data.id) }"
          >
            <v-img v-if="item.data.iconTypeId" class="item-icon" :src="`./img/type/icon${item.data.iconTypeId}.png`" height="28" width="28" />
            <div class="item-text">
              <div class="item-id">id {{ item.data.id }}</div>
              <div class="item-name" :class="{ 'is-special': item.data.isSpecial }">{{ itemName(item.data) }}</div>
            </div>
            <button type="button" class="row-action" :class="{ restore: isHidden(item.data.id) }" @click="toggleId(item.data.id)">
              {{ isHidden(item.data.id) ? $t("ItemList.一覧に戻す") : $t("ItemList.隠す") }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </v-card>
</template>

<style scoped>
.blacklist-card {
  --accent: #14b8a6;
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100%;
}

.blacklist-header {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 4px 8px 16px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.28);
}

.blacklist-heading {
  flex: 1;
  min-width: 0;
  padding-top: 8px;
}

.blacklist-header >>> .v-btn {
  flex: 0 0 auto;
  margin: 0;
}

.blacklist-title {
  font-size: 15px;
  line-height: 1.4;
}

.blacklist-hint {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.62;
}

.blacklist-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.hidden-pane {
  flex: 0 1 auto;
  border-bottom: 1px solid rgba(128, 128, 128, 0.28);
}

.hidden-pane .pane-list {
  max-height: 28vh;
}

.browse-pane {
  flex: 1;
}

.pane-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 0;
  font-size: 12px;
  letter-spacing: 0.04em;
  opacity: 0.72;
}

.pane-count {
  font-variant-numeric: tabular-nums;
}

.text-action {
  margin-left: auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 12px;
  opacity: 0.8;
  cursor: pointer;
}

.text-action:hover {
  opacity: 1;
}

.browse-tools {
  padding: 8px 12px 0;
}

.item-search-text {
  width: 100%;
}

.item-search-text >>> .v-input {
  margin-top: 0;
  padding-top: 0;
}

.item-search-text >>> .v-input__slot {
  margin-bottom: 0;
  min-height: 32px !important;
  padding: 0 10px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 16px;
}

.item-search-text >>> .v-input__slot::before,
.item-search-text >>> .v-input__slot::after {
  border-style: none !important;
}

.item-search-text >>> .v-input__prepend-inner,
.item-search-text >>> .v-input__append-inner {
  margin-top: 0 !important;
  align-self: center;
}

.item-search-text >>> input {
  font-size: 12px;
}

.item-search-text >>> .v-icon {
  font-size: 16px !important;
  height: 16px;
  width: 16px;
}

.type-selector-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 2px;
  padding: 6px 12px 2px;
  overflow-x: auto;
  scrollbar-width: none;
}

.type-selector-container::-webkit-scrollbar {
  display: none;
}

.type-selector {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 34px;
  min-width: 36px;
  padding: 0 3px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.type-selector:hover {
  background-color: color-mix(in srgb, var(--accent) 12%, transparent);
}

.type-selector.active {
  border-color: color-mix(in srgb, var(--accent) 55%, transparent);
  background-color: color-mix(in srgb, var(--accent) 14%, transparent);
}

.type-selector.disabled {
  background-color: transparent;
  opacity: 0.4;
  pointer-events: none;
}

.pane-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 8px 12px;
}

.pane-empty {
  padding: 20px 16px;
  font-size: 12px;
  line-height: 1.6;
  opacity: 0.55;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.16s ease;
}

.item-row:hover {
  background: rgba(128, 128, 128, 0.14);
}

.item-row.is-hidden {
  background: rgba(128, 128, 128, 0.1);
}

.item-row.is-hidden:hover {
  background: rgba(128, 128, 128, 0.2);
}

.item-icon {
  flex: 0 0 28px;
}

.item-text {
  flex: 1;
  min-width: 0;
}

.item-id {
  font-size: 11px;
  line-height: 1.3;
  opacity: 0.5;
}

.item-name {
  overflow: hidden;
  font-size: 13px;
  line-height: 1.35;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.is-special {
  color: #3cac42;
}

.theme--dark .is-special {
  color: #66bb6a;
}

.row-action {
  flex: 0 0 auto;
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 13px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.row-action:hover {
  background: rgba(128, 128, 128, 0.14);
}

.row-action.restore {
  opacity: 0.72;
}

@media (min-width: 600px) {
  .blacklist-card {
    height: 72vh;
  }

  .blacklist-body {
    display: grid;
    grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
  }

  .hidden-pane {
    flex: none;
    border-right: 1px solid rgba(128, 128, 128, 0.28);
    border-bottom: 0;
  }

  .hidden-pane .pane-list {
    max-height: none;
  }

  .type-selector-container {
    flex-wrap: wrap;
    overflow-x: visible;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemMaster from '@/classes/item/itemMaster';
import SiteSetting from '@/classes/siteSetting';
import Const from '@/classes/const';

type BrowseItem = { data: ItemMaster; isBlacklisted: boolean };

export default Vue.extend({
  name: 'BlacklistItemEdit',
  props: {
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    all: [] as ItemMaster[],
    types: Const.ITEM_TYPES_ALT,
    type: 47,
    items: [] as BrowseItem[],
    keyword: '' as string | null,
    blacklists: [] as number[],
  }),
  mounted() {
    const setting = this.$store.state.siteSetting as SiteSetting;
    this.blacklists = setting.blacklistItemIds.concat();

    const items = this.$store.state.items as ItemMaster[];
    for (let i = 0; i < items.length; i += 1) {
      if (!items[i].isEnemyItem) {
        this.all.push(items[i]);
      }
    }
    this.all.sort((a, b) => a.id - b.id);
    this.filter();
  },
  computed: {
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    hiddenItems(): ItemMaster[] {
      const byId = new Map(this.all.map((item) => [item.id, item]));
      return this.blacklists.map((id) => byId.get(id)).filter((item): item is ItemMaster => !!item);
    },
    browseEmptyText(): string {
      return `${this.$t('Common.探したけど見つからなかったよ')}`;
    },
  },
  methods: {
    itemName(data: ItemMaster): string {
      return this.needTrans ? `${this.$t(data.name)}` : data.name;
    },
    isHidden(id: number): boolean {
      return this.blacklists.includes(id);
    },
    changeType(type: number) {
      this.type = type;
      this.filter();
    },
    filter() {
      const word = (this.keyword || '').toUpperCase();
      let list = this.all;
      if (word) {
        list = list.filter((item) => item.id === +word || item.name.toUpperCase().indexOf(word) >= 0);
      } else if (this.type) {
        const selected = this.types.find((type) => type.id === this.type);
        if (selected) list = list.filter((item) => selected.types.includes(item.apiTypeId));
      }
      const hidden = new Set(this.blacklists);
      this.items = list.map((data) => ({ data, isBlacklisted: hidden.has(data.id) }));
    },
    toggleId(id: number) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      const exists = setting.blacklistItemIds.includes(id);
      setting.blacklistItemIds = exists
        ? setting.blacklistItemIds.filter((value) => value !== id)
        : setting.blacklistItemIds.concat(id);
      this.blacklists = setting.blacklistItemIds.concat();
      const row = this.items.find((item) => item.data.id === id);
      if (row) row.isBlacklisted = !exists;
      this.$store.dispatch('updateSetting', setting);
    },
    removeAll() {
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.blacklistItemIds = [];
      this.blacklists = [];
      this.items.forEach((item) => {
        item.isBlacklisted = false;
      });
      this.$store.dispatch('updateSetting', setting);
    },
    close() {
      this.handleClose();
    },
  },
});
</script>
