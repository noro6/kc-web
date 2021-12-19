<template>
  <v-card elevation="2" class="mx-1 py-2">
    <div class="d-flex">
      <div class="ml-2 align-self-center">{{ index + 1 }}戦目</div>
      <v-spacer></v-spacer>
      <div class="align-self-center mr-1">
        <v-btn outlined small color="primary">海域選択</v-btn>
      </div>
      <div class="align-self-center pr-1">
        <v-btn color="info" icon small @click="enemyDetailDialog = true">
          <v-icon>mdi-information</v-icon>
        </v-btn>
        <v-btn icon small @click="resetFleet()">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="d-flex mb-1 justify-space-between mx-2">
      <div class="formation-select">
        <v-select dense v-model="fleet.formation" hide-details :items="formations"></v-select>
      </div>
      <div class="cell-type-select">
        <v-select dense v-model="fleet.cellType" hide-details :items="cellTypes"></v-select>
      </div>
    </div>
    <div class="d-flex mx-2">
      <div class="caption text--secondary">艦隊防空:</div>
      <div class="ml-1 caption">{{ fleet.fleetAntiAir }}</div>
      <div class="ml-2 caption text--secondary">半径:</div>
      <div class="ml-1 caption">{{ fleet.range }}</div>
    </div>
    <div class="d-flex mx-2">
      <v-spacer></v-spacer>
      <div class="mx-1 caption text--secondary">制空:</div>
      <div class="body-2 enemy-air-power">{{ fleet.airPower }}</div>
    </div>
    <v-divider></v-divider>
    <div class="enemy-list mt-1">
      <div
        v-for="(enemy, index) in fleet.enemies"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        @click="showEnemyList(index)"
        class="d-flex enemy-list-item px-2"
      >
        <div class="px-1 caption primary--text">{{ index + 1 }}</div>
        <div v-show="enemy.data.id > 0">
          <v-img :src="`/img/enemy/${enemy.data.id - 1500}.png`" height="30" width="120"></v-img>
        </div>
        <div v-show="enemy.data.id === 0" class="enemy-name text-truncate">
          {{ enemy.data.name ? enemy.data.name : "敵艦選択" }}
        </div>
        <div class="mx-1 caption text--secondary">制空:</div>
        <div class="body-2 enemy-air-power">{{ enemy.airPower }}</div>
      </div>
    </div>
    <v-dialog v-model="enemyDetailDialog" width="1100">
      <enemy-detail :handle-show-item-list="showItemList" :fleet="fleet" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.v-card .theme--dark.v-card {
  background-color: rgb(35, 35, 38);
}
.v-btn--outlined {
  padding: 0 0.25rem !important;
}
.formation-select,
.cell-type-select {
  width: 94px;
}

.enemy-list .d-flex > div {
  align-self: center;
}
.enemy-list-item {
  transition: 0.1s;
  cursor: pointer;
  height: 30px;
}
.enemy-list-item:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.enemy-name {
  width: 120px;
  font-size: 0.8em;
}
.enemy-air-power {
  width: 30px;
  text-align: right;
  white-space: nowrap;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Const from '@/classes/Const';
import EnemyFleet from '@/classes/EnemyFleet';
import EnemyDetail from '@/components/EnemyDetail.vue';

export default Vue.extend({
  name: 'EnemyFleet',
  components: {
    EnemyDetail,
  },
  props: {
    fleet: {
      type: EnemyFleet,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    handleShowEnemyList: {
      type: Function,
      required: true,
    },
    handleShowItemList: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    formations: Const.FORMATIONS,
    cellTypes: Const.CELL_TYPES,
    enemyDetailDialog: false,
  }),
  methods: {
    showItemList(index: number) {
      this.handleShowItemList(this.index, index);
    },
    showEnemyList(index: number) {
      this.handleShowEnemyList(this.index, index);
    },
    resetFleet() {
      this.fleet.clear();
    },
  },
});
</script>
