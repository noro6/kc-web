<template>
  <div>
    <div class="mt-1">
      {{ $t("Extra.装備シナジーチェッカー") }}
    </div>
    <v-divider class="mt-1"></v-divider>
    <div class="my-3 d-flex flex-wrap align-center">
      <template v-if="ship.data.id">
        <div class="ship-input" @click="showShipList()" @keypress.enter="showShipList()" v-ripple="{ class: 'primary--text' }">
          <div>
            <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120" />
          </div>
          <div class="ml-2 caption">{{ getShipName(ship.data) }}</div>
        </div>
      </template>
      <v-btn v-else color="primary" @click="showShipList()">{{ $t("Fleet.艦娘選択") }}</v-btn>
      <div class="d-flex align-center" v-if="ship.data.id">
        <div class="mx-3 caption text--secondary">{{ $t("Database.表示") }}</div>
        <v-btn
          class="mr-1"
          color="info"
          :outlined="showMultiple ? false : true"
          small
          @click="
            showMultiple = !showMultiple;
            setItemBonus();
          "
          >{{ $t("Extra.累積可") }}</v-btn
        >
        <v-btn
          v-if="ship.data.id"
          color="grey"
          :outlined="showOneTime ? false : true"
          small
          @click="
            showOneTime = !showOneTime;
            setItemBonus();
          "
          >{{ $t("Extra.累積不可") }}</v-btn
        >
      </div>
    </div>
    <div class="type-selector-container">
      <div
        v-for="i in enabledTypes"
        :key="i.id"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: selectedTypes.includes(i.id) }"
        @click="toggleType(i.id)"
        @keypress="toggleType(i.id)"
      >
        <v-img :src="`./img/type/type${i.id}.png`" height="32" width="32" />
      </div>
      <div v-if="ship.data.id" v-ripple="{ class: 'info--text' }" class="type-selector d-flex" @click="toggleType(-1)" @keypress="toggleType(-1)">
        <div class="type-all-text">ALL</div>
      </div>
    </div>
    <template v-if="ship.data.id">
      <v-divider></v-divider>
    </template>
    <div class="item-bonus-list">
      <div v-for="(row, i) in results" :key="`item-${i}`" class="mb-10">
        <div class="d-flex align-center">
          <div>
            <v-img :src="`./img/type/icon${row.master.iconTypeId}.png`" height="28" width="28" />
          </div>
          <div class="ml-1">{{ needTrans ? $t(`${row.master.name}`) : row.master.name }}</div>
          <div class="ml-2 mb-1 body-2 align-self-end">
            <a :href="row.wiki" target="_blank">wiki</a>
          </div>
        </div>
        <div v-for="(detail, j) in row.bonuses" :key="`bonus-${i}-${j}`" class="bonus-detail">
          <div class="d-flex align-center">
            <v-chip class="multiple-chip mr-2" :color="detail.raw.num ? 'grey' : 'info'" label outlined small width="120">
              {{ detail.raw.num ? $t("Extra.累積不可") : $t("Extra.累積可") }}
            </v-chip>
            <div class="text--secondary caption mr-1 text-no-wrap" v-if="detail.hasCond">{{ $t("Extra.条件") }}</div>
            <div class="cond-view">
              <!-- 複数搭載条件 -->
              <div v-if="detail.raw.num > 1" class="d-flex align-center">
                <div>
                  <v-img :src="`./img/type/icon${row.master.iconTypeId}.png`" height="20" width="20" />
                </div>
                <div>{{ needTrans ? $t(`${row.master.name}`) : row.master.name }}</div>
                <div v-if="detail.raw.remodel">
                  <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
                  <span class="teal--text text--accent-4 caption" v-if="detail.raw.remodel === 10">max</span>
                  <span class="teal--text text--accent-4 body-2" v-else>&plus;{{ detail.raw.remodel }}</span>
                </div>
                <div class="ml-1 align-self-end">x{{ detail.raw.num }}</div>
              </div>
              <!-- 改修条件 -->
              <div v-else-if="detail.raw.remodel">
                <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
                <span class="teal--text text--accent-4 caption" v-if="detail.raw.remodel === 10">max</span>
                <span class="teal--text text--accent-4 body-2" v-else>&plus;{{ detail.raw.remodel }}</span>
              </div>
              <!-- 水上電探条件 -->
              <div v-if="detail.raw.requiresSR" class="d-flex align-center">
                <div>
                  <v-img :src="`./img/type/icon11.png`" height="20" width="20" />
                </div>
                <div>{{ $t("Extra.水上電探") }}</div>
              </div>
              <!-- 対空電探条件 -->
              <div v-if="detail.raw.requiresAR" class="d-flex align-center">
                <div>
                  <v-img :src="`./img/type/icon11.png`" height="20" width="20" />
                </div>
                <div>{{ $t("Extra.対空電探") }}</div>
              </div>
              <!-- 命中電探条件 -->
              <div v-if="detail.raw.requiresAccR" class="d-flex align-center">
                <div>
                  <v-img :src="`./img/type/icon11.png`" height="20" width="20" />
                </div>
                <div>{{ $t("Extra.命中電探") }}</div>
              </div>
              <!-- 特定装備種別条件 -->
              <div v-if="detail.raw.requiresType" class="d-flex align-center">
                <div v-for="type in getTypes(detail.raw.requiresType)" :key="`type-${type.id}`" class="d-flex align-center">
                  <div>
                    <v-img :src="`./img/type/type${type.id}.png`" height="20" width="20" />
                  </div>
                  <div>{{ $t(`EType.${type.name}`) }}</div>
                </div>
              </div>
              <!-- 特定装備条件 -->
              <div v-if="detail.raw.requiresId" class="d-flex flex-wrap">
                <div v-for="(id, k) in detail.raw.requiresId" :key="`requires-${id}`" class="d-flex align-center">
                  <div>
                    <v-img :src="`./img/type/icon${getItem(id).iconTypeId}.png`" height="20" width="20" />
                  </div>
                  <div>{{ needTrans ? $t(`${getItem(id).name}`) : getItem(id).name }}</div>
                  <div v-if="detail.raw.requiresIdLevel">
                    <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
                    <span class="teal--text text--accent-4 caption" v-if="detail.raw.requiresIdLevel === 10">max</span>
                    <span class="teal--text text--accent-4 body-2" v-else-if="detail.raw.requiresIdLevel">&plus;{{ detail.raw.requiresIdLevel }}</span>
                  </div>
                  <div v-if="detail.raw.requiresIdNum" class="ml-1 align-self-end">x{{ detail.raw.requiresIdNum }}</div>
                  <div v-if="k + 1 < detail.raw.requiresId.length" class="mx-1 text--secondary">or</div>
                </div>
              </div>
              <!-- 特定装備条件 -->
              <div v-if="detail.raw.requiresId2" class="d-flex flex-wrap">
                <div v-for="(id, k) in detail.raw.requiresId2" :key="`requires-${id}`" class="d-flex align-center">
                  <div class="mr-1 text--secondary">&plus;</div>
                  <div>
                    <v-img :src="`./img/type/icon${getItem(id).iconTypeId}.png`" height="20" width="20" />
                  </div>
                  <div>{{ needTrans ? $t(`${getItem(id).name}`) : getItem(id).name }}</div>
                  <div v-if="detail.raw.requiresIdLevel2">
                    <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
                    <span class="teal--text text--accent-4 caption" v-if="detail.raw.requiresIdLevel2 === 10">max</span>
                    <span class="teal--text text--accent-4 body-2" v-else-if="detail.raw.requiresIdLevel2">&plus;{{ detail.raw.requiresIdLevel2 }}</span>
                  </div>
                  <div v-if="detail.raw.requiresIdNum2" class="ml-1 align-self-end">x{{ detail.raw.requiresIdNum2 }}</div>
                  <div v-if="k + 1 < detail.raw.requiresId2.length" class="mx-1 text--secondary">or</div>
                </div>
              </div>
            </div>
          </div>
          <div class="bonus-status-view mt-1">
            <div v-if="row.show.firePower" :class="{ 'no-change': !detail.bonus.firePower }" class="bonus-status-item">
              <div>{{ $t("Common.火力") }}</div>
              <div :class="{ 'bad-value': detail.bonus.firePower < 0 }">{{ detail.bonus.firePower }}</div>
            </div>
            <div v-if="row.show.torpedo" :class="{ 'no-change': !detail.bonus.torpedo }" class="bonus-status-item">
              <div>{{ $t("Common.雷装") }}</div>
              <div :class="{ 'bad-value': detail.bonus.torpedo < 0 }">{{ detail.bonus.torpedo }}</div>
            </div>
            <div v-if="row.show.bomber" :class="{ 'no-change': !detail.bonus.bomber }" class="bonus-status-item">
              <div>{{ $t("Common.爆装") }}</div>
              <div :class="{ 'bad-value': detail.bonus.bomber < 0 }">{{ detail.bonus.bomber }}</div>
            </div>
            <div v-if="row.show.armor" :class="{ 'no-change': !detail.bonus.armor }" class="bonus-status-item">
              <div>{{ $t("Common.装甲") }}</div>
              <div :class="{ 'bad-value': detail.bonus.armor < 0 }">{{ detail.bonus.armor }}</div>
            </div>
            <div v-if="row.show.antiAir" :class="{ 'no-change': !detail.bonus.antiAir }" class="bonus-status-item">
              <div>{{ $t("Common.対空") }}</div>
              <div :class="{ 'bad-value': detail.bonus.antiAir < 0 }">{{ detail.bonus.antiAir }}</div>
            </div>
            <div v-if="row.show.asw" :class="{ 'no-change': !detail.bonus.asw }" class="bonus-status-item">
              <div>{{ $t("Common.対潜") }}</div>
              <div :class="{ 'bad-value': detail.bonus.asw < 0 }">{{ detail.bonus.asw }}</div>
            </div>
            <div v-if="row.show.accuracy" :class="{ 'no-change': !detail.bonus.accuracy }" class="bonus-status-item">
              <div>{{ $t("Common.命中") }}</div>
              <div :class="{ 'bad-value': detail.bonus.accuracy < 0 }">{{ detail.bonus.accuracy }}</div>
            </div>
            <div v-if="row.show.avoid" :class="{ 'no-change': !detail.bonus.avoid }" class="bonus-status-item">
              <div>{{ $t("Common.回避") }}</div>
              <div :class="{ 'bad-value': detail.bonus.avoid < 0 }">{{ detail.bonus.avoid }}</div>
            </div>
            <div v-if="row.show.scout" :class="{ 'no-change': !detail.bonus.scout }" class="bonus-status-item">
              <div>{{ $t("Common.索敵") }}</div>
              <div :class="{ 'bad-value': detail.bonus.scout < 0 }">{{ detail.bonus.scout }}</div>
            </div>
            <div v-if="row.show.range" :class="{ 'no-change': !detail.bonus.range }" class="bonus-status-item">
              <div>{{ $t("Common.射程") }}</div>
              <div :class="{ 'bad-value': detail.bonus.range < 0 }">{{ detail.bonus.range }}</div>
            </div>
          </div>
          <div class="d-flex" v-if="false">
            <div class="ml-auto caption text--secondary">{{ detail.raw }}</div>
          </div>
          <div class="d-flex" v-if="false">
            <div class="ml-auto caption text--secondary">{{ detail.items.map((v) => ({ id: v.data.id, remodel: v.remodel })) }}</div>
          </div>
        </div>
      </div>
    </div>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth" :fullscreen="isMobile">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
  </div>
