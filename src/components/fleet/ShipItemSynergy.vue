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
                  <div v-if="k + 1 < detail.raw.requiresId.length" class="mx-1 text--secondary">or</div>
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
            <div v-if="row.show.scout" :class="{ 'no-change': !detail.bonus.scout }" class="bonus-status-item">
              <div>{{ $t("Common.索敵") }}</div>
              <div :class="{ 'bad-value': detail.bonus.scout < 0 }">{{ detail.bonus.scout }}</div>
            </div>
            <div v-if="row.show.avoid" :class="{ 'no-change': !detail.bonus.avoid }" class="bonus-status-item">
              <div>{{ $t("Common.回避") }}</div>
              <div :class="{ 'bad-value': detail.bonus.avoid < 0 }">{{ detail.bonus.avoid }}</div>
            </div>
            <div v-if="row.show.accuracy" :class="{ 'no-change': !detail.bonus.accuracy }" class="bonus-status-item">
              <div>{{ $t("Common.命中") }}</div>
              <div :class="{ 'bad-value': detail.bonus.accuracy < 0 }">{{ detail.bonus.accuracy }}</div>
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
      const shipItems = this.allItems.filter((v) => !v.isEnemyItem);
      for (let i = 0; i < shipItems.length; i += 1) {
        const item = shipItems[i];
        /** この装備に対するボーナスの入れ物 */
        let viewBonuses: { raw: Bonus; bonus: ItemBonusStatus; remodel: number; items: Item[]; hasCond: boolean }[] = [];
        // この装備が主語になっているボーナス情報を全取得
        const fitRaw = raw.filter((v) => (v.ids && v.ids.includes(item.id)) || (v.types && v.types.includes(item.apiTypeId)));

        /** ボーナス部分を取り出して統合したもの */
        let bonuses: Bonus[] = [];
        for (let j = 0; j < fitRaw.length; j += 1) {
          bonuses = bonuses.concat(fitRaw[j].bonuses);
        }

        bonuses.sort((a, b) => {
          // 個数制限(num)があるやつを手前に持ってくる
          if (a.num && !b.num) return -1;
          if (!a.num && b.num) return 1;
          if (a.num && b.num) return a.num - b.num;
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
          const tempItem = new Item({ master: item, remodel: bonus.remodel ? bonus.remodel : 0 });
          const requiredItems: Item[] = [];
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
            requiredItems.push(subItem);
          } else if (bonus.num && bonus.num > 1) {
            for (let count = 0; count < bonus.num - 1; count += 1) {
              requiredItems.push(new Item({ master: item, remodel: bonus.remodel ? bonus.remodel : 0 }));
            }
          }

          /** 今チェックしている装備ボーナスの発生する組み合わせを装備してみる艦娘オブジェクト */
          const tempShip = new Ship({ master: this.ship.data, items: requiredItems, exItem: tempItem });

          if (!bonus.num && !requiredItems.length) {
            // 単独装備かつ累積可能であるボーナスの取り扱いについて (累積可能 ≒ bonus.num の値がないもの)
            // 1. 搭載し続けても不動である純粋な累積可能ボーナス値を算出したい
            // 2. ダブる可能性があるので同じ補正値であるなら無視もしたい
            // Q. 単独装備でないかつ累積可能であるボーナスをどうする? そもそもそんなボーナスあるんか？いまんとこなさそう。
            // 累積可能部分を算出するために、限界まで追加
            const baseItem = new Item({ master: item, remodel: tempItem.remodel });
            const tempItems1: Item[] = [];
            const tempItems2: Item[] = [];
            for (let t = 0; t < this.ship.data.slotCount; t += 1) {
              tempItems1.push(baseItem);
              tempItems2.push(baseItem);
            }
            const multiShip1 = new Ship({ master: this.ship.data, items: tempItems1 });
            const testShip = new Ship({ master: this.ship.data, items: tempItems2, exItem: baseItem });
            // ボーナスの差分を採ることで、純粋な『累積可能ボーナス』が得られた
            if (testShip.itemBonusStatus.accuracy) testShip.itemBonusStatus.accuracy -= multiShip1.itemBonusStatus.accuracy ?? 0;
            if (testShip.itemBonusStatus.antiAir) testShip.itemBonusStatus.antiAir -= multiShip1.itemBonusStatus.antiAir ?? 0;
            if (testShip.itemBonusStatus.armor) testShip.itemBonusStatus.armor -= multiShip1.itemBonusStatus.armor ?? 0;
            if (testShip.itemBonusStatus.asw) testShip.itemBonusStatus.asw -= multiShip1.itemBonusStatus.asw ?? 0;
            if (testShip.itemBonusStatus.avoid) testShip.itemBonusStatus.avoid -= multiShip1.itemBonusStatus.avoid ?? 0;
            if (testShip.itemBonusStatus.bomber) testShip.itemBonusStatus.bomber -= multiShip1.itemBonusStatus.bomber ?? 0;
            if (testShip.itemBonusStatus.firePower) testShip.itemBonusStatus.firePower -= multiShip1.itemBonusStatus.firePower ?? 0;
            if (testShip.itemBonusStatus.range) testShip.itemBonusStatus.range -= multiShip1.itemBonusStatus.range ?? 0;
            if (testShip.itemBonusStatus.scout) testShip.itemBonusStatus.scout -= multiShip1.itemBonusStatus.scout ?? 0;
            if (testShip.itemBonusStatus.torpedo) testShip.itemBonusStatus.torpedo -= multiShip1.itemBonusStatus.torpedo ?? 0;

            if (
              !testShip.itemBonusStatus.accuracy
              && !testShip.itemBonusStatus.antiAir
              && !testShip.itemBonusStatus.armor
              && !testShip.itemBonusStatus.asw
              && !testShip.itemBonusStatus.avoid
              && !testShip.itemBonusStatus.bomber
              && !testShip.itemBonusStatus.firePower
              && !testShip.itemBonusStatus.range
              && !testShip.itemBonusStatus.scout
              && !testShip.itemBonusStatus.torpedo
            ) {
              // 全部0なら特になし => 潜水艦の53艦首みたいなアレ
              continue;
            }

            // 上記で求めた純粋な『累積可能ボーナス』を持つ他のデータが既に存在しているかどうかをチェック
            if (
              !viewBonuses.some(
                (v) => ((!v.raw.remodel && !baseItem.remodel) || v.raw.remodel === baseItem.remodel)
                  && v.bonus.accuracy === testShip.itemBonusStatus.accuracy
                  && v.bonus.antiAir === testShip.itemBonusStatus.antiAir
                  && v.bonus.armor === testShip.itemBonusStatus.armor
                  && v.bonus.asw === testShip.itemBonusStatus.asw
                  && v.bonus.avoid === testShip.itemBonusStatus.avoid
                  && v.bonus.bomber === testShip.itemBonusStatus.bomber
                  && v.bonus.firePower === testShip.itemBonusStatus.firePower
                  && v.bonus.range === testShip.itemBonusStatus.range
                  && v.bonus.scout === testShip.itemBonusStatus.scout
                  && v.bonus.torpedo === testShip.itemBonusStatus.torpedo,
              )
            ) {
              // この『累積可能ボーナス』は初めてのため追加可能
              viewBonuses.push({
                raw: bonus,
                hasCond: !!(bonus.remodel || bonus.requiresAR || bonus.requiresAccR || bonus.requiresId || bonus.requiresSR || bonus.requiresType),
                bonus: testShip.itemBonusStatus,
                remodel: tempItem.remodel,
                items: requiredItems.concat(tempItem),
              });
            }
          } else if (!viewBonuses.some((v) => isEqual(requiredItems, v.items))) {
            // 同じ装備構成かどうかをチェック

            viewBonuses.push({
              raw: bonus,
              hasCond: !!(
                (bonus.num && bonus.num > 1)
                || bonus.remodel
                || bonus.requiresAR
                || bonus.requiresAccR
                || bonus.requiresId
                || bonus.requiresSR
                || bonus.requiresType
              ),
              bonus: tempShip.itemBonusStatus,
              remodel: tempItem.remodel,
              items: requiredItems.concat(tempItem),
            });
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
