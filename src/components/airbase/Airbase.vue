<template>
  <v-card class="mx-1 pt-1 pb-2" @dragover.prevent @drop.stop>
    <div class="d-flex mb-1">
      <div class="ml-2 align-self-end airbase-title">第{{ index + 1 }}基地航空隊</div>
      <v-spacer></v-spacer>
      <div class="mr-1 mode-select">
        <v-select dense v-model="airbase.mode" hide-details :items="modes" @change="updateItem" :disabled="!enabledDetail"></v-select>
      </div>
      <div class="mr-1 align-self-end">
        <v-btn color="info" icon small @click="viewDetail" :disabled="!enabledDetail">
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
        <v-btn icon small @click="resetItems" :disabled="!enabledDetail">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="airbase-body">
      <div class="d-flex caption pl-2 sub-status-area">
        <div>
          制空:<span class="ml-1 font-weight-medium">{{ airPower }}</span>
        </div>
        <template v-if="!visibleResource">
          <div class="ml-1 text--secondary font-weight-medium">{{ airPowerDetail }}</div>
          <div class="ml-1 text--secondary font-weight-medium" v-if="reconCorrString">&times;{{ reconCorrString }}</div>
          <div class="ml-1 text--secondary font-weight-medium" v-if="reconCorrDefString">&times;{{ reconCorrDefString }}</div>
        </template>
        <div :class="{ 'ml-auto': !visibleResource, 'ml-2': visibleResource }">
          半径:<span class="mx-1 font-weight-medium">{{ airbase.range }}</span>
        </div>
        <template v-if="visibleResource">
          <div class="ml-auto"><v-img :src="`./img/util/fuel.png`" height="18" width="18"></v-img></div>
          <div class="mx-1 font-weight-medium">{{ airbase.fuel }}</div>
          <div><v-img :src="`./img/util/ammo.png`" height="18" width="18"></v-img></div>
          <div class="mx-1 font-weight-medium">{{ airbase.ammo }}</div>
          <div v-if="airbase.steel"><v-img :src="`./img/util/steel.png`" height="18" width="18"></v-img></div>
          <div v-if="airbase.steel" class="mx-1 font-weight-medium">{{ airbase.steel }}</div>
          <div><v-img :src="`./img/util/bauxite.png`" height="18" width="18"></v-img></div>
          <div class="mx-1 font-weight-medium">{{ airbase.bauxite }}</div>
        </template>
        <div>
          <v-btn icon small @click="visibleResource = !visibleResource">
            <v-icon>mdi-menu-down</v-icon>
          </v-btn>
        </div>
      </div>
      <v-divider></v-divider>
      <div v-for="(item, i) in airbase.items" :key="i" @mouseenter="bootTooltip(item, $event)" @mouseleave="clearTooltip">
        <item-input
          v-model="airbase.items[i]"
          :index="i"
          :handle-show-item-list="showItemList"
          :max="item.isRecon ? 4 : item.isShinzan ? 9 : 18"
          :init="item.isRecon ? 4 : item.isShinzan ? 9 : 18"
          :handle-drag-start="clearTooltip"
          @input="updateItem"
        />
      </div>
      <div v-if="!isDefense" class="mx-1">
        <air-status-result-bar v-if="!isDefense" :result="airbase.resultWave1" :dense="true" class="mt-3" />
        <air-status-result-bar v-if="!isDefense" :result="airbase.resultWave2" :dense="true" class="mt-3" />
      </div>
    </div>
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
    <v-dialog width="1200" v-model="detailDialog" transition="scroll-x-transition" @input="toggleDetailDialog">
      <v-card class="px-2 pb-2" v-if="!destroyDialog">
        <div class="d-flex pt-2 pb-1">
          <div class="align-self-center ml-3">基地航空隊詳細</div>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDetail">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <v-tabs v-model="tab">
          <v-tab href="#contact">触接</v-tab>
          <v-tab href="#detail">被撃墜数詳細</v-tab>
          <v-tab-item value="contact">
            <v-divider></v-divider>
            <contact-rates :fleet="value" />
          </v-tab-item>
          <v-tab-item value="detail">
            <v-divider></v-divider>
            <plane-detail-result :parent="value" :index="index" />
          </v-tab-item>
        </v-tabs>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.airbase-title {
  cursor: move;
}
.mode-select {
  align-self: center;
  width: 70px;
}
.sub-status-area > div {
  align-self: center;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from '@/components/item/ItemInput.vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import PlaneDetailResult from '@/components/result/PlaneDetailResult.vue';
import ContactRates from '../result/ContactRates.vue';
import Airbase from '@/classes/airbase/airbase';
import Const, { AB_MODE } from '@/classes/const';
import Item from '@/classes/item/item';

export default Vue.extend({
  components: {
    ItemInput,
    AirStatusResultBar,
    ItemTooltip,
    PlaneDetailResult,
    ContactRates,
  },
  name: 'Airbase',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
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
  },
  data: () => ({
    tab: 'detail',
    wave1: 0,
    wave2: 0,
    modes: Const.AB_MODE_ITEMS,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipX: 0,
    tooltipY: 0,
    destroyDialog: false,
    detailDialog: false,
    visibleResource: false,
  }),
  computed: {
    airbase(): Airbase {
      return this.value;
    },
    airPower() {
      if (this.isDefense && this.value.mode === AB_MODE.DEFFENSE) {
        return this.value.defenseAirPower;
      }
      return this.value.fullAirPower;
    },
    airPowerDetail() {
      if (this.isDefense && this.value.mode === AB_MODE.DEFFENSE) {
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
      return this.value.mode === AB_MODE.DEFFENSE && this.value.reconCorrDeff > 1 ? `${this.value.reconCorrDeff}` : '';
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
    enabledDetail() {
      return this.value.items.some((v) => v.data.id > 0);
    },
  },
  methods: {
    updateItem() {
      this.setAirbase();
    },
    setAirbase(value?: Airbase) {
      if (value === undefined) {
        this.$emit('input', new Airbase({ airbase: this.airbase }));
      } else {
        this.$emit('input', value);
      }
    },
    showItemList(index: number) {
      this.handleShowItemList(this.index, index);
    },
    getStatusColor(value: number) {
      if (value >= 90) {
        return 'success';
      }
      if (value >= 45) {
        return 'light-green';
      }
      if (value >= 20) {
        return 'yellow';
      }
      if (value >= 10) {
        return 'orange';
      }
      if (value === 0) {
        return 'secondary';
      }
      return 'red';
    },
    resetItems(): void {
      this.setAirbase(new Airbase());
    },
    viewDetail(): void {
      this.destroyDialog = false;
      this.detailDialog = true;
    },
    closeDetail() {
      this.detailDialog = false;
      setTimeout(() => {
        this.destroyDialog = true;
      }, 100);
    },
    toggleDetailDialog() {
      if (!this.detailDialog) {
        this.closeDetail();
      } else {
        this.destroyDialog = false;
      }
    },
    bootTooltip(item: Item, e: MouseEvent) {
      if (!item.data.id) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
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
