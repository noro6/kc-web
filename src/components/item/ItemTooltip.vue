<template>
  <div>
    <div class="d-flex">
      <div class="align-self-center">
        <v-img :src="`./img/type/icon${value.data.iconTypeId}.png`" height="32" width="32"></v-img>
      </div>
      <div class="ml-1 align-self-center">
        <div class="tooltip-item-id">id:{{ value.data.id }}</div>
        <div class="body-2">
          <span>{{ isLocaleEN ? $t(`${value.data.name}`) : value.data.name }}</span>
          <span v-if="value.remodel" class="ml-1">
            <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
            <span class="teal--text text--accent-4">&plus;{{ value.remodel }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="item-status-grid mt-2">
      <div v-if="value.data.fire || value.bonusFire">
        <span class="item-status-text">{{ $t('Common.火力') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.fire < 0 }">{{ value.data.fire }}</span>
        <span v-if="value.bonusFire" class="remodel-bonus">&plus;{{ formatStatus(value.bonusFire) }} </span>
      </div>
      <div v-if="value.data.torpedo || value.bonusTorpedo">
        <span class="item-status-text">{{ $t('Common.雷装') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.torpedo < 0 }">{{ value.data.torpedo }}</span>
        <span v-if="value.bonusTorpedo || value.attackerTorpedoBonus" class="remodel-bonus"
          >&plus;{{ formatStatus(value.bonusTorpedo + value.attackerTorpedoBonus) }}
        </span>
      </div>
      <div v-if="value.data.bomber || value.bonusBomber">
        <span class="item-status-text">{{ $t('Common.爆装') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.bomber < 0 }">{{ value.data.bomber }}</span>
        <span v-if="value.bonusBomber" class="remodel-bonus">&plus;{{ formatStatus(value.bonusBomber) }} </span>
      </div>
      <div v-if="value.data.antiAir || value.bonusAntiAir">
        <span class="item-status-text">{{ $t('Common.対空') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.antiAir < 0 }">{{ value.data.antiAir }}</span>
        <span v-if="value.bonusAntiAir" class="remodel-bonus">&plus;{{ formatStatus(value.bonusAntiAir) }} </span>
      </div>
      <div v-if="value.data.armor">
        <span class="item-status-text">{{ $t('Common.装甲') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.armor < 0 }">{{ value.data.armor }}</span>
      </div>
      <div v-if="value.data.asw || value.bonusAsw">
        <span class="item-status-text">{{ $t('Common.対潜') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.asw < 0 }">{{ value.data.asw }}</span>
        <span v-if="value.bonusAsw" class="remodel-bonus">&plus;{{ formatStatus(value.bonusAsw) }} </span>
      </div>
      <div v-if="value.data.avoid">
        <span class="item-status-text">{{ $t('Common.回避') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.avoid < 0 }">{{ value.data.avoid }}</span>
      </div>
      <div v-if="value.data.scout || value.bonusScout">
        <span class="item-status-text">{{ $t('Common.索敵') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.scout < 0 }">{{ value.data.scout }}</span>
        <span v-if="value.bonusScout" class="remodel-bonus">&plus;{{ formatStatus(value.bonusScout) }} </span>
      </div>
      <div v-if="value.data.accuracy || value.bonusAccuracy">
        <span class="item-status-text">{{ $t('Common.命中') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.accuracy < 0 }">{{ value.data.accuracy }}</span>
        <span v-if="value.bonusAccuracy" class="remodel-bonus">&plus;{{ formatStatus(value.bonusAccuracy) }} </span>
      </div>
      <div v-if="value.data.antiBomber">
        <span class="item-status-text">{{ $t('Common.対爆') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.antiBomber < 0 }">{{ value.data.antiBomber }}</span>
      </div>
      <div v-if="value.data.interception">
        <span class="item-status-text">{{ $t('Common.迎撃') }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.interception < 0 }">{{ value.data.interception }}</span>
      </div>
      <div v-if="value.data.range">
        <span class="item-status-text">{{ $t('Common.射程') }}</span><span class="item-status-value">{{ rangeText[value.data.range] }}</span>
      </div>
      <div v-if="value.data.radius">
        <span class="item-status-text">{{ $t('Common.半径') }}</span><span class="item-status-value">{{ value.data.radius }}</span>
      </div>
      <div v-if="value.data.enabledAttackLandBase">
        <span class="item-status-text">対地</span><span class="item-status-value special caption">可</span>
      </div>
      <div v-if="value.data.avoidId">
        <span class="item-status-text">{{ $t('Common.射撃回避') }}</span><span class="item-status-value caption">{{ avoidTexts[value.data.avoidId] }}</span>
      </div>
      <div v-if="value.data.cost">
        <span class="item-status-text">{{ $t('Common.コスト') }}</span><span class="item-status-value caption">{{ value.data.cost }}</span>
      </div>
    </div>
    <div class="item-status-grid no-grid">
      <template v-if="value.data.isPlane">
        <div>熟練度</div>
        <div><img class="grow-img" :src="`./img/util/prof7.png`" /></div>
        <div>まで</div>
        <div class="ml-5 grow-text">{{ growSpeedString(value.data) }}</div>
      </template>
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
.item-status-grid.no-grid {
  display: flex;
  grid-template-columns: unset;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.item-status-grid.no-grid > div {
  align-self: center;
  margin: 0;
}

.item-status-text {
  display: inline-block;
  width: 56px;
}
.item-status-value {
  width: 36px;
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

.grow-img {
  margin: 6px 0.2rem 0 0.2rem;
  height: 16px;
  width: auto;
}
.grow-text {
  color: #ffcd60;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Item from '@/classes/item/item';
import Const from '@/classes/const';
import CommonCalc from '@/classes/commonCalc';
import ItemMaster from '@/classes/item/itemMaster';

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
    rangeText: ['', '短', '中', '長', '超長', '超長+', '極', '極+', '極長', '極長+'],
  }),
  computed: {
    formatStatus() {
      return (value: number) => (value ? `${Math.floor(100 * value) / 100}` : '');
    },
    growSpeedString() {
      return (itemMaster: ItemMaster) => CommonCalc.getGrowSpeedString(itemMaster);
    },
    isLocaleEN(): boolean {
      return this.$i18n.locale === 'en';
    },
  },
});
</script>
