<template>
  <div
    v-ripple="{ class: 'info--text' }"
    class="item-input"
    :class="{ readonly: readonly }"
    :draggable="item.data.id > 0 && !readonly"
    @dragstart="dragStart(item, $event)"
    @dragend="dragEnd($event)"
    @dragover.prevent
    @dragenter.prevent="dragEnter(item, $event)"
    @dragleave.prevent="dragLeave($event)"
    @drop="dropItem($event)"
  >
    <v-menu offset-y :close-on-content-click="false" transition="slide-y-transition" bottom right :disabled="readonly">
      <!-- 搭載数 -->
      <template v-slot:activator="{ on, attrs }">
        <div v-ripple="{ class: 'info--text' }" v-bind="attrs" v-on="on" class="item-slot">
          {{ item.slot }}
        </div>
      </template>
      <v-card class="px-5 py-1">
        <div class="d-flex pl-1 pr-2">
          <v-text-field class="slot-input" type="number" :max="item.max" min="0" v-model="item.slot"></v-text-field>
          <v-btn depressed class="ml-2 align-self-center" @click="item.slot = item.init">初期値</v-btn>
        </div>
        <v-slider :max="item.max" min="0" v-model="item.slot"></v-slider>
      </v-card>
    </v-menu>
    <!-- 装備種別 -->
    <div class="mx-1 item-icon">
      <v-img :src="`/img/type/icon${item.data.iconTypeId}.png`" height="28" width="28"></v-img>
    </div>
    <!-- 装備名称 -->
    <div class="item-name text-truncate" @click.stop="showItemList()">
      {{ item.data && item.data.name ? item.data.name : "未装備" }}
    </div>
    <!-- 改修値 -->
    <v-menu offset-y transition="slide-y-transition" left :disabled="readonly">
      <template v-slot:activator="{ on, attrs }">
        <div v-ripple="{ class: 'info--text' }" class="item-remodel" v-bind="attrs" v-on="on">
          <v-icon small color="teal accent-4">mdi-star</v-icon>
          <span class="teal--text text--accent-4">{{ item.remodel }}</span>
        </div>
      </template>
      <v-card>
        <div class="d-flex">
          <div v-for="i in 11" :key="i" @click="item.remodel = i - 1" class="remodel-list-item">
            <v-icon small color="teal accent-4">mdi-star</v-icon>
            <span class="teal--text text--accent-4">{{ i - 1 }}</span>
          </div>
        </div>
      </v-card>
    </v-menu>
    <!-- 熟練度 -->
    <v-menu offset-y transition="slide-y-transition" left :disabled="readonly">
      <template v-slot:activator="{ on, attrs }">
        <div v-ripple="{ class: 'info--text' }" class="item-level" v-bind="attrs" v-on="on">
          <v-img :src="`/img/util/prof${level}.png`" height="24" width="18"></v-img>
          <span class="level-value">{{ item.level }}</span>
        </div>
      </template>
      <v-card>
        <div class="d-flex">
          <div v-for="i in 8" :key="i - 1" v-ripple="{ class: 'info--text' }" class="level-list-item" @click="setLevel(i - 1)">
            <v-img :src="`/img/util/prof${i - 1}.png`" width="18" height="24"></v-img>
            <span class="level-list-value">{{ getLevelValue(i - 1) }}</span>
          </div>
          <div v-ripple="{ class: 'info--text' }" class="level-list-item" @click="item.level = 120">
            <v-img :src="`/img/util/prof7.png`" width="18" height="24"></v-img>
            <span class="level-list-value">120</span>
          </div>
        </div>
      </v-card>
    </v-menu>
    <!-- 解除 -->
    <div class="item-remove align-self-start">
      <v-btn v-show="item.data.id > 0 && !readonly" icon x-small @click="removeItem()">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.item-input {
  display: flex;
  margin-left: 0.1rem;
  margin-right: 0.1rem;
  transition: 0.1s;
  border-bottom: 1px solid rgba(128, 128, 128, 0.4);
}
.item-input:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.item-input > div {
  align-self: center;
}
.item-input.dragging * {
  pointer-events: none;
}
.item-slot {
  text-align: right;
  font-size: 0.9em;
  width: 24px;
  white-space: nowrap;
}
.item-name {
  cursor: pointer;
  width: 180px;
  font-size: 0.9em;
  line-height: 25px;
}
.item-remodel {
  width: 38px;
}
.item-remodel i,
.item-remodel span .remodel-list-item i,
.remodel-list-item span {
  vertical-align: middle;
}
.item-remodel span {
  font-size: 0.9em;
}
.item-level {
  position: relative;
}

