<template>
  <v-card class="ma-1 ma-sm-2 pa-2 pa-sm-3">
    <div class="my-1 d-flex align-center flex-wrap">
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
        />
      </div>
      <div class="mr-6">
        <v-tooltip top color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-icon class="ml-1" v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
          </template>
          <div>{{ $t("Database.選択した項目と、次にその項目が1繰り上がるのは何Lvであるかを表示します。") }}</div>
        </v-tooltip>
      </div>
      <div v-if="!luckMode">
        <v-checkbox v-model="showEXP" @change="setShipList" dense hide-details :label="$t('Database.必要経験値表示')" />
      </div>
      <div class="ml-6" v-if="!showEXP">
        <v-checkbox v-model="showDiff" dense hide-details :label="$t('Extra.差分表示')" />
      </div>
      <div class="ml-6" v-if="enabledLuckMode">
        <v-checkbox v-model="luckMode" @change="setShipList" dense hide-details :label="$t('Database.運改修モード')" />
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
    <div class="d-flex flex-wrap align-center mt-3">
      <div class="text-field mr-3 mb-3">
        <v-text-field
          :label="$t('Database.名称検索')"
          :placeholder="$t('Database.空白区切りで複数指定可')"
          clearable
          v-model="keyword"
          @input="setShipList()"
          hide-details
          dense
          prepend-inner-icon="mdi-magnify"
        />
      </div>
      <div class="mb-1">
        <v-btn outlined @click="filterDialog = true" :disabled="!!keyword"><v-icon>mdi-filter</v-icon>{{ $t("Common.絞り込み") }}</v-btn>
      </div>
      <div class="ml-auto mb-1" v-if="viewStatus">
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
        />
      </div>
    </div>
    <v-divider />
    <v-data-table
      dense
      fixed-header
      height="60vh"
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
      mobile-breakpoint="0"
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
        <tr :class="{ maximum: item.isMaximum }" @mouseenter="bootTooltip(item, $event)" @mouseleave="clearTooltip" @focus="clearTooltip" @blur="clearTooltip">
          <td class="px-0 py-1">
            <div class="d-none d-md-flex align-center">
              <div class="ship-img">
                <v-img :src="`./img/ship/${item.master.id}.png`" height="35" width="140" />
                <div class="slot-ex-img" v-if="item.stock.releaseExpand">
                  <v-img :src="`./img/util/slot_ex.png`" height="30" width="30" />
                </div>
              </div>
              <div class="ship-name text-truncate" :title="item.master.name">{{ getShipName(item.master) }}</div>
            </div>
            <div class="d-flex d-md-none align-center">
              <div class="ship-img">
                <v-img :src="`./img/ship/${item.master.id}.png`" height="30" width="120" />
                <div class="slot-ex-img min" v-if="item.stock.releaseExpand">
                  <v-img :src="`./img/util/slot_ex.png`" height="25" width="25" />
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
              <template v-else-if="showEXP">
                <span :class="{ 'red--text': item.target1 < 0 }">{{ item.target1 > 0 ? item.target1.toLocaleString() : "-" }}</span>
              </template>
              <template v-else>
                <span class="lv-caption">Lv.</span>
                <span :class="{ 'red--text': item.target1 > maxLevel }">{{ item.target1 }}</span>
              </template>
            </div>
            <div class="diff" v-if="showDiff && !showEXP">+{{ item.target1 - item.diffBase }}</div>
          </td>
          <td class="result-td">
            <div>
              <template v-if="isLuckResult">
                <span class="luck-caption">{{ $t("Common.運") }}</span>
                <span :class="{ 'red--text': item.target2 > item.master.maxLuck }">{{ item.target2 }}</span>
              </template>
              <template v-else-if="showEXP">
                <span :class="{ 'red--text': item.target2 < 0 }">{{ item.target2 > 0 ? item.target2.toLocaleString() : "-" }}</span>
              </template>
              <template v-else>
                <span class="lv-caption">Lv.</span>
                <span :class="{ 'red--text': item.target2 > maxLevel }">{{ item.target2 }}</span>
              </template>
            </div>
            <div class="diff" v-if="showDiff && !showEXP">+{{ item.target2 - item.diffBase }}</div>
          </td>
          <td class="result-td">
            <div>
              <template v-if="isLuckResult">
                <span class="luck-caption">{{ $t("Common.運") }}</span>
                <span :class="{ 'red--text': item.target3 > item.master.maxLuck }">{{ item.target3 }}</span>
              </template>
              <template v-else-if="showEXP">
                <span :class="{ 'red--text': item.target3 < 0 }">{{ item.target3 > 0 ? item.target3.toLocaleString() : "-" }}</span>
              </template>
              <template v-else>
                <span class="lv-caption">Lv.</span>
                <span :class="{ 'red--text': item.target3 > maxLevel }">{{ item.target3 }}</span>
              </template>
            </div>
            <div class="diff" v-if="showDiff && !showEXP">+{{ item.target3 - item.diffBase }}</div>
          </td>
          <td class="result-td">
            <div>
              <template v-if="isLuckResult">
                <span class="luck-caption">{{ $t("Common.運") }}</span>
                <span :class="{ 'red--text': item.manual > item.master.maxLuck }">{{ item.manual }}</span>
              </template>
              <template v-else-if="showEXP">
                <span :class="{ 'red--text': item.manual < 0 }">{{ item.manual > 0 ? item.manual.toLocaleString() : "-" }}</span>
              </template>
              <template v-else>
                <span class="lv-caption">Lv.</span>
                <span :class="{ 'red--text': item.manual > maxLevel }">{{ item.manual }}</span>
              </template>
            </div>
            <div class="diff" v-if="showDiff && !showEXP">{{ item.manualDiffString }}</div>
          </td>
          <td class="result-td">{{ isLuckResult || item.isMaximum ? "-" : item.nextExp.toLocaleString() }}</td>
        </tr>
      </template>
    </v-data-table>
    <v-divider />
    <div class="mt-3">
      <v-pagination v-model="page" :length="pageLength" total-visible="9" />
    </div>
    <v-dialog v-model="filterDialog" width="740" @input="toggleFilterDialog" :fullscreen="isMobile">
      <v-card class="px-3 pt-2 pb-3">
        <div class="d-flex pt-2 pb-1 px-2">
          <div class="align-self-center mx-2"><v-icon>mdi-filter</v-icon></div>
          <div class="align-self-center">{{ $t("Common.絞り込み") }}</div>
          <v-spacer />
          <v-btn icon @click.stop="closeFilterDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider class="mb-3" />
        <div class="px-2">
          <v-btn-toggle v-model="type" mandatory class="flex-wrap" color="primary">
            <v-btn v-for="(i, index) in types" :key="index" :value="index" small class="py-5">
              {{ isNotJapanese ? $t(`SType.${i.text}`) : i.text }}
            </v-btn>
          </v-btn-toggle>
          <div class="d-flex mt-10">
            <div class="range-input">
              <v-text-field :label="$t('Database.Lv下限')" type="number" :max="levelRange[1]" min="1" dense v-model.trim="levelRange[0]" hide-details />
            </div>
            <v-range-slider v-model="levelRange" dense thumb-label min="1" :max="maxLevel" hide-details class="pt-2 align-center mx-2"> </v-range-slider>
            <div class="range-input">
              <v-text-field :label="$t('Database.Lv上限')" type="number" max="200" :min="levelRange[0]" dense v-model.trim="levelRange[1]" hide-details />
            </div>
          </div>
          <div class="d-flex mt-6">
            <div class="range-input">
              <v-text-field :label="$t('Database.運下限')" type="number" :max="luckRange[1]" min="1" dense v-model.trim="luckRange[0]" hide-details />
            </div>
            <v-range-slider v-model="luckRange" dense thumb-label min="1" max="200" hide-details class="pt-2 align-center mx-2"> </v-range-slider>
            <div class="range-input">
              <v-text-field :label="$t('Database.運上限')" type="number" max="200" :min="luckRange[0]" dense v-model.trim="luckRange[1]" hide-details />
            </div>
          </div>
          <div class="d-flex mt-6" v-if="viewStatus.value === 'asw'">
            <div class="range-input">
              <v-text-field :label="$t('Database.対潜下限')" type="number" :max="aswRange[1]" min="1" dense v-model.trim="aswRange[0]" hide-details />
            </div>
            <v-range-slider v-model="aswRange" dense thumb-label min="1" max="150" hide-details class="pt-2 align-center mx-2"> </v-range-slider>
            <div class="range-input">
              <v-text-field :label="$t('Database.対潜上限')" type="number" max="150" :min="aswRange[0]" dense v-model.trim="aswRange[1]" hide-details />
            </div>
          </div>
          <div class="d-flex mt-6" v-if="viewStatus.value === 'LoS'">
            <div class="range-input">
              <v-text-field :label="$t('Database.索敵下限')" type="number" :max="losRange[1]" min="1" dense v-model.trim="losRange[0]" hide-details />
            </div>
            <v-range-slider v-model="losRange" dense thumb-label min="1" max="150" hide-details class="pt-2 align-center mx-2"> </v-range-slider>
            <div class="range-input">
              <v-text-field :label="$t('Database.索敵上限')" type="number" max="150" :min="losRange[0]" dense v-model.trim="losRange[1]" hide-details />
            </div>
          </div>
          <div class="d-flex mt-6" v-if="viewStatus.value === 'avoid'">
            <div class="range-input">
              <v-text-field :label="$t('Database.回避下限')" type="number" :max="evaRange[1]" min="1" dense v-model.trim="evaRange[0]" hide-details />
            </div>
            <v-range-slider v-model="evaRange" dense thumb-label min="1" max="180" hide-details class="pt-2 align-center mx-2"> </v-range-slider>
            <div class="range-input">
              <v-text-field :label="$t('Database.回避上限')" type="number" max="180" :min="evaRange[0]" dense v-model.trim="evaRange[1]" hide-details />
            </div>
          </div>
          <div class="d-flex mt-6" v-if="viewStatus.value === 'acc'">
            <div class="range-input">
              <v-text-field :label="$t('Database.命中項下限')" type="number" :max="accRange[1]" min="1" dense v-model.trim="accRange[0]" hide-details />
            </div>
            <v-range-slider v-model="accRange" dense thumb-label min="1" max="50" hide-details class="pt-2 align-center mx-2"> </v-range-slider>
            <div class="range-input">
              <v-text-field :label="$t('Database.命中項上限')" type="number" max="50" :min="accRange[0]" dense v-model.trim="accRange[1]" hide-details />
            </div>
          </div>
          <div class="d-flex mt-6" v-if="viewStatus.value === 'ci'">
            <div class="range-input">
              <v-text-field :label="$t('Database.CI項下限')" type="number" :max="ciRange[1]" min="1" dense v-model.trim="ciRange[0]" hide-details />
            </div>
            <v-range-slider v-model="ciRange" dense thumb-label min="1" max="100" hide-details class="pt-2 align-center mx-2"> </v-range-slider>
            <div class="range-input">
              <v-text-field :label="$t('Database.CI項上限')" type="number" max="100" :min="ciRange[0]" dense v-model.trim="ciRange[1]" hide-details />
            </div>
          </div>
          <div class="d-flex flex-wrap">
            <v-checkbox class="mr-6" v-model="isFinalOnly" :label="$t('Fleet.最終改造')" />
            <v-checkbox class="mr-6" v-model="enabledOnly" :label="$t('Database.成長限界に到達した艦娘を省略')" />
            <v-checkbox v-model="onlyBookmarked" :label="$t('Fleet.お気に入り')" />
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <ship-tooltip :value="tooltipShip" />
    </v-tooltip>
  </v-card>
