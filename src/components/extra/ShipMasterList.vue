<template>
  <v-card class="px-3">
    <div class="d-flex align-center flex-wrap">
      <div class="keyword-text align-self-end mr-3">
        <v-text-field v-model="keyword" dense :placeholder="$t('Database.名称検索')" prepend-inner-icon="mdi-magnify" clearable hide-details />
      </div>
      <v-btn @click="filterDialog = true" outlined> <v-icon>mdi-filter</v-icon>{{ $t("Common.絞り込み") }} </v-btn>
      <v-btn class="ml-1" text @click.stop="resetFilter()" small>
        {{ $t("Common.リセット") }}
      </v-btn>
      <v-dialog v-model="filterDialog" transition="scroll-x-transition" width="760" @input="toggleFilterDialog" :fullscreen="isMobile">
        <v-card class="filter-dialog-card">
          <div class="d-flex pt-2 pb-1 px-2">
            <div class="align-self-center ml-3 body-2">{{ $t("Common.絞り込み") }}</div>
            <v-spacer />
            <v-btn class="align-self-center" v-if="isMobile" icon @click.stop="resetFilter()">
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
            <v-btn class="mr-3 align-self-center" v-else small text @click.stop="resetFilter()">
              {{ $t("Common.リセット") }}
            </v-btn>
            <v-btn icon @click="closeFilterDialog()">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-divider class="mx-2" />
          <div class="filter-dialog-body pr-1 pb-2">
            <div class="d-flex mt-4 mt-sm-0">
              <div class="caption">{{ $t("Fleet.改造状態") }}</div>
              <div class="header-divider" />
            </div>
            <div class="filter-input-container">
              <v-checkbox v-model="shipFilter.includeInitial" dense hide-details :label="$t('Fleet.未改造')" :error="isAllUncheckedRemodeling" />
              <v-checkbox v-model="shipFilter.includeIntermediate" dense hide-details :label="$t('Fleet.中間改造')" :error="isAllUncheckedRemodeling" />
              <v-checkbox v-model="shipFilter.includeFinal" dense hide-details :label="$t('Fleet.最終改造')" :error="isAllUncheckedRemodeling" />
            </div>
            <div class="d-flex mt-4">
              <div class="caption">{{ $t("Fleet.装備搭載可否") }}</div>
              <div class="header-divider" />
            </div>
            <div class="filter-input-container">
              <v-checkbox v-model="shipFilter.midgetSubmarineOK" :disabled="!visibleMidgetSubmarineFilter" dense hide-details :label="$t('Fleet.甲標的')" />
              <v-checkbox v-model="shipFilter.largeSearchlightOK" dense hide-details :label="$t('Fleet.大型探照灯')" />
            </div>
            <div class="filter-input-container mt-1">
              <manual-checkbox
                mode="img"
                :ok="shipFilter.landingCraftOK"
                :ng="shipFilter.landingCraftNG"
                :toggle="toggleDaihatsuFilter"
                imgPath="./img/type/type24.png"
              />
              <manual-checkbox mode="img" :ok="shipFilter.tankOK" :ng="shipFilter.tankNG" :toggle="toggleTankFilter" imgPath="./img/type/type46.png" />
              <manual-checkbox
                mode="img"
                :ok="shipFilter.spBomberOK"
                :ng="shipFilter.spBomberNG"
                :toggle="toggleSpBomberFilter"
                imgPath="./img/type/type1100.png"
                :disabled="!visibleSpBomberFilter"
              />
              <manual-checkbox
                mode="img"
                :ok="shipFilter.fighterOK"
                :ng="shipFilter.fighterNG"
                :toggle="toggleFighterFilter"
                imgPath="./img/type/type4500.png"
                :disabled="!visibleFighterFilter"
              />
              <manual-checkbox
                mode="img"
                :ok="shipFilter.commanderOK"
                :ng="shipFilter.commanderNG"
                :toggle="toggleCommanderFilter"
                imgPath="./img/type/type34.png"
                :disabled="!visibleCommanderFilter"
              />
              <manual-checkbox
                mode="img"
                :ok="shipFilter.armorOK"
                :ng="shipFilter.armorNG"
                :toggle="toggleArmorFilter"
                imgPath="./img/type/type27.png"
                :disabled="!visibleArmorFilter"
              />
            </div>
            <div class="d-flex mt-4">
              <div class="caption">{{ $t("ItemList.補強増設") }}</div>
              <div class="header-divider" />
            </div>
            <div class="filter-input-container">
              <v-checkbox v-model="shipFilter.canEquip13RadarOnly" dense hide-details :label="$t('Fleet.13号電探系')" />
              <v-checkbox v-model="shipFilter.canEquip22RadarOnly" dense hide-details :label="$t('Fleet.22号電探系')" />
              <v-checkbox v-model="shipFilter.canEquipMastRadarOnly" dense hide-details :label="$t('Fleet.電探マスト')" />
              <v-checkbox v-model="shipFilter.canEquipRadarOnly" dense hide-details :label="$t('Fleet.その他電探')" />
              <v-checkbox v-model="shipFilter.canEquipExSubGunOnly" dense hide-details :label="$t('EType.副砲')" />
              <v-checkbox v-model="shipFilter.canEquipExCommanderOnly" dense hide-details :label="$t('EType.司令部施設')" />
              <v-checkbox v-model="shipFilter.canEquipExDepthChargeOnly" dense hide-details :label="$t('EType.爆雷')" />
              <v-checkbox v-model="shipFilter.canEquipExArmorOnly" dense hide-details :label="$t('EType.追加装甲')" />
              <v-checkbox v-model="shipFilter.canEquipExTankOnly" dense hide-details :label="$t('EType.特型内火艇')" />
            </div>
            <div class="d-flex mt-4">
              <div class="caption">{{ $t("Common.耐久") }}</div>
              <div class="header-divider" />
            </div>
            <div class="filter-input-container">
              <v-checkbox v-model="shipFilter.HPIs4n1" dense hide-details label="4n - 1" :error="isAllUncheckedHP" />
              <v-checkbox v-model="shipFilter.HPIs4n2" dense hide-details label="4n - 2" :error="isAllUncheckedHP" />
              <v-checkbox v-model="shipFilter.HPIs4n3" dense hide-details label="4n - 3" :error="isAllUncheckedHP" />
              <v-checkbox v-model="shipFilter.HPIs4n" dense hide-details label="4n" :error="isAllUncheckedHP" />
            </div>
            <div class="d-flex mt-4">
              <div class="caption">{{ $t("Common.速力") }}</div>
              <div class="header-divider" />
            </div>
            <div class="filter-input-container">
              <v-checkbox v-model="shipFilter.includeFast" dense hide-details :label="$t('Fleet.高速')" :error="isAllUncheckedSpeed" />
              <v-checkbox v-model="shipFilter.includeSlow" dense hide-details :label="$t('Fleet.低速')" :error="isAllUncheckedSpeed" />
            </div>
            <div class="d-flex mt-4">
              <div class="caption">{{ $t("Common.射程") }}</div>
              <div class="header-divider" />
            </div>
            <div class="filter-input-container">
              <v-checkbox v-model="shipFilter.includeRange1" dense hide-details :label="$t('Common.短')" :error="isAllUncheckedRange" />
              <v-checkbox v-model="shipFilter.includeRange2" dense hide-details :label="$t('Common.中')" :error="isAllUncheckedRange" />
              <v-checkbox v-model="shipFilter.includeRange3" dense hide-details :label="$t('Common.長')" :error="isAllUncheckedRange" />
              <v-checkbox v-model="shipFilter.includeRange4" dense hide-details :label="$t('Common.超長')" :error="isAllUncheckedRange" />
            </div>
            <div class="d-flex mt-4 align-center">
              <div class="caption">{{ $t("Database.国籍") }}</div>
              <div class="header-divider" />
              <div class="pl-3">
                <v-btn small @click="toggleAllNationality()" outlined color="primary">
                  <v-icon small class="mr-1">mdi-check-all</v-icon> {{ $t("Database.一括チェック") }}
                </v-btn>
              </div>
            </div>
            <div class="filter-input-container">
              <v-checkbox
                v-for="(item, i) in shipFilter.nationalities"
                :key="`item${i}`"
                dense
                v-model="item.isChecked"
                :label="$t(`Database.${item.text}`)"
                hide-details
                :error="shipFilter.nationalities.every((v) => !v.isChecked)"
              />
            </div>
            <div class="d-flex mt-4">
              <div class="caption">{{ $t("Fleet.装備スロット数") }}</div>
              <div class="header-divider" />
            </div>
            <div class="filter-input-container">
              <v-checkbox
                v-model="shipFilter.slotCount3"
                dense
                hide-details
                :label="$t('Fleet.3スロ以上')"
                :disabled="shipFilter.slotCount4 || shipFilter.slotCount5"
              />
              <v-checkbox v-model="shipFilter.slotCount4" dense hide-details :label="$t('Fleet.4スロ以上')" :disabled="shipFilter.slotCount5" />
              <v-checkbox v-model="shipFilter.slotCount5" dense hide-details :label="$t('Fleet.5スロ以上')" />
            </div>
          </div>
        </v-card>
      </v-dialog>
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
      :items-per-page="50"
      :footer-props="{
        showFirstLastPage: true,
        firstIcon: 'mdi-chevron-double-left',
        lastIcon: 'mdi-chevron-double-right',
        prevIcon: 'mdi-chevron-left',
        nextIcon: 'mdi-chevron-right',
        'items-per-page-options': [20, 50, 100],
      }"
      mobile-breakpoint="0"
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
  white-space: nowrap;
  padding: 0 8px !important;
}

