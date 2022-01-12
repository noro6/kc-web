<template>
  <v-card class="my-2 px-1 py-2">
    <div class="pa-2">計算結果</div>
    <v-divider class="mb-3"></v-divider>
    <div class="px-1">
      <div class="body-2 px-2">戦闘開始時の搭載数推移</div>
      <table>
        <thead>
          <tr>
            <th class="text-center">艦娘</th>
            <th class="text-center">装備</th>
            <th v-for="i in battleCount" :key="i" :class="`td-battle${i - 1}`">{{ i }}戦目</th>
            <th>出撃後</th>
            <th class="pr-1">全滅率</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(ship, i) in tableData">
            <tr v-for="(item, j) in ship.items" :key="`${i}-${j}`">
              <td class="td-ship-name" v-if="j === 0" :rowspan="ship.items.length">{{ ship.name }}</td>
              <td :class="`text-left d-flex item-input type-${item.data.iconTypeId}`">
                <div class="d-none d-sm-block px-0 px-md-1">
                  <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="22" width="22"></v-img>
                </div>
                <div class="align-self-center item-name text-truncate">{{ item.data.name }}</div>
              </td>
              <td v-for="k in battleCount" :key="k" class="pr-md-1" :class="`td-battle${k - 1}`">{{ item.slotHistories[k - 1] }}</td>
              <td class="pr-md-1">{{ item.slotResult }}</td>
              <td class="pr-1">{{ item.deathRate > 0 ? `${item.deathRate} %` : "-" }}</td>
            </tr>
          </template>
          <tr>
            <td class="text-center" rowspan="2">制空値(平均)</td>
            <td class="text-center">自艦隊</td>
            <td v-for="(result, i) in results" :key="i" class="pr-md-1" :class="`td-battle${i}`">{{ result.avgAirPower }}</td>
            <td class="text-center header-td" colspan="2">
              <div class="d-flex justify-center">
                <div>
                  <v-img :src="`./img/util/bauxite.png`" height="18" width="18"></v-img>
                </div>
                <div class="ml-1 align-self-center">消費平均</div>
              </div>
            </td>
          </tr>
          <tr>
            <td class="text-center">敵艦隊</td>
            <td v-for="(result, i) in results" :key="i" class="pr-md-1" :class="`td-battle${i}`">{{ result.avgEnemyAirPower }}</td>
            <td class="text-center" colspan="2" rowspan="2">{{ calcBauxite }}</td>
          </tr>
          <tr class="tr-status">
            <td class="text-center" colspan="2">制空状態</td>
            <td v-for="(result, i) in results" :key="i" :class="`td-battle${i}`">
              <span :class="`state-label state-${result.airState.value}`">{{ result.airState.text }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <v-divider class="mb-2 mx-1"></v-divider>
    <v-tabs v-model="tab" class="px-2">
      <v-tab v-for="(enemyFleet, i) in battles" :key="i" :href="`#battle${i}`" @click="changedTab(i)"> {{ i + 1 }}戦目 </v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-card class="ma-3 py-3 pr-4 pl-2">
      <div class="d-flex mt-1">
        <div class="bar-label"></div>
        <div class="flex-grow-1 d-flex">
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
      </div>
      <div v-for="(ab, i) in airbaseWaveResults" :key="i">
        <div class="d-flex">
          <div class="bar-label">{{ ab.text }}</div>
          <div class="align-self-center flex-grow-1">
            <air-status-result-bar :result="ab.result" :no-label="true"></air-status-result-bar>
          </div>
        </div>
      </div>
      <div class="d-flex">
        <div class="bar-label">本隊</div>
        <div class="align-self-center flex-grow-1">
          <air-status-result-bar :result="fleet.mainResult" :no-label="true"></air-status-result-bar>
        </div>
      </div>
    </v-card>
    <v-card class="ma-3 py-3 pr-4 pl-2">
      <div class="body-2 px-2">各フェーズ制空状態の確率</div>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>制空値</th>
            <th>敵制空値( 確保 / 優勢 / 拮抗 / 劣勢)</th>
            <th class="pr-sm-1">確保</th>
            <th class="pr-sm-1">優勢</th>
            <th class="pr-sm-1">拮抗</th>
            <th class="pr-sm-1">劣勢</th>
            <th class="pr-sm-1">喪失</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ab, i) in airbaseWaveResults" :key="`${i}`">
            <td>{{ ab.text }}</td>
            <td>{{ ab.result.avgAirPower }}</td>
            <td>{{ airPowerBorders(ab.result.avgEnemyAirPower) }}</td>
            <td v-for="(rate, j) in ab.result.rates" :key="`${i}-${j}`" class="pr-sm-1">
              <span v-if="rate">{{ rate }} %</span>
              <span v-else-if="j < 5">-</span>
            </td>
          </tr>
          <tr>
            <td>本隊</td>
            <td>{{ fleet.mainResult.avgAirPower }}</td>
            <td>{{ airPowerBorders(fleet.mainResult.avgEnemyAirPower) }}</td>
            <td v-for="(rate, i) in fleet.mainResult.rates" :key="i" class="pr-sm-1">
              <span v-if="rate">{{ rate }} %</span>
              <span v-else-if="i < 5">-</span>
            </td>
          </tr>
        </tbody>
      </table>
      <v-divider></v-divider>
    </v-card>
    <v-card class="ma-3 py-3 pr-4 pl-2">
      <div class="body-2 px-2">敵機残数</div>
      <table>
        <thead>
          <tr>
            <th class="text-center">敵艦</th>
            <th class="text-center">装備</th>
            <th>初期搭載</th>
            <th>残数平均</th>
            <th>全滅率</th>
            <th class="pr-1">棒立ち率</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(enemy, i) in enemyTableData">
            <tr v-for="(item, j) in enemy.items" :key="`${i}-${j}`">
              <td class="td-enemy-name text-truncate" v-if="j === 0" :rowspan="enemy.items.length">{{ enemy.enemy.name }}</td>
              <td :class="`text-left d-flex item-input type-${item.data.iconTypeId}`">
                <div class="d-none d-sm-block px-0 px-md-1">
                  <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="22" width="22"></v-img>
                </div>
                <div class="align-self-center item-name text-truncate">{{ item.data.name }}</div>
              </td>
              <td>{{ item.fullSlot }}</td>
              <td>{{ item.slotResult }}</td>
              <td>{{ item.deathRate > 0 ? `${item.deathRate} %` : "-" }}</td>
              <td class="pr-1" v-if="j === 0" :rowspan="enemy.items.length">
                {{ enemy.allDeathRate > 0 ? `${enemy.allDeathRate} %` : "-" }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <v-divider></v-divider>
    </v-card>
  </v-card>
</template>

<style scoped>
.v-timeline-item {
  padding-bottom: 8px;
}

table {
  font-size: 0.75em;
  text-align: right;
  width: 100%;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
  border-collapse: collapse;
}
table thead th {
  padding: 0.2rem 0;
  background-color: rgba(128, 128, 128, 0.1);
}
table th {
  opacity: 0.8;
}
table tr td {
  border-top: 1px solid rgba(128, 128, 128, 0.25);
}
table tr:hover {
  background-color: rgba(128, 128, 128, 0.05);
}
.td-ship-name {
  font-size: 12px;
  text-align: center;
  width: 100px;
}
.td-enemy-name {
  font-size: 12px;
  text-align: center;
}
.td-battle0 {
  border-left: 1px solid rgba(128, 128, 128, 0.4);
}
.item-name {
  flex-grow: 1;
  font-size: 0.9em;
  width: 26px;
}

.tr-status {
  height: 24px;
}
.tr-status td {
  position: relative;
}
.state-label {
  position: absolute;
  text-align: center;
  font-size: 12px;
  padding: 1px 0;
  width: 42px;
  border-radius: 0.25rem;
  right: 0px;
  bottom: 1px;
}
.state-0 {
  border: 1px solid rgba(76, 175, 80, 0.6);
  box-shadow: inset 0 0 12px rgba(76, 175, 80, 0.6);
}
.state-1 {
  border: 1px solid rgba(139, 195, 74, 0.6);
  box-shadow: inset 0 0 12px rgba(139, 195, 74, 0.6);
}
.state-2 {
  border: 1px solid rgba(249, 217, 37, 0.6);
  box-shadow: inset 0 0 12px rgba(249, 217, 37, 0.6);
}
.state-3 {
  border: 1px solid rgba(239, 143, 0, 0.6);
  box-shadow: inset 0 0 12px rgba(239, 143, 0, 0.6);
}
.state-4 {
  border: 1px solid rgba(244, 67, 54, 0.6);
  box-shadow: inset 0 0 12px rgba(244, 67, 54, 0.6);
}

.header-td {
  background-color: rgba(128, 128, 128, 0.1);
}

.bar-label {
  text-align: center;
  font-size: 12px;
  width: 78px;
  margin-right: 0.25rem;
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
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import CalcManager from '@/classes/calcManager';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import Fleet from '@/classes/fleet/fleet';
import AirCalcResult from '@/classes/airCalcResult';
import Item from '@/classes/item/item';
import { AB_MODE } from '@/classes/const';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import CommonCalc from '@/classes/commonCalc';

export default Vue.extend({
  name: 'MainResult',
  components: { AirStatusResultBar },
  props: {
    value: {
      type: CalcManager,
      required: true,
    },
    handleChangeMainBattle: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    tab: 'battle0',
    displayBattle: 0,
  }),
  computed: {
    airbaseWaveResults(): { text: string; result: AirCalcResult }[] {
      const results: { text: string; result: AirCalcResult }[] = [];
      for (let i = 0; i < this.value.airbaseInfo.airbases.length; i += 1) {
        const airbase = this.value.airbaseInfo.airbases[i];

        if (airbase.mode !== AB_MODE.BATTLE) {
          continue;
        }

        if (airbase.battleTarget[0] === this.displayBattle) {
          results.push({ text: `基地${i + 1} 1波目`, result: airbase.resultWave1 });
        }
        if (airbase.battleTarget[1] === this.displayBattle) {
          results.push({ text: `基地${i + 1} 2波目`, result: airbase.resultWave2 });
        }
      }

      return results;
    },
    fleet(): Fleet {
      return this.value.fleetInfo.mainFleet;
    },
    tableData(): { name: string; items: Item[] }[] {
      const fleet = this.value.fleetInfo.mainFleet;
      const ships = [];

      for (let i = 0; i < fleet.ships.length; i += 1) {
        const planes = fleet.ships[i].items.filter((v) => v.isPlane);
        if (planes.length) {
          ships.push({ name: fleet.ships[i].data.name, items: planes });
        }
      }
      return ships;
    },
    enemyTableData(): { enemy: EnemyMaster; items: Item[]; allDeathRate: number }[] {
      const fleet = this.value.battleInfo.fleets[this.value.mainBattle];
      const enemies = [];

      for (let i = 0; i < fleet.enemies.length; i += 1) {
        const enemy = fleet.enemies[i];
        const planes = enemy.items.filter((v) => v.isPlane && !v.isRecon);
        if (planes.length) {
          let allDeathRate = 1;
          for (let j = 0; j < planes.length; j += 1) {
            const plane = planes[j];
            if (plane.isAttacker) {
              allDeathRate *= plane.deathRate / 100;
              plane.deathRate = Math.round(plane.deathRate);
            }
          }
          enemies.push({ enemy: enemy.data, items: planes, allDeathRate: Math.floor(100 * allDeathRate) });
        }
      }
      return enemies;
    },
    battles(): EnemyFleet[] {
      return this.value.battleInfo.fleets;
    },
    battleCount(): number {
      return this.value.battleInfo.battleCount;
    },
    results(): AirCalcResult[] {
      return this.value.fleetInfo.mainFleet.results;
    },
    calcBauxite(): string {
      return (5 * this.value.fleetInfo.mainFleet.mainResult.avgDownSlot).toFixed();
    },
    airPowerBorders: () => (airPower: number) => {
      CommonCalc.getAirStatusBorder(airPower).join(' / ');
      return `${airPower}（ ${CommonCalc.getAirStatusBorder(airPower).slice(0, 4).join(' / ')} ）`;
    },
  },
  methods: {
    changedTab(index: number) {
      if (index >= 0) {
        this.displayBattle = index;
      } else {
        this.displayBattle = this.battles.length - 1;
      }

      this.handleChangeMainBattle(this.displayBattle);
    },
  },
});
</script>
