<template>
  <v-card class="px-3">
    <div class="d-flex align-center flex-wrap">
      <div class="keyword-text align-self-end mr-3">
        <v-text-field v-model="keyword" dense :placeholder="$t('Database.名称検索')" prepend-inner-icon="mdi-magnify" clearable hide-details />
      </div>
      <div class="mr-3">
        <v-checkbox v-model="isFinalOnly" :disabled="!!keyword" @change="initShips" dense hide-details :label="$t('Fleet.最終改造')" />
      </div>
      <div class="mr-3 d-flex manual-checkbox">
        <v-btn icon @click="toggleDaihatsuFilter()" class="manual-checkbox-button">
          <v-icon class="manual-icon" color="primary" v-if="daihatsuOK">mdi-checkbox-marked</v-icon>
          <v-icon class="manual-icon" color="error" v-else-if="daihatsuNG">mdi-close-box</v-icon>
          <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
        </v-btn>
        <img @click="toggleDaihatsuFilter()" @keypress="toggleDaihatsuFilter()" tabindex="0" :src="`./img/type/type24.png`" alt="type-24" />
      </div>
      <div class="mr-3 d-flex manual-checkbox">
        <v-btn icon @click="toggleTankFilter()" class="manual-checkbox-button">
          <v-icon class="manual-icon" color="primary" v-if="tankOK">mdi-checkbox-marked</v-icon>
          <v-icon class="manual-icon" color="error" v-else-if="tankNG">mdi-close-box</v-icon>
          <v-icon class="manual-icon" v-else>mdi-minus-box-outline</v-icon>
        </v-btn>
        <img @click="toggleTankFilter()" @keypress="toggleTankFilter()" tabindex="0" :src="`./img/type/type46.png`" alt="type-46" />
      </div>
      <div class="flex-grow-1 align-self-end">
        <v-select v-model="selectedTypes" :items="translatedShipTypes" hide-details dense attach chips deletable-chips multiple @change="initShips">
          <template v-slot:prepend-item>
            <v-list-item ripple @mousedown.prevent @click="toggleAllType">
              <v-list-item-action>
                <v-icon :color="selectedTypes.length > 0 ? 'blue' : ''">
                  {{ icon }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ $t("Database.全選択") }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2" />
          </template>
        </v-select>
      </div>
    </div>
    <v-divider class="mt-2" />
    <v-data-table
      class="ship-master-table"
      dense
      fixed-header
      height="48vh"
      multi-sort
      :headers="headers"
      :items="ships"
      :search="keyword"
      :footer-props="{
        showFirstLastPage: true,
        firstIcon: 'mdi-chevron-double-left',
        lastIcon: 'mdi-chevron-double-right',
        prevIcon: 'mdi-chevron-left',
        nextIcon: 'mdi-chevron-right',
        'items-per-page-options': [20, 50, 100],
      }"
    >
      <template v-slot:[`header.name`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.hp`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.fire`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.armor`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.torpedo`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.maxAvoid`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.antiAir`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.maxAsw`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.speed`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.maxScout`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.range`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.luck`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.night`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.fuel`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.ammo`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`item.id`]="{ item }">
        <v-img :src="`./img/ship/${item.id}.png`" height="30" width="120" />
      </template>
      <template v-slot:[`item.name`]="{ item }">
        <div class="ship-name text-truncate caption" :title="item.name">{{ getShipName(item) }}</div>
      </template>
      <template v-slot:[`item.speed`]="{ item }">
        <div class="caption">{{ speedText(item.speed) }}</div>
      </template>
      <template v-slot:[`item.range`]="{ item }">
        <div class="caption">{{ $t(`Common.${rangeText[item.range]}`) }}</div>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.keyword-text {
  width: 200px;
}
.manual-checkbox {
  position: relative;
  height: 32px;
  width: 74px;
  cursor: pointer;
}
.manual-checkbox-button {
  position: absolute;
  bottom: -6px;
}
.manual-icon {
  font-size: 20px !important;
}
.manual-checkbox img {
  position: absolute;
  left: 32px;
  top: -1px;
}
.ship-name {
  max-width: 128px;
}

.v-card >>> .v-data-table th,
.v-card >>> .v-data-table td {
  padding: 0 8px !important;
}

.v-card >>> .v-data-table th:first-child,
.v-card >>> .v-data-table td:first-child {
  width: 120px;
  padding: 0 !important;
}
</style>

<script lang="ts">
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipValidation from '@/classes/fleet/shipValidation';
import ItemMaster from '@/classes/item/itemMaster';
import SiteSetting from '@/classes/siteSetting';
import Vue from 'vue';

