<template>
  <div class="mx-1 pb-2">
    <div class="d-flex align-center d-capture-none px-1" v-if="index >= 4">
      <v-alert v-if="index >= 4" type="warning" dense class="my-3 body-2 flex-grow-1" outlined>
        {{ $t("Fleet.第x艦隊以降のデータは本サイト内でのみ有効で、外部サイトへの出力の対象になりません。", { number: index + 1 }) }}
      </v-alert>
      <v-btn @click="removeFleet" color="secondary" class="ml-3">{{ $t("Fleet.艦隊削除") }}</v-btn>
    </div>
    <div class="d-flex px-1 flex-wrap align-center">
      <fleet-info-header :value="value" :index="index" :isUnion="isUnion" :unionFleet="unionFleet" :admiralLv="admiralLv" />
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
            <span>{{ $t("Fleet.艦隊リセット") }}</span>
          </v-tooltip>
        </div>
        <div class="d-capture-none ship-line-setting">
          <v-btn-toggle class="align-self-center" dense v-model="isShipView2Line" borderless mandatory>
            <v-btn :value="true" small :class="{ blue: isShipView2Line, secondary: !isShipView2Line }" @click="toggleViewLine(true)">
              <span class="white--text">{{ $t("Fleet.x列", { number: 2 }) }}</span>
            </v-btn>
            <v-btn :value="false" small :class="{ blue: !isShipView2Line, secondary: isShipView2Line }" @click="toggleViewLine(false)">
              <span class="white--text">{{ $t("Fleet.x列", { number: 3 }) }}</span>
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </div>
    <div class="ship-inputs-container" :class="{ line3: !is2line }">
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
        :is-line2="is2line"
        @input="updateShip"
      ></ship-input>
    </div>
    <air-status-result-bar v-if="!hideResultBar" :result="actualFleet.mainResult" class="mt-3" />
  </div>
</template>

<style scoped>
.operation-button {
  padding: 0 0.2rem;
}
</style>

<style>
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
.captured .ship-inputs-container:not(.line3) {
  grid-template-columns: 1fr 1fr;
}
.captured .operation-button {
  display: none;
}
.captured .d-capture-none {
  display: none !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipInput from '@/components/fleet/ShipInput.vue';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import FleetInfoHeader from '@/components/fleet/FleetInfoHeader.vue';
import Fleet from '@/classes/fleet/fleet';
import Ship from '@/classes/fleet/ship';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'FleetComponent',
  components: {
    FleetInfoHeader,
    ShipInput,
    AirStatusResultBar,
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
    hideResultBar: {
      type: Boolean,
      default: false,
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
    handleRemoveFleet: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
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
    shipAddEnabled() {
      return this.value.ships.length < 7;
    },
    shipRemoveEnabled() {
      return this.value.ships.length > 1;
    },
    actualFleet(): Fleet {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return this.unionFleet;
      }
      return this.value;
    },
    is2line(): boolean {
      return this.isShipView2Line;
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
    updateShip() {
      if (document.getElementById('dragging-item')) {
        // ドラッグ交換中はここで伝播キャンセルする
        return;
      }
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
      const ships = this.fleet.ships.concat();
      if (ships.length) {
        ships[index] = new Ship();
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
    toggleViewLine(value: boolean) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.isShipView2Line = value;
      this.$store.dispatch('updateSetting', setting);
    },
    removeFleet() {
      this.handleRemoveFleet(this.index);
    },
  },
});
</script>
