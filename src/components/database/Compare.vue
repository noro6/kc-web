<template>
  <div class="mt-3">
    <v-card class="my-2 pa-2">
      <table>
        <thead>
          <tr>
            <td class="text-left">{{ $t("Database.艦種") }}</td>
            <td>{{ $t("Database.登録艦隊") }}</td>
            <td>{{ $t("Database.現在閲覧中の艦隊") }}</td>
            <td>{{ $t("Database.差") }}</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in summaryTable" :key="`summary_row${i}`">
            <td class="text-left">{{ isNotJapanese ? $t(`SType.${row.name}`) : row.name }}</td>
            <td :class="{ 'win-td': row.isWin }">{{ row.data.sumExp }}</td>
            <td :class="{ 'win-td': row.isLose }">{{ row.data.tempSumExp }}</td>
            <td :class="{ 'win-sub': row.isWin, 'lose-sub': row.isLose }">{{ row.data.sub }}</td>
          </tr>
        </tbody>
      </table>
    </v-card>
    <div class="mt-5 d-flex flex-wrap">
      <div
        v-for="(i, index) in types"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: index === type }"
        @click="changeType(index)"
        @keypress.enter="changeType(index)"
      >
        {{ isNotJapanese ? $t(`SType.${i.text}`) : i.text }}
      </div>
    </div>
    <v-card class="my-1">
      <v-simple-table fixed-header height="70vh">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">{{ $t("Database.登録艦隊") }}</th>
              <th class="text-right">Lv</th>
              <th class="text-right">{{ $t("Database.経験値") }}</th>
              <th class="text-right">{{ $t("Database.耐久改修") }}</th>
              <th class="text-right">{{ $t("Database.対潜改修") }}</th>
              <th class="text-right">{{ $t("Database.運改修") }}</th>
              <th class="text-left">{{ $t("Database.現在閲覧中の艦隊") }}</th>
              <th class="text-right">Lv</th>
              <th class="text-right">{{ $t("Database.経験値") }}</th>
              <th class="text-right">{{ $t("Database.耐久改修") }}</th>
              <th class="text-right">{{ $t("Database.対潜改修") }}</th>
              <th class="text-right">{{ $t("Database.運改修") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in diffRow" :key="`ship_row${i}`">
              <template v-if="row.stock1">
                <td class="text-left pl-0" :class="{ more: row.isMore, less: row.isLess, exist: !row.stock2 }">
                  <div class="ship-img-area">
                    <v-img :src="`./img/ship/banner/${row.id}.png`" height="36" width="144" />
                  </div>
                </td>
                <td :class="{ more: row.isMore, less: row.isLess, exist: !row.stock2 }">{{ row.stock1.level }}</td>
                <td :class="{ more: row.isMore, less: row.isLess, exist: !row.stock2 }">{{ row.stock1.exp.toLocaleString() }}</td>
                <td :class="{ more: row.isMore, less: row.isLess, exist: !row.stock2 }">{{ row.stock1.improvement.hp || "" }}</td>
                <td :class="{ more: row.isMore, less: row.isLess, exist: !row.stock2 }">{{ row.stock1.improvement.asw || "" }}</td>
                <td :class="{ more: row.isMore, less: row.isLess, exist: !row.stock2 }">{{ row.stock1.improvement.luck || "" }}</td>
              </template>
              <template v-else>
                <td class="none" colspan="6" />
              </template>
              <template v-if="row.stock2">
                <td class="text-left pl-0" :class="{ more: row.isLess, less: row.isMore, exist: !row.stock1 }">
                  <div class="ship-img-area">
                    <v-img :src="`./img/ship/banner/${row.id}.png`" height="36" width="144" />
                  </div>
                </td>
                <td :class="{ more: row.isLess, less: row.isMore, exist: !row.stock1 }">{{ row.stock2.level }}</td>
                <td :class="{ more: row.isLess, less: row.isMore, exist: !row.stock1 }">{{ row.stock2.exp.toLocaleString() }}</td>
                <td :class="{ more: row.isLess, less: row.isMore, exist: !row.stock1 }">{{ row.stock2.improvement.hp || "" }}</td>
                <td :class="{ more: row.isLess, less: row.isMore, exist: !row.stock1 }">{{ row.stock2.improvement.asw || "" }}</td>
                <td :class="{ more: row.isLess, less: row.isMore, exist: !row.stock1 }">{{ row.stock2.improvement.luck || "" }}</td>
              </template>
              <template v-else>
                <td class="none" colspan="6" />
              </template>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
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
  content: "+";
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

.type-selector {
  border: 1px solid transparent;
  padding: 0.8rem;
  font-size: 0.9em;
  cursor: pointer;
}
.type-selector:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.type-selector.active {
  border-color: rgba(33, 150, 243, 0.4);
  background-color: rgba(33, 150, 243, 0.1);
}

/** 比較テーブルデザイン更新 */
.v-data-table tbody tr,
.v-data-table tbody td {
  height: 40px !important;
}
.v-data-table tbody td.less {
  background-color: rgba(255, 131, 131, 0.3) !important;
}
.v-data-table tbody td.more {
  background-color: rgba(131, 255, 131, 0.3) !important;
}
.v-data-table tbody td.none {
  background-color: rgba(128, 128, 128, 0.2) !important;
}
.theme--dark .v-data-table tbody td.none {
  background-color: rgba(64, 64, 64, 0.3) !important;
}
.v-data-table tbody td.exist {
  background-color: rgba(131, 220, 255, 0.3) !important;
}

.ship-img-area {
  height: 36px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import sum from 'lodash/sum';
import ShipStock from '@/classes/fleet/shipStock';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';

export default Vue.extend({
  name: 'CompareComponent',
  data: () => ({
    summaryTable: [] as { name: string; data: unknown; isWin: boolean; isLose: boolean }[],
    unsubscribe: undefined as unknown,
    diffRow: [] as { id: number; isMore: boolean; isLess: boolean; stock1: ShipStock; stock2: ShipStock }[],
    type: 0,
    types: [] as { text: string; types: number[] }[],
  }),
  mounted() {
    for (let i = 0; i < Const.SHIP_TYPES_ALT2.length; i += 1) {
      const data = Const.SHIP_TYPES_ALT2[i];
      this.types.push({ text: data.text, types: data.types });
    }

    this.analyze();
    this.generateDiffRow();
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'setShipStock') {
        this.analyze();
        this.generateDiffRow();
      }
    });
  },
  watch: {
    isTempStockMode(value) {
      if (value) {
        this.analyze();
        this.generateDiffRow();
      }
    },
  },
  computed: {
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      (this.unsubscribe as () => void)();
    }
  },
  methods: {
    changeType(index = 0) {
      this.type = index;
      this.generateDiffRow();
    },
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
    generateDiffRow() {
      const all = this.$store.state.ships as ShipMaster[];
      // 艦隊
      const shipStock = this.$store.state.shipStock as ShipStock[];
      // 閲覧モード側艦隊
      const tempShipStock = this.$store.state.tempShipStock as ShipStock[];

      const viewTypes = this.types[this.type] ? this.types[this.type].types : [];
      const baseShips = all.concat().filter((v) => viewTypes.includes(v.type));
      baseShips.sort((a, b) => a.sort - b.sort);

      this.diffRow = [];
      for (let i = 0; i < baseShips.length; i += 1) {
        const { id } = baseShips[i];

        const stock1s = shipStock.filter((v) => v.id === id);
        const stock2s = tempShipStock.filter((v) => v.id === id);

        stock1s.sort((a, b) => (b.level !== a.level ? b.level - a.level : b.exp - a.exp));
        stock2s.sort((a, b) => (b.level !== a.level ? b.level - a.level : b.exp - a.exp));

        const needRows = Math.max(stock1s.length, stock2s.length);
        for (let j = 0; j < needRows; j += 1) {
          const stock1 = stock1s[j];
          const stock2 = stock2s[j];

          let isMore = !!stock1 && !stock2;
          let isLess = !stock1 && !!stock2;
          if (stock1 && stock2) {
            isMore = stock1.level > stock2.level;
            isLess = stock1.level < stock2.level;
          }
          const row = {
            id,
            isMore,
            isLess,
            stock1: stock1 || undefined,
            stock2: stock2 || undefined,
          };

          this.diffRow.push(row);
        }
      }
    },
  },
});
</script>
