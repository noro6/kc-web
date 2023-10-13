<template>
  <div>
    <div class="d-flex mt-1">
      <div class="align-self-center">
        <v-img :src="`./img/ship/${value.data.id}.png`" height="30" width="120" />
      </div>
      <div class="ml-3 align-self-center">
        <div class="primary--text level-text">Lv {{ value.level }}</div>
        <div class="">
          <span>{{ getShipName(value.data) }}</span>
        </div>
      </div>
    </div>
    <div>
      <div class="status-container">
        <div class="grey--text text--lighten-1">{{ $t("Common.耐久") }}</div>
        <div>{{ value.hp }}</div>
        <div>
          <span v-if="buffHP" :class="{ 'bad-bonus': buffHP < 0 }">
            (<span class="manual-bonus">{{ formatBonus(buffHP) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.TP") }}</div>
        <div>{{ value.tp }}</div>
        <div>( {{ Math.floor(10 * value.tp * 0.7) / 10 }} )</div>
        <div class="grey--text text--lighten-1">{{ $t("Common.火力") }}</div>
        <div>{{ value.displayStatus.firePower }}</div>
        <div>
          <span v-if="value.itemBonusStatus.firePower" :class="{ 'bad-bonus': value.itemBonusStatus.firePower < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.firePower) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.支援火力") }}</div>
        <div>{{ value.supportFirePower }}</div>
        <div />
        <div class="grey--text text--lighten-1">{{ $t("Common.砲戦火力") }}</div>
        <div>{{ dayBattleFirePower }}</div>
        <div />
        <div class="grey--text text--lighten-1">{{ $t("Common.夜戦火力") }}</div>
        <div>{{ Math.floor(value.nightBattleFirePower) }}</div>
        <div />
        <div class="grey--text text--lighten-1">{{ $t("Common.装甲") }}</div>
        <div>{{ value.displayStatus.armor }}</div>
        <div>
          <span v-if="value.itemBonusStatus.armor" :class="{ 'bad-bonus': value.itemBonusStatus.armor < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.armor) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.雷装") }}</div>
        <div>{{ value.displayStatus.torpedo }}</div>
        <div>
          <span v-if="value.itemBonusStatus.torpedo" :class="{ 'bad-bonus': value.itemBonusStatus.torpedo < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.torpedo) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.回避") }}</div>
        <div>{{ value.displayStatus.avoid }}</div>
        <div>
          <span v-if="value.itemBonusStatus.avoid" :class="{ 'bad-bonus': value.itemBonusStatus.avoid < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.avoid) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.対空") }}</div>
        <div>{{ value.displayStatus.antiAir }}</div>
        <div>
          <span v-if="value.itemBonusStatus.antiAir" :class="{ 'bad-bonus': value.itemBonusStatus.antiAir < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.antiAir) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.命中") }}</div>
        <div>{{ value.displayStatus.accuracy }}</div>
        <div>
          <span v-if="value.itemBonusStatus.accuracy" :class="{ 'bad-bonus': value.itemBonusStatus.accuracy < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.accuracy) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.対潜") }}</div>
        <div>{{ value.displayStatus.asw }}</div>
        <div>
          <span v-if="value.itemBonusStatus.asw || value.improveAsw" :class="{ 'bad-bonus': value.itemBonusStatus.asw < 0 }"
            >(<span class="bonus" v-if="value.itemBonusStatus.asw">{{ formatBonus(value.itemBonusStatus.asw) }}</span
            ><span class="manual-bonus" v-if="value.improveAsw">{{ formatBonus(value.improveAsw) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.速力") }}</div>
        <div>{{ speedText }}</div>
        <div>
          <span v-if="buffSpeed" :class="{ 'bad-bonus': buffSpeed < 0 }">
            (<span class="bonus">{{ formatBonus(buffSpeed) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.索敵") }}</div>
        <div>{{ value.displayStatus.LoS }}</div>
        <div>
          <span v-if="value.itemBonusStatus.scout" :class="{ 'bad-bonus': value.itemBonusStatus.scout < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.scout) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.射程") }}</div>
        <div>{{ $t(`Common.${rangeText[value.displayStatus.range]}`) }}</div>
        <div>
          <span v-if="value.itemBonusStatus.range" :class="{ 'bad-bonus': value.itemBonusStatus.range < 0 }">
            (<span class="bonus">{{ formatBonus(value.itemBonusStatus.range) }}</span
            >)
          </span>
        </div>
        <div class="grey--text text--lighten-1">{{ $t("Common.運") }}</div>
        <div>{{ value.luck }}</div>
        <div>
          <span v-if="buffLuck" :class="{ 'bad-bonus': buffLuck < 0 }">
            (<span class="manual-bonus">{{ formatBonus(buffLuck) }}</span
            >)
          </span>
        </div>
      </div>
      <template v-if="specialAttacks.length">
        <v-divider class="my-1" />
        <div class="special-attack-table">
          <div class="grey--text text--lighten-1">{{ $t("Fleet.特殊攻撃") }}</div>
          <div class="grey--text text--lighten-1">{{ $t("Common.確保") }}</div>
          <div class="grey--text text--lighten-1">{{ $t("Common.優勢") }}</div>
          <template v-for="(row, i) in specialAttacks">
            <div class="text-left" :key="`sp_1${i}`">
              <span :class="{ 'orange--text text--lighten-2': row.text !== '合計' }" label outlined>{{ $t(`Fleet.${row.text}`) }}</span>
            </div>
            <div :key="`sp_2${i}`">{{ row.rate[0] }} %</div>
            <div :key="`sp_3${i}`">{{ row.rate[1] }} %</div>
          </template>
        </div>
      </template>
      <template v-if="nightSpecialAttacks.length">
        <v-divider class="my-1" />
        <div class="special-attack-table night">
          <div class="grey--text text--lighten-1 caption">{{ $t("Fleet.夜間特殊攻撃") }}</div>
          <div class="grey--text text--lighten-1">{{ $t("Fleet.通常") }}</div>
          <div class="d-flex justify-end">
            <div>
              <v-img :src="`./img/type/icon24.png`" height="25" width="25" />
            </div>
          </div>
          <div class="d-flex justify-end">
            <div>
              <v-img :src="`./img/type/icon27.png`" height="25" width="25" />
            </div>
          </div>
          <div class="d-flex justify-end">
            <div>
              <v-img :src="`./img/type/icon24.png`" height="25" width="25" />
            </div>
            <div class="mx-n2">
              <v-img :src="`./img/type/icon27.png`" height="25" width="25" />
            </div>
          </div>
          <template v-for="(row, i) in nightSpecialAttacks">
            <div class="text-left" :key="`spn_1${i}`">
              <span :class="{ 'indigo--text text--lighten-3': row.text !== '合計' }" label outlined>{{ $t(`Fleet.${row.text}`) }}</span>
            </div>
            <div class="pl-3" :key="`spn_2${i}`">{{ row.rate[0] }} %</div>
            <div class="pl-3" :key="`spn_3${i}`">{{ row.rate[1] }} %</div>
            <div class="pl-3" :key="`spn_4${i}`">{{ row.rate[2] }} %</div>
            <div class="pl-3" :key="`spn_5${i}`">{{ row.rate[3] }} %</div>
          </template>
        </div>
      </template>
      <v-divider class="my-1" />
      <div class="damage-rate-table">
        <div class="text-left grey--text text--lighten-1">{{ $t("Fleet.一撃大破") }}</div>
        <div>{{ taihaRate }}</div>
        <div class="text-left grey--text text--lighten-1">{{ $t("Fleet.一撃中破") }}</div>
        <div>{{ chuhaRate }}</div>
      </div>
      <v-divider class="my-1" />
      <div v-if="prevShip || nextShip" class="remodel-table">
        <template v-if="prevShip">
          <div class="text-left grey--text text--lighten-1">Prev</div>
          <div>
            <v-img :src="`./img/ship/${prevShip.id}.png`" height="30" width="120" />
          </div>
          <div>
            <div class="text-left caption">
              <div class="primary--text level-text">{{ prevLv ? `Lv ${prevLv}` : "-" }}</div>
              <div>
                {{ getShipName(prevShip) }}
              </div>
            </div>
          </div>
        </template>
        <template v-if="nextShip">
          <div class="text-left grey--text text--lighten-1">Next</div>
          <div>
            <v-img :src="`./img/ship/${nextShip.id}.png`" height="30" width="120" />
          </div>
          <div>
            <div class="text-left caption">
              <div class="primary--text level-text">Lv {{ value.data.nextLv }}</div>
              <div>
                {{ getShipName(nextShip) }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-text {
  font-size: 12px;
  font-weight: bold;
  height: 18px;
}

.status-container {
  display: grid;
  grid-template-columns: repeat(6, auto);
  column-gap: 0.5rem;
}
.status-container > div:nth-child(3n - 1) {
  text-align: right;
}
.status-container > div:nth-child(3n - 2),
.status-container > div:nth-child(3n) {
  text-align: left;
}
.bonus {
  margin-left: 4px;
  margin-right: 4px;
  color: #60c5ff;
}
.bad-bonus .bonus {
  color: #ff6767;
}
.manual-bonus {
  margin-left: 4px;
  margin-right: 4px;
  color: #fff460;
}

.special-attack-table {
  display: grid;
  grid-template-columns: repeat(3, auto);
  align-items: center;
}
.special-attack-table > div {
  text-align: right;
}
.special-attack-table > div:nth-child(1) {
  text-align: left;
}

.special-attack-table.night {
  grid-template-columns: repeat(5, auto);
}

.damage-rate-table {
  display: grid;
  grid-template-columns: repeat(2, auto);
}
.damage-rate-table > div {
  text-align: right;
}
.damage-rate-table > div:nth-child(1) {
  text-align: left;
}

.remodel-table {
  align-items: center;
  display: grid;
  grid-template-columns: repeat(3, auto);
}
</style>

<script lang="ts">
import Vue from 'vue';
import sum from 'lodash/sum';
import Ship from '@/classes/fleet/ship';
import ShipMaster from '@/classes/fleet/shipMaster';
import SiteSetting from '@/classes/siteSetting';
import SaveData from '@/classes/saveData/saveData';
import SpecialAttack from '../../classes/specialAttack';

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
    buffHP(): number {
      const ship = this.value;
      const baseHP = ship.level > 99 ? ship.data.hp2 : ship.data.hp;
      return ship.hp - baseHP;
    },
    baseLuck(): number {
      return this.value.data.luck;
    },
    buffLuck(): number {
      return this.value.luck - this.baseLuck;
    },
    taihaRate(): string {
      // ワンパン大破率
      let count = 0;
      const curHP = this.value.hp;
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
      const curHP = this.value.hp;
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
        const array = SpecialAttack.getDayBattleSpecialAttackRate(this.value, this.fleetRosCorr, this.isFlagship);
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
      const array = SpecialAttack.getNightBattleSpecialAttackRate(this.value, this.isFlagship);
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
    speedText(): string {
      if (this.value.speed <= 5) {
        return `${this.$t('Fleet.低速')}`;
      }
      if (this.value.speed <= 10) {
        return `${this.$t('Fleet.高速')}`;
      }
      if (this.value.speed <= 15) {
        return `${this.$t('Fleet.高速+')}`;
      }
      return `${this.$t('Fleet.最速')}`;
    },
    buffSpeed(): number {
      return (this.value.speed - this.value.data.speed) / 5;
    },
    dayBattleFirePower(): number {
      const mainData = this.$store.state.mainSaveData as SaveData;
      // 現在計算中の最終敵艦隊
      if (mainData) {
        const manager = mainData.tempData[mainData.tempIndex];
        if (manager) {
          const lastBattle = manager.battleInfo.fleets[manager.battleInfo.fleets.length - 1];
          if (lastBattle) {
            return Math.floor(Ship.getDayBattleFirePower(this.value, manager.fleetInfo.fleetType, lastBattle.isUnion));
          }
        }
      }

      // なければデフォルトで。
      return Math.floor(this.value.baseDayBattleFirePower);
    },
    prevShip(): ShipMaster | undefined {
      const ships = this.$store.state.ships as ShipMaster[];
      const prev = ships.find((v) => v.id === this.value.data.beforeId);
      return prev;
    },
    prevLv(): number {
      if (this.prevShip && this.prevShip.version) {
        const ship = this.prevShip;
        const ships = this.$store.state.ships as ShipMaster[];
        const prev = ships.find((v) => v.id === ship.beforeId);
        return prev ? prev.nextLv : 0;
      }
      return 0;
    },
    nextShip(): ShipMaster | null {
      const ships = this.$store.state.ships as ShipMaster[];
      const master = this.value.data;
      // 候補取得
      const versions = ships.filter((v) => v.originalId === master.originalId).sort((a, b) => a.version - b.version);
      // 現在のver
      const index = versions.findIndex((v) => v.id === master.id);
      const next = versions[index + 1];
      return next;
    },
  },
  methods: {
    getShipName(ship: ShipMaster): string {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (this.$i18n.locale === 'en' && !setting.nameIsNotTranslate) {
        const shipName = ShipMaster.getSuffix(ship);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return ship.name || '';
    },
  },
});
</script>
