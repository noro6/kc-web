<template>
  <div class="pa-2 container">
    <div class="d-flex">
      <div class="caption">{{ $t("Result.攻撃機選択") }}</div>
      <div class="header-divider" />
    </div>
    <div class="select-item-container">
      <div>
        <div class="selectable-ship-container">
          <div
            v-for="(ship, i) in enabledShips"
            :key="`ship${i}`"
            v-ripple="{ class: 'info--text' }"
            class="ship-selectable"
            :class="{ selected: i === selectedShipIndex }"
            @click="clickedShip(i)"
            @keypress.enter="clickedShip(i)"
            tabindex="0"
          >
            <div class="align-self-center">
              <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120" />
            </div>
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
            :class="{ selected: i === selectedItemIndex }"
            @click="clickedItem(i)"
            @keypress.enter="clickedItem(i)"
            tabindex="0"
          >
            <div class="caption item-slot">{{ item.fullSlot }}</div>
            <div class="mx-1">
              <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" width="30" height="30" />
            </div>
            <div class="body-2 text-truncate item-name">{{ needTrans ? $t(`${item.data.name}`) : item.data.name }}</div>
            <div class="ml-auto caption" v-if="item.data.isTorpedoAttacker">{{ $t("Common.雷装") }}</div>
            <div class="ml-auto caption" v-else-if="item.data.isAttacker">{{ $t("Common.爆装") }}</div>
            <div class="item-torpedo caption" v-if="item.data.isTorpedoAttacker">{{ item.data.torpedo }}</div>
            <div class="item-torpedo caption" v-else-if="item.data.isAttacker">{{ item.data.bomber }}</div>
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
        </div>
        <v-checkbox class="mt-0 pt-0" :label="$t('Result.クリティカル')" dense hide-details v-model="isCritical" @change="calculate()" />
        <div class="d-flex" v-if="selectedItem && selectedItem.data.isTorpedoAttacker">
          <v-checkbox
            :label="$t('Result.倍率x', { number: 0.8 })"
            dense
            hide-details
            v-model="torpedoMultiplier1"
            :error="!multipliers.length"
            @change="calculate()"
          />
          <v-checkbox
            class="ml-3"
            :label="$t('Result.倍率x', { number: 1.5 })"
            dense
            hide-details
            v-model="torpedoMultiplier2"
            :error="!multipliers.length"
            @change="calculate()"
          />
        </div>
      </div>
    </div>
    <div class="d-flex pt-1">
      <div class="caption">{{ $t("Result.計算結果") }}</div>
      <div class="header-divider" />
    </div>
    <div>
      <div class="d-flex flex-wrap">
        <div class="align-self-end caption mr-3">{{ $t("Result.防御艦隊") }}</div>
        <div>
          <v-select v-model="defenseIndex" :items="defenseFleets" hide-details dense @change="calculate" />
        </div>
        <div class="ml-auto d-flex">
          <div class="align-self-end caption">{{ $t("Result.航空支援火力") }}</div>
          <div class="d-flex align-self-end">
            <div v-for="(powerString, i) in powers" :key="`power${i}`" class="ml-3 caption">{{ powerString }}</div>
          </div>
        </div>
      </div>
      <v-divider class="mt-2" />
      <v-simple-table fixed-header height="38vh">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="py-1 pl-1 text-left" />
              <th class="pr-1 py-1">{{ $t("Common.耐久") }}</th>
              <th class="pr-1">{{ $t("Common.装甲") }}</th>
              <th class="text-no-wrap pr-1">{{ $t("Result.ダメージ幅") }}</th>
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
                  <v-img :src="`./img/ship/${row.enemy.data.id}.png`" height="30" width="120" />
                </div>
                <div class="align-self-center d-none d-sm-block flex-grow-1">
                  <div class="text-left enemy-id primary--text">id {{ row.enemy.data.id }}</div>
                  <div class="d-flex">
                    <div class="caption text-truncate">{{ getEnemyName(row.enemy.data.name) }}</div>
                  </div>
                </div>
              </td>
              <td v-if="row.disabledASW" colspan="6" class="text-center caption">{{ $t("Result.対潜支援火力計算機で確認してください") }}</td>
              <template v-else>
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
  grid-template-columns: 140px 1fr 0.5fr;
  column-gap: 0.5rem;
  height: 160px;
  overflow: hidden;
}

