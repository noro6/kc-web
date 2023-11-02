<template>
  <v-card class="mx-1 pt-1" @dragover.prevent @drop.stop>
    <div class="d-flex">
      <div class="ml-2 airbase-title">{{ $t("Airbase.第x基地航空隊", { number: index + 1 }) }}</div>
      <v-spacer />
      <div class="mr-1 mode-select">
        <v-select class="mt-0" dense v-model="airbase.mode" hide-details :items="modes" @change="updateItem" :disabled="!hasItem" />
      </div>
      <div class="mr-1 operation-buttons">
        <v-btn color="blue lighten-1" icon small @click="viewDetail" :disabled="!enabledDetail">
          <v-icon small>mdi-information-outline</v-icon>
        </v-btn>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small color="orange lighten-2" v-bind="attrs" v-on="on" @click="showTempAirbaseList()">
              <v-icon small>mdi-clipboard</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Airbase.基地クリップボード") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small color="deep-orange lighten-1" v-bind="attrs" v-on="on" @click="showItemPresets()">
              <v-icon small>mdi-briefcase-variant</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("ItemList.装備プリセット") }}</span>
        </v-tooltip>
        <v-btn icon small @click="resetItems">
          <v-icon small>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div>
      <div class="sub-status-area caption pl-2" v-if="hasItem">
        <div>
          {{ $t("Common.制空") }}<span class="ml-1 font-weight-medium">{{ airPower }}</span>
        </div>
        <template v-if="!visibleResource">
          <div class="ml-1 text--secondary font-weight-medium">{{ airPowerDetail }}</div>
          <div class="ml-1 text--secondary font-weight-medium" v-if="reconCorrString">&times;{{ reconCorrString }}</div>
          <div class="ml-1 text--secondary font-weight-medium" v-if="reconCorrDefString">&times;{{ reconCorrDefString }}</div>
        </template>
        <div :class="{ 'ml-auto': !visibleResource, 'ml-2': visibleResource }">
          {{ $t("Common.半径") }}<span class="mx-1 font-weight-medium">{{ airbase.radius }}</span>
        </div>
        <template v-if="visibleResource">
          <div class="ml-auto"><v-img :src="`./img/util/fuel.png`" height="18" width="18" /></div>
          <div class="mx-1 font-weight-medium">{{ airbase.fuel }}</div>
          <div><v-img :src="`./img/util/ammo.png`" height="18" width="18" /></div>
          <div class="mx-1 font-weight-medium">{{ airbase.ammo }}</div>
          <div v-if="airbase.steel"><v-img :src="`./img/util/steel.png`" height="18" width="18" /></div>
          <div v-if="airbase.steel" class="mx-1 font-weight-medium">{{ airbase.steel }}</div>
          <div><v-img :src="`./img/util/bauxite.png`" height="18" width="18" /></div>
          <div class="mx-1 font-weight-medium">{{ airbase.bauxite }}</div>
        </template>
        <div>
          <v-btn icon small @click="visibleResource = !visibleResource">
            <v-icon>mdi-menu-down</v-icon>
          </v-btn>
        </div>
      </div>
      <v-btn v-else small @click="showBatchItemList()" text>{{ $t("ItemList.一括配備") }}</v-btn>
      <v-divider class="item-input-divider" />
      <div
        v-for="(item, i) in airbase.items"
        :key="i"
        @mouseenter="bootTooltip(item, $event)"
        @mouseleave="clearTooltip"
        @focus="bootTooltip(item, $event)"
        @blur="clearTooltip"
      >
        <item-input
          v-model="airbase.items[i]"
          :index="i"
          :item-parent="airbase"
          :handle-show-item-list="showItemList"
          :max="item.data.airbaseMaxSlot"
          :init="item.data.airbaseMaxSlot"
          :handle-drag-start="clearTooltip"
          @input="updateItem"
        />
      </div>
      <div v-if="showAirStatusBar" class="mx-1 pb-2">
        <template v-if="!isWait">
          <air-status-result-bar :result="airbase.resultWave1" :dense="true" class="mt-3" />
          <air-status-result-bar :result="airbase.resultWave2" :dense="true" class="mt-3" />
        </template>
        <template v-else>
          <air-status-result-bar :result="emptyResult" :dense="true" class="mt-3" />
          <air-status-result-bar :result="emptyResult" :dense="true" class="mt-3" />
        </template>
      </div>
    </div>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <item-tooltip v-model="tooltipItem" :is-airbase-mode="true" />
    </v-tooltip>
    <v-dialog width="1200" v-model="detailDialog" transition="scroll-x-transition" @input="toggleDetailDialog">
      <v-card class="px-2 pb-2" v-if="!destroyDialog">
        <div class="d-flex pt-2 pb-1">
          <div class="align-self-center ml-3">{{ $t("Airbase.基地航空隊詳細") }}</div>
          <div class="align-self-center ml-3 body-2">-{{ $t("Airbase.第x基地航空隊", { number: index + 1 }) }}</div>
          <v-spacer />
          <v-btn icon @click="closeDetail">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider />
        <v-tabs v-model="tab">
          <v-tab href="#contact">{{ $t("Fleet.触接") }}</v-tab>
          <v-tab href="#detail">{{ $t("Result.残機数詳細") }}</v-tab>
        </v-tabs>
        <v-divider />
        <v-tabs-items v-model="tab">
          <v-tab-item value="contact">
            <contact-rates :fleet="value" />
          </v-tab-item>
          <v-tab-item value="detail">
            <plane-detail-result :arg-parent="value" :index="index" :handle-change-items="updateDetailFormItems" />
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.airbase-title {
  cursor: move;
  font-size: 0.9em;
  align-self: flex-end;
}
.mode-select {
  width: 80px;
}
.sub-status-area {
  display: flex;
  align-items: center;
}
.operation-buttons {
  align-self: flex-end;
}
.operation-buttons .v-icon {
  font-size: 20px !important;
}

