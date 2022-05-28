<template>
  <div>
    <div class="display-toggle mt-2 mx-2">
      <v-btn-toggle dense v-model="dispSlotRate" borderless mandatory>
        <v-btn :value="true" :class="{ 'blue darken-2 white--text': dispSlotRate }" @click.stop="dispSlotRate = true">
          <v-icon>mdi-chart-line</v-icon>
          <span>残機数詳細</span>
        </v-btn>
        <v-btn :value="false" :class="{ 'red darken-2 white--text': !dispSlotRate }" @click.stop="dispSlotRate = false">
          <v-icon>mdi-fire</v-icon>
          <span>火力計算</span>
        </v-btn>
      </v-btn-toggle>
    </div>
    <div class="detail-container pb-2">
      <div class="slot-rate-container mt-2" :class="{ show: dispSlotRate }">
        <div class="border-window pa-2">
          <div class="header-content">
            <div v-if="parent.data" class="d-flex px-2">
              <div class="align-self-center">
                <v-img :src="`./img/ship/${parent.data.id}.png`" height="30" width="120"></v-img>
              </div>
              <div class="px-2 align-self-center">
                <div v-if="parent.data.id > 1500" class="parent-id">id: {{ parent.data.id }}</div>
                <div class="align-self-center caption">{{ parent.data.name }}</div>
              </div>
            </div>
            <div v-else class="px-2 body-2">第{{ index + 1 }}基地航空隊</div>
          </div>
          <div class="mt-2" :class="{ 'pt-2': parent.data }">
            <template v-for="(item, i) in parent.items">
              <div
                :key="`item_${i}`"
                v-ripple="{ class: 'info--text' }"
                class="calc-item"
                :class="{ selected: selectedIndex === i, 'no-item': !item.data.isPlane }"
                @click="selectItem(item.data.isPlane ? i : -1)"
              >
                <div class="align-self-center caption slot-area">{{ item.fullSlot }}</div>
                <div>
                  <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="24" width="24"></v-img>
                </div>
                <div class="item-name text-truncate">{{ item.data.name }}</div>
                <div v-if="item.remodel" class="item-remodel">
                  <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
                  <span class="teal--text text--accent-4 body-2">{{ item.remodel }}</span>
                </div>
                <div v-if="item.level" class="item-level">
                  <v-img :src="`./img/util/prof${item.levelAlt}.png`" height="24" width="18"></v-img>
                  <span class="level-value">{{ item.level }}</span>
                </div>
                <div v-if="item.data.isPlane" class="item-simple-status d-flex ml-3">
                  <div>(</div>
                  <template v-if="item.data.isAttacker">
                    <div class="mx-1" v-if="item.actualTorpedo">雷装 {{ item.actualTorpedo.toFixed(1) }}</div>
                    <div class="mx-1" v-if="item.actualBomber">爆装 {{ item.actualBomber.toFixed(1) }}</div>
                  </template>
                  <template v-else-if="item.data.isPlane">
                    <div class="mx-1" v-if="item.actualAntiAir">対空 {{ item.actualAntiAir.toFixed(1) }}</div>
                  </template>
                  <div class="mx-1" v-if="item.data.radius">半径 {{ item.data.radius }}</div>
                  <div>)</div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="bar-area">
          <bar-chart :data="graphData" :options="options" title-text="残機数分布" />
        </div>
        <div class="d-flex">
          <textarea class="d-none" id="slot-rate-table-string" v-model="slotRateTableText" />
          <v-btn class="ml-auto" color="teal" dark small @click="copySlotRate()">
            <v-icon small>mdi-file-table-outline</v-icon>残機数分布をコピー
          </v-btn>
        </div>
      </div>
      <div class="fire-calc-container border-window mt-4" :class="{ show: !dispSlotRate }">
        <div class="header-content">
          <div class="align-self-center pl-2 body-2">航空戦火力計算機</div>
          <div class="target-item" @mouseenter="bootTooltip(selectedItem, $event)" @mouseleave="clearTooltip">
            <div class="pl-5">
              <v-img :src="`./img/type/icon${selectedItem.data.iconTypeId}.png`" height="24" width="24"></v-img>
            </div>
            <div class="pr-2 item-name">{{ selectedItem.data.name }}</div>
            <div v-show="selectedItem.remodel" class="px-2">
              <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
              <span class="teal--text text--accent-4 body-2">{{ selectedItem.remodel }}</span>
            </div>
          </div>
        </div>
        <div class="d-flex flex-wrap mt-2">
          <div class="form-control mx-1 my-2">
            <v-text-field
              type="number"
              v-model.number="selectedItem.remodel"
              min="0"
              max="10"
              label="改修値"
              hide-details
              outlined
              dense
              @input="calculateFire"
            ></v-text-field>
          </div>
          <div class="form-control mx-1 my-2">
            <v-select
              label="触接"
              v-model="calcArgs.contactBonus"
              :items="contacts"
              hide-details
              outlined
              dense
              @change="calculateFire"
            ></v-select>
          </div>
          <div class="align-self-center d-flex">
            <div class="form-control mx-1 my-2">
              <v-text-field
                type="number"
                v-model.number="attackerSlot"
                min="0"
                max="999"
                label="搭載数"
                hide-details
                outlined
                dense
                @input="calculateFire"
                :disabled="useResult"
              ></v-text-field>
            </div>
            <div class="align-self-center mx-1 mb-2 d-flex">
              <v-checkbox label="残機数分布を利用" dense hide-details v-model="useResult" @change="calculateFire"></v-checkbox>
              <v-tooltip bottom color="black">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon class="align-self-center mt-2" small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
                </template>
                <div class="caption">
                  <div>対空砲火により撃墜される機数の確率分布を利用して計算します。</div>
                  <div>搭載数を固定してダメージを確認したい場合はチェックを外してください</div>
                </div>
              </v-tooltip>
            </div>
          </div>
        </div>
        <div class="d-flex flex-wrap">
          <div class="form-control mx-1 my-2" v-show="!isAirbase">
            <v-select label="弾薬補正" v-model="ammo" :items="ammos" hide-details outlined dense @change="calculateFire"></v-select>
          </div>
          <div class="form-control mx-1 my-2">
            <v-tooltip bottom color="black">
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  type="number"
                  v-model.number="calcArgs.afterCapBonus"
                  v-bind="attrs"
                  v-on="on"
                  min="0"
                  max="9999"
                  label="特効"
                  hide-details
                  outlined
                  dense
                  step="0.1"
                  @input="calculateFire"
                ></v-text-field>
              </template>
              <div class="caption"><b>キャップ後火力</b>に適用される倍率です</div>
            </v-tooltip>
          </div>
          <div class="form-control lg mx-1 my-2" v-show="isAirbase">
            <v-select
              label="陸上偵察機"
              v-model="calcArgs.rikuteiBonus"
              :items="rikuteis"
              hide-details
              outlined
              dense
              @change="calculateFire"
            ></v-select>
          </div>
          <div class="align-self-center mx-1 mb-2 d-flex">
            <v-checkbox label="クリティカル" dense hide-details v-model="calcArgs.isCritical" @change="calculateFire"></v-checkbox>
            <v-tooltip bottom color="black">
              <template v-slot:activator="{ on, attrs }">
                <v-icon class="align-self-center mt-2" small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
              </template>
              <div class="caption">
                <div>クリティカル発生時のダメージを表示します。</div>
                <div>
                  クリティカル補正(
                  <span class="yellow--text">&times;1.50</span>
                  ) &times; 熟練度クリティカル補正(
                  <span class="yellow--text">&times;{{ calcArgs.criticalBonus.toFixed(2) }}</span>
                  )
                </div>
              </div>
            </v-tooltip>
          </div>
          <div class="align-self-center mx-1 mb-2 d-flex">
            <v-checkbox label="連合" dense hide-details v-model="calcArgs.isUnion" @change="calculateFire"></v-checkbox>
            <v-tooltip bottom color="black">
              <template v-slot:activator="{ on, attrs }">
                <v-icon class="align-self-center mt-2" small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
              </template>
              <div class="caption">
                <div>防御側が連合艦隊であるかどうかを設定します。</div>
              </div>
            </v-tooltip>
          </div>
        </div>
        <v-divider></v-divider>
        <div class="mb-2 mx-1 d-flex">
          <div class="align-self-end body-2">ダメージ計算結果</div>
          <v-spacer></v-spacer>
          <div class="align-self-end caption mr-3">防御艦隊:</div>
          <div>
            <v-select v-model="defenseIndex" :items="defenseFleets" hide-details dense @change="changeDefenseIndex"></v-select>
          </div>
        </div>
        <div class="d-flex damage-header">
          <div class="damage-td img"></div>
          <div class="damage-td">耐久</div>
          <div class="damage-td">装甲</div>
          <div class="damage-td grow">ダメージ幅</div>
          <div class="damage-td">撃沈率</div>
          <div class="damage-td">大破率</div>
          <div class="damage-td">中破率</div>
        </div>
        <div
          v-for="(row, i) in defenseShipRows"
          :key="`ship_${i}`"
          class="damage-tr"
          :class="{
            'tr-death': row.death >= 90,
            'tr-damaged': row.death + row.taiha >= 70,
            'tr-half-damaged': row.death + row.taiha + row.chuha >= 50,
          }"
        >
          <div>
            <v-img :src="`./img/ship/${row.ship.data.id}.png`" height="30" width="120"></v-img>
          </div>
          <div class="damage-td">{{ row.ship.data.hp }}</div>
          <div class="damage-td">{{ row.ship.actualArmor }}</div>
          <div class="damage-td grow">{{ row.damage }}</div>
          <div v-if="row.disabledASW" class="damage-td colspan-3 caption">対潜攻撃不可</div>
          <template v-else-if="row.death < 100">
            <div class="damage-td">{{ row.damage ? row.death + "%" : "" }}</div>
            <div class="damage-td">{{ row.damage ? row.taiha + "%" : "" }}</div>
            <div class="damage-td">{{ row.damage ? row.chuha + "%" : "" }}</div>
          </template>
          <div v-else class="damage-td colspan-3 red--text">確殺</div>
        </div>
      </div>
    </div>
    <v-tooltip
      v-model="enabledTooltip"
      color="black"
      bottom
      right
      transition="slide-y-transition"
      :position-x="tooltipX"
      :position-y="tooltipY"
    >
      <item-tooltip v-model="tooltipItem" />
    </v-tooltip>
  </div>
