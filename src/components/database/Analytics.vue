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
      <v-card class="my-3 px-3">
        <table>
          <thead>
            <tr>
              <td class="text-left">艦種</td>
              <td>隻数</td>
              <td>最大Lv</td>
              <td>最小Lv</td>
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
              <td>{{ row.data.avgLevel }}</td>
              <td>{{ row.data.sumExp }}</td>
              <td>{{ row.data.avgExp }}</td>
              <td>{{ row.data.expRate }} %</td>
            </tr>
          </tbody>
        </table>
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
}

table td {
  padding: 0.5rem;
  text-align: right;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
table thead td {
  padding: 0.75rem 0.5rem;
}

table tbody tr {
  transition: 0.1s;
}
table tbody tr:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.w-10 {
  width: 10%;
}
</style>

<script lang="ts">
import Vue from 'vue';
import * as _ from 'lodash';
import ShipStock from '@/classes/fleet/shipStock';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';

export default Vue.extend({
  name: 'Analytics',
  data: () => ({
    levelRange: [1, 175],
    summaryTable: [] as { name: string; data: unknown }[],
    unsbscribe: undefined as unknown,
    readOnly: false,
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
      let allLevel = 0;
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];

        // この艦種に該当する艦娘id
        const shipIds = all.filter((v) => type.types.includes(v.type)).map((v) => v.id);
        // 在籍情報から取得
        const stocks = shipStock.filter((v) => shipIds.includes(v.id) && v.level >= this.levelRange[0] && v.level <= this.levelRange[1]);

        if (stocks.length) {
          const levels = stocks.map((v) => v.level);
          const exps = stocks.map((v) => v.exp);
          const sumExp = _.sum(exps);
          allExp += sumExp;
          allLevel += _.sum(levels);
          const data = {
            count: stocks.length,
            maxLevel: _.max(levels),
            minLevel: _.min(levels),
            avgLevel: _.mean(levels),
            sumExp,
            avgExp: _.mean(exps),
            expRate: 0,
          };
          expTable.push({ name: type.text, data });
        } else {
          const data = {
            count: 0,
            maxLevel: 0,
            minLevel: 0,
            avgLevel: 0,
            sumExp: 0,
            avgExp: 0,
            expRate: 0,
          };
          expTable.push({ name: type.text, data });
        }
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
            avgLevel: row.data.avgLevel.toFixed(1),
            sumExp: row.data.sumExp.toLocaleString(),
            avgExp: Math.floor(row.data.avgExp).toLocaleString(),
            expRate: Math.floor((1000 * row.data.sumExp) / allExp) / 10,
          },
        });
      }

      // 合計行
      const allCount = _.sum(expTable.map((v) => v.data.count));
      this.summaryTable.push({
        name: '合計',
        data: {
          count: allCount,
          maxLevel: _.max(expTable.map((v) => v.data.maxLevel)),
          minLevel: _.min(expTable.map((v) => v.data.minLevel)),
          avgLevel: (allLevel / allCount).toFixed(1),
          sumExp: allExp.toLocaleString(),
          avgExp: Math.floor(allExp / allCount).toLocaleString(),
          expRate: 100,
        },
      });
    },
  },
});
</script>
