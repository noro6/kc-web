<template>
  <v-card class="my-2 px-1 py-2" id="result-container" :class="{ captured: capturing }">
    <div class="d-flex pb-1">
      <div class="pl-2 align-self-center">計算結果</div>
      <v-spacer></v-spacer>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="reflesh" v-bind="attrs" v-on="on">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </template>
        <span>再計算</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="captureResult" v-bind="attrs" v-on="on">
            <v-icon>mdi-camera</v-icon>
          </v-btn>
        </template>
        <span>スクリーンショットを保存</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="handleMinimize(true)" v-bind="attrs" v-on="on">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </template>
        <span>最小化</span>
      </v-tooltip>
    </div>
    <v-divider class="mb-3"></v-divider>
    <div class="px-1">
      <div class="d-flex">
        <div class="body-2 px-2">戦闘開始時の搭載数推移</div>
        <div class="caption ml-auto" v-show="!capturing">※ 行クリックで詳細計算画面展開</div>
      </div>
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
            <tr v-for="(item, j) in ship.items" :key="`${i}-${j}`" class="cursor-pointer" @click="clickedShipRow(ship.index)">
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
            <td class="text-center py-1">自艦隊</td>
            <td v-for="(result, i) in results" :key="i" class="pr-md-1" :class="`td-battle${i}`">{{ result.avgAirPower }}</td>
            <td class="text-center header-td" colspan="2">消費平均</td>
          </tr>
          <tr>
            <td class="text-center py-1">敵艦隊</td>
            <td v-for="(result, i) in results" :key="i" class="pr-md-1" :class="`td-battle${i}`">{{ result.avgEnemyAirPower }}</td>
            <td colspan="2" rowspan="2">
              <div class="flex-grow-1 d-flex flex-column">
                <div class="d-flex mx-auto">
                  <div><v-img :src="`./img/util/bauxite.png`" height="18" width="18"></v-img></div>
                  <div>：{{ calcBauxite }}</div>
                </div>
                <div class="d-flex mx-auto" v-if="calcSteel !== '0'">
                  <div><v-img :src="`./img/util/steel.png`" height="18" width="18"></v-img></div>
                  <div>：{{ calcSteel }}</div>
                </div>
              </div>
            </td>
          </tr>
          <tr class="tr-status">
            <td class="text-center" colspan="2">制空状態</td>
            <td v-for="(result, i) in results" :key="i" :class="`td-battle${i}`">
              <span :class="`state-label state-${result.airState.value}`">{{ result.airState.text }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <v-divider></v-divider>
    </div>
    <v-tabs v-model="tab" class="px-2">
      <v-tab v-for="(enemyFleet, i) in battles" :key="i" :href="`#battle${i}`" @click="changedTab(i)"> {{ i + 1 }}戦目 </v-tab>
    </v-tabs>
    <v-divider class="mx-2"></v-divider>
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
      <div v-for="(ab, i) in airbaseWaveResults" :key="i" class="pb-1 cursor-pointer" @click="clickedAirbaseRow(ab.baseIndex)">
        <div class="d-flex">
          <div class="bar-label">{{ ab.text }}</div>
          <div class="align-self-center flex-grow-1">
            <air-status-result-bar :result="ab.result" :no-label="true"></air-status-result-bar>
          </div>
        </div>
      </div>
      <div class="d-flex mt-2">
        <div class="bar-label">本隊</div>
        <div class="align-self-center flex-grow-1">
          <air-status-result-bar :result="fleet.mainResult" :no-label="true"></air-status-result-bar>
        </div>
      </div>
    </v-card>
    <v-card class="ma-3 py-3 px-2">
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ab, i) in airbaseWaveResults" :key="`${i}`" class="cursor-pointer" @click="clickedAirbaseRow(ab.baseIndex)">
            <td>{{ ab.text }}</td>
            <td>{{ ab.result.avgAirPower }}</td>
            <td>{{ airPowerBorders(ab.result.avgEnemyAirPower) }}</td>
            <td v-for="(rate, j) in ab.result.rates" :key="`${i}-${j}`" class="pr-sm-1 py-1">
              <span v-if="rate">{{ rate }} %</span>
              <span v-else-if="j < 5">-</span>
            </td>
          </tr>
          <tr>
            <td>本隊</td>
            <td>{{ fleet.mainResult.avgAirPower }}</td>
            <td>{{ airPowerBorders(fleet.mainResult.avgEnemyAirPower) }}</td>
            <td v-for="(rate, i) in fleet.mainResult.rates" :key="i" class="pr-sm-1 py-1">
              <span v-if="rate">{{ rate }} %</span>
              <span v-else-if="i < 5">-</span>
            </td>
          </tr>
        </tbody>
      </table>
      <v-divider></v-divider>
    </v-card>
    <v-card class="ma-3 pb-3 px-2">
      <div class="d-flex mb-1">
        <div class="body-2 px-2 align-self-end">敵機残数</div>
        <div class="ml-auto">
          <v-select
            class="form-input"
            v-model="fleet.formation"
            :items="formations"
            hide-details
            dense
            @change="changedFormation(fleet.formation)"
          ></v-select>
        </div>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-icon class="align-self-center pt-2 mr-2" small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
          </template>
          <div class="caption">
            <div>このマスで選択する味方艦隊の陣形</div>
          </div>
        </v-tooltip>
      </div>
      <table>
        <thead>
          <tr>
            <th class="text-center">敵艦</th>
            <th class="text-center">装備</th>
            <th>初期搭載</th>
            <th>残数平均</th>
            <th>全滅率</th>
            <th>棒立ち率</th>
            <th class="pr-1" v-if="!capturing">詳細</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, i) in enemyTableData">
            <tr v-for="(item, j) in row.items" :key="`${i}-${j}`">
              <td class="td-enemy-name text-truncate" v-if="j === 0" :rowspan="row.items.length">{{ row.enemy.data.name }}</td>
              <td :class="`text-left d-flex py-1 item-input type-${item.data.iconTypeId}`">
                <div class="d-none d-sm-block px-0 px-md-1">
                  <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="20" width="20"></v-img>
                </div>
                <div class="align-self-center item-name text-truncate">{{ item.data.name }}</div>
              </td>
              <td>{{ item.fullSlot }}</td>
              <td>{{ item.slotResult }}</td>
              <td>{{ item.deathRate > 0 ? `${item.deathRate} %` : "-" }}</td>
              <td class="pr-1" v-if="j === 0" :rowspan="row.items.length">
                {{ row.allDeathRate > 0 ? `${row.allDeathRate} %` : "-" }}
              </td>
              <td v-if="j === 0 && !capturing" :rowspan="row.items.length">
                <v-btn color="info" icon small @click="viewDetail(row.enemy, row.index)">
                  <v-icon>mdi-information-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <v-divider></v-divider>
    </v-card>
    <v-dialog width="1200" v-model="detailDialog" transition="scroll-x-transition" @input="toggleDetailDialog">
      <v-card>
        <div class="d-flex pt-2 pb-1 pr-2">
          <div class="align-self-center ml-3">詳細計算</div>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeDetail">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <plane-detail-result
          v-if="!destroyDialog && detailParent"
          :parent="detailParent"
          :index="detailIndex"
          :fleetIndex="detailFleetIndex"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.v-timeline-item {
  padding-bottom: 8px;
}
.cursor-pointer {
  cursor: pointer;
}

