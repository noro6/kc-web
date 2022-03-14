<template>
  <div>
    <div class="d-flex">
      <div class="align-self-center">
        <v-img :src="`./img/type/icon${value.data.iconTypeId}.png`" height="32" width="32"></v-img>
      </div>
      <div class="ml-1 align-self-center">
        <div class="tooltip-item-id">id:{{ value.data.id }}</div>
        <div class="body-2">
          <span>{{ value.data.name }}</span>
          <span v-if="value.remodel" class="ml-1">
            <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
            <span class="teal--text text--accent-4">&plus;{{ value.remodel }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="item-status-grid mt-2">
      <div v-if="value.data.fire || value.bonusFire">
        火力:<span class="item-status-value" :class="{ 'bad-status': value.data.fire < 0 }">{{ value.data.fire }}</span>
        <span v-if="value.bonusFire" class="remodel-bonus">&plus;{{ formatStatus(value.bonusFire) }} </span>
      </div>
      <div v-if="value.data.torpedo || value.bonusTorpedo">
        雷装:<span class="item-status-value" :class="{ 'bad-status': value.data.torpedo < 0 }">{{ value.data.torpedo }}</span>
        <span v-if="value.bonusTorpedo" class="remodel-bonus">&plus;{{ formatStatus(value.bonusTorpedo) }} </span>
      </div>
      <div v-if="value.data.bomber || value.bonusBomber">
        爆装:<span class="item-status-value" :class="{ 'bad-status': value.data.bomber < 0 }">{{ value.data.bomber }}</span>
        <span v-if="value.bonusBomber" class="remodel-bonus">&plus;{{ formatStatus(value.bonusBomber) }} </span>
      </div>
      <div v-if="value.data.antiAir || value.bonusAntiAir">
        対空:<span class="item-status-value" :class="{ 'bad-status': value.data.antiAir < 0 }">{{ value.data.antiAir }}</span>
        <span v-if="value.bonusAntiAir" class="remodel-bonus">&plus;{{ formatStatus(value.bonusAntiAir) }} </span>
      </div>
      <div v-if="value.data.armor">
        装甲:<span class="item-status-value" :class="{ 'bad-status': value.data.armor < 0 }">{{ value.data.armor }}</span>
      </div>
      <div v-if="value.data.asw || value.bonusAsw">
        対潜:<span class="item-status-value" :class="{ 'bad-status': value.data.asw < 0 }">{{ value.data.asw }}</span>
        <span v-if="value.bonusAsw" class="remodel-bonus">&plus;{{ formatStatus(value.bonusAsw) }} </span>
      </div>
      <div v-if="value.data.avoid">
        回避:<span class="item-status-value" :class="{ 'bad-status': value.data.avoid < 0 }">{{ value.data.avoid }}</span>
      </div>
      <div v-if="value.data.scout || value.bonusScout">
        索敵:<span class="item-status-value" :class="{ 'bad-status': value.data.scout < 0 }">{{ value.data.scout }}</span>
        <span v-if="value.bonusScout" class="remodel-bonus">&plus;{{ formatStatus(value.bonusScout) }} </span>
      </div>
      <div v-if="value.data.accuracy || value.bonusAccuracy">
        命中:<span class="item-status-value" :class="{ 'bad-status': value.data.accuracy < 0 }">{{ value.data.accuracy }}</span>
        <span v-if="value.bonusAccuracy" class="remodel-bonus">&plus;{{ formatStatus(value.bonusAccuracy) }} </span>
      </div>
      <div v-if="value.data.antiBomber">
        対爆:<span class="item-status-value" :class="{ 'bad-status': value.data.antiBomber < 0 }">{{ value.data.antiBomber }}</span>
      </div>
      <div v-if="value.data.interception">
        迎撃:<span class="item-status-value" :class="{ 'bad-status': value.data.interception < 0 }">{{ value.data.interception }}</span>
      </div>
      <div v-if="value.data.range">
        射程:<span class="item-status-value">{{ rangeText[value.data.range] }}</span>
      </div>
      <div v-if="value.data.radius">
        半径:<span class="item-status-value">{{ value.data.radius }}</span>
      </div>
      <div v-if="value.enabledAttackLandbase">
        対地:<span class="item-status-value special caption">可</span>
      </div>
      <div v-if="value.data.avoidId">
        射撃回避:<span class="item-status-value caption">{{ avoidTexts[value.data.avoidId] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tooltip-item-id {
  color: #60c5ff;
  font-size: 12px;
  height: 20px;
}
.item-status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.item-status-grid > div {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
.item-status-value {
  width: 32px;
  display: inline-block;
  text-align: right;
  color: #60c5ff;
}
.item-status-value.bad-status {
  color: #ff6767;
}
.item-status-value.special {
  color: #59ff75;
}
.remodel-bonus {
  margin-left: 0.25rem;
  color: #00bfa5;
}
.remodel-bonus::before {
  content: "( ";
  color: #bbb;
}
.remodel-bonus::after {
  content: ")";
  color: #bbb;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Item from '@/classes/item/item';
import Const from '@/classes/const';

export default Vue.extend({
  name: 'ItemTooltip',
  props: {
    value: {
      type: Item,
      required: true,
    },
  },
  data: () => ({
    avoidTexts: Const.AVOID_TYPE.map((v) => v.text),
    rangeText: ['', '短', '中', '長', '超長'],
  }),
  computed: {
    formatStatus() {
      return (value: number) => (value ? `${Math.floor(100 * value) / 100}` : '');
    },
  },
});
</script>
