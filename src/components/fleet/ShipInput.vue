<template>
  <v-card class="ma-1" :class="{ disabled: !ship.isActive, 'py-2': !ship.isEmpty }" @dragover.prevent @drop.stop>
    <template v-if="ship.isEmpty">
      <div class="empty-ship" v-ripple="{ class: 'info--text' }" @click="showShipList">
        <div class="align-self-center">艦娘選択</div>
      </div>
    </template>
    <template v-else>
      <div class="d-flex ship-header px-2">
        <div class="align-self-center" v-if="!isNoShip">
          <v-img :src="`./img/ship/${ship.data.albumId}.png`" height="32" width="128"></v-img>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex caption flex-wrap">
            <v-menu
              offset-y
              v-model="levelMenu"
              :close-on-content-click="false"
              transition="slide-y-transition"
              bottom
              right
              @input="onLevelMenuToggle"
            >
              <template v-slot:activator="{ on, attrs }">
                <div class="px-1 clickable-status primary--text" v-bind="attrs" v-on="on" v-ripple="{ class: 'info--text' }">
                  Lv:{{ ship.level }}
                </div>
              </template>
              <v-card class="pa-3">
                <div class="d-flex mt-1">
                  <v-btn class="mr-1 px-0" small outlined @click="level = 1">Lv1</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 50" color="primary">Lv50</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 80" color="teal">Lv80</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 99" color="teal">Lv99</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 145" color="red lighten-2">Lv145</v-btn>
                  <v-btn class="mr-1 px-0" small outlined @click="level = 175" color="red lighten-2">Lv175</v-btn>
                </div>
                <div class="d-flex mt-4 pl-2">
                  <v-slider max="175" min="1" v-model="level" hide-details class="align-self-center"></v-slider>
                  <div class="menu-slider-text">
                    <v-text-field v-model.number="level" class="pt-0 mt-0" max="175" min="1" hide-details type="number"></v-text-field>
                  </div>
                </div>
              </v-card>
            </v-menu>
            <div class="d-flex mr-2">
              <v-menu
                offset-y
                v-model="luckMenu"
                :close-on-content-click="false"
                transition="slide-y-transition"
                bottom
                right
                @input="onLuckMenuToggle"
              >
                <template v-slot:activator="{ on, attrs }">
                  <div class="px-1 clickable-status" v-bind="attrs" v-on="on" v-ripple="{ class: 'info--text' }">
                    <span class="text--secondary">運:</span>
                    <span class="pl-1 font-weight-medium">{{ ship.luck }}</span>
                  </div>
                </template>
                <v-card class="pa-5">
                  <div class="d-flex mt-1">
                    <v-btn class="mx-2" @click="luck = ship.data.luck" :disabled="isNoShip">初期値</v-btn>
                    <v-btn class="mx-2" @click="luck = ship.data.maxLuck" color="primary" :disabled="isNoShip">最大値</v-btn>
                  </div>
                  <v-text-field
                    v-model.number="luck"
                    :max="isNoShip ? 100 : ship.data.maxLuck"
                    :min="ship.data.luck"
                    hide-details
                    type="number"
                  ></v-text-field>
                </v-card>
              </v-menu>
              <v-menu
                offset-y
                v-model="antiAirMenu"
                :close-on-content-click="false"
                transition="slide-y-transition"
                bottom
                right
                @input="onAAMenuToggle"
              >
                <template v-slot:activator="{ on, attrs }">
                  <div class="px-1 clickable-status" v-bind="attrs" v-on="on" v-ripple="{ class: 'info--text' }">
                    <span class="text--secondary">対空:</span>
                    <span class="pl-1 font-weight-medium">{{ ship.antiAir }}</span>
                  </div>
                </template>
                <v-card class="pa-5">
                  <div class="d-flex mt-1">
                    <v-btn class="mx-2" @click="antiAir = 0" :disabled="isNoShip">初期値</v-btn>
                    <v-btn class="mx-2" @click="antiAir = ship.data.antiAir" color="primary" :disabled="isNoShip">最大値</v-btn>
                  </div>
                  <v-text-field
                    v-model.number="antiAir"
                    :max="isNoShip ? 200 : ship.data.antiAir"
                    min="0"
                    hide-details
                    type="number"
                  ></v-text-field>
                </v-card>
              </v-menu>
            </div>
          </div>
          <div class="d-flex pl-1 clickable-status" v-ripple="{ class: 'info--text' }" @click="showShipList">
            <div class="ship-name text-truncate">{{ ship.data.name ? ship.data.name : "艦娘選択" }}</div>
          </div>
        </div>
        <!-- 艦娘解除 -->
        <div class="ship-remove pr-1 pt-1">
          <v-btn icon @click="removeShip">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="caption pl-3">
        <span class="text--secondary">割合撃墜:</span>
        <span class="ml-1 mr-2 font-weight-medium">{{ rateDownValue }}%</span>
        <span class="ml-1 text--secondary">固定撃墜:</span>
        <span class="ml-1 font-weight-medium">{{ fixDown }}機</span>
      </div>
      <div class="d-flex caption pr-1 pl-3">
        <div class="align-self-center">
          <span class="text--secondary">制空:</span>
          <span class="ml-1 font-weight-medium">{{ ship.fullAirPower }}</span>
          <span class="ml-1 mr-2 text--secondary">{{ airPowerDetail }}</span>
        </div>
        <v-spacer></v-spacer>
        <div class="align-self-center d-flex">
          <v-btn icon small v-show="ship.isActive" @click="changeActive(false)">
            <v-icon small>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon small v-show="!ship.isActive" @click="changeActive(true)">
            <v-icon small>mdi-eye-off</v-icon>
          </v-btn>
          <div class="btn-item-reset">
            <v-btn icon small color="blue" @click="resetItems()">
              <v-icon small color="grey">mdi-close</v-icon>
            </v-btn>
            <div class="close-bar" :class="`item-count-${ship.items.length + 1}`"></div>
          </div>
        </div>
      </div>
      <v-divider class="mx-2"></v-divider>
      <!-- 装備一覧 -->
      <div class="px-2" v-if="!ship.isEmpty">
        <item-input
          v-for="(item, j) in ship.items"
          :key="j"
          v-model="ship.items[j]"
          :index="j"
          :max="99"
          :dragSlot="false"
          :init="ship.data.slots[j]"
          :handle-show-item-list="showItemList"
          :item-parent="ship"
          @input="updateItem"
        />
        <!-- 補強増設枠 -->
        <item-input
          v-model="ship.exItem"
          :index="99"
          :max="0"
          :init="0"
          :dragSlot="false"
          :handle-show-item-list="showItemList"
          :item-parent="ship"
          @input="updateItem"
        />
      </div>
    </template>
  </v-card>