table {
  font-size: 0.75em;
  text-align: right;
  width: 100%;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
  border-collapse: separate;
  border-spacing: 0;
}
table thead th {
  padding: 0.2rem 0;
}
table thead tr {
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
td.item-input {
  min-height: 22px;
}
.item-name {
  flex-grow: 1;
  font-size: 0.9em;
  width: 26px;
}

.tr-status {
  height: 25px;
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

.form-input {
  width: 120px;
}

#result-container.captured {
  width: 800px !important;
  background: #fff !important;
  border: 1px solid #bbb;
  border-radius: 0.25rem;
}
.theme--dark #result-container.captured {
  background: #1a1a1a !important;
  border: 1px solid #444;
}
.captured .v-card {
  box-shadow: none !important;
  border: 1px solid #bbb;
}
.theme--dark .captured .v-card {
  border: 1px solid #444;
}
</style>

<script lang="ts">
import Vue from 'vue';
import html2canvas from 'html2canvas';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import PlaneDetailResult from '@/components/result/PlaneDetailResult.vue';
import CalcManager from '@/classes/calcManager';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import Fleet from '@/classes/fleet/fleet';
import AirCalcResult from '@/classes/airCalcResult';
import Item from '@/classes/item/item';
import Const, { AB_MODE, Formation } from '@/classes/const';
import CommonCalc from '@/classes/commonCalc';
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';

