<template>
  <v-card class="ma-2 pa-3">
    <div class="my-1 d-flex align-center">
      <div class="select-item">
        <v-select
          v-model="viewStatus"
          :items="viewStatuses"
          :item-text="(item) => `${$t(`Common.${item.text}`)}`"
          hide-details
          dense
          return-object
          outlined
          @change="setShipList"
          :label="$t('Database.計算したい項目')"
        ></v-select>
      </div>
      <div>
        <v-tooltip top color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-icon class="ml-1" v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
          </template>
          <div>{{ $t("Database.選択した項目と、次にその項目が1繰り上がるのは何Lvであるかを表示します。") }}</div>
        </v-tooltip>
      </div>
      <div class="ml-6">
        <v-checkbox v-model="enabledOnly" @change="setShipList" dense hide-details :label="$t('Database.成長限界に到達した艦娘を省略')"></v-checkbox>
      </div>
      <div class="ml-6">
        <v-checkbox v-model="showDiff" dense hide-details :label="$t('Extra.差分表示')"></v-checkbox>
      </div>
      <div class="ml-6" v-if="enabledLuckMode">
        <v-checkbox v-model="luckMode" @change="setShipList" dense hide-details :label="$t('Database.運改修モード')"></v-checkbox>
      </div>
      <div class="ml-1 mt-1" v-if="enabledLuckMode">
        <v-tooltip top color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-icon small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
          </template>
          <div>{{ $t("Database.Lvはそのままに、運の改修によってステータスを上昇させようとした場合の結果を計算します。") }}</div>
        </v-tooltip>
      </div>
    </div>
    <div class="d-flex flex-wrap align-center">
      <div
        v-for="(i, index) in types"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: index === type, disabled: keyword }"
        @click="changeType(index)"
        @keypress.enter="changeType(index)"
        tabindex="0"
      >
        {{ isNotJapanese ? $t(`SType.${i.text}`) : i.text }}
      </div>
      <div class="ml-auto">
        <v-text-field
          :placeholder="$t('Database.名称検索')"
          clearable
          v-model="keyword"
          @input="setShipList"
          hide-details
          dense
          prepend-inner-icon="mdi-magnify"
        ></v-text-field>
      </div>
      <div class="ml-3" v-if="viewStatus">
        <v-text-field
          type="number"
          dense
          outlined
          hide-details
          @input="setShipList"
          :label="$t('Database.任意')"
          v-model.number="viewStatus.manual"
          min="0"
          max="200"
        ></v-text-field>
      </div>
    </div>
    <v-divider></v-divider>
    <v-data-table
      dense
      fixed-header
      height="50vh"
      class="ship-list"
      multi-sort
      :page.sync="page"
      :headers="headers"
      :items="listData"
      hide-default-footer
      :footer-props="{
        showFirstLastPage: true,
        'items-per-page-options': [30],
      }"
    >
      <template v-slot:[`header.name`]></template>
      <template v-slot:[`header.luck`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.target`]="{ header }">{{ targetText(header.text) }}</template>
      <template v-slot:[`header.target1`]="{ header }">{{ targetText(header.text) }} +1</template>
      <template v-slot:[`header.target2`]="{ header }">{{ targetText(header.text) }} +2</template>
      <template v-slot:[`header.target3`]="{ header }">{{ targetText(header.text) }} +3</template>
      <template v-slot:[`header.manual`]="{ header }">{{ $t(`Database.${header.text}`) }}({{ viewStatus ? viewStatus.manual : "" }})</template>
      <template v-slot:[`header.nextExp`]>Next EXP</template>
      <template v-slot:item="{ item }">
        <tr :class="{ maximum: item.isMaximum }">
          <td class="px-0 py-1">
            <div class="d-none d-md-flex align-center">
              <div class="ship-img">
                <v-img :src="`./img/ship/${item.master.id}.png`" height="35" width="140"></v-img>
                <div class="slot-ex-img" v-if="item.stock.releaseExpand">
                  <v-img :src="`./img/util/slot_ex.png`" height="30" width="30"></v-img>
                </div>
              </div>
              <div class="ship-name text-truncate" :title="item.master.name">{{ getShipName(item.master) }}</div>
            </div>
            <div class="d-flex d-md-none align-center">
              <div class="ship-img">
                <v-img :src="`./img/ship/${item.master.id}.png`" height="30" width="120"></v-img>
                <div class="slot-ex-img min" v-if="item.stock.releaseExpand">
                  <v-img :src="`./img/util/slot_ex.png`" height="25" width="25"></v-img>
                </div>
              </div>
            </div>
          </td>
          <td class="text-right">{{ item.stock.level }}</td>
          <td class="text-right">{{ item.luck }}</td>
          <td class="text-right">{{ item.target ? item.target : "-" }}</td>
          <td class="result-td">
            <div>
              <template v-if="isLuckResult">
                <span class="luck-caption">{{ $t("Common.運") }}</span>
                <span :class="{ 'red--text': item.target1 > item.master.maxLuck }">{{ item.target1 }}</span>
              </template>
              <template v-else>
                <span class="lv-caption">Lv.</span>
                <span :class="{ 'red--text': item.target1 > maxLevel }">{{ item.target1 }}</span>
              </template>
            </div>
            <div class="diff" v-if="showDiff">+{{ item.target1 - item.diffBase }}</div>
          </td>
          <td class="result-td">
            <div>
              <template v-if="isLuckResult">
                <span class="luck-caption">{{ $t("Common.運") }}</span>
                <span :class="{ 'red--text': item.target2 > item.master.maxLuck }">{{ item.target2 }}</span>
              </template>
              <template v-else>
                <span class="lv-caption">Lv.</span>
                <span :class="{ 'red--text': item.target2 > maxLevel }">{{ item.target2 }}</span>
              </template>
            </div>
            <div class="diff" v-if="showDiff">+{{ item.target2 - item.diffBase }}</div>
          </td>
          <td class="result-td">
            <div>
              <template v-if="isLuckResult">
                <span class="luck-caption">{{ $t("Common.運") }}</span>
                <span :class="{ 'red--text': item.target3 > item.master.maxLuck }">{{ item.target3 }}</span>
              </template>
              <template v-else>
                <span class="lv-caption">Lv.</span>
                <span :class="{ 'red--text': item.target3 > maxLevel }">{{ item.target3 }}</span>
              </template>
            </div>
            <div class="diff" v-if="showDiff">+{{ item.target3 - item.diffBase }}</div>
          </td>
          <td class="result-td">
            <div>
              <template v-if="isLuckResult">
                <span class="luck-caption">{{ $t("Common.運") }}</span>
                <span :class="{ 'red--text': item.manual > item.master.maxLuck }">{{ item.manual }}</span>
              </template>
              <template v-else>
                <span class="lv-caption">Lv.</span>
                <span :class="{ 'red--text': item.manual > maxLevel }">{{ item.manual }}</span>
              </template>
            </div>
            <div class="diff" v-if="showDiff">{{ item.manualDiffString }}</div>
          </td>
          <td class="result-td">{{ isLuckResult || item.isMaximum ? '-' : item.nextExp.toLocaleString() }}</td>
        </tr>
      </template>
    </v-data-table>
    <v-divider></v-divider>
    <div class="mt-3">
      <v-pagination v-model="page" :length="pageLength" total-visible="9"></v-pagination>
    </div>
  </v-card>
</template>

<style scoped>
.select-item {
  width: 200px;
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.8rem 0.5rem;
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
.type-selector.disabled {
  opacity: 0.4;
  background-color: transparent;
  pointer-events: none;
  user-select: none;
}

.ship-img {
  position: relative;
}
.ship-img .slot-ex-img {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 30px;
  height: 30px;
}
.ship-img .slot-ex-img.min {
  width: 25px;
  height: 25px;
}
.ship-name {
  font-size: 0.9em;
  margin-left: 0.25rem;
  max-width: 8vw;
}
.lv-caption {
  font-size: 0.7em;
  opacity: 0.6;
  color: unset;
}
.luck-caption {
  font-size: 0.8em;
  opacity: 0.6;
  color: unset;
}
.lv-caption + span,
.luck-caption + span {
  display: inline-block;
  min-width: 24px;
}

.ship-list >>> tr.maximum {
  background-color: rgba(255, 131, 131, 0.15) !important;
}
.ship-list >>> tr.maximum:hover {
  background-color: rgba(255, 131, 131, 0.2) !important;
}

.result-td {
  text-align: right;
  position: relative;
}
.diff {
  position: absolute;
  font-size: 0.8em;
  right: 10px;
  top: -2px;
  opacity: 0.6;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipStock from '@/classes/fleet/shipStock';
import SiteSetting from '@/classes/siteSetting';
import Convert from '@/classes/convert';
import Ship from '@/classes/fleet/ship';
import Const from '@/classes/const';

type listRow = {
  stock: ShipStock;
  master: ShipMaster;
  luck: number;
  diffBase: number;
  target: number;
  target1: number;
  target2: number;
  target3: number;
  manual: number;
  manualDiffString: string;
  nextExp: number;
  isMaximum: boolean;
};

export default Vue.extend({
  name: 'StatusUpLineList',
  components: {},
  data: () => ({
    all: [] as ShipMaster[],
    readOnly: false,
    keyword: '',
    headers: [
      {
        text: '艦娘名',
        value: 'name',
        sortable: false,
      },
      {
        text: 'Lv',
        align: 'end',
        value: 'stock.level',
      },
      {
        text: '運',
        align: 'end',
        value: 'luck',
      },
      {
        text: '項目',
        align: 'end',
        value: 'target',
      },
      {
        text: '項目1',
        align: 'end',
        value: 'target1',
      },
      {
        text: '項目2',
        align: 'end',
        value: 'target2',
        sortable: false,
      },
      {
        text: '項目3',
        align: 'end',
        value: 'target3',
        sortable: false,
      },
      {
        text: '任意',
        align: 'end',
        value: 'manual',
      },
      {
        text: 'next',
        align: 'end',
        value: 'nextExp',
      },
    ],
    viewStatus: undefined as undefined | { text: string; value: string; manual: number },
    viewStatuses: [
      { text: '対潜', value: 'asw', manual: 85 },
      { text: '索敵', value: 'LoS', manual: 80 },
      { text: '回避', value: 'avoid', manual: 80 },
      { text: '命中項', value: 'acc', manual: 30 },
      { text: 'CI項', value: 'ci', manual: 40 },
    ],
    enabledOnly: false,
    listData: [] as listRow[],
    type: 5,
    page: 1,
    types: [] as { text: string; types: number[] }[],
    luckMode: false,
    showDiff: true,
    unsubscribe: undefined as unknown,
    maxLevel: Const.MAX_LEVEL,
  }),
  mounted() {
    for (let i = 0; i < Const.SHIP_TYPES_ALT2.length; i += 1) {
      const data = Const.SHIP_TYPES_ALT2[i];
      this.types.push({ text: data.text, types: data.types });
    }

    if (this.$store.getters.getExistsTempStock) {
      this.readOnly = true;
    }

    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'setShipStock') {
        this.setShipList();
      }
    });

    // eslint-disable-next-line prefer-destructuring
    this.viewStatus = this.viewStatuses[0];
    this.setShipList();
  },
  watch: {
    isTempStockMode(value) {
      this.readOnly = !!value;
    },
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
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
    enabledLuckMode(): boolean {
      return !!this.viewStatus && (this.viewStatus.value === 'ci' || this.viewStatus.value === 'acc');
    },
    targetText() {
      return () => {
        if (this.viewStatus) {
          return `${this.$t(`Common.${this.viewStatus.text}`)}`;
        }
        return '';
      };
    },
    pageLength(): number {
      return Math.ceil(this.listData.length / 30);
    },
    isLuckResult(): boolean {
      return this.enabledLuckMode && this.luckMode;
    },
  },
  beforeDestroy() {
    //
  },
  methods: {
    changeType(index = 0) {
      this.type = index;
      this.setShipList();
    },
    setShipList() {
      this.listData = [];

      const all = this.$store.state.ships as ShipMaster[];
      let shipStock = this.$store.state.shipStock as ShipStock[];

      if (this.readOnly) {
        // 閲覧モード
        shipStock = this.$store.state.tempShipStock as ShipStock[];
      }

      const viewTypes = this.types[this.type] ? this.types[this.type].types : [];
      const array: listRow[] = [];
      const target = this.viewStatus && this.viewStatus.value;
      const manualValue = this.viewStatus && this.viewStatus.manual;

      const isLuckMode = this.enabledLuckMode && this.luckMode;

      const searchWord = (this.keyword ?? '').trim().toUpperCase();

      const manual = Math.min(Math.max(manualValue ?? 0, 1), 200);
      for (let i = 0; i < shipStock.length; i += 1) {
        const stock = shipStock[i];
        const master = all.find((v) => v.id === stock.id);

        if (!master) {
          continue;
        }
        if (searchWord) {
          if (master.name.toUpperCase().indexOf(searchWord) < 0) {
            continue;
          }
        } else if (!viewTypes.includes(master.type)) {
          continue;
        }

        const row = {
          stock,
          master,
          luck: master.luck + stock.improvement.luck,
          diffBase: stock.level,
          target: 0,
          target1: 0,
          target2: 0,
          target3: 0,
          manual: 0,
          manualDiffString: '',
          isMaximum: false,
          nextExp: 0,
        };

        if (target === 'asw' || target === 'LoS' || target === 'avoid') {
          let minValue = master.minAsw;
          let maxValue = master.maxAsw;
          if (target === 'avoid') {
            minValue = master.minAvoid;
            maxValue = master.maxAvoid;
          } else if (target === 'LoS') {
            minValue = master.minScout;
            maxValue = master.maxScout;
          }
          const improvement = target === 'asw' ? stock.improvement.asw : 0;
          const rawValue = Ship.getStatusFromLevel(stock.level, maxValue, minValue);
          row.target = rawValue + improvement;
          row.target1 = Ship.getRequiredLevel(rawValue + 1, maxValue, minValue);
          row.target2 = Ship.getRequiredLevel(rawValue + 2, maxValue, minValue);
          row.target3 = Ship.getRequiredLevel(rawValue + 3, maxValue, minValue);
          row.manual = Ship.getRequiredLevel(manual - improvement, maxValue, minValue);
          row.isMaximum = row.target1 > this.maxLevel;
        } else if (isLuckMode) {
          // 運改修モード => 運を主語に判定
          row.diffBase = row.luck;
          if (target === 'ci') {
            row.target = Ship.getCIValue(stock.level, row.luck);
            row.target1 = Ship.getRequiredLuckCI(row.target + 1, row.stock.level);
            row.target2 = Ship.getRequiredLuckCI(row.target + 2, row.stock.level);
            row.target3 = Ship.getRequiredLuckCI(row.target + 3, row.stock.level);
            row.manual = Ship.getRequiredLuckCI(manual, row.stock.level);
          } else if (target === 'acc') {
            row.target = Ship.getAccuracyValue(stock.level, row.luck);
            row.target1 = Ship.getRequiredLuckAccuracy(row.target + 1, row.stock.level);
            row.target2 = Ship.getRequiredLuckAccuracy(row.target + 2, row.stock.level);
            row.target3 = Ship.getRequiredLuckAccuracy(row.target + 3, row.stock.level);
            row.manual = Ship.getRequiredLuckAccuracy(manual, row.stock.level);
          }
          row.isMaximum = row.target1 > row.master.maxLuck;
        } else if (target === 'ci') {
          row.target = Ship.getCIValue(stock.level, row.luck);
          row.target1 = Ship.getRequiredLevelCI(row.target + 1, row.luck);
          row.target2 = Ship.getRequiredLevelCI(row.target + 2, row.luck);
          row.target3 = Ship.getRequiredLevelCI(row.target + 3, row.luck);
          row.manual = Ship.getRequiredLevelCI(manual, row.luck);
          row.isMaximum = row.target1 > this.maxLevel;
        } else if (target === 'acc') {
          row.target = Ship.getAccuracyValue(stock.level, row.luck);
          row.target1 = Ship.getRequiredLevelAccuracy(row.target + 1, row.luck);
          row.target2 = Ship.getRequiredLevelAccuracy(row.target + 2, row.luck);
          row.target3 = Ship.getRequiredLevelAccuracy(row.target + 3, row.luck);
          row.manual = Ship.getRequiredLevelAccuracy(manual, row.luck);
          row.isMaximum = row.target1 > this.maxLevel;
        }

        if (!isLuckMode && !row.isMaximum) {
          const nextLevelInfo = Const.LEVEL_BORDERS.find((v) => v.lv === row.target1);
          if (nextLevelInfo) {
            row.nextExp = nextLevelInfo.req - stock.exp;
          }
        }

        if (!this.enabledOnly || !row.isMaximum) {
          const diff = row.manual - row.diffBase;
          row.manualDiffString = diff < 0 ? `-${-diff}` : `+${diff}`;
          array.push(row);
        }
      }

      array.sort((a, b) => {
        if (a.master.sort !== b.master.sort) {
          return a.master.sort - b.master.sort;
        }
        return b.stock.level - a.stock.level;
      });

      // ページ数チェック
      const maxPage = Math.ceil(array.length / 30);
      this.page = this.page > maxPage ? maxPage : this.page;
      this.page = this.page < 1 && maxPage > 0 ? 1 : this.page;

      this.listData = array;
    },
    translate(v: string): string {
      return v ? `${this.$t(v)}` : '';
    },
    getShipName(ship: ShipMaster) {
      if (this.needTrans) {
        const array = ShipMaster.getSuffix(ship);
        return `${array.map((v) => this.translate(v)).join('')}`;
      }
      return ship.name ? ship.name : '';
    },
    getShipTypeName(name: string) {
      if (this.isNotJapanese) {
        const array = Convert.getShipTypeNameArray(name);
        return `${array.map((v) => this.translate(v)).join('')}`;
      }

      return name;
    },
  },
});
</script>
