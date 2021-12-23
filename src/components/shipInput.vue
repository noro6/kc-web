<template>
  <v-card class="ma-1 pa-2" :class="{ disabled: !ship.isActive }" @dragover.prevent @drop.stop>
    <div class="d-flex ship-header">
      <div class="align-self-center" v-if="ship.data.id">
        <v-img :src="`/img/ship/${ship.data.albumId}.png`" height="36" width="144"></v-img>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex caption flex-wrap">
          <v-menu offset-y :close-on-content-click="false" transition="slide-y-transition" bottom right>
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
              <div class="d-flex mt-4">
                <v-slider max="175" min="1" v-model="level" hide-details class="align-self-center"></v-slider>
                <div class="level-text">
                  <v-text-field v-model.number="level" class="pt-0 mt-0" max="175" min="1" hide-details type="number"></v-text-field>
                </div>
              </div>
            </v-card>
          </v-menu>
          <div class="mr-6 d-flex">
            <div class="px-1 clickable-status" v-ripple="{ class: 'info--text' }">
              <span class="text--secondary">運:</span>
              <span class="pl-1 font-weight-medium">{{ ship.data.luck }}</span>
            </div>
            <div class="px-1 clickable-status" v-ripple="{ class: 'info--text' }">
              <span class="text--secondary">対空:</span>
              <span class="pl-1 font-weight-medium">{{ ship.data.antiAir }}</span>
            </div>
          </div>
        </div>
        <div class="d-flex pl-1 clickable-status" v-ripple="{ class: 'info--text' }" @click="showShipList">
          <div class="ship-name text-truncate">{{ ship.data.name ? ship.data.name : "艦娘選択" }}</div>
        </div>
      </div>
      <!-- 艦娘解除 -->
      <div class="ship-remove">
        <v-btn icon @click="removeShip()">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <v-divider class="mt-1"></v-divider>
    <!-- 装備一覧 -->
    <div>
      <div class="d-flex caption pl-1">
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
      <item-input
        v-for="(item, j) in ship.items"
        :key="j"
        v-model="ship.items[j]"
        :index="j"
        :max="99"
        :init="ship.data.slots[j]"
        :handle-show-item-list="showItemList"
      />
      <!-- 補強増設枠 -->
      <item-input v-model="ship.exItem" :index="99" :max="0" :init="0" :handle-show-item-list="showItemList" />
    </div>
  </v-card>
</template>

<style scoped>
.disabled {
  opacity: 0.6;
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

.level-text {
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
import ItemInput from './ItemInput.vue';
import Ship from '@/classes/Ship';
import Item from '@/classes/Item';

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
    value: {
      type: Ship,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    level: 99,
  }),
  computed: {
    ship(): Ship {
      return this.value;
    },
    airPowerDetail(): string {
      const airPowers = this.ship.items.map((v) => v.airPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
  },
  methods: {
    setShip(value: Ship) {
      this.$emit('input', value);
    },
    changeActive(value: boolean) {
      this.setShip(new Ship({ ship: this.ship, isActive: value }));
    },
    resetItems() {
      this.setShip(new Ship({ ship: this.value, items: [], exItem: new Item() }));
    },
    removeShip() {
      this.setShip(new Ship({ isEscort: this.ship.isEscort }));
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
