<template>
  <v-card class="ma-1 pa-2">
    <div class="d-flex">
      <div class="align-self-center">
        <v-img :src="`/img/ship/${ship.data.albumId}.png`" height="30" width="120"></v-img>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex caption flex-wrap">
          <div class="ml-2 primary--text">id:{{ ship.data.id }}</div>
          <div class="ml-2">
            <span class="text--secondary">耐久:</span>
            <span class="ml-1 font-weight-medium">{{ ship.data.hp }}</span>
            <span class="ml-2 text--secondary">装甲:</span>
            <span class="ml-1 font-weight-medium">{{ ship.data.armor }}</span>
          </div>
        </div>
        <div class="d-flex">
          <div class="ship-name ml-2 text-truncate">{{ ship.data.name }}</div>
        </div>
      </div>
    </div>
    <div class="d-flex caption px-1 flex-wrap">
      <div v-if="ship.fullAirPower > 0">
        <span class="text--secondary">制空:</span>
        <span class="ml-1 font-weight-medium">{{ ship.fullAirPower }}</span>
        <span class="ml-1 mr-2 text--secondary">{{ airPowerDetail() }}</span>
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
      <item-input
        v-model="ship.exItem"
        :index="99"
        :max="0"
        :init="0"
        :handle-show-item-list="showItemList"
      />
    </div>
  </v-card>
</template>

<style scoped>
.ship-name {
  flex-grow: 1;
  width: 100px;
  font-size: 0.8em;
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
    ship: {
      type: Ship,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  methods: {
    airPowerDetail(): string {
      const airPowers = this.ship.items.map((v) => v.airPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    showItemList(slotIndex: number): void {
      // 艦娘indexを付与してFleet.vueへスルーパス
      this.handleShowItemList(this.index, slotIndex);
    },
  },
});
</script>
