<template>
  <div>
    <v-card>
      <div class="d-flex pt-2 pb-1 pr-2">
        <div class="align-self-center ml-3">敵艦選択</div>
        <v-spacer></v-spacer>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <v-divider></v-divider>
      <div class="d-flex px-2 pt-2">
        <div class="align-self-center">
          <v-text-field label="id 名称検索" v-model="keyword" clearable @input="filter()" prepend-inner-icon="mdi-magnify"></v-text-field>
        </div>
        <div class="ml-5 align-self-center">
          <v-checkbox v-model="isLandBase" @change="filter()" label="地上施設"></v-checkbox>
        </div>
        <v-spacer></v-spacer>
      </div>
      <div class="d-flex flex-wrap mx-3">
        <div
          v-for="(i, index) in types"
          :key="index"
          v-ripple="{ class: 'info--text' }"
          class="type-selector"
          :class="{ active: index === type, disabled: keyword || isLandBase }"
          @click="changeType(index)"
        >
          {{ i.text }}
        </div>
      </div>
      <v-divider class="mx-3"></v-divider>
      <div class="enemy-table-container pa-3">
        <div class="enemy-table-body">
          <div
            v-ripple="{ class: 'info--text' }"
            v-for="(enemy, i) in enemies"
            :key="i"
            class="enemy-list"
            @click="clickedEnemy(enemy)"
            @mouseenter="bootTooltip(enemy, $event)"
            @mouseleave="clearTooltip"
          >
            <div>
              <v-img :src="`./img/ship/${enemy.id}.png`" height="30" width="120"></v-img>
            </div>
            <div class="flex-grow-1">
              <div class="enemy-id primary--text">id:{{ enemy.id }}</div>
              <div class="d-flex">
                <div class="enemy-name text-truncate">{{ enemy.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card>
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
  </div>
</template>

<style scoped>
.enemy-table-container {
  height: 64vh;
  overflow-y: scroll;
}
.enemy-table-body {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 600px) {
  .enemy-table-body {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 880px) {
  .enemy-table-body {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1100px) {
  .enemy-table-body {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.5rem 0.6rem;
  font-size: 0.9em;
  cursor: pointer;
}
.type-selector:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.type-selector.active {
  border-color: rgba(33, 150, 243, 0.4);
  background-color: rgba(33, 150, 243, 0.1);
}
.type-selector.disabled {
  opacity: 0.4;
  background-color: transparent;
  pointer-events: none;
}

.enemy-list {
  display: flex;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: 0.1s;
  border-radius: 0.2rem;
  max-height: 45px;
}
.enemy-list:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.enemy-list > div {
  align-self: center;
}
.enemy-id {
  font-size: 11px;
  margin-left: 0.1rem;
}
.enemy-name {
  font-size: 0.8em;
  width: 10px;
  margin-left: 0.1rem;
  flex-grow: 1;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyTooltip from '@/components/enemy/EnemyTooltip.vue';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Const from '@/classes/const';
import Enemy from '@/classes/enemy/enemy';

export default Vue.extend({
  name: 'EnemyList',
  components: {
    EnemyTooltip,
  },
  props: {
    handleDecideEnemy: {
      type: Function,
      required: true,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    all: [] as EnemyMaster[],
    enemies: [] as EnemyMaster[],
    types: [] as { text: string; types: number[] }[],
    type: 0,
    isLandBase: false,
    keyword: '',
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipEnemy: new Enemy(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  mounted() {
    const existTypes: number[] = [];
    const enemies = this.$store.state.defaultEnemies as EnemyMaster[];
    for (let i = 0; i < enemies.length; i += 1) {
      const enemy = enemies[i];
      this.all.push(enemy);
      if (!existTypes.includes(enemy.type)) {
        existTypes.push(enemy.type);
      }
    }
    for (let i = 0; i < Const.SHIP_TYPES_ALT.length; i += 1) {
      const data = Const.SHIP_TYPES_ALT[i];
      if (data.types.some((v) => existTypes.includes(v))) {
        this.types.push({ text: data.text, types: data.types });
      }
    }
    this.filter();
  },
  methods: {
    changeType(index = 0) {
      this.type = index;
      this.filter();
    },
    filter() {
      const word = this.keyword;
      let result = this.all.concat();
      const t = this.types[this.type];

      // 検索語句あればこれ以外の検索はしない
      if (word) {
        result = result.filter((v) => v.id === +word || v.name.indexOf(word) >= 0);
      } else if (this.isLandBase) {
        // 地上施設ONLY
        result = result.filter((v) => v.isLandBase);
      } else if (t) {
        // カテゴリ検索
        result = result.filter((v) => !v.isLandBase && t.types.includes(v.type));
      }

      this.enemies = result;
    },
    clickedEnemy(enemy: EnemyMaster) {
      this.clearTooltip();
      this.handleDecideEnemy(enemy);
    },
    close() {
      this.handleClose();
    },
    bootTooltip(enemy: EnemyMaster, e: MouseEvent) {
      if (!enemy.id) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('enemy-id')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = e.clientX;
        this.tooltipY = rect.y + rect.height;
        const manualEnemies = this.$store.state.manualEnemies as EnemyMaster[];
        const manualEnemy = manualEnemies.find((v) => v.id === enemy.id);
        if (manualEnemy) {
          this.tooltipEnemy = Enemy.createEnemyFromMaster(manualEnemy, false, this.$store.state.items);
        } else {
          this.tooltipEnemy = Enemy.createEnemyFromMaster(enemy, false, this.$store.state.items);
        }
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