export default Vue.extend({
  name: 'ShipMasterList',
  components: {},
  data: () => ({
    rangeText: ['', '短', '中', '長', '超長', '超長+'],
    keyword: '',
    isFinalOnly: true,
    daihatsuOK: false,
    daihatsuNG: false,
    tankOK: false,
    tankNG: false,
    types: [] as { text: string; value: number }[],
    selectedTypes: [] as number[],
    headers: [
      {
        text: '',
        sortable: false,
        value: 'id',
      },
      {
        text: '艦娘名',
        value: 'name',
      },
      {
        text: '耐久',
        filterable: false,
        align: 'end',
        value: 'hp',
      },
      {
        text: '火力',
        filterable: false,
        align: 'end',
        value: 'fire',
      },
      {
        text: '装甲',
        filterable: false,
        align: 'end',
        value: 'armor',
      },
      {
        text: '雷装',
        filterable: false,
        align: 'end',
        value: 'torpedo',
      },
      {
        text: '夜戦',
        filterable: false,
        align: 'end',
        value: 'night',
      },
      {
        text: '回避',
        filterable: false,
        align: 'end',
        value: 'maxAvoid',
      },
      {
        text: '対空',
        filterable: false,
        align: 'end',
        value: 'antiAir',
      },
      {
        text: '対潜',
        filterable: false,
        align: 'end',
        value: 'maxAsw',
      },
      {
        text: '速力',
        filterable: false,
        align: 'end',
        value: 'speed',
      },
      {
        text: '索敵',
        filterable: false,
        align: 'end',
        value: 'maxScout',
      },
      {
        text: '射程',
        filterable: false,
        align: 'end',
        value: 'range',
      },
      {
        text: '運',
        filterable: false,
        align: 'end',
        value: 'luck',
      },
      {
        text: '燃料',
        filterable: false,
        align: 'end',
        value: 'fuel',
      },
      {
        text: '弾薬',
        filterable: false,
        align: 'end',
        value: 'ammo',
      },
    ],
    ships: [] as ShipMaster[],
  }),
  mounted() {
    // 艦種セレクト初期化
    const masters = Const.SHIP_TYPES_ALT;
    this.types = [];
    this.selectedTypes = [];
    for (let i = 0; i < masters.length; i += 1) {
      this.types.push({ text: masters[i].text, value: i });
      if (masters[i].text === '駆逐') {
        this.selectedTypes.push(i);
      }
    }
    this.initShips();
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    selectedAllType(): boolean {
      return this.selectedTypes.length === this.types.length;
    },
    selectedSomeType(): boolean {
      return this.selectedTypes.length > 0 && !this.selectedAllType;
    },
    translatedShipTypes(): { text: string, value: number }[] {
      const array = [];
      for (let i = 0; i < this.types.length; i += 1) {
        const data = this.types[i];
        array.push({ text: `${this.$t(`SType.${data.text}`)}`, value: data.value });
      }
      return array;
    },
    icon(): string {
      if (this.selectedAllType) return 'mdi-close-box';
      if (this.selectedSomeType) return 'mdi-minus-box';
      return 'mdi-checkbox-blank-outline';
    },
    getShipName() {
      return (ship: ShipMaster) => {
        if (this.needTrans) {
          const array = ShipMaster.getSuffix(ship);
          return `${array.map((v) => (v ? `${this.$t(v)}` : '')).join('')}`;
        }
        return ship.name ? ship.name : '';
      };
    },
    speedText() {
      return (value: number) => {
        if (value <= 5) {
          return `${this.$t('Fleet.低速')}`;
        }
        if (value <= 10) {
          return `${this.$t('Fleet.高速')}`;
        }
        if (value <= 15) {
          return `${this.$t('Fleet.高速+')}`;
        }
        return `${this.$t('Fleet.最速')}`;
      };
    },
  },
  watch: {
    completed(value) {
      if (value) {
        this.initShips();
      }
    },
  },
  methods: {
    initShips() {
      const all = this.$store.state.ships as ShipMaster[];
      let ships = [];
      const types = Const.SHIP_TYPES_ALT.filter((v, i) => this.selectedTypes.includes(i))
        .map((v) => v.types)
        .flat();

      for (let i = 0; i < all.length; i += 1) {
        const ship = all[i];

        if (!types.includes(ship.type)) {
          // 艦種フィルタ
          continue;
        }

        if (this.isFinalOnly && !ship.isFinal) {
          // 最終改造フィルタ
          continue;
        }

        ships.push(ship);
      }

      const isValid = ShipValidation.isValidItem;

      if (this.daihatsuOK) {
        // 大発搭載可能
        const daihatsu = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 68);
        if (daihatsu) {
          ships = ships.filter((v) => isValid(v, daihatsu));
        }
      } else if (this.daihatsuNG) {
        // 大発搭載不可
        const daihatsu = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 68);
        if (daihatsu) {
          ships = ships.filter((v) => !isValid(v, daihatsu));
        }
      }

      if (this.tankOK) {
        // 内火艇搭載可能
        const tank = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 167);
        if (tank) {
          ships = ships.filter((v) => isValid(v, tank));
        }
      } else if (this.tankNG) {
        // 内火艇搭載不可
        const tank = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 167);
        if (tank) {
          ships = ships.filter((v) => !isValid(v, tank));
        }
      }

      this.ships = ships.sort((a, b) => a.sort - b.sort);
    },
    toggleDaihatsuFilter() {
      if (this.daihatsuOK) {
        this.daihatsuOK = false;
        this.daihatsuNG = true;
      } else if (this.daihatsuNG) {
        this.daihatsuNG = false;
      } else {
        this.daihatsuOK = true;
      }
      this.initShips();
    },
    toggleTankFilter() {
      if (this.tankOK) {
        this.tankOK = false;
        this.tankNG = true;
      } else if (this.tankNG) {
        this.tankNG = false;
      } else {
        this.tankOK = true;
      }
      this.initShips();
    },
    toggleAllType() {
      this.$nextTick(() => {
        if (this.selectedAllType) {
          this.selectedTypes = [];
        } else {
          this.selectedTypes = this.types.map((v) => v.value).slice();
        }
        this.initShips();
      });
    },
  },
});
</script>
