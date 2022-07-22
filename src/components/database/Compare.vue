<template>
  <div class="mt-3">
    <v-card class="my-2 pa-4">
      <v-card class="my-3">
        <table>
          <thead>
            <tr>
              <td class="text-left">艦種</td>
              <td>登録艦隊</td>
              <td>現在閲覧中の艦隊</td>
              <td>差</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in summaryTable" :key="`summary_row${i}`">
              <td class="text-left">{{ row.name }}</td>
              <td :class="{ 'win-td': row.isWin }">{{ row.data.sumExp }}</td>
              <td :class="{ 'win-td': row.isLose }">{{ row.data.tempSumExp }}</td>
              <td :class="{ 'win-sub': row.isWin, 'lose-sub': row.isLose }">{{ row.data.sub }}</td>
            </tr>
          </tbody>
        </table>
      </v-card>
    </v-card>
  </div>
</template>

<style scoped>
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

td.win-td {
  background-color: rgba(128, 255, 128, 0.2);
}
td.win-sub {
  color: rgb(0, 200, 0);
}
td.win-sub::before {
  content: '+';
  color: rgb(0, 200, 0);
}
.theme--dark td.win-sub {
  color: rgb(128, 255, 128);
}
.theme--dark td.win-sub::before {
  color: rgb(128, 255, 128);
}
td.lose-sub {
  color: rgb(200, 0, 0);
}
.theme--dark td.lose-sub {
  color: rgb(255, 128, 128);
}
</style>

<script lang="ts">
import Vue from 'vue';
import sum from 'lodash/sum';
import ShipStock from '@/classes/fleet/shipStock';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';

export default Vue.extend({
  name: 'Compare',
  data: () => ({
    summaryTable: [] as { name: string; data: unknown; isWin: boolean, isLose: boolean }[],
    unsubscribe: undefined as unknown,
  }),
  mounted() {
    this.analyze();
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'setShipStock') {
        this.analyze();
      }
    });
  },
  watch: {
    isTempStockMode(value) {
      if (value) {
        this.analyze();
      }
    },
  },
  computed: {
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
      // 艦隊
      const shipStock = this.$store.state.shipStock as ShipStock[];
      // 閲覧モード側艦隊
      const tempShipStock = this.$store.state.tempShipStock as ShipStock[];

      const types = Const.SHIP_TYPES_ALT2;
      const expTable = [];
      let allExp = 0;
      let allTempExp = 0;
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];
        // この艦種に該当する艦娘id
        const shipMaster = all.filter((v) => type.types.includes(v.type));
        const shipIds = shipMaster.map((v) => v.id);

        // 在籍情報から取得
        const stocks = shipStock.filter((v) => shipIds.includes(v.id));
        const exps = [];
        for (let j = 0; j < stocks.length; j += 1) {
          exps.push(stocks[j].exp);
        }
        const sumExp = sum(exps);
        allExp += sumExp;

        // 閲覧中情報から取得
        const tempStocks = tempShipStock.filter((v) => shipIds.includes(v.id));
        const tempExps = [];
        for (let j = 0; j < tempStocks.length; j += 1) {
          tempExps.push(tempStocks[j].exp);
        }
        const tempSumExp = sum(tempExps);
        allTempExp += tempSumExp;

        // データ格納
        const sub = sumExp - tempSumExp;
        expTable.push({
          name: type.text,
          data: { sumExp, sub, tempSumExp },
        });
      }

      this.summaryTable = [];
      for (let i = 0; i < expTable.length; i += 1) {
        const row = expTable[i];
        // フォーマット
        this.summaryTable.push({
          name: row.name,
          data: {
            sumExp: row.data.sumExp.toLocaleString(),
            sub: row.data.sub.toLocaleString(),
            tempSumExp: row.data.tempSumExp.toLocaleString(),
          },
          isWin: row.data.sub > 0,
          isLose: row.data.sub < 0,
        });
      }
      // 合計行
      const allSub = allExp - allTempExp;
      this.summaryTable.push({
        name: '合計',
        data: {
          sumExp: allExp.toLocaleString(),
          sub: allSub.toLocaleString(),
          tempSumExp: allTempExp.toLocaleString(),
        },
        isWin: allSub > 0,
        isLose: allSub < 0,
      });
    },
  },
});
</script>
