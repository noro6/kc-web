<template>
  <v-card>
    <div class="d-flex pt-2 pb-1 pr-2">
      <div class="align-self-center ml-3">詳細計算</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="d-flex pa-2">
      <div>
        <v-card class="ma-4 pa-2">
          <template v-for="(item, i) in parent.items">
            <div
              v-if="item.isPlane"
              :key="`item_${i}`"
              v-ripple="{ class: 'info--text' }"
              class="calc-item"
              :class="{ selected: selectedIndex === i }"
              @click="selectItem(i)"
            >
              <div class="align-self-center body-2">{{ item.fullSlot }}</div>
              <div>
                <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="24" width="24"></v-img>
              </div>
              <div class="item-name text-truncate">{{ item.data.name }}</div>
              <div v-show="item.remodel" class="item-remodel">
                <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
                <span class="teal--text text--accent-4 body-2">{{ item.remodel }}</span>
              </div>
            </div>
            <div v-else :key="`item_${i}`" class="calc-item no-item">
              <div class="mx-auto">-</div>
            </div>
          </template>
        </v-card>
        <div class="ma-2">
          <bar-chart :data="graphData" :options="options" title-text="残機数分布" />
        </div>
      </div>
      <div class="ma-4 pa-2 flex-grow-1 fire-calc-container">
        <div class="header-content">
          <div class="pl-3">簡易火力計算機</div>
          <div class="pl-5">
            <v-img :src="`./img/type/icon${selectedItem.data.iconTypeId}.png`" height="24" width="24"></v-img>
          </div>
          <div class="px-2 item-name">{{ selectedItem.data.name }}</div>
          <div v-show="selectedItem.remodel" class="px-2">
            <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
            <span class="teal--text text--accent-4 body-2">{{ selectedItem.remodel }}</span>
          </div>
        </div>
        <div class="d-flex flex-wrap">
          <div class="form-control mx-1 my-2">
            <v-text-field
              type="number"
              v-model.number="selectedItem.remodel"
              min="0"
              max="10"
              label="改修値"
              hide-details
              outlined
              dense
              @input="calculateFire"
            ></v-text-field>
          </div>
          <div class="form-control mx-1 my-2">
            <v-select
              label="触接"
              v-model="calcArgs.contactBonus"
              :items="contacts"
              hide-details
              outlined
              dense
              @change="calculateFire"
            ></v-select>
          </div>
          <div class="form-control mx-1 my-2">
            <v-text-field
              type="number"
              v-model.number="attackerSlot"
              min="0"
              max="999"
              label="攻撃機搭載数"
              hide-details
              outlined
              dense
              @input="calculateFire"
              :disabled="useResult"
            ></v-text-field>
          </div>
          <div class="align-self-center mx-1 my-2">
            <v-checkbox label="残機数分布の結果を利用" dense hide-details v-model="useResult" @change="calculateFire"></v-checkbox>
          </div>
        </div>
        <div class="d-flex flex-wrap">
          <div class="form-control mx-1 my-2">
            <v-select label="弾薬補正" v-model="ammo" :items="ammos" hide-details outlined dense @change="calculateFire"></v-select>
          </div>
          <div class="form-control mx-1 my-2">
            <v-text-field
              type="number"
              v-model.number="calcArgs.afterCapBonus"
              min="0"
              max="9999"
              label="特効"
              hide-details
              outlined
              dense
              step="0.1"
              @input="calculateFire"
            ></v-text-field>
          </div>
          <div class="form-control lg mx-1 my-2">
            <v-select
              label="陸上偵察機"
              v-model="calcArgs.rikuteiBonus"
              :items="rikuteis"
              hide-details
              outlined
              dense
              @change="calculateFire"
            ></v-select>
          </div>
          <div class="align-self-center mx-1 my-2">
            <v-checkbox label="クリティカル" dense hide-details v-model="calcArgs.isCritical" @change="calculateFire"></v-checkbox>
          </div>
          <div class="align-self-center mx-1 my-2">
            <v-checkbox label="敵連合" dense hide-details v-model="isUnion" @change="calculateFire"></v-checkbox>
          </div>
        </div>
        <v-divider></v-divider>
        <div class="mb-2 mx-1 d-flex">
          <div class="align-self-end body-2">ダメージ計算結果</div>
          <v-spacer></v-spacer>
          <div class="align-self-end caption mr-3">防御艦隊:</div>
          <div>
            <v-select v-model="defenseIndex" :items="defenseFleets" hide-details dense @change="calculateFire"></v-select>
          </div>
        </div>
        <div class="d-flex damage-header">
          <div class="damage-td img"></div>
          <div class="damage-td">耐久</div>
          <div class="damage-td">装甲</div>
          <div class="damage-td grow">ダメージ幅</div>
          <div class="damage-td">撃沈率</div>
          <div class="damage-td">大破率</div>
          <div class="damage-td">中破率</div>
        </div>
        <div
          v-for="(row, i) in defenseShipRows"
          :key="`ship_${i}`"
          class="damage-tr"
          :class="{
            'tr-death': row.death >= 90,
            'tr-damaged': row.death + row.taiha >= 70,
            'tr-half-damaged': row.death + row.taiha + row.chuha >= 50,
          }"
        >
          <div>
            <v-img :src="`./img/ship/${row.ship.data.id}.png`" height="30" width="120"></v-img>
          </div>
          <div class="damage-td">{{ row.ship.data.hp }}</div>
          <div class="damage-td">{{ row.ship.actualArmor }}</div>
          <div class="damage-td grow">{{ row.damage }}</div>
          <template v-if="row.death < 100">
            <div class="damage-td">{{ row.death ? row.death + "%" : "-" }}</div>
            <div class="damage-td">{{ row.taiha ? row.taiha + "%" : "-" }}</div>
            <div class="damage-td">{{ row.chuha ? row.chuha + "%" : "-" }}</div>
          </template>
          <div v-else class="damage-td colspan-3">確殺</div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.calc-item {
  cursor: pointer;
  display: flex;
  border-radius: 0.15rem;
  padding: 0.25rem 0.5rem;
  width: 400px;
  transition: 0.2s;
}
.no-item {
  cursor: default;
}
.calc-item:not(.no-item):hover {
  box-shadow: inset 0 0 20px rgba(60, 192, 255, 0.2);
}
.calc-item.selected,
.calc-item.selected:hover {
  box-shadow: inset 0 0 20px rgba(60, 192, 255, 0.6);
}

