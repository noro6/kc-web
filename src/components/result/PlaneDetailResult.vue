<template>
  <div>
    <div class="display-toggle mt-2 mx-2">
      <v-btn-toggle dense v-model="visibleSlotRate" borderless mandatory>
        <v-btn :value="true" :class="{ 'blue darken-2 white--text': visibleSlotRate }" @click.stop="visibleSlotRate = true" block>
          <v-icon>mdi-chart-line</v-icon>
          <span>{{ $t("Result.残機数詳細") }}</span>
        </v-btn>
        <v-btn :value="false" :class="{ 'red darken-2 white--text': !visibleSlotRate }" @click.stop="visibleSlotRate = false" block>
          <v-icon>mdi-fire</v-icon>
          <span>{{ $t("Result.火力計算") }}</span>
        </v-btn>
      </v-btn-toggle>
    </div>
    <div class="detail-container pb-2">
      <div class="slot-rate-container" :class="{ show: visibleSlotRate }">
        <div class="border-window pa-2">
          <div class="header-content">
            <div v-if="!isAirbase && editableParent" class="d-flex px-2 align-center">
              <div>
                <v-img :src="`./img/ship/banner/${editableParent.data.id}.png`" height="30" width="120" />
              </div>
              <div class="px-2">
                <div v-if="editableParent.data.id > 1500" class="parent-id">id {{ editableParent.data.id }}</div>
                <div class="caption">{{ getShipName(editableParent.data) }}</div>
              </div>
            </div>
            <template v-else-if="editableParent">
              <div class="px-2 body-2">{{ $t("Airbase.第x基地航空隊", { number: index + 1 }) }}</div>
              <div class="pl-3 body-2">( {{ $t("Common.半径") }} {{ editableParent.radius }} )</div>
            </template>
          </div>
          <div v-if="editableParent" class="mt-2" :class="{ 'pt-2': editableParent.data }">
            <div v-for="(item, i) in editableParent.items" :key="i" class="item-area">
              <v-btn v-if="!item.data.isPlane" icon small class="mr-3" color="grey" disabled>
                <v-icon small>mdi-minus</v-icon>
              </v-btn>
              <v-btn v-else-if="selectedIndex === i" icon small class="mr-3" color="blue" @click="selectItem(i)">
                <v-icon>mdi-radiobox-marked</v-icon>
              </v-btn>
              <v-btn v-else-if="item.data.isPlane" icon small class="mr-3" color="grey" @click="selectItem(i)">
                <v-icon>mdi-radiobox-blank</v-icon>
              </v-btn>
              <div class="flex-grow-1">
                <v-divider v-if="i === 0" class="item-input-divider" />
                <div @mouseenter="bootTooltip(item, i, $event)" @mouseleave="clearTooltip" @focus="bootTooltip(item, i, $event)" @blur="clearTooltip">
                  <item-input
                    v-model="editableParent.items[i]"
                    :index="i"
                    :item-parent="editableParent"
                    :drag-slot="isAirbase"
                    :handle-show-item-list="showItemList"
                    :max="isAirbase ? item.data.airbaseMaxSlot : 99"
                    :init="isAirbase ? item.data.airbaseMaxSlot : editableParent.data.slots[i]"
                    :handle-drag-start="dummyMethod"
                    :readonly="!isAirbase && !isShip"
                    @input="updateItem"
                  />
                </div>
              </div>
              <template v-if="isEnemy">
                <div class="status-label">
                  <template v-if="item.data.isTorpedoAttacker">
                    <div>{{ $t("Common.雷装") }}</div>
                    <div class="ml-2 font-weight-bold">{{ item.data.torpedo }}</div>
                  </template>
                  <template v-else-if="item.data.isAttacker">
                    <div>{{ $t("Common.爆装") }}</div>
                    <div class="ml-2 font-weight-bold">{{ item.data.bomber }}</div>
                  </template>
                </div>
              </template>
            </div>
          </div>
          <div v-if="isAirbase && editableParent">
            <air-status-result-bar :result="editableParent.resultWave1" :dense="true" class="mt-3" />
            <air-status-result-bar :result="editableParent.resultWave2" :dense="true" class="mt-3" />
          </div>
          <div v-if="isShip && fleetResult">
            <air-status-result-bar :result="fleetResult" class="mt-3" />
          </div>
        </div>
        <div class="bar-area">
          <bar-chart :data="graphData" :options="options" :title-text="$t('Result.残機数分布')" />
        </div>
        <div class="d-flex">
          <textarea class="d-none" id="slot-rate-table-string" v-model="slotRateTableText" aria-label="st" />
          <v-btn class="ml-auto" color="teal" dark small @click="copySlotRate()">
            <v-icon small>mdi-file-table-outline</v-icon>{{ $t("Result.残機数分布をコピー") }}
          </v-btn>
        </div>
      </div>
      <v-card class="fire-calc-container mt-4" :class="{ show: !visibleSlotRate }" v-if="editableParent">
        <airstrike-calculator ref="airstrikeCalculator" :arg-parent="editableParent" :changed-defense-fleet="changeDefenseIndex" />
      </v-card>
    </div>
    <v-dialog v-model="itemListDialog" :width="itemDialogWidth" transition="scroll-x-transition" :fullscreen="isMobile">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeItemList" :handle-change-width="changeWidth" />
    </v-dialog>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <item-tooltip v-model="tooltipItem" :bonus="tooltipBonus" :is-airbase-mode="isAirbase" />
    </v-tooltip>
  </div>
