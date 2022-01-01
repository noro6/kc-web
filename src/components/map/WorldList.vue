<template>
  <div>
    <v-card class="px-2">
      <div class="px-2 py-4 pb-2">海域選択</div>
      <v-divider></v-divider>
      <div class="d-flex mt-6 px-4">
        <div class="flex-grow-1">
          <v-select dense v-model="area" hide-details :items="areaItems" @change="worldChanged" label="海域"></v-select>
        </div>
        <div v-show="isEvent">
          <v-select dense v-model="level" hide-details :items="levelItems" @change="worldChanged" label="難易度"></v-select>
        </div>
        <div>
          <v-select dense v-model="cellIndex" hide-details :items="cellItems" @change="cellChanged" label="セル"></v-select>
        </div>
      </div>
      <div class="mt-5 map-img-area">
        <img usemap="#click_map" class="mx-auto d-block" :src="`/img/map/${area}.png`" height="268" width="467" />
        <map name="click_map">
          <area
            class="node"
            v-for="(item, i) in imgMapItems"
            :key="i"
            :title="item.node"
            :coords="item.coords"
            shape="rect"
            @click="cellClicked(i)"
            @dblclick="commitFleet"
          />
        </map>
      </div>
      <div class="patterns-container px-2">
        <v-tabs v-model="tab" @change="fleetTabChanged" v-show="enabledCommitBtn">
          <v-tab v-for="(name, i) in tabNames" :key="i" :href="`#pattern${i}`">{{ name }}</v-tab>
          <v-tab-item v-for="(fleet, i) in fleetPatterns" :key="i" :value="`pattern${i}`">
            <v-divider></v-divider>
            <div class="d-flex flex-wrap cell-info-row mt-1">
              <div class="ml-2 text--secondary">戦闘形式:</div>
              <div class="ml-2">{{ getCellName(fleet.cellType) }}</div>
              <div class="ml-3 text--secondary">陣形:</div>
              <div class="ml-2">{{ getFormationName(fleet.formation) }}</div>
              <div class="ml-3 text--secondary d-none d-sm-block">艦隊防空値:</div>
              <div class="ml-2 d-none d-sm-block">{{ fleet.fleetAntiAir }}</div>
              <div class="ml-3 text--secondary" v-if="fleet.range">半径:</div>
              <div class="ml-2" v-if="fleet.range">{{ fleet.range }}</div>
              <v-spacer></v-spacer>
              <div class="text--secondary">詳細:</div>
              <v-btn v-show="selectedFleet" color="info" icon @click.stop@="showEnemyFleetDetail">
                <v-icon>mdi-information-outline</v-icon>
              </v-btn>
            </div>
            <div v-if="fleet.fullAirPower" class="d-flex cell-info-row flex-wrap px-2">
              <div class="text--secondary">制空値:</div>
              <div class="mx-3">{{ fleet.fullAirPower }}</div>
              <div>
                <v-chip class="mr-1" color="green" label outlined>
                  <span>確保:</span>
                  <span class="chip-value">{{ fleet.fullBorders[0] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="light-green" label outlined>
                  <span>優勢:</span>
                  <span class="chip-value">{{ fleet.fullBorders[1] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="orange" label outlined>
                  <span>拮抗:</span>
                  <span class="chip-value">{{ fleet.fullBorders[2] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="deep-orange" label outlined>
                  <span>劣勢:</span>
                  <span class="chip-value">{{ fleet.fullBorders[3] }}</span>
                </v-chip>
              </div>
            </div>
            <div class="mt-3 px-1" :class="{ 'enemies-container': fleet.isUnion }">
              <div class="mx-1" v-if="fleet.isUnion">
                <div v-for="(enemy, j) in fleet.escortEnemies" :key="j" class="d-flex enemy-info">
                  <div class="align-self-center mr-1">
                    <v-img :src="`/img/enemy/${enemy.data.id - 1500}.png`" height="30" width="120"></v-img>
                  </div>
                  <div class="align-self-center flex-grow-1">
                    <div class="d-flex text-id">
                      <div class="primary--text">id:{{ enemy.data.id }}</div>
                      <div class="ml-2" v-if="enemy.fullAirPower">制空: {{ enemy.fullAirPower }}</div>
                      <div class="ml-2" v-if="enemy.fullLBAirPower !== enemy.fullAirPower">制空:({{ enemy.fullLBAirPower }})</div>
                    </div>
                    <div class="d-flex">
                      <div class="text-name text-truncate">{{ enemy.data.name }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mx-1">
                <div v-for="(enemy, j) in fleet.mainEnemies" :key="j" class="d-flex enemy-info">
                  <div class="align-self-center mr-1">
                    <v-img :src="`/img/enemy/${enemy.data.id - 1500}.png`" height="30" width="120"></v-img>
                  </div>
                  <div class="align-self-center flex-grow-1">
                    <div class="d-flex text-id">
                      <div class="primary--text">id:{{ enemy.data.id }}</div>
                      <div class="ml-2" v-if="enemy.fullAirPower">制空:{{ enemy.fullAirPower }}</div>
                      <div class="ml-2" v-if="enemy.fullLBAirPower !== enemy.fullAirPower">制空:({{ enemy.fullLBAirPower }})</div>
                    </div>
                    <div class="d-flex">
                      <div class="text-name text-truncate">{{ enemy.data.name }}</div>
                    </div>
                  </div>
                  <div v-if="!fleet.isUnion" class="align-self-center">
                    <div class="d-flex enemy-status">
                      <div>耐久: {{ enemy.data.hp }}</div>
                      <div>装甲: {{ enemy.actualArmor }}</div>
                    </div>
                    <div class="d-flex">
                      <div v-for="(item, k) in enemy.items" :key="k" class="mx-3">
                        <v-img
                          v-if="item.data.iconTypeId"
                          :src="`/img/type/icon${item.data.iconTypeId}.png`"
                          height="20"
                          width="20"
                        ></v-img>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-tab-item>
        </v-tabs>
        <div v-show="!enabledCommitBtn" class="pt-10 text-center">展開したい海域、セル、敵編成を選択してください</div>
      </div>
      <v-divider></v-divider>
      <v-card-actions>
        <div class="text-center ma-2">
          <v-snackbar v-model="snackbar" color="primary" outlined>
            敵編成を展開しました。続けて次の敵編成を選択できます。
            <template v-slot:action="{ attrs }">
              <v-btn icon v-bind="attrs" @click="snackbar = false"><v-icon>mdi-close</v-icon></v-btn>
            </template>
          </v-snackbar>
        </div>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="commitFleet" :disabled="!enabledCommitBtn">展開</v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog width="1100" v-model="detailDialog" transition="scroll-y-transition" @input="toggleDetailDialog">
      <enemy-detail v-if="!destroyDialog" :fleet="selectedFleet" />
    </v-dialog>
  </div>
</template>

<style scoped>
.map-img-area {
  user-select: none;
}
.node {
  cursor: pointer;
}

.opacity0 {
  opacity: 0;
}

.patterns-container {
  min-height: 364px;
}

.v-tabs-bar .v-tab {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
  min-width: 1px;
}

.enemies-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.enemy-info {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.text-id {
  font-size: 0.7em;
}
.text-name {
  flex-grow: 1;
  font-size: 12px;
  width: 10px;
}
.enemy-status {
  font-size: 12px;
  height: 16px;
  width: 200px;
}
.enemy-status > div {
  width: 64px;
}

.cell-info-row > * {
  align-self: center;
  font-size: 0.9em;
}

.formation-select {
  width: 94px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyDetail from '@/components/enemy/EnemyDetail.vue';
import Const, { CELL_TYPE, DIFFICULTY_LEVEL } from '@/classes/const';
import CellMaster from '@/classes/enemy/cellMaster';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Enemy from '@/classes/enemy/enemy';
import ItemMaster from '@/classes/item/itemMaster';

export default Vue.extend({
  name: 'WorldList',
  components: {
    EnemyDetail,
  },
  props: {
    handleSetEnemy: {
      type: Function,
    },
    handleSetFleets: {
      type: Function,
    },
  },
  data: () => ({
    tab: 'fleet0',
    formations: Const.FORMATIONS,
    allCells: [] as CellMaster[],
    area: 11,
    areaItems: [] as unknown,
    level: DIFFICULTY_LEVEL.HARD,
    levelItems: Const.DIFFICULTY_LEVELS,
    cellIndex: 0,
    cellItems: [] as { text: string; value: number }[],
    imgMapItems: [] as CellMaster[],
    tabNames: [] as string[],
    fleetPatterns: [] as EnemyFleet[],
    detailDialog: false,
    destroyDialog: false,
    selectedFleet: undefined as undefined | EnemyFleet,
    enabledCommitBtn: false,
    continuousMode: false,
    snackbar: false,
  }),
  mounted() {
    // 敵編成読み込み
    const cells = this.$store.state.cells as CellMaster[];
    for (let i = 0; i < cells.length; i += 1) {
      this.allCells.push(cells[i]);
    }

    // 海域セレクトボックス初期化
    const items = [];
    const worlds = Const.WORLDS;
    for (let i = 0; i < worlds.length; i += 1) {
      const world = worlds[i];
      const maps = Const.MAPS.filter((v) => Math.floor(v.value / 10) === world.value);
      if (!maps.length) {
        continue;
      }
      if (i > 0) {
        items.push({ divider: true });
      }

      items.push({ header: world.text });
      for (let j = 0; j < maps.length; j += 1) {
        const map = maps[j];
        const worldText = world.value > 40 ? 'E' : `${world.value}`;
        items.push({ value: map.value, text: `${worldText}-${map.value % 10}：${map.text}`, group: world.text });
      }
    }
    this.areaItems = items;
    this.worldChanged();
  },
  computed: {
    rawLevel(): number {
      return [4, 3, 2, 1][this.level];
    },
    isEvent(): boolean {
      return Math.floor(this.area / 10) > 40;
    },
  },
  methods: {
    worldChanged() {
      const lv = this.rawLevel;
      const cells = this.allCells.filter((v) => v.area === this.area && (this.isEvent ? v.level === lv : true));
      const array: CellMaster[] = [];
      const cellItems: { text: string; value: number }[] = [];
      for (let i = 0; i < cells.length; i += 1) {
        const data = cells[i];
        const [x, y, ex, ey] = data.coords.split(',');
        const coords = ex && ey ? data.coords : `${x},${y},${+x + 20},${+y + 20}`;
        if (!cellItems.find((v) => v.text === data.node)) {
          data.coords = coords;
          array.push(data);
          cellItems.push({ text: data.node, value: cellItems.length });
        }
      }
      this.cellIndex = 0;
      if (this.tab !== 'fleet0') {
        this.tab = 'fleet0';
      }
      this.imgMapItems = array;
      this.cellItems = cellItems;
      this.cellChanged();
    },
    cellChanged() {
      this.cellClicked(this.cellIndex);
    },
    cellClicked(index: number) {
      this.cellIndex = index;
      if (this.tab !== 'fleet0') {
        this.tab = 'fleet0';
      }
      const enemiesMaster = this.$store.state.enemies as EnemyMaster[];
      const items = this.$store.state.items as ItemMaster[];
      const clickedCell = this.imgMapItems[index];
      if (!clickedCell) {
        this.fleetPatterns = [];
        this.tabNames = [];
        this.enabledCommitBtn = false;
        return;
      }
      const lv = this.rawLevel;

      let cells = this.allCells.filter((v) => v.area === clickedCell.area && v.node === clickedCell.node);
      if (this.isEvent) {
        cells = cells.filter((v) => v.level === lv);
      }
      const enemyFleets: EnemyFleet[] = [];
      const patternNames: string[] = [];
      for (let j = 0; j < cells.length; j += 1) {
        const cell = cells[j];
        const isUnion = cell.cellType === CELL_TYPE.GRAND;
        const cellEnemies = cell.enemies.map((v) => v + 1500);
        const enemies: Enemy[] = [];

        for (let i = 0; i < cellEnemies.length; i += 1) {
          const id = cellEnemies[i];
          enemies.push(Enemy.createEnemyFromMasterId(id, isUnion && i >= 6, enemiesMaster, items));
        }

        enemyFleets.push(
          new EnemyFleet({
            enemies,
            formation: cell.formation,
            cellType: cell.cellType,
            range: cell.radius,
          }),
        );
        patternNames.push(cell.detail ? cell.detail : `編成${j + 1}`);
      }

      this.fleetPatterns = enemyFleets;
      this.tabNames = patternNames;
      if (this.fleetPatterns.length > 0) {
        this.selectedFleet = enemyFleets[enemyFleets.length - enemyFleets.length];
        this.enabledCommitBtn = true;
      } else {
        this.selectedFleet = undefined;
        this.enabledCommitBtn = false;
      }
    },
    getFormationName(i: number) {
      const formation = Const.FORMATIONS.find((v) => v.value === i);
      return formation ? formation.text : '';
    },
    getCellName(i: number) {
      const cell = Const.CELL_TYPES.find((v) => v.value === i);
      return cell ? cell.text : '';
    },
    showEnemyFleetDetail() {
      this.detailDialog = true;
      this.destroyDialog = false;
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
    fleetTabChanged(value: string) {
      const index = +value.replaceAll('pattern', '');
      const fleet = this.fleetPatterns[index];

      if (fleet) {
        this.selectedFleet = fleet;
        this.enabledCommitBtn = true;
      } else {
        this.enabledCommitBtn = false;
        this.selectedFleet = undefined;
      }
    },
    commitFleet() {
      this.enabledCommitBtn = false;
      this.handleSetEnemy(this.selectedFleet, this.continuousMode);
      if (this.continuousMode) {
        this.snackbar = true;
      }
    },
  },
});
</script>
