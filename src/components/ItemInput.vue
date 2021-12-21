<template>
  <v-tooltip
    :disabled="item.data.id <= 0 || draggingNow"
    bottom
    open-delay="500"
    v-model="tooltipState"
    color="black"
    @input="toggleTooltip"
    transition="scroll-y-transition"
  >
    <template v-slot:activator="{ on }">
      <div
        v-on="on"
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
        <!-- 搭載数 -->
        <v-menu
          offset-y
          :close-on-content-click="false"
          transition="slide-y-transition"
          bottom
          right
          :disabled="readonly"
          v-model="slotMenu"
          @input="onMenuToggle"
        >
          <template v-slot:activator="{ on, attrs }">
            <div v-ripple="{ class: 'info--text' }" v-bind="attrs" v-on="on" class="item-slot">
              {{ item.slot }}
            </div>
          </template>
          <v-card class="px-5 py-1">
            <div class="d-flex pl-1 pr-2">
              <v-text-field class="slot-input" type="number" :max="max" min="0" v-model="slotValue"></v-text-field>
              <v-btn depressed class="ml-2 align-self-center" @click="slotValue = init">初期値</v-btn>
            </div>
            <v-slider :max="max" min="0" v-model="slotValue"></v-slider>
          </v-card>
        </v-menu>
        <!-- 装備種別 -->
        <div class="mx-1 item-icon" :class="{ draggable: item.data.id > 0 && !readonly }">
          <v-img
            v-show="!isExpandSlot || item.data.iconTypeId"
            :src="`/img/type/icon${item.data.iconTypeId}.png`"
            height="28"
            width="28"
          ></v-img>
          <v-icon v-show="isExpandSlot && !item.data.iconTypeId">mdi-wrench</v-icon>
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
              <div v-for="i in 11" :key="i" @click="setRemodel(i - 1)" class="remodel-list-item">
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
              <div v-for="i in 9" :key="i - 1" v-ripple="{ class: 'info--text' }" class="level-list-item" @click="setLevel(i - 1)">
                <v-img :src="`/img/util/prof${i - 1}.png`" width="18" height="24"></v-img>
                <span class="level-list-value">{{ getLevelValue(i - 1) }}</span>
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
    <div v-if="!destroyTooltip" class="item-tooltip">
      <div class="d-flex">
        <div class="align-self-center">
          <v-img :src="`/img/type/icon${item.data.iconTypeId}.png`" height="32" width="32"></v-img>
        </div>
        <div class="ml-1 align-self-center">
          <div class="tooltip-item-id">id:{{ item.data.id }}</div>
          <div class="body-2">{{ item.data.name }}</div>
        </div>
      </div>
      <div class="item-status-grid mt-1">
        <div v-show="item.data.fire">
          火力:<span>{{ item.data.fire }}</span>
        </div>
        <div v-show="item.data.torpedo">
          雷装:<span>{{ item.data.torpedo }}</span>
        </div>
        <div v-show="item.data.bomber">
          爆装:<span>{{ item.data.bomber }}</span>
        </div>
        <div v-show="item.data.antiAir">
          対空:<span>{{ item.data.antiAir }}</span>
        </div>
        <div v-show="item.data.armor">
          装甲:<span>{{ item.data.armor }}</span>
        </div>
        <div v-show="item.data.asw">
          対潜:<span>{{ item.data.asw }}</span>
        </div>
        <div v-show="item.data.avoid">
          回避:<span>{{ item.data.avoid }}</span>
        </div>
        <div v-show="item.data.scout">
          索敵:<span>{{ item.data.scout }}</span>
        </div>
        <div v-show="item.data.accuracy">
          命中:<span>{{ item.data.accuracy }}</span>
        </div>
      </div>
    </div>
  </v-tooltip>
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
.item-input.dragging-item {
  opacity: 0.2;
}
.item-slot {
  text-align: right;
  font-size: 0.9em;
  width: 24px;
  white-space: nowrap;
}
.item-icon.draggable {
  cursor: move;
}
.item-icon {
  text-align: center;
  width: 28px;
  height: 28px;
}
.item-icon i {
  font-size: 1.3em;
}
.item-name {
  flex-grow: 1;
  cursor: pointer;
  width: 100px;
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

.tooltip-item-id {
  color: #6098ff;
  font-size: 12px;
}
.item-status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.item-status-grid > div {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
.item-status-grid span {
  width: 24px;
  display: inline-block;
  text-align: right;
  color: #60d2ff;
}
.item-status-grid span.bad-status {
  color: #ff7979;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Item, { ItemBuilder } from '@/classes/Item';
import Const from '@/classes/Const';

export default Vue.extend({
  name: 'ItemInput',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    value: {
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
    max: {
      type: Number,
      required: true,
    },
    init: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    slotMenu: false,
    slotValue: 0,
    tooltipState: false,
    destroyTooltip: false,
    draggingNow: false,
  }),
  computed: {
    item(): Item {
      return this.value;
    },
    isExpandSlot() {
      return this.index === Const.EXPAND_SLOT_INDEX;
    },
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
    setItem(value: Item) {
      this.$emit('input', value);
    },
    onMenuToggle() {
      if (!this.slotMenu) {
        // 搭載数メニューCloseイベント
        const builder: ItemBuilder = { item: this.item, slot: this.slotValue };
        this.setItem(new Item(builder));
      } else {
        // 搭載数メニューOpenイベント
        this.slotValue = this.item.slot;
      }
    },
    removeItem() {
      this.setItem(new Item());
    },
    setLevel(value: number) {
      const builder: ItemBuilder = { item: this.item, level: [0, 10, 25, 40, 55, 70, 85, 100, 120][value] };
      this.setItem(new Item(builder));
    },
    setRemodel(value: number) {
      const builder: ItemBuilder = { item: this.item, remodel: value };
      this.setItem(new Item(builder));
    },
    getLevelValue(value: number) {
      return [0, 10, 25, 40, 55, 70, 85, 100, 120][value];
    },
    showItemList() {
      this.handleShowItemList(this.index);
    },
    dragStart(item: Item, e: DragEvent) {
      (e.dataTransfer as DataTransfer).setData('text/plain', JSON.stringify(item));
      // ドラッグ元を一意識別するためのclassを追加
      (e.target as HTMLDivElement).classList.add('dragging-item');

      // 一時的に全てのitem inputの子要素マウスイベントを消す
      const itemInputs = document.getElementsByClassName('item-input');
      for (let i = 0; i < itemInputs.length; i += 1) {
        itemInputs[i].classList.add('dragging');
      }

      this.draggingNow = true;
      this.tooltipState = false;
    },
    dragEnd(e: DragEvent) {
      const draggingDiv = e.target as HTMLDivElement;
      // ドラッグ元を一意識別するためのclassを削除
      draggingDiv.classList.remove('dragging-item');

      // 受け渡された対象の装備データ あれば。
      const itemData = draggingDiv.dataset.item;
      if (itemData) {
        // 交換
        this.setItem(new Item({ item: JSON.parse(itemData) as Item }));
        delete draggingDiv.dataset.item;
      } else {
        // 交換できないのでクリア
        this.setItem(new Item());
      }

      // 消していたマウスイベントを復帰させる
      const itemInputs = document.getElementsByClassName('item-input');
      for (let i = 0; i < itemInputs.length; i += 1) {
        itemInputs[i].classList.remove('dragging');
      }
      this.draggingNow = false;
    },
    dragEnter(item: Item, e: DragEvent) {
      const target = e.target as HTMLDivElement;
      // todo 装備搭載可能制限
      if (target && target.classList.contains('item-input')) {
        target.style.backgroundColor = 'rgba(0, 128, 255, 0.4)';
      }
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.backgroundColor = '';
    },
    dropItem(e: DragEvent) {
      (e.target as HTMLDivElement).style.backgroundColor = '';
      // 受け渡されたデータ
      const droppedData = (e.dataTransfer as DataTransfer).getData('text/plain');

      // 元々あったitem情報があれば、ドロップ元のdataに一時保管
      const draggingDiv = document.querySelector('.item-input.dragging-item') as HTMLDivElement;
      if (this.item.data.id && draggingDiv) {
        const prevData = JSON.stringify(this.item);
        draggingDiv.dataset.item = prevData;
      }

      // ドロップされたデータで上書きする
      if (droppedData) {
        this.setItem(new Item({ item: JSON.parse(droppedData) as Item }));
      }
    },
    toggleTooltip() {
      if (!this.tooltipState) {
        setTimeout(() => {
          this.destroyTooltip = true;
        }, 150);
      } else {
        this.destroyTooltip = false;
      }
    },
  },
});
</script>
