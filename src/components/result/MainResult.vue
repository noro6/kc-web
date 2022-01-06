<template>
  <v-card class="my-2 px-1 py-2">
    <div class="pa-2">計算結果</div>
    <v-divider></v-divider>
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
              <td v-for="k in battleCount" :key="k" :class="`td-battle${k - 1}`">{{ item.slotHistories[k - 1] }}</td>
              <td>{{ item.slotResult }}</td>
              <td class="pr-1">{{ item.deathRate > 0 ? `${item.deathRate} %` : "-" }}</td>
            </tr>
          </template>
          <tr>
            <td class="text-center" rowspan="2">制空値(平均)</td>
            <td class="text-center">自艦隊</td>
            <td v-for="(result, i) in results" :key="i" :class="`td-battle${i}`">{{ result.avgAirPower }}</td>
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
            <td v-for="(result, i) in results" :key="i" :class="`td-battle${i}`">{{ result.avgEnemyAirPower }}</td>
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
    <v-divider class="mb-5 mx-1"></v-divider>
    <v-tabs v-model="tab" class="px-2">
      <v-tab v-for="(enemyFleet, i) in battles" :key="i" :href="`#battle${i}`" @click="changedTab(i)"> {{ i + 1 }}戦目 </v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-card class="ma-2 py-3 pr-4 pl-2">
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
      <div v-for="(ab, i) in airbases" :key="i">
        <div class="d-flex">
          <div class="bar-label">基地{{ i + 1 }} 1波目</div>
          <div class="align-self-center flex-grow-1">
            <air-status-result-bar :result="ab.resultWave1" :no-label="true"></air-status-result-bar>
          </div>
        </div>
        <div class="d-flex mb-2">
          <div class="bar-label">基地{{ i + 1 }} 2波目</div>
          <div class="align-self-center flex-grow-1">
            <air-status-result-bar :result="ab.resultWave2" :no-label="true"></air-status-result-bar>
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
    <div>
      <div>敵機残数</div>
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
    </div>
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
.td-enemy-name,
.td-ship-name {
  font-size: 12px;
  text-align: center;
  width: 100px;
}
.td-enemy-name {
  width: 180px;
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
import Airbase from '@/classes/airbase/airbase';
import { AB_MODE } from '@/classes/const';
import EnemyMaster from '@/classes/enemy/enemyMaster';

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
    airbases(): Airbase[] {
      return this.value.airbaseInfo.airbases.filter((v) => {
        if (v.mode !== AB_MODE.BATTLE) {
          return false;
        }
        return v.battleTarget[0] === this.displayBattle || v.battleTarget[1] === this.displayBattle;
      });
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
              allDeathRate *= plane.deathRate;
              plane.deathRate = Math.round(plane.deathRate);
            }
          }
          enemies.push({ enemy: enemy.data, items: planes, allDeathRate: Math.floor(allDeathRate / 100) });
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
