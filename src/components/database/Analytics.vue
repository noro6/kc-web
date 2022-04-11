<template>
  <div class="mt-3">
    <v-card class="my-2 pa-4">
      <div class="d-flex mt-3">
        <div class="align-self-center mr-5">集計対象Lv</div>
        <div class="range-input">
          <v-text-field
            label="下限"
            type="number"
            :max="levelRange[1]"
            min="1"
            dense
            v-model.trim="levelRange[0]"
            hide-details
            @input="analyze()"
          ></v-text-field>
        </div>
        <v-range-slider
          v-model="levelRange"
          dense
          thumb-label
          min="1"
          max="175"
          hide-details
          class="pt-2 align-center mx-2"
          @change="analyze()"
        >
        </v-range-slider>
        <div class="range-input">
          <v-text-field
            label="上限"
            type="number"
            max="175"
            :min="levelRange[0]"
            dense
            v-model.trim="levelRange[1]"
            hide-details
            @input="analyze()"
          ></v-text-field>
        </div>
      </div>
      <v-card class="my-3">
        <table>
          <thead>
            <tr>
              <td class="text-left">艦種</td>
              <td>隻数</td>
              <td>最大Lv</td>
              <td>最小Lv</td>
              <td>中央Lv</td>
              <td>平均Lv</td>
              <td>総経験値</td>
              <td>1隻平均</td>
              <td>経験値割合</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in summaryTable" :key="`summary_row${i}`">
              <td class="text-left">{{ row.name }}</td>
              <td>{{ row.data.count }}</td>
              <td>{{ row.data.maxLevel }}</td>
              <td>{{ row.data.minLevel }}</td>
              <td>{{ row.data.midLevel }}</td>
              <td>{{ row.data.avgLevel }}</td>
              <td>{{ row.data.sumExp }}</td>
              <td>{{ row.data.avgExp }}</td>
              <td>{{ row.data.expRate }} %</td>
            </tr>
          </tbody>
        </table>
      </v-card>
      <div class="graph-area">
        <v-card class="py-4 exp-card">
          <div class="d-flex justify-center">
            <div class="body-2">艦種別Lv帯分析</div>
          </div>
          <radar-chart :data="radarGraphData" :options="radarOptions" />
        </v-card>
        <v-card class="py-4 exp-card">
          <div class="d-flex justify-center">
            <div class="body-2">艦娘別経験値ランキング</div>
          </div>
          <table>
            <thead>
              <tr>
                <td></td>
                <td class="text-left"></td>
                <td>総経験値</td>
                <td>経験値割合</td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in expRankTable" :key="`exp_rank_row${i}`">
                <td>{{ row.rank }}</td>
                <td class="text-left">{{ row.name }}</td>
                <td>{{ row.exp }}</td>
                <td>{{ row.rate }} %</td>
              </tr>
            </tbody>
          </table>
        </v-card>
      </div>
      <v-card class="my-4 pa-4">
        <div class="d-flex justify-center">
          <div class="body-2">Lv帯別艦娘数</div>
        </div>
        <div>
          <stacked-bar :data="stackedBarData" :options="stackedBarOption" />
        </div>
      </v-card>
    </v-card>
  </div>
</template>

