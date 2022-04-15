<template>
  <v-card class="ma-1 py-2">
    <div class="d-flex">
      <div class="ml-2 align-self-center">{{ index + 1 }}戦目</div>
      <v-spacer></v-spacer>
      <div v-if="capturing && fleet.nodeName" class="mx-3">{{ fleet.nodeName }}</div>
      <div class="align-self-center mr-1" v-if="!capturing">
        <v-btn outlined small color="primary" @click.stop="showWorldList">海域選択</v-btn>
      </div>
      <div class="align-self-center pr-1" v-if="existEnemy && !capturing">
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
        <v-select dense v-model="fleet.cellType" hide-details :items="cellTypes" @change="changedCombo()"></v-select>
      </div>
      <div class="formation-select">
        <v-select dense v-model="fleet.formation" hide-details :items="formations" @change="changedCombo()"></v-select>
      </div>
    </div>
    <div class="d-flex mx-2">
      <div class="caption text--secondary">艦隊防空:</div>
      <div class="ml-1 caption">{{ fleet.fleetAntiAir }}</div>
      <v-spacer></v-spacer>
      <div class="mx-1 caption text--secondary">制空:</div>
      <div class="body-2 enemy-air-power">{{ fleet.fullAirPower }}</div>
    </div>
    <div class="d-flex mx-2">
      <div class="caption text--secondary">半径:</div>
      <div class="ml-1 caption">{{ fleet.range }}</div>
      <v-spacer></v-spacer>
      <div class="mx-1 caption text--secondary">基地制空:</div>
      <div class="body-2 enemy-air-power">{{ fleet.fullAirbaseAirPower }}</div>
    </div>
    <v-divider></v-divider>
    <div class="enemy-list mt-1">
      <div
        v-for="(enemy, index) in fleet.enemies"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        @click="showEnemyList(index)"
        class="d-flex enemy-list-item pr-2"
        @mouseenter="bootTooltip(enemy, $event)"
        @mouseleave="clearTooltip"
      >
        <div class="item-index-area">
          <div class="close-btn">
            <v-btn icon x-small @click.stop="removeEnemy(index)">
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </div>
          <div class="enemy-index caption primary--text mr-1" :class="{ 'success--text': index >= 6 }">{{ (index % 6) + 1 }}</div>
        </div>
        <div v-show="enemy.data.id > 0">
          <v-img :src="`./img/ship/${enemy.data.id}.png`" height="30" width="120"></v-img>
        </div>
        <div v-show="enemy.data.id === 0" class="enemy-name text-truncate">
          {{ enemy.data.name ? enemy.data.name : "敵艦選択" }}
        </div>
        <div class="mx-1 caption text--secondary">制空:</div>
        <div class="body-2 enemy-air-power" v-if="enemy.fullAirPower === enemy.fullLBAirPower">{{ enemy.fullAirPower }}</div>
        <div class="body-2 enemy-air-power" v-else>({{ enemy.fullLBAirPower }})</div>
      </div>
    </div>
    <v-dialog width="1100" v-model="detailDialog" transition="scroll-x-transition" @input="toggleDetailDialog">
      <enemy-detail v-if="!destroyDialog" :handle-show-item-list="showItemList" :fleet="fleet" :handleClose="closeDetail" />
    </v-dialog>
    <v-tooltip
      v-model="enabledTooltip"
      color="black"
      bottom
      right
      transition="slide-y-transition"
      :position-x="tooltipX"
      :position-y="tooltipY"
    >
      <enemy-tooltip v-model="tooltipEnemy" />
    </v-tooltip>
  </v-card>
</template>

<style scoped>
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
  position: relative;
}
.enemy-list-item:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.anti-air-ci-icon {
  position: absolute;
  top: 0px;
  left: 122px;
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
import EnemyDetail from '@/components/enemy/EnemyDetail.vue';
import EnemyTooltip from '@/components/enemy/EnemyTooltip.vue';
import Const, { CELL_TYPE } from '@/classes/const';
import EnemyFleet, { EnemyFleetBuilder } from '@/classes/enemy/enemyFleet';
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';

export default Vue.extend({
  name: 'EnemyFleet',
  components: {
    EnemyDetail,
    EnemyTooltip,
  },
  props: {
    value: {
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
    handleShowWorldList: {
      type: Function,
      required: true,
    },
    capturing: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    formations: Const.FORMATIONS,
    cellTypes: Const.CELL_TYPES,
    detailDialog: false,
    destroyDialog: false,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipEnemy: new Enemy(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  computed: {
    fleet(): EnemyFleet {
      return this.value;
    },
    existEnemy() {
      return this.value.enemies.find((v) => v.data.id);
    },
  },
  methods: {
    showItemList(enemyIndex: number, slotIndex: number) {
      this.handleShowItemList(this.index, enemyIndex, slotIndex);
    },
    showEnemyList(index: number) {
      this.clearTooltip();
      this.handleShowEnemyList(this.index, index);
    },
    async clickedInfo() {
      this.detailDialog = true;
      this.destroyDialog = false;
    },
    setFleet(fleet?: EnemyFleet) {
      if (fleet === undefined) {
        this.$emit('input', new EnemyFleet({ fleet: this.fleet }));
      } else {
        this.$emit('input', fleet);
      }
    },
    resetFleet() {
      this.setFleet(new EnemyFleet());
    },
    changedCombo() {
      const enemyFleet = this.fleet;
      const isUnion = enemyFleet.cellType === CELL_TYPE.GRAND;
      const enemies = enemyFleet.enemies.concat();
      if (isUnion && enemyFleet.enemies.length <= 6) {
        for (let i = 0; i < 6; i += 1) {
          enemies.push(new Enemy(new EnemyMaster(), [], true));
        }
      } else if (!isUnion && enemyFleet.enemies.length > 6) {
        for (let i = 0; i < 6; i += 1) {
          enemies.pop();
        }
      }
      const builder: EnemyFleetBuilder = { fleet: enemyFleet, enemies };
      this.setFleet(new EnemyFleet(builder));
    },
    removeEnemy(index: number) {
      const enemies = this.fleet.enemies.concat();
      enemies[index] = new Enemy();
      const builder: EnemyFleetBuilder = { fleet: this.fleet, enemies };
      this.setFleet(new EnemyFleet(builder));
    },
    toggleDetailDialog() {
      if (!this.detailDialog) {
        setTimeout(() => {
          this.destroyDialog = true;
        }, 100);
      } else {
        this.destroyDialog = false;
      }
    },
    showWorldList() {
      this.handleShowWorldList(this.index);
    },
    closeDetail() {
      this.detailDialog = false;
    },
    bootTooltip(enemy: Enemy, e: MouseEvent) {
      if (!enemy.data.id) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('enemy-air-power')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x + rect.width;
        this.tooltipY = rect.y + rect.height;
        this.tooltipEnemy = enemy;
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
