<template>
  <v-card>
    <div class="d-flex pt-2 pb-1 pr-2">
      <div class="align-self-center ml-3">装備プリセット</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="px-3 pt-3">
      <v-btn color="teal" :dark="!disabledRegist" :disabled="disabledRegist" @click="readyPreset()">現在の装備構成で新規登録</v-btn>
      <v-divider class="mt-3"></v-divider>
      <div class="preset-container py-1">
        <div class="preset-list">
          <draggable handle=".preset-id" animation="150" @end="sortEnd()" v-model="presets">
            <div
              v-for="(preset, i) in presets"
              :key="`preset${i}`"
              class="preset-item"
              :class="{ selected: i === selectedIndex }"
              v-ripple="{ class: 'info--text' }"
              @click="clickedPreset(i)"
            >
              <div class="preset-id primary--text">{{ preset.id }}.</div>
              <div class="preset-name text-truncate">{{ preset.name }}</div>
            </div>
          </draggable>
        </div>
        <div class="preset-view pl-2">
          <div class="mt-5 d-flex" v-if="!isPresetItemEmpty">
            <div>
              <v-text-field label="名称" outlined v-model.trim="selectedPreset.name" counter clearable dense maxlength="100"></v-text-field>
            </div>
            <div>
              <v-btn class="ml-1" color="success" :disabled="!selectedPreset.name" @click="savePreset()">{{
                selectedIndex >= 0 ? "更新" : "保存"
              }}</v-btn>
            </div>
          </div>
          <div class="items-container pa-2" v-if="!isPresetItemEmpty">
            <div v-for="(item, i) in itemView" :key="`view${i}`" class="view-item">
              <div class="caption">{{ i + 1 }}.</div>
              <div class="ml-1">
                <v-img v-if="item.data.iconTypeId > 0" :src="`./img/type/icon${item.data.iconTypeId}.png`" width="30" height="30" />
              </div>
              <div class="ml-1 body-2 text-truncate preset-item-name">{{ item.data.name }}</div>
              <div class="ml-1 body-2" v-if="item.remodel">
                <v-icon small color="teal accent-4">mdi-star</v-icon>
                <span class="teal--text text--accent-4">{{ item.remodel }}</span>
              </div>
            </div>
            <div v-if="exItemView.data.id" class="mt-4 d-flex ml-1">
              <div class="caption">補強増設</div>
              <div class="divider-line"></div>
            </div>
            <div v-if="exItemView.data.id" class="view-item">
              <div class="ml-2">
                <v-img
                  v-if="exItemView.data.iconTypeId > 0"
                  :src="`./img/type/icon${exItemView.data.iconTypeId}.png`"
                  width="24"
                  height="24"
                />
              </div>
              <div class="ml-2 body-2 text-truncate preset-item-name">{{ exItemView.data.name }}</div>
              <div class="ml-1 body-2" v-if="exItemView.remodel">
                <v-icon small color="teal accent-4">mdi-star</v-icon>
                <span class="teal--text text--accent-4">{{ exItemView.remodel }}</span>
              </div>
            </div>
          </div>
          <div class="d-flex my-3 justify-end" v-if="!isPresetItemEmpty">
            <v-btn v-if="selectedIndex >= 0" color="primary" @click="expandPreset()">展開</v-btn>
            <v-btn class="ml-3" color="error" :disabled="selectedIndex < 0" @click="deletePreset()">削除</v-btn>
          </div>
        </div>
      </div>
    </div>
    <v-snackbar v-model="snackbar" color="success" :top="snackbar">
      {{ infoText }}
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
  padding: 0.5rem 0.1rem;
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
  padding: 0.25rem;
}
.view-item {
  display: flex;
  margin: 0.5rem 0;
  padding: 0.25rem;
}
.view-item > div {
  align-self: center;
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
import Airbase from '@/classes/airbase/airbase';
import Item from '@/classes/item/item';

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
    this.presets = [];
    const savedPresets = this.$store.state.itemPresets as (ItemPreset | OldItemPreset)[];
    this.presets = ItemPreset.convertOldItemPresets(savedPresets);
    this.items = this.$store.state.items as ItemMaster[];
  },
  computed: {
    disabledRegist(): boolean {
      if (this.value instanceof Airbase) {
        return this.value.items.filter((v) => v.data.id > 0).length === 0;
      }
      return this.value.items.concat(this.value.exItem).filter((v) => v.data.id > 0).length === 0;
    },
    itemView(): Item[] {
      const itemMasters = [];
      for (let i = 0; i < this.selectedPreset.items.length; i += 1) {
        const item = this.items.find((v) => v.id === this.selectedPreset.items[i].id);
        if (item) {
          itemMasters.push(new Item({ master: item, remodel: this.selectedPreset.items[i].remodel }));
        } else {
          itemMasters.push(new Item());
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
    clickedPreset(index: number) {
      if (index < this.presets.length) {
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
      newPreset.name = `装備プリセット${newPreset.id}`;
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
      for (let i = 0; i < this.presets.length; i += 1) {
        this.presets[i].id = i + 1;
      }
      this.$store.dispatch('updateItemPresets', this.presets);
    },
  },
});
</script>