<style scoped>
.range-input {
  width: 80px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

table td {
  padding: 0.75rem;
  text-align: right;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
table thead td {
  padding: 0.75rem;
}

table tbody tr {
  transition: 0.1s;
}
table tbody tr:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.graph-area {
  display: grid;
  grid-template-columns: 1fr;
  margin-top: 1rem;
  column-gap: 1rem;
  row-gap: 1rem;
}

@media (min-width: 1100px) {
  .graph-area {
    grid-template-columns: 1fr 1fr;
  }
}

.exp-card {
  height: 70vh;
  overflow: auto;
}
</style>

<script lang="ts">
import Vue from 'vue';
import * as _ from 'lodash';
import RadarChart from '@/components/graph/Radar.vue';
import StackedBar from '@/components/graph/StackedBar.vue';
import ShipStock from '@/classes/fleet/shipStock';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';

const radarDatasetLabels = ['最大Lv', '最小Lv', '中央Lv', '平均Lv'];

export default Vue.extend({
  name: 'Analytics',
  components: { RadarChart, StackedBar },
  data: () => ({
    levelRange: [1, 175],
    summaryTable: [] as { name: string; data: unknown }[],
    expRankTable: [] as { rank: number; name: string; exp: string; rate: string }[],
    unsbscribe: undefined as unknown,
    readOnly: false,
    radarGraphData: {
      labels: [] as string[],
      datasets: [
        {
          label: radarDatasetLabels[0],
          data: [] as number[],
          fill: false,
          backgroundColor: 'rgba(64, 164, 255, 0.1)',
          borderColor: 'rgb(64, 164, 255)',
          borderWidth: 2,
          pointRadius: 3,
          datalabels: { display: false },
        },
        {
          label: radarDatasetLabels[1],
          data: [] as number[],
          backgroundColor: 'rgba(255, 64, 64, 0.1)',
          borderColor: 'rgb(255, 64, 64)',
          borderWidth: 2,
          pointRadius: 3,
          datalabels: { display: false },
          hidden: true,
        },
        {
          label: radarDatasetLabels[2],
          data: [] as number[],
          fill: false,
          backgroundColor: 'rgba(255, 128, 64, 0.1)',
          borderColor: 'rgb(255, 128, 64)',
          borderWidth: 2,
          pointRadius: 3,
          datalabels: { display: false },
        },
        {
          label: radarDatasetLabels[3],
          data: [] as number[],
          fill: false,
          backgroundColor: 'rgba(0, 200, 0, 0.1)',
          borderColor: 'rgb(0, 200, 0)',
          borderWidth: 2,
          pointRadius: 3,
          datalabels: { display: false },
        },
      ],
    },
    radarOptions: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 175,
          ticks: {
            stepSize: 25,
            color: 'rgb(64, 64, 64)',
            backdropColor: 'rgba(255, 255, 255, 0.7)',
          },
          angleLines: {
            // 角度線
            color: 'rgba(128, 128, 128, 0.4)',
          },
          pointLabels: {
            // 外側のラベル
            color: 'rgb(64, 64, 64)',
          },
          grid: {
            // 目盛り線
            color: 'rgba(128, 128, 128, 0.4)',
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: 'rgb(64, 64, 64)' },
        },
        title: { display: true },
      },
    },
    stackedBarData: {
      labels: [] as string[],
      datasets: [] as { label: string }[],
    },
    stackedBarOption: {
      responsive: true,
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: 'rgba(128, 128, 128, 0.4)' },
          title: { display: true, text: '艦娘数[隻]' },
          ticks: { color: 'rgb(64, 64, 64)' },
        },
        y: {
          grid: { color: 'rgba(128, 128, 128, 0.4)' },
          title: { display: false },
          ticks: { color: 'rgb(64, 64, 64)' },
        },
      },
      plugins: {
        legend: { display: true, position: 'bottom', labels: { color: 'rgb(64, 64, 64)' } },
      },
    },
  }),
  mounted() {
    if (this.$store.getters.getExistsTempStock) {
      this.readOnly = true;
    }
    this.analyze();
    this.unsbscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'updateShipStock') {
        this.analyze();
      }
    });

    for (let i = 17; i > 0; i -= 1) {
      this.stackedBarData.labels.push(`${i * 10}～`);
    }
    this.stackedBarData.labels.push('1～');
  },
  watch: {
    isTempStockMode(value) {
      this.readOnly = !!value;
      this.analyze();
    },
  },
  computed: {
    completed() {
      return this.$store.getters.getCompleted;
    },
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
    },
  },
  beforeDestroy() {
    if (this.unsbscribe) {
      (this.unsbscribe as () => void)();
    }
  },
  methods: {
    analyze() {
      const all = this.$store.state.ships as ShipMaster[];
      let shipStock = this.$store.state.shipStock as ShipStock[];

      if (this.readOnly) {
        // 閲覧モード
        shipStock = this.$store.state.tempShipStock as ShipStock[];
      }

      const types = Const.SHIP_TYPES_ALT2;
      const expTable = [];
      let allExp = 0;
      let allLevels: number[] = [];

      // 経験値ランキング 初期艦毎
      let expRanks: { id: number; name: string; exp: number; rate: number }[] = [];

      this.radarGraphData.labels = [];
      this.stackedBarData.datasets = [];
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];
        this.radarGraphData.labels.push(type.text);

        // この艦種に該当する艦娘id
        const shipMaster = all.filter((v) => type.types.includes(v.type));
        const shipIds = shipMaster.map((v) => v.id);

        // 積み重ねグラフ用データ
        const newStackedData = {
          label: type.text,
          borderWidth: 0,
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          stack: 'stack-1',
          datalabels: { display: false },
        };

        // 在籍情報から取得
        const stocks = shipStock.filter((v) => shipIds.includes(v.id) && v.level >= this.levelRange[0] && v.level <= this.levelRange[1]);
        if (stocks.length) {
          const levels = [];
          const exps = [];

          for (let j = 0; j < stocks.length; j += 1) {
            const stock = stocks[j];
            levels.push(stock.level);
            exps.push(stock.exp);

            newStackedData.data[17 - Math.floor(stock.level / 10)] += 1;

            const orgAlbumId = all.find((v) => v.id === stock.id)?.originalId;
            const rankData = expRanks.find((v) => v.id === orgAlbumId);
            if (rankData) {
              rankData.exp += stock.exp;
            } else if (orgAlbumId) {
              expRanks.push({
                id: orgAlbumId,
                name: '',
                exp: stock.exp,
                rate: 0,
              });
            }
          }

          const sumExp = _.sum(exps);
          allExp += sumExp;
          allLevels = allLevels.concat(levels);
          const data = {
            count: stocks.length,
            maxLevel: _.max(levels),
            minLevel: _.min(levels),
            midLevel: this.getMidValue(levels),
            avgLevel: _.mean(levels),
            sumExp,
            avgExp: _.mean(exps),
            expRate: 0,
          };
          expTable.push({ name: type.text, data });
          this.radarGraphData.datasets[0].data[i] = data.maxLevel ? data.maxLevel : 0;
          this.radarGraphData.datasets[1].data[i] = data.minLevel ? data.minLevel : 0;
          this.radarGraphData.datasets[2].data[i] = data.midLevel ? data.midLevel : 0;
          this.radarGraphData.datasets[3].data[i] = data.avgLevel ? Math.floor(data.avgLevel) : 0;
        } else {
          const data = {
            count: 0,
            maxLevel: 0,
            minLevel: 0,
            midLevel: 0,
            avgLevel: 0,
            sumExp: 0,
            avgExp: 0,
            expRate: 0,
          };
          expTable.push({ name: type.text, data });
          this.radarGraphData.datasets[0].data[i] = 0;
          this.radarGraphData.datasets[1].data[i] = 0;
          this.radarGraphData.datasets[2].data[i] = 0;
          this.radarGraphData.datasets[3].data[i] = 0;
        }

        this.stackedBarData.datasets.push(newStackedData);
      }

      this.summaryTable = [];
      for (let i = 0; i < expTable.length; i += 1) {
        const row = expTable[i];
        this.summaryTable.push({
          name: row.name,
          data: {
            count: row.data.count,
            maxLevel: row.data.maxLevel,
            minLevel: row.data.minLevel,
            midLevel: row.data.midLevel,
            avgLevel: row.data.avgLevel ? row.data.avgLevel.toFixed(1) : 0,
            sumExp: row.data.sumExp.toLocaleString(),
            avgExp: Math.floor(row.data.avgExp).toLocaleString(),
            expRate: allExp ? Math.floor((1000 * row.data.sumExp) / allExp) / 10 : 0,
          },
        });
      }

      // 合計行
      const allLevel = _.sum(allLevels);
      const allCount = allLevels.length;
      this.summaryTable.push({
        name: '合計',
        data: {
          count: allCount,
          maxLevel: _.max(expTable.map((v) => v.data.maxLevel)),
          minLevel: _.min(expTable.map((v) => v.data.minLevel)),
          midLevel: this.getMidValue(allLevels),
          avgLevel: allCount ? (allLevel / allCount).toFixed(1) : '0',
          sumExp: allExp.toLocaleString(),
          avgExp: allCount ? Math.floor(allExp / allCount).toLocaleString() : '0',
          expRate: allCount ? 100 : 0,
        },
      });

      expRanks = expRanks
        .sort((a, b) => {
          if (b.exp !== a.exp) return b.exp - a.exp;
          return a.id - b.id;
        })
        .splice(0, 50);
      this.expRankTable = [];
      for (let i = 0; i < expRanks.length; i += 1) {
        const rankData = expRanks[i];
        const name = all.find((v) => v.albumId === rankData.id)?.name;
        if (name) {
          rankData.name = name;
        }
        if (allExp) {
          rankData.rate = (100 * rankData.exp) / allExp;
        }

        this.expRankTable.push({
          rank: i + 1,
          name: rankData.name,
          exp: rankData.exp.toLocaleString(),
          rate: rankData.rate.toFixed(2),
        });
      }
    },
    getMidValue(array: number[]): number {
      if (array.length) {
        const count = array.length;
        array.sort((a, b) => a - b);
        const half = Math.floor(array.length / 2);
        return count % 2 ? array[half] : Math.floor((array[half - 1] + array[half]) / 2);
      }

      return 0;
    },
  },
});
</script>
