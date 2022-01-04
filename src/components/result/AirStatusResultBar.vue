<template>
  <div class="d-flex mt-3" :class="{ 'dense': dense }">
    <div class="mr-1 status-reuslt">
      <div class="status-reuslt-label">{{ label }}</div>
      <div class="status-reuslt-rate">{{ rate }}%</div>
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
        <v-progress-linear :color="barColor" :value="barWidth"></v-progress-linear>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-reuslt {
  width: 28px;
  position: relative;
  opacity: 0.8;
  font-size: 12px;
}
.dense .status-reuslt {
  width: 26px;
}

.status-reuslt-label {
  text-align: center;
  position: relative;
  white-space: nowrap;
  width: 100%;
  bottom: 6px;
}
.dense .status-reuslt-label {
  font-size: 11px;
  bottom: 4px;
}

.status-reuslt-rate {
  position: absolute;
  white-space: nowrap;
  text-align: right;
  width: 100%;
  top: 10px;
}
.dense .status-reuslt-rate {
  font-size: 10px;
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
import AirCalcResult from '@/classes/airCalcResult';
import Const, { AIR_STATE } from '@/classes/const';

export default Vue.extend({
  name: 'AirStatusResultBar',
  props: {
    result: {
      type: AirCalcResult,
      required: true,
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    label() {
      const r = this.result;
      const status = Const.AIR_STATUS.find((v) => v.value === r.airState);
      return status ? status.text : '';
    },
    rate() {
      const r = this.result;
      return r.airState !== AIR_STATE.NONE ? Math.round(r.rates[r.airState]) : 0;
    },
    barWidth() {
      const r = this.result as AirCalcResult;
      return r.airState !== AIR_STATE.NONE ? r.airStateBarWidth : 0;
    },
    barColor() {
      const r = this.result as AirCalcResult;
      const value = r.airStateBarWidth;
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
  },
});
</script>
