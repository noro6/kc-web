<template>
  <div class="compare-cards">
    <div class="compare-column d-none d-sm-flex">
      <div class="compare-label">{{ $t("ItemList.装備中") }}</div>
      <div class="compare-panel">
        <item-status-view v-model="originalItem" :bonus="originalItemBonusString" :is-airbase-mode="isAirbaseMode"></item-status-view>
      </div>
    </div>
    <div class="compare-arrow d-none d-sm-flex">
      <v-icon small>mdi-chevron-right</v-icon>
    </div>
    <div class="compare-column d-none d-sm-flex">
      <div class="compare-label next">{{ $t("ItemList.変更後") }}</div>
      <div class="compare-panel candidate">
        <item-status-view v-model="targetItem" :bonus="itemBonusString" :is-airbase-mode="isAirbaseMode"></item-status-view>
      </div>
    </div>
    <div class="compare-column preview-column">
      <div class="compare-label">{{ $t("ItemList.変化") }}</div>
      <div class="compare-panel preview-panel">
        <div v-if="!isAirbaseMode && exchangeParent && itemParent && itemParent.data.id" class="preview-ship">
          <div class="preview-ship-banner">
            <v-img :src="`./img/ship/banner/${exchangeParent.data.id}.png`" height="30" width="120" />
          </div>
          <div>
            <div class="preview-ship-name">{{ getShipName(exchangeParent.data) }}</div>
            <div class="preview-ship-level">Lv {{ exchangeParent.level }}</div>
          </div>
        </div>
        <div class="preview-section">{{ !isAirbaseMode && itemParent && itemParent.data.id ? $t("Common.表示ステータス") : $t("Common.基本装備性能") }}</div>
        <div class="preview-list">
          <div v-for="(row, i) in displayStatuses" :key="`status${i}`" class="preview-row" :class="previewRowClass(row.diff, row.lowerIsBetter)">
            <div class="preview-name">{{ row.text }}</div>
            <div class="preview-before" :class="{ text: row.hideDiff }">{{ row.before }}</div>
            <div class="preview-mark">→</div>
            <div class="preview-after" :class="{ text: row.hideDiff }">{{ row.after }}</div>
            <div class="preview-diff">{{ row.diff && !row.hideDiff ? formatPreviewDiff(row.diff) : "" }}</div>
          </div>
        </div>
        <template v-if="displayStatuses2.length">
          <div class="preview-section">{{ isAirbaseMode ? $t("Common.航空隊ステータス") : $t("Common.実性能") }}</div>
          <div class="preview-list">
            <div v-for="(row, i) in displayStatuses2" :key="`actual${i}`" class="preview-row" :class="previewRowClass(row.diff)">
              <div class="preview-name">{{ row.text }}</div>
              <div class="preview-before">{{ formatPreviewValue(row.before) }}</div>
              <div class="preview-mark">→</div>
              <div class="preview-after">{{ formatPreviewValue(row.after) }}</div>
              <div class="preview-diff">{{ row.diff ? formatPreviewDiff(row.diff) : "" }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compare-cards {
  --accent: #14b8a6;
  --accent-text: #0f766e;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  max-height: 70vh;
  padding: 8px 12px 10px;
  overflow-x: hidden;
  overflow-y: auto;
}

.theme--dark .compare-cards {
  --accent-text: #5eead4;
}

.compare-column {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.compare-label {
  margin-bottom: 6px;
  font-size: 11px;
  letter-spacing: 0.06em;
  opacity: 0.55;
}

.compare-label.next {
  color: var(--accent-text);
  opacity: 1;
}

.compare-panel {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid rgba(128, 128, 128, 0.28);
  border-radius: 12px;
  container-type: inline-size;
  container-name: compare-panel;
}

.compare-panel.candidate {
  border-color: color-mix(in srgb, var(--accent) 55%, transparent);
  background-color: color-mix(in srgb, var(--accent) 8%, transparent);
}

.compare-panel >>> .body-2 .item-name {
  min-width: 0;
  max-width: 220px;
}

.compare-cards .compare-panel >>> .item-statuses:not(.synergy-bonus):not(.remodel-bonus):not(.sub-sub) {
  grid-template-columns: minmax(0, 1fr) max-content minmax(0, 1fr) max-content;
  column-gap: 16px;
}

.compare-cards .compare-panel >>> .item-statuses.remodel-bonus {
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: unset;
  column-gap: 12px;
}

.compare-cards .compare-panel >>> .misc-block {
  display: grid;
  grid-template-columns: minmax(0, max-content) max-content;
  column-gap: 32px;
  align-items: center;
  width: max-content;
  max-width: 100%;
  padding-top: 4px;
}

.compare-cards .compare-panel >>> .misc-block .item-statuses.sub-sub,
.compare-cards .compare-panel >>> .misc-block .grow-speed {
  display: contents;
}

.compare-cards .compare-panel >>> .misc-block .ml-8 {
  margin-left: 0 !important;
}

.compare-cards .compare-panel >>> .misc-block .text-value {
  text-align: left;
}

.compare-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-text);
}