</template>

<style scoped>
.ship-input {
  padding-top: 4px;
  padding-bottom: 4px;
  padding-right: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: 0.2s ease-out;
  border-radius: 4px;
}
.ship-input:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.type-selector-container {
  display: flex;
  flex-wrap: wrap;
}
.type-selector {
  border: 1px solid transparent;
  padding: 0.2rem 0.4rem;
  cursor: pointer;
  transition: 0.2s;
}
.type-selector:hover {
  background-color: rgba(128, 200, 255, 0.2);
}
.type-selector.active {
  border-color: rgba(33, 150, 243, 0.4);
  background-color: rgba(33, 150, 243, 0.1);
}
.type-selector.disabled {
  opacity: 0.4;
  background-color: transparent;
  pointer-events: none;
}
.type-all-text {
  width: 32px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9em;
  align-self: center;
}

.item-bonus-list {
  min-height: 80vh;
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 1rem;
  padding-top: 30px;
}
@media (min-width: 1000px) {
  .item-bonus-list {
    grid-template-columns: 1fr 1fr;
  }
}

.item-id {
  font-size: 12px;
  height: 16px;
}

.bonus-detail {
  margin-left: 4px;
  padding-top: 2px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.4);
}
@media (min-width: 600px) {
  .bonus-detail {
    margin-left: 14px;
  }
}

