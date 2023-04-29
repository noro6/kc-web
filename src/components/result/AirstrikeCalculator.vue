<template>
  <div>
    <div class="container">
      <div class="d-flex flex-wrap align-center">
        <div class="form-control">
          <v-text-field
            type="number"
            v-model.number="selectedItem.remodel"
            min="0"
            max="10"
            :label="$t('Common.改修値')"
            hide-details
            outlined
            dense
            @input="calculateFire"
          />
        </div>
        <div class="form-control">
          <v-text-field
            type="number"
            v-model.number="attackerSlot"
            min="0"
            max="999"
            :label="$t('Result.搭載数')"
            hide-details
            outlined
            dense
            @input="calculateFire"
            :disabled="enabledDist && useResult"
          />
        </div>
        <div class="d-flex" v-if="enabledDist">
          <v-checkbox :label="$t('Result.残機数分布を利用')" dense hide-details v-model="useResult" @change="calculateFire" />
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="align-self-center mt-2 ml-1" small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
            </template>
            <div class="caption">
              <div>{{ $t("Result.対空砲火により撃墜される機数の確率分布を利用して計算します。") }}</div>
              <div>{{ $t("Result.搭載数を固定してダメージを確認したい場合はチェックを外してください。") }}</div>
            </div>
          </v-tooltip>
        </div>
        <div class="w-100" v-if="enabledDist" />
        <div class="form-control lg" v-show="isAirbase">
          <v-select :label="$t('EType.陸上偵察機')" v-model="calcArgs.rikuteiBonus" :items="rikuteis" hide-details outlined dense @change="calculateFire" />
        </div>
        <div class="form-control">
          <v-select :label="$t('Fleet.触接')" v-model="calcArgs.contactBonus" :items="contacts" hide-details outlined dense @change="calculateFire" />
        </div>
        <div class="form-control">
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                type="number"
                v-model.number="calcArgs.manualAfterCapBonus"
                v-bind="attrs"
                v-on="on"
                min="0"
                max="9999"
                :label="$t('Result.特効')"
                hide-details
                outlined
                dense
                step="0.01"
                @input="calculateFire"
              />
            </template>
            <div class="caption">{{ $t("Result.キャップ後火力に適用される倍率です。") }}</div>
          </v-tooltip>
        </div>
        <div class="form-control" v-show="!isAirbase">
          <v-select :label="$t('Result.残弾薬')" v-model="ammo" :items="ammos" hide-details outlined dense @change="calculateFire" />
        </div>
        <div class="d-flex">
          <v-checkbox :label="$t('Result.クリティカル')" dense hide-details v-model="calcArgs.isCritical" @change="calculateFire" />
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="align-self-center mt-2 ml-1" small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
            </template>
            <div class="caption">
              <div>{{ $t("Result.クリティカル発生時のダメージを表示します。") }}</div>
              <div>
                {{ $t("Result.クリティカル補正") }}(
                <span class="yellow--text">&times;1.50</span>
                ) &times; {{ $t("Result.熟練度クリティカル補正") }}(
                <span class="yellow--text">&times;{{ calcArgs.criticalBonus.toFixed(2) }}</span>
                )
              </div>
            </div>
          </v-tooltip>
        </div>
      </div>
      <v-divider class="mt-2" />
      <div class="d-flex align-center">
        <div class="body-2">{{ $t("Result.ダメージ計算結果") }}</div>
        <v-spacer />
        <div class="caption mr-3">{{ $t("Result.防御艦隊") }}</div>
        <div class="form-control lg mt-0 pt-0">
          <v-select v-model="defenseIndex" :items="defenseFleets" hide-details dense @change="changeDefenseIndex" />
        </div>
      </div>
      <v-divider />
      <v-simple-table fixed-header :height="tableHeight">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="pr-1" />
              <th class="pr-1">{{ $t("Common.耐久") }}</th>
              <th class="pr-1">{{ $t("Common.装甲") }}</th>
              <th class="pr-1 text-no-wrap">{{ $t("Result.ダメージ幅") }}</th>
              <th class="pr-1">{{ $t("Result.撃沈率") }}</th>
              <th class="pr-1">{{ $t("Result.大破率") }}</th>
              <th class="pr-1">{{ $t("Result.中破率") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in rowData"
              :key="`ship_${i}`"
              :class="{
                'tr-death': row.death >= 90,
                'tr-damaged': row.death + row.taiha >= 70,
                'tr-half-damaged': row.death + row.taiha + row.chuha >= 50,
              }"
              @mouseenter="bootDamageDetailTooltip(row, $event)"
              @mouseleave="clearTooltip"
              @focus="bootDamageDetailTooltip(row, $event)"
              @blur="clearTooltip"
            >
              <td class="px-1">
                <v-img :src="`./img/ship/${row.ship.data.id}.png`" height="30" width="120" />
              </td>
              <td class="pr-1">{{ row.ship.hp }}</td>
              <td class="pr-1">{{ row.ship.actualArmor }}</td>
              <td class="pr-1 tooltip-anchor">{{ row.damage }}</td>
              <td v-if="row.disabledASW" class="caption text-center pr-1" colspan="4">{{ $t("Result.対潜攻撃不可") }}</td>
              <template v-else-if="row.death < 100">
                <td class="pr-1">{{ row.damage ? row.death + "%" : "" }}</td>
                <td class="pr-1">{{ row.damage ? row.taiha + "%" : "" }}</td>
                <td class="pr-1">{{ row.damage ? row.chuha + "%" : "" }}</td>
              </template>
              <td v-else class="red--text text-center pr-1" colspan="4">{{ $t("Result.確殺") }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
    <v-tooltip v-model="enabledDamageDetailTooltip" color="black" top :position-x="tooltipX" :position-y="tooltipY">
      <div v-if="selectedItem" class="d-flex py-2" :class="{ 'multi-container': preCapTerms.length >= 2 }">
        <div class="damage-detail-container caption" v-for="(preCapTerm, i) in preCapTerms" :key="`term${i}`">
          <template v-if="postCapTerms[i].isSubmarine">
            <div>{{ $t("Common.対潜") }}</div>
            <div>{{ selectedItem.data.asw }}</div>
            <template v-if="selectedItem.remodel && preCapTerm.actualTorpedo">
              <div>{{ $t("Result.改修強化値") }}</div>
              <div>{{ Math.floor(100 * (preCapTerm.actualTorpedo - selectedItem.data.asw)) / 100 }}</div>
            </template>
            <div>{{ $t("Result.実対潜値") }}</div>
          </template>
          <template v-else-if="selectedItem.data.isTorpedoAttacker && !preCapTerm.isLandBase">
            <div>{{ $t("Common.雷装") }}</div>
            <div>{{ selectedItem.data.torpedo }}</div>
            <template v-if="preCapTerm.torpedoMultiplier && preCapTerm.torpedoMultiplier !== 1">
              <div>{{ $t("Result.雷装補正") }}</div>
              <div>&times; {{ preCapTerm.torpedoMultiplier }}</div>
            </template>
            <template v-if="selectedItem.bonusTorpedo">
              <div>{{ $t("Result.改修強化値") }}</div>
              <div>&plus; {{ Math.floor(100 * selectedItem.bonusTorpedo) / 100 }}</div>
            </template>
            <template v-if="selectedItem.attackerTorpedoBonus">
              <div>{{ $t("Result.装備シナジーボーナス") }}</div>
              <div>&plus; {{ selectedItem.attackerTorpedoBonus }}</div>
            </template>
            <template v-if="selectedItem.crewTorpedoBonus">
              <div>{{ $t("Result.熟練甲板要員ボーナス") }}</div>
              <div>&plus; {{ selectedItem.crewTorpedoBonus }}</div>
            </template>
            <div>{{ $t("Result.実雷装値") }}</div>
          </template>
          <template v-else>
            <div>{{ $t("Common.爆装") }}</div>
            <div>{{ selectedItem.data.bomber }}</div>
            <template v-if="selectedItem.bonusBomber">
              <div>{{ $t("Result.改修強化値") }}</div>
              <div>&plus; {{ Math.floor(100 * selectedItem.bonusBomber) / 100 }}</div>
            </template>
            <template v-if="selectedItem.attackerTorpedoBonus">
              <div>{{ $t("Result.装備シナジーボーナス") }}</div>
              <div>&plus; {{ selectedItem.attackerTorpedoBonus }}</div>
            </template>
            <template v-if="selectedItem.crewBomberBonus">
              <div>{{ $t("Result.熟練甲板要員ボーナス") }}</div>
              <div>&plus; {{ selectedItem.crewBomberBonus }}</div>
            </template>
            <div>{{ $t("Result.実爆装値") }}</div>
          </template>
          <div>{{ preCapTerm.actualTorpedo ? Math.floor(100 * preCapTerm.actualTorpedo) / 100 : 0 }}</div>
          <div>
            {{ $t("Result.搭載数") }} <template v-if="useResult">( {{ minSlot }} ~ {{ maxSlot }} )</template>
          </div>
          <div v-if="useResult">{{ Math.floor((maxSlot + minSlot) / 2) }}</div>
          <div v-else>{{ attackerSlot }}</div>
          <div class="divider my-1"><v-divider /></div>
          <div class="divider my-1"><v-divider /></div>
          <div>{{ $t("Result.種別倍率") }}</div>
          <div>&times; {{ preCapTerm.typeMultiplier ? preCapTerm.typeMultiplier.toFixed(2) : 1 }}</div>
          <div>{{ $t("Result.航空戦定数") }}</div>
          <div>&plus; {{ preCapTerm.airstrikeModifiers }}</div>
          <div>{{ $t("Result.基本攻撃力") }}</div>
          <div>{{ preCapTerm.baseFirePower ? Math.floor(100 * preCapTerm.baseFirePower) / 100 : 0 }}</div>
          <template v-if="preCapTerm.B25Modifiers && preCapTerm.B25Modifiers !== 1">
            <div>{{ $t("Result.B-25補正") }}</div>
            <div>&times; {{ preCapTerm.B25Modifiers.toFixed(2) }}</div>
          </template>
          <template v-if="preCapTerm.LBASModifiers && preCapTerm.LBASModifiers !== 1">
            <div>{{ $t("Result.基地航空隊補正") }}</div>
            <div>&times; {{ preCapTerm.LBASModifiers.toFixed(2) }}</div>
          </template>
          <template v-if="calcArgs.rikuteiBonus !== 1">
            <div>{{ $t("Result.陸偵補正") }}</div>
            <div>&times; {{ calcArgs.rikuteiBonus.toFixed(2) }}</div>
          </template>
          <div>{{ $t("Result.キャップ前攻撃力") }}</div>
          <div>{{ preCapTerm.preCapFirePower ? Math.floor(100 * preCapTerm.preCapFirePower) / 100 : 0 }}</div>
          <div class="divider my-1"><v-divider /></div>
          <div class="divider my-1"><v-divider /></div>
          <div>{{ $t("Result.キャップ後攻撃力") }}</div>
          <div>{{ postCapTerms[i].postCapFirePower ? postCapTerms[i].postCapFirePower : 0 }}</div>
          <template v-if="postCapTerms[i].LBASModifiers && postCapTerms[i].LBASModifiers !== 1">
            <div>{{ $t("Result.基地航空隊補正") }}</div>
            <div>&plus; {{ postCapTerms[i].LBASModifiers }}</div>
          </template>
          <template v-if="postCapTerms[i].bomberMultiplier && postCapTerms[i].bomberMultiplier !== 1">
            <div>{{ $t("Result.爆撃機補正") }}</div>
            <div>&times; {{ postCapTerms[i].bomberMultiplier.toFixed(2) }}</div>
          </template>
          <template v-if="calcArgs.contactBonus !== 1">
            <div>{{ $t("Result.触接補正") }}</div>
            <div>&times; {{ calcArgs.contactBonus.toFixed(2) }}</div>
          </template>
          <template v-if="postCapTerms[i].airbaseAttackerMultiplier && postCapTerms[i].airbaseAttackerMultiplier !== 1">
            <div>{{ $t("Result.陸攻補正") }}</div>
            <div>&times; {{ postCapTerms[i].airbaseAttackerMultiplier.toFixed(2) }}</div>
          </template>
          <template v-if="calcArgs.isAirbaseMode && calcArgs.unionBonus !== 1">
            <div>{{ $t("Result.敵連合補正") }}</div>
            <div>&times; {{ calcArgs.unionBonus.toFixed(2) }}</div>
          </template>
          <template v-if="postCapTerms[i].princessMultiplier && postCapTerms[i].princessMultiplier !== 1">
            <div>{{ $t("Result.姫級補正") }}</div>
            <div>&times; {{ postCapTerms[i].princessMultiplier.toFixed(2) }}</div>
          </template>
          <template v-if="calcArgs.manualAfterCapBonus !== 1">
            <div>{{ $t("Result.特効") }}</div>
            <div>&times; {{ calcArgs.manualAfterCapBonus }}</div>
          </template>
          <template v-if="calcArgs.isCritical">
            <div>{{ $t("Result.クリティカル補正") }}</div>
            <div>&times; 1.50</div>
            <div>{{ $t("Result.熟練度クリティカル補正") }}</div>
            <div>&times; {{ calcArgs.criticalBonus.toFixed(2) }}</div>
          </template>
          <div class="divider my-1"><v-divider /></div>
          <div class="divider my-1"><v-divider /></div>
          <div>{{ $t("Result.最終攻撃力") }}</div>
          <div>{{ postCapTerms[i].finalFirePower ? Math.floor(100 * postCapTerms[i].finalFirePower) / 100 : 0 }}</div>
          <div>{{ $t("Common.装甲") }}</div>
          <div>{{ minArmor }} ~ {{ maxArmor }}</div>
          <template v-if="ammo !== 1">
            <div>{{ $t("Result.弾薬補正値") }}</div>
            <div>&times; {{ ammo }}</div>
          </template>
          <div>{{ $t("Result.ダメージ幅") }}</div>
          <div>{{ getDamageRangeString(postCapTerms[i].finalFirePower) }}</div>
        </div>
      </div>
    </v-tooltip>
  </div>
</template>

<style scoped>
.container {
  padding: 0.5rem;
}

.w-100 {
  width: 100%;
}

.form-control {
  width: 100px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
  align-self: center;
}
.form-control.lg {
  width: 160px;
}

.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.v-data-table thead th {
  text-align: right !important;
  height: 36px !important;
  background-color: rgb(242, 242, 242) !important;
}
.theme--dark .v-data-table thead th {
  background-color: rgb(62, 62, 68) !important;
}
.deep-sea .theme--dark .v-data-table thead th {
  background-color: rgb(52, 58, 72) !important;
}
.v-data-table tbody td {
  text-align: right;
  background-color: unset !important;
  height: unset !important;
}
.v-data-table tbody tr.tr-half-damaged {
  background-color: rgba(255, 255, 10, 0.075);
}
.v-data-table tbody tr.tr-half-damaged:hover {
  background-color: rgba(255, 255, 10, 0.15) !important;
}
.v-data-table tbody tr.tr-damaged {
  background-color: rgba(255, 10, 10, 0.075);
}
.v-data-table tbody tr.tr-damaged:hover {
  background-color: rgba(255, 10, 10, 0.15) !important;
}
.v-data-table tbody tr.tr-death {
  background-color: rgba(0, 150, 255, 0.075);
}
.v-data-table tbody tr.tr-death:hover {
  background-color: rgba(0, 150, 255, 0.15) !important;
}

.damage-detail-container {
  display: grid;
  grid-template-columns: auto auto;
}
.multi-container .damage-detail-container {
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px 12px;
}
.multi-container .damage-detail-container:nth-child(2n) {
  margin-left: 12px;
}

.damage-detail-container > div:nth-child(2n):not(.divider) {
  margin-left: 1rem;
  text-align: right;
}
</style>

<script lang="ts">
import Vue from 'vue';
import max from 'lodash/max';
import min from 'lodash/min';
import sum from 'lodash/sum';
import groupBy from 'lodash/groupBy';
import SaveData from '@/classes/saveData/saveData';
import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import Item from '@/classes/item/item';
import Calculator, {
  FirePowerCalcArgs, PostCapTerm, PowerDist, PreCapTerm, SlotDist,
} from '@/classes/aerialCombat/powerCalculator';
import CommonCalc from '@/classes/commonCalc';
import Const, { SHIP_TYPE } from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';

interface DamageRowData {
  ship: Ship | Enemy;
  damage: string;
  death: number;
  taiha: number;
  chuha: number;
  disabledASW: boolean;
}

export default Vue.extend({
  name: 'AirstrikeCalculator',
  props: {
    parent: {
      type: [Ship, Airbase, Enemy],
      required: true,
    },
    tableHeight: {
      type: String,
      default: '',
    },
    changedDefenseFleet: {
      type: Function,
      default: undefined,
    },
  },
  data: () => ({
    selectedItem: new Item(),
    attackerSlot: 18,
    useResult: true,
    maxSlot: 0,
    minSlot: 0,
    calcArgs: {
      item: new Item(),
      slot: 0,
      defense: new Enemy(),
      isAirbaseMode: false,
      isCritical: false,
      isUnion: false,
      criticalBonus: 1,
      contactBonus: 1,
      unionBonus: 1,
      rikuteiBonus: 1,
      manualAfterCapBonus: 1,
      multipliers: [1],
    } as FirePowerCalcArgs,
    contacts: [
      { text: '-', value: 1 },
      { text: '120%', value: 1.2 },
      { text: '117%', value: 1.17 },
      { text: '112%', value: 1.12 },
    ],
    ammo: 1,
    ammos: [
      { text: '～50%', value: 1 },
      { text: '45%', value: 0.9 },
      { text: '40%', value: 0.8 },
      { text: '35%', value: 0.7 },
      { text: '30%', value: 0.6 },
      { text: '25%', value: 0.5 },
      { text: '20%', value: 0.4 },
      { text: '15%', value: 0.3 },
      { text: '10%', value: 0.2 },
      { text: '5%', value: 0.1 },
    ],
    rowData: [] as DamageRowData[],
    isAirbase: false,
    defenseIndex: 0,
    defenseFleets: [] as { text: string; value: number; ships: Ship[] | Enemy[]; isUnion: boolean; area: number; node: string }[],
    enabledDamageDetailTooltip: false,
    slotRateTableText: '',
    tooltipTimer: undefined as undefined | number,
    preCapTerms: [] as PreCapTerm[],
    postCapTerms: {} as PostCapTerm[],
    maxArmor: 0,
    minArmor: 0,
    tooltipX: 0,
    tooltipY: 0,
  }),
  mounted() {
    const saveData = this.$store.state.mainSaveData as SaveData;
    const items = this.$store.state.items as ItemMaster[];
    const ships = this.$store.state.ships as ShipMaster[];
    const enemies = this.$store.getters.getEnemies as EnemyMaster[];

    const calcManager = saveData.loadManagerData(items, ships, enemies);

    this.defenseFleets = [];
    if (this.parent instanceof Enemy) {
      // 防御側セレクトに味方艦隊をセット
      this.defenseFleets = [];
      const { fleets } = calcManager.fleetInfo;
      if (calcManager.fleetInfo.unionFleet && calcManager.fleetInfo.unionFleet.ships.length) {
        const enabledShips = calcManager.fleetInfo.unionFleet.ships.filter((v) => !v.isEmpty);
        this.defenseFleets.push({
          text: `${this.$t('Fleet.連合艦隊')}`,
          value: 0,
          ships: enabledShips,
          isUnion: true,
          area: 0,
          node: '',
        });
      }
      for (let i = 0; i < fleets.length - 1; i += 1) {
        const enabledShips = fleets[i].ships.filter((v) => !v.isEmpty);
        this.defenseFleets.push({
          text: `${this.$t('Fleet.第x艦隊', { number: i + 1 })}`,
          value: this.defenseFleets.length,
          ships: enabledShips,
          isUnion: false,
          area: 0,
          node: '',
        });
      }
    } else {
      const { fleets } = calcManager.battleInfo;
      // 防御側セレクトに敵艦隊をセット
      for (let i = 0; i < fleets.length; i += 1) {
        const enabledShips = fleets[i].enemies.filter((v) => v.data.id);
        this.defenseFleets.push({
          text: `${this.$t('Result.x戦目', { number: i + 1 })}`,
          value: i,
          ships: enabledShips,
          isUnion: fleets[i].isUnion,
          area: fleets[i].area,
          node: fleets[i].nodeName,
        });
      }

      if (this.parent instanceof Airbase) {
        this.isAirbase = true;
        const target = Math.min(this.parent.battleTarget[1], calcManager.battleInfo.fleets.length - 1);
        this.defenseIndex = target;
        // 陸上偵察機初期値設定
        if (this.parent.items.some((v) => v.data.id === 312)) {
          this.calcArgs.rikuteiBonus = 1.15;
        } else if (this.parent.items.some((v) => v.data.id === 311 || v.data.id === 480)) {
          this.calcArgs.rikuteiBonus = 1.12;
        }

        const defense = this.defenseFleets[this.defenseIndex];
        if (defense && defense.area) {
          // 基地特効設定
          this.calcArgs.manualAfterCapBonus = 1;
          const mapBonuses = Const.AIRBASE_MAP_BONUSES;
          for (let i = 0; i < mapBonuses.length; i += 1) {
            const d = mapBonuses[i];
            if (d.area === defense.area) {
              const count = this.parent.items.filter((v) => d.items.includes(v.data.id)).length;
              if (!count) continue;
              if (d.multi) {
                // 乗算モード
                this.calcArgs.manualAfterCapBonus *= d.bonus ** count;
              } else {
                // 加算モード
                this.calcArgs.manualAfterCapBonus += d.bonus * count;
              }
            }
          }

          if (this.calcArgs.manualAfterCapBonus !== 1) {
            this.calcArgs.manualAfterCapBonus = Math.floor(10000 * this.calcArgs.manualAfterCapBonus) / 10000;
          }
        }
      } else {
        // 通常艦隊 最終戦闘をセット
        this.defenseIndex = calcManager.battleInfo.fleets.length - 1;
        // 熟練度クリティカルボーナス算出
        this.calcArgs.criticalBonus = this.parent.getProfCriticalBonus();
      }
    }

    const fleet = this.defenseFleets[this.defenseIndex];
    this.calcArgs.isUnion = fleet.isUnion;
  },
  computed: {
    defenseShipRows(): DamageRowData[] {
      const item = this.defenseFleets[this.defenseIndex];
      if (!item) {
        return [];
      }
      const results = [];
      for (let i = 0; i < item.ships.length; i += 1) {
        results.push({
          ship: item.ships[i],
          damage: '',
          death: 0,
          taiha: 0,
          chuha: 0,
          disabledASW: false,
        });
      }
      return results;
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    rikuteis(): { text: string; value: number }[] {
      const array = [
        { text: '-', value: 1 },
        { text: '二式陸偵', value: 1.12 },
        { text: '二式陸偵(熟練)', value: 1.15 },
      ];

      if (this.isNotJapanese) {
        const transArray = [];
        for (let i = 0; i < array.length; i += 1) {
          transArray.push({ text: `${this.$t(`Result.${array[i].text}`)}`, value: array[i].value });
        }
        return transArray;
      }

      return array;
    },
    enabledDist(): boolean {
      return this.selectedItem && this.selectedItem.dist.length > 0;
    },
  },
  methods: {
    changeDefenseIndex() {
      const fleet = this.defenseFleets[this.defenseIndex];
      if (!fleet) {
        return;
      }
      this.calcArgs.isUnion = fleet.isUnion;
      if (this.changedDefenseFleet) {
        this.changedDefenseFleet(this.defenseIndex);
      } else {
        this.calculateFire();
      }
    },
    calculateFire(targetItem?: Item, manualSlot?: number) {
      if (manualSlot) {
        this.attackerSlot = manualSlot;
      }
      this.rowData = [];
      const baseItem = targetItem instanceof Item ? targetItem : this.selectedItem;
      const tempDist = baseItem.dist;
      const { attackerTorpedoBonus, crewTorpedoBonus, crewBomberBonus } = baseItem;
      // 改修値 搭載数変更を適用して再インスタンス化
      this.selectedItem = new Item({ item: baseItem, slot: this.attackerSlot });
      // 雷装ボーナス、爆装ボーナスあれば引き継ぎ
      this.selectedItem.attackerTorpedoBonus = attackerTorpedoBonus;
      this.selectedItem.crewTorpedoBonus = crewTorpedoBonus;
      this.selectedItem.crewBomberBonus = crewBomberBonus;

      // 計算結果の分布を引継ぎ
      this.selectedItem.dist = tempDist;

      const item = this.selectedItem;

      // 搭載数分布オブジェクト作成
      const sumDist = this.selectedItem.dist.length;
      const slotDist: SlotDist[] = [];
      const data = groupBy(this.selectedItem.dist);

      if (this.useResult && tempDist.length) {
        // 搭載数分布の結果を利用
        Object.keys(data).forEach((key) => {
          slotDist.push({ slot: +key, rate: data[key].length / sumDist });
        });

        this.maxSlot = max(Object.keys(data).map((v) => +v)) || 0;
        this.minSlot = min(Object.keys(data).map((v) => +v)) || 0;
      } else {
        // 搭載数キメ打ち
        slotDist.push({ slot: item.fullSlot, rate: 1 });
        this.maxSlot = item.fullSlot;
        this.minSlot = item.fullSlot;
      }

      // 引数調整
      this.calcArgs.item = this.selectedItem;
      this.calcArgs.unionBonus = this.calcArgs.isUnion ? 1.1 : 1;

      const rows = this.defenseShipRows.concat();
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        row.disabledASW = false;
        // 防御艦
        const { ship } = row;
        // 潜水かどうか？
        const isSubmarine = ship.data.type === SHIP_TYPE.SS || ship.data.type === SHIP_TYPE.SSV;
        // 対潜攻撃可能かどうか？
        let enableAsw = false;
        // 防御艦船設定
        this.calcArgs.defense = ship;
        // 火力分布
        let powers: PowerDist[] = [];
        if (this.parent instanceof Airbase) {
          // 基地航空隊火力計算
          this.calcArgs.isAirbaseMode = true;
          // 熟練度クリティカルボーナス算出
          this.calcArgs.criticalBonus = item.getProfCriticalBonus();
          powers = Calculator.getAirbaseFirePowers(this.calcArgs, slotDist);
          enableAsw = item.data.asw >= 7;
        } else if (this.parent instanceof Ship || this.parent instanceof Enemy) {
          // 通常航空戦火力計算
          this.calcArgs.isAirbaseMode = false;
          powers = Calculator.getAerialFirePowers(this.calcArgs, slotDist);
        }

        const isEnemy = ship instanceof Enemy;
        const HP = ship.hp;

        // 火力分布より、被ダメージ分布を取得
        const damageDist = CommonCalc.getDamageDistribution(powers, ship.actualArmor, this.ammo, HP, isEnemy);
        const damages = damageDist.map((v) => v.damage);

        // 最低 最大ダメ
        const minDamage = min(damages) as number;
        const maxDamage = max(damages) as number;

        // 各損傷状態必要ダメージボーダーとその確率 [死, 大, 中]
        const damageBorders = [
          { min: HP, max: maxDamage + 1, rate: 0 },
          { min: Math.ceil(HP * 0.75), max: HP, rate: 0 },
          { min: Math.ceil(HP * 0.5), max: Math.ceil(HP * 0.75), rate: 0 },
        ];

        for (let j = 0; j < damageBorders.length; j += 1) {
          const obj = damageBorders[j];
          const borderMin = obj.min;
          const borderMax = obj.max;
          // 各損傷状態を満たすボーダーを上回る確率を合計したもの => つまり〇〇率
          const okPowers = damageDist.filter((v) => v.damage >= borderMin && v.damage < borderMax).map((v) => v.rate);
          const rate = okPowers.length === damageDist.length ? 1 : (sum(okPowers) as number);
          obj.rate = rate;
        }

        // ダメージ表示調整
        if (!item.data.isAttacker) {
          // 非攻撃機は基本表示なし ただし対潜攻撃可の場合はその限りでない => 水偵とか
          if (!isSubmarine || !enableAsw) {
            row.damage = '';
            row.death = 0;
            row.taiha = 0;
            row.chuha = 0;
            continue;
          }
        }
        if (isSubmarine && !enableAsw) {
          // 対潜攻撃不可
          row.damage = '';
          row.death = 0;
          row.taiha = 0;
          row.chuha = 0;
          row.disabledASW = true;
          continue;
        } else if (maxDamage === 0) {
          if (this.maxSlot > 0) {
            // 攻撃機かつ搭載数があるのにダメージ0
            row.damage = `${this.$t('Result.割合ダメージ')}`;
          } else {
            row.damage = '';
          }
        } else if (minDamage === 0) {
          if (this.minSlot > 0) {
            // 全滅してないのに0なら割合
            row.damage = `${this.$t('Result.割合ダメージ')} ~ ${maxDamage}`;
          } else {
            row.damage = `0 ~ ${maxDamage}`;
          }
        } else {
          row.damage = `${minDamage} ~ ${maxDamage}`;
        }

        row.death = Math.floor(damageBorders[0].rate * 1000) / 10;
        row.taiha = Math.floor(damageBorders[1].rate * 1000) / 10;
        row.chuha = Math.floor(damageBorders[2].rate * 1000) / 10;
      }

      this.rowData = rows;
    },
    clearTooltip() {
      this.enabledDamageDetailTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
    bootDamageDetailTooltip(row: DamageRowData, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('tooltip-anchor')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = e.clientX;
        this.tooltipY = rect.y;
        this.enabledDamageDetailTooltip = true;
        this.preCapTerms = [];
        this.postCapTerms = [];

        const isSubmarine = row.ship.data.type === SHIP_TYPE.SS || row.ship.data.type === SHIP_TYPE.SSV;
        const args = this.calcArgs;
        args.item = this.selectedItem;
        args.slot = this.useResult ? Math.floor((this.maxSlot + this.minSlot) / 2) : this.attackerSlot;
        args.defense = row.ship;

        if (this.parent instanceof Airbase) {
          // 基地の場合
          args.isAirbaseMode = true;
          if (isSubmarine) {
            // 対潜の場合
            this.preCapTerms = Calculator.getAirbasePreCapAswAttackPowers(args);
            for (let i = 0; i < this.preCapTerms.length; i += 1) {
              const preCapTerm = this.preCapTerms[i];
              this.postCapTerms.push(Calculator.getAirbasePostCapAswAttackPower(args, preCapTerm.baseFirePower, preCapTerm.typeMultiplier));
            }
          } else {
            this.preCapTerms = Calculator.getPreCapTerms(args);
            for (let i = 0; i < this.preCapTerms.length; i += 1) {
              const preCapTerm = this.preCapTerms[i];
              this.postCapTerms.push(Calculator.getPostCapAttackPower(args, preCapTerm.preCapFirePower));
            }
          }
        } else {
          args.isAirbaseMode = false;
          this.preCapTerms = Calculator.getPreCapTerms(args);
          for (let i = 0; i < this.preCapTerms.length; i += 1) {
            const preCapTerm = this.preCapTerms[i];
            this.postCapTerms.push(Calculator.getPostCapAttackPower(args, preCapTerm.preCapFirePower));
          }
        }

        this.maxArmor = Math.floor(100 * (row.ship.actualArmor * 1.3 - 0.6)) / 100;
        this.minArmor = Math.floor(100 * row.ship.actualArmor * 0.7) / 100;
      }, Math.max(setting.popUpCount, 10));
    },
    getDamageRangeString(power: number): string {
      if (!power) return '-';

      const maxDamage = Math.floor((power - this.minArmor) * this.ammo);
      const minDamage = Math.floor((power - this.maxArmor) * this.ammo);

      if (maxDamage <= 0) {
        return `${this.$t('Result.割合ダメージ')}`;
      }
      if (minDamage <= 0) {
        return `${this.$t('Result.割合ダメージ')} ~ ${maxDamage}`;
      }
      return `${minDamage} ~ ${maxDamage}`;
    },
  },
});
</script>
