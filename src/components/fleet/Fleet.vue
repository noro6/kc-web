<template>
  <div class="mx-1 pb-2">
    <div class="d-flex align-center d-capture-none px-1" v-if="index >= 4">
      <v-alert v-if="index >= 4" type="warning" dense class="my-3 body-2 flex-grow-1" outlined>
        {{ $t("Fleet.第x艦隊以降のデータは本サイト内でのみ有効で、外部サイトへの出力の対象になりません。", { number: index + 1 }) }}
      </v-alert>
      <v-btn @click="removeFleet" color="secondary" class="ml-3">{{ $t("Fleet.艦隊削除") }}</v-btn>
    </div>
    <div class="d-flex px-1 flex-wrap align-center">
      <div v-if="isShipAllEmpty" class="d-capture-none">
        <v-btn color="primary" @click.stop="batchDeploy">{{ $t("Fleet.一括編成") }}</v-btn>
      </div>
      <fleet-info-header v-if="!isShipAllEmpty" :value="value" :index="index" :isUnion="isUnion" :unionFleet="unionFleet" :admiralLv="admiralLv" />
      <div class="d-flex ml-auto">
        <div class="operation-button">
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon :disabled="!shipRemoveEnabled" @click="removeLastShip" v-bind="attrs" v-on="on">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Fleet.艦娘入力欄を減らす") }}</span>
          </v-tooltip>
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon :disabled="!shipAddEnabled" @click="addEmptyShip" v-bind="attrs" v-on="on">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Fleet.艦娘入力欄を増やす") }}</span>
          </v-tooltip>
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
        <div class="operation-button">
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon @click="showTempFleetList(index)" v-bind="attrs" v-on="on">
                <v-icon color="orange lighten-2">mdi-clipboard-edit</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Fleet.艦隊クリップボード") }}</span>
          </v-tooltip>
        </div>
        <div class="operation-button">
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon :disabled="!updateAreaTagEnabled || readOnlyMode" @click="showAreaTagDialog()" v-bind="attrs" v-on="on">
                <v-icon color="light-green">mdi-cards</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("Database.お札一括更新") }}</span>
          </v-tooltip>
        </div>
        <div class="d-capture-none ship-line-setting ml-2">
          <v-btn-toggle class="align-self-center" dense v-model="isShipView2Line" borderless mandatory>
            <v-btn :value="true" small :color="isShipView2Line ? 'primary' : 'secondary'" @click="toggleViewLine(true)">
              <span class="white--text">{{ $t("Fleet.x列", { number: 2 }) }}</span>
            </v-btn>
            <v-btn :value="false" small :color="!isShipView2Line ? 'primary' : 'secondary'" @click="toggleViewLine(false)">
              <span class="white--text">{{ $t("Fleet.x列", { number: 3 }) }}</span>
            </v-btn>
          </v-btn-toggle>
        </div>
        <div class="d-capture-none align-self-center ml-2">
          <v-btn color="primary" small @click.stop="batchDeploy">{{ $t("Fleet.一括編成") }}</v-btn>
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
        :handle-show-batch-item-list="showBatchItemList"
        :handle-show-temp-ship-list="showTempShipList"
        :handle-show-item-preset="showItemPreset"
        :handle-create-tray="createTray"
        :handle-close-ship="removeShip"
        :fix-down="ship.fixDown"
        :rate-down="ship.rateDown"
        :fleet-ros-corr="fleet.fleetRosCorr"
        :is-line2="is2line"
        @input="updateShip"
      ></ship-input>
    </div>
    <air-status-result-bar v-if="!hideResultBar" :result="actualFleet.mainResult" class="mt-3" />
    <v-dialog v-model="updateAreaTagDialog" transition="scroll-x-transition" width="680">
      <v-card>
        <div class="d-flex pb-1 px-2 pt-2">
          <div class="align-self-center ml-3">{{ $t("Database.お札一括更新") }}</div>
          <v-spacer />
          <v-btn icon @click="updateAreaTagDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider class="mx-3" />
        <div class="pa-3">
          <div class="mx-3 mt-3 mb-6 body-2">{{ $t("Fleet.この艦隊に属する全ての艦娘が対象です。") }}</div>
          <div class="d-flex justify-space-around">
            <div
              v-for="i in maxAreas"
              :key="`area${i}`"
              class="selected-area-btn"
              :class="{ selected: selectedArea === i }"
              @click="selectedArea = i"
              @keypress="selectedArea = i"
            >
              <v-img :src="`./img/tags/area${i}.webp`" height="68" width="50" />
            </div>
            <div
              class="selected-area-btn no-area align-self-center"
              :class="{ selected: selectedArea === -1 }"
              @click="selectedArea = -1"
              @keypress="selectedArea = -1"
            >
              {{ $t("Database.札なし") }}
            </div>
          </div>
          <v-divider class="mb-2 mt-6" />
          <div class="d-flex">
            <div class="ml-3">
              <v-checkbox v-model="overwriteTag" dense hide-details :label="$t('Fleet.既に札がついている艦娘も上書きする')" />
            </div>
            <v-btn class="ml-auto" color="primary" :disabled="selectedArea === 0 || !updateAreaTagDialog" @click="updateAreaTag()">{{
              $t("Common.更新")
            }}</v-btn>
            <v-btn class="ml-4" color="secondary" @click.stop="updateAreaTagDialog = false">{{ $t("Common.戻る") }}</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

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

