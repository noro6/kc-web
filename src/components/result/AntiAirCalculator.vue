<template>
  <div class="mx-2 mb-2 mb-sm-0 mx-sm-0 mt-2">
    <div class="input-container">
      <v-select :label="$t('Common.陣形')" v-model="formation" :items="formations" hide-details outlined dense @change="updateTable" />
      <v-select :label="$t('Fleet.対空CI')" v-model="cutInId" :items="antiAirItems" hide-details outlined dense @change="updateTable" />
      <v-text-field
        type="number"
        v-model.number="attackerSlot"
        min="0"
        max="999"
        :label="$t('Fleet.攻撃機搭載数')"
        hide-details
        outlined
        dense
        @input="updateTable"
      />
      <v-select :label="$t('Fleet.対空射撃回避')" v-model="avoid" :items="avoids" hide-details outlined dense @change="updateTable" />
      <v-text-field
        type="number"
        min="0"
        max="2"
        step="0.1"
        v-model.number="adj1"
        :label="$t('Fleet.加重対空補正')"
        hide-details
        outlined
        dense
        :disabled="!isManual || showAntiAirMode"
        @input="updateTable"
      />
      <v-text-field
        type="number"
        min="0"
        max="2"
        step="0.1"
        v-model.number="adj2"
        :label="$t('Fleet.艦隊防空補正')"
        hide-details
        outlined
        dense
        :disabled="!isManual || showAntiAirMode"
        @input="updateTable"
      />
    </div>
    <div class="mb-1 d-flex flex-wrap px-1">
      <div class="align-self-end">
        <span class="body-2 text--secondary mr-2">{{ $t("Common.艦隊防空値") }}</span>
        <span>{{ fleetAntiAir }}</span>
      </div>
      <div class="align-self-end">
        <v-switch class="mt-2 mb-0 ml-4" v-model="showAntiAirMode" dense hide-details :label="$t('Result.対空CI一覧')" @change="setAntiAirCutInTable" />
      </div>
      <div class="ml-auto d-flex" v-if="!showAntiAirMode">
        <v-checkbox class="mr-3" :label="$t('Fleet.空襲マス')" v-model="isAirRaid" dense hide-details @change="updateTable" />
        <v-checkbox
          v-if="!isEnemyMode && !fleet.isUnion"
          class="mr-3"
          :label="$t('Result.対敵連合艦隊')"
          v-model="isEnemyUnion"
          dense
          hide-details
          @change="updateTable"
        />
        <v-checkbox :label="$t('Fleet.敵側式')" v-model="isEnemyFormula" dense hide-details @change="updateTable" />
      </div>
    </div>
    <div v-if="!showAntiAirMode">
      <v-divider />
      <v-simple-table fixed-header height="54vh">
        <template v-slot:default>
          <thead>
            <tr>
              <th>{{ $t("Fleet.艦娘") }}</th>
              <th class="text-right">{{ $t("Common.加重対空") }}</th>
              <th class="text-right">{{ $t("Fleet.割合撃墜") }}</th>
              <th class="text-right">{{ $t("Fleet.固定撃墜") }}</th>
              <th class="text-right">{{ $t("Fleet.最低保証") }}</th>
              <th class="text-right">{{ $t("Fleet.両成功") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in stage2Data" :key="i" class="stage2-row" :class="{ warn: item.sum >= attackerSlot / 2, danger: item.sum >= attackerSlot }">
              <td class="d-flex align-center text-left">
                <div class="mr-2">
                  <v-img :src="`./img/ship/banner/${item.id}.png`" height="30" width="120" />
                </div>
                <div class="d-none d-sm-block flex-grow-1">
                  <div class="stage2-id primary--text" v-if="item.isEnemy">id {{ item.id }}</div>
                  <div class="d-flex">
                    <div class="stage2-name text-truncate">{{ getShipName(item.data) }}</div>
                  </div>
                </div>
              </td>
              <td>{{ item.antiAirWeight }}</td>
              <td>{{ item.rate }} ( {{ $t("Common.x機", { number: item.rateDown }) }} )</td>
              <td>{{ item.fix }}</td>
              <td>{{ item.min }}</td>
              <td>{{ item.sum }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <div v-else class="d-flex flex-wrap justify-center">
      <div class="cutin-table">
        <v-divider />
        <v-simple-table dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th>{{ $t("Fleet.艦娘") }}</th>
                <th class="text-right">{{ $t("Result.種別id") }}</th>
                <th class="text-right">{{ $t("Result.固定") }}</th>
                <th class="text-right">{{ $t("Result.変動") }}</th>
                <th class="text-right">{{ $t("Result.発動率") }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in antiAirCutIns" :key="i" class="stage2-row">
                <td class="px-2 text-left">
                  <v-img v-if="item.id" :src="`./img/ship/banner/${item.id}.png`" height="30" width="120" />
                  <span v-else class="no-cutin-span caption">{{ $t("Result.不発") }}</span>
                </td>
                <td>{{ item.cutInId ? item.cutInId : "-" }}</td>
                <td>{{ item.fix }}</td>
                <td>{{ item.variable }}</td>
                <td>{{ item.rate }} %</td>
                <td>
                  <v-icon :color="item.color">mdi-square-rounded</v-icon>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
        <v-divider />
      </div>
      <div class="graph-area" v-if="showAntiAirMode">
        <div class="contact-graph">
          <doughnut-chart :data="graphData" :options="options" title-text="" :sp-normal="true" />
        </div>
        <div class="total-rate">
          <div>{{ $t("Result.合計発動率") }}</div>
          <div>{{ totalCutInRate }} %</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 10px;
  column-gap: 4px;
}
@media (min-width: 660px) {
  .input-container {
    display: flex;
    flex-wrap: wrap;
    row-gap: 4px;
    column-gap: 4px;
  }
  .input-container > * {
    width: 136px;
    align-self: center;
  }
}
.stage2-id {
  font-size: 11px;
  height: 13px;
}
.stage2-name {
  flex-grow: 1;
  font-size: 12px;
  width: 10px;
}
.v-data-table thead th {
  white-space: nowrap;
  height: 36px !important;
}
.v-data-table tbody td {
  white-space: nowrap;
  height: unset !important;
}
.v-data-table tbody td > * {
  padding-top: 2px;
  padding-bottom: 2px;
}
.stage2-row {
  text-align: right;
}
.stage2-row.warn {
  background-color: rgba(255, 255, 10, 0.1) !important;
}
.stage2-row.warn:hover {
  background-color: rgba(255, 255, 10, 0.2) !important;
}
.stage2-row.danger {
  background-color: rgba(255, 0, 0, 0.1) !important;
}
.stage2-row.danger:hover {
  background-color: rgba(255, 0, 0, 0.2) !important;
}

.cutin-table {
  flex-grow: 1;
  overflow-x: auto;
}
.graph-area {
  display: flex;
  align-self: center;
  justify-content: center;
  position: relative;
}
.contact-graph {
  z-index: 1;
}
.total-rate {
  text-align: center;
  position: absolute;
  top: 50%;
  width: 200px;
  left: calc(50% - 100px);
}
.no-cutin-span {
  display: inline-block;
  text-align: center;
  width: 120px;
  opacity: 0.8;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import Const, { AvoidType, Formation } from '@/classes/const';
import ShootDownInfo from '@/classes/aerialCombat/shootDownInfo';
import AntiAirCutIn from '@/classes/aerialCombat/antiAirCutIn';
import Enemy from '@/classes/enemy/enemy';
import Fleet from '@/classes/fleet/fleet';
import Ship from '@/classes/fleet/ship';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import SiteSetting from '@/classes/siteSetting';
import DoughnutChart, { DoughnutGraphOption, LabelCallbackArg } from '@/components/graph/Doughnut.vue';

interface Stage2Row {
  id: number;
  data: ShipMaster | EnemyMaster;
  rate: string;
  rateDown: number;
  fix: number;
  min: number;
  sum: number;
  antiAirWeight: number;
  isEnemy: boolean;
}

interface AntiAirCutInRow {
  id: number;
  cutInId: number;
  fix: number;
  variable: number;
  rate: number;
  color: string;
}

const labelCallback = (c: LabelCallbackArg) => `${c.dataset.labels[c.dataIndex]}: ${c.parsed.toFixed(1)} %`;

export default Vue.extend({
  name: 'AntiAirCalculator',
  components: { DoughnutChart },
  props: {
    fleet: {
      type: [Fleet, EnemyFleet],
      required: true,
    },
  },
  data: () => ({
    formation: 1,
    avoid: 0,
    attackerSlot: 18,
    adj1: 1,
    adj2: 1,
    fleetAntiAir: '0.00',
    cutInId: 0,
    isEnemyMode: false,
    isEnemyFormula: false,
    isAirRaid: false,
    isEnemyUnion: false,
    stage2Data: [] as Stage2Row[],
    showAntiAirMode: false,
    antiAirCutIns: [] as AntiAirCutInRow[],
    totalCutInRate: 0,
    graphData: {},
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: '' },
        tooltip: { callbacks: { label: labelCallback } },
        datalabels: { formatter: (v: number) => (v > 0 ? `${v.toFixed(1)}%` : '') },
      },
    } as DoughnutGraphOption,
  }),
  computed: {
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    ships(): Ship[] | Enemy[] {
      if (this.fleet instanceof EnemyFleet) {
        return this.fleet.enemies.filter((v) => v.data.id > 0);
      }
      return this.fleet.ships.filter((v) => v.isActive && !v.isEmpty);
    },
    formations(): Formation[] {
      if (this.isNotJapanese) {
        const items = [];
        for (let i = 0; i < Const.FORMATIONS.length; i += 1) {
          const { text, value, correction } = Const.FORMATIONS[i];
          items.push({ text: `${this.$t(`Common.${text}`)}`, value, correction });
        }
        return items;
      }
      return Const.FORMATIONS;
    },
    avoids(): AvoidType[] {
      if (this.isNotJapanese) {
        const items = [];
        for (let i = 0; i < Const.AVOID_TYPE.length; i += 1) {
          const {
            text, value, c1, c2, c3, c4,
          } = Const.AVOID_TYPE[i];
          items.push({
            text: `${this.$t(`Common.回避性能.${text}`)}`,
            value,
            c1,
            c2,
            c3,
            c4,
          });
        }
        return items;
      }
      return Const.AVOID_TYPE;
    },
    isManual(): boolean {
      return this.avoid === Const.MANUAL_AVOID;
    },
    antiAirItems(): { text: string; value: number }[] {
      const items = [
        {
          text: `${this.$t('Result.不発')}`,
          value: 0,
          rate: 0,
          detail: '',
        },
      ];
      // 使えるCIだけ
      const cutIns = this.fleet.allAntiAirCutIn;
      const borders = this.fleet.shootDownList.map((v) => v.border);
      let sumRate = 0;
      for (let i = 0; i < borders.length; i += 1) {
        const border = borders[i];
        if (border === 1) {
          break;
        }

        const { id } = cutIns[i];
        // 何種CIかのテキストが欲しいがために
        const cutin = Const.ANTI_AIR_CUTIN.find((v) => v.id === id);
        const rate = 100 * border - sumRate;
        sumRate += rate;

        const item = items.find((v) => v.value === id);
        if (cutin && item) {
          item.rate += rate;
        } else if (cutin) {
          items.push({
            text: cutin.text,
            value: cutin.id,
            rate,
            detail: `[ ${cutin.remarks} ]`,
          });
        }
      }

      items[0].rate = 100 - sumRate;

      const resultItems = [];
      for (let i = 0; i < items.length; i += 1) {
        const data = items[i];
        resultItems.push({ text: `${data.text}(${Math.floor(10 * data.rate) / 10}%) ${data.detail}`, value: data.value });
      }
      return resultItems;
    },
  },
  mounted() {
    this.isEnemyMode = this.ships[0] instanceof Enemy;
    this.isEnemyFormula = this.ships[0] instanceof Enemy;
    this.formation = this.fleet.formation;
    this.updateTable();
  },
  methods: {
    updateTable(): void {
      let adj3 = 1;
      let adj4 = 1;
      const avoid = Const.AVOID_TYPE.find((v) => v.value === this.avoid);
      if (this.avoid !== Const.MANUAL_AVOID && avoid) {
        this.adj1 = avoid.c1;
        this.adj2 = avoid.c2;
        adj3 = avoid.c3;
        adj4 = avoid.c4;
      } else {
        this.adj1 = Math.min(Math.abs(this.adj1), 2);
        this.adj2 = Math.min(Math.abs(this.adj2), 2);
      }

      let formation = Const.FORMATIONS.find((v) => v.value === this.formation) as Formation;
      if (!formation) {
        // 保険で単縦を入れる
        formation = Const.FORMATIONS.find(() => true) as Formation;
      }
      const manualAvoid: AvoidType = {
        text: '',
        value: 0,
        c1: this.adj1,
        c2: this.adj2,
        c3: adj3,
        c4: adj4,
      };

      // 対空砲火テーブルを取得
      let aaci = new AntiAirCutIn();
      const cutIn = Const.ANTI_AIR_CUTIN.find((v) => v.id === this.cutInId);
      if (cutIn) {
        aaci = new AntiAirCutIn(cutIn.id, cutIn.rateBonus, cutIn.c1, cutIn.c2, cutIn.rate);
      }
      const stage2 = ShootDownInfo.getStage2(
        this.ships,
        this.isEnemyFormula,
        this.fleet.isUnion || this.isEnemyUnion,
        formation,
        aaci,
        this.isAirRaid,
        manualAvoid,
      );
      const d = stage2[stage2.length - 1];
      this.stage2Data = [];
      for (let i = 0; i < this.ships.length; i += 1) {
        const ship = this.ships[i];
        const antiAirWeight = d.antiAirWeightList[i];
        const rate = d.rateDownList[i];
        const rateDown = Math.floor(this.attackerSlot * rate);
        const fix = d.fixDownList[i];
        const min = d.minimumDownList[i];
        const isEnemy = ship instanceof Enemy;
        this.stage2Data.push({
          id: ship.data.id,
          data: ship.data,
          rate: `${(100 * rate).toFixed(2)}%`,
          rateDown,
          fix,
          min,
          sum: rateDown + fix + min,
          antiAirWeight,
          isEnemy,
        });
      }
      // 現在選択されている条件での艦隊防空値
      this.fleetAntiAir = this.fleet.getFleetAntiAir(formation, manualAvoid).toFixed(2);
    },
    getShipName(ship: ShipMaster | EnemyMaster) {
      if (this.needTrans && ship instanceof ShipMaster) {
        const shipName = ShipMaster.getSuffix(ship);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      if (this.needTrans && ship.name) {
        const shipName = EnemyMaster.getSuffix(ship.name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return ship.name || '';
    },
    setAntiAirCutInTable() {
      // 対空CIチェックビュー作成
      this.antiAirCutIns = [];

      for (let i = 0; i < this.ships.length; i += 1) {
        const ship = this.ships[i];
        for (let j = 0; j < ship.antiAirCutIn.length; j += 1) {
          const cutIn = ship.antiAirCutIn[j];
          this.antiAirCutIns.push({
            id: ship.data.id,
            cutInId: cutIn.id,
            fix: cutIn.fixCorrA + cutIn.fixCorrB,
            variable: cutIn.rateCorr,
            rate: 0,
            color: '#000',
          });
        }
      }

      // 優先度順に並び替え
      const priorities = Const.ANTI_AIR_CUT_IN_PRIORITIES;
      this.antiAirCutIns.sort((a, b) => {
        const indexA = priorities.indexOf(a.cutInId);
        const indexB = priorities.indexOf(b.cutInId);
        return (indexA >= 0 ? indexA : 99) - (indexB >= 0 ? indexB : 99);
      });

      // 各種発動率を変更
      const cutIns = this.fleet.allAntiAirCutIn;
      const borders = this.fleet.shootDownList.map((v) => v.border);
      let sumRate = 0;
      if (this.antiAirCutIns.length === cutIns.length) {
        for (let i = 0; i < cutIns.length; i += 1) {
          const border = borders[i];
          const rate = 100 * border - sumRate;
          sumRate += rate;
          this.antiAirCutIns[i].rate = Math.floor(10 * rate) / 10 || Math.floor(100 * rate) / 100 || Math.floor(1000 * rate) / 1000;
        }
      }

      // 必要な色の個数 => 発動する種別の数
      const colorCount = this.antiAirItems.length;
      // 対空CI種別ごとに色をランダム作成
      const colors: string[] = ['rgba(164,164,164,0.7)'];
      // 有効色(0 ～ 360)のなかから使う分だけ按分
      const colorCorr = Math.floor(360 / colorCount);
      // とりあえず全CI分用意
      for (let i = 0; i < Const.ANTI_AIR_CUTIN.length; i += 1) {
        colors.push('hsla(180,100%,60%,0.5)');
      }

      const doneColorIds: number[] = [];
      for (let i = 0; i < this.antiAirCutIns.length; i += 1) {
        const id = this.antiAirCutIns[i].cutInId;
        if (!doneColorIds.includes(id)) {
          // この色を書き換え！
          colors[id] = `hsla(${218 - colorCorr * doneColorIds.length},85%,70%,0.7)`;
          doneColorIds.push(id);
        }
      }

      // 不発の行を追加
      const noneRate = 100 - sumRate;
      this.antiAirCutIns.push({
        id: 0,
        cutInId: 0,
        fix: 1,
        rate: Math.floor(10 * noneRate) / 10 || Math.floor(100 * noneRate) / 100 || Math.floor(1000 * noneRate) / 1000,
        variable: 1,
        color: '',
      });

      // テーブルの凡例行のための色設定
      for (let i = 0; i < this.antiAirCutIns.length; i += 1) {
        const row = this.antiAirCutIns[i];
        if (colors[row.cutInId]) {
          row.color = colors[row.cutInId];
        }
      }

      const labels = this.antiAirCutIns.map((v) => (v.cutInId ? `${v.cutInId}種` : this.$t('Result.不発')));
      const data = {
        labels,
        datasets: [
          {
            data: [0, 0, 0, 100],
            backgroundColor: this.antiAirCutIns.map((v) => colors[v.cutInId]),
            borderColor: '#fff',
            labels,
          },
        ],
      };

      data.datasets[0].data = this.antiAirCutIns.map((v) => +v.rate);
      this.totalCutInRate = Math.floor(10 * sumRate) / 10;
      this.graphData = data;
    },
  },
});
</script>
