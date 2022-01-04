<template>
  <v-card class="my-2 px-1 py-2">
    <div class="pa-2">計算結果</div>
    <v-divider></v-divider>
    <v-tabs v-model="tab" class="px-2">
      <v-tab href="#orverview">概要</v-tab>
      <v-tab v-for="(enemyFleet, i) in battles" :key="i" :href="`#tab${i}`"> {{ i + 1 }}戦目 </v-tab>
      <v-tab-item value="orverview">
        <v-divider class="mb-3"></v-divider>
        <div class="body-2 pa-3">戦闘開始時の搭載数推移</div>
        <div class="px-1">
          <table>
            <thead>
              <tr>
                <th class="text-center">艦娘</th>
                <th class="text-center">装備</th>
                <th v-for="i in battleCount" :key="i">{{ i }}戦目</th>
                <th>出撃後</th>
                <th class="pr-1">全滅率</th>
              </tr>
            </thead>
            <tbody class="overview-tbody">
              <template v-for="(ship, i) in tableData">
                <tr v-for="(item, j) in ship.items" :key="`${i}-${j}`">
                  <td class="td-ship-name" v-if="j === 0" :rowspan="ship.items.length">{{ ship.name }}</td>
                  <td :class="`text-left d-flex item-input type-${item.data.iconTypeId}`">
                    <div class="align-self-center d-none d-sm-block">
                      <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="20" width="20"></v-img>
                    </div>
                    <div class="align-self-center item-name text-truncate">{{ item.data.name }}</div>
                  </td>
                  <td v-for="k in battleCount" :key="k">{{ item.slotHistories[k - 1] }}</td>
                  <td>{{ item.slotResult }}</td>
                  <td class="pr-1">{{ item.deathRate > 0 ? `${item.deathRate}%` : "-" }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <v-divider class="mb-5 mx-1"></v-divider>
        <div class="ma-1">
          <div class="body-2 pa-3">制空状態概要</div>
          <div class="pb-3">
            <v-timeline dense class="pt-2 pr-2">
              <v-timeline-item v-for="(enemyFleet, i) in battles" :key="i" :color="resultStatus[i].color" small>
                <v-alert elevation="4" class="pa-2 mr-1" v-ripple @click="tab = `tab${i}`">
                  <div class="battle-timeline">
                    <div class="body-2 mr-3">{{ i + 1 }}戦目</div>
                    <div>
                      <div class="battle-overview-enemies">
                        <div v-for="(enemy, j) in enemyFleet.mainEnemies" :key="j" class="mr-1">
                          <v-img :src="`./img/enemy/${enemy.data.id - 1500}.png`" height="25" width="100"></v-img>
                        </div>
                      </div>
                      <div class="battle-overview-enemies" v-if="enemyFleet.isUnion">
                        <div v-for="(enemy, j) in enemyFleet.escortEnemies" :key="j" class="mr-1">
                          <v-img :src="`./img/enemy/${enemy.data.id - 1500}.png`" height="25" width="100"></v-img>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="pb-1">
                    <air-status-result-bar :result="results[i]"></air-status-result-bar>
                  </div>
                </v-alert>
              </v-timeline-item>
            </v-timeline>
          </div>
        </div>
      </v-tab-item>
      <v-tab-item v-for="(enemyFleet, i) in battles" :key="i" :value="`tab${i}`">
        <v-divider></v-divider>
        <div>{{ i + 1 }}戦目の内容</div>
        <div>工事中</div>
      </v-tab-item>
    </v-tabs>
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
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}
table tr:hover {
  background-color: rgba(128, 128, 128, 0.05);
}
.td-ship-name {
  font-size: 12px;
  text-align: center;
  width: 100px;
}
td.item-input {
  border-right: 1px solid rgba(128, 128, 128, 0.4);
}
.item-name {
  margin-left: 0.1rem;
  flex-grow: 1;
  font-size: 0.9em;
  width: 26px;
}

.battle-timeline {
  display: flex;
}
.battle-timeline > div {
  align-self: center;
}
.battle-overview-enemies {
  display: flex;
  flex-wrap: wrap;
  margin-top: 0.1rem;
}
</style>

<script lang="ts">
import Vue from 'vue';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import CalcManager from '@/classes/calcManager';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import Const from '@/classes/const';
import Fleet from '@/classes/fleet/fleet';
import AirCalcResult from '@/classes/airCalcResult';
import Item from '@/classes/item/item';

export default Vue.extend({
  name: 'MainResult',
  components: { AirStatusResultBar },
  props: {
    value: {
      type: CalcManager,
      required: true,
    },
  },
  data: () => ({
    tab: 0,
  }),
  computed: {
    fleet(): Fleet {
      const f = this.value.fleetInfo;
      return f.fleets[f.mainFleetIndex];
    },
    tableData(): { name: string; items: Item[] }[] {
      const f = this.value.fleetInfo;
      const fleet = f.fleets[f.mainFleetIndex];
      const ships = [];

      for (let i = 0; i < fleet.ships.length; i += 1) {
        const planes = fleet.ships[i].items.filter((v) => v.isPlane);
        if (planes.length) {
          ships.push({ name: fleet.ships[i].data.name, items: planes });
        }
      }
      return ships;
    },
    battles(): EnemyFleet[] {
      return this.value.battleInfo.fleets;
    },
    battleCount(): number {
      return this.value.battleInfo.battleCount;
    },
    results(): AirCalcResult[] {
      const { fleetInfo } = this.value;
      return fleetInfo.fleets[fleetInfo.mainFleetIndex].results;
    },
    resultStatus(): { text: string; value: number; color: string }[] {
      const { fleetInfo } = this.value;
      const { results } = fleetInfo.fleets[fleetInfo.mainFleetIndex];

      const labels = [];
      for (let i = 0; i < results.length; i += 1) {
        const state = results[i].airState;
        const status = Const.AIR_STATUS.find((v) => v.value === state);
        labels.push(status || { text: 'なし', value: -1, color: '' });
      }
      return labels;
    },
  },
});
</script>
