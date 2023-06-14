<template>
  <v-card>
    <div class="d-flex pt-2 pb-1 pr-2">
      <div class="align-self-center ml-3">{{ $t("ItemList.装備プリセット") }}</div>
      <v-spacer />
      <v-btn icon @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider />
    <div class="px-3">
      <div class="d-flex flex-wrap">
        <v-btn class="my-2 mr-2" color="teal" :dark="!disabledCommit" :disabled="disabledCommit" @click="readyPreset()">
          {{ $t("ItemList.現在の装備構成で新規登録") }}
        </v-btn>
        <v-btn class="my-2" color="primary" :disabled="disabledCommit || isPresetItemEmpty" @click="overwritePreset()">
          {{ $t("ItemList.現在の装備構成で上書き") }}
        </v-btn>
      </div>
      <v-divider />
      <div class="preset-container py-1">
        <div class="preset-list">
          <draggable handle=".preset-id" animation="150" @end="sortEnd()" v-model="presets">
            <div
              v-for="(preset, i) in presets"
              :key="`preset${i}`"
              class="preset-item"
              :class="{ selected: i === selectedIndex }"
              v-ripple="{ class: 'info--text' }"
              @click="clickedPreset(preset.id)"
              @dblclick="expandPreset()"
              @keypress.enter="clickedPreset(preset.id)"
              tabindex="0"
            >
              <div class="preset-id primary--text">{{ preset.id }}.</div>
              <div class="preset-name text-truncate">{{ preset.name }}</div>
            </div>
          </draggable>
        </div>
        <div class="preset-view pl-2">
          <div class="mt-5 d-flex align-center" v-if="!isPresetItemEmpty">
            <v-text-field :label="$t('ItemList.名称')" outlined v-model.trim="selectedPreset.name" clearable dense maxlength="100" hide-details />
            <v-btn class="ml-2" color="success" :disabled="!selectedPreset.name" @click="savePreset()">
              {{ selectedIndex >= 0 ? $t("Common.更新") : $t("Common.保存") }}
            </v-btn>
          </div>
          <div class="items-container pa-2 mt-2" v-if="!isPresetItemEmpty">
            <div v-for="(item, i) in itemView" :key="`view${i}`" class="d-flex align-center">
              <div v-if="item.data.iconTypeId">
                <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" width="30" height="30" />
              </div>
              <div class="ml-1 text-truncate preset-item-name">{{ needTrans ? $t(`${item.data.name}`) : item.data.name }}</div>
              <div class="ml-1 d-flex align-center" v-if="item.remodel">
                <v-icon small color="teal accent-4">mdi-star</v-icon>
                <div class="remodel-text">{{ item.remodel }}</div>
              </div>
            </div>
            <div v-if="exItemView.data.id" class="mt-2 d-flex ml-1">
              <div class="caption">{{ $t("ItemList.補強増設") }}</div>
              <div class="divider-line"></div>
            </div>
            <div v-if="exItemView.data.id" class="d-flex align-center">
              <div v-if="exItemView.data.iconTypeId">
                <v-img :src="`./img/type/icon${exItemView.data.iconTypeId}.png`" width="30" height="30" />
              </div>
              <div class="ml-1 text-truncate preset-item-name">{{ needTrans ? $t(`${exItemView.data.name}`) : exItemView.data.name }}</div>
              <div class="ml-1 d-flex align-center" v-if="exItemView.remodel">
                <v-icon small color="teal accent-4">mdi-star</v-icon>
                <div class="remodel-text">{{ exItemView.remodel }}</div>
              </div>
            </div>
          </div>
          <div class="d-flex my-3 justify-end" v-if="!isPresetItemEmpty">
            <v-btn v-if="selectedIndex >= 0" color="primary" @click="expandPreset()">{{ $t("Common.展開") }}</v-btn>
            <v-btn class="ml-2" color="error" :disabled="selectedIndex < 0" @click="deletePreset()">{{ $t("Common.削除") }}</v-btn>
          </div>
        </div>
      </div>
    </div>
    <v-snackbar v-model="snackbar" color="success" :top="snackbar">
      {{ infoText ? $t(`ItemList.${infoText}`) : infoText }}
      <template v-slot:action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="snackbar = false"><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<style scoped>
