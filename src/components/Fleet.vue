<template>
  <div elevation="2" class="ma-1 py-2">
    <div class="d-flex ml-2">
      <div class="caption text--secondary">制空:</div>
      <div class="ml-1 body-2">{{ fleet.fullAirPower }}</div>
      <div class="ml-3 caption text--secondary">艦隊防空:</div>
      <div class="ml-1 body-2">{{ fleet.fleetAntiAir }}</div>
      <v-spacer></v-spacer>
      <div class="align-self-center display-select">
        <v-select dense v-model="displayMax" hide-details :items="displayItems" label="最大表示隻数"></v-select>
      </div>
      <div class="align-self-center pr-1">
        <v-btn icon @click="resetFleet()">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="ship-inputs-container">
      <ship-input
        v-for="i in dispalyCount"
        :key="i"
        v-model="fleet.ships[i - 1]"
        :index="i - 1"
        :handle-show-ship-list="showShipList"
        :handle-show-item-list="showItemList"
      ></ship-input>
      <!-- 艦娘追加用フォーム -->
      <div v-show="dispalyCount < displayMax" v-ripple class="empty-ship ma-1" @click="showShipList(dispalyCount)">
        <div><v-icon>mdi-plus</v-icon> 艦娘追加</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-card .theme--dark.v-card {
  background-color: rgb(35, 35, 38);
}

.display-select {
  width: 120px;
}

.ship-inputs-container {
  grid-template-columns: 1fr;
  display: grid;
}
@media (min-width: 660px) {
  .ship-inputs-container {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1060px) {
  .ship-inputs-container {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.empty-ship {
  display: flex;
  cursor: pointer;
  min-height: 200px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 0.25rem;
  justify-content: center;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  font-size: 0.95em;
}
.empty-ship:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.empty-ship div {
  align-self: center;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipInput from '@/components/ShipInput.vue';
import Const from '@/classes/Const';
import Fleet, { FleetBuilder } from '@/classes/Fleet';
import Ship from '@/classes/Ship';

const DisplayCount = [1, 2, 3, 4, 5, 6, 7];

export default Vue.extend({
  name: 'Fleet',
  components: {
    ShipInput,
  },
  props: {
    value: {
      type: Fleet,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    handleShowShipList: {
      type: Function,
      required: true,
    },
    handleShowItemList: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    formations: Const.FORMATIONS,
    cellTypes: Const.CELL_TYPES,
    detailDialog: false,
    destroyDialog: false,
    displayMax: 6,
    displayItems: DisplayCount,
  }),
  computed: {
    fleet(): Fleet {
      return this.value;
    },
    dispalyCount() {
      return Math.min(this.value.ships.length, this.displayMax);
    },
  },
  methods: {
    showItemList(shipIndex: number, slotIndex: number) {
      // 艦娘indexを解決してFleetAll.vueへパス
      this.handleShowItemList(this.index, shipIndex, slotIndex);
    },
    showShipList(index: number) {
      this.handleShowShipList(this.index, index);
    },
    async clickedInfo() {
      this.detailDialog = true;
      this.destroyDialog = false;
    },
    setFleet(fleet: Fleet) {
      this.$emit('input', fleet);
    },
    resetFleet() {
      this.setFleet(new Fleet());
    },
    removeShip(index: number) {
      const ships = this.fleet.ships.concat();
      ships[index] = new Ship();
      const builder: FleetBuilder = { fleet: this.fleet, ships };
      this.setFleet(new Fleet(builder));
    },
  },
});
</script>