.multiple-chip {
  display: inline-block;
  text-align: center;
  padding-left: 0;
  padding-right: 0;
  width: 72px;
  min-width: 72px;
}

.v-icon.teal--text {
  margin-bottom: 1px;
}
.cond-view {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  column-gap: 16px;
}
.bonus-status-view {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 16px;
  font-size: 13px;
}
.bonus-status-item {
  display: grid;
  align-items: center;
  grid-template-columns: auto 24px;
}
.bonus-status-item > div {
  opacity: 0.8;
}
.bonus-status-item > div:nth-child(2n) {
  font-size: 14px;
  text-align: right;
  color: #03a9f4;
  font-weight: bold;
  opacity: 1;
}
.bonus-status-item > div:nth-child(2n).bad-value {
  color: #ff5252;
}
.no-change {
  opacity: 0.2;
}
.bonus-status-item.no-change > div:nth-child(2n) {
  color: unset;
  font-weight: unset;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemMaster from '@/classes/item/itemMaster';
import { isEqual, max } from 'lodash';
import SiteSetting from '@/classes/siteSetting';
import ItemBonus, { Bonus, ItemBonusStatus, Bonuses } from '@/classes/item/ItemBonus';
import Ship from '@/classes/fleet/ship';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipValidation from '@/classes/fleet/shipValidation';
import Item from '@/classes/item/item';
import ShipList, { ViewShip } from './ShipList.vue';
import Const from '../../classes/const';

type BonusRow = {
  master: ItemMaster;
  bonuses: { raw: Bonus; bonus: ItemBonusStatus; remodel: number; items: Item[]; hasCond: boolean }[];
  show: ItemBonusStatus;
  maxNum: number;
  wiki: string;
};

export default Vue.extend({
  name: 'ShipItemSynergy',
  components: { ShipList },
  props: {},
  data: () => ({
    allTypes: Const.ITEM_API_TYPE,
    allItems: [] as ItemMaster[],
    allBonuses: [] as BonusRow[],
    ship: new Ship(),
    shipListDialog: false,
    shipDialogWidth: 1200,
    types: [] as { id: number; text: string; types: number[] }[],
    selectedTypes: [] as number[],
    showMultiple: true,
    showOneTime: true,
    isMobile: true,
  }),
  mounted() {
    // カテゴリセレクト初期化
    this.types = [];
    for (let i = 0; i < Const.ITEM_TYPES_ALT.length; i += 1) {
      const type = Const.ITEM_TYPES_ALT[i];
      this.types.push({
        id: type.id,
        text: type.text,
        types: type.types,
      });

      this.selectedTypes.push(type.id);
    }

    this.setItemBonus();
  },
  computed: {
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
    getItem() {
      return (id: number) => {
        const item = this.allItems.find((v) => v.id === id);
        return item ?? new ItemMaster();
      };
    },
    getTypes() {
      return (ids: number[]) => {
        const array = [];
        for (let i = 0; i < ids.length; i += 1) {
          const type = Const.ITEM_API_TYPE.find((v) => v.id === ids[i]);
          if (type) {
            array.push(type);
          }
        }
        return array;
      };
    },
    enabledTypes(): { id: number; text: string; types: number[] }[] {
      const apis = this.allBonuses.map((v) => v.master.apiTypeId);
      const enabledItems = [];
      for (let i = 0; i < this.types.length; i += 1) {
        const d = this.types[i].types;
        if (apis.find((api) => d.includes(api))) {
          enabledItems.push(this.types[i]);
        }
      }
      return enabledItems;
    },
    results(): BonusRow[] {
      const types = this.enabledTypes.filter((v) => this.selectedTypes.includes(v.id));
      let viewTypes: number[] = [];
      for (let i = 0; i < types.length; i += 1) {
        viewTypes = viewTypes.concat(types[i].types);
      }
      return this.allBonuses.filter((v) => viewTypes.includes(v.master.apiTypeId));
    },
  },
  methods: {
    toggleType(id: number) {
      if (id === -1) {
        const all = Const.ITEM_TYPES_ALT.map((v) => v.id);
        if (this.selectedTypes.length === all.length) {
          this.selectedTypes = [];
        } else {
          this.selectedTypes = all;
        }
      } else if (this.selectedTypes.includes(id)) {
        this.selectedTypes = this.selectedTypes.filter((v) => v !== id);
      } else {
        this.selectedTypes.push(id);
      }

      this.setItemBonus();
    },
    setItemBonus() {
      this.allItems = this.$store.state.items as ItemMaster[];
      this.allBonuses = [];

      if (!this.ship.data.id) {
        return;
      }

      // 選択された艦娘が発生させ得る全てのボーナスを取得 => いろいろ加工するのでいったん別オブジェクト化する
      const raw = (JSON.parse(JSON.stringify(ItemBonus.bonusData)) as Bonuses[]).filter(
        (v) => v.bonuses
          && v.bonuses.some(
            (w) => (!w.shipBase || w.shipBase.includes(this.ship.data.originalId))
              && (!w.shipId || w.shipId.includes(this.ship.data.id))
              && (!w.shipType || w.shipType.includes(this.ship.data.type))
              && (!w.shipClass || w.shipClass.includes(this.ship.data.type2))
              && (!w.shipCountry || w.shipCountry.includes(this.ship.data.type2)),
          ),
      );

      // 装備毎に分ける
      const items: BonusRow[] = [];
      /** 電探のダミー */
      const dummyRadar = {
        id: 999999,
        type: 12,
        itype: 11,
        name: '電探',
        antiAir: 0,
        scout: 0,
        accuracy: 0,
      };
      /** 敵装備以外の全装備 */
      const shipItems = this.allItems.filter((v) => !v.isEnemyItem);
      for (let i = 0; i < shipItems.length; i += 1) {
        /** チェック中の装備 */
        const item = shipItems[i];
        /** この装備に対するボーナスの入れ物 */
        let viewBonuses: { raw: Bonus; bonus: ItemBonusStatus; remodel: number; items: Item[]; hasCond: boolean }[] = [];
        /** この装備が主語になっているボーナス情報 */
        const fitRaw = raw.filter((v) => (v.ids && v.ids.includes(item.id)) || (v.types && v.types.includes(item.apiTypeId)));

        /** ボーナス部分を取り出して統合したもの */
        let bonuses: Bonus[] = [];
        for (let j = 0; j < fitRaw.length; j += 1) {
          bonuses = bonuses.concat(fitRaw[j].bonuses);
        }

        bonuses.sort((a, b) => {
          // 個数制限(num、累積不可のもの)があるやつを手前に持ってくる
          if (a.num && !b.num) return -1;
          if (!a.num && b.num) return 1;
          if (a.num && b.num) return a.num - b.num;
          // 改修値が低いものを手前に
          if (a.remodel && !b.remodel) return 1;
          if (!a.remodel && b.remodel) return -1;
          if (a.remodel && b.remodel) return a.remodel - b.remodel;
          return 0;
        });

        bonuses = bonuses.filter((v) => {
          // 艦の指定条件があって、かつ自分に該当しないやつは消して軽量化
          if (v.shipId && !v.shipId.includes(this.ship.data.id)) return false;
          if (v.shipBase && !v.shipBase.includes(this.ship.data.originalId)) return false;
          if (v.shipType && !v.shipType.includes(this.ship.data.type)) return false;
          if (v.shipClass && !v.shipClass.includes(this.ship.data.type2)) return false;
          if (v.shipCountry && !v.shipCountry.includes(this.ship.data.type2)) return false;
          return true;
        });

        // ボーナスがないやつ、装備できないやつは飛ばす
        if (!bonuses.length || !ShipValidation.isValidItem(this.ship.data, item)) {
          continue;
        }

        for (let j = 0; j < bonuses.length; j += 1) {
          /** 装備ボーナスのオブジェクト */
          const bonus = bonuses[j];
          /** 主語の装備のインスタンス化(改修値があればそれも設定済み) */
          const tempItem = new Item({ master: item, remodel: bonus.remodel ? bonus.remodel : 0 });
          /** このボーナスを得るために必要な装備群 */
          const requiredItems: Item[] = [];
          /** ボーナスを得るために必要な別の装備 基本ステータスは全て0で調整 */
          let subItem = new Item();

          // 改修対応していない装備の改修値条件は非表示
          if (tempItem.data.id === 366 && tempItem.remodel > 4) continue;
          if (tempItem.remodel && !tempItem.data.canRemodel) continue;

          if (bonus.requiresAR && (tempItem.data.iconTypeId !== 11 || tempItem.data.antiAir < 2)) {
            // 対空電探条件(ベース装備自体が対空電探にカウントされない)場合、ダミー対空電探を搭載する
            dummyRadar.id = 999997;
            dummyRadar.antiAir = 2;
            dummyRadar.scout = 0;
            dummyRadar.accuracy = 0;
            subItem = new Item({ master: new ItemMaster(dummyRadar), remodel: bonus.requiresIdLevel ? bonus.requiresIdLevel : 0 });
          }
          if (bonus.requiresSR && (tempItem.data.iconTypeId !== 11 || tempItem.data.scout < 5)) {
            // 水上電探条件(ベース装備自体が水上電探にカウントされない)場合、ダミー水上電探を搭載する
            dummyRadar.id = 999998;
            dummyRadar.antiAir = 0;
            dummyRadar.scout = 5;
            dummyRadar.accuracy = 0;
            subItem = new Item({ master: new ItemMaster(dummyRadar), remodel: bonus.requiresIdLevel ? bonus.requiresIdLevel : 0 });
          }
          if (bonus.requiresAccR && (tempItem.data.iconTypeId !== 11 || tempItem.data.accuracy < 8)) {
            dummyRadar.id = 999999;
            dummyRadar.antiAir = 0;
            dummyRadar.scout = 0;
            dummyRadar.accuracy = 8;
            subItem = new Item({ master: new ItemMaster(dummyRadar), remodel: bonus.requiresIdLevel ? bonus.requiresIdLevel : 0 });
          }
          if (bonus.requiresId) {
            // 指定装備
            const master = shipItems.find((v) => bonus.requiresId && bonus.requiresId.includes(v.id));
            // コレが搭載できないようならこのボーナスは無効
            if (!master || !ShipValidation.isValidItem(this.ship.data, master, 1)) {
              continue;
            }
            subItem = new Item({ master, remodel: bonus.requiresIdLevel ? bonus.requiresIdLevel : 0 });
          }
          if (bonus.requiresType) {
            // 何らかの装備種別
            const icon = shipItems.find((v) => bonus.requiresType && bonus.requiresType.includes(v.id));
            const master = new ItemMaster({
              id: 999999,
              type: +bonus.requiresType[0],
              itype: icon ? icon.iconTypeId : 0,
              name: 'ダミー装備',
            });
            subItem = new Item({ master, remodel: bonus.requiresIdLevel ? bonus.requiresIdLevel : 0 });
          }

          if (subItem.data.id) {
            if (bonus.requiresIdNum) {
              // 別の装備が必要で、かつその個数も複数必要なやつ
              const master = shipItems.find((v) => bonus.requiresId && bonus.requiresId.includes(v.id));
              for (let k = 0; k < bonus.requiresIdNum; k += 1) {
                requiredItems.push(new Item({ master, remodel: bonus.requiresIdLevel ? bonus.requiresIdLevel : 0 }));
              }
            } else {
              requiredItems.push(subItem);
            }

            if (bonus.requiresId2) {
              // 必須装備 その2条件
              // 指定装備
              const master = shipItems.find((v) => bonus.requiresId2 && bonus.requiresId2.includes(v.id));
              // コレが搭載できないようならこのボーナスは無効
              if (!master || !ShipValidation.isValidItem(this.ship.data, master, 1)) {
                continue;
              }
              requiredItems.push(new Item({ master, remodel: bonus.requiresIdLevel2 ? bonus.requiresIdLevel2 : 0 }));
            }
          } else if (bonus.num && bonus.num > 1) {
            // 別の装備がなくても発動するが、個数が必要な装備の場合
            for (let count = 0; count < bonus.num - 1; count += 1) {
              requiredItems.push(new Item({ master: item, remodel: bonus.remodel ? bonus.remodel : 0 }));
            }
          }

          if (!bonus.num) {
            // 累積可能ボーナスについて (累積可能 ≒ bonus.num の値が「ない」もの。いまところ、別装備が必要かつ累積可能であるものは存在しないっぽい）
            // その代わり、改修値に応じて累積可能ボーナスが徐々に追加されていくのが主流。
            // つまり、低改修値の累積可能ボーナスを先に格納し、高改修値のボーナスにそれらを引き継いでいく。
            // 低改修値のボーナスが先に格納されるように、上の方ですでにbonusのソートを済ませてある。

            // 全く同じ装備かつ改修値のものがあるかチェック
            const sameBonus = viewBonuses.find((v) => !v.raw.num && v.remodel === tempItem.remodel);
            if (sameBonus) {
              // 見つかったので、単純に加算
              sameBonus.bonus.accuracy = (sameBonus.bonus.accuracy ?? 0) + (bonus.bonus.accuracy ?? 0);
              sameBonus.bonus.antiAir = (sameBonus.bonus.antiAir ?? 0) + (bonus.bonus.antiAir ?? 0);
              sameBonus.bonus.armor = (sameBonus.bonus.armor ?? 0) + (bonus.bonus.armor ?? 0);
              sameBonus.bonus.asw = (sameBonus.bonus.asw ?? 0) + (bonus.bonus.asw ?? 0);
              sameBonus.bonus.avoid = (sameBonus.bonus.avoid ?? 0) + (bonus.bonus.avoid ?? 0);
              sameBonus.bonus.bomber = (sameBonus.bonus.bomber ?? 0) + (bonus.bonus.bomber ?? 0);
              sameBonus.bonus.firePower = (sameBonus.bonus.firePower ?? 0) + (bonus.bonus.firePower ?? 0);
              sameBonus.bonus.range = (sameBonus.bonus.range ?? 0) + (bonus.bonus.range ?? 0);
              sameBonus.bonus.scout = (sameBonus.bonus.scout ?? 0) + (bonus.bonus.scout ?? 0);
              sameBonus.bonus.torpedo = (sameBonus.bonus.torpedo ?? 0) + (bonus.bonus.torpedo ?? 0);
            } else {
              /** 引き継ぐために、低改修値のボーナスを精査 */
              const lowRemodelBonuses = viewBonuses.filter((v) => !v.raw.num && v.remodel < tempItem.remodel);
              if (lowRemodelBonuses.length) {
                // 低改修値のボーナスが見つかったので加算しつつ追加する
                const viewBonus = {
                  raw: bonus,
                  hasCond: !!bonus.remodel,
                  bonus: {
                    accuracy: bonus.bonus.accuracy ?? 0,
                    antiAir: bonus.bonus.antiAir ?? 0,
                    armor: bonus.bonus.armor ?? 0,
                    asw: bonus.bonus.asw ?? 0,
                    avoid: bonus.bonus.avoid ?? 0,
                    bomber: bonus.bonus.bomber ?? 0,
                    firePower: bonus.bonus.firePower ?? 0,
                    range: bonus.bonus.range ?? 0,
                    scout: bonus.bonus.scout ?? 0,
                    torpedo: bonus.bonus.torpedo ?? 0,
                  },
                  remodel: tempItem.remodel,
                  items: [tempItem],
                };

                // 一つ前の低改修値のボーナスを加算
                const lowBonus = lowRemodelBonuses[lowRemodelBonuses.length - 1].bonus;
                viewBonus.bonus.accuracy += lowBonus.accuracy ?? 0;
                viewBonus.bonus.antiAir += lowBonus.antiAir ?? 0;
                viewBonus.bonus.armor += lowBonus.armor ?? 0;
                viewBonus.bonus.asw += lowBonus.asw ?? 0;
                viewBonus.bonus.avoid += lowBonus.avoid ?? 0;
                viewBonus.bonus.bomber += lowBonus.bomber ?? 0;
                viewBonus.bonus.firePower += lowBonus.firePower ?? 0;
                viewBonus.bonus.range += lowBonus.range ?? 0;
                viewBonus.bonus.scout += lowBonus.scout ?? 0;
                viewBonus.bonus.torpedo += lowBonus.torpedo ?? 0;

                viewBonuses.push(viewBonus);
              } else {
                // 低改修値のボーナスが見つからなかったのでそのまま追加
                viewBonuses.push({
                  raw: bonus,
                  hasCond: !!bonus.remodel,
                  bonus: {
                    accuracy: bonus.bonus.accuracy ?? 0,
                    antiAir: bonus.bonus.antiAir ?? 0,
                    armor: bonus.bonus.armor ?? 0,
                    asw: bonus.bonus.asw ?? 0,
                    avoid: bonus.bonus.avoid ?? 0,
                    bomber: bonus.bonus.bomber ?? 0,
                    firePower: bonus.bonus.firePower ?? 0,
                    range: bonus.bonus.range ?? 0,
                    scout: bonus.bonus.scout ?? 0,
                    torpedo: bonus.bonus.torpedo ?? 0,
                  },
                  remodel: tempItem.remodel,
                  items: [tempItem],
                });
              }
            }
          } else {
            /** 今チェックしている装備ボーナスの発生する組み合わせを装備してみる艦娘オブジェクト */
            const tempShip = new Ship({ master: this.ship.data, items: requiredItems, exItem: tempItem });
            // 累積不可のボーナス
            const allItems = requiredItems.concat(tempItem);
            // 全く同じ装備構成がないかどうかをチェック
            if (!viewBonuses.some((v) => isEqual(allItems, v.items))) {
              viewBonuses.push({
                raw: bonus,
                hasCond: !!(
                  (bonus.num && bonus.num > 1)
                  || bonus.remodel
                  || bonus.requiresAR
                  || bonus.requiresAccR
                  || bonus.requiresId
                  || bonus.requiresIdNum
                  || bonus.requiresSR
                  || bonus.requiresType
                ),
                bonus: tempShip.itemBonusStatus,
                remodel: tempItem.remodel,
                items: allItems,
              });
            }
          }
        }

        if (!this.showMultiple) {
          // 累積不可ボーナスの表示OFFの場合
          viewBonuses = viewBonuses.filter((v) => v.raw.num);
        }
        if (!this.showOneTime) {
          // 累積不可ボーナスの表示OFFの場合
          viewBonuses = viewBonuses.filter((v) => !v.raw.num);
        }
        if (!viewBonuses.length) {
          // いろいろやった結果ボーナスが消えていたらこの装備はナシ
          continue;
        }

        // ソート
        viewBonuses.sort((a, b) => {
          // 累積化を後ろに
          if (a.raw.num && !b.raw.num) return -1;
          if (!a.raw.num && b.raw.num) return 1;
          if (a.raw.num && b.raw.num && a.raw.num !== b.raw.num) return a.raw.num - b.raw.num;
          // 条件なしは手前に
          if (a.hasCond && !b.hasCond) return 1;
          if (!a.hasCond && b.hasCond) return -1;
          // 装備組み合わせ系はなるべく後ろに
          if (a.raw.requiresId && !b.raw.requiresId) return 1;
          if (!a.raw.requiresId && b.raw.requiresId) return -1;
          // 装備組み合わせがある場合は必要装備が少ない順に
          if (a.raw.requiresId && b.raw.requiresId) return a.raw.requiresId.length - b.raw.requiresId.length;
          return a.remodel - b.remodel;
        });

        // 表示物の整頓
        const show: ItemBonusStatus = {
          accuracy: viewBonuses.some((v) => v.bonus.accuracy) ? 1 : 0,
          antiAir: viewBonuses.some((v) => v.bonus.antiAir) ? 1 : 0,
          armor: viewBonuses.some((v) => v.bonus.armor) ? 1 : 0,
          asw: viewBonuses.some((v) => v.bonus.asw) ? 1 : 0,
          avoid: viewBonuses.some((v) => v.bonus.avoid) ? 1 : 0,
          bomber: viewBonuses.some((v) => v.bonus.bomber) ? 1 : 0,
          firePower: viewBonuses.some((v) => v.bonus.firePower) ? 1 : 0,
          range: viewBonuses.some((v) => v.bonus.range) ? 1 : 0,
          scout: viewBonuses.some((v) => v.bonus.scout) ? 1 : 0,
          torpedo: viewBonuses.some((v) => v.bonus.torpedo) ? 1 : 0,
        };

        items.push({
          master: item,
          bonuses: viewBonuses,
          show,
          maxNum: max(viewBonuses.map((v) => v.raw.num ?? 0)) ?? 0,
          wiki: ItemMaster.getWikiURL(item),
        });
      }
      this.allBonuses = items;
    },
    async showShipList() {
      this.isMobile = window.innerWidth < 600;
      await (this.shipListDialog = true);
      (this.$refs.shipList as InstanceType<typeof ShipList>).initialize(false);
    },
    putShip(viewShip: ViewShip) {
      this.shipListDialog = false;
      this.ship = new Ship({ master: viewShip.ship });
      this.showMultiple = true;
      this.showOneTime = true;
      this.setItemBonus();
    },
    removeShip() {
      this.ship = new Ship();
      this.setItemBonus();
    },
    changeShipWidth(width: number) {
      this.shipDialogWidth = width;
    },
    closeDialog() {
      this.shipListDialog = false;
    },
  },
});
</script>
