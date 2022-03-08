<template>
  <div class="mx-1 pb-2">
    <div class="d-flex ml-2 fleet-header flex-wrap">
      <div class="mt-1 caption text--secondary">制空:</div>
      <div class="mt-1 ml-1 mr-3 body-2">{{ fleet.fullAirPower }}</div>
      <div class="mt-1 caption text--secondary">触接:</div>
      <div class="mt-1 ml-1 mr-3 body-2">{{ contactRate }}%</div>
      <!-- 索敵値 -->
      <div class="mt-1 mr-3 d-flex">
        <div class="option-status mr-1" v-for="(scout, i) in fleetScouts" :key="i">
          <v-img :src="`./img/type/icon11.png`" height="20" width="20"></v-img>
          <div class="option-status-label">{{ i + 1 }}</div>
          <div class="ml-2 body-2">: {{ scout }}</div>
        </div>
      </div>
      <!-- TP -->
      <div class="mt-1 mr-3 d-flex">
        <div class="option-status">
          <v-img :src="`./img/type/icon25.png`" height="24" width="24"></v-img>
          <div class="option-status-label label-tp">TP</div>
          <div class="ml-2 body-2 align-self-center tp">
            <div>: {{ actualFleet.tp }}</div>
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
      <div class="operation-button">
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="info" icon @click="clickedInfo" v-bind="attrs" v-on="on">
              <v-icon>mdi-information-outline</v-icon>
            </v-btn>
          </template>
          <span>艦隊詳細</span>
        </v-tooltip>
      </div>
      <div class="operation-button">
        <v-btn icon :disabled="!shipRemoveEnabled" @click="removeLastShip">
          <v-icon>mdi-minus</v-icon>
        </v-btn>
        <v-btn icon :disabled="!shipAddEnabled" @click="addEmptyShip">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
      <div class="operation-button">
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click="resetFleet" v-bind="attrs" v-on="on">
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
          <span>艦隊リセット</span>
        </v-tooltip>
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
        :fix-down="ship.fixDown"
        :rate-down="ship.rateDown"
        @input="updateShip"
      ></ship-input>
    </div>
    <air-status-result-bar :result="result" class="mt-3" />
    <v-dialog v-model="detailDialog" transition="scroll-x-transition" width="880" @input="toggleDetailDialog">
      <fleet-detail
        v-if="!destroyDialog"
        :fleet="actualFleet"
        :index="index"
        :is-union="isUnion"
        ref="fleetDetail"
        :handle-close="closeDetail"
      />
    </v-dialog>
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
.operation-button {
  padding: 0 0.2rem;
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

.captured .ship-inputs-container {
  grid-template-columns: 1fr 1fr 1fr;
}
.captured .operation-button {
  display: none;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipInput from '@/components/fleet/ShipInput.vue';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import FleetDetail from '@/components/fleet/FleetDetail.vue';
import Const from '@/classes/const';
import Fleet from '@/classes/fleet/fleet';
import Ship from '@/classes/fleet/ship';
import AirCalcResult from '@/classes/airCalcResult';

export default Vue.extend({
  name: 'Fleet',
  components: {
    ShipInput,
    AirStatusResultBar,
    FleetDetail,
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
    unionFleet: {
      type: Fleet,
    },
    isUnion: {
      type: Boolean,
      default: false,
    },
    admiralLv: {
      type: Number,
      default: 120,
    },
  },
  data: () => ({
    formations: Const.FORMATIONS,
    cellTypes: Const.CELL_TYPES,
    detailDialog: false,
    destroyDialog: false,
    lastTab: 'stage2',
  }),
  computed: {
    fleet(): Fleet {
      return this.value;
    },
    contactRate() {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return this.unionFleet.getContactRates(true)[0].sumRate.toFixed(2);
      }
      return this.value.getContactRates()[0].sumRate.toFixed(2);
    },
    fleetScouts(): number[] {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return this.unionFleet.getUnionScoutScore(this.admiralLv).map((v) => Math.floor(100 * v) / 100);
      }
      return Fleet.getScoutScore(this.fleet.ships, this.admiralLv).map((v) => Math.floor(100 * v) / 100);
    },
    shipAddEnabled() {
      return this.value.ships.length < 7;
    },
    shipRemoveEnabled() {
      return this.value.ships.length > 1;
    },
    tpS() {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return Math.floor(this.unionFleet.tp);
      }
      return Math.floor(this.value.tp);
    },
    tpA() {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return Math.floor(this.unionFleet.tp * 0.7);
      }
      return Math.floor(this.value.tp * 0.7);
    },
    result(): AirCalcResult {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return this.unionFleet.mainResult;
      }
      return this.value.mainResult;
    },
    actualFleet(): Fleet {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return this.unionFleet;
      }
      return this.value;
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
      this.destroyDialog = false;
      await (this.detailDialog = true);
      (this.$refs.fleetDetail as InstanceType<typeof FleetDetail>).tab = this.lastTab;
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
        if (ships.length < 6 && !ships.some((v) => v.isEmpty)) {
          ships.push(new Ship());
        }
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
    toggleDetailDialog() {
      if (!this.detailDialog) {
        this.lastTab = (this.$refs.fleetDetail as InstanceType<typeof FleetDetail>).tab;
        setTimeout(() => {
          this.destroyDialog = true;
        }, 100);
      } else {
        this.destroyDialog = false;
      }
    },
    closeDetail() {
      this.detailDialog = false;
    },
  },
});
</script>