</template>

<style scoped>
.select-item {
  width: 160px;
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
.ship-list >>> th,
.ship-list >>> td {
  white-space: nowrap;
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

.text-field {
  width: 240px;
}
.range-input {
  width: 92px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipTooltip from '@/components/fleet/ShipTooltip.vue';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipStock from '@/classes/fleet/shipStock';
import SiteSetting from '@/classes/siteSetting';
import Convert from '@/classes/convert';
import Ship from '@/classes/fleet/ship';
import Const from '@/classes/const';

type listRow = {
  stock: ShipStock;
  master: ShipMaster;
  hp: number;
  luck: number;
  asw: number;
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
  components: { ShipTooltip },
  data: () => ({
    all: [] as ShipMaster[],
    readOnly: false,
    filterDialog: false,
    keyword: '',
    isFinalOnly: true,
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
    onlyBookmarked: false,
    listData: [] as listRow[],
    type: 5,
    page: 1,
    types: [] as { text: string; types: number[] }[],
    luckMode: false,
    showDiff: true,
    showEXP: false,
    unsubscribe: undefined as unknown,
    maxLevel: Const.MAX_LEVEL,
    levelRange: [1, Const.MAX_LEVEL],
    luckRange: [1, 200],
    aswRange: [1, 150],
    losRange: [1, 150],
    evaRange: [1, 180],
    accRange: [1, 50],
    ciRange: [1, 100],
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipShip: new Ship(),
    tooltipX: 0,
    tooltipY: 0,
    isMobile: true,
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
      this.isMobile = window.innerWidth < 600;
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

      const maxLevel = this.levelRange[1];
      const minLevel = this.levelRange[0];
      const maxLuck = this.luckRange[1];
      const minLuck = this.luckRange[0];

      // フィルタ用数値を取得
      let filterRange = this.aswRange;
      if (this.viewStatus && this.viewStatus.value === 'LoS') filterRange = this.losRange;
      else if (this.viewStatus && this.viewStatus.value === 'avoid') filterRange = this.evaRange;
      else if (this.viewStatus && this.viewStatus.value === 'acc') filterRange = this.accRange;
      else if (this.viewStatus && this.viewStatus.value === 'ci') filterRange = this.ciRange;
      const maxTarget = filterRange[1];
      const minTarge = filterRange[0];

      const searchWord = (this.keyword ?? '').trim().toUpperCase();
      const searchWords = searchWord.split(/\s+/);

      const setting = this.$store.state.siteSetting as SiteSetting;
      const favorites = setting.bookmarkedShipIds;

      const manual = Math.min(Math.max(manualValue ?? 0, 1), 200);
      for (let i = 0; i < shipStock.length; i += 1) {
        const stock = shipStock[i];
        const master = all.find((v) => v.id === stock.id);

        if (!master) {
          continue;
        }

        const luck = master.luck + stock.improvement.luck;
        const hp = stock.improvement.hp + (stock.level > 99 ? master.hp2 : master.hp);
        const asw = Ship.getStatusFromLevel(stock.level, master.maxAsw, master.minAsw) + stock.improvement.asw;
        if (searchWord) {
          // ひらがなをカタカナに変換
          const kana = searchWord.replace(/[\u3041-\u3096]/g, (match) => {
            const chr = match.charCodeAt(0) + 0x60;
            return String.fromCharCode(chr);
          });
          if (
            searchWords.length <= 1
            && master.name.toUpperCase().indexOf(searchWord) < 0
            && master.yomi.indexOf(searchWord) < 0
            && master.yomi.indexOf(kana) < 0
          ) {
            continue;
          } else if (searchWords.length) {
            // 空白による複数検索
            let result = false;
            for (let j = 0; j < searchWords.length; j += 1) {
              const word = searchWords[j].trim();
              const kana2 = word.replace(/[\u3041-\u3096]/g, (match) => {
                const chr = match.charCodeAt(0) + 0x60;
                return String.fromCharCode(chr);
              });
              if (word && (master.name.toUpperCase().indexOf(word) >= 0 || master.yomi.indexOf(word) >= 0 || master.yomi.indexOf(kana2) >= 0)) {
                // 見つかった場合はここで検索終了
                result = true;
                break;
              }
            }

            if (!result) {
              continue;
            }
          }
        } else {
          if (!viewTypes.includes(master.type)) {
            // 艦種フィルタ
            continue;
          }
          if (this.isFinalOnly && !master.isFinal) {
            // 最終改造フィルタ
            continue;
          }
          if (maxLevel < stock.level || minLevel > stock.level) {
            // レベルフィルタ
            continue;
          }
          if (maxLuck < luck || minLuck > luck) {
            // 運フィルタ
            continue;
          }
          if (this.onlyBookmarked && !favorites.includes(master.id)) {
            // お気に入りフィルタ
            continue;
          }
        }

        const row = {
          stock,
          master,
          hp,
          luck,
          asw,
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

        if (maxTarget < row.target || row.target < minTarge) {
          // フィルタ適用
          continue;
        }

        if (!isLuckMode && !row.isMaximum) {
          const nextLevelInfo = Const.LEVEL_BORDERS.find((v) => v.lv === row.target1);
          if (nextLevelInfo) {
            row.nextExp = nextLevelInfo.req - stock.exp;
          }
        }
        if (!isLuckMode && this.showEXP) {
          const nextLevelInfo1 = Const.LEVEL_BORDERS.find((v) => v.lv === row.target1);
          row.target1 = nextLevelInfo1 ? nextLevelInfo1.req - stock.exp : -1;
          const nextLevelInfo2 = Const.LEVEL_BORDERS.find((v) => v.lv === row.target2);
          row.target2 = nextLevelInfo2 ? nextLevelInfo2.req - stock.exp : -1;
          const nextLevelInfo3 = Const.LEVEL_BORDERS.find((v) => v.lv === row.target3);
          row.target3 = nextLevelInfo3 ? nextLevelInfo3.req - stock.exp : -1;
          const nextLevelInfoM = Const.LEVEL_BORDERS.find((v) => v.lv === row.manual);
          row.manual = nextLevelInfoM ? nextLevelInfoM.req - stock.exp : -1;
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
    closeFilterDialog() {
      this.filterDialog = false;
      this.toggleFilterDialog();
    },
    toggleFilterDialog() {
      if (!this.filterDialog) {
        this.setShipList();
      }
    },
    bootTooltip(ship: listRow, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledShipTooltip || this.isMobile) {
        return;
      }
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        this.tooltipX = e.clientX;
        this.tooltipY = e.clientY;
        const toolTipShip = new Ship({
          master: ship.master,
          level: ship.stock.level,
          hp: ship.hp,
          luck: ship.luck,
          asw: ship.asw,
        });
        this.tooltipShip = toolTipShip;
        this.enabledTooltip = true;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