</template>

<style scoped>
.slot-rate-container,
.fire-calc-container {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  padding: 0.5rem;
  display: none;
}
.slot-rate-container.show,
.fire-calc-container.show {
  display: block;
}
@media (min-width: 1000px) {
  .display-toggle {
    display: none;
  }
  .detail-container {
    display: grid;
    grid-template-columns: 0.9fr 1fr;
  }
  .slot-rate-container,
  .fire-calc-container {
    display: block;
  }
}
.parent-id {
  color: rgb(0, 174, 255);
  font-size: 11px;
  height: 11px;
}

.calc-item {
  cursor: pointer;
  display: flex;
  padding: 0.25rem 0.5rem;
  transition: 0.2s;
  border: 1px solid transparent;
}
.no-item {
  cursor: default;
}
.calc-item:not(.no-item):hover {
  box-shadow: inset 0 0 20px rgba(60, 192, 255, 0.2);
  border-color: rgba(60, 192, 255, 0.6);
}
.calc-item.selected,
.calc-item.selected:hover {
  box-shadow: inset 0 0 20px rgba(60, 192, 255, 0.4);
  border-color: rgba(60, 192, 255, 0.6);
}

.slot-area {
  text-align: right;
  width: 24px;
  margin-right: 0.5rem;
}

.item-name {
  align-self: center;
  font-size: 0.8em;
  flex-grow: 1;
  width: 100px;
}
.item-remodel {
  width: 46px;
}
.item-level {
  position: relative;
}
.level-value {
  display: inline-block;
  position: absolute;
  font-size: 0.7em;
  text-align: right;
  font-weight: 600;
  bottom: -4px;
  width: 30px;
  right: 0;
  z-index: 1;
  opacity: 0;
  transition: 0.3s;
  text-shadow: 1px 1px 1px #fff, -1px -1px 1px #fff, -1px 1px 1px #fff, 1px -1px 1px #fff, 1px 0px 1px #fff, -1px -0px 1px #fff,
    0px 1px 1px #fff, 0px -1px 1px #fff;
}
.theme--dark .level-value {
  text-shadow: 1px 1px 1px #000, -1px -1px 1px #000, -1px 1px 1px #000, 1px -1px 1px #000, 1px 0px 1px #000, -1px -0px 1px #000,
    0px 1px 1px #000, 0px -1px 1px #000;
}
.calc-item.selected .level-value,
.calc-item:hover .level-value {
  opacity: 1;
}
.item-simple-status {
  font-size: 0.7em;
  width: 160px;
}
.item-simple-status > div {
  align-self: center;
  white-space: nowrap;
}

