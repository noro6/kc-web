<template>
  <div :class="{ dense: dense }">
    <div class="d-flex align-center">
      <div class="item-icon mr-1">
        <v-img v-if="value.data.iconTypeId" :src="`./img/type/icon${value.data.iconTypeId}.png`" height="32" width="32" />
        <v-icon v-else large color="grey">mdi-minus</v-icon>
      </div>
      <div class="flex-grow-1">
        <div class="item-id primary--text" v-if="value.data.id">id {{ value.data.id }}</div>
        <div class="body-2 d-flex flex-grow-1 align-center">
          <div class="text-truncate caption item-name" v-if="value.data.id">{{ needTrans ? $t(`${value.data.name}`) : value.data.name }}</div>
          <div class="text-truncate caption item-name text--secondary" v-else>{{ $t("Fleet.未装備") }}</div>
          <div v-if="value.remodel" class="ml-1 d-flex">
            <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
            <span class="teal--text text--accent-4">&plus;{{ value.remodel }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-1 caption grey--text">{{ $t("Common.基本装備性能") }}</div>
    <v-divider :dark="dark" />
    <div class="item-statuses">
      <template v-if="!dense || value.data.fire">
        <div :class="{ 'no-status': !value.data.fire }">{{ $t("Common.火力") }}</div>
        <div :class="{ 'no-status': !value.data.fire }">{{ value.data.fire }}</div>
      </template>
      <template v-if="dense && !isAirbaseMode && (value.dayBattleFirePower || value.aircraftDayBattleFirePower)">
        <div>{{ $t("Common.砲戦火力") }}</div>
        <div v-if="value.aircraftDayBattleFirePower !== value.dayBattleFirePower">{{ formatActual(value.aircraftDayBattleFirePower) }}</div>
        <div v-else>{{ formatActual(value.dayBattleFirePower) }}</div>
      </template>
      <template v-if="!dense || value.data.torpedo">
        <div :class="{ 'no-status': !value.data.torpedo }">{{ $t("Common.雷装") }}</div>
        <div :class="{ 'no-status': !value.data.torpedo }">{{ value.data.torpedo }}</div>
      </template>
      <template v-if="!dense || value.data.bomber">
        <div :class="{ 'no-status': !value.data.bomber }">{{ $t("Common.爆装") }}</div>
        <div :class="{ 'no-status': !value.data.bomber }">{{ value.data.bomber }}</div>
      </template>
      <template v-if="!dense || value.data.armor">
        <div :class="{ 'no-status': !value.data.armor }">{{ $t("Common.装甲") }}</div>
        <div :class="{ 'no-status': !value.data.armor }">{{ value.data.armor }}</div>
      </template>
      <template v-if="!dense || value.data.antiAir">
        <div :class="{ 'no-status': !value.data.antiAir }">{{ $t("Common.対空") }}</div>
        <div :class="{ 'no-status': !value.data.antiAir }">{{ value.data.antiAir }}</div>
      </template>
      <template v-if="dense && value.actualAntiAir && value.actualAntiAir !== value.data.antiAir">
        <div>{{ $t("Common.出撃対空") }}</div>
        <div>{{ formatActual(value.actualAntiAir) }}</div>
      </template>
      <template v-if="dense && isAirbaseMode && value.actualAntiAir !== value.actualDefenseAntiAir">
        <div>{{ $t("Common.防空対空") }}</div>
        <div>{{ formatActual(value.actualDefenseAntiAir) }}</div>
      </template>
      <template v-if="!dense || value.data.asw">
        <div :class="{ 'no-status': !value.data.asw }">{{ $t("Common.対潜") }}</div>
        <div :class="{ 'no-status': !value.data.asw }">{{ value.data.asw }}</div>
      </template>
      <template v-if="!dense || value.data.scout">
        <div :class="{ 'no-status': !value.data.scout }">{{ $t("Common.索敵") }}</div>
        <div :class="{ 'no-status': !value.data.scout }">{{ value.data.scout }}</div>
      </template>
      <template v-if="value.data.antiBomber">
        <div>{{ $t("Common.対爆") }}</div>
        <div>{{ value.data.antiBomber }}</div>
      </template>
      <template v-else-if="!dense || value.data.accuracy">
        <div :class="{ 'no-status': !value.data.accuracy }">{{ $t("Common.命中") }}</div>
        <div :class="{ 'no-status': !value.data.accuracy }">{{ value.data.accuracy }}</div>
      </template>
      <template v-if="value.data.interception">
        <div>{{ $t("Common.迎撃") }}</div>
        <div>{{ value.data.interception }}</div>
      </template>
      <template v-else-if="!dense || value.data.avoid">
        <div :class="{ 'no-status': !value.data.avoid }">{{ $t("Common.回避") }}</div>
        <div :class="{ 'no-status': !value.data.avoid }">{{ value.data.avoid }}</div>
      </template>
      <template v-if="value.data.range && (!isAirbaseMode || dense)">
        <div>{{ $t("Common.射程") }}</div>
        <div class="text-value">{{ $t(`Common.${rangeText[value.data.range]}`) }}</div>
      </template>
      <template v-if="isAirbaseMode">
        <div :class="{ 'no-status': !value.data.radius }">{{ $t("Common.半径") }}</div>
        <div :class="{ 'no-status': !value.data.radius }">{{ value.data.radius }}</div>
      </template>
      <template v-if="dense && isAirbaseMode && value.data.cost">
        <div>{{ $t("Common.コスト") }}</div>
        <div>{{ value.data.cost }}</div>
      </template>
    </div>
    <template v-if="!isAirbaseMode && (!dense || hasItemBonus)">
      <div class="mt-2 caption light-blue--text">{{ $t("Result.装備シナジーボーナス") }}</div>
      <v-divider :dark="dark" />
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
    </template>
    <template v-if="!dense || value.remodel">
      <div class="mt-2 caption teal--text text--accent-4">{{ $t("Common.改修ボーナス") }}</div>
      <v-divider :dark="dark" />
      <div class="item-statuses remodel-bonus">
        <template v-if="value.bonusFire">
          <div>{{ $t("Common.砲戦火力") }}</div>
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
    </template>
    <template v-if="!dense || value.data.isPlane || value.data.avoidId || value.data.enabledAttackLandBase">
      <div class="mt-2 caption grey--text">{{ $t("Database.その他") }}</div>
      <v-divider :dark="dark" />
      <div class="item-statuses sub-sub">
        <template v-if="value.data.avoidId">
          <div>{{ $t("Common.射撃回避") }}</div>
          <div class="text-value">{{ $t(`Common.回避性能.${avoidTexts[value.data.avoidId]}`) }}</div>
        </template>
        <template v-if="value.data.enabledAttackLandBase">
          <div>{{ $t("ItemList.対地攻撃") }}</div>
          <div class="text-value">
            <template v-if="!isNotJapanese">{{ $t("Fleet.可") }}</template>
            <template v-else>&#10004;</template>
          </div>
        </template>
      </div>
      <div v-if="value.data.isPlane" class="grow-speed">
        <div class="d-flex align-center">
          <div>
            <v-img :src="`./img/util/prof0.png`" alt="prof0" width="12" height="16" />
          </div>
          <div><v-icon small color="grey">mdi-arrow-right-thin</v-icon></div>
          <div>
            <v-img :src="`./img/util/prof7.png`" alt="prof7" width="12" height="16" />
          </div>
        </div>
        <div class="ml-8 text-value">{{ growSpeedString(value.data) }} {{ $t("ItemList.戦") }}</div>
      </div>
    </template>
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
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(10, 24px);
  column-gap: 28px;
  text-align: right;
  align-items: center;
}
.item-statuses.synergy-bonus {
  grid-template-rows: repeat(3, 24px);
}
.item-statuses.remodel-bonus {
  grid-template-rows: repeat(3, 24px);
}
.item-statuses.sub-sub {
  grid-template-rows: unset;
}
.item-statuses > div {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 24px;
}
.item-statuses > div:nth-child(2n - 1) {
  font-size: 12px;
  text-align: left;
}
@media (min-width: 450px) {
  .item-icon {
    display: none;
  }
}
@media (min-width: 600px) {
  .item-icon {
    display: block;
  }
  .item-statuses {
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: repeat(5, 24px);
  }
  .item-statuses.synergy-bonus {
    grid-template-rows: repeat(3, 24px);
  }
  .item-statuses.remodel-bonus {
    grid-template-rows: repeat(2, 24px);
  }
}
@media (min-width: 1000px) {
  .item-name {
    min-width: 200px;
  }
}
.no-status {
  opacity: 0.2;
}
.text-value {
  font-size: 12px !important;
}

