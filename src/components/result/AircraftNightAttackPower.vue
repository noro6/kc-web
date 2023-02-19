<template>
  <div class="pa-2 container">
    <v-card class="pa-3">
      <div class="d-flex">
        <div class="caption">{{ $t("Fleet.艦娘選択") }}</div>
        <div class="header-divider"></div>
      </div>
      <div class="select-ship-container">
        <div class="flex-grow-1">
          <div class="selectable-ship-container">
            <div
              v-for="(ship, i) in enabledShips"
              :key="`ship${i}`"
              v-ripple="{ class: 'info--text' }"
              class="ship-selectable"
              :class="{ selected: i === selectedShipIndex }"
              @click="clickedShip(i)"
              @keypress.enter="clickedShip(i)"
              @mouseenter="bootShipTooltip($event)"
              @mouseleave="clearTooltip"
              @focus="bootShipTooltip($event)"
              @blur="clearTooltip"
              tabindex="0"
            >
              <div class="align-self-center">
                <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120"></v-img>
              </div>
            </div>
          </div>
          <div v-if="!selectedShip.isEmpty">
            <div class="d-flex">
              <div class="caption">{{ $t("Fleet.装備") }}</div>
              <div class="header-divider"></div>
            </div>
            <v-divider class="mt-1 item-input-divider"></v-divider>
            <div
              @mouseenter="bootItemTooltip(item, j, $event)"
              @mouseleave="clearTooltip"
              @focus="bootItemTooltip(item, j, $event)"
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
              @mouseenter="bootItemTooltip(selectedShip.exItem, -1, $event)"
              @mouseleave="clearTooltip"
              @focus="bootItemTooltip(ship.exItem, -1, $event)"
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
        </div>
        <div class="border-left ml-2 px-4 auto-slot-container" v-if="!selectedShip.isEmpty">
          <div class="d-flex align-center">
            <div class="body-2">{{ $t("Fleet.搭載数") }}</div>
            <div class="ml-2 pb-1">
              <v-tooltip bottom color="black">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
                </template>
                <div class="caption">{{ $t("Fleet.最終戦闘までの撃墜数に応じて、搭載数を自動設定します。") }}</div>
              </v-tooltip>
            </div>
          </div>
          <div>
            <v-btn color="success" @click="bulkSetSlots(fullSlots)" block>{{ $t("Fleet.満タン") }}</v-btn>
          </div>
          <div>
            <v-btn color="primary" @click="bulkSetSlots(maxSlots)" block>{{ $t("Fleet.最大") }}</v-btn>
          </div>
          <div>
            <v-btn color="warning" @click="bulkSetSlots(avgSlots)" block>{{ $t("Fleet.平均") }}</v-btn>
          </div>
          <div>
            <v-btn color="error" @click="bulkSetSlots(minSlots)" block>{{ $t("Fleet.最小") }}</v-btn>
          </div>
        </div>
        <div class="border-left pl-2 input-container" v-if="!selectedShip.isEmpty">
          <v-select
            class="mt-3"
            outlined
            :label="$t('Result.夜襲CI')"
            :items="specials"
            v-model="special"
            hide-details
            :item-text="(item) => `${item.text ? $t(`Fleet.${item.text}`) : ''} ${item.rate && item.rate[0] ? `( ${Math.floor(item.rate[0] * 100)}% )` : ''}`"
            dense
            return-object
            @change="calculate()"
          ></v-select>
          <v-text-field
            class="mt-3"
            type="number"
            v-model.number="manualAfterCapBonus"
            min="0"
            max="9999"
            :label="$t('Result.特効')"
            hide-details
            outlined
            dense
            step="0.01"
            @input="calculate()"
          ></v-text-field>
          <v-select class="mt-3" :label="$t('Result.残弾薬')" v-model="ammo" :items="ammos" hide-details outlined dense @change="calculate()"></v-select>
          <v-checkbox class="mt-3" :label="$t('Result.クリティカル')" dense hide-details v-model="isCritical" @change="calculate()"></v-checkbox>
        </div>
      </div>
    </v-card>
    <div class="d-flex pt-6">
      <div class="body-2">{{ $t("Result.計算結果") }}</div>
      <div class="header-divider"></div>
    </div>
    <div v-if="!selectedShip.isEmpty">
      <div class="d-flex flex-wrap">
        <div class="align-self-end caption mr-3">{{ $t("Result.防御艦隊") }}</div>
        <div>
          <v-select v-model="defenseIndex" :items="defenseFleets" hide-details dense @change="calculate"></v-select>
        </div>
        <div class="ml-auto align-self-end caption">{{ $t("Result.最終攻撃力") }}</div>
        <div class="ml-1 align-self-end">{{ finalFirePower ? Math.floor(100 * finalFirePower) / 100 : 0 }}</div>
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
              @mouseenter="bootDamageDetailTooltip(row, $event)"
              @mouseleave="clearTooltip"
              @focus="bootDamageDetailTooltip(row, $event)"
              @blur="clearTooltip"
            >
              <td class="d-flex pl-1 enemy-name-td">
                <div class="align-self-center mr-1">
                  <v-img :src="`./img/ship/${row.enemy.data.id}.png`" height="30" width="120"></v-img>
                </div>
                <div class="align-self-center d-none d-sm-block flex-grow-1">
                  <div class="text-left enemy-id primary--text">id {{ row.enemy.data.id }}</div>
                  <div class="d-flex">
                    <div class="caption text-truncate">{{ getEnemyName(row.enemy.data.name) }}</div>
                  </div>
                </div>
              </td>
              <td v-if="row.disabledASW" colspan="6" class="text-center caption">-</td>
              <template v-else>
                <td class="pr-1">{{ row.enemy.data.hp }}</td>
                <td class="pr-1">{{ row.enemy.actualArmor }}</td>
                <td class="pr-1 text-no-wrap tooltip-anchor">{{ row.damage }}</td>
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
    <v-tooltip v-model="enabledDamageDetailTooltip" color="black" top :position-x="tooltipX" :position-y="tooltipY">
      <div class="d-flex py-2">
        <div class="damage-detail-container caption">
          <div>{{ $t("Result.基本攻撃力") }}</div>
          <div v-if="isLandBase">{{ baseFirePowerForLandBase ? Math.floor(100 * baseFirePowerForLandBase) / 100 : 0 }}</div>
          <div v-else>{{ baseFirePower ? Math.floor(100 * baseFirePower) / 100 : 0 }}</div>
          <div>{{ $t("Result.CI倍率") }}</div>
          <div>&times; {{ CIMultiplier.toFixed(2) }}</div>
          <div>{{ $t("Result.キャップ前攻撃力") }}</div>
          <div>{{ preCapFirePower ? Math.floor(100 * preCapFirePower) / 100 : 0 }}</div>
          <div class="divider my-1"><v-divider></v-divider></div>
          <div class="divider my-1"><v-divider></v-divider></div>
          <div>{{ $t("Result.キャップ後攻撃力") }}</div>
          <div>{{ postCapFirePower ? postCapFirePower : 0 }}</div>
          <template v-if="manualAfterCapBonus !== 1">
            <div>{{ $t("Result.特効") }}</div>
            <div>&times; {{ manualAfterCapBonus }}</div>
          </template>
          <template v-if="isCritical">
            <div>{{ $t("Result.クリティカル補正") }}</div>
            <div>&times; 1.50</div>
            <div>{{ $t("Result.熟練度クリティカル補正") }}</div>
            <div>&times; {{ criticalBonus.toFixed(2) }}</div>
          </template>
          <div class="divider my-1"><v-divider></v-divider></div>
          <div class="divider my-1"><v-divider></v-divider></div>
          <div>{{ $t("Result.最終攻撃力") }}</div>
          <div v-if="isLandBase">{{ finalFirePowerForLandBase ? Math.floor(100 * finalFirePowerForLandBase) / 100 : 0 }}</div>
          <div v-else>{{ finalFirePower ? Math.floor(100 * finalFirePower) / 100 : 0 }}</div>
          <div>{{ $t("Common.装甲") }}</div>
          <div>{{ minArmor }} ~ {{ maxArmor }}</div>
          <template v-if="ammo !== 1">
            <div>{{ $t("Result.弾薬補正値") }}</div>
            <div>&times; {{ ammo }}</div>
          </template>
          <div>{{ $t("Result.ダメージ幅") }}</div>
          <div v-if="isLandBase">{{ getDamageRangeString(finalFirePowerForLandBase) }}</div>
          <div v-else>{{ getDamageRangeString(finalFirePower) }}</div>
        </div>
      </div>
    </v-tooltip>
    <v-tooltip v-model="enabledShipTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <ship-tooltip v-model="tooltipShip" :is-flagship="selectedShipIndex === 0" />
    </v-tooltip>
    <v-tooltip v-model="enabledItemTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <item-tooltip v-model="tooltipItem" :bonus="tooltipBonus" />
    </v-tooltip>
    <v-dialog v-model="itemListDialog" transition="scroll-x-transition" :width="itemDialogWidth">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeDialog" :handle-change-width="changeWidth" />
    </v-dialog>
  </div>
