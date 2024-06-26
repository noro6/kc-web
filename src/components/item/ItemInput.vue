<template>
  <div
    v-ripple="{ class: 'info--text' }"
    :class="itemClass"
    :draggable="isDraggable"
    @dragstart.stop="dragStart(item, $event)"
    @dragenter="dragEnter($event)"
    @dragleave="dragLeave($event)"
    @drop.stop="dropItem($event)"
    @dragend="dragEnd($event)"
    @dragover.prevent
  >
    <!-- 搭載数 -->
    <v-menu
      v-if="!dense"
      offset-y
      :close-on-content-click="false"
      transition="slide-y-transition"
      bottom
      right
      :disabled="!item.data.isPlane || isExpandSlot || readonly || draggingNow"
      v-model="slotMenu"
      @input="onSlotMenuToggle"
    >
      <template v-slot:activator="{ on, attrs }">
        <div v-bind="attrs" v-on="on" class="item-slot">
          <span v-if="!isExpandSlot">{{ item.fullSlot }}</span>
          <v-icon v-else-if="!isReleased" :class="{ 'no-stock': item.noStock }">mdi-cancel</v-icon>
          <v-icon v-else>mdi-wrench</v-icon>
        </div>
      </template>
      <v-card class="px-2">
        <div class="d-flex px-2">
          <v-text-field class="slot-input" type="number" :max="max" min="0" v-model.number="slotValue" />
          <v-btn depressed class="ml-2 align-self-center" @click="slotValue = init">{{ $t("Common.初期値") }}</v-btn>
        </div>
        <v-slider :max="max" min="0" v-model="slotValue"></v-slider>
      </v-card>
    </v-menu>
    <!-- 装備種別 -->
    <div class="item-icon" :class="{ 'mx-1': !dense, draggable: isDraggable }">
      <img v-if="item.data.iconTypeId > 0" :src="`./img/type/icon${item.data.iconTypeId}.png`" alt="item-icon" />
    </div>
    <!-- 装備名称 -->
    <div
      class="item-name text-truncate"
      :class="{ 'text--secondary': isNoItem, 'is-special': item.data.isSpecial, 'no-stock': item.noStock }"
      @click.stop="showItemList()"
      @keypress.enter="showItemList()"
    >
      {{ itemName }}
      <!-- 秋刀魚特効表示特別対応 -->
      <div class="saury-bonus" v-if="bonusText === 'Saury'">
        <v-icon v-if="$vuetify.theme.dark" color="light-blue lighten-3">mdi-fish mdi-rotate-315</v-icon>
        <v-icon v-else color="light-blue lighten-2">mdi-fish mdi-rotate-315</v-icon>
      </div>
      <!-- 特効装備表記 -->
      <div class="item-special-text" v-else-if="bonusText">
        <div class="align-self-center">{{ bonusText }}</div>
      </div>
    </div>
    <template v-if="!isNoItem && (!readonly || item.remodel > 0 || item.level > 0)">
      <!-- 改修値 -->
      <v-menu offset-y transition="slide-y-transition" left :disabled="readonly || draggingNow || isEnemy">
        <template v-slot:activator="{ on, attrs }">
          <div class="item-remodel" v-bind="attrs" v-on="on" :class="{ 'no-remodel': !item.data.canRemodel, 'value-0': item.remodel === 0 }">
            <v-icon v-if="dense" x-small :color="remodelIconColor">mdi-star</v-icon>
            <v-icon v-else small :color="remodelIconColor">mdi-star</v-icon>
            <span :class="remodelLabelColor">{{ item.remodel }}</span>
          </div>
        </template>
        <v-card>
          <div class="d-flex flex-column flex-sm-row">
            <div v-for="i in 11" :key="i" @click="setRemodel(i - 1)" @keypress.enter="setRemodel(i - 1)" class="remodel-list-item">
              <v-icon small color="teal accent-4">mdi-star</v-icon>
              <span class="teal--text text--accent-4">{{ i - 1 }}</span>
            </div>
          </div>
        </v-card>
      </v-menu>
      <!-- 熟練度 -->
      <v-menu offset-y transition="slide-y-transition" left :disabled="!item.data.isPlane || isExpandSlot || readonly || draggingNow || isEnemy">
        <template v-slot:activator="{ on, attrs }">
          <div class="item-level" v-bind="attrs" v-on="on">
            <v-img v-if="dense" :src="`./img/util/prof${item.levelAlt}.png`" height="16" width="12" />
            <v-img v-else :src="`./img/util/prof${item.levelAlt}.png`" height="24" width="18" />
            <span class="level-value">{{ item.level }}</span>
          </div>
        </template>
        <v-card>
          <div class="d-flex flex-column flex-sm-row">
            <div
              v-for="i in 9"
              :key="i - 1"
              v-ripple="{ class: 'info--text' }"
              class="level-list-item"
              @click="setLevel(i - 1)"
              @keypress.enter="setLevel(i - 1)"
            >
              <v-img :src="`./img/util/prof${i - 1}.png`" width="18" height="24" />
              <span class="level-list-value">{{ getLevelValue(i - 1) }}</span>
            </div>
          </div>
        </v-card>
      </v-menu>
      <!-- 解除 -->
      <div class="ml-1 item-remove align-self-center">
        <v-tooltip top color="black" :open-delay="200" :disabled="!deathIndicatorColor">
          <template v-slot:activator="{ on, attrs }">
            <v-hover v-slot="{ hover }">
              <v-btn v-show="isDraggable" icon x-small @click="removeItem()" v-bind="attrs" v-on="on">
                <v-icon small v-if="hover" :color="deathIndicatorColor">mdi-close</v-icon>
                <template v-else-if="deathIndicatorColor">
                  <v-icon x-small v-if="isTriangleIcon" :color="deathIndicatorColor">mdi-triangle</v-icon>
                  <v-icon small v-else :color="deathIndicatorColor">mdi-record</v-icon>
                </template>
              </v-btn>
            </v-hover>
          </template>
          <span>{{ $t("Result.全滅率") }} {{ item.deathRate }} %</span>
        </v-tooltip>
      </div>
    </template>
  </div>
