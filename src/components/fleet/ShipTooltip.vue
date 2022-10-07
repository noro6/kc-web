<template>
  <div>
    <div class="d-flex mt-1">
      <div class="align-self-center">
        <v-img :src="`./img/ship/${value.data.id}.png`" height="30" width="120"></v-img>
      </div>
      <div class="ml-3 align-self-center">
        <div class="caption">Lv: {{ value.level }}</div>
        <div class="body-2">
          <span>{{ shipName }}</span>
        </div>
      </div>
    </div>
    <div>
      <div class="status-container">
        <div class="caption grey--text text--lighten-1">{{ $t("Common.耐久") }}</div>
        <div>{{ value.hp }}</div>
        <div></div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.火力") }}</div>
        <div>{{ value.displayStatus.firePower }}</div>
        <div>
          <span v-if="value.itemBonusStatus.firePower" :class="{ 'bad-bonus': value.itemBonusStatus.firePower < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.firePower) }}</span
            >)
          </span>
        </div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.装甲") }}</div>
        <div>{{ value.displayStatus.armor }}</div>
        <div>
          <span v-if="value.itemBonusStatus.armor" :class="{ 'bad-bonus': value.itemBonusStatus.armor < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.armor) }}</span
            >)
          </span>
        </div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.雷装") }}</div>
        <div>{{ value.displayStatus.torpedo }}</div>
        <div>
          <span v-if="value.itemBonusStatus.torpedo" :class="{ 'bad-bonus': value.itemBonusStatus.torpedo < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.torpedo) }}</span
            >)
          </span>
        </div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.回避") }}</div>
        <div>{{ value.displayStatus.avoid }}</div>
        <div>
          <span v-if="value.itemBonusStatus.avoid" :class="{ 'bad-bonus': value.itemBonusStatus.avoid < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.avoid) }}</span
            >)
          </span>
        </div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.対空") }}</div>
        <div>{{ value.displayStatus.antiAir }}</div>
        <div>
          <span v-if="value.itemBonusStatus.antiAir" :class="{ 'bad-bonus': value.itemBonusStatus.antiAir < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.antiAir) }}</span
            >)
          </span>
        </div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.命中") }}</div>
        <div>{{ value.displayStatus.accuracy }}</div>
        <div>
          <span v-if="value.itemBonusStatus.accuracy" :class="{ 'bad-bonus': value.itemBonusStatus.accuracy < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.accuracy) }}</span
            >)
          </span>
        </div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.対潜") }}</div>
        <div>{{ value.displayStatus.asw }}</div>
        <div>
          <span v-if="value.itemBonusStatus.asw" :class="{ 'bad-bonus': value.itemBonusStatus.asw < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.asw) }}</span
            >)
          </span>
        </div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.射程") }}</div>
        <div>{{ $t(`Common.${rangeText[value.displayStatus.range]}`) }}</div>
        <div>
          <span v-if="value.itemBonusStatus.range" :class="{ 'bad-bonus': value.itemBonusStatus.range < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.range) }}</span
            >)
          </span>
        </div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.索敵") }}</div>
        <div>{{ value.displayStatus.LoS }}</div>
        <div>
          <span v-if="value.itemBonusStatus.scout" :class="{ 'bad-bonus': value.itemBonusStatus.scout < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.scout) }}</span
            >)
          </span>
        </div>
        <div class="caption grey--text text--lighten-1">{{ $t("Common.運") }}</div>
        <div>{{ value.luck }}</div>
        <div></div>
      </div>
      <template v-if="specialAttacks.length">
        <v-divider class="my-2"></v-divider>
        <table>
          <tr>
            <td class="caption grey--text text--lighten-1 text-left">{{ $t("Fleet.特殊攻撃") }}</td>
            <td class="caption grey--text text--lighten-1 px-8">{{ $t("Common.確保") }}</td>
            <td class="caption grey--text text--lighten-1">{{ $t("Common.優勢") }}</td>
          </tr>
          <tr v-for="(row, i) in specialAttacks" :key="`sp${i}`">
            <td class="text-left">
              <span :class="{ 'orange--text text--lighten-2': row.text !== '合計' }" label outlined>{{ $t(`Fleet.${row.text}`) }}</span>
            </td>
            <td class="px-8">{{ row.rate[0] }} %</td>
            <td>{{ row.rate[1] }} %</td>
          </tr>
        </table>
      </template>
      <template v-if="nightSpecialAttacks.length">
        <v-divider class="my-2"></v-divider>
        <table>
          <tr>
            <td class="caption grey--text text--lighten-1 text-left">{{ $t("Fleet.夜間特殊攻撃") }}</td>
            <td class="caption grey--text text--lighten-1 px-2">{{ $t("Fleet.通常") }}</td>
            <td class="caption pl-6 pr-1">
              <v-img :src="`./img/type/icon24.png`" height="27" width="27"></v-img>
            </td>
            <td class="caption pl-6 pr-1">
              <v-img :src="`./img/type/icon27.png`" height="27" width="27"></v-img>
            </td>
            <td>
              <div class="d-flex caption">
                <v-img :src="`./img/type/icon24.png`" height="27" width="27"></v-img>
                <div class="align-self-center grey--text text--lighten-3">&</div>
                <v-img :src="`./img/type/icon27.png`" height="27" width="27"></v-img>
              </div>
            </td>
          </tr>
          <tr v-for="(row, i) in nightSpecialAttacks" :key="`sp${i}`">
            <td class="text-left">
              <span :class="{ 'indigo--text text--lighten-3': row.text !== '合計' }" label outlined>{{ $t(`Fleet.${row.text}`) }}</span>
            </td>
            <td class="px-2">{{ row.rate[0] }} %</td>
            <td class="px-2">{{ row.rate[1] }} %</td>
            <td class="px-2">{{ row.rate[2] }} %</td>
            <td class="px-2">{{ row.rate[3] }} %</td>
          </tr>
        </table>
      </template>
      <v-divider class="my-2"></v-divider>
      <table>
        <tr>
          <td class="text-left caption grey--text text--lighten-1">{{ $t("Fleet.一撃大破") }}</td>
          <td>{{ taihaRate }}</td>
        </tr>
        <tr>
          <td class="text-left caption grey--text text--lighten-1">{{ $t("Fleet.一撃中破") }}</td>
          <td>{{ chuhaRate }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  text-align: right;
}