</template>

<style scoped>
.select-ship-container {
  display: flex;
}
.selectable-ship-container {
  display: flex;
  overflow-x: auto;
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
.ship-selectable:hover {
  background-color: rgba(0, 164, 255, 0.1);
}
.ship-selectable.selected {
  background-color: rgba(0, 164, 255, 0.1);
  border-color: rgba(0, 164, 255, 0.6);
}

.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.auto-slot-container {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 140px;
}
.input-container {
  width: 180px;
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

.damage-detail-container {
  display: grid;
  grid-template-columns: auto auto;
}
.damage-detail-container > div:nth-child(2n):not(.divider) {
  margin-left: 1rem;
  text-align: right;
}

body.item-ui-border .item-input-divider {
  display: none !important;
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
import Ship, { ShipBuilder } from '@/classes/fleet/ship';
import Item from '@/classes/item/item';
import ItemMaster from '@/classes/item/itemMaster';
import CommonCalc from '@/classes/commonCalc';
import SiteSetting from '@/classes/siteSetting';
import CalcManager from '@/classes/calcManager';
import ShipMaster from '@/classes/fleet/shipMaster';
import SaveData from '@/classes/saveData/saveData';
import ItemBonus from '@/classes/item/ItemBonus';
import { cloneDeep } from 'lodash';
import Const, { CAP } from '@/classes/const';
import ShipTooltip from '@/components/fleet/ShipTooltip.vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import ItemInput from '@/components/item/ItemInput.vue';
import ItemList from '@/components/item/ItemList.vue';

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
  components: {
    ShipTooltip,
    ItemTooltip,
    ItemInput,
    ItemList,
  },
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
    selectedShip: new Ship(),
    selectedItemIndex: 0,
    isCritical: false,
    criticalBonus: 1,
    manualAfterCapBonus: 1,
    defenseIndex: 0,
    defenseFleets: [] as { text: string; value: number; ships: Enemy[]; isUnion: boolean }[],
    enemyRows: [] as DamageRow[],
    enabledItemTooltip: false,
    enabledShipTooltip: false,
    enabledDamageDetailTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipShip: new Ship(),
    tooltipBonus: '',
    tooltipX: 0,
    tooltipY: 0,
    isLandBase: false,
    enabledShips: [] as Ship[],
    baseFirePower: 0,
    baseFirePowerForLandBase: 0,
    CIMultiplier: 0,
    preCapFirePower: 0,
    postCapFirePower: 0,
    finalFirePower: 0,
    finalFirePowerForLandBase: 0,
    specials: [] as { text: string; rate: number[]; multiplier?: number }[],
    special: { text: '', rate: [], multiplier: 1 },
    maxArmor: 0,
    minArmor: 0,
    ammo: 1,
    ammos: [
      { text: '～50%', value: 1 },
      { text: '45%', value: 0.9 },
      { text: '40%', value: 0.8 },
      { text: '35%', value: 0.7 },
      { text: '30%', value: 0.6 },
      { text: '25%', value: 0.5 },
      { text: '20%', value: 0.4 },
      { text: '15%', value: 0.3 },
      { text: '10%', value: 0.2 },
      { text: '5%', value: 0.1 },
    ],
    fullSlots: [] as number[][],
    maxSlots: [] as number[][],
    avgSlots: [] as number[][],
    minSlots: [] as number[][],
    itemListDialog: false,
    itemDialogTargetIndex: 0,
    itemDialogWidth: 1200,
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
    this.defenseIndex = this.defenseFleets.length - 1;

    const cloneFleet = cloneDeep(this.fleet.ships);
    this.enabledShips = cloneFleet.filter((v) => v.enabledAircraftNightAttack);

    // 搭載数初期値を取得 => 計算結果の最終搭載数
    for (let i = 0; i < this.enabledShips.length; i += 1) {
      const ship = this.enabledShips[i];
      const fullSlots = [];
      const maxSlots = [];
      const avgSlots = [];
      const minSlots = [];
      for (let j = 0; j < ship.items.length; j += 1) {
        const item = ship.items[j];
        fullSlots.push(item.fullSlot);
        maxSlots.push(item.maxSlot);
        avgSlots.push(item.data.isPlane ? item.slotResult : item.fullSlot);
        minSlots.push(item.minSlot);
      }
      this.fullSlots.push(fullSlots);
      this.maxSlots.push(maxSlots);
      this.avgSlots.push(avgSlots);
      this.minSlots.push(minSlots);
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
      const ship = this.enabledShips[index];

      if (ship.isEmpty) {
        return;
      }
      // 搭載数を最終戦闘時の平均値に調整
      this.bulkSetSlots(this.avgSlots);
    },
    bulkSetSlots(slots: number[][]) {
      const ship = this.enabledShips[this.selectedShipIndex];

      if (!ship || ship.isEmpty) {
        return;
      }

      const setSlots = slots[this.selectedShipIndex];
      if (!setSlots) {
        return;
      }

      const items = [];
      for (let j = 0; j < ship.items.length; j += 1) {
        const item = ship.items[j];
        items.push(new Item({ item, slot: setSlots[j] ?? 0 }));
      }
      // 装備の搭載数だけ置き換えたやつを設置
      const newShip = new Ship({ ship, items });
      this.enabledShips[this.selectedShipIndex] = newShip;
      this.specials = newShip.getNightBattleSpecialAttackRate(this.selectedShipIndex === 0);
      this.specials.push({ text: '通常', rate: [0], multiplier: 1 });

      this.calculate();
    },
    calculate() {
      this.selectedShip = this.enabledShips[this.selectedShipIndex] ?? new Ship();

      // 火力計算
      this.baseFirePower = this.selectedShip.getAircraftNightAttackPrePower(0);
      this.baseFirePowerForLandBase = this.selectedShip.getAircraftNightAttackPrePower(0, true);
      this.criticalBonus = this.selectedShip.getProfCriticalBonus();

      let power = this.baseFirePower;
      let powerForLandBase = this.baseFirePowerForLandBase;
      this.CIMultiplier = 1;
      if (this.special && this.special.multiplier && this.specials.find((v) => v.multiplier === this.special.multiplier)) {
        this.CIMultiplier = this.special.multiplier;
        power *= this.special.multiplier;
        powerForLandBase *= this.special.multiplier;
      }

      // キャップ処理
      this.preCapFirePower = power;
      power = CommonCalc.softCap(power, CAP.NIGHT);
      this.postCapFirePower = power;

      // 海域特効
      const manualAfterCapBonus = Math.max(+this.manualAfterCapBonus ?? 1, 0);
      power *= manualAfterCapBonus;
      powerForLandBase *= manualAfterCapBonus;
      this.manualAfterCapBonus = manualAfterCapBonus;

      if (this.isCritical) {
        // クリティカル時
        power = Math.floor(power * 1.5 * this.criticalBonus);
        powerForLandBase = Math.floor(powerForLandBase * 1.5 * this.criticalBonus);
      }

      this.finalFirePower = power;
      this.finalFirePowerForLandBase = powerForLandBase;

      const powers = [{ power, rate: 1 }];
      const powersForLandBase = [{ power: powerForLandBase, rate: 1 }];

      const rows = this.defenseShipRows;
      this.enemyRows = [];
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const HP = row.enemy.data.hp;

        // 火力分布より、被ダメージ分布を取得
        let damageDist = CommonCalc.getDamageDistribution(powers, row.enemy.actualArmor, this.ammo, HP, true);
        if (row.enemy.data.isLandBase) {
          damageDist = CommonCalc.getDamageDistribution(powersForLandBase, row.enemy.actualArmor, this.ammo, HP, true);
        }
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
    setShip() {
      if (!this.selectedShip.isEmpty) {
        this.clearTooltip();
        this.enabledShips[this.selectedShipIndex] = new Ship({ ship: this.selectedShip });

        this.specials = this.selectedShip.getNightBattleSpecialAttackRate(this.selectedShipIndex === 0);
        this.specials.push({ text: '通常', rate: [0], multiplier: 1 });

        this.calculate();
      }
    },
    async showItemList(slotIndex: number) {
      if (!this.selectedShip.isEmpty) {
        this.clearTooltip();
        this.itemDialogTargetIndex = slotIndex;
        await (this.itemListDialog = true);
        (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(this.selectedShip, slotIndex, this.selectedShip.items);
      }
    },
    equipItem(item: Item) {
      const master = item.data;
      this.itemListDialog = false;
      const slotIndex = this.itemDialogTargetIndex;
      const ship = this.enabledShips[this.selectedShipIndex];
      let newShip: Ship;

      // 新しい装備配列を生成
      const items = ship.items.concat();
      // 初期熟練度設定
      const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
      let level = 0;
      if (initialLevels) {
        // 設定情報より初期熟練度を解決
        const initData = initialLevels.find((v) => v.id === master.apiTypeId);
        if (initData) {
          level = initData.level;
        }
      }

      if (slotIndex < items.length) {
        if (item.data.apiTypeId === 41 && ship.data.type2 === 90) {
          // 日進 & 大型飛行艇
          items[slotIndex] = new Item({
            item: items[slotIndex],
            master,
            remodel: item.remodel,
            level,
            slot: 1,
          });
        } else {
          // 装備を置き換え
          items[slotIndex] = new Item({
            item: items[slotIndex],
            master,
            remodel: item.remodel,
            level,
          });
        }
        // 装備を変更した艦娘インスタンス再生成
        newShip = new Ship({ ship, items });
      } else if (slotIndex === Const.EXPAND_SLOT_INDEX) {
        // 補強増設を変更した艦娘インスタンス再生成
        const builder: ShipBuilder = { ship, exItem: new Item({ item: ship.exItem, master, remodel: item.remodel }) };
        newShip = new Ship(builder);
      } else {
        // 搭載失敗
        return;
      }

      this.enabledShips[this.selectedShipIndex] = newShip;
      this.specials = newShip.getNightBattleSpecialAttackRate(this.selectedShipIndex === 0);
      this.specials.push({ text: '通常', rate: [0], multiplier: 1 });
      this.calculate();
    },
    closeDialog() {
      this.itemListDialog = false;
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
    getEnemyName(name: string): string {
      if (name && this.needTrans) {
        const shipName = EnemyMaster.getSuffix(name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return name || '';
    },
    bootShipTooltip(e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledShipTooltip) {
        return;
      }
      this.tooltipTimer = window.setTimeout(() => {
        this.tooltipX = e.clientX;
        this.tooltipY = e.clientY;
        this.enabledShipTooltip = true;
        this.tooltipShip = this.selectedShip;
      }, Math.max(setting.popUpCount, 10));
    },
    bootItemTooltip(item: Item, index: number, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (!item.data.id || setting.disabledItemTooltip || this.selectedShip.isEmpty) {
        return;
      }
      const ship = this.selectedShip;
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width / 3;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
        this.enabledItemTooltip = true;

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
    bootDamageDetailTooltip(row: DamageRow, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('tooltip-anchor')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = e.clientX;
        this.tooltipY = rect.y;
        this.enabledDamageDetailTooltip = true;
        this.isLandBase = row.enemy.data.isLandBase;

        this.maxArmor = Math.floor(100 * (row.enemy.actualArmor * 1.3 - 0.6)) / 100;
        this.minArmor = Math.floor(100 * row.enemy.actualArmor * 0.7) / 100;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledItemTooltip = false;
      this.enabledShipTooltip = false;
      this.enabledDamageDetailTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
    getDamageRangeString(power: number): string {
      if (!power) return '-';

      const maxDamage = Math.floor((power - this.minArmor) * this.ammo);
      const minDamage = Math.floor((power - this.maxArmor) * this.ammo);

      if (maxDamage <= 0) {
        return `${this.$t('Result.割合ダメージ')}`;
      }
      if (minDamage <= 0) {
        return `${this.$t('Result.割合ダメージ')} ~ ${maxDamage}`;
      }
      return `${minDamage} ~ ${maxDamage}`;
    },
  },
});
</script>
