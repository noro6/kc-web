<template>
  <v-card>
    <div class="d-flex pt-2 pb-1 pr-2">
      <div class="align-self-center ml-3">詳細計算</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="d-flex pa-2">
      <v-card class="ma-2 pa-2">
        <template v-for="(item, i) in parent.items">
          <div
            v-if="item.isPlane"
            :key="`item_${i}`"
            v-ripple="{ class: 'info--text' }"
            class="calc-item"
            :class="{ selected: selectedIndex === i }"
            @click="selectItem(i)"
          >
            <div class="align-self-center body-2">{{ item.fullSlot }}</div>
            <div>
              <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="24" width="24"></v-img>
            </div>
            <div class="item-name text-truncate">{{ item.data.name }}</div>
            <div v-show="item.remodel" class="item-remodel">
              <v-icon small class="teal--text text--accent-4">mdi-star</v-icon>
              <span class="teal--text text--accent-4 body-2">{{ item.remodel }}</span>
            </div>
          </div>
          <div v-else :key="`item_${i}`" class="calc-item no-item">
            <div class="mx-auto">-</div>
          </div>
        </template>
      </v-card>
    </div>
  </v-card>
</template>

<style scoped>
.calc-item {
  cursor: pointer;
  display: flex;
  border-radius: 0.15rem;
  padding: 0.25rem 0.5rem;
  width: 400px;
  transition: 0.2s;
}
.no-item {
  cursor: default;
}
.calc-item:not(.no-item):hover {
  box-shadow: inset 0 0 20px rgba(60, 164, 255, 0.2);
}
.calc-item.selected,
.calc-item.selected:hover {
  box-shadow: inset 0 0 20px rgba(60, 164, 255, 0.6);
}

.item-name {
  align-self: center;
  font-size: 0.8em;
  flex-grow: 1;
  width: 100px;
}
.item-remodel {
  width: 50px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import * as _ from 'lodash';
import CalcManager from '@/classes/calcManager';
import SaveData from '@/classes/saveData/saveData';
import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import Item from '@/classes/item/item';

export default Vue.extend({
  name: 'PlaneDetailResult',
  components: {},
  props: {
    parent: {
      type: [Ship, Airbase, Enemy],
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    fleetIndex: {
      type: Number,
      default: 0,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    calcManager: undefined as undefined | CalcManager,
    selectedIndex: -1,
  }),
  mounted() {
    const saveData = this.$store.state.mainSaveData as SaveData;
    const items = this.$store.state.items as ItemMaster[];
    const ships = this.$store.state.ships as ShipMaster[];
    const enemies = this.$store.state.enemies as EnemyMaster[];

    this.calcManager = saveData.loadManagerData(items, ships, enemies);
  },
  methods: {
    selectItem(index: number) {
      if (this.selectedIndex === index || !this.calcManager) {
        return;
      }

      this.selectedIndex = index;
      let item: Item;

      // この艦載機情報の詳細計算フラグを立て、計算を行う
      if (this.parent instanceof Ship) {
        item = this.calcManager.fleetInfo.fleets[this.fleetIndex].ships[this.index].items[index];
        if (item) {
          item.needRecord = true;
        }
      } else if (this.parent instanceof Airbase) {
        this.calcManager.airbaseInfo.airbases[this.index].needShootDown = true;
        item = this.calcManager.airbaseInfo.airbases[this.index].items[index];
        if (item) {
          item.needRecord = true;
        }
      } else {
        item = new Item();
      }

      // 計算実行
      this.calcManager.updateInfo();

      if (item) {
        // 集計
        const dist = _.groupBy(item.dist);
        const sum = item.dist.length;

        Object.keys(dist).forEach((key) => {
          console.log(`${key}: ${dist[key].length} / ${sum}`);
        });
      }
    },
    close() {
      this.handleClose();
    },
  },
});
</script>
