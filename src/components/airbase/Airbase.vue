<template>
  <v-card class="mx-1 py-2 airbase-content" @dragover.prevent @drop.stop>
    <div class="d-flex">
      <div class="ml-2 align-self-center airbase-title">第{{ index + 1 }}基地航空隊</div>
      <v-spacer></v-spacer>
      <div class="mr-1 mode-select">
        <v-select dense v-model="airbase.mode" hide-details :items="modes" @change="updateItem"></v-select>
      </div>
      <div class="mr-1 mt-1">
        <v-btn color="info" icon small @click="viewDetail">
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
        <v-btn icon small @click="resetItems">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="airbase-body">
      <div class="d-flex caption px-2">
        <div>
          制空:<span class="ml-1 font-weight-medium">{{ airPower }}</span>
        </div>
        <div class="ml-1 text--secondary">{{ airPowerDetail }}</div>
        <div class="ml-1 text--secondary" v-if="reconCorrString">&times;{{ reconCorrString }}</div>
        <div class="ml-1 text--secondary" v-if="reconCorrDefString">&times;{{ reconCorrDefString }}</div>
        <v-spacer></v-spacer>
        <div>
          半径:<span class="ml-1 font-weight-medium">{{ airbase.range }}</span>
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
      <plane-detail-result v-if="!destroyDialog" :parent="value" :index="index" :handle-close="closeDetail" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.airbase-title {
  cursor: move;
}
.mode-select {
  width: 80px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from '@/components/item/ItemInput.vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import PlaneDetailResult from '@/components/result/PlaneDetailResult.vue';
import Airbase from '@/classes/airbase/airbase';
import Const, { AB_MODE } from '@/classes/const';
import Item from '@/classes/item/item';

export default Vue.extend({
  components: {
    ItemInput,
    AirStatusResultBar,
    ItemTooltip,
    PlaneDetailResult,
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
    },
    toggleDetailDialog() {
      if (!this.detailDialog) {
        setTimeout(() => {
          this.destroyDialog = true;
        }, 100);
      } else {
        this.destroyDialog = false;
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