.border-window {
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 0.2rem;
  position: relative;
}
.border-window .header-content {
  display: flex;
  position: absolute;
  top: -10px;
}
.border-window .header-content > div {
  background-color: #fff;
}
.theme--dark .border-window .header-content > div {
  background-color: rgb(40, 40, 45);
}
.deep-sea .theme--dark .border-window .header-content > div {
  background-color: rgb(26, 32, 44);
}
.target-item {
  display: flex;
  align-self: center;
  cursor: help;
}

.fire-calc-container .item-name {
  flex-grow: unset;
  width: unset;
}
.form-control {
  width: 100px;
  margin-top: 0.5rem;
  margin-right: 0.25rem;
  align-self: center;
}
.form-control.lg {
  width: 160px;
}

.damage-header {
  background-color: rgba(128, 128, 128, 0.2);
  font-size: 0.75em;
  padding: 0.5rem 0;
  border-top: 1px solid rgba(128, 128, 128, 0.3);
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
}
.damage-tr {
  display: flex;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.damage-td {
  font-size: 0.9em;
  text-align: right;
  width: 12%;
  align-self: center;
}
.damage-td.img {
  width: 120px;
}
.damage-td.grow {
  width: unset;
  flex-grow: 1;
}
.damage-td.colspan-3 {
  text-align: center;
  width: 36%;
}

.damage-tr:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.damage-tr.tr-half-damaged {
  background-color: rgba(255, 255, 10, 0.075);
}
.damage-tr.tr-half-damaged:hover {
  background-color: rgba(255, 255, 10, 0.15);
}
.damage-tr.tr-damaged {
  background-color: rgba(255, 10, 10, 0.075);
}
.damage-tr.tr-damaged:hover {
  background-color: rgba(255, 10, 10, 0.15);
}
.damage-tr.tr-death {
  background-color: rgba(0, 150, 255, 0.075);
}
.damage-tr.tr-death:hover {
  background-color: rgba(0, 150, 255, 0.15);
}
</style>

<script lang="ts">
import Vue from 'vue';
import max from 'lodash/max';
import min from 'lodash/min';
import sum from 'lodash/sum';
import groupBy from 'lodash/groupBy';
import cloneDeep from 'lodash/cloneDeep';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import BarChart, { BarGraphData, LabelCallbackArg } from '@/components/graph/Bar.vue';
import CalcManager from '@/classes/calcManager';
import SaveData from '@/classes/saveData/saveData';
import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import Item from '@/classes/item/item';
import Calculator, { FirePowerCalcArgs, PowerDist, SlotDist } from '@/classes/aerialCombat/powerCalculator';
import CommonCalc from '@/classes/commonCalc';
import { SHIP_TYPE } from '@/classes/const';
import FleetInfo from '@/classes/fleet/fleetInfo';
import BattleInfo from '@/classes/enemy/battleInfo';
import SiteSetting from '@/classes/siteSetting';

const labelCallback = (c: LabelCallbackArg) => `${c.formattedValue} %`;

interface DamageRowData {
  ship: Ship | Enemy;
  damage: string;
  death: number;
  taiha: number;
  chuha: number;
  disabledASW: boolean;
}

export default Vue.extend({
  name: 'PlaneDetailResult',
  components: { BarChart, ItemTooltip },
  props: {
    parent: {
      type: [Ship, Airbase, Enemy],
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    fleetIndex: {
      type: Number,
      default: 0,
    },
  },
  data: () => ({
    dispSlotRate: true,
    calcManager: undefined as undefined | CalcManager,
    selectedIndex: -1,
    selectedItem: new Item(),
    graphData: {
      labels: [''],
      datasets: [
        {
          yAxisID: 'main',
          label: '確率分布',
          data: [0],
          backgroundColor: 'rgba(255, 120, 180, 0.4)',
          datalabels: { display: false, color: '#000' },
        },
        {
          yAxisID: 'sub',
          label: '累積確率',
          data: [0],
          type: 'line',
          fill: false,
          borderColor: 'rgb(54, 162, 255)',
          datalabels: { display: false, color: '#000' },
          lineTension: 0.3,
        },
      ],
    } as BarGraphData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          scaleLabel: { display: true, labelString: '累積確率 [%]' },
          grid: { color: 'rgba(128, 128, 128, 0.4)' },
          title: { display: true, text: '残機数 [機]' },
        },
        main: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          max: 100,
          min: 0,
          grid: { color: 'rgba(255, 128, 128, 0.4)' },
          title: { display: true, text: '確率分布 [%]' },
        },
        sub: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          max: 100,
          min: 0,
          grid: { color: 'rgba(128, 128, 255, 0.4)' },
          title: { display: true, text: '累積確率 [%]' },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: true },
        tooltip: { callbacks: { label: labelCallback } },
      },
    },
    attackerSlot: 18,
    useResult: true,
    calcArgs: {
      isCritical: false,
      isUnion: false,
      criticalBonus: 1,
      contactBonus: 1,
      unionBonus: 1,
      rikuteiBonus: 1,
      specialBonus: 1,
      beforCapBonus: 1,
      afterCapBonus: 1,
      torpedoBonus: 1,
    } as FirePowerCalcArgs,
    contacts: [
      { text: 'なし', value: 1 },
      { text: '120%', value: 1.2 },
      { text: '117%', value: 1.17 },
      { text: '112%', value: 1.12 },
    ],
    ammo: 1,
    ammos: [
      { text: '～50%', value: 1 },
      { text: '～45%', value: 0.9 },
      { text: '～40%', value: 0.8 },
      { text: '～35%', value: 0.7 },
      { text: '～30%', value: 0.6 },
      { text: '～25%', value: 0.5 },
      { text: '～20%', value: 0.4 },
      { text: '～15%', value: 0.3 },
      { text: '～10%', value: 0.2 },
      { text: '～5%', value: 0.1 },
    ],
    rikuteis: [
      { text: 'なし', value: 1 },
      { text: '二式陸偵', value: 1.125 },
      { text: '二式陸偵(熟練)', value: 1.15 },
    ],
    isAirbase: false,
    defenseIndex: 0,
    defenseFleets: [] as { text: string; value: number; ships: Ship[] | Enemy[]; isUnion: boolean }[],
    enabledTooltip: false,
    slotRateTableText: '',
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  mounted() {
    const saveData = this.$store.state.mainSaveData as SaveData;
    const items = this.$store.state.items as ItemMaster[];
    const ships = this.$store.state.ships as ShipMaster[];
    const enemies = this.$store.getters.getEnemies as EnemyMaster[];

    this.calcManager = saveData.loadManagerData(items, ships, enemies);

    this.defenseFleets = [];
    if (this.parent instanceof Enemy) {
      // 防御側セレクトに味方艦隊をセット
      this.defenseFleets = [];
      const { fleets } = this.calcManager.fleetInfo;
      if (this.calcManager.fleetInfo.unionFleet && this.calcManager.fleetInfo.unionFleet.ships.length) {
        const enabledShips = this.calcManager.fleetInfo.unionFleet.ships.filter((v) => !v.isEmpty);
        this.defenseFleets.push({
          text: '連合艦隊',
          value: 0,
          ships: enabledShips,
          isUnion: true,
        });
      }
      for (let i = 0; i < fleets.length - 1; i += 1) {
        const enabledShips = fleets[i].ships.filter((v) => !v.isEmpty);
        this.defenseFleets.push({
          text: `第${i + 1}艦隊`,
          value: this.defenseFleets.length,
          ships: enabledShips,
          isUnion: false,
        });
      }
    } else {
      const { fleets } = this.calcManager.battleInfo;
      // 防御側セレクトに敵艦隊をセット
      for (let i = 0; i < fleets.length; i += 1) {
        const enabledShips = fleets[i].enemies.filter((v) => v.data.id);
        this.defenseFleets.push({
          text: `${i + 1}戦目`,
          value: i,
          ships: enabledShips,
          isUnion: fleets[i].isUnion,
        });
      }

      if (this.parent instanceof Airbase) {
        this.isAirbase = true;
        const target = Math.min(this.parent.battleTarget[1], this.calcManager.battleInfo.fleets.length - 1);
        this.defenseIndex = target;
        // 陸上偵察機初期値設定
        if (this.parent.items.some((v) => v.data.id === 312)) {
          this.calcArgs.rikuteiBonus = 1.15;
        } else if (this.parent.items.some((v) => v.data.id === 311)) {
          this.calcArgs.rikuteiBonus = 1.125;
        }
      } else {
        // 通常艦隊 最終戦闘をセット
        this.defenseIndex = this.calcManager.battleInfo.fleets.length - 1;
        // 表示艦隊を調整
        this.calcManager.fleetInfo = new FleetInfo({ info: this.calcManager.fleetInfo, mainFleetIndex: this.fleetIndex });
        // 熟練度クリティカルボーナス算出
        this.calcArgs.criticalBonus = this.parent.getProfCriticalBonus();
      }
    }

    const fleet = this.defenseFleets[this.defenseIndex];
    this.calcArgs.isUnion = fleet.isUnion;

    // ないとバグる 意味不明！！！！！！！！！！！！！！！
    setTimeout(() => {
      // 最初の攻撃機
      const attackerIndex = this.parent.items.findIndex((v) => v.data.isAttacker);
      if (attackerIndex >= 0) {
        this.selectItem(attackerIndex);
      } else {
        // なければ艦載機
        const index = this.parent.items.findIndex((v) => v.data.isPlane);
        this.selectItem(Math.max(0, index));
      }
    }, 50);
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
  },
  methods: {
    selectItem(index: number) {
      if (index < 0 || this.selectedIndex === index) {
        return;
      }
      this.selectedIndex = index;
      this.setGraphData();
    },
    setGraphData() {
      if (!this.calcManager) {
        return;
      }
      const index = this.selectedIndex;
      let item: Item;
      // この艦載機情報の詳細計算フラグを立て、計算を行う
      if (this.parent instanceof Ship) {
        // 艦隊
        item = this.calcManager.fleetInfo.mainFleet.ships[this.index].items[index];
      } else if (this.parent instanceof Airbase) {
        // 基地
        this.calcManager.airbaseInfo.airbases[this.index].needShootDown = true;
        item = this.calcManager.airbaseInfo.airbases[this.index].items[index];
      } else {
        // 敵
        this.calcManager.mainBattle = this.fleetIndex;
        item = this.calcManager.battleInfo.fleets[this.fleetIndex].enemies[this.index].items[index];
      }

      if (item) {
        item.needRecord = true;
      }

      // 計算実行
      this.calcManager.updateInfo();

      if (item) {
        this.selectedItem = cloneDeep(item);
        // 集計
        const dist = groupBy(item.dist);
        const sumDist = item.dist.length;
        // リセット
        item.dist = [];

        // 確率分布
        const rates: number[] = [];
        // 累積確率
        let sumRate = 0;
        const sumRates: number[] = [];
        const labels: string[] = [];

        Object.keys(dist).forEach((key) => {
          labels.push(`${key}`);
          const rate = dist[key].length / sumDist;
          sumRate += rate;
          rates.push(Math.floor(1000 * rate) / 10);
          sumRates.push(Math.round(100 * sumRate));
        });

        this.slotRateTableText = '';
        for (let i = item.fullSlot; i >= 0; i -= 1) {
          const slot = dist[`${i}`];
          if (slot) {
            this.slotRateTableText += `${i}\t${slot.length / sumDist}\r\n`;
          } else {
            this.slotRateTableText += `${i}\t${0}\r\n`;
          }
        }

        const maxRate = +(max(rates) || 100);
        this.options.scales.main.max = Math.min(Math.floor(10 * Math.ceil(maxRate / 10)), 100);

        this.graphData.labels = labels;
        this.graphData.datasets[0].data = rates;
        this.graphData.datasets[1].data = sumRates;

        this.attackerSlot = item.fullSlot;
      }

      this.calculateFire();
    },
    changeDefenseIndex() {
      const item = this.defenseFleets[this.defenseIndex];
      if (!item) {
        return;
      }
      this.calcArgs.isUnion = item.isUnion;

      if (this.parent instanceof Ship && this.calcManager) {
        // 展開している敵艦隊までの計算に変更
        const saveData = this.$store.state.mainSaveData as SaveData;
        const items = this.$store.state.items as ItemMaster[];
        const ships = this.$store.state.ships as ShipMaster[];
        const enemies = this.$store.getters.getEnemies as EnemyMaster[];
        const baseInfo = saveData.loadManagerData(items, ships, enemies).battleInfo;

        this.calcManager.mainBattle = this.defenseIndex;
        this.calcManager.battleInfo = new BattleInfo({ info: baseInfo, fleets: baseInfo.fleets.slice(0, this.defenseIndex + 1) });
      }
      this.setGraphData();
    },
    calculateFire() {
      const tempDist = this.selectedItem.dist;
      const { attackerTorpedoBonus } = this.selectedItem;
      // 改修値 搭載数変更を適用して再インスタンス化
      this.selectedItem = new Item({ item: this.selectedItem, slot: this.attackerSlot });
      // 雷装ボーナスあれば
      this.selectedItem.attackerTorpedoBonus = attackerTorpedoBonus;
      // 計算結果の分布を引継ぎ
      this.selectedItem.dist = tempDist;

      const item = this.selectedItem;

      // 搭載数分布オブジェクト作成
      const sumDist = this.selectedItem.dist.length;
      const slotDist: SlotDist[] = [];
      const data = groupBy(this.selectedItem.dist);

      if (this.useResult) {
        // 搭載数分布の結果を利用
        Object.keys(data).forEach((key) => {
          slotDist.push({ slot: +key, rate: data[key].length / sumDist });
        });
      } else {
        // 搭載数キメ打ち
        slotDist.push({ slot: item.fullSlot, rate: 1 });
      }
      const maxSlot = +(this.useResult ? max(Object.keys(data)) || 0 : item.fullSlot);
      const minSlot = +(this.useResult ? min(Object.keys(data)) || 0 : item.fullSlot);

      // 引数調整
      this.calcArgs.unionBonus = this.calcArgs.isUnion ? 1.1 : 1;

      const rows = this.defenseShipRows;
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        row.disabledASW = false;
        // 防御艦
        const { ship } = row;
        // 潜水かどうか？
        const isSubmarine = ship.data.type === SHIP_TYPE.SS || ship.data.type === SHIP_TYPE.SSV;
        // 対潜攻撃可能かどうか？
        let enbaleAsw = false;

        // 火力分布
        let powers: PowerDist[] = [];
        if (this.parent instanceof Airbase) {
          // 基地航空隊火力計算
          // 熟練度クリティカルボーナス算出
          this.calcArgs.criticalBonus = item.getProfCriticalBonus();
          powers = Calculator.getAirbaseFirePowers(item, slotDist, ship, this.calcArgs);
          enbaleAsw = item.data.asw >= 7;
        } else if (this.parent instanceof Ship || this.parent instanceof Enemy) {
          // 通常航空戦火力計算
          powers = Calculator.getAerialFirePowers(item, slotDist, ship, this.calcArgs);
        }

        const isEnemy = ship instanceof Enemy;
        const HP = ship instanceof Ship && ship.level > 99 ? ship.data.hp2 : ship.data.hp;

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
          if (!isSubmarine || !enbaleAsw) {
            row.damage = '';
            row.death = 0;
            row.taiha = 0;
            row.chuha = 0;
            continue;
          }
        }
        if (isSubmarine && !enbaleAsw) {
          // 対潜攻撃不可
          row.damage = '';
          row.death = 0;
          row.taiha = 0;
          row.chuha = 0;
          row.disabledASW = true;
          continue;
        } else if (maxDamage === 0) {
          if (maxSlot > 0) {
            // 攻撃機かつ搭載数があるのにダメージ0
            row.damage = '割合';
          } else {
            row.damage = '';
          }
        } else if (minDamage === 0) {
          if (minSlot > 0) {
            // 全滅してないのに0なら割合
            row.damage = `割合 ~ ${maxDamage}`;
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
    },
    bootTooltip(item: Item, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (!item.data.id || setting.disabledItemTooltip) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = e.clientX;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
        this.enabledTooltip = true;
      }, 400);
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
    copySlotRate() {
      const textToCopy = document.getElementById('slot-rate-table-string') as HTMLInputElement;
      textToCopy.classList.remove('d-none');
      textToCopy.select();
      document.execCommand('copy');
      textToCopy.classList.add('d-none');
    },
  },
});
</script>
