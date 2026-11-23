<template>
  <div class="compare-board">
    <div class="compare-toolbar">
      <v-checkbox
        class="compare-diff"
        v-model="isDiffMode"
        :disabled="enabledShipsCount < 2"
        hide-details
        dense
        :label="$t('Extra.差分表示')"
      />
      <v-spacer />
      <v-btn v-if="isMobile && emptyIndex >= 0" text small @click="showShipList(emptyIndex)">
        <v-icon left small>mdi-plus</v-icon>{{ $t("Fleet.艦娘選択") }}
      </v-btn>
      <v-btn text :small="isMobile" @click="resetShips">
        <v-icon left>mdi-trash-can-outline</v-icon>{{ $t("Common.リセット") }}
      </v-btn>
    </div>
    <div class="compare-scroll">
      <table class="compare-table" :class="{ 'is-compact': isMobile }" :style="{ width: `${tableWidth}px`, minWidth: `${tableMinWidth}px` }">
        <colgroup>
          <col class="col-label" />
          <col v-for="col in columns" :key="`col${col.index}`" :class="{ 'col-add': col.isAdd }" />
        </colgroup>
        <thead>
          <tr>
            <th class="corner" />
            <th
              v-for="col in columns"
              :key="`head${col.index}`"
              class="ship-head"
              :class="{ 'is-base': isDiffMode && col.index === 0 && !col.isAdd, 'is-add': col.isAdd }"
            >
              <v-btn v-if="col.isAdd" class="add-ship" text block @click="showShipList(col.index)">
                <v-icon left>mdi-plus</v-icon>{{ $t("Fleet.艦娘選択") }}
              </v-btn>
              <div v-else class="ship-card">
                <div
                  class="ship-banner"
                  @click="showShipList(col.index)"
                  @keypress.enter="showShipList(col.index)"
                  v-ripple="{ class: 'text-primary' }"
                >
                  <img :src="`./img/ship/banner/${ships[col.index].data.id}.png`" alt="" />
                </div>
                <div class="ship-top">
                  <div
                    class="ship-name"
                    :title="getShipName(ships[col.index].data)"
                    @click="showShipList(col.index)"
                    @keypress.enter="showShipList(col.index)"
                  >
                    {{ getShipName(ships[col.index].data) }}
                  </div>
                  <v-btn icon x-small @click="removeShip(col.index)">
                    <v-icon small>mdi-close</v-icon>
                  </v-btn>
                </div>
                <div class="ship-sub">
                  <span class="ship-type">{{ shipTypeName(ships[col.index]) }}</span>
                  <span class="lv-label">Lv</span>
                  <v-text-field
                    class="level-input"
                    v-model.number="ships[col.index].level"
                    dense
                    outlined
                    :max="maxLevel"
                    min="1"
                    type="number"
                    :rules="[rules.level]"
                    hide-details
                    @input="statusChanged(col.index)"
                  />
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody v-if="enabledShipsCount >= 2">
          <template v-for="section in board">
            <tr :key="`section-${section.label}`" class="section-row">
              <th :colspan="columns.length + 1">
                <span>{{ section.label }}</span>
              </th>
            </tr>
            <tr v-for="row in section.rows" :key="row.key" class="stat-row">
              <th class="stat-label">{{ row.label }}</th>
              <td v-for="col in columns" :key="`${row.key}-${col.index}`" :class="cellClass(row.cells[col.index], col.isAdd)">
                <div v-if="!col.isAdd" class="cmp-cell" :class="{ 'is-text': row.kind === 'text' }">
                  <span class="cmp-num" :class="row.cells[col.index].tone">{{ row.cells[col.index].text }}</span>
                  <div v-if="row.kind === 'number'" class="cmp-track">
                    <i :style="{ width: `${Math.min(100, row.cells[col.index].bar)}%` }" />
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p v-if="enabledShipsCount < 2" class="compare-empty">{{ $t("Extra.比較には2隻以上選んでください") }}</p>
    </div>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth" :fullscreen="isMobile">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
  </div>
