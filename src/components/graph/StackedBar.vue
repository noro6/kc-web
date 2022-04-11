<template>
  <BarChart ref="stackedBarRef" :chart-data="actualData" :options="actualOptions" :plugins="plugins" :style="styles" />
</template>

<script lang="ts">
import Vue from 'vue';
import vueCompositionApi from '@vue/composition-api';
import { Chart, registerables } from 'chart.js';
import { BarChart } from 'vue-chart-3';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BarGraphData, BarGraphOption } from './Bar.vue';

const BarColors = [
  'rgba(224, 0, 0, 0.5)',
  'rgba(128, 0, 224, 0.5)',
  'rgba(0, 0, 224, 0.5)',
  'rgba(0, 128, 224, 0.5)',
  'rgba(0, 224, 224, 0.5)',
  'rgba(0, 224, 0, 0.5)',
  'rgba(224, 224, 0, 0.5)',
  'rgba(224, 128, 0, 0.5)',
  'rgba(0, 0, 0, 0.25)',
];
const BarColorsDark = [
  'rgba(255, 80, 80, 0.5)',
  'rgba(170, 80, 255, 0.5)',
  'rgba(80, 80, 255, 0.5)',
  'rgba(80, 180, 255, 0.5)',
  'rgba(80, 255, 255, 0.5)',
  'rgba(80, 255, 80, 0.5)',
  'rgba(255, 255, 80, 0.5)',
  'rgba(255, 180, 80, 0.5)',
  'rgba(255, 255, 255, 0.25)',
];

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
  },
  data: () => ({
    stackedBarRef: {},
    plugins: [ChartDataLabels],
  }),
  computed: {
    actualData(): BarGraphData {
      const colors = this.$vuetify.theme.dark ? BarColorsDark : BarColors;

      // ダークテーマにより文字色や線の色を書き
      const { datasets } = this.data as BarGraphData;
      for (let i = 0; i < datasets.length; i += 1) {
        datasets[i].backgroundColor = colors[i];
      }
      return this.data;
    },
    actualOptions(): BarGraphOption {
      let fontColor = 'rgb(64, 64, 64)';
      if (this.$vuetify.theme.dark) {
        // ダークテーマにより文字色や線の色を書き換え
        fontColor = 'rgb(200, 200, 200)';
      }
      this.options.plugins.legend.labels.color = fontColor;
      this.options.scales.x.ticks.color = fontColor;
      this.options.scales.x.title.color = fontColor;
      this.options.scales.y.ticks.color = fontColor;

      return this.options;
    },
    styles(): { height: string; position: string } {
      return {
        height: '70vh',
        position: 'relative',
      };
    },
  },
});
</script>