</template>

<style scoped>
.disabled {
  opacity: 0.5;
}

.empty-ship {
  height: 100%;
  min-height: 220px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  opacity: 0.8;
  font-size: 12px;
  transition: 0.3s;
}
.empty-ship:hover {
  opacity: 1;
  box-shadow: inset 0 0 12px rgba(0, 168, 255, 0.4);
}

.ship-header {
  position: relative;
}
.ship-remove {
  position: absolute;
  right: -4px;
  top: -4px;
  z-index: 1;
}

.clickable-status {
  border-radius: 0.2rem;
  cursor: pointer;
  transition: 0.2s;
}
.clickable-status:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.menu-slider-text {
  width: 60px;
  align-self: center;
  margin-left: 1rem;
}

.ship-name {
  flex-grow: 1;
  width: 100px;
  font-size: 0.8em;
  transition: 0.2s;
  cursor: pointer;
}

.btn-item-reset {
  position: relative;
  right: -2px;
}
.btn-item-reset .close-bar {
  left: 44%;
  margin-top: 3px;
  pointer-events: none;
  position: absolute;
  height: 24px;
  width: 3px;
  opacity: 0;
  transform: scale(1, 0);
  transform-origin: top;
  transition: 0.1s;
  background-color: rgb(128, 200, 255);
  box-shadow: 0px 0px 4px rgb(128, 200, 255);
  z-index: 0;
}
.btn-item-reset:hover .close-bar {
  transform: scale(1, 1);
  z-index: 1;
  opacity: 0.6;
}
.btn-item-reset:active .close-bar {
  box-shadow: 0px 0px 10px rgb(128, 200, 255);
  opacity: 1;
}
.close-bar.item-count-2 {
  height: 53px;
}
.close-bar.item-count-3 {
  height: 82px;
}
.close-bar.item-count-4 {
  height: 111px;
}
.close-bar.item-count-5 {
  height: 140px;
}
.close-bar.item-count-6 {
  height: 169px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from '@/components/item/ItemInput.vue';
import Ship, { ShipBuilder } from '@/classes/fleet/ship';
import Item from '@/classes/item/item';

export default Vue.extend({
  components: { ItemInput },
  name: 'ShipInput',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    handleShowShipList: {
      type: Function,
      required: true,
    },
    handleCloseShip: {
      type: Function,
      required: true,
    },
    value: {
      type: Ship,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    fixDown: {
      type: Number,
      default: 0,
    },
    rateDown: {
      type: Number,
      default: 0,
    },
  },
  data: () => ({
    level: 99,
    luck: 0,
    antiAir: 0,
    levelMenu: false,
    luckMenu: false,
    antiAirMenu: false,
  }),
  computed: {
    ship(): Ship {
      return this.value;
    },
    airPowerDetail(): string {
      const airPowers = this.ship.items.map((v) => v.fullAirPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    isNoShip() {
      return this.value.data.id === 0;
    },
    rateDownValue() {
      return Math.floor(this.rateDown * 100);
    },
  },
  methods: {
    updateItem() {
      this.setShip();
    },
    setShip(value?: Ship) {
      if (value === undefined) {
        this.$emit('input', new Ship({ ship: this.ship }));
      } else {
        this.$emit('input', value);
      }
    },
    onLevelMenuToggle() {
      if (!this.levelMenu) {
        const builder: ShipBuilder = { ship: this.ship, level: this.level };
        this.setShip(new Ship(builder));
      } else {
        this.level = this.ship.level;
      }
    },
    onLuckMenuToggle() {
      if (!this.luckMenu) {
        const builder: ShipBuilder = { ship: this.ship, luck: this.luck };
        this.setShip(new Ship(builder));
      } else {
        this.luck = this.ship.luck;
      }
    },
    onAAMenuToggle() {
      if (!this.antiAirMenu) {
        const builder: ShipBuilder = { ship: this.ship, antiAir: this.antiAir };
        this.setShip(new Ship(builder));
      } else {
        this.antiAir = this.ship.antiAir;
      }
    },
    changeActive(value: boolean) {
      this.setShip(new Ship({ ship: this.ship, isActive: value }));
    },
    resetItems() {
      this.setShip(new Ship({ ship: this.value, items: [], exItem: new Item() }));
    },
    removeShip() {
      this.handleCloseShip(this.index);
    },
    showItemList(slotIndex: number): void {
      // 艦娘indexを付与してFleet.vueへスルーパス
      this.handleShowItemList(this.index, slotIndex);
    },
    showShipList(): void {
      // 艦娘indexを付与してFleet.vueへスルーパス
      this.handleShowShipList(this.index);
    },
  },
});
</script>
