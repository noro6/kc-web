<template>
  <v-card
    class="ma-1 ship-input"
    :class="{ disabled: !ship.isActive, 'py-2': !ship.isEmpty }"
    @dragstart="dragStart($event)"
    @dragend="dragEnd($event)"
    @dragenter="dragEnter($event)"
    @dragleave="dragLeave($event)"
    @drop.stop="dropShip($event)"
    @dragover.prevent
  >
    <template v-if="ship.isEmpty">
      <div class="empty-ship" v-ripple="{ class: 'info--text' }" @click="showShipList">
        <div class="align-self-center">艦娘選択</div>
      </div>
    </template>
    <template v-else>
      <div class="d-flex ship-header px-2">
        <div class="align-self-center drag-handle" v-if="!isNoShip" @mousedown="setDraggable" @mouseup="resetDraggable">
          <v-img :src="`./img/ship/${ship.data.id}.png`" height="32" width="128"></v-img>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex caption flex-wrap">
            <v-menu
              offset-y
              v-model="levelMenu"
              :close-on-content-click="false"
              transition="slide-y-transition"
              bottom
              right
              @input="onLevelMenuToggle"
            >
              <template v-slot:activator="{ on, attrs }">
                <div class="px-1 clickable-status primary--text" v-bind="attrs" v-on="on" v-ripple="{ class: 'info--text' }">
                  Lv:{{ ship.level }}
                </div>
              </template>
              <v-card class="pa-3">
                <div class="d-flex mt-1">
                  <v-btn class="mr-1 px-0" small outlined @click="level = 1">Lv1</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 50" color="primary">Lv50</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 80" color="teal">Lv80</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 99" color="teal">Lv99</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 145" color="red lighten-2">Lv145</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 175" color="red lighten-2">Lv175</v-btn>
                </div>
                <div class="d-flex mt-4 pl-2">
                  <v-slider max="175" min="1" v-model="level" hide-details class="align-self-center"></v-slider>
                  <div class="menu-slider-text">
                    <v-text-field v-model.number="level" class="pt-0 mt-0" max="175" min="1" hide-details type="number"></v-text-field>
                  </div>
                </div>
              </v-card>
            </v-menu>
            <div class="d-flex mr-2">
              <v-menu
                offset-y
                v-model="luckMenu"
                :close-on-content-click="false"
                transition="slide-y-transition"
                bottom
                right
                @input="onLuckMenuToggle"
              >
                <template v-slot:activator="{ on, attrs }">
                  <div class="px-1 clickable-status" v-bind="attrs" v-on="on" v-ripple="{ class: 'info--text' }">
                    <span class="text--secondary">運:</span>
                    <span class="pl-1 font-weight-medium">{{ ship.luck }}</span>
                  </div>
                </template>
                <v-card class="pa-5">
                  <div class="d-flex mt-1">
                    <v-btn class="mx-2" @click="luck = ship.data.luck" :disabled="isNoShip">初期値</v-btn>
                    <v-btn class="mx-2" @click="luck = ship.data.maxLuck" color="primary" :disabled="isNoShip">最大値</v-btn>
                  </div>
                  <v-text-field
                    v-model.number="luck"
                    :max="isNoShip ? 100 : ship.data.maxLuck"
                    :min="ship.data.luck"
                    hide-details
                    type="number"
                  ></v-text-field>
                </v-card>
              </v-menu>
              <v-menu
                offset-y
                v-model="antiAirMenu"
                :close-on-content-click="false"
                transition="slide-y-transition"
                bottom
                right
                @input="onAAMenuToggle"
              >
                <template v-slot:activator="{ on, attrs }">
                  <div class="px-1 clickable-status" v-bind="attrs" v-on="on" v-ripple="{ class: 'info--text' }">
                    <span class="text--secondary">対空:</span>
                    <span class="pl-1 font-weight-medium">{{ ship.antiAir }}</span>
                  </div>
                </template>
                <v-card class="pa-5">
                  <div class="d-flex mt-1">
                    <v-btn class="mx-2" @click="antiAir = 0" :disabled="isNoShip">初期値</v-btn>
                    <v-btn class="mx-2" @click="antiAir = ship.data.antiAir" color="primary" :disabled="isNoShip">最大値</v-btn>
                  </div>
                  <v-text-field
                    v-model.number="antiAir"
                    :max="isNoShip ? 200 : ship.data.antiAir"
                    min="0"
                    hide-details
                    type="number"
                  ></v-text-field>
                </v-card>
              </v-menu>
            </div>
          </div>
          <div class="d-flex pl-1 clickable-status" v-ripple="{ class: 'info--text' }" @click="showShipList">
            <div class="ship-name text-truncate">{{ ship.data.name ? ship.data.name : "艦娘選択" }}</div>
          </div>
        </div>
        <!-- 艦娘解除 -->
        <div class="ship-remove pr-1 pt-1">
          <v-btn icon @click="removeShip">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="caption pl-3">
        <span class="text--secondary">割合撃墜:</span>
        <span class="ml-1 font-weight-medium">{{ rateDownValue }}%</span>
        <span class="ml-2 text--secondary">固定撃墜:</span>
        <span class="ml-1 font-weight-medium">{{ fixDown }}機</span>
        <template v-if="ship.hunshinRate">
          <span class="ml-2 text--secondary">噴進弾幕:</span>
          <span class="ml-1 font-weight-medium">{{ ship.hunshinRate.toFixed(1) }}%</span>
        </template>
      </div>
      <div class="d-flex caption pr-1 pl-3">
        <div class="align-self-center">
          <span class="text--secondary">制空:</span>
          <span class="ml-1 font-weight-medium">{{ ship.fullAirPower }}</span>
          <span class="ml-1 mr-2 text--secondary">{{ airPowerDetail }}</span>
        </div>
        <v-spacer></v-spacer>
        <div class="align-self-center d-flex">
          <v-btn icon small v-show="ship.isActive" @click="changeActive(false)">
            <v-icon small>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon small v-show="!ship.isActive" @click="changeActive(true)">
            <v-icon small>mdi-eye-off</v-icon>
          </v-btn>
          <div class="btn-item-reset">
            <v-btn icon small color="blue" @click="resetItems()">
              <v-icon small color="grey">mdi-close</v-icon>
            </v-btn>
            <div class="close-bar" :class="`item-count-${ship.items.length + 1}`"></div>
          </div>
        </div>
      </div>
      <v-divider class="mx-2"></v-divider>
      <!-- 装備一覧 -->
      <div class="px-2" v-if="!ship.isEmpty">
        <div @mouseenter="bootTooltip(item, $event)" @mouseleave="clearTooltip" v-for="(item, j) in ship.items" :key="j">
          <item-input
            v-model="ship.items[j]"
            :index="j"
            :max="99"
            :dragSlot="false"
            :init="ship.data.slots[j]"
            :handle-show-item-list="showItemList"
            :item-parent="ship"
            :handle-drag-start="clearTooltip"
            @input="updateItem"
          />
        </div>
        <!-- 補強増設枠 -->
        <div @mouseenter="bootTooltip(ship.exItem, $event)" @mouseleave="clearTooltip">
          <item-input
            v-model="ship.exItem"
            :index="99"
            :max="0"
            :init="0"
            :dragSlot="false"
            :handle-show-item-list="showItemList"
            :item-parent="ship"
            :handle-drag-start="clearTooltip"
            @input="updateItem"
          />
        </div>
      </div>
    </template>
    <v-tooltip
      v-model="enabledTooltip"
      color="black"
      bottom
      right
      transition="slide-y-transition"
      :position-x="tooltipX"
      :position-y="tooltipY"
    >
      <item-tooltip v-model="tooltipItem" />
    </v-tooltip>
  </v-card>
