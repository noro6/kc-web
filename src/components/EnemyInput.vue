<template>
  <v-card class="ma-1 pa-2 enemy-preview">
    <div class="d-flex">
      <div class="align-self-center">
        <v-img :src="`/img/enemy/${enemy.data.id - 1500}.png`" height="30" width="120"></v-img>
      </div>
      <div class="flex-grow-1">
        <div class="d-flex caption">
          <div class="enemy-id ml-2 primary--text">id:{{ enemy.data.id }}</div>
          <div class="ml-2">
            <span class="text--secondary">耐久:</span>
            <span class="ml-1 font-weight-medium">{{ enemy.data.hp }}</span>
          </div>
          <div class="ml-2">
            <span class="text--secondary">装甲:</span>
            <span class="ml-1 font-weight-medium">{{ enemy.data.armor }}</span>
          </div>
        </div>
        <div class="enemy-name ml-2 text-truncate">
          {{ enemy.data.name }}
        </div>
      </div>
    </div>
    <div class="d-flex caption px-2">
      <div>
        <span class="text--secondary">制空:</span>
        <span class="ml-1 font-weight-medium">{{ enemy.airPower }}</span>
      </div>
      <div class="ml-1 text--secondary">{{ airPowerDetail() }}</div>
    </div>
    <div>
      <item-input
        v-for="(item, j) in enemy.items"
        :key="j"
        :item="item"
        :index="j"
        :max="999"
        :init="999"
        :handle-show-item-list="showItemList"
        :readonly="true"
      />
    </div>
  </v-card>
</template>

<style scoped>
.enemy-name {
  width: 191px;
  font-size: 0.8em;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from './ItemInput.vue';
import Enemy from '@/classes/Enemy';

export default Vue.extend({
  components: { ItemInput },
  name: 'EnemyInput',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    enemy: {
      type: Enemy,
      required: true,
    },
  },
  methods: {
    airPowerDetail(): string {
      const airPowers = this.enemy.items.map((v) => v.airPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    showItemList(): void {
      // 装備変更は許可しない
      // this.handleShowItemList(index, index);
    },
  },
});
</script>
