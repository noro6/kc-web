<template>
  <v-card class="ma-1 pa-2">
    <div class="d-flex">
      <div class="align-self-center">
        <v-img :src="`/img/ship/${ship.data.albumId}.png`" height="30" width="120"></v-img>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex caption flex-wrap">
          <div class="ml-2 primary--text">Lv:{{ ship.level }}</div>
          <div class="ml-2">
            <span class="text--secondary">運:</span>
            <span class="ml-1 font-weight-medium">{{ ship.data.luck }}</span>
          </div>
        </div>
        <div class="d-flex pl-2" v-ripple="{ class: 'info--text' }" @click="showShipList">
          <div class="ship-name text-truncate">{{ ship.data.name ? ship.data.name : '艦娘変更' }}</div>
        </div>
      </div>
    </div>
    <div class="d-flex caption px-1 flex-wrap">
      <div>
        <span class="text--secondary">制空:</span>
        <span class="ml-1 font-weight-medium">{{ ship.fullAirPower }}</span>
        <span class="ml-1 mr-2 text--secondary">{{ airPowerDetail }}</span>
      </div>
    </div>
    <div>
      <item-input
        v-for="(item, j) in ship.items"
        :key="j"
        v-model="ship.items[j]"
        :index="j"
        :max="99"
        :init="ship.data.slots[j]"
        :handle-show-item-list="showItemList"
      />
    </div>
    <div>
      <!-- 補強増設枠 -->
      <item-input v-if="ship.data.id" v-model="ship.exItem" :index="99" :max="0" :init="0" :handle-show-item-list="showItemList" />
    </div>
  </v-card>
</template>

<style scoped>
.ship-name {
  flex-grow: 1;
  width: 100px;
  font-size: 0.8em;
  transition: 0.2s;
  cursor: pointer;
}
.ship-name:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from './ItemInput.vue';
import Ship from '@/classes/Ship';

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
    ship: {
      type: Ship,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  computed: {
    airPowerDetail(): string {
      const airPowers = this.ship.items.map((v) => v.airPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
  },
  methods: {
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
