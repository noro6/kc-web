<template>
  <div class="compare-cards px-1 pb-1">
    <div class="d-none d-sm-flex flex-column">
      <div class="d-flex align-end">
        <div class="caption">Before</div>
        <v-icon class="ml-auto" small>mdi-chevron-triple-right</v-icon>
      </div>
      <v-divider class="mb-2"></v-divider>
      <v-card class="px-3 py-2 flex-grow-1">
        <item-status-view v-model="originalItem" :bonus="originalItemBonusString" :is-airbase-mode="isAirbaseMode"></item-status-view>
      </v-card>
    </div>
    <div class="compare-arrow d-none d-sm-block">
      <div><v-icon x-large color="light-blue">mdi-chevron-right</v-icon></div>
    </div>
    <div class="d-none d-sm-flex flex-column">
      <div class="caption">After</div>
      <v-divider class="mb-2"></v-divider>
      <v-card class="px-3 py-2 flex-grow-1">
        <item-status-view v-model="targetItem" :bonus="itemBonusString" :is-airbase-mode="isAirbaseMode"></item-status-view>
      </v-card>
    </div>
    <!-- ステータスプレビュー -->
    <div class="preview-card d-flex flex-column">
      <div class="caption">Preview</div>
      <v-divider class="mb-2"></v-divider>
      <v-card class="px-3 py-2 flex-grow-1">
        <template v-if="!isAirbaseMode && exchangeParent && itemParent && itemParent.data.id">
          <div class="d-flex align-center">
            <div><v-img :src="`./img/ship/banner/${exchangeParent.data.id}.png`" height="30" width="120" /></div>
            <div class="ml-1">
              <div class="level-text light-blue--text caption">Lv {{ exchangeParent.level }}</div>
              <div class="caption">{{ getShipName(exchangeParent.data) }}</div>
            </div>
          </div>
          <div class="mt-1 caption text--secondary">{{ $t("Common.表示ステータス") }}</div>
        </template>
        <template v-else>
          <div class="mt-1 caption text--secondary">{{ $t("Common.基本装備性能") }}</div>
        </template>
        <v-divider></v-divider>
        <div class="preview-statuses">
          <template v-for="(row, i) in displayStatuses">
            <div :key="`title${i}`">{{ row.text }}</div>
            <div :key="`before${i}`" :class="{ text: row.hideDiff }">{{ row.before }}</div>
            <div :key="`arrow${i}`"><v-icon small color="grey">mdi-arrow-right-thin</v-icon></div>
            <div :key="`after${i}`" :class="{ 'light-blue--text': row.diff > 0, 'error--text': row.diff < 0, text: row.hideDiff }">{{ row.after }}</div>
            <div :key="`diff${i}`">
              <template v-if="row.diff">
                <v-icon v-if="row.diff > 0" color="light-blue">
                  {{ row.diff > 15 ? "mdi-chevron-triple-up" : row.diff >= 3 ? "mdi-chevron-double-up" : "mdi-chevron-up" }}
                </v-icon>
                <v-icon v-else color="error">
                  {{ -15 > row.diff ? "mdi-chevron-triple-down" : -3 >= row.diff ? "mdi-chevron-double-down" : "mdi-chevron-down" }}
                </v-icon>
                <span>{{ row.hideDiff ? "" : Math.floor(10 * Math.abs(row.diff)) / 10 }}</span>
              </template>
            </div>
          </template>
        </div>
        <template v-if="displayStatuses2.length">
          <div class="mt-1 caption text--secondary" v-if="isAirbaseMode">{{ $t("Common.航空隊ステータス") }}</div>
          <div class="mt-1 caption text--secondary" v-else>{{ $t("Common.実性能") }}</div>
          <v-divider></v-divider>
          <div class="preview-statuses">
            <template v-for="(row, i) in displayStatuses2">
              <div :key="`title${i}`">{{ row.text }}</div>
              <div :key="`before${i}`" :class="{ text: row.hideDiff }">{{ Math.floor(10 * row.before) / 10 }}</div>
              <div :key="`arrow${i}`"><v-icon small color="grey">mdi-arrow-right-thin</v-icon></div>
              <div :key="`after${i}`" :class="{ 'light-blue--text': row.diff > 0, 'error--text': row.diff < 0, text: row.hideDiff }">
                {{ Math.floor(10 * row.after) / 10 }}
              </div>
              <div :key="`diff${i}`">
                <template v-if="row.diff">
                  <v-icon v-if="row.diff > 0" color="light-blue">
                    {{ row.diff > 15 ? "mdi-chevron-triple-up" : row.diff >= 3 ? "mdi-chevron-double-up" : "mdi-chevron-up" }}
                  </v-icon>
                  <v-icon v-else color="error">
                    {{ -15 > row.diff ? "mdi-chevron-triple-down" : -3 >= row.diff ? "mdi-chevron-double-down" : "mdi-chevron-down" }}
                  </v-icon>
                  <span>{{ Math.floor(10 * Math.abs(row.diff)) / 10 }}</span>
                </template>
              </div>
            </template>
          </div>
        </template>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.compare-cards {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 8px;
  overflow-y: auto;
}
.compare-arrow {
  position: relative;
  z-index: 1;
}
.compare-arrow > div {
  position: absolute;
  top: -20px;
  right: 50%;
  transform: rotate(90deg) translateY(-20px);
  filter: drop-shadow(0 0 2px rgba(0, 188, 212, 0.6));
}
@media (min-width: 450px) {
  .compare-cards {
    display: grid;
    grid-template-columns: 1fr 8px 1fr;
  }
  .preview-card {
    grid-column-start: 1;
    grid-column-end: 4;
  }
  .compare-arrow > div {
    top: 50%;
    right: -16px;
    transform: unset;
  }
}
@media (min-width: 600px) {
  .compare-cards {
    max-height: 70vh;
  }
}
@media (min-width: 800px) {
  .compare-cards {
    display: grid;
    grid-template-columns: 1fr 8px 1fr auto;
  }
  .preview-card {
    grid-column-start: unset;
    grid-column-end: unset;
    margin-left: 8px;
  }
}
@media (min-width: 1000px) {
  .compare-cards {
    grid-template-columns: 1fr 16px 1fr auto;
  }
  .preview-card {
    margin-left: 16px;
  }
  .compare-arrow > div {
    right: -12px;
  }
}
.level-text {
  height: 16px;
}
.preview-statuses {
  padding-top: 4px;
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  column-gap: 12px;
  align-items: center;
}
.preview-statuses > div {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 24px;
  font-size: 14px;
}
.preview-statuses > div:nth-child(5n - 4) {
  justify-content: flex-start;
  min-width: 50px;
  font-size: 12px;
}
.preview-statuses > div.text {
  font-size: 12px;
}
.preview-statuses > div:nth-child(5n) {
  display: flex;
  align-items: center;
}
.preview-statuses > div:nth-child(5n) span {
  display: inline-block;
  text-align: right;
  min-width: 30px;
}
.preview-statuses.airbase {
  grid-template-columns: auto 32px auto 32px auto;
}

.text--secondary {
  filter: drop-shadow(0 0 3px rgba(128, 128, 128, 0.5));
}
.light-blue--text {
  filter: drop-shadow(0 0 4px rgba(0, 188, 212, 0.3));
}
.error--text {
  filter: drop-shadow(0 0 4px rgba(212, 14, 0, 0.3));
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
    displayStatuses: [] as { text: string; before: string | number; after: string | number; diff: number; hideDiff?: boolean }[],
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
          diff: -(this.targetItem.data.cost - this.originalItem.data.cost),
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
