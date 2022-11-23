<template>
  <v-card class="pa-3">
    <div class="d-flex align-center mb-3">
      <v-btn color="teal" dark @click="showEnemyList()">{{ $t("Extra.検索する敵艦を選択") }}</v-btn>
      <div class="ml-3 d-flex" v-if="targetEnemy.data.id">
        <div class="align-self-center">
          <v-img :src="`./img/ship/${targetEnemy.data.id}.png`" height="30" width="120"></v-img>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex caption flex-wrap">
            <div class="enemy-id ml-2 primary--text">id:{{ targetEnemy.data.id }}</div>
            <div class="ml-2">
              <span class="text--secondary">{{ $t("Common.耐久") }}:</span>
              <span class="ml-1 font-weight-medium">{{ targetEnemy.data.hp }}</span>
              <span class="ml-2 text--secondary">{{ $t("Common.装甲") }}:</span>
              <span class="ml-1 font-weight-medium">{{ targetEnemy.actualArmor }}</span>
            </div>
          </div>
          <div class="d-flex">
            <div class="enemy-name ml-2 text-truncate">{{ getEnemyName(targetEnemy.data.name) }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="targetEnemy.data.id" class="my-3">
      <v-text-field v-model="keyword" dense prepend-inner-icon="mdi-magnify" clearable hide-details></v-text-field>
    </div>
    <v-divider></v-divider>
    <v-data-table
      dense
      fixed-header
      height="44vh"
      multi-sort
      :search="keyword"
      :headers="headers"
      :items="hitCells"
      :footer-props="{
        showFirstLastPage: true,
        firstIcon: 'mdi-chevron-double-left',
        lastIcon: 'mdi-chevron-double-right',
        prevIcon: 'mdi-chevron-left',
        nextIcon: 'mdi-chevron-right',
        'items-per-page-options': [50, 100, 150],
      }"
    >
      <template v-slot:[`header.area`]="{ header }">{{ $t(`Enemies.${header.text}`) }}</template>
      <template v-slot:[`header.name`]="{ header }">{{ $t(`Enemies.${header.text}`) }}</template>
      <template v-slot:[`header.node`]="{ header }">{{ $t(`Enemies.${header.text}`) }}</template>
      <template v-slot:[`header.detail`]="{ header }">{{ $t(`Enemies.${header.text}`) }}</template>
      <template v-slot:[`header.type`]="{ header }">{{ $t(`Enemies.${header.text}`) }}</template>
      <template v-slot:[`header.level`]="{ header }">{{ $t(`Difficulty.${header.text}`) }}</template>
      <template v-slot:[`header.radius`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.data`]="{ header }">{{ $t(`Extra.${header.text}`) }}</template>
      <template v-slot:[`item.name`]="{ item }">
        <div class="caption">{{ item.name }}</div>
      </template>
      <template v-slot:[`item.level`]="{ item }">
        <div class="caption">{{ levelText(item.level) }}</div>
      </template>
      <template v-slot:[`item.type`]="{ item }">
        <div class="caption">{{ getCellName(item.type) }}</div>
      </template>
      <template v-slot:[`item.data`]="{ item }">
        <v-btn color="primary" icon @click.stop="showMap(item)">
          <v-icon>mdi-information-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="enemyListDialog" transition="scroll-x-transition" width="1200">
      <enemy-list :handle-decide-enemy="putEnemy" :handleClose="closeEnemyList" />
    </v-dialog>
    <v-dialog width="1100" v-model="detailDialog" transition="scroll-y-transition" @input="toggleDetailDialog">
      <enemy-detail v-if="!destroyDialog" :fleet="selectedFleet" :handle-close="closeDetail" />
    </v-dialog>
    <v-dialog width="580" v-model="expandMapDialog">
      <v-card class="py-6 px-3" v-if="selectedCell">
        <div class="text-center body-2">( {{ selectedCell.area }} ) {{ selectedCell.name }}</div>
        <div class="my-3">
          <v-img class="mx-auto" width="467" height="268" :src="`https://res.cloudinary.com/aircalc/kc-web/maps/${selectedArea}.webp`" />
        </div>
        <div class="d-flex align-center body-2">
          <div class="text--secondary">{{ $t("Enemies.セル") }} :</div>
          <div class="ml-1">{{ selectedCell.node }}</div>
          <div class="ml-3 text--secondary">{{ $t("Enemies.戦闘形式") }} :</div>
          <div class="ml-1">{{ getCellName(selectedCell.type) }}</div>
          <div v-if="selectedCell.level" class="ml-3 text--secondary">{{ $t("Difficulty.難易度") }} :</div>
          <div v-if="selectedCell.level" class="ml-1">{{ levelText(selectedCell.level) }}</div>
          <div class="ml-auto d-flex">
            <div class="text--secondary align-self-center">{{ $t("Enemies.詳細") }}:</div>
            <v-btn color="primary" icon @click.stop="showEnemyFleetDetail">
              <v-icon>mdi-information-outline</v-icon>
            </v-btn>
          </div>
        </div>
        <div>
          <div :class="{ 'enemies-container': selectedFleet.isUnion }">
            <div class="mx-1" v-if="selectedFleet.isUnion">
              <div
                v-for="(enemy, j) in selectedFleet.escortEnemies"
                :key="j"
                class="d-flex enemy-info"
                @mouseenter="bootTooltip(enemy, $event)"
                @mouseleave="clearTooltip"
              >
                <div class="align-self-center mr-1">
                  <v-img :src="`./img/ship/${enemy.data.id}.png`" height="30" width="120"></v-img>
                </div>
                <div class="align-self-center flex-grow-1">
                  <div class="d-flex text-id">
                    <div class="primary--text">id:{{ enemy.data.id }}</div>
                    <div class="ml-2" v-if="enemy.fullAirPower">{{ $t("Common.制空") }}: {{ enemy.fullAirPower }}</div>
                    <div v-if="enemy.data.isUnknown && enemy.fullLBAirPower">?</div>
                    <div class="ml-2" v-if="enemy.fullLBAirPower !== enemy.fullAirPower">{{ $t("Common.制空") }}: ({{ enemy.fullLBAirPower }})</div>
                  </div>
                  <div class="d-flex">
                    <div class="text-name text-truncate" :class="{ 'orange--text text--darken-2': enemy.data.isUnknown }">
                      {{ getEnemyName(enemy.data.name) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mx-1">
              <div
                v-for="(enemy, j) in selectedFleet.mainEnemies"
                :key="j"
                class="d-flex enemy-info"
                @mouseenter="bootTooltip(enemy, $event)"
                @mouseleave="clearTooltip"
              >
                <div class="align-self-center mr-1">
                  <v-img :src="`./img/ship/${enemy.data.id}.png`" height="30" width="120"></v-img>
                </div>
                <div class="align-self-center flex-grow-1">
                  <div class="d-flex text-id">
                    <div class="primary--text">id:{{ enemy.data.id }}</div>
                    <div class="ml-2" v-if="enemy.fullAirPower">{{ $t("Common.制空") }}: {{ enemy.fullAirPower }}</div>
                    <div class="ml-2" v-if="enemy.fullLBAirPower !== enemy.fullAirPower">{{ $t("Common.制空") }}: ({{ enemy.fullLBAirPower }})</div>
                    <div class="ml-1" v-if="enemy.data.isUnknown && enemy.fullLBAirPower">?</div>
                    <div class="ml-2 text--secondary" v-if="!selectedFleet.isUnion">{{ $t("Common.耐久") }}: {{ enemy.data.hp }}</div>
                    <div class="ml-2 text--secondary" v-if="!selectedFleet.isUnion">{{ $t("Common.装甲") }}: {{ enemy.actualArmor }}</div>
                  </div>
                  <div class="d-flex">
                    <div class="text-name text-truncate" :class="{ 'orange--text text--darken-2': enemy.data.isUnknown }">
                      {{ getEnemyName(enemy.data.name) }}
                    </div>
                  </div>
                </div>
                <div v-if="!selectedFleet.isUnion" class="item-preview">
                  <div v-for="(item, k) in enemy.items" :key="k" class="mr-4 item-image-area">
                    <template v-if="enemy.items.length < 5">
                      <v-img v-if="item.data.iconTypeId" :src="`./img/type/icon${item.data.iconTypeId}.png`" height="30" width="30"></v-img>
                      <div class="slot" v-if="item.data.isPlane">{{ item.fullSlot }}</div>
                    </template>
                    <template v-else>
                      <v-img v-if="item.data.iconTypeId" :src="`./img/type/icon${item.data.iconTypeId}.png`" height="24" width="24"></v-img>
                      <div class="slot tiny" v-if="item.data.isPlane">{{ item.fullSlot }}</div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <enemy-tooltip v-model="tooltipEnemy" />
    </v-tooltip>
  </v-card>
</template>

<style scoped>
.enemy-name {
  flex-grow: 1;
  width: 100px;
  font-size: 0.8em;
}

.enemies-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.enemy-info {
  border-top: 1px solid rgba(128, 128, 128, 0.2);
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
.item-preview {
  display: flex;
  align-self: center;
  width: 180px;
}
.item-image-area {
  position: relative;
}
.item-image-area .slot {
  position: absolute;
  opacity: 0.6;
  font-size: 12px;
  font-weight: 600;
  bottom: -5px;
  left: 28px;
}
.item-image-area .slot.tiny {
  left: 24px;
}

.v-card >>> .v-data-table th,
.v-card >>> .v-data-table td {
  padding: 0 8px !important;
}
.v-card >>> .v-data-table th:first-child,
.v-card >>> .v-data-table td:first-child {
  padding: 0 4px !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyList from '@/components/enemy/EnemyList.vue';
import EnemyDetail from '@/components/enemy/EnemyDetail.vue';
import EnemyTooltip from '@/components/enemy/EnemyTooltip.vue';
import CellMaster from '@/classes/enemy/cellMaster';
import SiteSetting from '@/classes/siteSetting';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Enemy from '@/classes/enemy/enemy';
import { cloneDeep } from 'lodash';
import ItemMaster from '@/classes/item/itemMaster';
import { MasterMap, MasterWorld } from '@/classes/interfaces/master';
import Const, { CELL_TYPE } from '@/classes/const';
import EnemyFleet from '@/classes/enemy/enemyFleet';

interface CellResult {
  area: string;
  name: string;
  detail: string;
  radius: number;
  level: number;
  node: string;
  type: number;
  data: CellMaster;
}

export default Vue.extend({
  name: 'EnemySearcher',
  components: { EnemyList, EnemyDetail, EnemyTooltip },
  data: () => ({
    keyword: '',
    worlds: [] as MasterWorld[],
    areas: [] as MasterMap[],
    allCells: [] as CellMaster[],
    unsubscribe: undefined as unknown,
    enemyListDialog: false,
    targetEnemy: new Enemy(),
    items: [] as ItemMaster[],
    hitCells: [] as CellResult[],
    headers: [
      {
        text: '海域',
        value: 'area',
      },
      {
        text: '海域名',
        value: 'name',
      },
      {
        text: 'セル',
        value: 'node',
      },
      {
        text: '詳細',
        value: 'detail',
        filterable: false,
      },
      {
        text: '戦闘形式',
        value: 'type',
        filterable: false,
      },
      {
        text: '難易度',
        value: 'level',
        filterable: false,
      },
      {
        text: '半径',
        value: 'radius',
        filterable: false,
        align: 'end',
      },
      {
        text: '艦隊詳細',
        value: 'data',
        align: 'center',
        sortable: false,
        filterable: false,
      },
    ],
    selectedCell: undefined as undefined | CellResult,
    selectedArea: 11,
    expandMapDialog: false,
    selectedFleet: new EnemyFleet(),
    detailDialog: false,
    destroyDialog: false,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipEnemy: new Enemy(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  mounted() {
    const cells = this.$store.state.cells as CellMaster[];
    this.items = this.$store.state.items as ItemMaster[];
    this.worlds = this.$store.state.worlds as MasterWorld[];
    this.areas = this.$store.state.maps as MasterMap[];

    if (cells.length) {
      // マスタデータがあるならそれでOK
      this.initCells(cells);
      return;
    }

    // マスタデータ読み込み開始
    this.$store.dispatch('loadCellData');
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setCells') {
        this.initCells(state.cells);
      }
    });
  },
  computed: {
    levelText() {
      return (value: number) => {
        const levelText = ['', '丁', '丙', '乙', '甲'][value];
        if (levelText) {
          return `${this.$t(`Difficulty.${levelText}`)}`;
        }
        return '';
      };
    },
    getCellName() {
      return (value: number) => {
        const cell = Const.CELL_TYPES.find((v) => v.value === value);
        return cell ? this.$t(`Common.${cell.text}`) : '';
      };
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      (this.unsubscribe as () => void)();
    }
  },
  methods: {
    initCells(cells: CellMaster[]) {
      for (let i = 0; i < cells.length; i += 1) {
        this.allCells.push(cells[i]);
      }
    },
    showEnemyList() {
      this.enemyListDialog = true;
    },
    putEnemy(enemy: EnemyMaster) {
      if (enemy && enemy.id) {
        this.targetEnemy = Enemy.createEnemyFromMaster(cloneDeep(enemy), false, this.items);
        this.enemyListDialog = false;
      }

      this.search();
    },
    closeEnemyList() {
      this.enemyListDialog = false;
    },
    closeDetail() {
      this.detailDialog = false;
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
    getEnemyName(name: string): string {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (name && this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate) {
        const shipName = EnemyMaster.getSuffix(name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return name || '';
    },
    search() {
      const all = this.allCells;
      const hits: CellResult[] = [];
      const targetId = this.targetEnemy.data.id - 1500;
      if (targetId <= 0) {
        this.hitCells = [];
        return;
      }

      for (let i = 0; i < all.length; i += 1) {
        const cell = all[i];
        if (cell.enemies.includes(targetId)) {
          const worldId = Math.floor(cell.area / 10);
          const world = this.worlds.find((v) => v.world === worldId);
          const area = this.areas.find((v) => v.area === cell.area);

          let name = '';
          if (world && area) {
            if (worldId < 10) {
              name = `${world.name.substring(2)} ${area.name}`;
            } else {
              name = `${world.name} ${area.name}`;
            }
          }

          const mapNo = cell.area % 10;
          const areaText = `${worldId}-${mapNo}`;
          hits.push({
            area: areaText,
            name,
            detail: cell.detail ? `${this.$t(`Enemies.${cell.detail}`)}` : '',
            level: cell.level,
            radius: cell.radius ? cell.radius[0] : 0,
            type: cell.cellType,
            node: cell.node,
            data: cell,
          });
        }
      }

      this.hitCells = hits;
    },
    showEnemyFleetDetail() {
      this.detailDialog = true;
      this.destroyDialog = false;
    },
    showMap(value: CellResult) {
      this.selectedCell = value;
      const cell = value.data;
      const enemiesMaster = this.$store.getters.getEnemies as EnemyMaster[];
      const isUnion = cell.cellType === CELL_TYPE.GRAND;
      const cellEnemies = cell.enemies.map((v) => v + 1500);
      const enemies: Enemy[] = [];
      for (let i = 0; i < cell.enemies.length; i += 1) {
        const id = cellEnemies[i];
        enemies.push(Enemy.createEnemyFromMasterId(id, isUnion && i >= 6, enemiesMaster, this.items));
      }

      this.selectedFleet = new EnemyFleet({
        enemies,
        formation: cell.formation,
        cellType: cell.cellType,
        radius: cell.radius,
        area: cell.area,
      });

      this.selectedArea = cell.area;
      this.expandMapDialog = true;
    },
    bootTooltip(enemy: Enemy, e: MouseEvent) {
      if (!enemy.data.id) {
        return;
      }
      const setting = this.$store.state.siteSetting as SiteSetting;
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('text-id')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = e.clientX;
        this.tooltipY = rect.y + rect.height;
        this.tooltipEnemy = enemy;
        this.enabledTooltip = true;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