.preset-container {
  display: grid;
  grid-template-columns: 50% 50%;
}

.preset-list {
  height: 60vh;
  overflow-y: scroll;
}
.preset-item {
  display: flex;
  cursor: pointer;
  padding: 0.4rem 0;
  border: 1px solid transparent;
  border-radius: 0.2rem;
}
.preset-item:hover {
  background-color: rgba(0, 164, 255, 0.1);
}
.preset-item.selected {
  background-color: rgba(0, 164, 255, 0.1);
  border-color: rgba(0, 164, 255, 0.6);
}
.preset-id {
  cursor: move !important;
  width: 28px;
  text-align: right;
  font-size: 0.75em;
}
.preset-name {
  width: 10;
  flex-grow: 1;
  margin-left: 0.5rem;
  font-size: 0.8em;
}

.items-container {
  border: 1px solid rgba(128, 128, 128, 0.5);
  border-radius: 0.25rem;
}

.divider-line {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.preset-item-name {
  flex-grow: 1;
  width: 10px;
  font-size: 0.8em;
}
.remodel-text {
  color: #00bfa5;
  font-size: 0.8em;
  width: 16px;
  white-space: nowrap;
}
</style>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import max from 'lodash/max';
import cloneDeep from 'lodash/cloneDeep';
import Ship from '@/classes/fleet/ship';
import ItemPreset, { OldItemPreset } from '@/classes/item/itemPreset';
import ItemMaster from '@/classes/item/itemMaster';
import Optimizer from '@/classes/fleet/optimizer';
import Airbase from '@/classes/airbase/airbase';
import Item from '@/classes/item/item';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';

export default Vue.extend({
  name: 'ItemPreset',
  components: { draggable },
  props: {
    value: {
      type: [Ship, Airbase],
      required: true,
    },
    handleExpandItemPreset: {
      type: Function,
      required: true,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    items: [] as ItemMaster[],
    presets: [] as ItemPreset[],
    selectedIndex: -1,
    selectedPreset: new ItemPreset(),
    snackbar: false,
    infoText: '',
  }),
  mounted() {
    this.items = this.$store.state.items as ItemMaster[];

    this.presets = [];
    const savedPresets = this.$store.state.itemPresets as (ItemPreset | OldItemPreset)[];
    this.presets = ItemPreset.convertOldItemPresets(savedPresets);

    this.getAACIPreset();
  },
  watch: {
    value() {
      this.getAACIPreset();
    },
  },
  computed: {
    needTrans() {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    disabledCommit(): boolean {
      // 装備が空の場合判定
      if (this.value instanceof Airbase) {
        return this.value.items.filter((v) => v.data.id > 0).length === 0;
      }
      // 基地以外の時は補強増設まで見て判定
      return this.value.items.concat(this.value.exItem).filter((v) => v.data.id > 0).length === 0;
    },
    itemView(): Item[] {
      const itemMasters = [];
      for (let i = 0; i < this.selectedPreset.items.length; i += 1) {
        const { id, remodel } = this.selectedPreset.items[i];
        const item = this.items.find((v) => v.id === id);
        if (item) {
          itemMasters.push(new Item({ master: item, remodel }));
        }
      }
      return itemMasters;
    },
    exItemView(): Item {
      const item = this.items.find((v) => v.id === this.selectedPreset.exItem.id);

      return new Item({ master: item, remodel: this.selectedPreset.exItem.remodel });
    },
    isPresetItemEmpty(): boolean {
      return !this.selectedPreset.items.some((v) => v.id > 0) && this.selectedPreset.exItem.id === 0;
    },
  },
  methods: {
    clickedPreset(id: number) {
      const index = this.presets.findIndex((v) => v.id === id);
      if (index >= 0) {
        this.selectedIndex = index;
        this.selectedPreset = cloneDeep(this.presets[index]);
      }
    },
    readyPreset() {
      const newPreset = new ItemPreset();
      const maxId = max(this.presets.map((v) => v.id));
      if (maxId) {
        newPreset.id = maxId;
      }
      newPreset.id += 1;
      if (this.$i18n.locale !== 'ja') {
        newPreset.name = `${this.$t('ItemList.プリセット')} ${newPreset.id}`;
      } else {
        newPreset.name = `装備プリセット${newPreset.id}`;
      }
      // 装備id一覧
      for (let i = 0; i < this.value.items.length; i += 1) {
        const item = this.value.items[i];
        newPreset.items.push({ id: item.data.id, remodel: item.remodel });
      }
      if (this.value instanceof Ship) {
        newPreset.exItem = { id: this.value.exItem.data.id, remodel: this.value.exItem.remodel };
      }

      this.selectedIndex = -1;
      this.selectedPreset = newPreset;
    },
    overwritePreset() {
      const { name } = this.selectedPreset;
      this.selectedPreset = new ItemPreset();
      this.selectedPreset.name = name;
      for (let i = 0; i < this.value.items.length; i += 1) {
        const item = this.value.items[i];
        this.selectedPreset.items.push({ id: item.data.id, remodel: item.remodel });
      }
      if (this.value instanceof Ship) {
        this.selectedPreset.exItem = { id: this.value.exItem.data.id, remodel: this.value.exItem.remodel };
      }
    },
    savePreset() {
      if (this.selectedIndex >= 0) {
        // 更新
        this.presets[this.selectedIndex] = this.selectedPreset;
      } else {
        // 新規登録
        this.presets.push(this.selectedPreset);
      }
      // ブラウザに保存
      this.$store.dispatch('updateItemPresets', this.presets);
      this.infoText = '保存しました。';
      this.snackbar = true;
      this.selectedIndex = -1;
      this.selectedPreset = new ItemPreset();
    },
    deletePreset() {
      this.presets = this.presets.filter((v, i) => i !== this.selectedIndex);
      // ブラウザに保存
      this.$store.dispatch('updateItemPresets', this.presets);
      this.snackbar = true;
      this.infoText = '削除しました。';
      this.selectedIndex = -1;
      this.selectedPreset = new ItemPreset();
    },
    expandPreset() {
      if (this.selectedPreset) {
        this.handleExpandItemPreset(this.selectedPreset);
        this.handleClose();
      }
    },
    sortEnd() {
      const baseIds = this.presets.map((v) => v.id);
      for (let i = 0; i < this.presets.length; i += 1) {
        this.presets[i].id = baseIds[i];
      }
      this.$store.dispatch('updateItemPresets', this.presets);
    },
    getAACIPreset() {
      const parent = this.value;
      if (!(parent instanceof Ship)) {
        return;
      }

      // 今使える全装備を取得
      const allItems = this.items.filter((v) => !v.isEnemyItem);
      const stocks = this.$store.state.itemStock as ItemStock[];

      const items: Item[] = [];

      if (stocks.length && stocks.some((v) => v.num.some((remodel) => !!remodel))) {
        // 所持装備情報がある場合
        for (let i = 0; i < stocks.length; i += 1) {
          const stock = stocks[i];
          const master = allItems.find((v) => v.id === stock.id);

          for (let remodel = 0; remodel <= 10; remodel += 1) {
            for (let j = 0; j < stock.num[remodel]; j += 1) {
              items.push(new Item({ master, remodel }));
            }
          }
        }
      } else {
        for (let i = 0; i < allItems.length; i += 1) {
          items.push(new Item({ master: allItems[i] }));
        }
      }

      const aaciItems = Optimizer.getShipAACITriggerItems(parent, items);
      console.log(aaciItems.map((v) => ({ id: v.id, item: v.items.map((x) => x.data.name).join(',') })));
    },
  },
});
</script>
