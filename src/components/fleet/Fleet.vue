<template>
  <div class="mx-1 pb-2">
    <div class="d-flex ml-2 fleet-header flex-wrap">
      <div class="mt-1 caption text--secondary">制空:</div>
      <div class="mt-1 ml-1 mr-3 body-2">{{ fleet.fullAirPower }}</div>
      <div class="mt-1 caption text--secondary">触接:</div>
      <div class="mt-1 ml-1 mr-3 body-2">{{ contactRate }}%</div>
      <div class="mt-1 caption text--secondary">夜偵:</div>
      <div class="mt-1 ml-1 mr-3 body-2">{{ nightContactRate }}%</div>
      <!-- 索敵値 -->
      <div class="mt-1 mr-3 d-flex">
        <div class="option-status mr-1" v-for="(scout, i) in fleetScouts" :key="i">
          <v-img :src="`./img/type/icon11.png`" height="20" width="20"></v-img>
          <div class="option-status-label">{{ i + 1 }}</div>
          <div class="ml-2 body-2">: {{ scout }}</div>
        </div>
      </div>
      <!-- TP -->
      <div class="mt-1 d-flex">
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
      <div class="d-flex ml-6">
        <div class="mt-1 align-self-center caption d-capture-none">艦隊詳細:</div>
        <div class="operation-button">
          <v-btn color="info" icon @click="clickedInfo">
            <v-icon>mdi-information-outline</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="d-flex ml-auto">
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
        <div class="operation-button ship-line-setting">
          <v-btn-toggle class="align-self-center" dense v-model="isShipView2Line" borderless mandatory>
            <v-btn :value="true" small :class="{ blue: isShipView2Line, secondary: !isShipView2Line }" @click="toggleViewLine(true)">
              <span class="white--text">2列</span>
            </v-btn>
            <v-btn :value="false" small :class="{ blue: !isShipView2Line, secondary: isShipView2Line }" @click="toggleViewLine(false)">
              <span class="white--text">3列</span>
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </div>
    <div class="ship-inputs-container" :class="{ line3: !isShipView2Line }">
      <ship-input
        v-for="(ship, i) in fleet.ships"
        :key="i"
        v-model="fleet.ships[i]"
        :index="i"
        :handle-show-ship-list="showShipList"
        :handle-show-item-list="showItemList"
        :handle-show-temp-ship-list="showTempShipList"
        :handle-show-item-preset="showItemPreset"
        :handle-close-ship="removeShip"
        :fix-down="ship.fixDown"
        :rate-down="ship.rateDown"
        :fleet-ros-corr="fleet.fleetRosCorr"
        @input="updateShip"
      ></ship-input>
    </div>
    <air-status-result-bar :result="actualFleet.mainResult" class="mt-3" />
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
.ship-line-setting {
  display: none;
}
@media (min-width: 660px) {
  .ship-inputs-container {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1060px) {
  .ship-inputs-container.line3 {
    grid-template-columns: 1fr 1fr 1fr;
  }
  .ship-line-setting {
    display: flex;
  }
}

.captured .ship-inputs-container {
  grid-template-columns: 1fr 1fr 1fr;
}
.captured .operation-button {
  display: none;
}
.captured .d-capture-none {
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
import SiteSetting from '@/classes/siteSetting';

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
    handleShowTempShipList: {
      type: Function,
      required: true,
    },
    handleShowItemPreset: {
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
    isShipView2Line: false,
  }),
  mounted() {
    const setting = this.$store.state.siteSetting as SiteSetting;
    this.isShipView2Line = setting.isShipView2Line;
  },
  computed: {
    fleet() {
      return this.value;
    },
    contactRate() {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return this.unionFleet.getContactRates(true)[0].sumRate.toFixed(1);
      }
      return this.value.getContactRates()[0].sumRate.toFixed(1);
    },
    nightContactRate() {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return (100 * this.unionFleet.nightContactRate).toFixed(1);
      }
      return (100 * this.value.nightContactRate).toFixed(1);
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
    tpA() {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return Math.floor(this.unionFleet.tp * 0.7);
      }
      return Math.floor(this.value.tp * 0.7);
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
    showTempShipList(shipIndex: number) {
      this.handleShowTempShipList(this.index, shipIndex);
    },
    showItemPreset(shipIndex: number) {
      this.handleShowItemPreset(this.index, shipIndex);
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
      // 初期化
      const ships = [];
      for (let i = 0; i < 6; i += 1) {
        ships.push(new Ship());
      }
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
      this.toggleDetailDialog();
    },
    toggleViewLine(value: boolean) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.isShipView2Line = value;
      this.$store.dispatch('updateSetting', setting);
    },
  },
});
</script>