.item-name {
  align-self: center;
  font-size: 0.8em;
  flex-grow: 1;
  width: 100px;
}
.item-remodel {
  width: 50px;
}

.fire-calc-container {
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 0.2rem;
}
.fire-calc-container .header-content {
  display: flex;
  position: relative;
  top: -20px;
}
.fire-calc-container .header-content > div {
  background-color: #fff;
}
.theme--dark .fire-calc-container .header-content > div {
  background-color: rgb(25, 25, 28);
}

.fire-calc-container .item-name {
  flex-grow: unset;
  width: unset;
}
.form-control {
  width: 120px;
  margin-top: 0.5rem;
  margin-right: 0.25rem;
  align-self: center;
}
.form-control.lg {
  width: 160px;
}

.damage-header {
  background-color: #f8f8f8;
  font-size: 0.75em;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(128, 128, 128, 0.3);
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
}
.theme--dark .damage-header {
  background-color: #2a2a2a;
}
.damage-tr {
  display: flex;
  padding: 0.15rem 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.damage-td {
  font-size: 0.9em;
  text-align: right;
  width: 12%;
  align-self: center;
}
.damage-td.img {
  width: 120px;
}
.damage-td.grow {
  width: unset;
  flex-grow: 1;
}
.damage-td.colspan-3 {
  text-align: center;
  width: 36%;
  color: #f22;
}

.damage-tr:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.damage-tr.tr-half-damaged {
  background-color: rgba(255, 255, 10, 0.075);
}
.damage-tr.tr-half-damaged:hover {
  background-color: rgba(255, 255, 10, 0.15);
}
.damage-tr.tr-damaged {
  background-color: rgba(255, 10, 10, 0.075);
}
.damage-tr.tr-damaged:hover {
  background-color: rgba(255, 10, 10, 0.15);
}
.damage-tr.tr-death {
  background-color: rgba(0, 150, 255, 0.075);
}
.damage-tr.tr-death:hover {
  background-color: rgba(0, 150, 255, 0.15);
}
</style>

<script lang="ts">
import Vue from 'vue';
import * as _ from 'lodash';
import BarChart, { BarGraphData, LabelCallbackArg } from '@/components/graph/Bar.vue';
import CalcManager from '@/classes/calcManager';
import SaveData from '@/classes/saveData/saveData';
import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import Item from '@/classes/item/item';
import { FirePowerCalcArgs } from '@/classes/interfaces/firePowerCalcArgs';
import CommonCalc from '@/classes/commonCalc';
import { SHIP_TYPE } from '@/classes/const';

const labelCallback = (c: LabelCallbackArg) => `${c.formattedValue} %`;

export default Vue.extend({
  name: 'PlaneDetailResult',
  components: { BarChart },
  props: {
    parent: {
      type: [Ship, Airbase, Enemy],
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    fleetIndex: {
      type: Number,
      default: 0,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    calcManager: undefined as undefined | CalcManager,
    selectedIndex: -1,
    selectedItem: new Item(),
    graphData: {
      labels: [''],
      datasets: [
        {
          yAxisID: 'main',
          label: '確率分布',
          data: [0],
          backgroundColor: 'rgba(255, 120, 180, 0.4)',
          datalabels: { display: false, color: '#000' },
        },
        {
          yAxisID: 'sub',
          label: '累積確率',
          data: [0],
          type: 'line',
          fill: false,
          borderColor: 'rgb(54, 162, 255)',
          datalabels: { display: false, color: '#000' },
          lineTension: 0.3,
        },
      ],
    } as BarGraphData,
    options: {
      responsive: true,
      scales: {
        x: {
          scaleLabel: { display: true, labelString: '累積確率 [%]' },
          grid: { color: 'rgba(128, 128, 128, 0.3)' },
          title: { display: true, text: '残機数 [機]' },
        },
        main: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          max: 100,
          min: 0,
          grid: { color: 'rgba(255, 128, 128, 0.3)' },
          title: { display: true, text: '確率分布 [%]' },
        },
        sub: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          max: 100,
          min: 0,
          grid: { color: 'rgba(128, 128, 255, 0.3)' },
          title: { display: true, text: '累積確率 [%]' },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: true },
        tooltip: { callbacks: { label: labelCallback } },
      },
    },
    attackerSlot: 18,
    useResult: true,
    calcArgs: {
      isCritical: false,
      criticalBonus: 1,
      contactBonus: 1,
      unionBonus: 1,
      rikuteiBonus: 1,
      specialBonus: 1,
      beforCapBonus: 1,
      afterCapBonus: 1,
      torpedoBonus: 1,
    } as FirePowerCalcArgs,
    contacts: [
      { text: 'なし', value: 1 },
      { text: '120%', value: 1.2 },
      { text: '117%', value: 1.17 },
      { text: '112%', value: 1.12 },
    ],
    ammo: 1,
    ammos: [
      { text: '～50%', value: 1 },
      { text: '～45%', value: 0.9 },
      { text: '～40%', value: 0.8 },
      { text: '～35%', value: 0.7 },
      { text: '～30%', value: 0.6 },
      { text: '～25%', value: 0.5 },
      { text: '～20%', value: 0.4 },
      { text: '～15%', value: 0.3 },
      { text: '～10%', value: 0.2 },
      { text: '～5%', value: 0.1 },
    ],
    rikuteis: [
      { text: 'なし', value: 1 },
      { text: '二式陸偵', value: 1.125 },
      { text: '二式陸偵(熟練)', value: 1.15 },
    ],
    isUnion: false,
    defenseIndex: 0,
    defenseFleets: [] as { text: string; value: number; ships: Ship[] | Enemy[] }[],
  }),
  mounted() {
    const saveData = this.$store.state.mainSaveData as SaveData;
    const items = this.$store.state.items as ItemMaster[];
    const ships = this.$store.state.ships as ShipMaster[];
    const enemies = this.$store.state.enemies as EnemyMaster[];

    this.calcManager = saveData.loadManagerData(items, ships, enemies);

    this.defenseFleets = [];
    if (this.parent instanceof Enemy) {
      // 防御側セレクトに味方艦隊をセット
      this.defenseFleets = [];
      const { fleets } = this.calcManager.fleetInfo;
      for (let i = 0; i < fleets.length - 1; i += 1) {
        const enabledShips = fleets[i].ships.filter((v) => !v.isEmpty);
        this.defenseFleets.push({ text: `第${i + 1}艦隊`, value: i, ships: enabledShips });
      }
    } else {
      const { fleets } = this.calcManager.battleInfo;
      // 防御側セレクトに敵艦隊をセット
      for (let i = 0; i < fleets.length; i += 1) {
        const enabledShips = fleets[i].enemies.filter((v) => v.data.id);
        this.defenseFleets.push({ text: `${i + 1}戦目`, value: i, ships: enabledShips });
      }

      if (this.parent instanceof Airbase) {
        const target = this.parent.battleTarget[1];
        this.defenseIndex = target;
      }
    }

    // ないとバグる 意味不明！！！！！！！！！！！！！！！
    setTimeout(() => {
      // 最初の攻撃機
      const attackerIndex = this.parent.items.findIndex((v) => v.isAttacker);
      this.selectItem(Math.max(0, attackerIndex));
    }, 50);
  },
  computed: {
    defenseShipRows(): { ship: Ship | Enemy; damage: string; death: number; taiha: number; chuha: number }[] {
      const item = this.defenseFleets[this.defenseIndex];
      if (!item) {
        return [];
      }

      const results = [];
      for (let i = 0; i < item.ships.length; i += 1) {
        results.push({
          ship: item.ships[i],
          damage: '-',
          death: 0,
          taiha: 0,
          chuha: 0,
        });
      }
      return results;
    },
  },
  methods: {
    selectItem(index: number) {
      if (this.selectedIndex === index || !this.calcManager) {
        return;
      }

      this.selectedIndex = index;
      let item: Item;

      // この艦載機情報の詳細計算フラグを立て、計算を行う
      if (this.parent instanceof Ship) {
        item = this.calcManager.fleetInfo.fleets[this.fleetIndex].ships[this.index].items[index];
        if (item) {
          item.needRecord = true;
        }
      } else if (this.parent instanceof Airbase) {
        this.calcManager.airbaseInfo.airbases[this.index].needShootDown = true;
        item = this.calcManager.airbaseInfo.airbases[this.index].items[index];
        if (item) {
          item.needRecord = true;
        }
      } else {
        item = new Item();
      }

      // 計算実行
      this.calcManager.updateInfo();

      if (item) {
        this.selectedItem = _.cloneDeep(item);
        // 集計
        const dist = _.groupBy(item.dist);
        const sum = item.dist.length;
        // リセット
        item.dist = [];

        // 確率分布
        const rates: number[] = [];
        // 累積確率
        let sumRate = 0;
        const sumRates: number[] = [];
        const labels: string[] = [];

        Object.keys(dist).forEach((key) => {
          labels.push(`${key}`);
          const rate = dist[key].length / sum;
          sumRate += rate;
          rates.push(Math.floor(1000 * rate) / 10);
          sumRates.push(Math.round(100 * sumRate));
        });

        const max = +(_.max(rates) || 100);
        this.options.scales.main.max = Math.min(Math.floor(10 * Math.ceil(max / 10)), 100);

        this.graphData.labels = labels;
        this.graphData.datasets[0].data = rates;
        this.graphData.datasets[1].data = sumRates;
      }

      this.calculateFire();
    },
    calculateFire() {
      const tempDist = this.selectedItem.dist;
      // 改修値 搭載数変更を適用して再インスタンス化
      this.selectedItem = new Item({ item: this.selectedItem, slot: this.attackerSlot });
      const item = this.selectedItem;
      this.selectedItem.dist = tempDist;

      // 搭載数分布
      const slotDist = _.groupBy(this.selectedItem.dist);
      const sum = this.selectedItem.dist.length;
      const minSlot = +(this.useResult ? _.min(Object.keys(slotDist)) || 0 : item.slot);

      // 引数調整
      this.calcArgs.unionBonus = this.isUnion ? 1.1 : 1;

      const rows = this.defenseShipRows;
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        // 防御艦
        const { ship } = row;
        // 潜水かどうか？
        const isSubmarine = ship.data.type === SHIP_TYPE.SS || ship.data.type === SHIP_TYPE.SSV;
        // 対潜攻撃可能かどうか？
        let enbaleAsw = false;

        // 火力分布
        let powers: { power: number; rate: number }[] = [];
        if (this.parent instanceof Airbase) {
          // 基地航空隊火力計算
          if (isSubmarine) {
            enbaleAsw = item.data.asw >= 7;
            // 対潜水
            if (this.useResult) {
              Object.keys(slotDist).forEach((key) => {
                const aswPowers = item.getAirbaseASWPowerDist(+key, this.calcArgs, slotDist[key].length / sum);
                for (let j = 0; j < aswPowers.length; j += 1) {
                  const { power, rate } = aswPowers[j];
                  const data = powers.find((v) => v.power === power);
                  if (data) {
                    data.rate += rate;
                  } else {
                    powers.push({ power, rate });
                  }
                }
              });
            } else {
              powers = item.getAirbaseASWPowerDist(item.slot, this.calcArgs);
            }
          } else if (this.useResult) {
            Object.keys(slotDist).forEach((key) => {
              const slot = +key;
              const rate = slotDist[key].length / sum;
              powers.push({ power: item.getAirbaseFirePower(slot, this.calcArgs, ship.data.type), rate });
            });
          } else {
            powers.push({ power: item.getAirbaseFirePower(item.slot, this.calcArgs, ship.data.type), rate: 1 });
          }
        }

        const isEnemy = ship instanceof Enemy;
        const HP = ship instanceof Ship && ship.level > 99 ? ship.data.hp2 : ship.data.hp;

        // 火力分布より、被ダメージ分布を取得
        const damageDist = CommonCalc.getDamageDistribution(powers, ship.actualArmor, this.ammo, HP, isEnemy);
        const damages = damageDist.map((v) => v.damage);

        // 最低 最大ダメ
        const minDamage = _.min(damages) as number;
        const maxDamage = _.max(damages) as number;

        // 各損傷状態必要ダメージボーダーとその確率 [死, 大, 中]
        const damageBorders = [
          { min: HP, max: maxDamage + 1, rate: 0 },
          { min: Math.ceil(HP * 0.75), max: HP, rate: 0 },
          { min: Math.ceil(HP * 0.5), max: Math.ceil(HP * 0.75), rate: 0 },
        ];

        for (let j = 0; j < damageBorders.length; j += 1) {
          const obj = damageBorders[j];
          const borderMin = obj.min;
          const borderMax = obj.max;
          // 各損傷状態を満たすボーダーを上回る確率を合計したもの => つまり〇〇率
          const okPowers = damageDist.filter((v) => v.damage >= borderMin && v.damage < borderMax).map((v) => v.rate);
          const rate = okPowers.length === damageDist.length ? 1 : (_.sum(okPowers) as number);
          obj.rate = rate;
        }

        // ダメージ幅表示調整
        if (!item.isAttacker) {
          row.damage = '-';
          row.death = 0;
          row.taiha = 0;
          row.chuha = 0;
          continue;
        }
        if (maxDamage === 0) {
          if (isSubmarine && !enbaleAsw) {
            // 敵潜水で対潜攻撃不可
            row.damage = '-';
          } else if (minSlot > 0) {
            // 攻撃機かつ搭載数があるのにダメージ0
            row.damage = '割合';
          } else {
            row.damage = '-';
          }
        } else if (minDamage === 0) {
          if (minSlot > 0) {
            // 全滅してないのに0なら割合
            row.damage = `割合 ~ ${maxDamage}`;
          } else {
            row.damage = `0 ~ ${maxDamage}`;
          }
        } else {
          row.damage = `${minDamage} ~ ${maxDamage}`;
        }

        row.death = Math.floor(damageBorders[0].rate * 1000) / 10;
        row.taiha = Math.floor(damageBorders[1].rate * 1000) / 10;
        row.chuha = Math.floor(damageBorders[2].rate * 1000) / 10;
      }
    },
    close() {
      this.handleClose();
    },
  },
});
</script>
