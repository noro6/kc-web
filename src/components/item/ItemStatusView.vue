<template>
  <div>
    <div class="d-flex align-center">
      <div>
        <v-img :src="`./img/type/icon${value.data.iconTypeId}.png`" height="32" width="32" />
      </div>
      <div class="ml-1 flex-grow-1">
        <div class="item-id primary--text">id {{ value.data.id ? value.data.id : "-" }}</div>
        <div class="body-2 d-flex flex-grow-1">
          <div class="text-truncate caption item-name" v-if="value.data.id">{{ needTrans ? $t(`${value.data.name}`) : value.data.name }}</div>
          <div class="text-truncate caption item-name" v-else>{{ $t("Fleet.未装備") }}</div>
          <div v-if="value.remodel" class="ml-1 d-flex">
            <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
            <span class="teal--text text--accent-4">&plus;{{ value.remodel }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-1 caption text--secondary">{{ $t("Common.表示ステータス") }}</div>
    <v-divider></v-divider>
    <div class="item-statuses">
      <div :class="{ 'no-status': !value.data.fire }">{{ $t("Common.火力") }}</div>
      <div :class="{ 'no-status': !value.data.fire }">{{ value.data.fire }}</div>
      <div :class="{ 'no-status': !value.data.torpedo }">{{ $t("Common.雷装") }}</div>
      <div :class="{ 'no-status': !value.data.torpedo }">{{ value.data.torpedo }}</div>
      <div :class="{ 'no-status': !value.data.bomber }">{{ $t("Common.爆装") }}</div>
      <div :class="{ 'no-status': !value.data.bomber }">{{ value.data.bomber }}</div>
      <div :class="{ 'no-status': !value.data.armor }">{{ $t("Common.装甲") }}</div>
      <div :class="{ 'no-status': !value.data.armor }">{{ value.data.armor }}</div>
      <div :class="{ 'no-status': !value.data.antiAir }">{{ $t("Common.対空") }}</div>
      <div :class="{ 'no-status': !value.data.antiAir }">{{ value.data.antiAir }}</div>
      <div :class="{ 'no-status': !value.data.asw }">{{ $t("Common.対潜") }}</div>
      <div :class="{ 'no-status': !value.data.asw }">{{ value.data.asw }}</div>
      <div :class="{ 'no-status': !value.data.scout }">{{ $t("Common.索敵") }}</div>
      <div :class="{ 'no-status': !value.data.scout }">{{ value.data.scout }}</div>
      <template v-if="value.data.antiBomber">
        <div>{{ $t("Common.対爆") }}</div>
        <div>{{ value.data.antiBomber }}</div>
      </template>
      <template v-else>
        <div :class="{ 'no-status': !value.data.accuracy }">{{ $t("Common.命中") }}</div>
        <div :class="{ 'no-status': !value.data.accuracy }">{{ value.data.accuracy }}</div>
      </template>
      <template v-if="value.data.interception">
        <div>{{ $t("Common.迎撃") }}</div>
        <div>{{ value.data.interception }}</div>
      </template>
      <template v-else>
        <div :class="{ 'no-status': !value.data.avoid }">{{ $t("Common.回避") }}</div>
        <div :class="{ 'no-status': !value.data.avoid }">{{ value.data.avoid }}</div>
      </template>
      <template v-if="value.data.range">
        <div>{{ $t("Common.射程") }}</div>
        <div>{{ $t(`Common.${rangeText[value.data.range]}`) }}</div>
      </template>
    </div>
    <div class="mt-2 body-2 primary--text">{{ $t("Result.装備シナジーボーナス") }}</div>
    <v-divider></v-divider>
    <div class="item-statuses synergy-bonus">
      <template v-if="itemBonus.firePower">
        <div>{{ $t("Common.火力") }}</div>
        <div>{{ formatBonus(itemBonus.firePower) }}</div>
      </template>
      <template v-if="itemBonus.torpedo">
        <div>{{ $t("Common.雷装") }}</div>
        <div>{{ formatBonus(itemBonus.torpedo) }}</div>
      </template>
      <template v-if="itemBonus.bomber">
        <div>{{ $t("Common.爆装") }}</div>
        <div>{{ formatBonus(itemBonus.bomber) }}</div>
      </template>
      <template v-if="itemBonus.armor">
        <div>{{ $t("Common.装甲") }}</div>
        <div>{{ formatBonus(itemBonus.armor) }}</div>
      </template>
      <template v-if="itemBonus.antiAir">
        <div>{{ $t("Common.対空") }}</div>
        <div>{{ formatBonus(itemBonus.antiAir) }}</div>
      </template>
      <template v-if="itemBonus.scout">
        <div>{{ $t("Common.索敵") }}</div>
        <div>{{ formatBonus(itemBonus.scout) }}</div>
      </template>
      <template v-if="itemBonus.avoid">
        <div>{{ $t("Common.回避") }}</div>
        <div>{{ formatBonus(itemBonus.avoid) }}</div>
      </template>
      <template v-if="itemBonus.accuracy">
        <div>{{ $t("Common.命中") }}</div>
        <div>{{ formatBonus(itemBonus.accuracy) }}</div>
      </template>
      <template v-if="itemBonus.asw">
        <div>{{ $t("Common.対潜") }}</div>
        <div>{{ formatBonus(itemBonus.asw) }}</div>
      </template>
      <template v-if="itemBonus.range">
        <div>{{ $t("Common.射程") }}</div>
        <div>{{ formatBonus(itemBonus.range) }}</div>
      </template>
    </div>
    <div class="mt-2 body-2 teal--text text--accent-4">{{ $t("Common.改修ボーナス") }}</div>
    <v-divider></v-divider>
    <div class="item-statuses remodel-bonus">
      <template v-if="value.bonusFire">
        <div>{{ $t("Common.火力") }}</div>
        <div>{{ formatStatus(value.bonusFire) }}</div>
      </template>
      <template v-if="value.bonusTorpedo">
        <div>{{ $t("Common.雷装") }}</div>
        <div>{{ formatStatus(value.bonusTorpedo) }}</div>
      </template>
      <template v-if="value.bonusNightFire">
        <div>{{ $t("Common.夜戦火力") }}</div>
        <div>{{ formatStatus(value.bonusNightFire) }}</div>
      </template>
      <template v-if="value.bonusBomber">
        <div>{{ $t("Common.爆装") }}</div>
        <div>{{ formatStatus(value.bonusBomber) }}</div>
      </template>
      <template v-if="value.bonusArmor">
        <div>{{ $t("Common.装甲") }}</div>
        <div>{{ formatStatus(value.bonusArmor) }}</div>
      </template>
      <template v-if="value.bonusAntiAir">
        <div>{{ $t("Common.対空") }}</div>
        <div>{{ formatStatus(value.bonusAntiAir) }}</div>
      </template>
      <template v-if="value.bonusScout">
        <div>{{ $t("Common.索敵") }}</div>
        <div>{{ formatStatus(value.bonusScout) }}</div>
      </template>
      <template v-if="value.bonusAccuracy">
        <div>{{ $t("Common.命中") }}</div>
        <div>{{ formatStatus(value.bonusAccuracy) }}</div>
      </template>
      <template v-if="value.bonusAsw">
        <div>{{ $t("Common.対潜") }}</div>
        <div>{{ formatStatus(value.bonusAsw) }}</div>
      </template>
    </div>
    <div class="mt-2 body-2 text--secondary">{{ $t("Database.その他") }}</div>
    <v-divider></v-divider>
    <div class="item-statuses sub-sub">
      <template v-if="value.data.avoidId">
        <div>{{ $t("Common.射撃回避") }}</div>
        <div>{{ $t(`Common.回避性能.${avoidTexts[value.data.avoidId]}`) }}</div>
      </template>
      <template v-if="value.data.enabledAttackLandBase">
        <div>{{ $t("ItemList.対地攻撃") }}</div>
        <div>
          <template v-if="!isNotJapanese">{{ $t("Fleet.可") }}</template>
          <template v-else>&#10004;</template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.item-id {
  font-size: 12px;
  height: 16px;
}
.item-name {
  flex-grow: 1;
  width: 10px;
}
.item-statuses {
  padding-top: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: repeat(5, 22px);
  column-gap: 28px;
  font-size: 0.9em;
  text-align: right;
  align-items: center;
}
.item-statuses > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-statuses > div:nth-child(2n - 1) {
  font-size: 0.8em;
  text-align: left;
}
.item-statuses.synergy-bonus {
  grid-template-rows: repeat(3, 22px);
}
.item-statuses.remodel-bonus {
  grid-template-rows: repeat(2, 22px);
}
.item-statuses.sub-sub {
  grid-template-rows: repeat(1, 22px);
}
.no-status {
  opacity: 0.3;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Item from '../../classes/item/item';
import { ItemBonusStatus } from '../../classes/item/ItemBonus';
import Const from '../../classes/const';
import SiteSetting from '../../classes/siteSetting';

export default Vue.extend({
  name: 'ItemStatusView',
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
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    formatStatus() {
      return (value: number) => (value ? `+${Math.floor(100 * value) / 100}` : '');
    },
    formatBonus() {
      return (value: number) => (value >= 0 ? `+${value}` : `-${Math.abs(value)}`);
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
  },
});
</script>
