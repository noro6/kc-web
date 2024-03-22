<template>
  <v-card class="blacklist-card">
    <div class="d-flex pa-2">
      <v-checkbox :disabled="!!keyword" v-model="blacklistOnly" @change="filter()" hide-details dense :label="$t('ItemList.ブラックリスト登録済み装備')" />
      <v-spacer />
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider />
    <div class="px-1 px-sm-3 pt-3">
      <div class="body-2 mb-2 ml-2">{{ $t("ItemList.ブラックリストに登録された装備は、装備一覧画面にて表示されなくなります。") }}</div>
      <div class="input-field">
        <v-text-field
          :placeholder="$t('ItemList.図鑑id 名称検索')"
          clearable
          v-model="keyword"
          @input="filter()"
          hide-details
          dense
          prepend-inner-icon="mdi-magnify"
          :disabled="blacklistOnly"
        />
        <v-select
          dense
          v-model="type"
          hide-details
          :items="types"
          item-value="id"
          :item-text="(item) => $t('EType.' + item.text)"
          @input="filter()"
          :label="$t('Database.カテゴリ')"
          :disabled="blacklistOnly"
        ></v-select>
      </div>
      <v-divider class="mt-1" />
    </div>
    <div class="list-table px-1 px-sm-3">
      <v-simple-table dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="icon-td"></th>
              <th class="text-left">{{ $t("Common.装備名称") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in items"
              :key="`bl_item_${i}`"
              v-ripple
              :class="{ blacklisted: item.isBlacklisted }"
              @click="toggleBlacklisted(item)"
              @keypress="toggleBlacklisted(item)"
              @mouseenter="bootTooltip(item.data, $event)"
              @mouseleave="clearTooltip"
              @focus="bootTooltip(item.data, $event)"
              @blur="clearTooltip"
            >
              <td class="text-center">
                <v-icon v-if="item.isBlacklisted" color="grey">mdi-eye-off</v-icon>
              </td>
              <td class="item-name">
                <div class="d-flex align-center">
                  <div>
                    <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="30" width="30" />
                  </div>
                  <div class="ml-1">
                    <div class="info--text caption text-id">id {{ item.data.id }}</div>
                    <div class="text-name" :class="{ 'is-special': item.data.isSpecial }">
                      {{ needTrans ? $t(`${item.data.name}`) : item.data.name }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <v-divider />
    <div class="d-flex px-3 py-3">
      <v-spacer />
      <v-btn color="secondary" :dark="existsBlacklist" :disabled="!existsBlacklist" @click.stop="removeAll()" :block="isMobile">
        {{ $t("ItemList.全解除") }}
      </v-btn>
    </div>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <item-tooltip v-model="tooltipItem" />
    </v-tooltip>
  </v-card>
</template>

<style scoped>
.input-field {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 6px;
}
td,
th {
  padding-left: 8px !important;
  padding-right: 8px !important;
}

.icon-td {
  width: 50px;
}
.text-id {
  font-size: 12px;
  font-weight: bold;
}
.text-name {
  font-size: 12px;
}
.is-special {
  color: #3cac42;
}
.theme--dark .is-special {
  color: #66bb6a;
}

/** ブラックリストテーブル */
.v-data-table tbody tr:hover {
  cursor: pointer;
}

.blacklisted td > div {
  opacity: 0.4;
}

.blacklist-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.list-table {
  overflow-y: auto;
}
@media (min-width: 600px) {
  .blacklist-card {
    display: block;
    flex-direction: unset;
    height: unset;
  }
  .list-table {
    height: 65vh;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import ItemMaster from '@/classes/item/itemMaster';
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import SiteSetting from '@/classes/siteSetting';
import Const from '@/classes/const';
import Item from '@/classes/item/item';

export default Vue.extend({
  name: 'BlacklistItemEdit',
  components: { ItemTooltip },
  props: {
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    itemParent: undefined as undefined | Ship | Airbase | Enemy,
    all: [] as ItemMaster[],
    types: Const.ITEM_TYPES_ALT,
    type: 6,
    items: [] as { data: ItemMaster; isBlacklisted: boolean }[],
    keyword: '' as string | undefined,
    blacklistOnly: false,
    blacklists: [] as number[],
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipX: 0,
    tooltipY: 0,
    isMobile: true,
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
    this.all.sort((a, b) => a.apiTypeId - b.apiTypeId);

    this.filter();
  },
  computed: {
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    existsBlacklist(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return !!setting.blacklistItemIds.length;
    },
  },
  methods: {
    changeType(type = 0): void {
      this.type = type;
      this.filter();
    },
    filter() {
      this.isMobile = window.innerWidth < 600;
      this.items = [];

      const word = this.keyword ? this.keyword.toUpperCase() : '';
      if (word) {
        const typeItems = this.all.filter((v) => v.id === +word || v.name.toUpperCase().indexOf(word) >= 0);
        for (let i = 0; i < typeItems.length; i += 1) {
          const data = typeItems[i];
          this.items.push({ data, isBlacklisted: this.blacklists.includes(data.id) });
        }
        return;
      }

      if (this.blacklistOnly) {
        const typeItems = this.all.filter((v) => this.blacklists.includes(v.id));
        for (let i = 0; i < typeItems.length; i += 1) {
          this.items.push({ data: typeItems[i], isBlacklisted: true });
        }
        return;
      }

      const selectedType = this.types.find((v) => v.id === this.type);
      if (selectedType) {
        const typeItems = this.all.filter((v) => selectedType.types.includes(v.apiTypeId));
        for (let i = 0; i < typeItems.length; i += 1) {
          const data = typeItems[i];
          this.items.push({ data, isBlacklisted: this.blacklists.includes(data.id) });
        }
      }
    },
    toggleBlacklisted(item: { data: ItemMaster; isBlacklisted: boolean }) {
      // ブラックリストの更新
      const setting = this.$store.state.siteSetting as SiteSetting;
      item.isBlacklisted = !item.isBlacklisted;

      if (item.isBlacklisted) {
        setting.blacklistItemIds.push(item.data.id);
      } else {
        setting.blacklistItemIds = setting.blacklistItemIds.filter((v) => v !== item.data.id);
      }
      this.blacklists = setting.blacklistItemIds.concat();
      this.$store.dispatch('updateSetting', setting);
    },
    close() {
      this.handleClose();
    },
    removeAll() {
      // ブラックリスト全解除
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.blacklistItemIds = [];
      this.blacklists = [];
      this.blacklistOnly = false;
      this.$store.dispatch('updateSetting', setting);

      this.filter();
    },
    bootTooltip(item: ItemMaster, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledItemTooltip || window.innerWidth < 600) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width - 200;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = new Item({ master: item });
        this.enabledTooltip = true;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