.preview-ship {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.preview-ship-banner {
  flex: 0 0 120px;
  width: 120px;
  height: 30px;
}

.preview-ship-name {
  font-size: 13px;
  line-height: 1.3;
}

.preview-ship-level {
  font-size: 11px;
  color: var(--accent-text);
}

.preview-section {
  margin: 8px 0 4px;
  font-size: 11px;
  opacity: 0.55;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-row {
  display: grid;
  width: 100%;
  box-sizing: border-box;
  grid-template-columns: minmax(0, 1fr) 4.6ch 1em 4.6ch 5ch;
  column-gap: 4px;
  align-items: center;
  min-height: 26px;
  padding: 0 6px;
  overflow: hidden;
  border-radius: 6px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.preview-row.same {
  opacity: 0.4;
}

.preview-row.up {
  background-color: color-mix(in srgb, var(--accent) 14%, transparent);
}

.preview-row.down {
  background-color: color-mix(in srgb, #ef4444 16%, transparent);
}

.preview-name {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-before,
.preview-after,
.preview-diff,
.preview-mark {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-before,
.preview-after,
.preview-diff {
  text-align: right;
}

.preview-after.text {
  justify-self: start;
  width: max-content;
  min-width: 100%;
  overflow: visible;
  text-overflow: unset;
}

.preview-before {
  opacity: 0.7;
}

.preview-mark {
  text-align: center;
  font-size: 12px;
  opacity: 0.4;
}

.preview-row.up .preview-after,
.preview-row.up .preview-diff {
  color: var(--accent-text);
  font-weight: 600;
}

.preview-row.down .preview-after,
.preview-row.down .preview-diff {
  color: #f87171;
  font-weight: 600;
}

.preview-row .text {
  font-size: 12px;
}

@media (min-width: 450px) {
  .compare-cards {
    grid-template-columns: minmax(0, 1fr) 16px minmax(0, 1fr);
  }

  .preview-column {
    grid-column: 1 / -1;
  }
}

@media (min-width: 800px) {
  .compare-cards {
    grid-template-columns: minmax(0, 1fr) 16px minmax(0, 1fr) minmax(0, 1fr);
  }

  .preview-column {
    grid-column: auto;
    margin-left: 0;
  }
}
</style>

<style>
@container compare-panel (min-width: 280px) {
  .compare-cards .compare-panel.compare-panel .item-statuses.remodel-bonus {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto;
    column-gap: 16px;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemStatusView from '@/components/item/ItemStatusView.vue';
import Item from '@/classes/item/item';
import Ship from '@/classes/fleet/ship';
import ShipMaster from '@/classes/fleet/shipMaster';
import SiteSetting from '@/classes/siteSetting';
import Airbase from '@/classes/airbase/airbase';
import Const from '@/classes/const';

export default Vue.extend({
  name: 'ItemCompare',
  components: { ItemStatusView },
  props: {
    targetItem: {
      type: Item,
      required: true,
    },
    itemParent: {
      type: [Airbase, Ship],
      required: true,
    },
    slotIndex: {
      type: Number,
      required: true,
    },
    isAirbaseMode: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    rangeText: ['', '短', '中', '長', '超長', '超長+', '極', '極+', '極長', '極長+'],
    exchangeParent: new Ship(),
    displayStatuses: [] as { text: string; before: string | number; after: string | number; diff: number; hideDiff?: boolean; lowerIsBetter?: boolean }[],
    displayStatuses2: [] as { text: string; before: number; after: number; diff: number }[],
    avoidTexts: Const.AVOID_TYPE.map((v) => v.text),
    originalItem: new Item(),
    originalItemBonusString: '',
    itemBonusString: '',
  }),
  mounted() {
    this.avoidTexts[0] = '-';
    this.compareItem();
  },
  watch: {
    targetItem() {
      this.compareItem();
    },
    slotIndex() {
      this.compareItem();
    },
    itemParent() {
      this.compareItem();
    },
  },
  methods: {
    formatPreviewValue(value: string | number): string {
      if (typeof value === 'number') return `${Math.floor(10 * value) / 10}`;
      return `${value}`;
    },
    formatPreviewDiff(diff: number): string {
      const abs = Math.floor(10 * Math.abs(diff)) / 10;
      return diff > 0 ? `+${abs}` : `-${abs}`;
    },
    previewRowClass(diff: number, lowerIsBetter?: boolean): string {
      const improved = lowerIsBetter ? diff < 0 : diff > 0;
      const worsened = lowerIsBetter ? diff > 0 : diff < 0;
      if (improved) return 'up';
      if (worsened) return 'down';
      return 'same';
    },
    getSpeedText(value: number) {
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
    },
    compareItem() {
      // プレビュー表示用配列初期化
      this.displayStatuses = [];
      this.displayStatuses2 = [];

      // 装備シナジーボーナス情報を一度リセット
      this.itemBonusString = '';
      this.originalItemBonusString = '';

      // 元々装備していたやつを取得
      if (this.itemParent instanceof Ship && this.slotIndex === Const.EXPAND_SLOT_INDEX) {
        // 補強増設の場合の対応
        this.originalItem = this.itemParent.exItem;
      } else {
        this.originalItem = this.itemParent.items[this.slotIndex];
      }

      const newItems: Item[] = [];
      for (let i = 0; i < this.itemParent.items.length; i += 1) {
        if (this.slotIndex === i) {
          if (this.isAirbaseMode) {
            newItems.push(new Item({ item: this.targetItem, slot: this.targetItem.data.airbaseMaxSlot }));
          } else {
            newItems.push(new Item({ item: this.targetItem }));
          }
        } else {
          newItems.push(new Item({ item: this.itemParent.items[i] }));
        }
      }

      if (this.itemParent instanceof Ship) {
        // 艦娘の場合は装備ボーナスを算出したいので、いったん乗せ換えたバージョンを作成
        let exItem = new Item({ item: this.itemParent.exItem });
        if (this.slotIndex === Const.EXPAND_SLOT_INDEX) {
          exItem = new Item({ item: this.targetItem });
        }

        this.exchangeParent = new Ship({ ship: this.itemParent, items: newItems, exItem });
        this.displayStatuses.push({
          text: `${this.$t('Common.火力')}`,
          after: this.exchangeParent.displayStatus.firePower,
          before: this.itemParent.displayStatus.firePower,
          diff: this.exchangeParent.displayStatus.firePower - this.itemParent.displayStatus.firePower,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.雷装')}`,
          after: this.exchangeParent.displayStatus.torpedo,
          before: this.itemParent.displayStatus.torpedo,
          diff: this.exchangeParent.displayStatus.torpedo - this.itemParent.displayStatus.torpedo,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.装甲')}`,
          after: this.exchangeParent.displayStatus.armor,
          before: this.itemParent.displayStatus.armor,
          diff: this.exchangeParent.displayStatus.armor - this.itemParent.displayStatus.armor,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.対空')}`,
          after: this.exchangeParent.displayStatus.antiAir,
          before: this.itemParent.displayStatus.antiAir,
          diff: this.exchangeParent.displayStatus.antiAir - this.itemParent.displayStatus.antiAir,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.対潜')}`,
          after: this.exchangeParent.displayStatus.asw,
          before: this.itemParent.displayStatus.asw,
          diff: this.exchangeParent.displayStatus.asw - this.itemParent.displayStatus.asw,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.索敵')}`,
          after: this.exchangeParent.displayStatus.LoS,
          before: this.itemParent.displayStatus.LoS,
          diff: this.exchangeParent.displayStatus.LoS - this.itemParent.displayStatus.LoS,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.回避')}`,
          after: this.exchangeParent.displayStatus.avoid,
          before: this.itemParent.displayStatus.avoid,
          diff: this.exchangeParent.displayStatus.avoid - this.itemParent.displayStatus.avoid,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.射程')}`,
          after: `${this.$t(`Common.${this.rangeText[this.exchangeParent.displayStatus.range]}`)}`,
          before: `${this.$t(`Common.${this.rangeText[this.itemParent.displayStatus.range]}`)}`,
          diff: this.exchangeParent.displayStatus.range - this.itemParent.displayStatus.range,
          hideDiff: true,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.速力')}`,
          after: this.getSpeedText(this.exchangeParent.speed),
          before: this.getSpeedText(this.itemParent.speed),
          diff: this.exchangeParent.speed - this.itemParent.speed,
          hideDiff: true,
        });

        // 実性能欄
        this.displayStatuses2.push({
          text: `${this.$t('Common.砲戦火力')}`,
          after: this.exchangeParent.baseDayBattleFirePower,
          before: this.itemParent.baseDayBattleFirePower,
          diff: this.exchangeParent.baseDayBattleFirePower - this.itemParent.baseDayBattleFirePower,
        });
        if (!this.exchangeParent.data.isCV) {
          this.displayStatuses2.push({
            text: `${this.$t('Common.夜戦火力')}`,
            after: this.exchangeParent.nightBattleFirePower,
            before: this.itemParent.nightBattleFirePower,
            diff: this.exchangeParent.nightBattleFirePower - this.itemParent.nightBattleFirePower,
          });
        }
        this.displayStatuses2.push({
          text: `${this.$t('Common.命中')}`,
          after: this.exchangeParent.accuracy,
          before: this.itemParent.accuracy,
          diff: this.exchangeParent.accuracy - this.itemParent.accuracy,
        });
        if (this.exchangeParent.fullAirPower || this.itemParent.fullAirPower) {
          this.displayStatuses2.push({
            text: `${this.$t('Common.制空値')}`,
            after: this.exchangeParent.fullAirPower,
            before: this.itemParent.fullAirPower,
            diff: this.exchangeParent.fullAirPower - this.itemParent.fullAirPower,
          });
        }
        this.displayStatuses2.push({
          text: `${this.$t('Common.支援火力')}`,
          after: this.exchangeParent.supportFirePower,
          before: this.itemParent.supportFirePower,
          diff: this.exchangeParent.supportFirePower - this.itemParent.supportFirePower,
        });
        this.displayStatuses2.push({
          text: `${this.$t('Common.支援命中')}`,
          after: this.exchangeParent.supportAccuracy,
          before: this.itemParent.supportAccuracy,
          diff: this.exchangeParent.supportAccuracy - this.itemParent.supportAccuracy,
        });

        // ベースの装備ボーナスを取得
        this.originalItemBonusString = JSON.stringify(this.itemParent.getItemBonusDiff(this.slotIndex));
        // 乗せ換えたバージョンの装備ボーナスを取得
        this.itemBonusString = JSON.stringify(this.exchangeParent.getItemBonusDiff(this.slotIndex));
      } else if (this.itemParent instanceof Airbase) {
        // 基地の場合
        this.displayStatuses.push({
          text: `${this.$t('Common.雷装')}`,
          after: Math.floor(10 * this.targetItem.actualTorpedo) / 10,
          before: Math.floor(10 * this.originalItem.actualTorpedo) / 10,
          diff: this.targetItem.actualTorpedo - this.originalItem.actualTorpedo,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.爆装')}`,
          after: Math.floor(10 * this.targetItem.actualBomber) / 10,
          before: Math.floor(10 * this.originalItem.actualBomber) / 10,
          diff: this.targetItem.actualBomber - this.originalItem.actualBomber,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.対空')}`,
          after: Math.floor(10 * this.targetItem.actualAntiAir) / 10,
          before: Math.floor(10 * this.originalItem.actualAntiAir) / 10,
          diff: this.targetItem.actualAntiAir - this.originalItem.actualAntiAir,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.対潜')}`,
          after: this.targetItem.data.asw,
          before: this.originalItem.data.asw,
          diff: this.targetItem.data.asw - this.originalItem.data.asw,
        });
        if (this.originalItem.data.accuracy || this.targetItem.data.accuracy) {
          this.displayStatuses.push({
            text: `${this.$t('Common.命中')}`,
            after: this.targetItem.data.accuracy,
            before: this.originalItem.data.accuracy,
            diff: this.targetItem.data.accuracy - this.originalItem.data.accuracy,
          });
        }
        this.displayStatuses.push({
          text: `${this.$t('Common.索敵')}`,
          after: this.targetItem.data.scout,
          before: this.originalItem.data.scout,
          diff: this.targetItem.data.scout - this.originalItem.data.scout,
        });
        if (this.originalItem.data.antiBomber || this.targetItem.data.antiBomber) {
          this.displayStatuses.push({
            text: `${this.$t('Common.対爆')}`,
            after: this.targetItem.data.antiBomber,
            before: this.originalItem.data.antiBomber,
            diff: this.targetItem.data.antiBomber - this.originalItem.data.antiBomber,
          });
        }
        if (this.originalItem.data.interception || this.targetItem.data.interception) {
          this.displayStatuses.push({
            text: `${this.$t('Common.迎撃')}`,
            after: this.targetItem.data.interception,
            before: this.originalItem.data.interception,
            diff: this.targetItem.data.interception - this.originalItem.data.interception,
          });
        }
        this.displayStatuses.push({
          text: `${this.$t('Common.半径')}`,
          after: this.targetItem.data.radius,
          before: this.originalItem.data.radius,
          diff: this.targetItem.data.radius - this.originalItem.data.radius,
        });
        this.displayStatuses.push({
          text: `${this.$t('Common.コスト')}`,
          after: this.targetItem.data.cost,
          before: this.originalItem.data.cost,
          diff: this.targetItem.data.cost - this.originalItem.data.cost,
          lowerIsBetter: true,
        });
        if (this.originalItem.data.avoidId !== this.targetItem.data.avoidId) {
          this.displayStatuses.push({
            text: `${this.$t('Common.射撃回避')}`,
            after: this.targetItem.data.avoidId ? `${this.$t(`Common.回避性能.${this.avoidTexts[this.targetItem.data.avoidId]}`)}` : '-',
            before: this.originalItem.data.avoidId ? `${this.$t(`Common.回避性能.${this.avoidTexts[this.originalItem.data.avoidId]}`)}` : '-',
            diff: this.targetItem.data.avoidId - this.originalItem.data.avoidId,
            hideDiff: true,
          });
        }

        // 基地全体の半径と制空値を算出
        const newBase = new Airbase({ airbase: this.itemParent, items: newItems });
        this.displayStatuses2.push({
          text: `${this.$t('Common.制空')}`,
          after: newBase.fullAirPower,
          before: this.itemParent.fullAirPower,
          diff: newBase.fullAirPower - this.itemParent.fullAirPower,
        });
        this.displayStatuses2.push({
          text: `${this.$t('Common.防空制空')}`,
          after: newBase.defenseAirPower,
          before: this.itemParent.defenseAirPower,
          diff: newBase.defenseAirPower - this.itemParent.defenseAirPower,
        });
        this.displayStatuses2.push({
          text: `${this.$t('Common.半径')}`,
          after: newBase.radius,
          before: this.itemParent.radius,
          diff: newBase.radius - this.itemParent.radius,
        });
      }
    },
    getShipName(ship: ShipMaster): string {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (this.$i18n.locale === 'en' && !setting.nameIsNotTranslate) {
        const shipName = ShipMaster.getSuffix(ship);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return ship.name || '';
    },
  },
});
</script>