</template>

<style scoped>
.slot-rate-container {
  margin-top: 8px;
  padding: 8px;
  display: none;
}
.fire-calc-container {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  display: none;
}
.slot-rate-container.show,
.fire-calc-container.show {
  display: block;
}
.display-toggle .v-btn-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.item-area {
  display: flex;
  align-items: center;
  position: relative;
}
.status-label {
  position: absolute;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 0.8em;
  right: 8px;
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

body.item-ui-border .item-input-divider {
  display: none !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import max from 'lodash/max';
import groupBy from 'lodash/groupBy';
import cloneDeep from 'lodash/cloneDeep';
import ItemList from '@/components/item/ItemList.vue';
import ItemInput from '@/components/item/ItemInput.vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import AirstrikeCalculator from '@/components/result/AirstrikeCalculator.vue';
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
import BattleInfo from '@/classes/enemy/battleInfo';
import SiteSetting from '@/classes/siteSetting';
import Fleet from '@/classes/fleet/fleet';
import AirCalcResult from '../../classes/airCalcResult';
import FleetInfo from '../../classes/fleet/fleetInfo';

const labelCallback = (c: LabelCallbackArg) => `${c.formattedValue} %`;
export default Vue.extend({
  name: 'PlaneDetailResult',
  components: {
    BarChart,
    AirstrikeCalculator,
    ItemTooltip,
    ItemInput,
    ItemList,
    AirStatusResultBar,
  },
  props: {
    argParent: {
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
    handleChangeItems: {
      type: Function,
    },
  },
  data: () => ({
    visibleSlotRate: true,
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
          scaleLabel: { display: true, labelString: '累積確率' },
          grid: { color: 'rgba(128, 128, 128, 0.4)' },
          title: { display: true, text: '残機数' },
        },
        main: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          max: 100,
          min: 0,
          grid: { color: 'rgba(255, 128, 128, 0.4)' },
          title: { display: true, text: '確率分布' },
        },
        sub: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          max: 100,
          min: 0,
          grid: { color: 'rgba(128, 128, 255, 0.4)' },
          title: { display: true, text: '累積確率' },
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: true },
        tooltip: { callbacks: { label: labelCallback } },
      },
    },
    slotRateTableText: '',
    itemListDialog: false,
    targetDialog: false,
    dialogSlot: -1,
    itemDialogWidth: 1200,
    isMobile: true,
    manager: new CalcManager(),
    editableParent: null as Airbase | Ship | Enemy | null,
    fleetResult: null as AirCalcResult | null,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipBonus: '',
    tooltipX: 0,
    tooltipY: 0,
  }),
  mounted() {
    const saveData = this.$store.state.mainSaveData as SaveData;
    const items = this.$store.state.items as ItemMaster[];
    const ships = this.$store.state.ships as ShipMaster[];
    const enemies = this.$store.getters.getEnemies as EnemyMaster[];
    // 現在展開中のデータから情報を持ってくる もうここでいくら何をしても影響ない
    this.manager = saveData.loadManagerData(items, ships, enemies);
    if (this.isShip) {
      // まずは最終戦闘をターゲットとする(この値はコピーしてきたときに保持していないため)
      this.manager.mainBattle = this.manager.battleInfo.fleets.length - 1;
    }
    this.setEditableParent();

    // ないとバグる 意味不明！！！！！！！！！！！！！！！
    setTimeout(() => {
      if (this.editableParent) {
        // 最初の攻撃機
        const attackerIndex = this.editableParent.items.findIndex((v) => v.data.isAttacker);
        if (attackerIndex >= 0) {
          this.selectItem(attackerIndex);
        } else {
          // なければ艦載機
          const index = this.editableParent.items.findIndex((v) => v.data.isPlane);
          this.selectItem(Math.max(0, index));
        }
      }
    }, 50);
  },
  computed: {
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    isAirbase(): boolean {
      return this.argParent instanceof Airbase;
    },
    isShip(): boolean {
      return this.argParent instanceof Ship;
    },
    isEnemy(): boolean {
      return this.argParent instanceof Enemy;
    },
  },
  methods: {
    setEditableParent() {
      // 表示、編集する親の対象を更新
      if (this.isShip) {
        // 艦隊
        this.editableParent = this.manager.fleetInfo.fleets[this.fleetIndex].ships[this.index];
        this.fleetResult = this.manager.fleetInfo.mainFleet.mainResult;
      } else if (this.isAirbase) {
        // 基地
        this.editableParent = this.manager.airbaseInfo.airbases[this.index];
      } else {
        // 敵
        this.editableParent = this.manager.battleInfo.fleets[this.fleetIndex].enemies[this.index];
      }

      // 更新を通知
      if (this.editableParent && this.handleChangeItems) {
        this.handleChangeItems(this.editableParent.items);
      }
    },
    selectItem(index: number) {
      if (index < 0 || this.selectedIndex === index) {
        return;
      }
      this.selectedIndex = index;
      this.setGraphData();
    },
    setGraphData() {
      const index = this.selectedIndex;
      let item: Item;
      // この艦載機情報の詳細計算フラグを立て、計算を行う
      if (this.isShip) {
        // 艦隊
        item = this.manager.fleetInfo.fleets[this.fleetIndex].ships[this.index].items[index];
      } else if (this.isAirbase) {
        // 基地
        this.manager.airbaseInfo.airbases[this.index].needShootDown = true;
        item = this.manager.airbaseInfo.airbases[this.index].items[index];
      } else {
        // 敵
        this.manager.mainBattle = this.fleetIndex;
        item = this.manager.battleInfo.fleets[this.fleetIndex].enemies[this.index].items[index];
      }

      // ドラッグ完了までは計算を実行しない
      if (document.getElementById('dragging-item')) {
        this.setEditableParent();
        return;
      }

      if (item) {
        item.needRecord = true;
      }

      // 計算実行
      this.manager.updateInfo();

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
        this.options.scales.x.title.text = `${this.$t('Result.残機数')}`;
        this.options.scales.main.title.text = `${this.$t('Result.確率分布')}`;
        this.options.scales.sub.title.text = `${this.$t('Result.累積確率')}`;
        this.graphData.datasets[0].data = rates;
        this.graphData.datasets[1].data = sumRates;
      }

      // 火力計算画面を更新
      const { fullSlot } = this.selectedItem;
      this.setEditableParent();
      setTimeout(() => {
        // 即時実行だと熟練度クリティカル倍率が更新されない => 苦肉の策で一瞬ディレイをかける
        (this.$refs.airstrikeCalculator as InstanceType<typeof AirstrikeCalculator>).calculateFire(this.selectedItem, fullSlot);
      }, 10);
    },
    changeDefenseIndex(index: number) {
      // 火力計算画面より、防御艦隊を変更した際のイベント
      if (this.isShip) {
        const saveData = this.$store.state.mainSaveData as SaveData;
        const items = this.$store.state.items as ItemMaster[];
        const ships = this.$store.state.ships as ShipMaster[];
        const enemies = this.$store.getters.getEnemies as EnemyMaster[];
        // 展開している敵艦隊までの計算に変更 => managerの敵艦隊データをまるっと置き換えるため、いったんセーブデータの方から引き直す
        const baseInfo = saveData.loadManagerData(items, ships, enemies).battleInfo;

        this.manager.mainBattle = index;
        this.manager.battleInfo = new BattleInfo({ info: baseInfo, fleets: baseInfo.fleets.slice(0, index + 1) });
      }
      this.setGraphData();
    },
    copySlotRate() {
      const textToCopy = document.getElementById('slot-rate-table-string') as HTMLInputElement;
      textToCopy.classList.remove('d-none');
      textToCopy.select();
      document.execCommand('copy');
      textToCopy.classList.add('d-none');
    },
    getShipName(ship: ShipMaster | EnemyMaster) {
      if (this.needTrans && ship instanceof ShipMaster) {
        const shipName = ShipMaster.getSuffix(ship);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      if (this.needTrans && ship.name) {
        const shipName = EnemyMaster.getSuffix(ship.name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return ship.name || '';
    },
    async showItemList(slot: number) {
      this.dialogSlot = slot;

      // 現在計算中のデータから、使用装備を抽出
      let allItems: Item[] = [];
      // 艦隊データから装備全取得
      for (let i = 0; i < this.manager.fleetInfo.fleets.length; i += 1) {
        const { ships } = this.manager.fleetInfo.fleets[i];
        for (let j = 0; j < ships.length; j += 1) {
          allItems = allItems.concat(ships[j].items.filter((v) => v.data.id > 0));
          if (ships[j].exItem.data.id > 0) allItems.push(ships[j].exItem);
        }
      }
      // 基地航空隊データから装備全取得
      const { airbases } = this.manager.airbaseInfo;
      for (let i = 0; i < airbases.length; i += 1) {
        allItems = allItems.concat(airbases[i].items.filter((v) => v.data.id > 0));
      }

      const usedItems = allItems;

      if (this.isAirbase) {
        const original = this.manager.airbaseInfo.airbases[this.index];
        this.isMobile = window.innerWidth < 600;
        await (this.itemListDialog = true);
        (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(original, slot, usedItems);
      } else if (this.isShip) {
        const original = this.manager.fleetInfo.fleets[this.fleetIndex].ships[this.index];
        this.isMobile = window.innerWidth < 600;
        await (this.itemListDialog = true);
        (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(original, slot, usedItems);
      }
    },
    equipItem(item: Item) {
      const slot = this.dialogSlot;
      const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
      if (this.isAirbase) {
        const original = this.manager.airbaseInfo.airbases[this.index];
        this.manager.airbaseInfo.airbases[this.index] = original.putItem(item, slot, initialLevels);
      } else if (this.isShip) {
        const original = this.manager.fleetInfo.fleets[this.fleetIndex].ships[this.index];
        this.manager.fleetInfo.fleets[this.fleetIndex].ships[this.index] = original.putItem(item, slot, initialLevels);
        this.manager.fleetInfo.fleets[this.fleetIndex] = new Fleet({ fleet: this.manager.fleetInfo.fleets[this.fleetIndex] });
        this.manager.fleetInfo = new FleetInfo({ info: this.manager.fleetInfo, fleets: this.manager.fleetInfo.fleets });
      }

      this.itemListDialog = false;
      this.setGraphData();
    },
    updateItem() {
      if (this.isAirbase) {
        const original = this.manager.airbaseInfo.airbases[this.index];
        this.manager.airbaseInfo.airbases[this.index] = new Airbase({ airbase: original });
      } else if (this.isShip) {
        const original = this.manager.fleetInfo.fleets[this.fleetIndex].ships[this.index];
        this.manager.fleetInfo.fleets[this.fleetIndex].ships[this.index] = new Ship({ ship: original });
        this.manager.fleetInfo.fleets[this.fleetIndex] = new Fleet({ fleet: this.manager.fleetInfo.fleets[this.fleetIndex] });
        this.manager.fleetInfo = new FleetInfo({ info: this.manager.fleetInfo, fleets: this.manager.fleetInfo.fleets });
      }
      this.setGraphData();
    },
    closeItemList() {
      this.itemListDialog = false;
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
    dummyMethod() {
      //
    },
    bootTooltip(item: Item, index: number, e: MouseEvent | FocusEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (!item.data.id || setting.disabledItemTooltip || this.isMobile || window.innerWidth < 600) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width / 3;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
        this.enabledTooltip = true;

        if (this.argParent instanceof Ship) {
          this.tooltipBonus = JSON.stringify(this.argParent.getItemBonusDiff(index));
        } else {
          this.tooltipBonus = '';
        }
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
