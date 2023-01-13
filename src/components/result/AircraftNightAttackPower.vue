<template>
  <div class="pa-2 container">
    <div class="d-flex">
      <div class="caption">{{ $t("Fleet.艦娘選択") }}</div>
      <div class="header-divider"></div>
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
              <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120"></v-img>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedShip">
        <div
          @mouseenter="bootTooltip(item, j, $event)"
          @mouseleave="clearTooltip"
          @focus="bootTooltip(item, j, $event)"
          @blur="clearTooltip"
          v-for="(item, j) in selectedShip.items"
          :key="j"
        >
          <item-input
            v-model="selectedShip.items[j]"
            :index="j"
            :max="99"
            :dragSlot="false"
            :init="selectedShip.data.slots[j]"
            :handle-show-item-list="showItemList"
            :item-parent="selectedShip"
            :handle-drag-start="clearTooltip"
            @input="updateItem"
          />
        </div>
        <!-- 補強増設枠 -->
        <div
          @mouseenter="bootTooltip(selectedShip.exItem, -1, $event)"
          @mouseleave="clearTooltip"
          @focus="bootTooltip(ship.exItem, -1, $event)"
          @blur="clearTooltip"
        >
          <item-input
            v-model="selectedShip.exItem"
            :index="99"
            :max="0"
            :init="0"
            :dragSlot="false"
            :handle-show-item-list="showItemList"
            :item-parent="selectedShip"
            :handle-drag-start="clearTooltip"
            @input="updateItem"
          />
        </div>
      </div>
      <div class="border-left pl-2">
        <div>基本攻撃力: {{ baseFirePower }}</div>
        <div class="d-flex pt-3">
          <v-checkbox class="mt-0 pt-0" :label="$t('Result.クリティカル')" dense hide-details v-model="isCritical" @change="calculate()"></v-checkbox>
        </div>
      </div>
    </div>
    <div class="d-flex pt-1">
      <div class="caption">{{ $t("Result.計算結果") }}</div>
      <div class="header-divider"></div>
    </div>
    <div>
      <div class="d-flex flex-wrap">
        <div class="align-self-end caption mr-3">{{ $t("Result.防御艦隊") }}:</div>
        <div>
          <v-select v-model="defenseIndex" :items="defenseFleets" hide-details dense @change="calculate"></v-select>
        </div>
      </div>
      <v-divider class="mt-2"></v-divider>
      <v-simple-table fixed-header height="38vh">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="py-1 pl-1 text-left"></th>
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
                  <v-img :src="`./img/ship/${row.enemy.data.id}.png`" height="30" width="120"></v-img>
                </div>
                <div class="align-self-center d-none d-sm-block flex-grow-1">
                  <div class="text-left enemy-id primary--text">id:{{ row.enemy.data.id }}</div>
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
                  <td class="pr-1"></td>
                  <td class="pr-1 red--text">{{ $t("Result.確殺") }}</td>
                  <td class="pr-1"></td>
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
import ItemInput from '@/components/item/ItemInput.vue';
import ItemBonus from '@/classes/item/ItemBonus';
import { cloneDeep } from 'lodash';

interface DamageRow {
  enemy: Enemy;
  damage: string;
  death: number;
  taiha: number;
  chuha: number;
  disabledASW: boolean;
}

export default Vue.extend({
  name: 'AircraftNightAttackPower',
  components: { ItemInput },
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
    isCritical: false,
    defenseIndex: 0,
    defenseFleets: [] as { text: string; value: number; ships: Enemy[]; isUnion: boolean }[],
    enemyRows: [] as DamageRow[],
    enabledTooltip: false,
    enabledShipTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipBonus: '',
    tooltipX: 0,
    tooltipY: 0,
    enabledShips: [] as Ship[],
    baseFirePower: 0,
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

    const cloneFleet = cloneDeep(this.fleet.ships);
    this.enabledShips = cloneFleet.filter((v) => v.items.some((w) => w.fullSlot));

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
    selectedShip(): Ship | undefined {
      return this.enabledShips[this.selectedShipIndex];
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
  },
  methods: {
    clickedShip(index: number) {
      this.selectedShipIndex = index;

      if (this.selectedShip) {
        this.baseFirePower = AerialFirePowerCalculator.getAircraftNightAttackPrePower(this.selectedShip);
      }
    },
    calculate() {
      const args: FirePowerCalcArgs = {
        item: new Item(),
        slot: 18,
        defense: new Enemy(),
        isAirbaseMode: false,
        isCritical: this.isCritical,
        isUnion: false,
        criticalBonus: 1,
        contactBonus: 1,
        unionBonus: 1,
        rikuteiBonus: 1,
        manualAfterCapBonus: 1,
        multipliers: [1],
      };

      const powers = AerialFirePowerCalculator.getAirstrikeSupportPower(new Item(), 18, args, false, 1);

      const rows = this.defenseShipRows;
      this.enemyRows = [];
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

        this.enemyRows.push(row);
      }
    },
    updateItem() {
      this.setShip();
    },
    setShip(value?: Ship) {
      this.clearTooltip();

      console.log(value);
    },
    showItemList(slotIndex: number): void {
      this.clearTooltip();

      console.log(slotIndex);
    },
    getEnemyName(name: string): string {
      if (name && this.needTrans) {
        const shipName = EnemyMaster.getSuffix(name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return name || '';
    },
    bootTooltip(item: Item, index: number, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (!item.data.id || setting.disabledItemTooltip || !this.selectedShip) {
        return;
      }
      const ship = this.selectedShip as Ship;
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width / 3;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
        this.enabledTooltip = true;

        // この装備がなかった場合のボーナスと比較した分をこの装備のボーナスとする
        const baseItems = ship.items.concat();
        baseItems.push(ship.exItem);
        const tempItems = cloneDeep(baseItems);
        tempItems[index < 0 ? tempItems.length - 1 : index] = new Item();

        const emptyBonus = Ship.getItemBonus(ship.data, tempItems);
        // 未装備時のボーナス合計
        const totalEmptyBonus = ItemBonus.getTotalBonus(emptyBonus);
        // 現在のボーナス
        const totalBonus = ItemBonus.getTotalBonus(ship.itemBonuses);
        // ボーナスの差分を取る
        if (totalBonus.firePower) {
          totalBonus.firePower -= totalEmptyBonus.firePower ?? 0;
        }
        if (totalBonus.torpedo) {
          totalBonus.torpedo -= totalEmptyBonus.torpedo ?? 0;
        }
        if (totalBonus.antiAir) {
          totalBonus.antiAir -= totalEmptyBonus.antiAir ?? 0;
        }
        if (totalBonus.armor) {
          totalBonus.armor -= totalEmptyBonus.armor ?? 0;
        }
        if (totalBonus.asw) {
          totalBonus.asw -= totalEmptyBonus.asw ?? 0;
        }
        if (totalBonus.avoid) {
          totalBonus.avoid -= totalEmptyBonus.avoid ?? 0;
        }
        if (totalBonus.accuracy) {
          totalBonus.accuracy -= totalEmptyBonus.accuracy ?? 0;
        }
        if (totalBonus.range) {
          totalBonus.range -= totalEmptyBonus.range ?? 0;
        }
        if (totalBonus.bomber) {
          totalBonus.bomber -= totalEmptyBonus.bomber ?? 0;
        }
        if (totalBonus.scout) {
          totalBonus.scout -= totalEmptyBonus.scout ?? 0;
        }

        this.tooltipBonus = JSON.stringify(totalBonus);
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      this.enabledShipTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