</template>
<style scoped>
.compare-board {
  --accent: #22c55e;
  --surface: #fbfaf8;
  --surface-2: #f1efeb;
  overflow: hidden;
  padding: 10px 14px 14px;
  background: var(--surface);
  border: 1px solid rgba(22, 26, 34, 0.08);
  border-radius: 16px;
}
.theme--dark .compare-board {
  --surface: rgb(32, 33, 40);
  --surface-2: rgb(42, 44, 52);
  border-color: rgba(255, 255, 255, 0.09);
}
.deep-sea .theme--dark .compare-board {
  --surface: rgb(16, 28, 48);
  --surface-2: rgb(24, 40, 64);
  border-color: rgba(160, 196, 255, 0.14);
}
.compare-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.compare-diff {
  margin-top: 0;
  padding-top: 0;
}
.compare-scroll {
  overflow: auto;
  max-height: 68vh;
  border: 1px solid rgba(128, 128, 128, 0.22);
  border-radius: 12px;
}
.compare-table {
  max-width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}
.col-label {
  width: 84px;
}
.col-add {
  width: 148px;
}
.compare-table th,
.compare-table td {
  padding: 0;
  font-weight: 400;
  text-align: left;
}
.compare-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  vertical-align: top;
  background: var(--surface);
  border-bottom: 1px solid rgba(128, 128, 128, 0.28);
}
.compare-table thead th.corner {
  left: 0;
  z-index: 4;
}
.compare-empty {
  margin: 28px 12px 32px;
  font-size: 13px;
  letter-spacing: 0.02em;
  opacity: 0.72;
}
.section-row th {
  padding: 12px 12px 6px;
  background: var(--surface);
  border-bottom: 1px solid rgba(128, 128, 128, 0.35);
}
.section-row span {
  position: sticky;
  left: 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgba(22, 26, 34, 0.72);
}
.theme--dark .section-row span {
  color: rgba(255, 255, 255, 0.72);
}
.stat-row th,
.stat-row td {
  height: 32px;
  background: var(--surface);
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
}
.stat-row:hover th,
.stat-row:hover td {
  background: var(--surface-2);
}
.stat-label {
  position: sticky;
  left: 0;
  z-index: 1;
  padding: 0 10px !important;
  font-size: 12px;
  font-weight: 700 !important;
  letter-spacing: 0.02em;
  white-space: nowrap;
  color: rgba(22, 26, 34, 0.72);
}
.theme--dark .stat-label {
  color: rgba(255, 255, 255, 0.72);
}
.stat-row td {
  padding: 0 12px 0 8px;
}
.cmp-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 12px;
}
.cmp-num {
  flex: none;
  width: 3.2em;
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-weight: 400;
}
.cmp-cell.is-text .cmp-num {
  width: auto;
  min-width: 3.2em;
  white-space: nowrap;
}
.cmp-track {
  position: relative;
  flex: 1;
  min-width: 24px;
  height: 3px;
  border-radius: 3px;
  background: rgba(128, 128, 128, 0.16);
}
.cmp-track i {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 3px;
  background: color-mix(in srgb, var(--accent) 55%, transparent);
}
td.best .cmp-track i {
  background: var(--accent);
}
td.worst .cmp-track i {
  background: color-mix(in srgb, #ef4444 78%, transparent);
}
td.mid .cmp-track i {
  background: rgba(90, 96, 104, 0.55);
}
.theme--dark td.mid .cmp-track i {
  background: rgba(176, 180, 188, 0.55);
}
td.best .cmp-num {
  color: #15803d;
}
td.worst .cmp-num {
  color: #dc2626;
}
.theme--dark td.best .cmp-num {
  color: #86efac;
}
.theme--dark td.worst .cmp-num {
  color: #fca5a5;
}
.cmp-num.up {
  color: #15803d;
}
.cmp-num.down {
  color: #dc2626;
}
.cmp-num.flat {
  opacity: 0.45;
}
.theme--dark .cmp-num.up {
  color: #86efac;
}
.theme--dark .cmp-num.down {
  color: #fca5a5;
}
.ship-head {
  min-width: 0;
}
.ship-head.is-base {
  border-bottom: 2px solid var(--accent) !important;
}
.ship-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 8px 8px 8px;
}
.ship-banner {
  width: 120px;
  max-width: 100%;
  cursor: pointer;
  border-radius: 2px;
  transition: box-shadow 0.2s;
}
.ship-banner img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 1;
  object-fit: contain;
}
.ship-banner:hover {
  box-shadow: 0 0 12px rgb(128, 128, 128);
}
.ship-top {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
}
.ship-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.02em;
  cursor: pointer;
}
.ship-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.ship-type,
.lv-label {
  font-size: 11px;
  white-space: nowrap;
  opacity: 0.65;
}
.lv-label {
  margin-left: auto;
}
.level-input {
  flex: none;
  width: 64px;
  margin-top: 0;
  padding-top: 0;
}
.level-input >>> .v-input__slot {
  min-height: 28px !important;
  padding: 0 6px !important;
}
.level-input >>> input {
  text-align: right !important;
}
.ship-head.is-add {
  padding: 8px !important;
}
.add-ship {
  margin: 0;
  min-height: 84px;
  border: 1px dashed rgba(128, 128, 128, 0.45) !important;
  border-radius: 12px;
  letter-spacing: 0.02em;
}
.add-ship:hover {
  border-color: color-mix(in srgb, var(--accent) 55%, transparent) !important;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}