</template>

<style scoped>
.item-input {
  display: flex;
  align-items: center;
  transition: 0.2s;
}
.item-input:hover {
  box-shadow: inset 0 0 24px rgba(0, 190, 255, 0.2);
}
.item-input > * {
  user-select: none;
}
.item-input.dragging * {
  pointer-events: none;
}
#dragging-item {
  opacity: 0.5;
}
.item-slot {
  text-align: right;
  font-size: 0.9em;
  width: 24px;
  white-space: nowrap;
  transition: 0.3s ease-out;
}
.item-slot:hover {
  filter: drop-shadow(0 0 2px #000);
}
.theme--dark .item-slot:hover {
  filter: drop-shadow(0 0 2px #fff);
}
.item-slot .v-icon {
  font-size: 18px;
}

.item-icon.draggable {
  cursor: move;
}
.item-icon,
.item-icon img {
  text-align: center;
  width: 27px;
  height: 27px;
}
.item-icon i {
  font-size: 1.2em;
  opacity: 0.6;
}
.item-icon img {
  user-select: none;
  pointer-events: none;
  -webkit-user-drag: none;
  -moz-user-select: none;
}

.item-name {
  flex-grow: 1;
  cursor: pointer;
  width: 10px;
  font-size: 0.8em;
  line-height: 25px;
  position: relative;
}
.is-special {
  color: #388e3c;
}
.theme--dark .is-special {
  color: #66bb6a;
}
.item-special-text {
  display: flex;
  justify-content: center;
  background-color: rgba(250, 250, 255, 0.9);
  border: 2px solid rgb(83, 158, 255);
  color: #000;
  font-weight: bold;
  position: absolute;
  font-size: 12px;
  font-weight: bold;
  padding-left: 4px;
  padding-right: 4px;
  min-width: 26px;
  border-radius: 0.1rem;
  right: 0px;
  height: 24px;
  top: 0px;
}

.saury-bonus {
  position: absolute;
  right: 0px;
  bottom: 0px;
  filter: drop-shadow(0 0 1px #000);
}
.theme--dark .saury-bonus {
  filter: drop-shadow(0 0 3px #000);
}

.item-remodel {
  width: 38px;
  transition: 0.3s ease-out;
}
.item-remodel:hover {
  filter: drop-shadow(0 0 2px #21ffda);
}
.theme--dark .item-remodel:hover {
  filter: drop-shadow(0 0 2px #68ffde);
}
.item-remodel.value-0:hover {
  filter: drop-shadow(0 0 2px #bbb);
}
.item-remodel.no-remodel:hover {
  filter: drop-shadow(0 0 2px #ff836d);
}
.item-remodel.no-remodel.value-0 {
  transition: 0.1s;
  opacity: 0;
}
.item-input:not(.readonly):hover .item-remodel.no-remodel.value-0 {
  opacity: 1;
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
  transition: 0.3s ease-out;
}
.item-level:hover {
  filter: drop-shadow(0 0 2px #ccc);
}
.theme--dark .item-level:hover {
  filter: drop-shadow(0 0 2px #fff);
}

.slot-input,
.level-input {
  width: 120px;
}
.item-remove {
  width: 20px;
}
.captured .item-remove {
  opacity: 0;
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
  text-shadow: 1px 1px 1px #fff, -1px -1px 1px #fff, -1px 1px 1px #fff, 1px -1px 1px #fff, 1px 0px 1px #fff, -1px -0px 1px #fff, 0px 1px 1px #fff,
    0px -1px 1px #fff;
}
.theme--dark .level-value,
.theme--dark .level-list-value {
  text-shadow: 1px 1px 1px #222, -1px -1px 1px #222, -1px 1px 1px #222, 1px -1px 1px #222, 1px 0px 1px #222, -1px -0px 1px #222, 0px 1px 1px #222,
    0px -1px 1px #222;
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
.no-stock {
  color: rgb(255, 100, 100) !important;
}

/** 装備置き場用最小サイズ */
.minify-size .item-name {
  font-size: 12px;
}
.minify-size .item-remodel {
  width: 26px;
}
.minify-size .item-remodel span {
  font-size: 0.7em;
}
.minify-size .level-value {
  font-size: 10px;
}
.minify-size .item-icon {
  display: flex;
  align-items: center;
  width: 20px;
}
.minify-size .item-icon img {
  width: 20px;
  height: 20px;
}

/** 読み取り専用など */
.readonly .item-slot,
.readonly .item-name,
.readonly .item-level,
.readonly .item-remodel {
  cursor: default;
}
/** 非航空機の場合は搭載数を薄く */
.not-plane .item-slot {
  opacity: 0.6;
}
/** その他けしてもいいやつ */
.not-plane .item-level,
.expand .item-level {
  cursor: default;
  opacity: 0;
}
.expand.disabled-expand.no-item * {
  opacity: 0.4;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Item, { ItemBuilder } from '@/classes/item/item';
import ItemMaster from '@/classes/item/itemMaster';
import Ship from '@/classes/fleet/ship';
import Const from '@/classes/const';
import ShipValidation from '@/classes/fleet/shipValidation';
import SiteSetting from '@/classes/siteSetting';
import Airbase from '@/classes/airbase/airbase';

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
    dragSlot: {
      type: Boolean,
      default: true,
    },
    itemParent: {
      type: Ship,
      default: undefined,
    },
    handleDragStart: {
      type: Function,
    },
    isEnemy: {
      type: Boolean,
      default: false,
    },
    isReleased: {
      type: Boolean,
      default: true,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    slotMenu: false,
    slotValue: 0,
    draggingNow: false,
  }),
  computed: {
    item(): Item {
      return this.value;
    },
    isExpandSlot() {
      return this.index === Const.EXPAND_SLOT_INDEX;
    },
    isNoItem() {
      return this.value.data.id === 0;
    },
    setting(): SiteSetting {
      return this.$store.state.siteSetting as SiteSetting;
    },
    needTrans(): boolean {
      return this.$i18n.locale !== 'ja' && !this.setting.nameIsNotTranslate;
    },
    itemName() {
      if (this.needTrans && this.value.data.name) {
        return this.$t(`${this.value.data.name}`);
      }
      if (this.isExpandSlot && !this.isReleased && this.isNoItem) {
        return this.$t('Fleet.補強増設未開放');
      }
      return this.value.data.name || this.$t('Fleet.未装備');
    },
    isDraggable() {
      return this.value.data.id > 0 && !this.readonly;
    },
    remodelIconColor(): string {
      if (this.item.data.canRemodel) {
        if (this.$vuetify.theme.dark) {
          return this.item.remodel > 0 ? 'teal accent-4' : 'grey';
        }
        return this.item.remodel > 0 ? 'teal accent-4' : 'grey lighten-1';
      }
      return 'red lighten-2';
    },
    remodelLabelColor(): string {
      if (this.item.data.canRemodel) {
        return this.item.remodel > 0 ? 'teal--text text--accent-4' : 'grey--text text-lighten-1';
      }
      return 'red--text text--lighten-2';
    },
    itemClass() {
      const classes = ['item-input', `type-${this.value.data.iconTypeId}`];
      if (this.readonly) {
        classes.push('readonly');
      }
      if (this.isExpandSlot) {
        classes.push('expand');
        if (!this.isReleased) {
          classes.push('disabled-expand');
        }
      }
      if (this.isNoItem) {
        classes.push('no-item');
      }
      if (!this.value.data.isPlane) {
        classes.push('not-plane');
      }
      if (!this.isDraggable) {
        classes.push('disabled-draggable');
      }
      if (this.dense) {
        classes.push('minify-size');
      }
      return classes.join(' ');
    },
    bonusText(): string {
      if (!this.value.data.id || !this.value.data.bonuses.length || !this.setting.displayBonusKey) {
        return '';
      }
      const key = this.setting.displayBonusKey;
      const bonus = this.value.data.bonuses.find((v) => v.key === key);
      return bonus ? bonus.text : '';
    },
    deathIndicatorColor(): string {
      // 全滅率インジケーターのカラー設定 表示有無もこれの返り値で判定
      if (!this.value.data.isPlane || !this.value.deathRate || !this.setting.showDeathRateIndicator) {
        return '';
      }

      if (this.value.deathRate < 10) {
        return 'amber';
      }
      if (this.value.deathRate < 20) {
        return 'orange darken-3';
      }
      return 'red darken-2';
    },
    isTriangleIcon(): boolean {
      // 全滅率インジケーターを三角表示にするかどうか
      return this.setting.isGraphicModeDeathRateIndicator && this.value.deathRate >= 10;
    },
  },
  methods: {
    setItem(value: Item) {
      this.$emit('input', value);
    },
    onSlotMenuToggle() {
      if (!this.slotMenu) {
        // 搭載数メニューCloseイベント
        const builder: ItemBuilder = { item: this.item, slot: Math.floor(this.slotValue) };
        this.setItem(new Item(builder));
      } else {
        // 搭載数メニューOpenイベント
        this.slotValue = this.item.fullSlot;
      }
    },
    removeItem() {
      this.setItem(new Item());
    },
    setLevel(value: number) {
      const builder: ItemBuilder = { item: this.item, level: Const.PROF_LEVEL_BORDER[value] };
      this.setItem(new Item(builder));
    },
    setRemodel(value: number) {
      const builder: ItemBuilder = { item: this.item, remodel: value };
      this.setItem(new Item(builder));
    },
    getLevelValue(value: number) {
      return Const.PROF_LEVEL_BORDER[value];
    },
    showItemList() {
      this.handleShowItemList(this.index);
    },
    dragStart(item: Item, e: DragEvent) {
      const target = e.target as HTMLDivElement;
      // ドラッグ開始条件 item-inputクラスがなかったりしたらドラッグ開始させない
      if (!this.isDraggable || !target || !target.classList || !target.classList.contains('item-input') || !target.draggable) {
        return;
      }
      const transfer = e.dataTransfer as DataTransfer;
      transfer.setData('text/plain', JSON.stringify(item));
      // ドラッグ元を一意識別するためのclassを追加
      target.id = 'dragging-item';
      target.dataset.itemId = `${this.value.data.id}`;
      target.dataset.remodel = `${this.value.remodel}`;
      target.dataset.apiType = `${this.value.data.apiTypeId}`;
      target.dataset.isPlane = `${this.value.data.isPlane ? 'true' : ''}`;

      // 一時的に全てのitem inputの子要素マウスイベントを消す
      const itemInputs = document.getElementsByClassName('item-input');
      for (let i = 0; i < itemInputs.length; i += 1) {
        itemInputs[i].classList.add('dragging');
      }

      this.draggingNow = true;
      this.handleDragStart();
    },
    dragEnter(e: DragEvent): void {
      const draggingDiv = document.getElementById('dragging-item');
      const target = e.target as HTMLDivElement;
      if (!draggingDiv || !target || !target.classList || !target.classList.contains('item-input')) {
        return;
      }
      if (target.classList.contains('disabled-drop')) {
        // 判定済み -搭載不可
        target.style.backgroundColor = 'rgba(255, 128, 128, 0.6)';
        return;
      }
      if (target.classList.contains('enabled-drop')) {
        // 判定済み -搭載可
        target.style.backgroundColor = 'rgba(80, 160, 255, 0.6)';
        return;
      }
      // 装備搭載可能チェック
      if (!draggingDiv || !draggingDiv.dataset.itemId || !draggingDiv.dataset.apiType) {
        return;
      }
      const item = new ItemMaster();
      item.id = +draggingDiv.dataset.itemId;
      item.apiTypeId = +draggingDiv.dataset.apiType;
      const remodel = draggingDiv.dataset.remodel ? +draggingDiv.dataset.remodel : 0;
      if (
        (this.itemParent instanceof Ship && !ShipValidation.isValidItem(this.itemParent.data, item, this.index, remodel))
        || (this.itemParent instanceof Airbase && !draggingDiv.dataset.isPlane)
      ) {
        // 搭載不可なので背景色を変な色にする
        target.style.backgroundColor = 'rgba(255, 128, 128, 0.6)';
        // 毎回判定していたらダルいので2回目以降判定しないフラグ持たせておく
        target.classList.add('disabled-drop');
      } else {
        // 受け入れ可能 背景色を青っぽく
        target.style.backgroundColor = 'rgba(80, 160, 255, 0.6)';
        // 毎回判定していたらダルいので2回目以降判定しないフラグ持たせておく
        target.classList.add('enabled-drop');
      }
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.backgroundColor = '';
    },
    dropItem(e: DragEvent) {
      const draggingDiv = document.getElementById('dragging-item');
      // そもそもドラッグ開始が正常になされているか？
      if (!draggingDiv || !draggingDiv.classList.contains('item-input')) {
        return;
      }
      const target = e.target as HTMLDivElement;
      target.style.backgroundColor = '';

      if (!target.classList.contains('enabled-drop')) {
        // ここにはドロップ不可なのでやめやめ！
        return;
      }
      // 受け渡されたデータ
      const droppedData = (e.dataTransfer as DataTransfer).getData('text/plain');
      // 元々あったitem情報があれば、ドロップ元のdataに一時保管
      if (!this.isNoItem && !e.ctrlKey && draggingDiv) {
        const prevData = JSON.stringify(this.item);
        draggingDiv.dataset.item = prevData;
      }
      if (!e.ctrlKey && draggingDiv) {
        // ドロップ成功したならドラッグ元を消すつもりでIKEYA！
        draggingDiv.classList.add('delete-flg');
      }

      // ドロップされたデータで上書きする
      if (droppedData) {
        const builder: ItemBuilder = { item: JSON.parse(droppedData) as Item };
        if (!this.dragSlot) {
          // 搭載数変更しないオプションがついている => 専ら艦娘画面でのドラッグ操作
          if (builder.item && builder.item.data.apiTypeId === 41) {
            // 大型飛行艇で上書きする => 搭載数を1に減少させる
            builder.slot = 1;
          } else if (this.value.data.apiTypeId === 41) {
            // もともと大型飛行艇が入っていた => 搭載数を引き継がず、初期搭載にする
            builder.slot = this.init;
          } else {
            // 元々入っていた装備の搭載数を引き継ぐ
            builder.slot = this.value.fullSlot;
          }
        }

        if (this.itemParent instanceof Airbase && builder.item) {
          // 基地航空隊の場合 => 既定搭載数より大きかったら戻す
          builder.slot = Math.min(builder.slot ?? builder.item.slot, builder.item.data.airbaseMaxSlot);
        }
        this.setItem(new Item(builder));
      }
    },
    dragEnd() {
      // まずはいままで消していたマウスイベントを復帰させる
      const itemInputs = document.getElementsByClassName('item-input');
      for (let i = 0; i < itemInputs.length; i += 1) {
        itemInputs[i].classList.remove('dragging');
      }

      // 判定されていた全てのitem-input情報から判定を解除
      const elements1 = document.getElementsByClassName('enabled-drop');
      while (elements1.length > 0) {
        elements1[0].classList.remove('enabled-drop');
      }
      const elements2 = document.getElementsByClassName('disabled-drop');
      while (elements2.length > 0) {
        elements2[0].classList.remove('disabled-drop');
      }

      const draggingDiv = document.getElementById('dragging-item') as HTMLDivElement;
      if (!draggingDiv || !draggingDiv.draggable) {
        // そもそもドラッグ不可ならなんもせず終わる
        return;
      }
      // ドラッグ元を一意識別するためのidを削除
      draggingDiv.id = '';
      delete draggingDiv.dataset.itemId;
      delete draggingDiv.dataset.remodel;
      delete draggingDiv.dataset.apiType;
      delete draggingDiv.dataset.isPlane;

      const builder: ItemBuilder = {};
      if (!this.dragSlot) {
        // 搭載数変更しないオプションがついているなら搭載数は据え置く
        builder.slot = this.value.fullSlot;
      }

      // 受け渡された対象の装備データ あれば。
      const itemData = draggingDiv.dataset.item;
      if (itemData) {
        // 交換
        builder.item = JSON.parse(itemData) as Item;
        // 交換前にチェック
        if (this.itemParent instanceof Ship) {
          if (!ShipValidation.isValidItem(this.itemParent.data, builder.item.data, this.index, builder.item.remodel)) {
            // 搭載不可なので外す
            builder.item = undefined;
            this.setItem(new Item(builder));
            delete draggingDiv.dataset.item;
          } else {
            // 日進 & 大型飛行艇調整
            if (builder.item.data.apiTypeId === 41) {
              // 交換として受け渡されてきた装備が大型飛行艇 => 搭載数を1に矯正
              builder.slot = 1;
            } else if (this.value.data.apiTypeId === 41) {
              // 元々ここにあった装備が大型飛行艇 => 搭載数をいったん初期値に矯正
              builder.slot = this.init;
            }
            this.setItem(new Item(builder));
            delete draggingDiv.dataset.item;
          }
        } else if (builder.item && builder.item.data.isPlane) {
          this.setItem(new Item(builder));
          delete draggingDiv.dataset.item;
        } else {
          // 搭載不可なので外す
          builder.item = undefined;
          this.setItem(new Item(builder));
          delete draggingDiv.dataset.item;
        }
      } else if (draggingDiv.classList.contains('delete-flg')) {
        // 外す処理
        draggingDiv.classList.remove('delete-flg');
        this.setItem(new Item(builder));
      } else {
        // 計算を発火
        this.setItem(new Item({ item: this.value }));
      }

      // drag処理の終了
      this.draggingNow = false;
    },
  },
});
</script>