.grow-speed {
  height: 24px;
  display: flex;
  align-items: center;
}

/** dense時は行数の指定を全て解除しできるだけ詰める */
.dense .item-statuses {
  grid-template-rows: unset;
}
/** 装備名を省略しない */
.dense .item-name {
  flex-grow: unset;
  width: unset;
  min-width: unset;
}

.grey--text {
  filter: drop-shadow(0 0 3px rgba(128, 128, 128, 0.2));
}
.light-blue--text {
  filter: drop-shadow(0 0 3px rgba(0, 188, 212, 0.3));
}
.teal--text {
  filter: drop-shadow(0 0 3px rgb(0, 191, 165, 0.3));
}
</style>

<script lang="ts">
import Vue from 'vue';
import Item from '@/classes/item/item';
import { ItemBonusStatus } from '@/classes/item/ItemBonus';
import Const from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';
import ItemMaster from '@/classes/item/itemMaster';
import CommonCalc from '@/classes/commonCalc';

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
    isAirbaseMode: {
      type: Boolean,
      default: false,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
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
    formatActual() {
      return (value: number) => (value ? `${Math.floor(10 * value) / 10}` : '');
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
    hasItemBonus(): boolean {
      const data = this.itemBonus as { [key: string]: number };
      return Object.keys(data).some((key) => !!data[key]);
    },
    growSpeedString() {
      return (itemMaster: ItemMaster) => CommonCalc.getGrowSpeedString(itemMaster);
    },
  },
});
</script>