body.item-ui-border .item-input-divider {
  display: none !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from '@/components/item/ItemInput.vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import PlaneDetailResult from '@/components/result/PlaneDetailResult.vue';
import ContactRates from '@/components/result/ContactRates.vue';
import Airbase from '@/classes/airbase/airbase';
import Const, { AB_MODE } from '@/classes/const';
import Item from '@/classes/item/item';
import SiteSetting from '@/classes/siteSetting';
import AirCalcResult from '@/classes/airCalcResult';

export default Vue.extend({
  components: {
    ItemInput,
    AirStatusResultBar,
    ItemTooltip,
    PlaneDetailResult,
    ContactRates,
  },
  name: 'AirbaseComponent',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    handleShowBatchItemList: {
      type: Function,
    },
    value: {
      type: Airbase,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isDefense: {
      type: Boolean,
      required: true,
    },
    handleShowItemPresets: {
      type: Function,
      required: true,
    },
    handleShowTempAirbaseList: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    tab: 'detail',
    wave1: 0,
    wave2: 0,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipX: 0,
    tooltipY: 0,
    destroyDialog: false,
    detailDialog: false,
    visibleResource: false,
    emptyResult: new AirCalcResult(),
    detailEditableItems: [] as Item[],
  }),
  computed: {
    modes(): { text: string; value: number }[] {
      if (this.$i18n.locale !== 'ja') {
        const items = [];
        for (let i = 0; i < Const.AB_MODE_ITEMS.length; i += 1) {
          const { text, value } = Const.AB_MODE_ITEMS[i];
          items.push({ text: `${this.$t(`Airbase.${text}`)}`, value });
        }
        return items;
      }
      return Const.AB_MODE_ITEMS;
    },
    airbase(): Airbase {
      return this.value;
    },
    airPower() {
      if (this.value.mode === AB_MODE.DEFENSE) {
        return this.value.defenseAirPower;
      }
      return this.value.fullAirPower;
    },
    airPowerDetail() {
      if (this.value.mode === AB_MODE.DEFENSE) {
        const airPowers = this.value.items.map((v) => v.defenseAirPower);
        return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
      }
      const airPowers = this.value.items.map((v) => v.fullAirPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    reconCorrString() {
      return this.value.mode === AB_MODE.BATTLE && this.value.reconCorr > 1 ? `${this.value.reconCorr}` : '';
    },
    reconCorrDefString() {
      return this.value.mode === AB_MODE.DEFENSE && this.value.reconCorrDefense > 1 ? `${this.value.reconCorrDefense}` : '';
    },
    resultStateRate() {
      const wave1 = this.value.resultWave1;
      const wave2 = this.value.resultWave2;
      return [Math.floor(wave1.rates[wave1.airState.value]), Math.floor(wave2.rates[wave2.airState.value])];
    },
    resultLabel() {
      const wave1State = this.value.resultWave1.airState;
      const wave2State = this.value.resultWave2.airState;
      return [wave1State.text, wave2State.text];
    },
    resultBarValue() {
      return [this.value.resultWave1.airStateBarWidth, this.value.resultWave2.airStateBarWidth];
    },
    hasItem() {
      return this.value.items.some((v) => v.data.id > 0);
    },
    enabledDetail() {
      return this.value.mode === AB_MODE.BATTLE && this.value.items.some((v) => v.data.id > 0);
    },
    showAirStatusBar(): boolean {
      return !this.isDefense && this.value.mode !== AB_MODE.DEFENSE;
    },
    isWait(): boolean {
      return this.value.mode === AB_MODE.WAIT;
    },
  },
  methods: {
    updateItem() {
      this.setAirbase();
    },
    setAirbase(arg?: Airbase) {
      this.clearTooltip();
      if (arg === undefined) {
        this.$emit('input', new Airbase({ airbase: this.airbase }));
      } else {
        this.$emit('input', arg);
      }
    },
    showItemList(index: number) {
      this.clearTooltip();
      this.handleShowItemList(this.index, index);
    },
    showBatchItemList() {
      if (this.handleShowBatchItemList) {
        this.handleShowBatchItemList(this.index);
      }
    },
    resetItems(): void {
      this.setAirbase(new Airbase());
    },
    viewDetail(): void {
      this.detailEditableItems = [];
      this.destroyDialog = false;
      this.detailDialog = true;
    },
    closeDetail() {
      this.detailDialog = false;
      if (this.detailEditableItems.length) {
        // 詳細計算画面にて変更された装備を適用する
        const items = [];
        for (let i = 0; i < this.detailEditableItems.length; i += 1) {
          const editedItem = this.detailEditableItems[i];
          items.push(new Item({ item: editedItem }));
        }
        this.$emit('input', new Airbase({ airbase: this.airbase, items }));
        setTimeout(() => {
          this.destroyDialog = true;
        }, 100);
      }
    },
    toggleDetailDialog() {
      if (!this.detailDialog) {
        this.closeDetail();
      } else {
        this.destroyDialog = false;
      }
    },
    showItemPresets() {
      this.handleShowItemPresets(this.index);
    },
    showTempAirbaseList() {
      this.handleShowTempAirbaseList(this.index);
    },
    updateDetailFormItems(items: Item[]) {
      // 詳細計算画面にて装備の変更があったときに発火
      this.detailEditableItems = items;
    },
    bootTooltip(item: Item, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (!item.data.id || setting.disabledItemTooltip) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width / 3;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
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
