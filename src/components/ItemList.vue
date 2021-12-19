<template>
  <div class="item-list">
    <v-card>
      <div class="d-flex px-5 pt-2">
        <div class="align-self-center">
          <v-text-field label="図鑑No 名称検索" v-model="keyword" @input="filter()" prepend-inner-icon="mdi-magnify"></v-text-field>
        </div>
        <div class="ml-5 align-self-center">
          <v-checkbox v-model="isEnemyMode" @change="filter()" :label="'敵装備'"></v-checkbox>
        </div>
        <v-spacer></v-spacer>
        <div class="align-self-center d-none d-md-block">
          <v-btn depressed :class="{ info: !multiLine }" @click="multiLine = false">
            <v-icon>mdi-view-headline</v-icon>
            <span>一列</span>
          </v-btn>
          <v-btn depressed class="ml-2" :class="{ info: multiLine }" @click="multiLine = true">
            <v-icon>mdi-view-comfy</v-icon>
            <span>複数列</span>
          </v-btn>
        </div>
      </div>
      <div class="d-flex flex-wrap mx-3">
        <div
          class="type-selector d-flex"
          :class="{ active: type === 0, disabled: keyword.length > 0 }"
          v-ripple="{ class: 'info--text' }"
          @click="changeType(0)"
        >
          <div class="type-all-text">ALL</div>
        </div>
        <div
          v-for="i in enabledTypes"
          :key="i.id"
          v-ripple="{ class: 'info--text' }"
          class="type-selector"
          :class="{ active: type === i.id, disabled: keyword.length > 0 }"
          @click="changeType(i.id)"
        >
          <v-img :src="`/img/type/type${i.id}.png`" height="32" width="32"></v-img>
        </div>
      </div>
      <v-divider></v-divider>
      <div id="item-table-body">
        <div class="pa-3" :class="{ 'd-md-flex flex-wrap': multiLine }">
          <div v-ripple="{ class: 'info--text' }" v-for="(item, i) in items" :key="i" class="list-item" @click="clickedItem(item)">
            <div class="item-icon">
              <img :src="`/img/type/icon${item.iconTypeId}.png`" :alt="item.iconTypeId" />
            </div>
            <div class="item-name text-truncate">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
#item-table-body {
  overflow-y: scroll;
  height: 64vh;
}
.type-selector {
  border: 1px solid transparent;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
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

.list-item {
  display: flex;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: 0.1s;
  border-radius: 0.2rem;
}
.list-item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.list-item > div {
  align-self: center;
}
.item-icon {
  height: 24px;
}
.item-icon img {
  width: 24px;
  height: 24px;
}
.item-name {
  font-size: 0.8em;
  width: 240px;
  margin-left: 0.1rem;
  overflow: hidden;
  white-space: nowrap;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemMaster from '@/classes/ItemMaster';

export default Vue.extend({
  name: 'ItemList',
  props: {
    handleEquipItem: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    all: [] as ItemMaster[],
    baseItems: [] as ItemMaster[],
    items: [] as ItemMaster[],
    types: [] as { id: number; types: number[] }[],
    type: 0,
    multiLine: true,
    keyword: '',
    isEnemyMode: false,
  }),
  mounted() {
    const items = this.$store.state.items as ItemMaster[];
    for (let i = 0; i < items.length; i += 1) {
      this.all.push(items[i]);
    }
    this.all.sort((a, b) => a.apiTypeId - b.apiTypeId);

    // type選択肢データ
    this.types = [
      { id: 1, types: [1] },
      { id: 2, types: [2] },
      { id: 3, types: [3] },
      { id: 4, types: [4] },
      { id: 5, types: [5, 32] },
      { id: 6, types: [6] },
      { id: 7, types: [7] },
      { id: 8, types: [8] },
      { id: 9, types: [9] },
      { id: 57, types: [57] },
      { id: 10, types: [10, 11] },
      { id: 45, types: [45] },
      { id: 41, types: [41] },
      { id: 12, types: [12, 13] },
      { id: 14, types: [14, 15, 40] },
      { id: 21, types: [21] },
      { id: 24, types: [24, 30, 46] },
      {
        id: 17,
        types: [17, 18, 19, 23, 25, 26, 27, 28, 29, 31, 33, 34, 35, 36, 37, 39, 42, 43, 44, 50, 51],
      },
      { id: 47, types: [47, 53] },
      { id: 48, types: [48] },
      { id: 49, types: [49] },
    ];
  },
  computed: {
    enabledTypes() {
      const apis = this.baseItems.map((v) => v.apiTypeId);
      return this.types.filter((v) => apis.includes(v.id));
    },
  },
  methods: {
    changeType(type = 0) {
      this.type = type;
      this.filter();
    },
    initialFilter(types: number[]) {
      // 装備可能フィルタ
      this.baseItems = this.all.filter((v) => types.includes(v.apiTypeId));
      this.filter();
    },
    filter() {
      const word = this.keyword.trim();
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
        result = result.filter((v) => t.types.includes(v.apiTypeId));
      }

      this.items = result;
    },
    clickedItem(item: ItemMaster) {
      this.handleEquipItem(item);
    },
  },
});
</script>