export default Vue.extend({
  name: 'MainResult',
  components: {
    AirStatusResultBar,
    PlaneDetailResult,
  },
  props: {
    value: {
      type: CalcManager,
      required: true,
    },
    handleChangeMainBattle: {
      type: Function,
      required: true,
    },
    handleChangeFormation: {
      type: Function,
      required: true,
    },
    handleMinimize: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    tab: 'battle0',
    displayBattle: 0,
    destroyDialog: false,
    detailDialog: false,
    detailParent: undefined as Ship | Enemy | Airbase | undefined,
    detailIndex: 0,
    detailFleetIndex: 0,
    capturing: false,
  }),
  computed: {
    formations(): Formation[] {
      return Const.FORMATIONS;
    },
    airbaseWaveResults(): { text: string; result: AirCalcResult; baseIndex: number }[] {
      const results: { text: string; result: AirCalcResult; baseIndex: number }[] = [];
      for (let i = 0; i < this.value.airbaseInfo.airbases.length; i += 1) {
        const airbase = this.value.airbaseInfo.airbases[i];

        if (airbase.mode !== AB_MODE.BATTLE) {
          continue;
        }

        if (airbase.battleTarget[0] === this.displayBattle) {
          results.push({ text: `基地${i + 1} 1波目`, result: airbase.resultWave1, baseIndex: i });
        }
        if (airbase.battleTarget[1] === this.displayBattle) {
          results.push({ text: `基地${i + 1} 2波目`, result: airbase.resultWave2, baseIndex: i });
        }
      }

      return results;
    },
    fleet(): Fleet {
      return this.value.fleetInfo.mainFleet;
    },
    airbases(): Airbase[] {
      return this.value.airbaseInfo.airbases;
    },
    enabledAirbase(): { airbase: Airbase; index: number }[] {
      const target = this.value.mainBattle;
      const results = [];
      for (let i = 0; i < this.value.airbaseInfo.airbases.length; i += 1) {
        const airbase = this.value.airbaseInfo.airbases[i];
        if (airbase.mode === AB_MODE.BATTLE && airbase.battleTarget.includes(target)) {
          results.push({ airbase, index: i });
        }
      }
      return results;
    },
    tableData(): { name: string; items: Item[]; index: number }[] {
      const fleet = this.value.fleetInfo.mainFleet;
      const ships = [];

      const activeShips = fleet.ships.filter((v) => v.isActive && !v.isEmpty);
      for (let i = 0; i < activeShips.length; i += 1) {
        const planes = activeShips[i].items.filter((v) => v.isPlane);
        if (planes.length) {
          ships.push({ name: activeShips[i].data.name, items: planes, index: i });
        }
      }
      return ships;
    },
    enemyTableData(): { enemy: Enemy; items: Item[]; allDeathRate: number; index: number }[] {
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
          enemies.push({
            enemy,
            items: planes,
            allDeathRate: Math.floor(100 * allDeathRate),
            index: i,
          });
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
    calcSteel(): string {
      return this.value.fleetInfo.mainFleet.mainResult.avgUsedSteels.toFixed();
    },
    airPowerBorders: () => (airPower: number) => {
      CommonCalc.getAirStatusBorder(airPower).join(' / ');
      return `${airPower}（ ${CommonCalc.getAirStatusBorder(airPower).slice(0, 4).join(' / ')} ）`;
    },
  },
  methods: {
    reflesh() {
      this.handleChangeMainBattle(this.displayBattle);
    },
    changedTab(index: number) {
      if (this.displayBattle === index) {
        return;
      }

      if (index >= 0) {
        this.displayBattle = index;
      } else {
        this.displayBattle = this.battles.length - 1;
      }

      this.handleChangeMainBattle(this.displayBattle);
    },
    changedFormation(formation: number) {
      this.handleChangeFormation(formation);
    },
    clickedAirbaseRow(index: number) {
      this.viewDetail(this.airbases[index], index);
    },
    clickedShipRow(index: number) {
      const fleet = this.value.fleetInfo.mainFleet;
      const activeShips = fleet.ships.filter((v) => v.isActive && !v.isEmpty);
      const ship = activeShips[index];

      const shipIndex = fleet.ships.findIndex((v) => v === ship);
      if (shipIndex >= 0) {
        this.detailFleetIndex = this.value.fleetInfo.mainFleetIndex;
        this.viewDetail(ship, shipIndex);
      }
    },
    viewDetail(parent: Enemy | Ship | Airbase, index: number): void {
      this.detailParent = parent;
      this.detailIndex = index;
      if (parent instanceof Enemy) {
        this.detailFleetIndex = this.displayBattle;
      }
      this.destroyDialog = false;
      this.detailDialog = true;
    },
    closeDetail() {
      this.detailDialog = false;
      setTimeout(() => {
        this.detailParent = undefined;
      }, 100);
    },
    toggleDetailDialog() {
      if (!this.detailDialog) {
        this.closeDetail();
      } else {
        this.destroyDialog = false;
      }
    },
    captureResult() {
      // 背景色とかを塗るフラグ立て
      this.capturing = true;
      const div = document.getElementById('result-container') as HTMLDivElement;
      setTimeout(() => {
        html2canvas(div, { scale: 2 }).then((canvas) => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL();
          link.download = 'export_image.png';
          link.click();
          this.capturing = false;
        });
      }, 10);
    },
  },
});
</script>
