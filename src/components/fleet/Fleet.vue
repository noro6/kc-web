<template>
  <div class="mx-1">
    <div class="d-flex ml-2 fleet-header flex-wrap">
      <div class="mt-1 caption text--secondary">制空:</div>
      <div class="mt-1 ml-1 mr-3 body-2">{{ fleet.fullAirPower }}</div>
      <div class="mt-1 caption text--secondary">艦隊防空:</div>
      <div class="mt-1 ml-1 mr-3 body-2">{{ fleetAntiAir }}</div>
      <!-- 索敵値 -->
      <div class="mt-1 mr-3 d-flex">
        <div class="option-status mr-1" v-for="(scout, i) in fleetScouts" :key="i">
          <v-img :src="`/img/type/icon11.png`" height="20" width="20"></v-img>
          <div class="option-status-label">{{ i + 1 }}</div>
          <div class="ml-2 body-2">: {{ scout.toFixed(2) }}</div>
        </div>
      </div>
      <!-- TP -->
      <div class="mt-1 mr-3 d-flex">
        <div class="option-status">
          <v-img :src="`/img/type/icon25.png`" height="24" width="24"></v-img>
          <div class="option-status-label label-tp">TP</div>
          <div class="ml-2 body-2 align-self-center tp">
            <div>: {{ fleet.tp }}</div>
            <div class="status-label">S</div>
          </div>
          <div class="ml-2 mr-1">/</div>
          <div class="body-2 align-self-center tp">
            <div>{{ tpA }}</div>
            <div class="status-label">A</div>
          </div>
        </div>
      </div>
      <v-spacer></v-spacer>
      <div>
        <v-btn icon :disabled="!shipRemoveEnabled" @click="removeLastShip">
          <v-icon>mdi-minus</v-icon>
        </v-btn>
        <v-btn icon :disabled="!shipAddEnabled" @click="addEmptyShip">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
      <div class="pr-1">
        <v-btn icon @click="resetFleet()">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="ship-inputs-container">
      <ship-input
        v-for="(ship, i) in fleet.ships"
        :key="i"
        v-model="fleet.ships[i]"
        :index="i"
        :handle-show-ship-list="showShipList"
        :handle-show-item-list="showItemList"
        :handle-close-ship="removeShip"
        @input="updateShip"
      ></ship-input>
    </div>
    <div class="d-flex mt-3 mb-2">
      <div class="mr-1 status-reuslt">
        <div class="status-reuslt-label">{{ resultLabel }}</div>
        <div class="status-reuslt-rate">{{ resultStateRate }}%</div>
      </div>
      <div class="align-self-center flex-grow-1">
        <div class="d-flex">
          <div class="status-bar-label" style="width: 10%">
            <div>喪失</div>
          </div>
          <div class="status-bar-divide"></div>
          <div class="status-bar-label" style="width: 10%">
            <div>劣勢</div>
          </div>
          <div class="status-bar-divide"></div>
          <div class="status-bar-label" style="width: 25%">
            <div>拮抗</div>
          </div>
          <div class="status-bar-divide"></div>
          <div class="status-bar-label" style="width: 45%">
            <div>優勢</div>
          </div>
          <div class="status-bar-divide"></div>
          <div class="status-bar-label" style="width: 10%">
            <div>確保</div>
          </div>
        </div>
        <div>
          <v-progress-linear :color="resultBarColor" :value="resultBarValue"></v-progress-linear>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fleet-header > div {
  align-self: center;
}
.option-status {
  position: relative;
  display: flex;
}
.option-status .option-status-label {
  align-self: flex-end;
  position: absolute;
  opacity: 0.7;
  font-size: 12px;
  bottom: -2px;
  left: 20px;
}
.tp {
  display: flex;
  position: relative;
}
.option-status .option-status-label.label-tp {
  font-size: 11px;
  left: 18px;
}
.tp .status-label {
  align-self: flex-start;
  position: absolute;
  font-size: 11px;
  opacity: 0.7;
  right: -6px;
  top: 6px;
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

.status-reuslt {
  width: 36px;
  position: relative;
  opacity: 0.8;
  font-size: 12px;
}
.status-reuslt-label {
  text-align: center;
  position: relative;
  white-space: nowrap;
  width: 100%;
  bottom: 6px;
}
.status-reuslt-rate {
  position: absolute;
  white-space: nowrap;
  text-align: right;
  width: 100%;
  top: 10px;
}
.status-bar-label {
  margin-bottom: 2px;
  text-align: center;
  border-bottom: 1px solid #888;
  position: relative;
}
.status-bar-label > div {
  opacity: 0.8;
  bottom: -2px;
  width: 100%;
  font-size: 11px;
  white-space: nowrap;
  position: absolute;
}
.status-bar-divide {
  align-self: flex-end;
  height: 10px;
  border-right: 1px solid #888;
  margin-bottom: 2px;
}
</style>

<script lang="ts">
import Vue, { PropType } from 'vue';
import ShipInput from '@/components/fleet/ShipInput.vue';
import Const from '@/classes/const';
import Fleet from '@/classes/fleet/fleet';
import Ship from '@/classes/fleet/ship';

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
    fleetScouts: {
      type: Array as PropType<number[]>,
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
  }),
  computed: {
    fleet(): Fleet {
      return this.value;
    },
    fleetAntiAir() {
      return this.value.fleetAntiAir.toFixed(2);
    },
    shipAddEnabled() {
      return this.value.ships.length < 7;
    },
    shipRemoveEnabled() {
      return this.value.ships.length > 1;
    },
    tpA() {
      return Math.floor(this.value.tp * 0.7);
    },
    resultLabel() {
      const { airState } = this.value.result;
      const status = Const.AIR_STATUS.find((v) => v.value === airState);
      return status ? status.text : '';
    },
    resultBarValue() {
      return this.value.result.airStateBarWidth;
    },
    resultStateRate() {
      return this.value.result.rates[this.value.result.airState];
    },
    resultBarColor() {
      const value = this.value.result.airStateBarWidth;
      if (value >= 90) {
        return 'success';
      }
      if (value >= 45) {
        return 'light-green';
      }
      if (value >= 20) {
        return 'yellow';
      }
      if (value >= 10) {
        return 'orange';
      }
      return 'red';
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
    updateShip() {
      this.setFleet();
    },
    setFleet(fleet?: Fleet) {
      if (fleet === undefined) {
        this.$emit('input', new Fleet({ fleet: this.fleet }));
      } else {
        this.$emit('input', fleet);
      }
    },
    resetFleet() {
      // 空にして最初の1隻を初期化する感じ
      const ships = this.fleet.ships.filter((v, i) => i === 0);
      ships[ships.length - 1] = new Ship();
      this.setFleet(new Fleet({ fleet: this.fleet, ships }));
    },
    removeShip(index: number) {
      const ships = this.fleet.ships.filter((v, i) => i !== index);
      if (ships.length) {
        this.setFleet(new Fleet({ fleet: this.fleet, ships }));
      } else {
        // 消せなかったらリセット処理と同じで
        this.resetFleet();
      }
    },
    removeLastShip() {
      // 念のため数チェック
      if (this.fleet.ships.length > 1) {
        const end = this.fleet.ships.length - 1;
        this.setFleet(new Fleet({ fleet: this.fleet, ships: this.fleet.ships.slice(0, end) }));
      }
    },
    addEmptyShip() {
      this.fleet.ships.push(new Ship());
      this.setFleet(new Fleet({ fleet: this.fleet }));
    },
  },
});
</script>