@media (max-width: 599px) {
  .compare-board {
    padding: 8px;
  }
}
.is-compact .col-label {
  width: 56px;
}
.is-compact .stat-label {
  padding: 0 6px !important;
  font-size: 11px;
  letter-spacing: 0;
}
.is-compact .stat-row th,
.is-compact .stat-row td {
  height: 34px;
}
.is-compact .stat-row td {
  padding: 0 6px;
}
.is-compact .cmp-cell {
  flex-direction: column;
  align-items: stretch;
  gap: 3px;
}
.is-compact .cmp-num,
.is-compact .cmp-cell.is-text .cmp-num {
  width: auto;
  min-width: 0;
  text-align: left;
}
.is-compact .cmp-track {
  flex: none;
  min-width: 0;
}
.is-compact .section-row th {
  padding: 10px 8px 4px;
}
.is-compact .section-row span {
  left: 8px;
}
.is-compact .ship-card {
  gap: 3px;
  padding: 6px 4px;
}
.is-compact .ship-banner {
  width: 100%;
}
.is-compact .ship-name {
  font-size: 11px;
  letter-spacing: 0;
}
.is-compact .ship-top >>> .v-btn {
  width: 18px;
  height: 18px;
}
.is-compact .ship-type {
  display: none;
}
.is-compact .ship-sub {
  gap: 3px;
}
.is-compact .lv-label {
  margin-left: 0;
  font-size: 10px;
}
.is-compact .level-input {
  flex: 1;
  width: auto;
  min-width: 0;
}
.is-compact .level-input >>> .v-input__slot {
  min-height: 24px !important;
  padding: 0 4px !important;
}
.is-compact .level-input >>> input {
  font-size: 12px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipList, { ViewShip } from '@/components/fleet/ShipList.vue';
import ShipMaster from '@/classes/fleet/shipMaster';
import SiteSetting from '@/classes/siteSetting';
import Ship from '@/classes/fleet/ship';
import { max, min } from 'lodash';
import ShipValidation from '@/classes/fleet/shipValidation';
import ItemMaster from '@/classes/item/itemMaster';
import Const from '@/classes/const';

interface displayStatus {
  hp: number;
  firePower: number;
  armor: number;
  torpedo: number;
  night: number;
  antiAir: number;
  asw: number;
  LoS: number;
  avoid: number;
  luck: number;
  fuel: number;
  ammo: number;
  slot1: number;
  slot2: number;
  slot3: number;
  slot4: number;
  slot5: number;
}

interface CompareCell {
  text: string;
  bar: number;
  best: boolean;
  worst: boolean;
  mid: boolean;
  tone: '' | 'up' | 'down' | 'flat';
}

interface NumberCompareRow {
  key: keyof displayStatus;
  label: string;
  kind: 'number';
  lowerBetter?: boolean;
  value: (ship: Ship) => number;
  missing?: (ship: Ship) => boolean;
}

interface TextCompareRow {
  key: string;
  label: string;
  kind: 'text';
  value: (ship: Ship) => string;
}

type CompareRow = NumberCompareRow | TextCompareRow;

function packShips(ships: Ship[]): Ship[] {
  const filled = ships.filter((ship) => !ship.isEmpty);
  while (filled.length < ships.length) filled.push(new Ship());
  return filled;
}

function gapIsClear(bestValue: number, worstValue: number): boolean {
  return bestValue !== worstValue;
}

function formatDiff(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '±0';
}

function formatSpeed(value: number, t: (key: string) => string): string {
  if (value <= 5) return t('Fleet.低速');
  if (value <= 10) return t('Fleet.高速');
  if (value <= 15) return t('Fleet.高速+');
  return t('Fleet.最速');
}

function buildCompareSections(
  t: (key: string) => string,
  rangeText: string[],
): { label: string; rows: CompareRow[] }[] {
  const numberRow = (
    key: keyof displayStatus,
    label: string,
    value: (ship: Ship) => number,
    options?: { lowerBetter?: boolean; missing?: (ship: Ship) => boolean },
  ): NumberCompareRow => ({
    key,
    label,
    kind: 'number',
    lowerBetter: options && options.lowerBetter,
    value,
    missing: options && options.missing,
  });
  const slots: CompareRow[] = [1, 2, 3, 4, 5].map((slot) => numberRow(
    `slot${slot}` as keyof displayStatus,
    `${t('Fleet.搭載')}${slot}`,
    (ship) => ship.slots[slot - 1] ?? 0,
    { missing: (ship) => !(ship.slots[slot - 1] >= 0) },
  ));
  return [
    {
      label: t('Fleet.ステータス'),
      rows: [
        numberRow('hp', t('Common.耐久'), (ship) => ship.displayStatus.HP),
        numberRow('firePower', t('Common.火力'), (ship) => ship.displayStatus.firePower),
        numberRow('armor', t('Common.装甲'), (ship) => ship.displayStatus.armor),
        numberRow('torpedo', t('Common.雷装'), (ship) => ship.displayStatus.torpedo),
        numberRow('night', t('Common.夜戦火力'), (ship) => ship.nightBattleFirePower),
        numberRow('antiAir', t('Common.対空'), (ship) => ship.displayStatus.antiAir),
        numberRow('asw', t('Common.対潜'), (ship) => ship.displayStatus.asw),
        numberRow('LoS', t('Common.索敵'), (ship) => ship.displayStatus.LoS),
        numberRow('avoid', t('Common.回避'), (ship) => ship.displayStatus.avoid),
        numberRow('luck', t('Common.運'), (ship) => ship.displayStatus.luck),
        {
          key: 'range',
          label: t('Common.射程'),
          kind: 'text',
          value: (ship) => (ship.data.range ? t(`Common.${rangeText[ship.displayStatus.range]}`) : '-'),
        },
        {
          key: 'speed',
          label: t('Common.速力'),
          kind: 'text',
          value: (ship) => formatSpeed(ship.speed, t),
        },
        numberRow('fuel', t('Common.燃料'), (ship) => ship.fuel, { lowerBetter: true }),
        numberRow('ammo', t('Common.弾薬'), (ship) => ship.ammo, { lowerBetter: true }),
      ],
    },
    {
      label: t('Fleet.搭載数'),
      rows: slots,
    },
  ];
}

function decorateCell(
  row: CompareRow,
  ship: Ship,
  index: number,
  ships: Ship[],
  maxStatuses: displayStatus,
  minStatuses: displayStatus,
  isDiffMode: boolean,
): CompareCell {
  if (ship.isEmpty) {
    return {
      text: '-', bar: 0, best: false, worst: false, mid: false, tone: '',
    };
  }
  if (row.kind === 'text') {
    return {
      text: row.value(ship), bar: 0, best: false, worst: false, mid: false, tone: '',
    };
  }
  const missing = row.missing ? row.missing(ship) : false;
  const value = missing ? 0 : row.value(ship);
  const bestValue = maxStatuses[row.key];
  const worstValue = minStatuses[row.key];
  const base = ships[0];
  const filledCount = ships.filter((v) => !v.isEmpty).length;
  const useDiff = isDiffMode && index > 0 && !base.isEmpty;
  if (missing && !useDiff) {
    return {
      text: '-', bar: 0, best: false, worst: false, mid: false, tone: '',
    };
  }
  const clearGap = filledCount >= 2 && !missing && gapIsClear(bestValue, worstValue);
  const slotPeak = Math.max(
    maxStatuses.slot1,
    maxStatuses.slot2,
    maxStatuses.slot3,
    maxStatuses.slot4,
    maxStatuses.slot5,
  );
  let peak = bestValue;
  if (String(row.key).startsWith('slot')) peak = slotPeak;
  else if (row.lowerBetter) peak = worstValue;
  const bar = filledCount >= 2 && !missing && peak > 0 ? Math.round((value / peak) * 100) : 0;
  let text = `${value}`;
  let tone: CompareCell['tone'] = '';
  if (useDiff) {
    const baseMissing = row.missing ? row.missing(base) : false;
    const baseValue = baseMissing ? 0 : row.value(base);
    const delta = value - baseValue;
    text = formatDiff(delta);
    if (delta === 0) tone = 'flat';
    else if (clearGap && delta > 0) tone = row.lowerBetter ? 'down' : 'up';
    else if (clearGap && delta < 0) tone = row.lowerBetter ? 'up' : 'down';
  }
  const best = clearGap && value === bestValue;
  const worst = clearGap && value === worstValue;
  return {
    text,
    bar,
    best,
    worst,
    mid: clearGap && !best && !worst,
    tone,
  };
}

export default Vue.extend({
  name: 'ShipStatusCompare',
  components: { ShipList },
  data: () => ({
    ships: [new Ship(), new Ship(), new Ship(), new Ship(), new Ship(), new Ship()] as Ship[],
    maxStatuses: {
      hp: 0,
      firePower: 0,
      armor: 0,
      torpedo: 0,
      night: 0,
      antiAir: 0,
      asw: 0,
      LoS: 0,
      avoid: 0,
      luck: 0,
      fuel: 0,
      ammo: 0,
      slot1: 0,
      slot2: 0,
      slot3: 0,
      slot4: 0,
      slot5: 0,
    } as displayStatus,
    minStatuses: {
      hp: 0,
      firePower: 0,
      armor: 0,
      torpedo: 0,
      night: 0,
      antiAir: 0,
      asw: 0,
      LoS: 0,
      avoid: 0,
      luck: 0,
      fuel: 0,
      ammo: 0,
      slot1: 0,
      slot2: 0,
      slot3: 0,
      slot4: 0,
      slot5: 0,
    } as displayStatus,
    rangeText: ['', '短', '中', '長', '超長', '超長+'],
    putShipIndex: 0,
    shipListDialog: false,
    shipDialogWidth: 1200,
    rules: {
      level: (value: number) => !(value < 1 || value > Const.MAX_LEVEL) || `1 ～ ${Const.MAX_LEVEL}`,
    },
    maxLevel: Const.MAX_LEVEL,
    isDiffMode: false,
    diffs: [] as number[],
    isMobile: true,
  }),
  mounted() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
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
    validDaihatsu() {
      return (value: Ship) => {
        const daihatsu = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 68);
        return daihatsu && ShipValidation.isValidItem(value.data, daihatsu);
      };
    },
    validTank() {
      return (value: Ship) => {
        const tank = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 167);
        return tank && ShipValidation.isValidItem(value.data, tank);
      };
    },
    enabledShipsCount(): number {
      return this.ships.filter((v) => !v.isEmpty).length;
    },
    emptyIndex(): number {
      return this.ships.findIndex((ship) => ship.isEmpty);
    },
    columns(): { index: number; isAdd: boolean }[] {
      const columns = this.ships
        .map((ship, index) => ({ index, isAdd: ship.isEmpty }))
        .filter((column) => !column.isAdd);
      if (this.emptyIndex >= 0 && !this.isMobile) columns.push({ index: this.emptyIndex, isAdd: true });
      return columns;
    },
    tableMinWidth(): number {
      if (this.isMobile) return this.columns.length * 68 + 56;
      return this.columns.reduce((sum, column) => sum + (column.isAdd ? 148 : 140), 84);
    },
    tableWidth(): number {
      return this.columns.reduce((sum, column) => sum + (column.isAdd ? 148 : 220), this.isMobile ? 56 : 84);
    },
    board(): { label: string; rows: { key: string; label: string; kind: 'number' | 'text'; lowerBetter: boolean; cells: CompareCell[] }[] }[] {
      const sections = buildCompareSections((key) => `${this.$t(key)}`, this.rangeText);
      const filled = this.ships.filter((ship) => !ship.isEmpty);
      return sections.map((section) => ({
        label: section.label,
        rows: section.rows.filter((row) => {
          if (row.kind !== 'number' || !row.missing) return true;
          const { missing } = row;
          return filled.some((ship) => !missing(ship));
        }).map((row) => ({
          key: row.key,
          label: row.label,
          kind: row.kind,
          lowerBetter: row.kind === 'number' && !!row.lowerBetter,
          cells: this.ships.map((ship, index) => decorateCell(
            row,
            ship,
            index,
            this.ships,
            this.maxStatuses,
            this.minStatuses,
            this.isDiffMode,
          )),
        })),
      })).filter((section) => section.rows.length > 0);
    },
  },
  watch: {
    completed(value) {
      if (value) {
        //
      }
    },
  },
  methods: {
    resetShips() {
      this.isDiffMode = false;
      this.ships = [new Ship(), new Ship(), new Ship(), new Ship(), new Ship(), new Ship()];
      this.setMaxStatuses();
      this.setMinStatuses();
    },
    async showShipList(index: number) {
      this.putShipIndex = index;
      await (this.shipListDialog = true);
      (this.$refs.shipList as InstanceType<typeof ShipList>).initialize(false);
    },
    putShip(viewShip: ViewShip) {
      this.shipListDialog = false;
      const newShip = new Ship({
        master: viewShip.ship,
        slots: viewShip.slots,
        hp: viewShip.hp,
        level: viewShip.level,
        luck: viewShip.luck,
        asw: viewShip.asw + Ship.getStatusFromLevel(viewShip.level, viewShip.ship.maxAsw, viewShip.ship.minAsw),
      });
      const ships = this.ships.concat();
      if (this.putShipIndex < this.ships.length) {
        ships[this.putShipIndex] = newShip;
      } else {
        ships.push(newShip);
      }

      this.ships = packShips(ships);
      this.setMaxStatuses();
      this.setMinStatuses();
    },
    removeShip(index: number) {
      const ships = this.ships.concat();
      ships[index] = new Ship();
      this.ships = packShips(ships);
      this.setMaxStatuses();
      this.setMinStatuses();
    },
    onResize() {
      this.isMobile = window.innerWidth < 600;
    },
    cellClass(cell: CompareCell, isAdd: boolean) {
      if (isAdd) return {};
      return { best: cell.best, worst: cell.worst, mid: cell.mid };
    },
    shipTypeName(ship: Ship) {
      const found = Const.SHIP_TYPES_ALT3.find((v) => v.type === ship.data.type);
      return found ? `${this.$t(`SType.${found.text}`)}` : '';
    },
    changeShipWidth(width: number) {
      this.shipDialogWidth = width;
    },
    closeDialog() {
      this.shipListDialog = false;
    },
    statusChanged(index: number) {
      const ships = this.ships.concat();
      const ship = ships[index];
      const level = Math.max(Math.min(ships[index].level, this.maxLevel), 1);
      const asw = Ship.getStatusFromLevel(level, ship.data.maxAsw, ship.data.minAsw);
      ships[index] = new Ship({ ship: this.ships[index], level, asw: asw + ship.improveAsw });
      this.ships = ships;
      this.setMaxStatuses();
      this.setMinStatuses();
    },
    setMaxStatuses() {
      const targets = this.ships.filter((v) => !v.isEmpty);
      if (targets.length) {
        this.maxStatuses.hp = max(targets.map((v) => v.displayStatus.HP)) ?? 0;
        this.maxStatuses.firePower = max(targets.map((v) => v.displayStatus.firePower)) ?? 0;
        this.maxStatuses.armor = max(targets.map((v) => v.displayStatus.armor)) ?? 0;
        this.maxStatuses.torpedo = max(targets.map((v) => v.displayStatus.torpedo)) ?? 0;
        this.maxStatuses.night = max(targets.map((v) => v.nightBattleFirePower)) ?? 0;
        this.maxStatuses.antiAir = max(targets.map((v) => v.displayStatus.antiAir)) ?? 0;
        this.maxStatuses.asw = max(targets.map((v) => v.displayStatus.asw)) ?? 0;
        this.maxStatuses.LoS = max(targets.map((v) => v.displayStatus.LoS)) ?? 0;
        this.maxStatuses.avoid = max(targets.map((v) => v.displayStatus.avoid)) ?? 0;
        this.maxStatuses.luck = max(targets.map((v) => v.displayStatus.luck)) ?? 0;
        this.maxStatuses.fuel = min(targets.map((v) => v.fuel)) ?? 0;
        this.maxStatuses.ammo = min(targets.map((v) => v.ammo)) ?? 0;
        this.maxStatuses.slot1 = max(targets.map((v) => v.slots[0])) ?? 0;
        this.maxStatuses.slot2 = max(targets.map((v) => v.slots[1])) ?? 0;
        this.maxStatuses.slot3 = max(targets.map((v) => v.slots[2])) ?? 0;
        this.maxStatuses.slot4 = max(targets.map((v) => v.slots[3])) ?? 0;
        this.maxStatuses.slot5 = max(targets.map((v) => v.slots[4])) ?? 0;
      } else {
        Object.keys(this.maxStatuses).forEach((key) => {
          this.maxStatuses[key as keyof displayStatus] = 0;
        });
      }
    },
    setMinStatuses() {
      const targets = this.ships.filter((v) => !v.isEmpty);
      if (targets.length) {
        this.minStatuses.hp = min(targets.map((v) => v.displayStatus.HP)) ?? 0;
        this.minStatuses.firePower = min(targets.map((v) => v.displayStatus.firePower)) ?? 0;
        this.minStatuses.armor = min(targets.map((v) => v.displayStatus.armor)) ?? 0;
        this.minStatuses.torpedo = min(targets.map((v) => v.displayStatus.torpedo)) ?? 0;
        this.minStatuses.night = min(targets.map((v) => v.nightBattleFirePower)) ?? 0;
        this.minStatuses.antiAir = min(targets.map((v) => v.displayStatus.antiAir)) ?? 0;
        this.minStatuses.asw = min(targets.map((v) => v.displayStatus.asw)) ?? 0;
        this.minStatuses.LoS = min(targets.map((v) => v.displayStatus.LoS)) ?? 0;
        this.minStatuses.avoid = min(targets.map((v) => v.displayStatus.avoid)) ?? 0;
        this.minStatuses.luck = min(targets.map((v) => v.displayStatus.luck)) ?? 0;
        this.minStatuses.fuel = max(targets.map((v) => v.fuel)) ?? 0;
        this.minStatuses.ammo = max(targets.map((v) => v.ammo)) ?? 0;
        this.minStatuses.slot1 = min(targets.map((v) => v.slots[0])) ?? 0;
        this.minStatuses.slot2 = min(targets.map((v) => v.slots[1])) ?? 0;
        this.minStatuses.slot3 = min(targets.map((v) => v.slots[2])) ?? 0;
        this.minStatuses.slot4 = min(targets.map((v) => v.slots[3])) ?? 0;
        this.minStatuses.slot5 = min(targets.map((v) => v.slots[4])) ?? 0;
      } else {
        Object.keys(this.minStatuses).forEach((key) => {
          this.minStatuses[key as keyof displayStatus] = 0;
        });
      }
    },
  },
});
</script>
