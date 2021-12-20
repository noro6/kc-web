<template>
  <v-card elevation="2" class="mx-1 py-2">
    <div class="d-flex">
      <div class="ml-2 align-self-center">{{ index + 1 }}戦目</div>
      <v-spacer></v-spacer>
      <div class="align-self-center mr-1">
        <v-btn outlined small color="primary">海域選択</v-btn>
      </div>
      <div class="align-self-center pr-1">
        <v-btn color="info" icon small @click="clickedInfo()">
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
        <v-btn icon small @click="resetFleet()">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="d-flex mb-1 justify-space-between mx-2">
      <div class="cell-type-select">
        <v-select dense v-model="fleet.cellType" hide-details :items="cellTypes" @change="changedCellType()"></v-select>
      </div>
      <div class="formation-select">
        <v-select dense v-model="fleet.formation" hide-details :items="formations"></v-select>
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
      <div class="body-2 enemy-air-power">{{ airPower }}</div>
    </div>
    <v-divider></v-divider>
    <div class="enemy-list mt-1">
      <div
        v-for="(enemy, index) in fleet.enemies"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        @click="showEnemyList(index)"
        class="d-flex enemy-list-item pr-2"
      >
        <div class="item-index-area">
          <div class="close-btn">
            <v-btn icon x-small @click.stop="removeEnemy(index)">
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="enemy-index caption primary--text mr-1" :class="{ 'success--text': index >= 6 }">{{ index + 1 }}</div>
        </div>
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
      <enemy-detail ref="enemyDetail" :handle-show-item-list="showItemList" :fleet="fleet" />
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
.item-index-area {
  width: 24px;
}
.enemy-index {
  text-align: right;
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

.enemy-list-item .close-btn,
.enemy-list-item:hover .enemy-index {
  display: none !important;
}
.enemy-list-item:hover .close-btn {
  display: block !important;
}
.enemy-list-item .close-btn {
  text-align: center;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Const from '@/classes/Const';
import EnemyFleet from '@/classes/EnemyFleet';
import EnemyDetail from '@/components/EnemyDetail.vue';
import Enemy from '@/classes/Enemy';

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
  computed: {
    airPower() {
      return this.fleet.airPower;
    },
  },
  methods: {
    showItemList(index: number) {
      this.handleShowItemList(this.index, index);
    },
    showEnemyList(index: number) {
      this.handleShowEnemyList(this.index, index);
    },
    async clickedInfo() {
      await (this.enemyDetailDialog = true);
      const enemyDetail = this.$refs.enemyDetail as InstanceType<typeof EnemyDetail>;
      enemyDetail.formation = this.fleet.formation;
      enemyDetail.updateTable();
    },
    resetFleet() {
      this.fleet.clear();
    },
    changedCellType() {
      this.fleet.isUnion = this.fleet.cellType === Const.CELL_GRAND;
      if (this.fleet.isUnion && this.fleet.enemies.length <= 6) {
        for (let i = 0; i < 6; i += 1) {
          this.fleet.enemies.push(new Enemy());
        }
      } else {
        this.fleet.enemies = this.fleet.enemies.slice(0, 6);
      }
    },
    removeEnemy(index: number) {
      this.$set(this.fleet.enemies, index, new Enemy());
    },
  },
});
</script>