.v-card >>> .v-data-table th:first-child,
.v-card >>> .v-data-table td:first-child {
  width: 120px;
  padding: 0 !important;
}

.filter-dialog-card {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.filter-dialog-body {
  padding: 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
}
@media (min-width: 600px) {
  .filter-dialog-card {
    display: block;
    flex-direction: unset;
    height: unset;
  }
  .filter-dialog-body {
    padding-top: 20px;
    padding-left: 20px;
    height: 70vh;
  }
}
.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}
.range-input {
  margin-top: 0px;
  padding-top: 0px;
  width: 80px !important;
}
.range-input.english {
  width: 100px !important;
}
.filter-input-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}
@media (min-width: 600px) {
  .filter-input-container {
    margin-left: 12px;
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}
</style>

<script lang="ts">
import Const, { SHIP_TYPE } from '@/classes/const';
import ShipFilter from '@/classes/fleet/shipFilter';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipValidation from '@/classes/fleet/shipValidation';
import ItemMaster from '@/classes/item/itemMaster';
import SiteSetting from '@/classes/siteSetting';
import ManualCheckbox from '@/components/common/ManualCheckbox.vue';
import Vue from 'vue';

export default Vue.extend({
  name: 'ShipMasterList',
  components: { ManualCheckbox },
  data: () => ({
    rangeText: ['', '短', '中', '長', '超長', '超長+'],
    keyword: '',
    shipFilter: new ShipFilter(),
    filterDialog: false,
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
    isMobile: true,
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

    this.shipFilter.includeInitial = false;
    this.shipFilter.includeIntermediate = false;
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
    translatedShipTypes(): { text: string; value: number }[] {
      const array = [];
      for (let i = 0; i < this.types.length; i += 1) {
        const data = this.types[i];
        array.push({ text: `${this.$t(`SType.${data.text}`)}`, value: data.value });
      }
      return array;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
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
    visibleMidgetSubmarineFilter(): boolean {
      // 甲標的搭載可フィルタ表示制御
      const types = Const.SHIP_TYPES_ALT.filter((v, i) => this.selectedTypes.includes(i))
        .map((v) => v.types)
        .flat();
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];
        if ([+SHIP_TYPE.CL, SHIP_TYPE.CAV, SHIP_TYPE.AV].includes(type)) {
          return true;
        }
      }
      return this.selectedAllType;
    },
    visibleSpBomberFilter(): boolean {
      // 水爆系フィルタ表示制御
      const types = Const.SHIP_TYPES_ALT.filter((v, i) => this.selectedTypes.includes(i))
        .map((v) => v.types)
        .flat();
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];
        if ([+SHIP_TYPE.CL, SHIP_TYPE.CA, SHIP_TYPE.FBB, SHIP_TYPE.BB, SHIP_TYPE.BBB].includes(type)) {
          return true;
        }
      }
      return this.selectedAllType;
    },
    visibleFighterFilter(): boolean {
      // 戦闘機搭載可フィルタ表示制御
      const types = Const.SHIP_TYPES_ALT.filter((v, i) => this.selectedTypes.includes(i))
        .map((v) => v.types)
        .flat();
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];
        if ([+SHIP_TYPE.CL, SHIP_TYPE.CA, SHIP_TYPE.FBB, SHIP_TYPE.BB, SHIP_TYPE.BBB].includes(type)) {
          return true;
        }
      }
      return this.selectedAllType;
    },
    visibleArmorFilter(): boolean {
      // バルジ搭載可フィルタ表示制御
      const types = Const.SHIP_TYPES_ALT.filter((v, i) => this.selectedTypes.includes(i))
        .map((v) => v.types)
        .flat();
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];
        if ([+SHIP_TYPE.DD, SHIP_TYPE.CL, SHIP_TYPE.AO_2].includes(type)) {
          return true;
        }
      }
      return this.selectedAllType;
    },
    visibleCommanderFilter(): boolean {
      // 司令部搭載可フィルタ表示制御
      const types = Const.SHIP_TYPES_ALT.filter((v, i) => this.selectedTypes.includes(i))
        .map((v) => v.types)
        .flat();
      for (let i = 0; i < types.length; i += 1) {
        const type = types[i];
        if ([+SHIP_TYPE.DD, SHIP_TYPE.AO_2].includes(type)) {
          return true;
        }
      }
      return this.selectedAllType;
    },
    isAllUncheckedHP() {
      return !this.shipFilter.HPIs4n && !this.shipFilter.HPIs4n1 && !this.shipFilter.HPIs4n2 && !this.shipFilter.HPIs4n3;
    },
    isAllUncheckedRemodeling() {
      return !this.shipFilter.includeInitial && !this.shipFilter.includeIntermediate && !this.shipFilter.includeFinal;
    },
    isAllUncheckedSpeed() {
      return !this.shipFilter.includeFast && !this.shipFilter.includeSlow;
    },
    isAllUncheckedRange() {
      return !this.shipFilter.includeRange1 && !this.shipFilter.includeRange2 && !this.shipFilter.includeRange3 && !this.shipFilter.includeRange4;
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
      this.isMobile = window.innerWidth < 600;

      const all = this.$store.state.ships as ShipMaster[];
      let ships = [];
      const types = Const.SHIP_TYPES_ALT.filter((v, i) => this.selectedTypes.includes(i))
        .map((v) => v.types)
        .flat();

      // 国籍フィルタ ブラックリスト形式で
      let forbiddenNationalities: number[] = [];
      // 選択されて『いない』国
      const notSelectedNationalFilters = this.shipFilter.nationalities.filter((v) => !v.isChecked).map((v) => v.filter);
      for (let index = 0; index < notSelectedNationalFilters.length; index += 1) {
        // 選択されて『いない』国のフィルタ(type2の配列)を連結していく
        forbiddenNationalities = forbiddenNationalities.concat(notSelectedNationalFilters[index]);
      }
      // 日本特別対応
      const withoutJapan = this.shipFilter.nationalities
        .filter((v) => !v.isChecked)
        .map((v) => v.value)
        .includes(0);

      for (let i = 0; i < all.length; i += 1) {
        const ship = all[i];
        if (!types.includes(ship.type)) {
          // 艦種フィルタ
          continue;
        }
        // 初期改造状態を含めず
        if (!this.shipFilter.includeInitial && ship.version === 0) continue;
        // 中間改造状態を含めず
        if (!this.shipFilter.includeIntermediate && ship.version !== 0 && !ship.isFinal) continue;
        // 最終改造状態を含めず
        if (!this.shipFilter.includeFinal && ship.isFinal) continue;
        // 5スロ
        if (this.shipFilter.slotCount5 && ship.slotCount < 5) continue;
        // 4スロ
        else if (this.shipFilter.slotCount4 && ship.slotCount < 4) continue;
        // 3スロ
        else if (this.shipFilter.slotCount3 && ship.slotCount < 3) continue;
        // 耐久4n系フィルタ
        if (
          (!this.shipFilter.HPIs4n && ship.hp % 4 === 0)
          || (!this.shipFilter.HPIs4n1 && ship.hp % 4 === 3)
          || (!this.shipFilter.HPIs4n2 && ship.hp % 4 === 2)
          || (!this.shipFilter.HPIs4n3 && ship.hp % 4 === 1)
        ) continue;
        // 国籍で絞る
        if (forbiddenNationalities.includes(ship.type2) || (withoutJapan && Const.JPN.includes(ship.type2))) continue;
        // 速力 高速
        if (!this.shipFilter.includeFast && ship.speed === 10) continue;
        // 速力 低速
        if (!this.shipFilter.includeSlow && ship.speed === 5) continue;
        // 射程 短
        if (!this.shipFilter.includeRange1 && ship.range === 1) continue;
        if (!this.shipFilter.includeRange2 && ship.range === 2) continue;
        if (!this.shipFilter.includeRange3 && ship.range === 3) continue;
        if (!this.shipFilter.includeRange4 && ship.range === 4) continue;

        ships.push(ship);
      }

      const isValid = ShipValidation.isValidItem;
      const filterShip = (argShips: ShipMaster[], itemIds: number[], isNg = false, isEx = false): ShipMaster[] => {
        const items = (this.$store.state.items as ItemMaster[]).filter((v) => itemIds.includes(v.id));
        if (items.length) {
          const slot = isEx ? Const.EXPAND_SLOT_INDEX : -1;
          if (isNg) return argShips.filter((v) => v.slotCount && items.every((item) => !isValid(v, item, slot, 10)));
          return argShips.filter((v) => v.slotCount && items.some((item) => isValid(v, item, slot, 10)));
        }
        return argShips;
      };
      if (this.shipFilter.landingCraftOK) {
        // 大発搭載可能
        ships = filterShip(ships, [68]);
      } else if (this.shipFilter.landingCraftNG) {
        // 大発搭載不可
        ships = filterShip(ships, [68], true);
      }
      if (this.shipFilter.tankOK) {
        // 内火艇搭載可能
        ships = filterShip(ships, [167]);
      } else if (this.shipFilter.tankNG) {
        // 内火艇搭載不可
        ships = filterShip(ships, [167], true);
      }
      if (this.visibleCommanderFilter) {
        if (this.shipFilter.commanderOK) {
          // 司令部搭載可
          ships = filterShip(ships, [107]);
        } else if (this.shipFilter.commanderNG) {
          // 司令部搭載不可
          ships = filterShip(ships, [107], true);
        }
      }
      if (this.visibleArmorFilter) {
        if (this.shipFilter.armorOK) {
          // バルジ搭載可能
          ships = filterShip(ships, [72, 73]);
        } else if (this.shipFilter.armorNG) {
          // バルジ搭載不可
          ships = filterShip(ships, [72, 73], true);
        }
      }
      if (this.visibleSpBomberFilter) {
        if (this.shipFilter.spBomberOK) {
          // 水爆搭載可(Lateでテスト)
          ships = filterShip(ships, [194]);
        } else if (this.shipFilter.spBomberNG) {
          // 水爆搭載不可(Lateでテスト)
          ships = filterShip(ships, [194], true);
        }
      }
      if (this.visibleFighterFilter) {
        if (this.shipFilter.fighterOK) {
          // 戦闘機搭載可
          ships = filterShip(ships, [19, 165]);
        } else if (this.shipFilter.fighterNG) {
          // 戦闘機搭載不可
          ships = filterShip(ships, [19, 165], true);
        }
      }
      if (this.shipFilter.midgetSubmarineOK && this.visibleMidgetSubmarineFilter) {
        // 甲標的搭載可
        ships = filterShip(ships, [41]);
      }
      if (this.shipFilter.largeSearchlightOK) {
        // 大型探照灯搭載可
        ships = filterShip(ships, [140]);
      }
      if (this.shipFilter.canEquip13RadarOnly) {
        // 増設13号電探
        ships = filterShip(ships, [27, 506], false, true);
      }
      if (this.shipFilter.canEquip22RadarOnly) {
        // 増設22号電探
        ships = filterShip(ships, [28, 517], false, true);
      }
      if (this.shipFilter.canEquipMastRadarOnly) {
        // 増設13号電探マスト
        ships = filterShip(ships, [506], false, true);
      }
      if (this.shipFilter.canEquipRadarOnly) {
        // 増設その他の電探限定
        ships = filterShip(ships, [30, 124, 142, 410, 460, 527, 528], false, true);
      }
      if (this.shipFilter.canEquipExSubGunOnly) {
        // 増設副砲
        ships = filterShip(ships, [220, 275, 524], false, true);
      }
      if (this.shipFilter.canEquipExCommanderOnly) {
        // 増設司令部
        ships = filterShip(ships, [107, 272, 413], false, true);
      }
      if (this.shipFilter.canEquipExTankOnly) {
        // 増設カミ車
        ships = filterShip(ships, [167, 525, 526], false, true);
      }
      if (this.shipFilter.canEquipExArmorOnly) {
        // 増設バルジ搭載可能
        ships = filterShip(ships, [72, 73, 268], false, true);
      }
      if (this.shipFilter.canEquipExDepthChargeOnly) {
        // 増設爆雷搭載可能
        ships = filterShip(ships, [226, 227], false, true);
      }
      this.ships = ships.sort((a, b) => a.sort - b.sort);
    },
    resetFilter() {
      this.keyword = '';
      this.shipFilter = new ShipFilter();
      this.shipFilter.includeInitial = false;
      this.shipFilter.includeIntermediate = false;
      this.initShips();
    },
    toggleFilterDialog() {
      if (!this.filterDialog) {
        // 検索かける
        this.initShips();
      }
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
    toggleDaihatsuFilter() {
      if (this.shipFilter.landingCraftOK) {
        this.shipFilter.landingCraftOK = false;
        this.shipFilter.landingCraftNG = true;
      } else if (this.shipFilter.landingCraftNG) {
        this.shipFilter.landingCraftNG = false;
      } else {
        this.shipFilter.landingCraftOK = true;
      }
    },
    toggleTankFilter() {
      if (this.shipFilter.tankOK) {
        this.shipFilter.tankOK = false;
        this.shipFilter.tankNG = true;
      } else if (this.shipFilter.tankNG) {
        this.shipFilter.tankNG = false;
      } else {
        this.shipFilter.tankOK = true;
      }
    },
    toggleSpBomberFilter() {
      if (this.shipFilter.spBomberOK) {
        this.shipFilter.spBomberOK = false;
        this.shipFilter.spBomberNG = true;
      } else if (this.shipFilter.spBomberNG) {
        this.shipFilter.spBomberNG = false;
      } else {
        this.shipFilter.spBomberOK = true;
      }
    },
    toggleFighterFilter() {
      if (this.shipFilter.fighterOK) {
        this.shipFilter.fighterOK = false;
        this.shipFilter.fighterNG = true;
      } else if (this.shipFilter.fighterNG) {
        this.shipFilter.fighterNG = false;
      } else {
        this.shipFilter.fighterOK = true;
      }
    },
    toggleCommanderFilter() {
      if (this.shipFilter.commanderOK) {
        this.shipFilter.commanderOK = false;
        this.shipFilter.commanderNG = true;
      } else if (this.shipFilter.commanderNG) {
        this.shipFilter.commanderNG = false;
      } else {
        this.shipFilter.commanderOK = true;
      }
    },
    toggleArmorFilter() {
      if (this.shipFilter.armorOK) {
        this.shipFilter.armorOK = false;
        this.shipFilter.armorNG = true;
      } else if (this.shipFilter.armorNG) {
        this.shipFilter.armorNG = false;
      } else {
        this.shipFilter.armorOK = true;
      }
    },
    toggleExSlotFilter() {
      if (this.shipFilter.isReleaseExSlotOnly) {
        this.shipFilter.isReleaseExSlotOnly = false;
        this.shipFilter.isNotReleaseExSlotOnly = true;
      } else if (this.shipFilter.isNotReleaseExSlotOnly) {
        this.shipFilter.isNotReleaseExSlotOnly = false;
      } else {
        this.shipFilter.isReleaseExSlotOnly = true;
      }
    },
    toggleAllNationality() {
      // いずれか1つでも未チェックがあれば全チェック => 全チェック状態だった場合のみチェックを解除ということ。
      const checked = this.shipFilter.nationalities.some((v) => !v.isChecked);
      for (let i = 0; i < this.shipFilter.nationalities.length; i += 1) {
        this.shipFilter.nationalities[i].isChecked = checked;
      }
    },
  },
});
</script>