</template>

<style scoped>
.disabled {
  opacity: 0.5;
}

.ship-input.dragging * {
  pointer-events: none;
}
.drag-handle {
  cursor: move;
}

.empty-ship {
  height: 100%;
  min-height: 220px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  opacity: 0.8;
  font-size: 12px;
  transition: 0.3s;
}
.empty-ship:hover {
  opacity: 1;
  box-shadow: inset 0 0 12px rgba(0, 168, 255, 0.4);
}

.ship-header {
  position: relative;
}
.ship-remove {
  position: absolute;
  right: -4px;
  top: -4px;
  z-index: 1;
}

.clickable-status {
  border-radius: 0.2rem;
  cursor: pointer;
  transition: 0.2s;
}
.clickable-status:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.menu-slider-text {
  width: 60px;
  align-self: center;
  margin-left: 1rem;
}

.ship-name {
  flex-grow: 1;
  width: 100px;
  font-size: 0.8em;
  transition: 0.2s;
  cursor: pointer;
}

.btn-item-reset {
  position: relative;
  right: -2px;
}
.btn-item-reset .close-bar {
  left: 44%;
  margin-top: 3px;
  pointer-events: none;
  position: absolute;
  height: 24px;
  width: 3px;
  opacity: 0;
  transform: scale(1, 0);
  transform-origin: top;
  transition: 0.1s;
  background-color: rgb(128, 200, 255);
  box-shadow: 0px 0px 4px rgb(128, 200, 255);
  z-index: 0;
}
.btn-item-reset:hover .close-bar {
  transform: scale(1, 1);
  z-index: 1;
  opacity: 0.6;
}
.btn-item-reset:active .close-bar {
  box-shadow: 0px 0px 10px rgb(128, 200, 255);
  opacity: 1;
}
.close-bar.item-count-2 {
  height: 53px;
}
.close-bar.item-count-3 {
  height: 82px;
}
.close-bar.item-count-4 {
  height: 111px;
}
.close-bar.item-count-5 {
  height: 140px;
}
.close-bar.item-count-6 {
  height: 169px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from '@/components/item/ItemInput.vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import Ship, { ShipBuilder } from '@/classes/fleet/ship';
import Item from '@/classes/item/item';

export default Vue.extend({
  components: { ItemInput, ItemTooltip },
  name: 'ShipInput',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    handleShowShipList: {
      type: Function,
      required: true,
    },
    handleCloseShip: {
      type: Function,
      required: true,
    },
    value: {
      type: Ship,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    fixDown: {
      type: Number,
      default: 0,
    },
    rateDown: {
      type: Number,
      default: 0,
    },
  },
  data: () => ({
    level: 99,
    luck: 0,
    antiAir: 0,
    levelMenu: false,
    luckMenu: false,
    antiAirMenu: false,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  computed: {
    ship(): Ship {
      return this.value;
    },
    airPowerDetail(): string {
      const airPowers = this.ship.items.map((v) => (v.fullAirPower && !v.isRecon ? v.fullAirPower : 0));
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    isNoShip(): boolean {
      return this.value.data.id === 0;
    },
    rateDownValue(): number {
      return Math.floor(this.rateDown * 100);
    },
  },
  methods: {
    updateItem() {
      this.setShip();
    },
    setShip(value?: Ship) {
      if (value === undefined) {
        this.$emit('input', new Ship({ ship: this.ship }));
      } else {
        this.$emit('input', value);
      }
    },
    onLevelMenuToggle() {
      if (!this.levelMenu) {
        const builder: ShipBuilder = { ship: this.ship, level: this.level };
        this.setShip(new Ship(builder));
      } else {
        this.level = this.ship.level;
      }
    },
    onLuckMenuToggle() {
      if (!this.luckMenu) {
        const builder: ShipBuilder = { ship: this.ship, luck: this.luck };
        this.setShip(new Ship(builder));
      } else {
        this.luck = this.ship.luck;
      }
    },
    onAAMenuToggle() {
      if (!this.antiAirMenu) {
        const builder: ShipBuilder = { ship: this.ship, antiAir: this.antiAir };
        this.setShip(new Ship(builder));
      } else {
        this.antiAir = this.ship.antiAir;
      }
    },
    changeActive(value: boolean) {
      this.setShip(new Ship({ ship: this.ship, isActive: value }));
    },
    resetItems() {
      this.setShip(new Ship({ ship: this.value, items: [], exItem: new Item() }));
    },
    removeShip() {
      this.handleCloseShip(this.index);
    },
    showItemList(slotIndex: number): void {
      // 艦娘indexを付与してFleet.vueへスルーパス
      this.handleShowItemList(this.index, slotIndex);
    },
    showShipList(): void {
      // 艦娘indexを付与してFleet.vueへスルーパス
      this.handleShowShipList(this.index);
    },
    setDraggable(e: MouseEvent) {
      const target = e.target as HTMLDivElement;
      const parent = target.closest('.ship-input') as HTMLDivElement;
      parent.setAttribute('draggable', 'true');
    },
    resetDraggable(e: MouseEvent) {
      const target = e.target as HTMLDivElement;
      const parent = target.closest('.ship-input') as HTMLDivElement;
      parent.setAttribute('draggable', 'false');
    },
    dragStart(e: DragEvent) {
      // 子要素(item)のドラッグイベントが先におこっているならキャンセル
      const draggingDiv = document.getElementById('dragging-item');
      if (draggingDiv) {
        return;
      }
      const target = e.target as HTMLDivElement;
      if (this.value.isEmpty || !target || !target.classList || !target.classList.contains('ship-input') || !target.draggable) {
        return;
      }
      target.style.opacity = '0.6';
      target.id = 'dragging-item';

      // ドラッグ中セーブデータを一時保持
      this.$store.dispatch('setDraggingShipData', this.value);

      // 一時的に全てのship-inputの子要素マウスイベントを消す
      const shipInputList = document.getElementsByClassName('ship-input');
      for (let i = 0; i < shipInputList.length; i += 1) {
        shipInputList[i].classList.add('dragging');
      }
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.boxShadow = '';
    },
    dragEnter(e: DragEvent): void {
      const d = document.getElementById('dragging-item');
      const t = e.target as HTMLDivElement;
      if (!d || !d.classList.contains('ship-input') || !t || !t.classList.contains('ship-input') || this.value.isEmpty) {
        return;
      }
      // 受け入れ可能 背景色を青っぽく
      t.style.boxShadow = 'inset 0 0 80px rgba(20, 160, 255, 0.6)';
    },
    dropShip(e: DragEvent) {
      e.preventDefault();
      // 受け渡されたデータ
      const draggingDiv = document.getElementById('dragging-item');
      // そもそもドラッグ開始が正常になされているか
      if (!draggingDiv || !draggingDiv.classList.contains('ship-input')) {
        return;
      }

      // ドロップされる要素
      const target = e.target as HTMLDivElement;
      target.style.boxShadow = '';
      if (target.id) {
        // 自身へのドロップ禁止
        return;
      }
      if (this.value.isEmpty) {
        // 自身が艦娘データ以外であったら無理
        return;
      }
      // 一時退避していたデータをセット
      const moveData = this.$store.state.draggingShipData as Ship;
      // 自身をドラッグ元に受け渡すためセット
      this.$store.dispatch('setDraggingShipData', this.value);

      // インスタンスにセット
      this.setShip(moveData);

      draggingDiv.classList.add('move-ok');
    },
    dragEnd(e: DragEvent) {
      // まずは一時的に消していた全てのship-inputの子要素マウスイベントを復活
      const shipInputList = document.getElementsByClassName('ship-input');
      for (let i = 0; i < shipInputList.length; i += 1) {
        shipInputList[i].classList.remove('dragging');
      }

      const draggingDiv = document.getElementById('dragging-item') as HTMLDivElement;
      if (!draggingDiv || !draggingDiv.draggable || !draggingDiv.classList.contains('ship-input')) {
        // ドラッグ不可だったり、そもそもship-inputじゃなかったら以降受け入れない
        return;
      }
      const target = e.target as HTMLDivElement;
      target.style.opacity = '1';
      target.id = '';
      target.draggable = false;
      if (target.classList.contains('move-ok')) {
        target.classList.remove('move-ok');
      } else {
        return;
      }

      // 受け渡された対象の装備データと交換！
      const moveData = this.$store.state.draggingShipData as Ship;
      if (moveData) {
        // インスタンスにセット
        this.setShip(moveData);
      }
    },
    bootTooltip(item: Item, e: MouseEvent) {
      if (!item.data.id) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      this.tooltipTimer = setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width / 3;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
        this.enabledTooltip = true;
      }, 400);
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
