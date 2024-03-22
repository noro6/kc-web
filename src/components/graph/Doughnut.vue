<template>
  <div class="chart-container" :class="{ 'normal-size': spNormal }">
    <DoughnutChart ref="doughnutRef" :chart-data="actualData" :options="actualOptions" :plugins="plugins" />
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  width: 180px;
  height: 180px;
}

.normal-size.chart-container {
  position: relative;
  width: 260px !important;
  height: 260px !important;
}
@media (min-width: 600px) {
  .chart-container {
    width: 260px;
    height: 260px;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import vueCompositionApi from '@vue/composition-api';
import { Chart, registerables } from 'chart.js';
import { DoughnutChart } from 'vue-chart-3';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels, ...registerables);

export interface LabelCallbackArg {
  parsed: number;
  dataset: { labels: string[] };
  dataIndex: number;
}

export interface DoughnutGraphData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string;
  }[];
}

export interface DoughnutGraphOption {
  plugins: {
    legend: {
      display: boolean;
    };
    title: {
      display: boolean;
      text: string;
      color: string;
    };
    tooltip: {
      callbacks: {
        label: (c: LabelCallbackArg) => string;
      };
    };
    datalabels: {
      color: string;
      formatter: (v: number) => string;
    };
  };
}

export default Vue.use(vueCompositionApi).extend({
  components: {
    DoughnutChart,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
    },
    titleText: {
      type: String,
    },
    spNormal: {
      type: Boolean,
    },
  },
  data: () => ({
    doughnutRef: {},
    plugins: [ChartDataLabels],
  }),
  computed: {
    actualData(): DoughnutGraphData {
      if (this.$vuetify.theme.dark) {
        // ダークテーマにより文字色や線の色を書き換え
        this.data.datasets[0].borderColor = '#222';
      }

      return this.data;
    },
    actualOptions(): DoughnutGraphOption {
      if (this.$vuetify.theme.dark) {
        // ダークテーマにより文字色や線の色を書き換え
        this.options.plugins.datalabels.color = '#fff';
        this.options.plugins.title.color = '#ccc';
      }
      // タイトル修正
      if (this.titleText) {
        this.options.plugins.title.text = this.titleText;
      }

      return this.options;
    },
  },
});
</script>