.selected-area-btn {
  opacity: 0.4;
  cursor: pointer;
  transition: 0.3s;
}
.selected-area-btn:hover {
  opacity: 0.6;
}
.selected-area-btn.selected {
  opacity: 1;
}
.no-area {
  font-size: 0.9em;
  border: 3px solid rgba(128, 128, 128, 0.6);
  -ms-writing-mode: tb-rl;
  writing-mode: vertical-rl;
  padding: 0.5rem 0.15rem;
  border-radius: 0.25rem;
  margin-left: 1rem;
  transform: rotate(15deg);
  text-align: center;
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
import ShipStock from '@/classes/fleet/shipStock';

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
    handleShowBatchShipList: {
      type: Function,
    },
    handleShowItemList: {
      type: Function,
      required: true,
    },
    handleShowBatchItemList: {
      type: Function,
    },
    handleShowTempShipList: {
      type: Function,
      required: true,
    },
    handleShowTempFleetList: {
      type: Function,
      required: true,
    },
    handleShowItemPreset: {
      type: Function,
      required: true,
    },
    handleCreateTray: {
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
    updateAreaTagDialog: false,
    maxAreas: 0,
    selectedArea: 0,
    readOnlyMode: false,
    overwriteTag: false,
  }),
  mounted() {
    const setting = this.$store.state.siteSetting as SiteSetting;
    this.isShipView2Line = setting.isShipView2Line;

    this.readOnlyMode = !!this.$store.getters.getExistsTempStock;
    this.maxAreas = this.$store.state.areaCount as number;
  },
  computed: {
    fleet() {
      return this.value;
    },
    shipAddEnabled() {
      return this.value.ships.length < 11;
    },
    shipRemoveEnabled() {
      return this.value.ships.length > 1;
    },
    updateAreaTagEnabled() {
      return this.value.ships.some((v) => v.uniqueId);
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
    isTempStockMode(): boolean {
      // 一時所持情報データがあるなら
      return this.$store.getters.getExistsTempStock;
    },
    isShipAllEmpty(): boolean {
      return this.value.ships.every((v) => v.isEmpty);
    },
  },
  watch: {
    isTempStockMode(value) {
      this.readOnlyMode = !!value;
    },
  },
  methods: {
    showItemList(shipIndex: number, slotIndex: number) {
      // 艦娘indexを解決してFleetAll.vueへパス
      this.handleShowItemList(this.index, shipIndex, slotIndex);
    },
    showBatchItemList(shipIndex: number) {
      // 艦娘indexを解決してFleetAll.vueへパス
      this.handleShowBatchItemList(this.index, shipIndex);
    },
    showShipList(index: number) {
      this.handleShowShipList(this.index, index);
    },
    batchDeploy() {
      if (this.handleShowBatchShipList) {
        this.handleShowBatchShipList(this.index);
      }
    },
    showTempShipList(shipIndex: number) {
      this.handleShowTempShipList(this.index, shipIndex);
    },
    showTempFleetList() {
      this.handleShowTempFleetList(this.index);
    },
    showItemPreset(shipIndex: number) {
      this.handleShowItemPreset(this.index, shipIndex);
    },
    createTray(shipIndex: number) {
      this.handleCreateTray(this.index, shipIndex);
    },
    showAreaTagDialog() {
      this.updateAreaTagDialog = true;
    },
    updateAreaTag() {
      this.updateAreaTagDialog = false;
      const ships = [];
      const shipStock = this.$store.state.shipStock as ShipStock[];

      const area = Math.max(this.selectedArea, 0);
      for (let i = 0; i < this.fleet.ships.length; i += 1) {
        const ship = this.fleet.ships[i];
        if (ship.uniqueId && (!ship.area || ship.area < 0 || (ship.area && this.overwriteTag))) {
          ships.push(new Ship({ ship, area }));
          const stock = shipStock.find((v) => v.uniqueId === ship.uniqueId && v.id === ship.data.id);
          if (stock) {
            // ユニークidとマスタidが一致した場合は、そのまま札を設定する
            stock.area = area;
          } else {
            // みつからなかった => 同マスタidの艦で代用したい
            // なぜこのケースがおきる？ => 一覧から配備したあと、再度反映を行い、かつidがズレた場合の稀ケース
            // いろいろよくない気がしたのでスルーすることにする
            // const altStock = shipStock.find((v) => v.id === ship.data.id);
            // if (altStock) {
            //   // 最初に見つかったこれを代用
            //   altStock.area = area;
            // }
          }
        } else if (ship.uniqueId) {
          // 札を同期
          const stock = shipStock.find((v) => v.uniqueId === ship.uniqueId && v.id === ship.data.id);
          if (stock) {
            ships.push(new Ship({ ship, area: stock.area }));
          } else {
            ships.push(ship);
          }
        } else {
          ships.push(ship);
        }
      }

      this.$store.dispatch('updateShipStock', shipStock);
      this.setFleet(new Fleet({ fleet: this.fleet, ships }));
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
      let ships = this.fleet.ships.concat();
      if (ships.length) {
        if (ships.length > 1 && ships[index] && ships[index].isTray) {
          ships = ships.filter((v, i) => index !== i);
        } else {
          ships[index] = new Ship();
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
