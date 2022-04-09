<template>
  <RadarChart :chart-data="actualData" :options="actualOptions" :plugins="plugins" :style="styles" />
</template>

<script lang="ts">
import Vue from 'vue';
import vueCompositionApi from '@vue/composition-api';
import { Chart, registerables } from 'chart.js';
import { RadarChart } from 'vue-chart-3';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
    RadarChart,
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
      default: 1200,
    },
  },
  data: () => ({
    plugins: [ChartDataLabels],
  }),
  computed: {
    actualData(): BarGraphData {
      if (this.$vuetify.theme.dark) {
        // ダークテーマにより文字色や線の色を書き換え
      }

      return this.data;
    },
    actualOptions(): BarGraphOption {
      if (this.$vuetify.theme.dark) {
        // ダークテーマにより文字色や線の色を書き換え
        const fontColor = 'rgb(200, 200, 200)';
        this.options.plugins.title.color = fontColor;
        this.options.plugins.legend.labels.color = fontColor;
        this.options.scales.r.pointLabels.color = fontColor;
        this.options.scales.r.ticks.color = fontColor;
        this.options.scales.r.ticks.backdropColor = 'rgba(0, 0, 0, 0.1)';
      } else {
        const fontColor = 'rgb(64, 64, 64)';
        this.options.plugins.title.color = fontColor;
        this.options.plugins.legend.labels.color = fontColor;
        this.options.scales.r.pointLabels.color = fontColor;
        this.options.scales.r.ticks.color = fontColor;
        this.options.scales.r.ticks.backdropColor = 'rgba(255, 255, 255, 0.9)';
      }
      // タイトル修正
      if (this.titleText) {
        this.options.plugins.title.text = this.titleText;
      }

      return this.options;
    },
    styles(): { height: string; position: string } {
      return {
        height: '60vh',
        position: 'relative',
      };
    },
  },
});
</script>
