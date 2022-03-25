<template>
  <v-card class="ma-1 pa-2 enemy-preview">
    <div class="d-flex">
      <div class="align-self-center">
        <v-img :src="`./img/ship/${enemy.data.id}.png`" height="30" width="120"></v-img>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex caption flex-wrap">
          <div class="enemy-id ml-2 primary--text">id:{{ enemy.data.id }}</div>
          <div class="ml-2">
            <span class="text--secondary">耐久:</span>
            <span class="ml-1 font-weight-medium">{{ enemy.data.hp }}</span>
            <span class="ml-2 text--secondary">装甲:</span>
            <span class="ml-1 font-weight-medium">{{ enemy.actualArmor }}</span>
          </div>
        </div>
        <div class="d-flex">
          <div class="enemy-name ml-2 text-truncate">{{ enemy.data.name }}</div>
        </div>
      </div>
    </div>
    <div class="d-flex caption px-1 flex-wrap">
      <div v-if="enemy.fullAirPower > 0 || !enemy.fullLBAirPower">
        <span class="text--secondary">制空:</span>
        <span class="ml-1 font-weight-medium">{{ enemy.fullAirPower }}</span>
        <span class="ml-1 mr-2 text--secondary">{{ airPowerDetail }}</span>
      </div>
      <div v-if="enemy.fullLBAirPower && enemy.fullLBAirPower !== enemy.fullAirPower">
        <span class="text--secondary">基地制空:</span>
        <span class="ml-1 font-weight-medium">{{ enemy.fullLBAirPower }}</span>
        <span class="ml-1 mr-2 text--secondary">{{ airPowerDetailAB }}</span>
      </div>
    </div>
    <div class="caption px-1">
      <span class="text--secondary">装備命中:</span>
      <span class="ml-1 font-weight-medium">{{ enemy.sumItemAccuracy }}</span>
      <span class="ml-3 text--secondary">総搭載数:</span>
      <span class="ml-1 font-weight-medium">{{ sumSlot }}</span>
    </div>
    <v-divider></v-divider>
    <div>
      <div @mouseenter="bootTooltip(item, $event)" @mouseleave="clearTooltip" v-for="(item, j) in enemy.items" :key="j">
        <item-input
          v-model="enemy.items[j]"
          :index="j"
          :max="999"
          :init="enemy.data.slots[j]"
          :handle-show-item-list="showItemList"
          :handle-drag-start="clearTooltip"
          :readonly="readonly"
          :is-enemy="true"
          @input="updateItem"
        />
      </div>
    </div>
    <v-tooltip
      v-model="enabledTooltip"
      color="black"
      bottom
      right
      transition="slide-y-transition"
      :position-x="tooltipX"
      :position-y="tooltipY"
    >
      <item-tooltip v-model="tooltipItem" />
    </v-tooltip>
  </v-card>
</template>

<style scoped>
.enemy-name {
  flex-grow: 1;
  width: 100px;
  font-size: 0.8em;
}
</style>

<script lang="ts">
import Vue from 'vue';
import * as _ from 'lodash';
import ItemInput from '@/components/item/ItemInput.vue';
import ItemTooltip from '@/components/item/ItemTooltip.vue';
import Enemy from '@/classes/enemy/enemy';
import Item from '@/classes/item/item';

export default Vue.extend({
  components: { ItemInput, ItemTooltip },
  name: 'EnemyInput',
  props: {
    handleShowItemList: {
      type: Function,
    },
    enemy: {
      type: Enemy,
      required: true,
    },
    readonly: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipItem: new Item(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  computed: {
    airPowerDetail() {
      const airPowers = this.enemy.items.map((v) => (v.isRecon ? 0 : v.fullAirPower));
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    airPowerDetailAB() {
      const airPowers = this.enemy.items.map((v) => v.fullAirPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    sumSlot(): number {
      return _.sum(this.enemy.items.map((v) => v.fullSlot));
    },
  },
  methods: {
    showItemList(index: number): void {
      if (!this.readonly) {
        this.handleShowItemList(index);
      }
    },
    updateItem() {
      if (!this.readonly) {
        this.$emit('input', this.enemy);
      }
    },
    bootTooltip(item: Item, e: MouseEvent) {
      if (!item.data.id) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('item-name')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width / 3;
        this.tooltipY = rect.y + rect.height;
        this.tooltipItem = item;
        this.enabledTooltip = true;
      }, 400);
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