.selectable-ship-container {
  height: 160px;
  overflow-y: auto;
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
.item-torpedo {
  width: 24px;
  text-align: right;
}
.item-name {
  flex-grow: 1;
  width: 10px;
}

.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}
.border-left {
  border-left: 1px solid rgba(128, 128, 128, 0.4);
}
.enemy-id {
  font-size: 11px;
  height: 13px;
}
.v-data-table thead th {
  height: 36px !important;
  background-color: rgb(242, 242, 242) !important;
}
.theme--dark .v-data-table thead th {
  background-color: rgb(49, 49, 53) !important;
}
.v-data-table tbody td {
  background-color: unset !important;
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
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Fleet from '@/classes/fleet/fleet';
import Ship from '@/classes/fleet/ship';
import Item from '@/classes/item/item';
import ItemMaster from '@/classes/item/itemMaster';
import AerialFirePowerCalculator, { FirePowerCalcArgs } from '@/classes/aerialCombat/powerCalculator';
import CommonCalc from '@/classes/commonCalc';
import SiteSetting from '@/classes/siteSetting';
import CalcManager from '@/classes/calcManager';
import ShipMaster from '@/classes/fleet/shipMaster';
import SaveData from '@/classes/saveData/saveData';

interface DamageRow {
  enemy: Enemy;
  damage: string;
  death: number;
  taiha: number;
  chuha: number;
  disabledASW: boolean;
}

export default Vue.extend({
  name: 'AirstrikeSupport',
  props: {
    fleet: {
      type: Fleet,
      required: true,
    },
  },
  data: () => ({
    enemies: [] as Enemy[],
    calcManager: new CalcManager(),
    selectedShipIndex: 0,
    selectedItemIndex: 0,
    slot: 18,
    torpedoMultiplier1: true,
    torpedoMultiplier2: true,
    isCritical: false,
    defenseIndex: 0,
    defenseFleets: [] as { text: string; value: number; ships: Enemy[]; isUnion: boolean }[],
    enemyRows: [] as DamageRow[],
    powers: [] as string[],
    rules: {
      counter: (value: number) => (value <= 999 && value >= 0) || '0 ~ 999までが有効です。',
      counter2: (value: number) => (value >= -99 && value <= 0) || '0 ~ -99までが有効です。',
    },
  }),
  mounted() {
    const saveData = this.$store.state.mainSaveData as SaveData;
    const items = this.$store.state.items as ItemMaster[];
    const ships = this.$store.state.ships as ShipMaster[];
    const enemies = this.$store.getters.getEnemies as EnemyMaster[];

    this.calcManager = saveData.loadManagerData(items, ships, enemies);

    const { fleets } = this.calcManager.battleInfo;
    // 防御側セレクトに敵艦隊をセット
    for (let i = 0; i < fleets.length; i += 1) {
      const enabledEnemies = fleets[i].enemies.filter((v) => v.data.id);
      this.defenseFleets.push({
        text: `${this.$t('Result.x戦目', { number: i + 1 })}`,
        value: i,
        ships: enabledEnemies,
        isUnion: fleets[i].isUnion,
      });
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
      return this.fleet.ships.filter((v) => v.items.some((w) => w.data.isAttacker));
    },
    items(): Item[] {
      const ship = this.enabledShips[this.selectedShipIndex];
      if (ship) {
        return ship.items.filter((v) => v.fullSlot);
      }
      return [];
    },
    selectedItem(): Item {
      return this.items[this.selectedItemIndex] ?? new Item();
    },
    defenseFleet() {
      return this.defenseFleets[this.defenseIndex];
    },
    defenseShipRows(): DamageRow[] {
      if (!this.defenseFleet) {
        return [];
      }
      const results = [];
      for (let i = 0; i < this.defenseFleet.ships.length; i += 1) {
        results.push({
          enemy: this.defenseFleet.ships[i],
          damage: '',
          death: 0,
          taiha: 0,
          chuha: 0,
          disabledASW: false,
        });
      }
      return results;
    },
    multipliers(): number[] {
      if (this.selectedItem && this.selectedItem.data.isTorpedoAttacker) {
        const multipliers = [];
        if (this.torpedoMultiplier1) {
          multipliers.push(0.8);
        }
        if (this.torpedoMultiplier2) {
          multipliers.push(1.5);
        }
        return multipliers;
      }
      return [1];
    },
  },
  methods: {
    clickedShip(index: number) {
      this.selectedShipIndex = index;
      const item = this.items[this.selectedItemIndex];

      // なんか違う装備だったら探してみる
      if (!item || !item.fullSlot || !item.data.isAttacker) {
        const newItemIndex = this.items.findIndex((v) => v.data.isAttacker);
        if (newItemIndex >= 0) {
          this.selectedItemIndex = newItemIndex;
        }
      }
      this.clickedItem(this.selectedItemIndex);
    },
    clickedItem(index: number) {
      this.selectedItemIndex = index;
      const item = this.items[index];
      if (item.slot) {
        this.slot = item.slot;
      } else {
        this.slot = 0;
      }
      this.calculate();
    },
    calculate() {
      // 検証
      if (this.slot > 999) {
        this.slot = 999;
      }

      if (!this.selectedItem) {
        return;
      }

      const args: FirePowerCalcArgs = {
        item: this.selectedItem,
        slot: this.slot,
        defense: new Enemy(),
        isAirbaseMode: false,
        isCritical: this.isCritical,
        isUnion: false,
        criticalBonus: 1,
        contactBonus: 1,
        unionBonus: 1,
        rikuteiBonus: 1,
        manualAfterCapBonus: 1,
        multipliers: this.multipliers,
      };

      const powers = AerialFirePowerCalculator.getAirstrikeSupportPower(this.selectedItem, this.slot, args, false, 1);
      this.powers = powers.map((v, i) => `${Math.floor(100 * v.power) / 100} (x${args.multipliers[i]})`);

      const rows = this.defenseShipRows;
      this.enemyRows = [];
      if (!this.multipliers.length) {
        return;
      }
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const HP = row.enemy.data.hp;

        // 火力分布より、被ダメージ分布を取得
        const damageDist = CommonCalc.getDamageDistribution(powers, row.enemy.actualArmor, 1, HP, true);
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
        row.damage = `${minDamage} ~ ${maxDamage}`;
        row.death = Math.floor(damageBorders[0].rate * 1000) / 10;
        row.taiha = Math.floor(damageBorders[1].rate * 1000) / 10;
        row.chuha = Math.floor(damageBorders[2].rate * 1000) / 10;
        row.disabledASW = row.enemy.isSubmarine;

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
        if (this.selectedItem.data.torpedo <= 0 && this.selectedItem.data.bomber <= 0) {
          row.damage = '';
        }

        this.enemyRows.push(row);
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
