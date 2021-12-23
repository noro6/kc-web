<template>
  <v-card elevation="2" class="mx-1 py-2 land-base-content" @dragover.prevent @drop.stop>
    <div class="d-flex">
      <div class="ml-2 align-self-center land-base-title">第{{ landBase.no }}基地航空隊</div>
      <v-spacer></v-spacer>
      <div class="mr-1 mode-select">
        <v-select dense v-model="landBase.mode" :items="modes"></v-select>
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
          制空:<span class="ml-1 font-weight-medium">{{ landBase.airPower }}</span>
        </div>
        <div class="ml-1 text--secondary">{{ airPowerDetail }}</div>
        <v-spacer></v-spacer>
        <div>
          半径:<span class="ml-1 font-weight-medium">{{ landBase.range }}</span>
        </div>
      </div>
      <item-input
        v-for="(item, i) in landBase.items"
        :key="i"
        v-model="landBase.items[i]"
        :index="i"
        :handle-show-item-list="showItemList"
        :max="item.isRecon ? 4 : 18"
        :init="item.isRecon ? 4 : 18"
      />
      <div class="mx-1 mt-3">
        <div class="d-flex">
          <div class="mr-1 status-reuslt">
            <div class="status-reuslt-label">拮抗</div>
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
              <v-progress-linear :color="getStatusColor(wave1)" :value="wave1"></v-progress-linear>
            </div>
          </div>
        </div>
        <div class="d-flex mt-3">
          <div class="mr-1 status-reuslt">
            <div class="status-reuslt-label">拮抗</div>
            <div class="status-reuslt-rate">80%</div>
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
              <v-progress-linear :color="getStatusColor(wave2)" :value="wave2"></v-progress-linear>
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
.v-card .theme--dark.v-card {
  background-color: rgb(35, 35, 38);
}

.mode-select {
  width: 80px;
}

.status-reuslt {
  width: 26px;
  position: relative;
}
.status-reuslt-label {
  position: relative;
  white-space: nowrap;
  font-size: 12px;
  bottom: 5px;
}
.status-reuslt-rate {
  position: absolute;
  white-space: nowrap;
  text-align: right;
  font-size: 11px;
  width: 100%;
  top: 10px;
}

.status-bar-label {
  margin-bottom: 2px;
  text-align: center;
  border-bottom: 1px solid #888;
  position: relative;
}
.status-bar-label > div {
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
import ItemInput from './ItemInput.vue';
import LandBase from '@/classes/LandBase';
import Const, { LB_MODE } from '@/classes/Const';

export default Vue.extend({
  components: { ItemInput },
  name: 'LandBase',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    value: {
      type: LandBase,
      required: true,
    },
  },
  data: () => ({
    wave1: 0,
    wave2: 0,
    modes: Const.LB_MODE_ITEMS,
  }),
  computed: {
    landBase(): LandBase {
      return this.value;
    },
    airPowerDetail() {
      const airPowers = this.value.items.map((v) => v.airPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
  },
  methods: {
    setLandBase(value: LandBase) {
      this.$emit('input', value);
    },
    showItemList(index: number) {
      this.handleShowItemList(this.landBase.no, index);
    },
    getStatusColor(value: number) {
      if (value >= 90) {
        return 'success';
      }
      if (value >= 45) {
        return 'light-green';
      }
      if (value >= 20) {
        return 'yellow darken-1';
      }
      if (value >= 10) {
        return 'orange';
      }
      return 'red';
    },
    resetItems(): void {
      this.setLandBase(new LandBase(this.landBase.no, LB_MODE.WAIT));
    },
  },
});
</script>
