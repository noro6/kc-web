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
            <v-img :src="`./img/ship/banner/${ship.data.id}.png`" height="30" width="120" />
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
              <div v-if="detail.count > 1" class="d-flex align-center">
                <div>
                  <v-img :src="`./img/type/icon${row.master.iconTypeId}.png`" height="20" width="20" />
                </div>
                <div>{{ needTrans ? $t(`${row.master.name}`) : row.master.name }}</div>
                <div v-if="detail.remodel">
                  <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
                  <span class="teal--text text--accent-4 caption" v-if="detail.remodel === 10">max</span>
                  <span class="teal--text text--accent-4 body-2" v-else>&plus;{{ detail.remodel }}</span>
                </div>
                <div class="ml-1 align-self-end">x{{ detail.count }}</div>
              </div>
              <!-- 改修条件 -->
              <div v-else-if="detail.remodel">
                <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
                <span class="teal--text text--accent-4 caption" v-if="detail.remodel === 10">max</span>
                <span class="teal--text text--accent-4 body-2" v-else>&plus;{{ detail.remodel }}</span>
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
              <div v-if="detail.showRequiresId && detail.raw.requiresId" class="d-flex flex-wrap">
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
                  <div v-if="k + 1 < detail.raw.requiresId2.length" class="mx-1 text--secondary">or</div>
                </div>
              </div>
              <!-- 同時に満たす装備条件 -->
              <template v-if="detail.raw.requiresEquipList">
                <div v-for="(group, g) in detail.raw.requiresEquipList" :key="`equip-list-${g}`" class="d-flex flex-wrap">
                  <div v-for="(id, k) in group.requiresId" :key="`equip-list-${g}-${id}`" class="d-flex align-center">
                    <div v-if="k === 0 && (g > 0 || detail.showRequiresId || detail.raw.requiresId2)" class="mr-1 text--secondary">&plus;</div>
                    <div>
                      <v-img :src="`./img/type/icon${getItem(id).iconTypeId}.png`" height="20" width="20" />
                    </div>
                    <div>{{ needTrans ? $t(`${getItem(id).name}`) : getItem(id).name }}</div>
                    <div v-if="group.requiresIdLevel">
                      <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
                      <span class="teal--text text--accent-4 caption" v-if="group.requiresIdLevel === 10">max</span>
                      <span class="teal--text text--accent-4 body-2" v-else>&plus;{{ group.requiresIdLevel }}</span>
                    </div>
                    <div v-if="group.requiresIdNum" class="ml-1 align-self-end">x{{ group.requiresIdNum }}</div>
                    <div v-if="k + 1 < group.requiresId.length" class="mx-1 text--secondary">or</div>
                  </div>
                </div>
              </template>
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
            <div class="ml-auto caption text--secondary">{{ detail.key }}</div>
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
import SiteSetting from '@/classes/siteSetting';
import ItemBonus, { Bonus, ItemBonusStatus, Bonuses } from '@/classes/item/ItemBonus';
import Ship from '@/classes/fleet/ship';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipValidation from '@/classes/fleet/shipValidation';
import Item from '@/classes/item/item';
import ShipList, { ViewShip } from './ShipList.vue';
import Const from '../../classes/const';

const STATUS_KEYS = ['firePower', 'torpedo', 'antiAir', 'armor', 'asw', 'scout', 'avoid', 'accuracy', 'bomber', 'range'] as const;
type StatusValues = Record<typeof STATUS_KEYS[number], number>;

type BonusDetail = {
  /** 重複排除用。累積可否 + 装備構成 */
  key: string;
  /** この構成を作る元になったボーナス */
  raw: Bonus;
  /** 累積可なら対象装備1つあたり、累積不可なら1隻あたりの上昇値 */
  bonus: StatusValues;
  remodel: number;
  /** 対象装備の必要搭載数 */
  count: number;
  hasCond: boolean;
  /** 対象装備自身のみを要求する requiresId は count で表示済みなので出さない */
  showRequiresId: boolean;
};

type BonusRow = {
  master: ItemMaster;
  bonuses: BonusDetail[];
  show: ItemBonusStatus;
  wiki: string;
};

/** ダミー装備。id は実在しない値にして、装備id指定の装備ボーナスに引っかからないようにする */
const createDummyItem = (id: number, type: number, itype: number, status: { antiAir?: number; scout?: number; accuracy?: number } = {}) => new Item({
  master: new ItemMaster({
    id, type, itype, name: 'ダミー装備', ...status,
  }),
});

