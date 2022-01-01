<template>
  <div class="item-list">
    <v-card>
      <div class="d-flex px-5 pt-2">
        <div class="align-self-center">
          <v-text-field
            label="図鑑No 名称検索"
            clearable
            v-model="keyword"
            @input="filter()"
            prepend-inner-icon="mdi-magnify"
          ></v-text-field>
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
          v-if="displayAllType"
          class="type-selector d-flex"
          :class="{ active: type === 0, disabled: keyword }"
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
          :class="{ active: type === i.id, disabled: keyword }"
          @click="changeType(i.id)"
        >
          <v-img :src="`/img/type/type${i.id}.png`" height="32" width="32"></v-img>
        </div>
      </div>
      <v-divider class="mx-2"></v-divider>
      <div id="item-table-body">
        <div class="pa-3" :class="{ multi: multiLine }">
          <div v-ripple="{ class: 'info--text' }" v-for="(item, i) in items" :key="i" class="list-item" @click="clickedItem(item)">
            <div>
              <v-img :src="`/img/type/icon${item.iconTypeId}.png`" height="24" width="24"></v-img>
            </div>
            <div class="item-name text-truncate">
              {{ item.name }}
            </div>
            <div class="item-remodel caption">
              <v-icon small color="teal accent-4">mdi-star</v-icon>
              <span class="teal--text text--accent-4">{{ i % 11 }}</span>
            </div>
            <div class="item-count red--text caption">
              <span>&times;</span>
              <span>{{ i % 20 }}</span>
            </div>
          </div>
        </div>
        <div v-show="items.length === 0" class="caption text-center">搭載可能な装備が見つかりませんでした。</div>
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
  transition: 0.2s;
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

.multi {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 660px) {
  .multi {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 880px) {
  .multi {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1100px) {
  .multi {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.list-item {
  display: flex;
  cursor: pointer;
  padding-left: 0.25rem;
  padding-right: 0.1rem;
  padding-top: 0.4rem;
  padding-bottom: 0.4rem;
  transition: 0.1s;
  border-radius: 0.2rem;
}
.list-item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.list-item > div {
  align-self: center;
}
.item-name {
  flex-grow: 1;
  font-size: 0.75em;
  width: 10px;
  margin-left: 0.1rem;
  overflow: hidden;
  white-space: nowrap;
}
.item-remodel {
  width: 32px;
}
.item-count {
  margin-left: 1px;
  width: 22px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemMaster from '@/classes/item/itemMaster';
import Landbase from '@/classes/landbase/landbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import Const from '@/classes/const';

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
    types: Const.ITEM_TYPES_ALT,
    type: 0,
    multiLine: true,
    keyword: '',
    isEnemyMode: false,
    displayAllType: true,
  }),
  mounted() {
    const items = this.$store.state.items as ItemMaster[];
    for (let i = 0; i < items.length; i += 1) {
      this.all.push(items[i]);
    }
    this.all.sort((a, b) => a.apiTypeId - b.apiTypeId);
  },
  computed: {
    enabledTypes() {
      const apis = this.baseItems.map((v) => v.apiTypeId);
      const enableds = [];
      for (let i = 0; i < this.types.length; i += 1) {
        const d = this.types[i].types;
        if (apis.find((api) => d.includes(api))) {
          enableds.push(this.types[i]);
        }
      }
      return enableds;
    },
  },
  methods: {
    changeType(type = 0) {
      this.type = type;
      this.filter();
    },
    initialFilter(parent: Ship | Enemy | Landbase, slotIndex = 0) {
      // 装備可能フィルタ
      let types: number[] = [];
      this.displayAllType = true;
      if (parent instanceof Ship && parent.data.id) {
        // 渡された艦娘情報より装備可能種別を取得
        this.baseItems = this.all.filter((item) => parent.data.isValidItem(item, slotIndex));
        if (!this.enabledTypes.find((v) => v.id === this.type)) {
          // カテゴリがおかしかったらALLにする
          this.type = 0;
        }
        this.filter();
        return;
      }
      if (parent instanceof Ship) {
        // 空の艦娘 全部盛り
        for (let i = 1; i <= 60; i += 1) {
          if (Const.LB_PLANE_TYPES.includes(i)) {
            continue;
          }
          types.push(i);
          // カテゴリ全ては重いので削除
          this.displayAllType = false;
          if (this.type === 0) {
            this.type = 1;
          }
        }
      } else if (parent instanceof Landbase) {
        // 基地航空隊 全艦載機装備可能
        types = Const.PLANE_TYPES.concat();
      } else if (parent instanceof Enemy) {
        // 渡された敵艦種より装備可能種別を取得
        const info = Const.SHIP_TYPES_INFO.find((v) => v.id === parent.data.type);
        if (info) {
          types = info.itemType;
        }
      }

      if (slotIndex === Const.EXPAND_SLOT_INDEX) {
        // 補強増設枠フィルタ
        const enableds = Const.EXPANDED_ITEM_TYPE;
        types = types.filter((v) => enableds.includes(v));
      }

      this.baseItems = this.all.filter((v) => types.includes(v.apiTypeId));
      this.filter();
    },
    filter() {
      const word = this.keyword;
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
