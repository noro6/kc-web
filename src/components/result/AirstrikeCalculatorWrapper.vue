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
            @keypress.enter="clickedItem(i)"
            tabindex="0"
          >
            <div class="align-self-center">
              <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120" />
            </div>
            <div class="ml-1">
              <div class="level-area">Lv {{ ship.level }}</div>
              <div class="caption">{{ getShipName(ship.data) }}</div>
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
            class="selectable-item caption"
            :class="{ selected: i === selectedItemIndex }"
            @click="clickedItem(i)"
            @keypress.enter="clickedItem(i)"
            tabindex="0"
          >
            <div class="item-slot">{{ item.fullSlot }}</div>
            <div class="mx-1">
              <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" width="30" height="30" />
            </div>
            <div class="body-2 text-truncate item-name">{{ needTrans ? $t(`${item.data.name}`) : item.data.name }}</div>
            <template v-if="item.data.isTorpedoAttacker">
              <div class="ml-auto">{{ $t("Common.雷装") }}</div>
              <div class="item-torpedo">{{ item.data.torpedo }}</div>
              <template v-if="item.crewTorpedoBonus || item.attackerTorpedoBonus">
                <div class="ml-2">(</div>
                <div class="mx-1 info--text">&plus; {{ item.crewTorpedoBonus + item.attackerTorpedoBonus }}</div>
                <div>)</div>
              </template>
            </template>
            <template v-else-if="item.data.isAttacker">
              <div class="ml-auto">{{ $t("Common.爆装") }}</div>
              <div class="item-torpedo">{{ item.data.bomber }}</div>
              <template v-if="item.crewBomberBonus || item.attackerTorpedoBonus">
                <div class="ml-2">(</div>
                <div class="mx-1 info--text">&plus; {{ item.crewBomberBonus + item.attackerTorpedoBonus }}</div>
                <div>)</div>
              </template>
            </template>
          </div>
        </div>
      </div>
      <div class="pa-1" v-if="selectedItem.attackerTorpedoBonus || selectedItem.crewBomberBonus || selectedItem.crewTorpedoBonus">
        <v-card class="pa-3">
          <div v-if="selectedItem.attackerTorpedoBonus" class="d-flex caption">
            <div class="mr-2">{{ $t("Result.装備シナジーボーナス") }}</div>
            <div class="ml-auto">&plus; {{ selectedItem.attackerTorpedoBonus }}</div>
          </div>
          <div v-if="selectedItem.data.isTorpedoAttacker && selectedItem.crewTorpedoBonus" class="d-flex caption">
            <div class="mr-2">{{ $t("Result.熟練甲板要員ボーナス") }}</div>
            <div class="ml-auto">&plus; {{ selectedItem.crewTorpedoBonus }}</div>
          </div>
          <div v-else-if="selectedItem.data.isAttacker && selectedItem.crewBomberBonus" class="d-flex caption">
            <div class="mr-2">{{ $t("Result.熟練甲板要員ボーナス") }}</div>
            <div class="ml-auto">&plus; {{ selectedItem.crewBomberBonus }}</div>
          </div>
        </v-card>
      </div>
    </div>
    <div class="d-flex mt-3">
      <div class="caption">{{ $t("Result.航空戦火力計算機") }}</div>
      <div class="header-divider" />
    </div>
    <v-card class="mt-2 fire-calc-container" v-if="selectedShip">
      <airstrike-calculator ref="airstrikeCalculator" :arg-parent="selectedShip" :tableHeight="''" />
    </v-card>
  </div>
</template>

<style scoped>
.select-item-container {
  display: grid;
  grid-template-columns: auto 1fr auto;
  column-gap: 0.5rem;
  height: 160px;
  overflow: hidden;
}

.selectable-ship-container {
  height: 160px;
  overflow-y: auto;
}

.ship-selectable {
  text-align: left;
  display: flex;
  align-items: center;
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
.level-area {
  color: rgb(0, 174, 255);
  font-size: 11px;
  height: 11px;
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
</style>

<script lang="ts">
import Vue from 'vue';
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Fleet from '@/classes/fleet/fleet';
import Ship from '@/classes/fleet/ship';
import Item from '@/classes/item/item';
import ItemMaster from '@/classes/item/itemMaster';
import SiteSetting from '@/classes/siteSetting';
import CalcManager from '@/classes/calcManager';
import ShipMaster from '@/classes/fleet/shipMaster';
import SaveData from '@/classes/saveData/saveData';
import AirstrikeCalculator from './AirstrikeCalculator.vue';

export default Vue.extend({
  components: { AirstrikeCalculator },
  name: 'AirstrikeCalculatorWrapper',
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
  }),
  mounted() {
    const saveData = this.$store.state.mainSaveData as SaveData;
    const items = this.$store.state.items as ItemMaster[];
    const ships = this.$store.state.ships as ShipMaster[];
    const enemies = this.$store.getters.getEnemies as EnemyMaster[];

    this.calcManager = saveData.loadManagerData(items, ships, enemies);

    this.$nextTick(() => {
      this.clickedShip(this.selectedShipIndex);
    });
  },
  computed: {
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    enabledShips(): Ship[] {
      return this.fleet.ships.filter((v) => v.items.some((w) => w.data.isAttacker));
    },
    selectedShip(): Ship {
      return this.enabledShips[this.selectedShipIndex];
    },
    items(): Item[] {
      if (this.selectedShip) {
        return this.selectedShip.items.filter((v) => v.fullSlot);
      }
      return [];
    },
    selectedItem(): Item {
      return this.items[this.selectedItemIndex] ?? new Item();
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
      const { fullSlot } = this.selectedItem;
      if (this.selectedShip) {
        (this.$refs.airstrikeCalculator as InstanceType<typeof AirstrikeCalculator>).calculateFire(this.selectedItem, fullSlot);
      }
    },
    getShipName(ship: ShipMaster | EnemyMaster) {
      if (this.needTrans && ship instanceof ShipMaster) {
        const shipName = ShipMaster.getSuffix(ship);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      if (this.needTrans && ship.name) {
        const shipName = EnemyMaster.getSuffix(ship.name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return ship.name || '';
    },
  },
});
</script>
