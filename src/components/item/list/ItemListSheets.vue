<template>
  <div class="item-list-sheets-host">
    <v-dialog v-if="!list.isMobile" v-model="list.sortDialog" width="600">
      <v-card class="pa-3">
        <div class="d-flex px-2 align-center">
          <div>{{ $t("Common.ソート") }}</div>
          <v-btn class="ml-auto" icon @click="list.sortDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider class="mt-2 mb-3" />
        <div class="sort-selector px-2">
          <div class="sort-key" v-for="(item, j) in list.sortKeyItems" :key="`key${j}`">
            <v-btn block text :class="{ primary: item.value === list.sortKey }" @click="list.selectSortKey(item.value)">
              {{ $t(`Common.${item.text}`) }}
            </v-btn>
          </div>
        </div>
        <div class="d-flex justify-center">
          <v-radio-group v-model="list.isDesc" row hide-detail @change="list.handleSortItem">
            <v-radio class="mx-10" :label="$t('Common.昇順')" :value="false" />
            <v-radio class="mx-10" :label="$t('Common.降順')" :value="true" />
          </v-radio-group>
        </div>
        <v-divider />
        <div class="d-flex mt-3 justify-end">
          <v-btn color="secondary" @click="list.resetOrdering">{{ $t("Common.リセット") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-bottom-sheet v-if="list.isMobile" v-model="list.sortDialog" scrollable>
      <v-card class="bottom-sheet-card">
        <div class="bottom-sheet-header">
          <div class="body-2 font-weight-medium">{{ $t("Common.ソート") }}</div>
          <v-btn icon small @click="list.sortDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="bottom-sheet-body">
          <div class="sheet-section">
            <div class="sheet-section-label">{{ $t("ItemList.キー") }}</div>
            <div class="sheet-chip-row">
              <button type="button" class="filter-chip" :class="{ active: !list.sortKey }"
                @click="list.resetOrdering(); list.sortDialog = false">{{ $t("Common.リセット") }}</button>
              <button v-for="(item, j) in list.sortKeyItems" :key="`m-sort${j}`" type="button" class="filter-chip"
                :class="{ active: item.value === list.sortKey }" @click="list.selectSortKey(item.value)">
                {{ $t(`Common.${item.text}`) }}
              </button>
            </div>
          </div>
          <div class="sheet-section">
            <div class="sheet-section-label">{{ $t("ItemList.順序") }}</div>
            <div class="filter-segmented sheet-segmented">
              <button type="button" :class="{ active: !list.isDesc }" @click="list.isDesc = false; list.handleSortItem()">
                {{ $t("Common.昇順") }}
              </button>
              <button type="button" :class="{ active: list.isDesc }" @click="list.isDesc = true; list.handleSortItem()">
                {{ $t("Common.降順") }}
              </button>
            </div>
          </div>
        </div>
      </v-card>
    </v-bottom-sheet>
    <v-bottom-sheet v-model="list.filterDialog" @input="list.toggleFilterDialog" scrollable>
      <v-card class="bottom-sheet-card">
        <div class="bottom-sheet-header">
          <div class="body-2 font-weight-medium">{{ $t("Common.絞り込み") }}</div>
          <v-spacer />
          <v-switch class="mt-0 mr-1" v-if="list.itemStock.length && !list.isEnemyMode" :label="$t('ItemList.所持装備反映')"
            v-model="list.isStockOnly" @click="list.clickedStockOnly" dense
            :disabled="!!list.batchList.length || !list.itemStock.length || list.isEnemyMode" hide-details />
          <v-btn icon small @click="list.closeFilterDialog()"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="bottom-sheet-body">
          <div class="sheet-section">
            <div class="sheet-section-label">{{ $t("ItemList.ステータス条件") }}</div>
            <div class="sheet-status-row">
              <v-select dense v-model="list.filterStatus" hide-details :items="list.filterStatusItems"
                class="sheet-status-select" @change="list.filter()" />
              <button type="button" class="filter-chip sheet-stepper" @click="list.stepFilterValue(-1)">−</button>
              <span class="sheet-status-value">{{ list.filterStatusValue || 0 }}</span>
              <button type="button" class="filter-chip sheet-stepper" @click="list.stepFilterValue(1)">＋</button>
              <span class="caption">{{ list.isCostFilter ? $t("ItemList.以下") : $t("ItemList.以上") }}</span>
            </div>
          </div>
          <div class="sheet-section" v-if="!list.isAirbaseMode && (!list.isBatchMode || !list.isCheckedOnly)">
            <div class="sheet-section-label">{{ $t("ItemList.射程増加") }}</div>
            <div class="filter-segmented sheet-segmented">
              <button v-for="opt in list.triStateOptions" :key="`m-range${opt.value}`" type="button"
                :class="{ active: list.affectingRangeState === opt.value }"
                @click="list.setAffectingRangeState(opt.value)">
                {{ $t(`ItemList.${opt.text}`) }}
              </button>
            </div>
          </div>
          <div class="sheet-section" v-if="list.type === 7 && !list.isEnemyMode && (!list.isBatchMode || !list.isCheckedOnly)">
            <div class="sheet-section-label">{{ $t("ItemList.対地攻撃") }}</div>
            <div class="filter-segmented sheet-segmented">
              <button v-for="opt in list.triStateOptions" :key="`m-lba${opt.value}`" type="button"
                :class="{ active: list.landBaseAttackState === opt.value }"
                @click="list.setLandBaseAttackState(opt.value)">
                {{ $t(`ItemList.${opt.text}`) }}
              </button>
            </div>
          </div>
          <div class="sheet-section" v-if="!list.isBatchMode || !list.isCheckedOnly">
            <div class="sheet-section-label">{{ $t("ItemList.条件") }}</div>
            <div class="sheet-chip-row">
              <button type="button" class="filter-chip" :class="{ active: list.isEnemyMode }"
                @click="list.isEnemyMode = !list.isEnemyMode; list.filter()">{{ $t("ItemList.敵装備") }}</button>
              <button v-if="list.enabledNightAircraftFilter" type="button" class="filter-chip"
                :class="{ active: list.onlyNightAircraft }"
                @click="list.onlyNightAircraft = !list.onlyNightAircraft; list.filter()">
                {{ $t("ItemList.夜間機") }}
              </button>
              <button v-if="list.enabledAAResistFilter" type="button" class="filter-chip"
                :class="{ active: list.onlyAAResistAircraft }"
                @click="list.onlyAAResistAircraft = !list.onlyAAResistAircraft; list.filter()">
                {{ $t("ItemList.射撃回避") }}
              </button>
              <button v-if="!list.isEnemyMode && list.setting.displayBonusKey" type="button" class="filter-chip"
                :class="{ active: list.isSpecialOnly }"
                @click="list.isSpecialOnly = !list.isSpecialOnly; list.filter()">
                {{ $t("ItemList.特効装備") }}
              </button>
              <template v-if="list.type === 14">
                <button type="button" class="filter-chip" :class="{ active: list.includeSonar }"
                  @click="list.includeSonar = !list.includeSonar; list.filter()">{{ $t("EType.ソナー") }}</button>
                <button type="button" class="filter-chip" :class="{ active: list.includeDepthCharge }"
                  @click="list.includeDepthCharge = !list.includeDepthCharge; list.filter()">
                  {{ $t("EType.爆雷") }}
                </button>
                <button type="button" class="filter-chip" :class="{ active: list.includeDepthChargeLauncher }"
                  @click="list.includeDepthChargeLauncher = !list.includeDepthChargeLauncher; list.filter()">
                  {{ $t("EType.爆雷投射機") }}
                </button>
              </template>
              <template v-if="list.type === 5">
                <button type="button" class="filter-chip" :class="{ active: list.includeTorpedo }"
                  @click="list.includeTorpedo = !list.includeTorpedo; list.filter()">{{ $t("EType.魚雷") }}</button>
                <button type="button" class="filter-chip" :class="{ active: list.includeSPTorpedo }"
                  @click="list.includeSPTorpedo = !list.includeSPTorpedo; list.filter()">
                  {{ $t("EType.特殊潜航艇") }}
                </button>
                <button type="button" class="filter-chip" :class="{ active: list.includeSVTorpedo }"
                  @click="list.includeSVTorpedo = !list.includeSVTorpedo; list.filter()">
                  {{ $t("EType.潜水艦魚雷") }}
                </button>
              </template>
            </div>
          </div>
          <div class="sheet-section">
            <div class="sheet-section-label">{{ $t("ItemList.並べ替えの計算") }}</div>
            <div class="sheet-chip-row">
              <button v-if="list.isStockOnly" type="button" class="filter-chip"
                :class="{ active: list.sortExcludeRemodelStatus }" :disabled="list.isEnemyMode"
                @click="list.sortExcludeRemodelStatus = !list.sortExcludeRemodelStatus; list.filter()">
                {{ $t("ItemList.改修値無効") }}
              </button>
              <button v-if="!list.isAirbaseMode" type="button" class="filter-chip"
                :class="{ active: list.sortExcludeSynergyStatus }" :disabled="list.isEnemyMode"
                @click="list.sortExcludeSynergyStatus = !list.sortExcludeSynergyStatus; list.filter()">
                {{ $t("ItemList.装備シナジー無効") }}
              </button>
              <button type="button" class="filter-chip" :class="{ active: list.setting.blacklistItemIds.length }"
                @click="list.showBlacklist()">
                <v-icon small>mdi-eye-off-outline</v-icon>
                <span class="ml-1">{{ $t("ItemList.ブラックリスト") }} ({{ list.setting.blacklistItemIds.length }})</span>
              </button>
            </div>
          </div>
        </div>
        <div class="bottom-sheet-footer">
          <v-btn text @click="list.resetAllFilter()">{{ $t("Common.リセット") }}</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="list.closeFilterDialog()">
            {{ $t("ItemList.x件を表示", { number: list.viewItems.length }) }}
          </v-btn>
        </div>
      </v-card>
    </v-bottom-sheet>
    <v-bottom-sheet v-model="list.actionSheet" scrollable>
      <v-card class="bottom-sheet-card" v-if="list.menuItem">
        <div class="bottom-sheet-header">
          <div class="body-2 font-weight-medium text-truncate">
            {{ list.needTrans ? $t(`${list.menuItem.item.data.name}`) : list.menuItem.item.data.name }}
          </div>
          <v-btn icon small @click="list.actionSheet = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div class="bottom-sheet-body">
          <div class="action-stats">
            <div v-for="key in list.viewStatus" :key="`action-${key}`">
              <div class="sheet-section-label">{{ $t(`Statuses.${key}`) }}</div>
              <div class="action-stat-value">
                {{ list.formatStatus(list.menuItem, key) || '—' }}
                <span v-if="!list.isCheckedOnly && list.statusBonus(list.menuItem, key)" class="status-bonus"
                  :class="{ minus: list.statusBonus(list.menuItem, key) < 0 }">{{ list.statusBonus(list.menuItem, key) > 0 ? '+' : '' }}{{
                    list.statusBonus(list.menuItem, key) }}</span>
              </div>
            </div>
          </div>
          <button type="button" class="action-row emphasis" @click="list.equipFromSheet()">{{ $t("Common.配備") }}</button>
          <button type="button" class="action-row" :disabled="!list.isAirbaseMode && !list.isShipMode"
            @click="list.compareFromSheet()">
            {{ $t("ItemList.装備比較") }}
          </button>
          <button type="button" class="action-row" @click="list.copyItemName()">{{ $t("ItemList.装備名コピー") }}</button>
          <button type="button" class="action-row" :disabled="list.menuItem.item.data.isEnemyItem"
            @click="list.openWiki(list.menuItem.item.data); list.actionSheet = false">{{ $t("ItemList.wikiを開く") }}</button>
          <div v-if="list.isStockOnly && !list.isReadonlyMode" class="sheet-section">
            <div class="sheet-section-label">{{ $t("ItemList.改修値変更") }}</div>
            <div class="remodel-grid">
              <button v-for="n in 11" :key="`remodel-${n - 1}`" type="button"
                :class="{ active: list.menuItem.remodel === n - 1 }"
                @click="list.changeRemodel(list.menuItem.item, n - 1)">
                ★{{ n - 1 }}
              </button>
            </div>
          </div>
        </div>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ItemListSheets',
  inject: ['itemList'],
  computed: {
    list(): Vue {
      return (this as unknown as { itemList: Vue }).itemList;
    },
  },
});
</script>

