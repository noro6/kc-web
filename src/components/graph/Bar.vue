<template>
  <BarChart ref="doughnutRef" :chart-data="actualData" :options="actualOptions" :plugins="plugins" :style="styles" />
</template>

<script lang="ts">
import Vue from 'vue';
import vueCompositionApi from '@vue/composition-api';
import { Chart, registerables } from 'chart.js';
import { BarChart } from 'vue-chart-3';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export interface LabelCallbackArg {
  parsed: number;
  dataset: { labels: string[] };
  dataIndex: number;
  formattedValue: number;
}

export interface BarGraphData {
  labels: string[];
  datasets: {
    yAxisID: string;
    label: string;
    borderWidth?: number;
    fill?: boolean;
    type?: string;
    data: number[];
    datalabels: { display: boolean; color: string };
    backgroundColor: string;
    borderColor?: string;
  }[];
}

export interface BarGraphOption {
  responsive: boolean;
  plugins: {
    legend: {
      display: boolean;
    };
    title: {
      display: boolean;
      text?: string;
      color?: string;
    };
    tooltip: {
      callbacks: {
        label: (c: LabelCallbackArg) => string;
      };
    };
  };
  scales: {
    y: {
      scaleLabel: { display: boolean; labelString: string };
      grid: { color: string };
    };
    [key: string]: {
      grid: { color: string };
    };
  };
}

Chart.register(ChartDataLabels, ...registerables);
export default Vue.use(vueCompositionApi).extend({
  components: {
    BarChart,
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
    height: {
      type: Number,
      default: 350,
    },
  },
  data: () => ({
    doughnutRef: {},
    plugins: [ChartDataLabels],
  }),
  computed: {
    actualData(): BarGraphData {
      if (this.$vuetify.theme.dark) {
        // ダークテーマにより文字色や線の色を書き換え
        this.data.datasets[0].datalabels.color = '#ddd';
        this.data.datasets[1].datalabels.color = '#ddd';
      }

      return this.data;
    },
    actualOptions(): BarGraphOption {
      if (this.$vuetify.theme.dark) {
        // ダークテーマにより文字色や線の色を書き換え
        this.options.plugins.title.color = 'rgba(200, 200, 200)';
      }
      // タイトル修正
      if (this.titleText) {
        this.options.plugins.title.text = this.titleText;
      }

      return this.options;
    },
    styles(): { height: string; position: string } {
      return {
        height: `${this.height}px`,
        position: 'relative',
      };
    },
  },
});
</script>