/** ダミー電探。種別は小型電探 */
const createDummyRadar = (id: number, status: { antiAir?: number; scout?: number; accuracy?: number }) => createDummyItem(id, 12, 11, status);

/** ボーナスのグループが指定装備を対象としているか。Ship.getActiveItemBonuses と同じく types を優先する */
const isBonusGroupOf = (group: Bonuses, item: ItemMaster): boolean => {
  if (group.types) return group.types.includes(item.apiTypeId);
  return !!group.ids && group.ids.includes(item.id);
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
    canEquip(item: ItemMaster, remodel = 0): boolean {
      const ship = this.ship.data;
      return ShipValidation.isValidItem(ship, item) || ShipValidation.isValidItem(ship, item, Const.EXPAND_SLOT_INDEX, remodel);
    },
    setItemBonus() {
      this.allItems = this.$store.state.items as ItemMaster[];
      this.allBonuses = [];

      const ship = this.ship.data;
      if (!ship.id) {
        return;
      }

      /** 敵装備以外の全装備 */
      const shipItems = this.allItems.filter((v) => !v.isEnemyItem);
      /** 選択された艦娘に該当するボーナスを持つグループ */
      const groups = ItemBonus.bonusData.filter((v) => v.bonuses && v.bonuses.some((w) => Ship.bonusShipMatches(w, ship)));

      const rows: BonusRow[] = [];
      for (let i = 0; i < shipItems.length; i += 1) {
        const item = shipItems[i];
        if (!this.canEquip(item, 10)) {
          continue;
        }

        let details: BonusDetail[] = [];
        const fitGroups = groups.filter((v) => isBonusGroupOf(v, item));
        for (let j = 0; j < fitGroups.length; j += 1) {
          const { bonuses } = fitGroups[j];
          for (let k = 0; k < bonuses.length; k += 1) {
            if (Ship.bonusShipMatches(bonuses[k], ship)) {
              const detail = this.createBonusDetail(item, bonuses[k], shipItems);
              if (detail && !details.some((v) => v.key === detail.key)) {
                details.push(detail);
              }
            }
          }
        }

        if (!this.showMultiple) {
          details = details.filter((v) => v.raw.num);
        }
        if (!this.showOneTime) {
          details = details.filter((v) => !v.raw.num);
        }
        if (!details.length) {
          continue;
        }

        details.sort((a, b) => {
          // 累積不可を手前に
          if (a.raw.num && !b.raw.num) return -1;
          if (!a.raw.num && b.raw.num) return 1;
          if (a.count !== b.count) return a.count - b.count;
          // 条件なしは手前に
          if (a.hasCond && !b.hasCond) return 1;
          if (!a.hasCond && b.hasCond) return -1;
          // 装備組み合わせ系はなるべく後ろに
          if (a.showRequiresId && !b.showRequiresId) return 1;
          if (!a.showRequiresId && b.showRequiresId) return -1;
          return a.remodel - b.remodel;
        });

        const show: ItemBonusStatus = {};
        STATUS_KEYS.forEach((key) => {
          show[key] = details.some((v) => v.bonus[key]) ? 1 : 0;
        });

        rows.push({
          master: item,
          bonuses: details,
          show,
          wiki: ItemMaster.getWikiURL(item),
        });
      }
      this.allBonuses = rows;
    },
    /**
     * 指定ボーナスが発動する最小構成を組み、その構成で対象装備が生むボーナスを算出する
     * 判定は Ship.getActiveItemBonuses に任せ、対象装備を外した構成との差分を取る
     * @param {ItemMaster} item 対象装備
     * @param {Bonus} bonus 対象装備のボーナス
     * @param {ItemMaster[]} shipItems 必要装備の候補
     * @return {*}  {(BonusDetail | null)} 発動不可能な場合は null
     */
    createBonusDetail(item: ItemMaster, bonus: Bonus, shipItems: ItemMaster[]): BonusDetail | null {
      const ship = this.ship.data;
      let remodel = bonus.remodel ?? 0;
      let count = bonus.num ?? 1;
      /** 対象装備以外に必要な装備 */
      const others: Item[] = [];

      /** 装備id条件を満たす装備を追加する。対象装備自身で満たせるなら対象装備の数と改修値を引き上げる */
      const addRequiredIds = (ids: number[], num = 1, level = 0): boolean => {
        if (ids.includes(item.id)) {
          count = Math.max(count, num);
          remodel = Math.max(remodel, level);
          return true;
        }
        const master = shipItems.find((v) => ids.includes(v.id) && this.canEquip(v, level));
        if (!master) {
          return false;
        }
        for (let i = 0; i < num; i += 1) {
          others.push(new Item({ master, remodel: level }));
        }
        return true;
      };

      if (bonus.requiresId && !addRequiredIds(bonus.requiresId, bonus.requiresIdNum, bonus.requiresIdLevel)) {
        return null;
      }
      if (bonus.requiresId2 && !addRequiredIds(bonus.requiresId2, 1, bonus.requiresIdLevel2)) {
        return null;
      }
      if (bonus.requiresEquipList) {
        for (let i = 0; i < bonus.requiresEquipList.length; i += 1) {
          const group = bonus.requiresEquipList[i];
          if (!addRequiredIds(group.requiresId, group.requiresIdNum, group.requiresIdLevel)) {
            return null;
          }
        }
      }

      // 改修できない装備の改修値条件は出さない
      if (remodel && !item.canRemodel) {
        return null;
      }
      if (item.id === 366 && remodel > 4) {
        return null;
      }

      const { requiresType } = bonus;
      if (requiresType && !requiresType.includes(item.apiTypeId)) {
        const master = shipItems.find((v) => requiresType.includes(v.apiTypeId) && this.canEquip(v));
        if (!master) {
          return null;
        }
        others.push(createDummyItem(999996, master.apiTypeId, master.iconTypeId));
      }

      const subjects: Item[] = [];
      for (let i = 0; i < count; i += 1) {
        subjects.push(new Item({ master: item, remodel }));
      }

      // 電探条件は、構成内の装備で満たせなければダミー電探で満たす
      const loaded = subjects.concat(others);
      if (bonus.requiresAR && !loaded.some((v) => v.data.isAntiAirRadar)) {
        others.push(createDummyRadar(999997, { antiAir: 2 }));
      }
      if (bonus.requiresSR && !loaded.some((v) => v.data.isSurfaceRadar)) {
        others.push(createDummyRadar(999998, { scout: 5 }));
      }
      if (bonus.requiresAccR && !loaded.some((v) => v.data.isAccuracyRadar)) {
        others.push(createDummyRadar(999999, { accuracy: 8 }));
      }

      if (subjects.length + others.length > ship.slotCount + 1) {
        return null;
      }

      const actives = Ship.getActiveItemBonuses(ship, subjects.concat(others));
      if (!actives.some((v) => v.bonus === bonus)) {
        return null;
      }
      const baseActives = Ship.getActiveItemBonuses(ship, others);

      // 対象装備のグループのうち、累積可否が同じボーナスのみを集計する
      const isOneTime = !!bonus.num;
      const total = Object.fromEntries(STATUS_KEYS.map((key) => [key, 0])) as StatusValues;
      for (let i = 0; i < actives.length; i += 1) {
        const active = actives[i];
        if (!!active.bonus.num === isOneTime && isBonusGroupOf(active.group, item)) {
          const baseActive = baseActives.find((v) => v.bonus === active.bonus);
          const times = active.sources.length - (baseActive ? baseActive.sources.length : 0);
          STATUS_KEYS.forEach((key) => {
            total[key] += (active.bonus.bonus[key] ?? 0) * times;
          });
        }
      }
      if (!isOneTime && count > 1) {
        STATUS_KEYS.forEach((key) => {
          total[key] /= count;
        });
      }
      if (STATUS_KEYS.every((key) => !total[key])) {
        return null;
      }

      const othersKey = others.map((v) => `${v.data.id}:${v.remodel}`).sort().join(',');
      return {
        key: `${isOneTime ? 1 : 0}|${remodel}x${count}|${othersKey}`,
        raw: bonus,
        bonus: total,
        remodel,
        count,
        hasCond: count > 1 || remodel > 0 || !!(
          bonus.requiresId
          || bonus.requiresId2
          || bonus.requiresEquipList
          || bonus.requiresType
          || bonus.requiresSR
          || bonus.requiresAR
          || bonus.requiresAccR
        ),
        showRequiresId: !!bonus.requiresId && !(bonus.requiresId.length === 1 && bonus.requiresId[0] === item.id),
      };
    },
    async showShipList() {
      this.isMobile = window.innerWidth < 600;
      await (this.shipListDialog = true);
      (this.$refs.shipList as InstanceType<typeof ShipList>).initialize(false);
    },
    putShip(viewShip: ViewShip) {
      this.shipListDialog = false;
      this.ship = new Ship({ master: viewShip.ship, slots: viewShip.slots });
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
