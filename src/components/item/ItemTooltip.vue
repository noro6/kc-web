<template>
  <div>
    <div class="d-flex">
      <div class="align-self-center">
        <v-img :src="`./img/type/icon${value.data.iconTypeId}.png`" height="32" width="32" />
      </div>
      <div class="ml-1 align-self-center">
        <div class="tooltip-item-id">id {{ value.data.id }}</div>
        <div class="body-2">
          <span>{{ needTrans ? $t(`${value.data.name}`) : value.data.name }}</span>
          <span v-if="value.remodel" class="ml-1">
            <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
            <span class="teal--text text--accent-4">&plus;{{ value.remodel }}</span>
          </span>
        </div>
      </div>
    </div>
    <div class="item-status-grid mt-2">
      <div v-if="value.data.fire || value.bonusFire || itemBonus.firePower">
        <span class="item-status-text">{{ $t("Common.火力") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.fire < 0 }">{{ value.data.fire }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.firePower < 0 }">
          <template v-if="itemBonus.firePower">{{ formatBonus(itemBonus.firePower) }}</template>
        </span>
        <span v-if="value.bonusFire" class="remodel-bonus">&plus; {{ formatStatus(value.bonusFire) }}</span>
      </div>
      <div v-if="value.dayBattleFirePower !== value.aircraftDayBattleFirePower">
        <span class="item-status-text">{{ $t("Common.砲戦火力") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.aircraftDayBattleFirePower < 0 }">
          {{ formatStatus2(value.aircraftDayBattleFirePower) }}
        </span>
        <span v-if="existsBonus && aircraftDayBattleFirePowerFitBonus" class="fit-bonus temp"> {{ aircraftDayBattleFirePowerFitBonus }} ) </span>
      </div>
      <div v-if="value.data.torpedo || value.bonusTorpedo || itemBonus.torpedo">
        <span class="item-status-text">{{ $t("Common.雷装") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.torpedo < 0 }">{{ value.data.torpedo }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.torpedo < 0 }">
          <template v-if="itemBonus.torpedo">{{ formatBonus(itemBonus.torpedo) }}</template>
        </span>
        <span v-if="value.bonusTorpedo || value.attackerTorpedoBonus" class="remodel-bonus">
          &plus; {{ formatStatus(value.bonusTorpedo + value.attackerTorpedoBonus) }}
        </span>
      </div>
      <div v-if="value.data.fire || value.data.torpedo || itemBonus.firePower || itemBonus.torpedo || value.bonusNightFire">
        <span class="item-status-text">{{ $t("Common.夜戦火力") }}</span>
        <span class="item-status-value">{{ value.data.fire + value.data.torpedo }}</span>
        <span v-if="existsBonus" class="fit-bonus temp" :class="{ 'bad-status': itemBonus.firePower + itemBonus.torpedo < 0 }">
          {{ itemBonus.firePower || itemBonus.torpedo ? formatBonus(itemBonus.firePower + itemBonus.torpedo) : "" }} )
        </span>
        <span v-if="value.bonusNightFire" class="remodel-bonus"> &plus; {{ formatStatus(value.bonusNightFire) }} </span>
      </div>
      <div v-if="value.data.bomber || value.bonusBomber || itemBonus.bomber">
        <span class="item-status-text">{{ $t("Common.爆装") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.bomber < 0 }">{{ value.data.bomber }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.bomber < 0 }">
          <template v-if="itemBonus.bomber">{{ formatBonus(itemBonus.bomber) }}</template>
        </span>
        <span v-if="value.bonusBomber" class="remodel-bonus">&plus; {{ formatStatus(value.bonusBomber) }}</span>
      </div>
      <div v-if="value.data.antiAir || value.bonusAntiAir || itemBonus.antiAir">
        <span class="item-status-text">{{ $t("Common.対空") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.antiAir < 0 }">{{ value.data.antiAir }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.antiAir < 0 }">
          <template v-if="itemBonus.antiAir">{{ formatBonus(itemBonus.antiAir) }}</template>
        </span>
        <span v-if="value.bonusAntiAir" class="remodel-bonus">&plus; {{ formatStatus(value.bonusAntiAir) }}</span>
      </div>
      <div v-if="value.data.isPlane && value.actualAntiAir !== value.data.antiAir + value.bonusAntiAir">
        <span class="item-status-text">{{ $t("Common.出撃対空") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.actualAntiAir < 0 }">{{ formatStatus2(value.actualAntiAir) }}</span>
      </div>
      <div v-if="value.data.isPlane && value.actualDefenseAntiAir !== value.data.antiAir + value.bonusAntiAir">
        <span class="item-status-text">{{ $t("Common.防空対空") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.actualDefenseAntiAir < 0 }">{{ formatStatus2(value.actualDefenseAntiAir) }}</span>
      </div>
      <div v-if="value.data.asw || value.bonusAsw || itemBonus.asw">
        <span class="item-status-text">{{ $t("Common.対潜") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.asw < 0 }">{{ value.data.asw }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.asw < 0 }">
          <template v-if="itemBonus.asw">{{ formatBonus(itemBonus.asw) }}</template>
        </span>
        <span v-if="value.bonusAsw" class="remodel-bonus">&plus; {{ formatStatus(value.bonusAsw) }}</span>
      </div>
      <div v-if="value.data.accuracy || value.bonusAccuracy || itemBonus.accuracy">
        <span class="item-status-text">{{ $t("Common.命中") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.accuracy < 0 }">{{ value.data.accuracy }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.accuracy < 0 }">
          <template v-if="itemBonus.accuracy">{{ formatBonus(itemBonus.accuracy) }}</template>
        </span>
        <span v-if="value.bonusAccuracy" class="remodel-bonus">&plus; {{ formatStatus(value.bonusAccuracy) }}</span>
      </div>
      <div v-if="value.data.avoid || itemBonus.avoid">
        <span class="item-status-text">{{ $t("Common.回避") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.avoid < 0 }">{{ value.data.avoid }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.avoid < 0 }">
          <template v-if="itemBonus.avoid">{{ formatBonus(itemBonus.avoid) }}</template>
        </span>
      </div>
      <div v-if="value.data.scout || value.bonusScout || itemBonus.scout">
        <span class="item-status-text">{{ $t("Common.索敵") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.scout < 0 }">{{ value.data.scout }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.scout < 0 }">
          <template v-if="itemBonus.scout">{{ formatBonus(itemBonus.scout) }}</template>
        </span>
        <span v-if="value.bonusScout" class="remodel-bonus">&plus; {{ formatStatus(value.bonusScout) }}</span>
      </div>
      <div v-if="value.data.antiBomber">
        <span class="item-status-text">{{ $t("Common.対爆") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.antiBomber < 0 }">{{ value.data.antiBomber }}</span>
      </div>
      <div v-if="value.data.interception">
        <span class="item-status-text">{{ $t("Common.迎撃") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.interception < 0 }">{{ value.data.interception }}</span>
      </div>
      <div v-if="value.data.armor || itemBonus.armor">
        <span class="item-status-text">{{ $t("Common.装甲") }}</span>
        <span class="item-status-value" :class="{ 'bad-status': value.data.armor < 0 }">{{ value.data.armor }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.armor < 0 }">
          <template v-if="itemBonus.armor">{{ formatBonus(itemBonus.armor) }}</template>
        </span>
      </div>
      <div v-if="value.data.range || itemBonus.range">
        <span class="item-status-text">{{ $t("Common.射程") }}</span>
        <span class="item-status-value">{{ value.data.range ? $t(`Common.${rangeText[value.data.range]}`) : "" }}</span>
        <span v-if="existsBonus" class="fit-bonus" :class="{ 'bad-status': itemBonus.range < 0 }">
          <template v-if="itemBonus.range">{{ formatBonus(itemBonus.range) }}</template>
        </span>
      </div>
      <div v-if="value.data.radius">
        <span class="item-status-text">{{ $t("Common.半径") }}</span
        ><span class="item-status-value">{{ value.data.radius }}</span>
      </div>
      <div v-if="!isNotJapanese && value.data.enabledAttackLandBase">
        <span class="item-status-text">対地</span><span class="item-status-value caption">可</span>
      </div>
      <div v-if="value.data.avoidId">
        <span class="item-status-text">{{ $t("Common.射撃回避") }}</span
        ><span class="item-status-value caption">{{ $t(`Common.回避性能.${avoidTexts[value.data.avoidId]}`) }}</span>
      </div>
      <div v-if="value.data.cost">
        <span class="item-status-text">{{ $t("Common.コスト") }}</span
        ><span class="item-status-value caption">{{ value.data.cost }}</span>
      </div>
    </div>
    <div class="item-status-grid no-grid">
      <template v-if="value.data.isPlane && !isNotJapanese">
        <div class="grey--text text--lighten-1">熟練度</div>
        <div><img class="grow-img" :src="`./img/util/prof7.png`" alt="prof7" /></div>
        <div class="grey--text text--lighten-1">まで</div>
        <div class="ml-5 grow-text">{{ growSpeedString(value.data) }} 戦</div>
      </template>
      <template v-else-if="value.data.isPlane">
        <div class="grey--text text--lighten-1">{{ $t("ItemList.熟練度成長") }}</div>
        <div class="ml-5 grow-text">{{ growSpeedString(value.data) }}{{ $t("ItemList.戦") }}</div>
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
  grid-template-columns: 1fr;
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
  width: 64px;
  color: #bdbdbd;
}
.item-status-value {
  width: 52px;
  display: inline-block;
  text-align: right;
  color: #e4f5ff;
}
.item-status-value.bad-status {
  color: #ff6767;
}
.remodel-bonus {
  text-align: right;
  display: inline-block;
  width: 42px;
  margin-left: 1.5rem;
  color: #00bfa5;
}

.fit-bonus {
  text-align: left;
  display: inline-block;
  width: 32px;
  margin-left: 1.5rem;
  color: #60c5ff;
  position: relative;
  white-space: nowrap;
}
.fit-bonus.bad-status {
  color: #ff6767;
}
.fit-bonus.temp::before {
  content: "(";
  color: #60c5ff;
  position: absolute;
  left: -8px;
}
.fit-bonus.bad-status.temp::before {
  color: #ff6767;
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
import SiteSetting from '@/classes/siteSetting';
import { ItemBonusStatus } from '@/classes/item/ItemBonus';

export default Vue.extend({
  name: 'ItemTooltip',
  props: {
    value: {
      type: Item,
      required: true,
    },
    bonus: {
      type: String,
      default: '',
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
    formatStatus2() {
      return (value: number) => (value ? `${Math.floor(10 * value) / 10}` : '');
    },
    formatBonus() {
      return (value: number) => (value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`);
    },
    growSpeedString() {
      return (itemMaster: ItemMaster) => CommonCalc.getGrowSpeedString(itemMaster);
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    existsBonus(): boolean {
      if (!this.bonus) return false;
      const bonus = JSON.parse(this.bonus);
      return !!bonus && Object.keys(bonus).length > 0;
    },
    itemBonus(): ItemBonusStatus {
      const bonus = {
        firePower: 0,
        torpedo: 0,
        antiAir: 0,
        armor: 0,
        asw: 0,
        scout: 0,
        avoid: 0,
        accuracy: 0,
        bomber: 0,
        range: 0,
      };
      if (!this.bonus) return bonus;
      return JSON.parse(this.bonus) as ItemBonusStatus;
    },
    aircraftDayBattleFirePowerFitBonus(): string {
      if (!this.existsBonus) return '';

      const firePower = this.itemBonus.firePower ? this.itemBonus.firePower : 0;
      const torpedo = this.itemBonus.torpedo ? this.itemBonus.torpedo : 0;
      const bomber = this.itemBonus.bomber ? this.itemBonus.bomber : 0;

      const value = (firePower + torpedo + bomber) * 1.5;
      if (!value) return '';
      return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
    },
  },
});
</script>