.slot-input,
.level-input {
  width: 120px;
}
.item-remove {
  width: 20px;
  opacity: 0.5;
  transition: 0.2s;
}
.item-input:hover .item-remove {
  opacity: 1;
}
.v-list-item {
  min-height: 28px;
  height: 28px;
}
.remodel-list-item,
.level-list-item {
  padding: 0.5rem 0.75rem;
  transition: 0.2s;
  cursor: pointer;
  position: relative;
}
.remodel-list-item {
  padding: 0.5rem 0.3rem;
}
.remodel-list-item:hover,
.level-list-item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.level-value,
.level-list-value {
  display: inline-block;
  position: absolute;
  font-size: 0.75em;
  text-align: center;
  font-weight: 900;
  bottom: 0;
  width: 30px;
  right: 1px;
  z-index: 1;
  text-shadow: 1px 1px 1px #fff, -1px -1px 1px #fff, -1px 1px 1px #fff, 1px -1px 1px #fff, 1px 0px 1px #fff, -1px -0px 1px #fff,
    0px 1px 1px #fff, 0px -1px 1px #fff;
}
.theme--dark .level-value,
.theme--dark .level-list-value {
  text-shadow: 1px 1px 1px #000, -1px -1px 1px #000, -1px 1px 1px #000, 1px -1px 1px #000, 1px 0px 1px #000, -1px -0px 1px #000,
    0px 1px 1px #000, 0px -1px 1px #000;
}
.level-value {
  text-align: right;
  font-size: 0.7em;
  font-weight: 600;
  bottom: -4px;
  opacity: 0;
  transition: 0.2s;
  right: 0;
}
.item-input:hover .level-value {
  opacity: 1;
}

.readonly .item-slot,
.readonly .item-name,
.readonly .item-level,
.readonly .item-remodel {
  cursor: default;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Item from '@/classes/Item';

export default Vue.extend({
  name: 'ItemInput',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    item: {
      type: Item,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    readonly: {
      type: Boolean,
    },
  },
  watch: {
    item: {
      handler() {
        this.item.updateStatus();
      },
      deep: true,
    },
  },
  computed: {
    level() {
      const lv = this.item.level;
      if (lv < 10) {
        return 0;
      }
      if (lv < 25) {
        return 1;
      }
      if (lv < 40) {
        return 2;
      }
      if (lv < 55) {
        return 3;
      }
      if (lv < 70) {
        return 4;
      }
      if (lv < 85) {
        return 5;
      }
      if (lv < 100) {
        return 6;
      }
      return 7;
    },
  },
  methods: {
    removeItem() {
      this.item.clear();
    },
    setLevel(value: number) {
      this.item.level = [0, 10, 25, 40, 55, 70, 85, 100][value];
    },
    getLevelValue(value: number) {
      return [0, 10, 25, 40, 55, 70, 85, 100][value];
    },
    showItemList() {
      this.handleShowItemList(this.index);
    },
    dragStart(item: Item, e: DragEvent) {
      (e.dataTransfer as DataTransfer).setData('text/plain', JSON.stringify(item));
      (e.target as HTMLDivElement).style.opacity = '0.5';

      // 一時的に全てのitem inputの子要素マウスイベントを消す
      const itemInputs = document.getElementsByClassName('item-input');
      for (let i = 0; i < itemInputs.length; i += 1) {
        itemInputs[i].classList.add('dragging');
      }
    },
    dragEnd(e: DragEvent) {
      (e.target as HTMLDivElement).style.opacity = '1';

      // 受け渡された対象の装備データ あれば。
      const detData = (e.dataTransfer as DataTransfer).getData('text/plain');
      console.log((e.dataTransfer as DataTransfer).getData('text/plain'));

      if (detData) {
        // 交換
        this.item.setItem(JSON.parse(detData) as Item);
      } else {
        // 交換できないのでクリア
        this.item.clear();
      }

      // 消していたマウスイベントを復帰させる
      const itemInputs = document.getElementsByClassName('item-input');
      for (let i = 0; i < itemInputs.length; i += 1) {
        itemInputs[i].classList.remove('dragging');
      }
    },
    dragEnter(item: Item, e: DragEvent) {
      const target = e.target as HTMLDivElement;
      if (target && target.classList.contains('item-input')) {
        target.style.backgroundColor = 'rgba(0, 160, 255, 0.4)';
      }
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.backgroundColor = '';
    },
    dropItem(e: DragEvent) {
      (e.target as HTMLDivElement).style.backgroundColor = '';

      // 受け渡されたデータ
      const droppedData = (e.dataTransfer as DataTransfer).getData('text/plain');

      // 元々あったitem情報があればtransferを書き換える
      if (this.item.data.id) {
        const prevData = JSON.stringify(this.item);
        (e.dataTransfer as DataTransfer).setData('text/plain', prevData);
      } else {
        (e.dataTransfer as DataTransfer).setData('text/plain', '');
      }
      // ドロップされたデータで上書きす
      if (droppedData) {
        this.item.setItem(JSON.parse(droppedData) as Item);
      }
      console.log((e.dataTransfer as DataTransfer).getData('text/plain'));
    },
  },
});
</script>
