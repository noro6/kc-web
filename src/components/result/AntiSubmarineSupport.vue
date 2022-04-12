<template>
  <div class="pa-2 container">
    <div>
      <div class="ship-selector">
        <div v-for="(ship, i) in enabledShips" :key="`ship${i}`" class="d-flex">
          <div class="align-self-center mr-2">
            <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120"></v-img>
          </div>
          <div class="align-self-center d-none d-sm-block flex-grow-1">
            <div class="d-flex">
              <div class="text-truncate">{{ ship.data.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="enemy-list">
      <v-checkbox class="ml-auto" label="姫級表示" v-model="displayPrincess" dense hide-details></v-checkbox>
      <div class="table-container mt-3">
        <table>
          <thead>
            <tr>
              <td class="py-1 pl-1 text-left">敵艦</td>
              <td class="pr-1">耐久</td>
              <td class="pr-1">装甲</td>
              <td class="pr-1">ダメージ幅</td>
              <td class="pr-1">撃沈</td>
              <td class="pr-1">大破</td>
              <td class="pr-1">中破</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(enemy, i) in displayEnemies" :key="`enemy${i}`">
              <td class="d-flex pl-1">
                <div class="align-self-center mr-2">
                  <v-img :src="`./img/ship/${enemy.data.id}.png`" height="30" width="120"></v-img>
                </div>
                <div class="align-self-center d-none d-sm-block flex-grow-1">
                  <div class="text-left enemy-id primary--text">id:{{ enemy.data.id }}</div>
                  <div class="d-flex">
                    <div class="enemy-name caption text-truncate">{{ enemy.data.name }}</div>
                  </div>
                </div>
              </td>
              <td class="pr-1">耐久</td>
              <td class="pr-1">装甲</td>
              <td class="pr-1">ダメージ幅</td>
              <td class="pr-1">撃沈</td>
              <td class="pr-1">大破</td>
              <td class="pr-1">中破</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 0.5fr 1fr;
  column-gap: 1rem;
}

.container > div {
  height: 60vh;
}

.ship-selector {
  position: relative;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 4px;
  padding: 1rem;
}
.container-header {
  position: absolute;
  top: -0.75em;
  font-size: 0.8em;
  background-color: #fff;
}

.enemy-list {
  padding-left: 1rem;
  border-left: 2px solid rgba(128, 128, 128, 0.4);
}
.enemy-id {
  font-size: 11px;
}

.table-container {
  height: 50vh;
  overflow-y: auto;
}

table {
  font-size: 0.75em;
  text-align: right;
  width: 100%;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
  border-collapse: separate;
  border-spacing: 0;
}
table thead th {
  padding: 0.2rem 0;
}
table thead tr {
  background-color: rgba(128, 128, 128, 0.1);
}

table th {
  opacity: 0.8;
}
table tbody tr td {
  border-top: 1px solid rgba(128, 128, 128, 0.25);
}
table tbody tr:hover {
  background-color: rgba(128, 128, 128, 0.05);
}
</style>

<script lang="ts">
import { SHIP_TYPE } from '@/classes/const';
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Fleet from '@/classes/fleet/fleet';
import Ship from '@/classes/fleet/ship';
import ItemMaster from '@/classes/item/itemMaster';
import Vue from 'vue';

export default Vue.extend({
  name: 'AntiSubmarineSupport',
  props: {
    fleet: {
      type: Fleet,
      required: true,
    },
  },
  data: () => ({
    enemies: [] as Enemy[],
    displayPrincess: false,
  }),
  mounted() {
    const enemies = this.$store.getters.getEnemies as EnemyMaster[];
    const items = this.$store.state.items as ItemMaster[];

    for (let i = 0; i < enemies.length; i += 1) {
      const enemy = enemies[i];

      if (enemy.type === SHIP_TYPE.SS || enemy.type === SHIP_TYPE.SSV) {
        this.enemies.push(Enemy.createEnemyFromMaster(enemy, false, items));
      }
    }
  },
  computed: {
    enabledShips(): Ship[] {
      return this.fleet.ships.filter((v) => !v.isEmpty);
    },
    displayEnemies(): Enemy[] {
      if (this.displayPrincess) {
        return this.enemies;
      }
      return this.enemies.filter((v) => v.data.id <= 1600);
    },
  },
  methods: {},
});
</script>
