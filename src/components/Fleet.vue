<template>
  <div elevation="2" class="ma-1 py-2">
    <div class="d-flex">
      <v-spacer></v-spacer>
      <div class="align-self-center pr-1">
        <v-btn icon small @click="resetFleet()">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="d-flex mx-2">
      <div class="caption text--secondary">艦隊防空:</div>
      <div class="ml-1 caption">{{ fleet.fleetAntiAir }}</div>
      <div class="ml-2 caption text--secondary">半径:</div>
      <div class="ml-1 caption">{{ fleet.range }}</div>
    </div>
    <div class="d-flex mx-2">
      <v-spacer></v-spacer>
      <div class="mx-1 caption text--secondary">制空:</div>
      <div class="body-2 ship-air-power">{{ airPower }}</div>
    </div>
    <v-divider></v-divider>
    <div class="ship-inputs-container">
      <ship-input
        v-for="i in dispalyCount"
        :key="i"
        :ship="fleet.ships[i - 1]"
        :index="i - 1"
        :handle-show-ship-list="showShipList"
        :handle-show-item-list="showItemList"
      ></ship-input>
      <!-- 艦娘追加用フォーム -->
      <div v-ripple="{ class: 'info--text' }" class="empty-ship ma-1" @click="showShipList(dispalyCount)">
        <div>&plus;艦娘追加</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.v-card .theme--dark.v-card {
  background-color: rgb(35, 35, 38);
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
  min-height: 100px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 0.25rem;
  justify-content: center;
  transition: 0.2s;
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
import ShipInput from '@/components/shipInput.vue';
import Const from '@/classes/Const';
import Fleet, { FleetBuilder } from '@/classes/Fleet';
import Ship from '@/classes/Ship';

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
    displayMax: 5,
  }),
  computed: {
    fleet(): Fleet {
      return this.value;
    },
    airPower() {
      return this.value.airPower;
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
