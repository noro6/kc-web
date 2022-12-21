<template>
  <div class="mt-8">
    <div class="d-flex my-3 mx-4">
      <div class="align-self-center mr-5">{{ $t("Database.集計対象Lv") }}</div>
      <div class="range-input">
        <v-text-field
          :label="$t('Database.Lv下限')"
          type="number"
          :max="levelRange[1]"
          min="1"
          dense
          v-model.trim="levelRange[0]"
          hide-details
          @input="analyze()"
        ></v-text-field>
      </div>
      <v-range-slider v-model="levelRange" dense thumb-label min="1" max="175" hide-details class="pt-2 align-center mx-2" @change="analyze()">
      </v-range-slider>
      <div class="range-input">
        <v-text-field
          :label="$t('Database.Lv上限')"
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
    <v-card class="pa-1">
      <v-divider></v-divider>
      <v-simple-table dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-right">{{ $t("Database.合計艦娘数") }}</th>
              <th class="text-right">{{ $t("Database.ケッコン艦") }}</th>
              <th class="text-right">{{ $t("Database.補強増設艦") }}</th>
              <th class="text-right">{{ $t("Database.運改修合計") }}</th>
              <th class="text-right">{{ $t("Database.耐久改修合計") }}</th>
              <th class="text-right">{{ $t("Database.対潜改修合計") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-right">{{ allShipCount.toLocaleString() }}</td>
              <td class="text-right">{{ allMarriageCount.toLocaleString() }}</td>
              <td class="text-right">{{ allExSlotCount.toLocaleString() }}</td>
              <td class="text-right">{{ totalLuckImprovement.toLocaleString() }}</td>
              <td class="text-right">{{ totalHPImprovement.toLocaleString() }}</td>
              <td class="text-right">{{ totalASWImprovement.toLocaleString() }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
    <v-card class="my-3 pa-1">
      <v-divider></v-divider>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">{{ $t("Database.艦種") }}</th>
              <th class="text-right">{{ $t("Database.隻数") }}</th>
              <th class="text-right">{{ $t("Database.最大Lv") }}</th>
              <th class="text-right">{{ $t("Database.最小Lv") }}</th>
              <th class="text-right">{{ $t("Database.中央Lv") }}</th>
              <th class="text-right">{{ $t("Database.平均Lv") }}</th>
              <th class="text-right">{{ $t("Database.総経験値") }}</th>
              <th class="text-right">{{ $t("Database.1隻平均") }}</th>
              <th class="text-right">{{ $t("Database.経験値割合") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in summaryTable" :key="`summary_row${i}`">
              <td class="text-left">{{ row.name }}</td>
              <td class="text-right">{{ row.data.count }}</td>
              <td class="text-right">{{ row.data.maxLevel }}</td>
              <td class="text-right">{{ row.data.minLevel }}</td>
              <td class="text-right">{{ row.data.midLevel }}</td>
              <td class="text-right">{{ row.data.avgLevel }}</td>
              <td class="text-right">{{ row.data.sumExp }}</td>
              <td class="text-right">{{ row.data.avgExp }}</td>
              <td class="text-right">{{ row.data.expRate }} %</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>
    <div class="graph-area">
      <v-card class="py-4">
        <div class="d-flex justify-center">
          <div class="body-2">{{ $t("Database.艦種別Lv帯分析") }}</div>
        </div>
        <radar-chart :data="radarGraphData" :options="radarOptions" />
      </v-card>
      <v-card class="pa-1">
        <v-divider></v-divider>
        <v-simple-table fixed-header height="64vh">
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-right">Rank</th>
                <th class="text-left">{{ $t("Common.艦娘名") }}</th>
                <th class="text-right">{{ $t("Database.総経験値") }}</th>
                <th class="text-right">{{ $t("Database.経験値割合") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in expRankTable" :key="`exp_rank_row${i}`">
                <td class="text-right">{{ row.rank }}</td>
                <td class="text-left">{{ needTrans ? $t(`${row.name}`) : row.name }}</td>
                <td class="text-right">{{ row.exp }}</td>
                <td class="text-right">{{ row.rate }} %</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
    </div>
    <v-card class="my-4 pa-4">
      <div class="d-flex justify-center">
        <div class="body-2">{{ $t("Database.Lv帯別艦娘数") }}</div>
      </div>
      <div>
        <stacked-bar :data="stackedBarData" :options="stackedBarOption" />
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.range-input {
  width: 80px;
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

.v-data-table thead th {
  background-color: #eee !important;
}
.theme--dark .v-data-table thead th {
  background-color: rgb(49, 49, 53) !important;
}
.deep-sea .theme--dark .v-data-table thead th {
  background-color: rgb(36, 42, 53) !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import max from 'lodash/max';
import min from 'lodash/min';
import sum from 'lodash/sum';
import mean from 'lodash/mean';
import RadarChart from '@/components/graph/Radar.vue';
import StackedBar from '@/components/graph/StackedBar.vue';
import ShipStock from '@/classes/fleet/shipStock';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';
import SiteSetting from '@/classes/siteSetting';

const radarDatasetLabels = ['最大Lv', '最小Lv', '中央Lv', '平均Lv'];

export default Vue.extend({
  name: 'AnalyticsComponent',
  components: { RadarChart, StackedBar },
  data: () => ({
    levelRange: [1, 175],
    summaryTable: [] as { name: string; data: unknown }[],
    expRankTable: [] as { rank: number; name: string; exp: string; rate: string }[],
    unsubscribe: undefined as unknown,
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
    allShipCount: 0,
    allMarriageCount: 0,
    allExSlotCount: 0,
    totalLuckImprovement: 0,
    totalHPImprovement: 0,
    totalASWImprovement: 0,
  }),
  mounted() {
    if (this.$store.getters.getExistsTempStock) {
      this.readOnly = true;
    }
    this.analyze();
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'setShipStock') {
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
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      (this.unsubscribe as () => void)();
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
      // 艦種別経験値解析テーブル
      const expTable = [];
      let allExp = 0;
      let allLevels: number[] = [];

      let marriageCount = 0;
      let exSlotCount = 0;
      let totalHPImprovement = 0;
      let totalASWImprovement = 0;
      let totalLuckImprovement = 0;

      // 経験値ランキング 初期艦毎
      let expRanks: { id: number; name: string; exp: number; rate: number }[] = [];

      this.radarGraphData.labels = [];
      this.stackedBarData.datasets = [];
      this.stackedBarOption.scales.x.title.text = `${this.$t('Database.艦娘数')}`;
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];
        const typeName = this.isNotJapanese ? `${this.$t(`SType.${type.text}`)}` : type.text;
        this.radarGraphData.labels.push(typeName);
        this.radarGraphData.datasets[0].label = `${this.$t('Database.最大Lv')}`;
        this.radarGraphData.datasets[1].label = `${this.$t('Database.最小Lv')}`;
        this.radarGraphData.datasets[2].label = `${this.$t('Database.中央Lv')}`;
        this.radarGraphData.datasets[3].label = `${this.$t('Database.平均Lv')}`;

        // この艦種に該当する艦娘id
        const shipMaster = all.filter((v) => type.types.includes(v.type));
        const shipIds = shipMaster.map((v) => v.id);

        // 積み重ねグラフ用データ
        const newStackedData = {
          label: typeName,
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

            marriageCount += stock.level > 99 ? 1 : 0;
            exSlotCount += stock.releaseExpand ? 1 : 0;
            totalHPImprovement += stock.improvement.hp;
            totalASWImprovement += stock.improvement.asw;
            totalLuckImprovement += stock.improvement.luck;

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

          const sumExp = sum(exps);
          allExp += sumExp;
          allLevels = allLevels.concat(levels);
          const data = {
            count: stocks.length,
            maxLevel: max(levels),
            minLevel: min(levels),
            midLevel: this.getMidValue(levels),
            avgLevel: mean(levels),
            sumExp,
            avgExp: mean(exps),
            expRate: 0,
          };
          expTable.push({ name: typeName, data });
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
          expTable.push({ name: typeName, data });
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
      const allLevel = sum(allLevels);
      const allCount = allLevels.length;
      this.summaryTable.push({
        name: this.isNotJapanese ? `${this.$t('SType.合計')}` : '合計',
        data: {
          count: allCount,
          maxLevel: max(expTable.map((v) => v.data.maxLevel)),
          minLevel: min(expTable.map((v) => v.data.minLevel)),
          midLevel: this.getMidValue(allLevels),
          avgLevel: allCount ? (allLevel / allCount).toFixed(1) : '0',
          sumExp: allExp.toLocaleString(),
          avgExp: allCount ? Math.floor(allExp / allCount).toLocaleString() : '0',
          expRate: allCount ? 100 : 0,
        },
      });

      this.allShipCount = allCount;
      this.allMarriageCount = marriageCount;
      this.allExSlotCount = exSlotCount;
      this.totalHPImprovement = totalHPImprovement;
      this.totalLuckImprovement = totalLuckImprovement;
      this.totalASWImprovement = totalASWImprovement;

      expRanks = expRanks
        .sort((a, b) => {
          if (b.exp !== a.exp) return b.exp - a.exp;
          return a.id - b.id;
        })
        .splice(0, 50);
      this.expRankTable = [];
      for (let i = 0; i < expRanks.length; i += 1) {
        const rankData = expRanks[i];
        const name = all.find((v) => v.id === rankData.id)?.name;
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