.status-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  column-gap: 0.5rem;
}
.status-container > div:nth-child(3n - 1) {
  text-align: right;
}
.status-container > div:nth-child(3n) {
  text-align: left;
  font-size: 0.9em;
}

.bonus {
  margin-left: 4px;
  margin-right: 4px;
  color: #60c5ff;
}
.bad-bonus .bonus {
  color: #ff6767;
}
</style>

<script lang="ts">
import Vue from 'vue';
import sum from 'lodash/sum';
import Ship from '@/classes/fleet/ship';
import ShipMaster from '@/classes/fleet/shipMaster';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'ShipTooltip',
  props: {
    value: {
      type: Ship,
      required: true,
    },
    fleetRosCorr: {
      type: Number,
      default: 0,
    },
    isFlagship: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    rangeText: ['', '短', '中', '長', '超長', '超長+', '極', '極+', '極長', '極長+'],
  }),
  computed: {
    formatBonus() {
      return (value: number) => (value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`);
    },
    baseHP(): number {
      const ship = this.value;
      return ship.level > 99 ? ship.data.hp2 : ship.data.hp;
    },
    buffHP(): number {
      return this.value.hp - this.baseHP;
    },
    baseAsw(): number {
      const ship = this.value;
      return ship.level === 99 ? ship.data.maxAsw : Ship.getStatusFromLevel(ship.level, ship.data.maxAsw, ship.data.minAsw);
    },
    buffAsw(): number {
      return this.value.asw - this.baseAsw;
    },
    maxAsw(): number {
      const ship = this.value;
      return Ship.getStatusFromLevel(ship.level, ship.data.maxAsw, ship.data.minAsw) + 9;
    },
    baseLuck(): number {
      return this.value.data.luck;
    },
    buffLuck(): number {
      return this.value.luck - this.baseLuck;
    },
    maxLuck(): number {
      return this.value.data.maxLuck;
    },
    maxAntiAir(): number {
      return this.value.data.antiAir;
    },
    taihaRate(): string {
      // ワンパン大破率
      let count = 0;
      const curHP = this.baseHP + this.buffHP;
      const border = Math.floor(curHP / 4);
      for (let i = 0; i < curHP; i += 1) {
        const damage = Math.floor(curHP * 0.5 + i * 0.3);
        const hp = curHP - damage;
        if (hp <= border) {
          count += 1;
        }
      }
      return `${((100 * count) / curHP).toFixed(1)} %`;
    },
    chuhaRate(): string {
      // ワンパン中破率
      let count = 0;
      const curHP = this.baseHP + this.buffHP;
      const border = Math.floor(curHP / 4);
      const border2 = Math.floor(curHP / 2);
      for (let i = 0; i < curHP; i += 1) {
        const damage = Math.floor(curHP * 0.5 + i * 0.3);
        const hp = curHP - damage;
        if (border < hp && hp <= border2) {
          count += 1;
        }
      }
      return `${((100 * count) / curHP).toFixed(1)} %`;
    },
    specialAttacks(): { text: string; rate: number[] }[] {
      if (this.fleetRosCorr) {
        const array = this.value.getDayBattleSpecialAttackRate(this.fleetRosCorr, this.isFlagship);
        if (array.length) {
          array.push({ text: '合計', rate: [sum(array.map((v) => v.rate[0])), sum(array.map((v) => v.rate[1]))] });
        }

        array.forEach((v) => {
          v.rate = v.rate.map((x) => Math.round(1000 * x) / 10);
        });
        return array;
      }
      return [];
    },
    nightSpecialAttacks(): { text: string; rate: number[] }[] {
      const array = this.value.getNightBattleSpecialAttackRate(this.isFlagship);
      if (array.length) {
        array.push({
          text: '合計',
          rate: [sum(array.map((v) => v.rate[0])), sum(array.map((v) => v.rate[1])), sum(array.map((v) => v.rate[2])), sum(array.map((v) => v.rate[3]))],
        });
      }
      array.forEach((v) => {
        v.rate = v.rate.map((x) => Math.round(1000 * x) / 10);
      });
      return array;
    },
    shipName(): string {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (this.$i18n.locale === 'en' && !setting.nameIsNotTranslate) {
        const shipName = ShipMaster.getSuffix(this.value.data);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return this.value.data.name || '';
    },
  },
});
</script>
