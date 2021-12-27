<template>
  <v-card class="mx-1 py-2 land-base-content" @dragover.prevent @drop.stop>
    <div class="d-flex">
      <div class="ml-2 align-self-center land-base-title">第{{ index + 1 }}基地航空隊</div>
      <v-spacer></v-spacer>
      <div class="mr-1 mode-select">
        <v-select dense v-model="landbase.mode" hide-details :items="modes" @change="updateItem"></v-select>
      </div>
      <div class="mr-1 mt-1">
        <v-btn color="info" icon small>
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
        <v-btn icon small @click="resetItems()">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="land-base-body">
      <div class="d-flex caption px-2">
        <div>
          制空:<span class="ml-1 font-weight-medium">{{ airPower }}</span>
        </div>
        <div class="ml-1 text--secondary">{{ airPowerDetail }}</div>
        <div class="ml-1 text--secondary" v-show="reconCorrString">&times;{{ reconCorrString }}</div>
        <v-spacer></v-spacer>
        <div>
          半径:<span class="ml-1 font-weight-medium">{{ landbase.range }}</span>
        </div>
      </div>
      <v-divider></v-divider>
      <item-input
        v-for="(item, i) in landbase.items"
        :key="i"
        v-model="landbase.items[i]"
        :index="i"
        :handle-show-item-list="showItemList"
        :max="item.isRecon ? 4 : item.isShinzan ? 9 : 18"
        :init="item.isRecon ? 4 : item.isShinzan ? 9 : 18"
        @input="updateItem"
      />
      <div class="mx-1" v-if="!isDefense">
        <div v-for="i in 2" :key="i" class="d-flex mt-3">
          <div class="mr-1 status-reuslt">
            <div class="status-reuslt-label">{{ resultLabel[i] }}</div>
            <div class="status-reuslt-rate">100%</div>
          </div>
          <div class="align-self-center flex-grow-1">
            <div class="d-flex">
              <div class="status-bar-label" style="width: 10%">
                <div>喪失</div>
              </div>
              <div class="status-bar-divide"></div>
              <div class="status-bar-label" style="width: 10%">
                <div>劣勢</div>
              </div>
              <div class="status-bar-divide"></div>
              <div class="status-bar-label" style="width: 25%">
                <div>拮抗</div>
              </div>
              <div class="status-bar-divide"></div>
              <div class="status-bar-label" style="width: 45%">
                <div>優勢</div>
              </div>
              <div class="status-bar-divide"></div>
              <div class="status-bar-label" style="width: 10%">
                <div>確保</div>
              </div>
            </div>
            <div>
              <v-progress-linear :color="getStatusColor(resultBarValue[i - 1])" :value="resultBarValue[i - 1]"></v-progress-linear>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.land-base-title {
  cursor: move;
}
.mode-select {
  width: 80px;
}

.status-reuslt {
  width: 26px;
  position: relative;
  opacity: 0.8;
}
.status-reuslt-label {
  text-align: center;
  position: relative;
  white-space: nowrap;
  font-size: 11px;
  width: 100%;
  bottom: 4px;
}
.status-reuslt-rate {
  position: absolute;
  white-space: nowrap;
  text-align: right;
  font-size: 10px;
  width: 100%;
  top: 7px;
}
.status-bar-label {
  margin-bottom: 2px;
  text-align: center;
  border-bottom: 1px solid #888;
  position: relative;
}
.status-bar-label > div {
  opacity: 0.8;
  bottom: -2px;
  width: 100%;
  font-size: 11px;
  white-space: nowrap;
  position: absolute;
}
.status-bar-divide {
  align-self: flex-end;
  height: 10px;
  border-right: 1px solid #888;
  margin-bottom: 2px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from '@/components/item/ItemInput.vue';
import Landbase from '@/classes/landbase/landbase';
import Const, { LB_MODE } from '@/classes/const';

export default Vue.extend({
  components: { ItemInput },
  name: 'Landbase',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    value: {
      type: Landbase,
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
    modes: Const.LB_MODE_ITEMS,
  }),
  computed: {
    landbase(): Landbase {
      return this.value;
    },
    airPower() {
      if (this.isDefense && this.value.mode === LB_MODE.DEFFENSE) {
        return this.value.defenseAirPower;
      }
      return this.value.fullAirPower;
    },
    airPowerDetail() {
      if (this.isDefense && this.value.mode === LB_MODE.DEFFENSE) {
        const airPowers = this.value.items.map((v) => v.defenseAirPower);
        return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
      }
      const airPowers = this.value.items.map((v) => v.fullAirPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    reconCorrString() {
      return this.value.reconCorr > 1 ? `${this.value.reconCorr}` : '';
    },
    resultLabel() {
      const wave1State = this.value.resultWave1.airState;
      const wave2State = this.value.resultWave2.airState;
      const statusWave1 = Const.AIR_STATUS.find((v) => v.value === wave1State);
      const statusWave2 = Const.AIR_STATUS.find((v) => v.value === wave2State);
      return [statusWave1 ? statusWave1.text : '', statusWave2 ? statusWave2.text : ''];
    },
    resultBarValue() {
      return [this.value.resultWave1.airStateBarWidth, this.value.resultWave2.airStateBarWidth];
    },
  },
  methods: {
    updateItem() {
      this.setLandbase();
    },
    setLandbase(value?: Landbase) {
      if (value === undefined) {
        this.$emit('input', new Landbase({ landbase: this.landbase }));
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
      return 'red';
    },
    resetItems(): void {
      this.setLandbase(new Landbase());
    },
  },
});
</script>
