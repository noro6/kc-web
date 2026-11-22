<template>
  <div class="asw-calc">
    <div class="asw-main">
      <div class="asw-side">
      <ship-input
        v-model="fleet.ships[0]"
        :index="0"
        :handle-show-ship-list="showShipList"
        :handle-show-item-list="showItemList"
        :handle-show-batch-item-list="showBatchItemList"
        :handle-close-ship="removeShip"
        :handle-show-item-preset="showItemPreset"
        :fix-down="ship.fixDown"
        :rate-down="ship.rateDown"
        :fleet-ros-corr="fleet.fleetRosCorr"
        :hide-active-button="true"
        @input="updateShip"
      />
      <div class="asw-board">
        <div class="asw-total" :title="$t('Extra.対潜内訳表示')">
          <div class="asw-total-label">{{ $t("Extra.表示対潜") }}</div>
          <div class="asw-total-value">{{ ship.displayStatus.asw }}</div>
        </div>
        <div
          class="asw-scale"
          :class="{
            'has-line': oaswGate.value,
            'is-over': oaswGate.mode === 'value' && oaswGate.open && oaswMargin >= 0,
            'is-short': oaswGate.mode === 'value' && oaswMargin < 0,
            'is-blocked': oaswGate.mode === 'value' && !oaswGate.open,
          }"
        >
          <div class="asw-stack">
            <i class="seg sw-base" :style="{ width: partWidth(baseAsw) }" />
            <i class="seg sw-imp" :style="{ width: partWidth(improveAsw) }" />
            <i class="seg sw-item" :style="{ width: partWidth(ship.itemAsw) }" />
            <i class="seg sw-bonus" :style="{ width: partWidth(ship.itemBonusStatus.asw) }" />
          </div>
          <div v-if="oaswGate.value" class="oasw-mark">
            <span>{{ oaswGate.value }}</span>
          </div>
        </div>
        <p v-if="oaswLead || oaswGear" class="oasw-state" :class="{ 'is-met': oaswMet }">
          <span v-if="oaswLead">{{ oaswLead }}</span>
          <span v-if="oaswGear" class="oasw-gear">{{ oaswGear }}</span>
        </p>
        <div class="asw-parts">
          <div class="asw-part" :title="$t('Extra.対潜内訳素')">
            <i class="swatch sw-base" />
            <span>{{ $t("Extra.素対潜") }}</span>
            <span class="part-num">{{ baseAsw }}</span>
          </div>
          <div class="asw-part" :title="$t('Extra.対潜内訳改修')">
            <i class="swatch sw-imp" />
            <span>{{ $t("Database.対潜改修") }}</span>
            <span class="part-num">{{ improveAsw }}</span>
          </div>
          <div class="asw-part" :title="$t('Extra.対潜内訳装備')">
            <i class="swatch sw-item" />
            <span>{{ $t("Extra.装備対潜合計") }}</span>
            <span class="part-num">{{ ship.itemAsw }}</span>
          </div>
          <div class="asw-part" :title="$t('Extra.対潜内訳ボーナス')">
            <i class="swatch sw-bonus" />
            <span>{{ $t("Extra.装備ボーナス合計") }}</span>
            <span class="part-num">{{ ship.itemBonusStatus.asw }}</span>
          </div>
        </div>
        <div class="asw-edit">
          <v-text-field
            class="asw-field"
            label="Lv"
            v-model.number="level"
            :max="maxLevel"
            min="1"
            type="number"
            outlined
            dense
            hide-details
            :disabled="ship.isEmpty"
            @input="statusChanged"
          />
          <v-text-field
            class="asw-field"
            :label="$t('Database.対潜改修')"
            v-model.number="improveAsw"
            max="9"
            min="0"
            type="number"
            outlined
            dense
            hide-details
            :disabled="ship.isEmpty"
            @input="statusChanged"
          />
        </div>
      </div>
      </div>
      <section class="asw-targets">
      <div class="target-head">
        <span>{{ $t("Extra.目標対潜値") }}</span>
        <span>{{ $t("Extra.表示対潜") }}</span>
        <span class="num">{{ $t("Fleet.不足対潜値") }}</span>
        <span class="num">{{ $t("Fleet.必要艦娘Lv") }}</span>
        <span class="num">{{ $t("Extra.必要Exp") }}</span>
      </div>
      <div
        v-for="(result, i) in results"
        :key="`result_${i}`"
        class="target-row"
        :class="{ 'is-met': isMet(result), 'is-over': isOver(result), 'is-empty': result.targetAsw <= 0 }"
      >
        <v-text-field
          class="target-field"
          v-model.number="result.targetAsw"
          dense
          outlined
          hide-details
          min="0"
          max="200"
          type="number"
          @input="calculate"
        />
        <div class="target-meter">
          <i v-if="result.targetAsw > 0" :style="{ width: aswMeter(result.targetAsw) }" />
        </div>
        <span class="num">
          <span class="cell-label">{{ $t("Fleet.不足対潜値") }}</span>
          <span>{{ missingText(result) }}</span>
        </span>
        <span class="num">
          <span class="cell-label">{{ $t("Fleet.必要艦娘Lv") }}</span>
          <span>{{ levelText(result) }}</span>
        </span>
        <span class="num">
          <span class="cell-label">{{ $t("Extra.必要Exp") }}</span>
          <span>{{ expText(result) }}</span>
        </span>
      </div>
    </section>
    </div>
    <section v-if="ship && ship.data.id" class="asw-levels">
      <p class="level-note">{{ $t("Extra.成長表の見方") }}</p>
      <v-simple-table dense fixed-header height="52vh" class="level-table text-right">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-right">Lv</th>
              <th class="text-right">{{ $t("Extra.必要Exp") }}</th>
              <th class="text-right">{{ $t("Common.対潜") }}</th>
              <th class="text-right">{{ $t("Common.索敵") }}</th>
              <th class="text-right">{{ $t("Common.回避") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in maxLevel"
              :key="`all_level_${row}`"
              class="level-status-list"
              :class="{ 'is-current': rowLevel(row) === level, 'is-goal': goalLevels.indexOf(rowLevel(row)) >= 0 }"
            >
              <td class="level-td">{{ rowLevel(row) }}</td>
              <td class="level-td">{{ expResults[row - 1].toLocaleString() }}</td>
              <td :class="{ increase: aswResults[row] && aswResults[row - 1] - aswResults[row] }">{{ aswResults[row - 1] }}</td>
              <td :class="{ increase: scoutResults[row] && scoutResults[row - 1] - scoutResults[row] }">{{ scoutResults[row - 1] }}</td>
              <td :class="{ increase: avoidResults[row] && avoidResults[row - 1] - avoidResults[row] }">{{ avoidResults[row - 1] }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </section>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth" :fullscreen="isMobile">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
    <v-dialog v-model="itemListDialog" transition="scroll-x-transition" @input="toggleItemListDialog" :width="itemDialogWidth" :fullscreen="isMobile">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeDialog" :handle-change-width="changeWidth" />
    </v-dialog>
    <v-dialog v-model="itemPresetDialog" transition="scroll-x-transition" width="600" :fullscreen="isMobile">
      <item-preset-component v-if="itemPresetDialog" v-model="tempShip" :handle-expand-item-preset="expandItemPreset" :handle-close="closeDialog" />
    </v-dialog>
  </div>
</template>

<style scoped>
.asw-calc {
  --accent: #3b82f6;
  --met: #22c55e;
  --surface: #fbfaf8;
  --surface-2: #f1efeb;
}
.theme--dark .asw-calc {
  --surface: rgb(32, 33, 40);
  --surface-2: rgb(42, 44, 52);
}
.deep-sea .theme--dark .asw-calc {
  --surface: rgb(16, 28, 48);
  --surface-2: rgb(24, 40, 64);
}
.asw-main,
.asw-side {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  min-width: 0;
}
@media (min-width: 960px) {
  .asw-main {
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  }
}
.asw-board,
.asw-targets,
.asw-levels {
  min-width: 0;
  padding: 12px 14px;
  background: var(--surface);
  border: 1px solid rgba(128, 128, 128, 0.22);
  border-radius: 16px;
}
.asw-targets {
  overflow-x: auto;
}
.asw-total {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.asw-total-label {
  font-size: 13px;
  opacity: 0.72;
}
.asw-total-value {
  font-size: 28px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.asw-scale {
  position: relative;
  height: 8px;
  margin-top: 18px;
  border-radius: 3px;
  background: rgba(128, 128, 128, 0.16);
}
.asw-scale.has-line {
  background: linear-gradient(90deg, rgba(128, 128, 128, 0.16) 0 90%, rgba(245, 158, 11, 0.34) 90% 100%);
}
.asw-scale.has-line.is-over {
  background: linear-gradient(90deg, rgba(128, 128, 128, 0.16) 0 90%, rgba(34, 197, 94, 0.34) 90% 100%);
}
.asw-stack {
  display: flex;
  height: 100%;
  overflow: hidden;
  border-radius: 3px;
}
.asw-stack .seg {
  display: block;
  flex: none;
  height: 100%;
}
.oasw-mark {
  position: absolute;
  z-index: 1;
  left: 90%;
  top: -4px;
  bottom: -4px;
  width: 2px;
  margin-left: -1px;
  background: #f59e0b;
}
.oasw-mark span {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.asw-scale.is-over .oasw-mark {
  background: #22c55e;
}
.oasw-state {
  display: flex;
  flex-wrap: wrap;
  gap: 0 8px;
  margin: 6px 0 0;
  font-size: 13px;
}
.oasw-state.is-met {
  color: #15803d;
  opacity: 1;
}
.theme--dark .oasw-state.is-met {
  color: #86efac;
}
.oasw-gear {
  color: #c24141;
}
.theme--dark .oasw-gear {
  color: #ff6b6b;
}
.sw-base {
  background: #3b82f6;
}
.sw-imp {
  background: #91ffff;
}
.sw-item {
  background: #14b8a6;
}
.sw-bonus {
  background: #a78bfa;
}
.asw-parts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
  margin-top: 12px;
}
.asw-part {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 12px;
}
.asw-part span:nth-child(2) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.72;
}
.swatch {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.part-num {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
.asw-edit {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}
.asw-field {
  margin-top: 0;
}
.asw-levels {
  margin-top: 12px;
}
.target-head,
.target-row {
  display: grid;
  grid-template-columns: 88px minmax(0, 1.6fr) 5.6em 6.6em 6.4em;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.target-head {
  margin-bottom: 4px;
  line-height: 1.35;
  opacity: 0.62;
}
.target-head span {
  white-space: nowrap;
}
.cell-label {
  display: none;
}
.target-row {
  min-height: 40px;
  padding: 2px 0;
  border-top: 1px solid rgba(128, 128, 128, 0.16);
}
.target-row.is-met .num:nth-of-type(1) {
  color: #15803d;
}
.theme--dark .target-row.is-met .num:nth-of-type(1) {
  color: #86efac;
}
.target-row.is-over .num {
  color: #dc2626;
}
.theme--dark .target-row.is-over .num {
  color: #fca5a5;
}
.target-row.is-empty {
  opacity: 0.72;
}
.target-field {
  margin-top: 0;
}
.target-meter {
  height: 4px;
  border-radius: 2px;
  background: rgba(128, 128, 128, 0.16);
}
.target-meter i {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: color-mix(in srgb, var(--accent) 70%, transparent);
}
.target-row.is-met .target-meter i {
  background: var(--met);
}
.target-row.is-over .target-meter i {
  background: color-mix(in srgb, #ef4444 78%, transparent);
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}
@media (max-width: 720px) {
  .target-head {
    display: none;
  }
  .target-row {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1.15fr);
    grid-template-areas:
      "field meter meter"
      "missing level exp";
    gap: 6px 10px;
    align-items: end;
    padding: 8px 0;
  }
  .target-field {
    grid-area: field;
    min-width: 0;
  }
  .target-meter {
    grid-area: meter;
    align-self: center;
  }
  .target-row > .num:nth-of-type(1) {
    grid-area: missing;
  }
  .target-row > .num:nth-of-type(2) {
    grid-area: level;
  }
  .target-row > .num:nth-of-type(3) {
    grid-area: exp;
  }
  .target-row > .num {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 0;
    gap: 2px;
  }
  .cell-label {
    display: block;
    max-width: 100%;
    font-size: 10px;
    font-weight: 400;
    line-height: 1.3;
    text-align: right;
    white-space: normal;
    opacity: 0.62;
  }
}
.level-note {
  margin: 0 0 8px;
  font-size: 12px;
  opacity: 0.68;
}
.level-table >>> th,
.level-table >>> td {
  white-space: nowrap;
}
.level-status-list td {
  opacity: 0.45;
}
.level-status-list td.level-td,
.level-status-list td.increase,
.level-status-list.is-current td,
.level-status-list.is-goal td {
  opacity: 1;
}
.level-status-list td.increase {
  color: #0f766e;
}
.theme--dark .level-status-list td.increase {
  color: #5eead4;
}
.level-status-list.is-current td {
  background: color-mix(in srgb, var(--accent) 16%, var(--surface));
}
.level-status-list.is-goal td.level-td {
  color: #b45309;
}
.theme--dark .level-status-list.is-goal td.level-td {
  color: #fdba74;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipInput from '@/components/fleet/ShipInput.vue';
import ShipList, { ViewShip } from '@/components/fleet/ShipList.vue';
import ItemList from '@/components/item/ItemList.vue';
import ItemPresetComponent from '@/components/item/ItemPreset.vue';
import Ship from '@/classes/fleet/ship';
import Fleet from '@/classes/fleet/fleet';
import Item from '@/classes/item/item';
import SiteSetting from '@/classes/siteSetting';
import Const, { SHIP_TYPE } from '@/classes/const';
import ShipValidation from '@/classes/fleet/shipValidation';
import ItemPreset from '@/classes/item/itemPreset';
import ItemMaster from '@/classes/item/itemMaster';
import { cloneDeep } from 'lodash';

interface OpeningAswGate {
  value: number | null;
  open: boolean;
  mode: 'always' | 'value' | 'gear' | 'none';
}

function openingAswGate(ship: Ship): OpeningAswGate {
  const { data } = ship;
  if (!data.id) return { value: null, open: false, mode: 'none' };
  if (data.minAsw >= 50 && !data.isCV && !data.isBB) {
    return { value: null, open: true, mode: 'always' };
  }

  const items = ship.items.concat(ship.exItem);
  const hasSonar = items.some((v) => v.data.apiTypeId === 14 || v.data.apiTypeId === 40);
  const { type } = data;

  if (type === SHIP_TYPE.DE) {
    const lines: number[] = [];
    if (ship.itemAsw >= 4) lines.push(75);
    if (hasSonar) lines.push(60);
    if (lines.length) return { value: Math.min(...lines), open: true, mode: 'value' };
    return { value: null, open: false, mode: 'gear' };
  }

  if (data.id === 717) {
    const hasAttacker = items.some((v) => v.data.isAttacker);
    const hasAswAttack = items.some((v) => (v.data.isAttacker && v.data.asw >= 1) || v.data.isAswPlane);
    if (hasAttacker && hasSonar && hasAswAttack) return { value: 100, open: true, mode: 'value' };
    if (!hasAttacker && hasSonar) return { value: 100, open: true, mode: 'value' };
    return { value: 100, open: false, mode: 'value' };
  }

  if (
    type === SHIP_TYPE.DD
    || type === SHIP_TYPE.CL
    || type === SHIP_TYPE.CLT
    || type === SHIP_TYPE.CT
    || type === SHIP_TYPE.AO
    || type === SHIP_TYPE.AO_2
  ) {
    return { value: 100, open: hasSonar, mode: 'value' };
  }

  if ((data.type2 === 76 && data.name.indexOf('改') >= 0) || data.id === 646) {
    return { value: null, open: ship.enabledTSBK, mode: 'gear' };
  }

  if (type === SHIP_TYPE.CVL) {
    if (data.id === 508 || data.id === 509) return { value: null, open: false, mode: 'none' };
    const hasAswPlane = items.some((v) => v.fullSlot && v.data.isAswPlane);
    const hasEmptyAswPlane = items.some((v) => v.fullSlot === 0 && v.data.isAswPlane);
    const hasAswAttacker = items.some((v) => v.data.isAttacker && v.data.asw >= 1);
    const hasStrongAttacker = items.some((v) => v.data.apiTypeId === 8 && v.data.asw >= 7);
    const hasLoadedAttacker = items.some((v) => v.data.isAttacker && v.data.asw && v.fullSlot);
    const planeRoute = hasAswPlane || hasStrongAttacker || (hasEmptyAswPlane && hasLoadedAttacker);
    const lines: number[] = [];
    if (hasSonar && (hasAswPlane || hasAswAttacker)) lines.push(100);
    if (planeRoute) lines.push(65);
    if (hasSonar && planeRoute) lines.push(50);
    if (lines.length) return { value: Math.min(...lines), open: true, mode: 'value' };
    return { value: null, open: false, mode: 'gear' };
  }

  if (data.id === 554) return { value: null, open: ship.enabledTSBK, mode: 'gear' };

  if (data.id === 411 || data.id === 412) {
    const ready = hasSonar && items.some((v) => v.data.apiTypeId === 11 || v.data.apiTypeId === 15 || v.data.isAswPlane);
    return { value: 100, open: ready, mode: 'value' };
  }

  if (type === SHIP_TYPE.BBV || type === SHIP_TYPE.LHA) {
    const ready = hasSonar && items.some((v) => (v.data.isAttacker && v.data.asw >= 1) || v.data.isAswPlane);
    return { value: 100, open: ready, mode: 'value' };
  }

  return { value: null, open: false, mode: 'none' };
}

export default Vue.extend({
  name: 'RequiredAswCalculator',
  components: {
    ShipInput,
    ShipList,
    ItemList,
    ItemPresetComponent,
  },
  data: () => ({
    fleet: new Fleet(),
    shipListDialog: false,
    itemListDialog: false,
    itemDialogTargetIndex: 0,
    itemDialogWidth: 1200,
    shipDialogWidth: 1200,
    itemPresetDialog: false,
    tempShip: undefined as undefined | Ship,
    tempShipListDialog: false,
    tempShipList: [] as Ship[],
    level: 1,
    improveAsw: 0,
    minAsw: 0,
    maxAsw: 0,
    results: [] as { targetAsw: number; missingAsw: number; requiredLevel: number; requiredExp: number }[],
    maxLevel: Const.MAX_LEVEL,
    aswResults: [] as number[],
    scoutResults: [] as number[],
    avoidResults: [] as number[],
    expResults: [] as number[],
    isMobile: true,
  }),
  mounted() {
    const setting = this.$store.state.siteSetting as SiteSetting;

    for (let i = 0; i < 10; i += 1) {
      this.results.push({
        targetAsw: 0,
        missingAsw: 0,
        requiredLevel: 0,
        requiredExp: 0,
      });

      if (i < setting.requiredAswTargets.length) {
        this.results[i].targetAsw = setting.requiredAswTargets[i];
      }
    }

    if (!setting.requiredAswTargets.length) {
      this.results[0].targetAsw = 100;
      this.results[1].targetAsw = 85;
      this.results[2].targetAsw = 70;
      this.results[3].targetAsw = 65;
      this.results[4].targetAsw = 60;
      this.results[5].targetAsw = 50;
    }
  },
  computed: {
    ship(): Ship {
      return this.fleet.ships[0];
    },
    baseAsw(): number {
      return this.ship.asw - this.improveAsw;
    },
    goalLevels(): number[] {
      return this.results
        .filter((result) => result.targetAsw > 0 && result.requiredLevel > 0 && result.requiredLevel <= this.maxLevel)
        .map((result) => result.requiredLevel);
    },
    oaswGate(): OpeningAswGate {
      return openingAswGate(this.ship);
    },
    oaswScale(): number {
      const gate = this.oaswGate;
      if (gate.mode === 'value' && gate.value) return gate.value / 0.9;
      return Math.max(this.ship.displayStatus.asw, 1);
    },
    oaswMargin(): number {
      if (!this.oaswGate.value) return 0;
      return this.ship.displayStatus.asw - this.oaswGate.value;
    },
    oaswLead(): string {
      const gate = this.oaswGate;
      const text = (key: string) => `${this.$t(key)}`;
      if (!this.ship.data.id) return '';
      if (gate.mode === 'always') return text('Extra.無条件で先制対潜');
      if (gate.mode === 'gear') return gate.open ? text('Extra.装備で先制対潜可') : '';
      if (gate.mode === 'none' || !gate.value) return text('Extra.先制対潜の対象外');
      if (!gate.open) {
        if (this.oaswMargin < 0) return `${this.$t('Extra.対潜不足', { asw: -this.oaswMargin })}`;
        return '';
      }
      if (this.oaswMargin > 0) return `${text('Extra.対潜余裕')} +${this.oaswMargin}`;
      if (this.oaswMargin < 0) return `${this.$t('Extra.対潜不足', { asw: -this.oaswMargin })}`;
      return text('Extra.達成');
    },
    oaswGear(): string {
      const gate = this.oaswGate;
      if ((gate.mode === 'gear' || gate.mode === 'value') && !gate.open) return `${this.$t('Extra.装備条件が未達')}`;
      return '';
    },
    oaswMet(): boolean {
      const gate = this.oaswGate;
      if (gate.mode === 'always') return true;
      if (gate.mode === 'gear') return gate.open;
      return gate.mode === 'value' && !!gate.open && this.oaswMargin >= 0;
    },
  },
  watch: {
    fleet() {
      if (this.ship.isEmpty) {
        this.level = 1;
        this.improveAsw = 0;
        this.minAsw = 0;
        this.maxAsw = 0;
      }
      this.calculate();
    },
  },
  methods: {
    statusChanged() {
      const asw = Ship.getStatusFromLevel(this.level, this.ship.data.maxAsw, this.ship.data.minAsw);
      this.level = Math.max(Math.min(this.maxLevel, this.level), 1);
      this.fleet = new Fleet({ ships: [new Ship({ ship: this.fleet.ships[0], level: this.level, asw: asw + this.improveAsw })] });
    },
    updateShip() {
      this.fleet = new Fleet({ ships: [new Ship({ ship: this.fleet.ships[0] })] });
      this.level = this.ship.level;
      this.improveAsw = this.ship.improveAsw;
      this.minAsw = this.ship.data.minAsw;
      this.maxAsw = this.ship.data.maxAsw;
    },
    async showShipList() {
      this.isMobile = window.innerWidth < 600;
      await (this.shipListDialog = true);
      (this.$refs.shipList as InstanceType<typeof ShipList>).initialize(false);
    },
    async showItemList(x: number, slotIndex: number) {
      this.itemDialogTargetIndex = slotIndex;
      this.isMobile = window.innerWidth < 600;
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(this.ship, slotIndex, this.ship.items);
    },
    async showBatchItemList(x: number) {
      this.itemDialogTargetIndex = x;
      this.isMobile = window.innerWidth < 600;
      await (this.itemListDialog = true);
      // 一括モードで起動(第四引数 補強増設の分+1)
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(this.ship, 0, [], this.ship.data.slotCount + 1);
    },
    closeDialog() {
      this.itemListDialog = false;
      this.shipListDialog = false;
      this.itemPresetDialog = false;
      this.toggleItemListDialog();
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
    changeShipWidth(width: number) {
      this.shipDialogWidth = width;
    },
    putShip(viewShip: ViewShip) {
      const { ship } = viewShip;
      this.shipListDialog = false;
      // もともとここに配備されていた艦娘の装備情報を抜き取る
      const oldShip = this.ship;
      const oldItems: Item[] = oldShip.items.concat();
      const newItems: Item[] = [];
      const slots = viewShip.slots.length ? viewShip.slots : ship.slots;

      for (let slotIndex = 0; slotIndex < ship.slotCount; slotIndex += 1) {
        const slot = slots[slotIndex] > 0 ? slots[slotIndex] : 0;
        if (slotIndex < oldItems.length) {
          const oldItem = oldItems[slotIndex];
          const itemMaster = oldItem.data;
          if (ShipValidation.isValidItem(ship, itemMaster, slotIndex)) {
            // マスタ情報があり、装備条件を満たしている場合は装備引継ぎOK！
            newItems.push(new Item({ item: oldItem, slot }));
          } else {
            // マスタ情報なし or 装備条件を満たさなかった装備は搭載数だけセット
            newItems.push(new Item({ slot }));
          }
        } else {
          // スロット数があっていない場合も空の装備で搭載数だけセット
          newItems.push(new Item({ slot }));
        }
      }

      // 補強増設チェック
      const oldExItem = oldShip.exItem.data;
      let exItem;
      if (oldExItem.id && ShipValidation.isValidItem(ship, oldExItem, Const.EXPAND_SLOT_INDEX, oldShip.exItem.remodel)) {
        exItem = new Item({ master: oldExItem, remodel: oldShip.exItem.remodel });
      } else {
        exItem = new Item();
      }

      // 元々いた艦娘を置き換える
      const newShip = new Ship({
        master: ship,
        slots,
        items: newItems,
        exItem,
        isActive: oldShip.isActive,
        hp: viewShip.hp,
        level: viewShip.level,
        luck: viewShip.luck,
        asw: viewShip.asw + Ship.getStatusFromLevel(viewShip.level, ship.maxAsw, ship.minAsw),
        area: viewShip.area,
      });

      this.fleet = new Fleet({ ships: [newShip] });
      this.level = newShip.level;
      this.improveAsw = newShip.improveAsw;
      this.minAsw = newShip.data.minAsw;
      this.maxAsw = newShip.data.maxAsw;
    },
    equipItem(item: Item) {
      this.itemListDialog = false;
      const slotIndex = this.itemDialogTargetIndex;
      const { ship } = this;
      const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
      const newShip = ship.putItem(item, slotIndex, initialLevels);
      this.fleet = new Fleet({ ships: [newShip] });
    },
    toggleItemListDialog() {
      // 装備一覧が閉じられたとき
      if (!this.itemListDialog) {
        // 一括モードかチェック
        const dialog = this.$refs.itemList as InstanceType<typeof ItemList>;
        let ship = new Ship({ ship: this.ship });

        if (dialog && dialog.isBatchMode && dialog.batchList.length) {
          // 一括編成モードで何らかの選択があったと判定されたため、上書き展開
          const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;

          for (let slot = 0; slot < ship.items.length; slot += 1) {
            const item = dialog.batchList[slot];
            if (item && item.item.data.id && ShipValidation.isValidItem(ship.data, item.item.data, slot)) {
              ship = ship.putItem(item.item, slot, initialLevels);
            } else {
              ship = ship.putItem(new Item(), slot, initialLevels);
            }
          }

          // 補強増設ある？
          const exItem = dialog.batchList[ship.data.slotCount];
          if (exItem && ShipValidation.isValidItem(ship.data, exItem.item.data, Const.EXPAND_SLOT_INDEX, exItem.item.remodel)) {
            ship = ship.putItem(dialog.batchList[ship.data.slotCount].item, Const.EXPAND_SLOT_INDEX, initialLevels);
          } else {
            ship = ship.putItem(new Item(), Const.EXPAND_SLOT_INDEX, initialLevels);
          }

          dialog.isBatchMode = false;
          dialog.batchList = [];

          this.fleet = new Fleet({ ships: [ship] });
        }
      }
    },
    removeShip() {
      this.fleet = new Fleet();
    },
    showItemPreset() {
      this.tempShip = cloneDeep(this.ship);
      this.isMobile = window.innerWidth < 600;
      this.itemPresetDialog = true;
    },
    expandItemPreset(preset: ItemPreset) {
      const itemMasters = this.$store.state.items as ItemMaster[];
      const items: Item[] = [];
      for (let i = 0; i < preset.items.length; i += 1) {
        const item = itemMasters.find((v) => v.id === preset.items[i].id);
        if (item) {
          items.push(new Item({ master: item, remodel: preset.items[i].remodel }));
        } else {
          items.push(new Item());
        }
      }

      // もともとここに配備されていた艦娘の装備情報を抜き取る
      const oldShip = this.ship;
      const ship = oldShip.data;
      const newItems = oldShip.items.concat();

      for (let slotIndex = 0; slotIndex < newItems.length; slotIndex += 1) {
        if (slotIndex < items.length) {
          const newItem = items[slotIndex];
          if (newItem && ShipValidation.isValidItem(ship, newItem.data, slotIndex)) {
            // マスタ情報があり、装備条件を満たしている場合は装備引継ぎOK！
            // 初期熟練度設定
            const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
            let level = 0;
            if (initialLevels) {
              // 設定情報より初期熟練度を解決
              const initData = initialLevels.find((v) => v.id === newItem.data.apiTypeId);
              if (initData) {
                level = initData.level;
              }
            }

            if (newItem.data.id === 138 && ship.type2 === 90) {
              // 日進 & 二式大艇
              newItems[slotIndex] = new Item({
                master: newItem.data,
                item: newItems[slotIndex],
                level,
                remodel: newItem.remodel,
                slot: 1,
              });
            } else {
              newItems[slotIndex] = new Item({
                master: newItem.data,
                item: newItems[slotIndex],
                level,
                remodel: newItem.remodel,
              });
            }
          } else {
            // 不適合、外す
            newItems[slotIndex] = new Item();
          }
        }
      }

      // 補強増設チェック
      const presetExItem = itemMasters.find((v) => v.id === preset.exItem.id);
      let exItem;
      if (presetExItem && ShipValidation.isValidItem(ship, presetExItem, Const.EXPAND_SLOT_INDEX, preset.exItem.remodel)) {
        // 搭載可能なら入れ替え
        exItem = new Item({ master: presetExItem, remodel: preset.exItem.remodel });
      }

      // 元々いた艦娘を置き換える
      const newShip = new Ship({ ship: oldShip, items: newItems, exItem });

      this.fleet = new Fleet({ ships: [newShip] });
      this.level = newShip.level;
      this.improveAsw = newShip.improveAsw;
      this.minAsw = newShip.data.minAsw;
      this.maxAsw = newShip.data.maxAsw;
    },
    partWidth(value: number): string {
      const scale = this.oaswScale;
      if (scale <= 0 || value <= 0) return '0%';
      return `${(value / scale) * 100}%`;
    },
    aswMeter(target: number): string {
      if (target <= 0) return '0%';
      return `${Math.min(100, Math.round((this.ship.displayStatus.asw / target) * 100))}%`;
    },
    isMet(result: { targetAsw: number; missingAsw: number }): boolean {
      return result.targetAsw > 0 && !result.missingAsw && !!(this.minAsw || this.maxAsw);
    },
    isOver(result: { targetAsw: number; requiredLevel: number }): boolean {
      if (this.ship.isEmpty || result.targetAsw <= 0) return false;
      if (!(this.minAsw || this.maxAsw)) return true;
      return result.requiredLevel > this.maxLevel;
    },
    missingText(result: { targetAsw: number; missingAsw: number }): string {
      if (this.ship.isEmpty || result.targetAsw <= 0) return '-';
      if (!result.missingAsw) return `${this.$t('Extra.達成')}`;
      return `${result.missingAsw}`;
    },
    levelText(result: { targetAsw: number; requiredLevel: number }): string {
      if (this.ship.isEmpty || result.targetAsw <= 0) return '-';
      if (!(this.minAsw || this.maxAsw)) return `${this.$t('Extra.到達不可')}`;
      if (result.requiredLevel <= 0) return '1';
      return `${result.requiredLevel}`;
    },
    expText(result: { targetAsw: number; requiredLevel: number; requiredExp: number }): string {
      if (this.ship.isEmpty || result.targetAsw <= 0) return '-';
      if (!(this.minAsw || this.maxAsw) || result.requiredLevel > this.maxLevel) return '-';
      return result.requiredExp ? result.requiredExp.toLocaleString() : '0';
    },
    rowLevel(row: number): number {
      return this.maxLevel + 1 - row;
    },
    calculate() {
      const results = this.results.concat();
      for (let index = 0; index < results.length; index += 1) {
        const result = results[index];

        result.targetAsw = Math.max(Math.min(result.targetAsw, 200), 0);
        result.missingAsw = Math.max(result.targetAsw - this.ship.displayStatus.asw, 0);
        result.requiredLevel = 0;
        result.requiredExp = 0;
        // 素ステータス以外の対潜値を取得 = 装備分と改修分
        const aswWithoutStatus = this.ship.displayStatus.asw - Ship.getStatusFromLevel(this.level, this.maxAsw, this.minAsw);
        if (!result.targetAsw || !this.ship.data.id || result.targetAsw < this.minAsw) {
          // 算出不要
          continue;
        }
        // いつ達成していたか？
        result.requiredLevel = Ship.getRequiredLevel(result.targetAsw - aswWithoutStatus, this.maxAsw, this.minAsw);

        // まだ到達していないなら必要経験値を取得
        if (result.requiredLevel > this.level) {
          const targetLevelInfo = Const.LEVEL_BORDERS.find((v) => v.lv === result.requiredLevel);
          const levelInfo = Const.LEVEL_BORDERS.find((v) => v.lv === this.level);
          if (targetLevelInfo) {
            result.requiredExp = targetLevelInfo.req - (levelInfo ? levelInfo.req : 0);
          }
        }
      }

      this.results = results;

      this.aswResults = [];
      this.scoutResults = [];
      this.avoidResults = [];
      this.expResults = [];
      const levelInfo = Const.LEVEL_BORDERS.find((v) => v.lv === this.level);
      const base = this.ship.data;
      for (let level = this.maxLevel; level > 0; level -= 1) {
        this.aswResults.push(Ship.getStatusFromLevel(level, base.maxAsw, base.minAsw));
        this.scoutResults.push(Ship.getStatusFromLevel(level, base.maxScout, base.minScout));
        this.avoidResults.push(Ship.getStatusFromLevel(level, base.maxAvoid, base.minAvoid));

        if (this.level < level && levelInfo) {
          const targetLevelInfo = Const.LEVEL_BORDERS.find((v) => v.lv === level);
          this.expResults.push(targetLevelInfo ? targetLevelInfo.req - levelInfo.req : 0);
        } else {
          this.expResults.push(0);
        }
      }

      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.requiredAswTargets = results.map((v) => v.targetAsw);
      this.$store.dispatch('updateSetting', setting);
    },
  },
});
</script>