<style scoped>
.item-list-sheets-host {
  display: contents;
}

.sort-selector {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

@media (min-width: 600px) {
  .sort-selector {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.sort-key {
  text-align: center;
  cursor: pointer;
  border: 1px solid transparent;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 13px;
  background-color: transparent;
  color: inherit;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}

.filter-chip:hover {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
}

.filter-chip.active {
  border-color: color-mix(in srgb, var(--accent) 60%, transparent);
  background-color: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent-text);
}

.filter-chip.active >>> .v-icon {
  color: inherit;
}

.filter-chip:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.filter-segmented {
  display: inline-flex;
  height: 26px;
  padding: 2px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 13px;
}

.filter-segmented button {
  padding: 0 8px;
  border-radius: 11px;
  background-color: transparent;
  color: inherit;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0.75;
  cursor: pointer;
  transition: background-color 0.16s ease, color 0.16s ease;
}

.filter-segmented button:hover {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
}

.filter-segmented button.active {
  opacity: 1;
  background-color: color-mix(in srgb, var(--accent) 18%, transparent);
  color: var(--accent-text);
}

.bottom-sheet-card {
  --accent: #14b8a6;
  --accent-text: #0f766e;
  max-height: 78vh;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.theme--dark .bottom-sheet-card,
.bottom-sheet-card.theme--dark {
  --accent-text: #5eead4;
}

.bottom-sheet-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px 8px;
}

.bottom-sheet-body {
  overflow-y: auto;
  padding: 4px 12px 12px;
}

.bottom-sheet-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(128, 128, 128, 0.3);
}

.sheet-section {
  margin-bottom: 14px;
}

.sheet-section-label {
  margin-bottom: 8px;
  font-size: 12px;
  opacity: 0.7;
}

.sheet-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sheet-segmented {
  height: 32px;
}

.sheet-segmented button {
  flex: 1;
  padding: 0 10px;
}

.sheet-status-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sheet-status-select {
  flex: 1;
  max-width: 140px;
}

.sheet-status-value {
  min-width: 28px;
  text-align: center;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sheet-stepper {
  width: 32px;
  min-width: 32px;
  padding: 0;
  justify-content: center;
  font-size: 16px;
}

.action-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 12px;
  margin-bottom: 4px;
}

.action-stat-value {
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.action-row {
  display: block;
  width: 100%;
  padding: 13px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
  background: transparent;
  color: inherit;
  font-size: 14px;
  text-align: left;
}

.action-row.emphasis {
  color: var(--accent-text);
  font-weight: 600;
}

.action-row:disabled {
  opacity: 0.4;
}

.remodel-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

.remodel-grid button {
  padding: 8px 0;
  border-radius: 6px;
  background-color: rgba(128, 128, 128, 0.16);
  color: inherit;
  font-size: 12px;
}

.remodel-grid button.active {
  background-color: color-mix(in srgb, var(--accent) 22%, transparent);
  color: var(--accent-text);
  font-weight: 600;
}

.status-bonus {
  position: relative;
  margin-left: 1px;
  font-size: 10px;
  font-weight: bold;
  color: #039be5;
}

.theme--dark .status-bonus {
  color: #4fc3f7;
}

.status-bonus.minus {
  color: #ef5350;
}
</style>
