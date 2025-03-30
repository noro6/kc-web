<template>
  <div class="pa-2 container">
    <div class="d-flex">
      <div class="caption">{{ $t("Result.攻撃機選択") }}</div>
      <div class="header-divider" />
    </div>
    <div class="result-header-container">
      <div class="select-item-container">
        <div class="selectable-ship-container">
          <div
            v-for="(ship, i) in enabledShips"
            :key="`ship${i}`"
            v-ripple="{ class: 'info--text' }"
            class="ship-selectable"
            :class="{ selected: i === selectedShipIndex }"
            @click="clickedShip(i)"
            @keypress.enter="clickedShip(i)"
          >
            <div class="align-self-center">
              <v-img :src="`./img/ship/banner/${ship.data.id}.png`" height="30" width="120" />
            </div>
          </div>
        </div>
        <div v-if="items.length">
          <div class="selectable-item-container">
            <div
              v-for="(item, i) in items"
              :key="`item_${i}`"
              v-ripple="{ class: 'info--text' }"
              class="selectable-item"
              :class="{ selected: i === selectedItemIndex, edited: i === selectedItemIndex && isManualItem }"
              @click="clickedItem(i)"
              @keypress.enter="clickedItem(i)"
            >
              <div class="caption item-slot">{{ item.fullSlot }}</div>
              <div class="mx-1">
                <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" width="30" height="30" />
              </div>
              <div class="body-2 text-truncate item-name">{{ needTrans ? $t(`${item.data.name}`) : item.data.name }}</div>
              <div class="ml-auto caption">{{ $t("Common.対潜") }}</div>
              <div class="item-asw caption">{{ item.data.asw }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="border-left pl-2">
        <div class="d-flex pt-3">
          <v-text-field
            class="mr-1"
            type="number"
            min="0"
            max="999"
            v-model.number="slot"
            :label="$t('Result.搭載数')"
            outlined
            dense
            :rules="[rules.counter]"
            @input="calculate()"
          />
          <v-text-field
            class="ml-1"
            type="number"
            min="0"
            max="999"
            v-model.number="asw"
            :label="$t('Common.対潜')"
            outlined
            dense
            :rules="[rules.counter]"
            @input="calculate()"
          />
        </div>
        <v-text-field
          type="number"
          min="-99"
          max="0"
          step="0.1"
          v-model.number="armorDeBuff"
          :label="$t('Common.装甲減少')"
          outlined
          dense
          :rules="[rules.counter2]"
          @input="calculate()"
        />
        <v-checkbox class="mt-0 pt-0" :label="$t('Result.クリティカル')" dense hide-details v-model="isCritical" @change="calculate()" />
      </div>
    </div>
    <div class="d-flex">
      <div class="caption">{{ $t("Result.計算結果") }}</div>
      <div class="header-divider" />
    </div>
    <div>
      <div class="d-flex flex-wrap">
        <v-checkbox class="mr-5 ml-2" :label="$t('Result.姫級表示')" v-model="displayPrincess" dense hide-details @change="calculate()" />
        <div class="ml-auto d-flex">
          <div class="align-self-end caption">{{ $t("Result.対潜火力(確率)") }}</div>
          <div class="d-flex align-self-end">
            <div v-for="(powerString, i) in powers" :key="`power${i}`" class="ml-3 caption">{{ powerString }}</div>
          </div>
        </div>
      </div>
      <v-divider class="mt-2" />
      <v-simple-table fixed-header :height="isMobile ? '50vh' : '34vh'">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="py-1 pl-1 text-left" />
              <th class="pr-1 py-1">{{ $t("Common.耐久") }}</th>
              <th class="pr-1">{{ $t("Common.装甲") }}</th>
              <th class="pr-1 text-no-wrap">{{ $t("Result.ダメージ幅") }}</th>
              <th class="pr-1">{{ $t("Result.撃沈率") }}</th>
              <th class="pr-1">{{ $t("Result.大破率") }}</th>
              <th class="pr-1">{{ $t("Result.中破率") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, i) in enemyRows"
              :key="`enemy${i}`"
              :class="{
                'tr-death': row.death >= 90,
                'tr-damaged': row.death + row.taiha >= 70,
                'tr-half-damaged': row.death + row.taiha + row.chuha >= 50,
              }"
            >
              <td class="d-flex pl-1 enemy-name-td">
                <div class="align-self-center mr-1">
                  <v-img :src="`./img/ship/banner/${row.enemy.data.id}.png`" height="30" width="120" />
                </div>
                <div class="align-self-center d-none d-sm-block flex-grow-1">
                  <div class="text-left enemy-id primary--text">id {{ row.enemy.data.id }}</div>
                  <div class="d-flex">
                    <div class="caption text-truncate">{{ getEnemyName(row.enemy.data.name) }}</div>
                  </div>
                </div>
              </td>
              <td class="pr-1">{{ row.enemy.data.hp }}</td>
              <td class="pr-1">{{ row.enemy.actualArmor }}</td>
              <td class="pr-1 text-no-wrap">{{ row.damage }}</td>
              <template v-if="row.death < 100">
                <td class="pr-1">{{ row.damage ? row.death + "%" : "" }}</td>
                <td class="pr-1">{{ row.damage ? row.taiha + "%" : "" }}</td>
                <td class="pr-1">{{ row.damage ? row.chuha + "%" : "" }}</td>
              </template>
              <template v-else>
                <td class="pr-1" />
                <td class="pr-1 red--text">{{ $t("Result.確殺") }}</td>
                <td class="pr-1" />
              </template>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
  </div>
</template>

<style scoped>
.select-item-container {
  display: grid;
  grid-template-columns: 140px 1fr;
  column-gap: 4px;
  overflow: hidden;
  flex-grow: 1;
}
.selectable-item-container {
  display: flex;
  flex-direction: column;
}
@media (min-width: 600px) {
  .result-header-container {
    display: flex;
  }
}
.selectable-ship-container {
  height: 180px;
  overflow-y: auto;
}
.selectable-item-container {
  display: flex;
  flex-direction: column;
  height: 180px;
}

.ship-selectable {
  display: flex;
  justify-content: center;
  cursor: pointer;
  padding: 0.2rem;
  transition: 0.1s;
  border: 1px solid transparent;
  border-radius: 2px;
}
.ship-selectable:hover,
.selectable-item:hover {
  background-color: rgba(0, 164, 255, 0.1);
}
.ship-selectable.selected,
.selectable-item.selected {
  background-color: rgba(0, 164, 255, 0.1);
  border-color: rgba(0, 164, 255, 0.6);
}

.selectable-item.edited {
  background-color: rgba(255, 164, 0, 0.1);
  border-color: rgba(255, 164, 0, 0.6);
}

.selectable-item-container {
  display: flex;
  flex-direction: column;
  height: 200px;
}
.selectable-item {
  display: flex;
  cursor: pointer;
  transition: 0.1s;
  padding-right: 0.5rem;
  border: 1px solid transparent;
  border-radius: 2px;
}
.selectable-item > div {
  align-self: center;
}
.item-slot,
.item-asw {
  width: 24px;
  text-align: right;
}
.item-name {
  flex-grow: 1;
  width: 10px;
  font-size: 12px;
}
@media (min-width: 600px) {
  .item-name {
    font-size: 14px;
  }
}

.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}
.border-left {
  border-top: 1px solid rgba(128, 128, 128, 0.4);
  margin-bottom: 8px;
}
@media (min-width: 600px) {
  .border-left {
    border-top: unset;
    border-left: 1px solid rgba(128, 128, 128, 0.4);
    margin-bottom: unset;
  }
}
.enemy-id {
  font-size: 11px;
  height: 13px;
}
.v-data-table thead th {
  white-space: nowrap;
  height: 36px !important;
}
.v-data-table tbody td {
  white-space: nowrap;
  height: unset !important;
}
.v-data-table tbody tr.tr-half-damaged {
  background-color: rgba(255, 255, 10, 0.075);
}
.v-data-table tbody tr.tr-half-damaged:hover {
  background-color: rgba(255, 255, 10, 0.15) !important;
}
.v-data-table tbody tr.tr-damaged {
  background-color: rgba(255, 10, 10, 0.075);
}
.v-data-table tbody tr.tr-damaged:hover {
  background-color: rgba(255, 10, 10, 0.15) !important;
}
.v-data-table tbody tr.tr-death {
  background-color: rgba(0, 150, 255, 0.075);
}
.v-data-table tbody tr.tr-death:hover {
  background-color: rgba(0, 150, 255, 0.15) !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import max from 'lodash/max';
import min from 'lodash/min';
import sum from 'lodash/sum';
import Const, { SHIP_TYPE } from '@/classes/const';
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Fleet from '@/classes/fleet/fleet';
import Ship from '@/classes/fleet/ship';
import Item from '@/classes/item/item';
import ItemMaster from '@/classes/item/itemMaster';
import AerialFirePowerCalculator from '@/classes/aerialCombat/powerCalculator';
import CommonCalc from '@/classes/commonCalc';
import SiteSetting from '@/classes/siteSetting';

interface DamageRow {
  enemy: Enemy;
  damage: string;
  death: number;
  taiha: number;
  chuha: number;
}

export default Vue.extend({
  name: 'AntiSubmarineSupport',
  props: {
    fleet: {
      type: Fleet,
      required: true,
    },
  },
  data: () => ({
    enemies: [] as Enemy[],
    displayPrincess: false,
    selectedShipIndex: 0,
    selectedItemIndex: 0,
    slot: 18,
    asw: 10,
    armorDeBuff: 0,
    isCritical: false,
    enemyRows: [] as DamageRow[],
    powers: [] as string[],
    rules: {
      counter: (value: number) => (value <= 999 && value >= 0) || '0 ~ 999までが有効です。',
      counter2: (value: number) => (value >= -99 && value <= 0) || '0 ~ -99までが有効です。',
    },
    isMobile: true,
  }),
  mounted() {
    const enemies = this.$store.getters.getEnemies as EnemyMaster[];
    const items = this.$store.state.items as ItemMaster[];

    for (let i = 0; i < enemies.length; i += 1) {
      const enemy = enemies[i];

      if (enemy.type === SHIP_TYPE.SS || enemy.type === SHIP_TYPE.SSV) {
        this.enemies.push(Enemy.createEnemyFromMaster(enemy, false, items));
      }
    }

    if (this.enabledShips.length) {
      this.clickedShip(0);
    } else {
      this.calculate();
    }
  },
  computed: {
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    enabledShips(): Ship[] {
      return this.fleet.ships.filter((v) => v.items.some((w) => w.fullSlot));
    },
    items(): Item[] {
      const ship = this.enabledShips[this.selectedShipIndex];
      if (ship) {
        return ship.items.filter((v) => v.fullSlot);
      }
      return [];
    },
    displayEnemies(): Enemy[] {
      if (this.displayPrincess) {
        return this.enemies;
      }
      return this.enemies.filter((v) => v.data.id <= 1600);
    },
    isManualItem(): boolean {
      const item = this.items[this.selectedItemIndex];
      if (item) {
        return item.fullSlot !== this.slot || item.data.asw !== this.asw;
      }
      return true;
    },
  },
  methods: {
    clickedShip(index: number) {
      this.selectedShipIndex = index;
      const item = this.items[this.selectedItemIndex];

      // なんか違う装備だったら探してみる
      if (!item || !item.fullSlot || !Const.ENABLED_ASW_SUPPORT.includes(item.data.apiTypeId)) {
        const newItemIndex = this.items.findIndex((v) => Const.ENABLED_ASW_SUPPORT.includes(v.data.apiTypeId));
        if (newItemIndex >= 0) {
          this.selectedItemIndex = newItemIndex;
        }
      }
      const ship = this.enabledShips[this.selectedShipIndex];
      if (ship) {
        this.armorDeBuff = Math.round(1000 * ship.getAswArmorDeBuff()) / 1000;
      }

      this.clickedItem(this.selectedItemIndex);
    },
    clickedItem(index: number) {
      this.selectedItemIndex = index;
      const item = this.items[index];
      if (item) {
        this.slot = item.fullSlot;
        this.asw = item.data.asw;

        if (!Const.ENABLED_ASW_SUPPORT.includes(item.data.apiTypeId)) {
          this.slot = 0;
        }
      } else {
        this.slot = 0;
        this.asw = 0;
      }

      this.calculate();
    },
    calculate() {
      this.isMobile = window.innerWidth < 600;
      // 検証
      if (!this.asw || this.asw < 0) {
        this.asw = 0;
      }
      if (!this.slot || this.slot < 0) {
        this.slot = 0;
      }
      if (this.asw > 999) {
        this.asw = 999;
      }
      if (this.slot > 999) {
        this.slot = 999;
      }

      const powers = AerialFirePowerCalculator.getAswSupportFirePowers(this.asw, this.slot, this.isCritical);
      this.powers = powers.map((v) => `${Math.floor(100 * v.power) / 100}(${100 * v.rate}%)`);

      const armorDeBuff = Math.min(this.armorDeBuff, 0);
      if (this.armorDeBuff !== armorDeBuff) {
        this.armorDeBuff = armorDeBuff;
      }

      const enemies = this.displayEnemies;
      this.enemyRows = [];
      for (let i = 0; i < enemies.length; i += 1) {
        const enemy = enemies[i];
        const HP = enemy.data.hp;

        // 火力分布より、被ダメージ分布を取得
        const armor = Math.max(enemy.actualArmor + armorDeBuff, 1);
        const damageDist = CommonCalc.getDamageDistribution(powers, armor, 1, HP, true);
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
        const row: DamageRow = {
          enemy,
          damage: `${minDamage} ~ ${maxDamage}`,
          death: Math.floor(damageBorders[0].rate * 1000) / 10,
          taiha: Math.floor(damageBorders[1].rate * 1000) / 10,
          chuha: Math.floor(damageBorders[2].rate * 1000) / 10,
        };

        // 割合ダメージチェック
        if (minDamage === 0) {
          row.damage = `${this.$t('Result.割合ダメージ')} ~ ${maxDamage}`;
        }
        if (maxDamage === 0) {
          row.damage = `${this.$t('Result.割合ダメージ')}`;
        }
        if (this.slot <= 0) {
          row.damage = '';
          this.slot = 0;
        }
        if (this.asw <= 0) {
          row.damage = '';
          this.asw = 0;
        }

        this.enemyRows.push(row);
      }

      if (!this.displayPrincess) {
        // 装甲順
        this.enemyRows.sort((a, b) => {
          if (a.enemy.data.armor !== b.enemy.data.armor) {
            return a.enemy.data.armor - b.enemy.data.armor;
          }
          return b.enemy.data.hp - a.enemy.data.hp;
        });
      }
    },
    getEnemyName(name: string): string {
      if (name && this.needTrans) {
        const shipName = EnemyMaster.getSuffix(name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return name || '';
    },
  },
});
</script>
