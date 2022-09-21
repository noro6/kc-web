<template>
  <div>
    <v-card class="px-2">
      <div class="d-flex pt-7 px-4">
        <div class="world-select-all">
          <v-select
            dense
            v-model="selectedArea"
            hide-details
            :items="areaItems"
            @change="worldChanged"
            :label="$t('Enemies.海域')"
            :menu-props="{ maxHeight: '600px' }"
          ></v-select>
        </div>
        <div v-show="isEvent">
          <v-select dense v-model="level" hide-details :items="levelItems" @change="worldChanged" :label="$t('Difficulty.難易度')"></v-select>
        </div>
        <div>
          <v-select dense v-model="cellIndex" hide-details :items="cellItems" @change="cellChanged" :label="$t('Enemies.セル')"></v-select>
        </div>
      </div>
      <div class="map-img-area">
        <div>
          <v-img class="mx-auto" :src="`https://res.cloudinary.com/aircalc/image/upload/kc-web/map/${area}.png`" width="467" height="268" />
        </div>
        <div class="dummy-map">
          <img usemap="#click_map" class="mx-auto d-block" :src="`./img/util/map_dummy.png`" />
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
        <div class="map-expand-button" v-if="hasBigMap">
          <v-btn fab text color="grey lighten-2" @click.stop="expandMap()">
            <v-icon large>mdi-magnify-plus-outline</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="patterns-container px-2">
        <v-tabs v-model="tab" @change="fleetTabChanged" v-show="enabledCommitBtn">
          <v-tab v-for="(name, i) in tabNames" :key="i" :href="`#pattern${i}`" @dblclick="commitFleet">
            {{ name ? $t(`Enemies.${name}`) : `#${i + 1}` }}
          </v-tab>
          <v-tab-item v-for="(fleet, i) in fleetPatterns" :key="i" :value="`pattern${i}`">
            <v-divider></v-divider>
            <div class="d-flex flex-wrap cell-info-row mt-1">
              <div class="ml-2 text--secondary">{{ $t("Enemies.戦闘形式") }}:</div>
              <div class="ml-1">{{ getCellName(fleet.cellType) }}</div>
              <div class="ml-2 text--secondary">{{ $t("Enemies.陣形") }}:</div>
              <div class="ml-1">{{ getFormationName(fleet.formation) }}</div>
              <div class="ml-2 text--secondary d-none d-sm-block">{{ $t("Common.艦隊防空値") }}:</div>
              <div class="ml-1 d-none d-sm-block">{{ fleet.fleetAntiAir }}</div>
              <div class="ml-2 text--secondary" v-if="fleet.radius[0]">{{ $t("Common.半径") }}:</div>
              <div class="ml-1" v-if="fleet.radius[0]">{{ fleet.radius.join(" or ") }}</div>
              <div class="ml-auto d-flex">
                <div class="text--secondary align-self-center">{{ $t("Enemies.詳細") }}:</div>
                <v-btn v-show="selectedFleet" color="info" icon @click.stop@="showEnemyFleetDetail">
                  <v-icon>mdi-information-outline</v-icon>
                </v-btn>
              </div>
            </div>
            <div v-if="isAirRaid" class="d-flex cell-info-row flex-wrap px-2">
              <div class="text--secondary mr-2">{{ $t("Common.制空") }}:</div>
              <div class="mr-2">{{ fleet.fullAirbaseAirPower }}</div>
              <div v-if="fleet.existUnknownEnemy">
                <v-tooltip bottom color="black">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon color="warning" v-bind="attrs" v-on="on">mdi-alert</v-icon>
                  </template>
                  <div>{{ $t("Enemies.搭載数が未確定の敵艦が含まれています。") }}</div>
                  <div>{{ $t("Enemies.表示制空値は目安のもので、正確な制空値ではありません。") }}</div>
                </v-tooltip>
              </div>
              <div class="ml-2">
                <v-chip class="mr-1" color="green" label outlined>
                  <span>{{ $t("Common.確保") }}:</span>
                  <span class="chip-value">{{ fleet.fullAirbaseBorders[0] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="light-green" label outlined>
                  <span>{{ $t("Common.優勢") }}:</span>
                  <span class="chip-value">{{ fleet.fullAirbaseBorders[1] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="orange" label outlined>
                  <span>{{ $t("Common.拮抗") }}:</span>
                  <span class="chip-value">{{ fleet.fullAirbaseBorders[2] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="deep-orange" label outlined>
                  <span>{{ $t("Common.劣勢") }}:</span>
                  <span class="chip-value">{{ fleet.fullAirbaseBorders[3] }}</span>
                </v-chip>
              </div>
            </div>
            <div v-else-if="fleet.fullAirPower" class="d-flex cell-info-row flex-wrap px-2">
              <div class="text--secondary mr-2">{{ $t("Common.制空") }}:</div>
              <div class="mr-2">{{ fleet.fullAirPower }}</div>
              <div v-if="fleet.existUnknownEnemy">
                <v-tooltip bottom color="black">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon color="warning" v-bind="attrs" v-on="on">mdi-alert</v-icon>
                  </template>
                  <div>{{ $t("Enemies.搭載数が未確定の敵艦が含まれています。") }}</div>
                  <div>{{ $t("Enemies.表示制空値は目安のもので、正確な制空値ではありません。") }}</div>
                </v-tooltip>
              </div>
              <div class="ml-2">
                <v-chip class="mr-1" color="green" label outlined>
                  <span>{{ $t("Common.確保") }}:</span>
                  <span class="chip-value">{{ fleet.fullBorders[0] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="light-green" label outlined>
                  <span>{{ $t("Common.優勢") }}:</span>
                  <span class="chip-value">{{ fleet.fullBorders[1] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="orange" label outlined>
                  <span>{{ $t("Common.拮抗") }}:</span>
                  <span class="chip-value">{{ fleet.fullBorders[2] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="deep-orange" label outlined>
                  <span>{{ $t("Common.劣勢") }}:</span>
                  <span class="chip-value">{{ fleet.fullBorders[3] }}</span>
                </v-chip>
              </div>
            </div>
            <div class="mt-1 px-1" :class="{ 'enemies-container': fleet.isUnion }">
              <div class="mx-1" v-if="fleet.isUnion">
                <div
                  v-for="(enemy, j) in fleet.escortEnemies"
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
                  v-for="(enemy, j) in fleet.mainEnemies"
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
                      <div class="ml-2 text--secondary" v-if="!fleet.isUnion">{{ $t("Common.耐久") }}: {{ enemy.data.hp }}</div>
                      <div class="ml-2 text--secondary" v-if="!fleet.isUnion">{{ $t("Common.装甲") }}: {{ enemy.actualArmor }}</div>
                    </div>
                    <div class="d-flex">
                      <div class="text-name text-truncate" :class="{ 'orange--text text--darken-2': enemy.data.isUnknown }">
                        {{ getEnemyName(enemy.data.name) }}
                      </div>
                    </div>
                  </div>
                  <div v-if="!fleet.isUnion" class="item-preview">
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
          </v-tab-item>
        </v-tabs>
        <div v-show="!enabledCommitBtn" class="pt-10 text-center">{{ $t("Enemies.展開したい海域、セル、敵編成を選択してください。") }}</div>
      </div>
      <v-divider></v-divider>
      <v-card-actions>
        <div v-if="selectedNodeNames.length" class="body-2">{{ $t("Enemies.選択したセル") }}: {{ selectedNodeNames.join(" → ") }}</div>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="commitFleet" :disabled="!enabledCommitBtn">{{ $t("Common.展開") }}</v-btn>
        <v-btn color="secondary" @click="close">{{ $t("Common.閉じる") }}</v-btn>
      </v-card-actions>
    </v-card>
    <v-snackbar v-model="snackbar" color="primary" outlined>
      {{ $t("Enemies.敵編成を展開しました。続けて次の敵編成を選択できます。") }}
      <template v-slot:action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="snackbar = false"><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
    <v-dialog width="1100" v-model="detailDialog" transition="scroll-y-transition" @input="toggleDetailDialog">
      <enemy-detail v-if="!destroyDialog" :fleet="selectedFleet" :handle-close="closeDetail" />
    </v-dialog>
    <v-dialog width="1200" v-model="expandMapDialog">
      <v-card class="py-3 map-container">
        <v-img class="mx-auto" :src="`https://res.cloudinary.com/aircalc/kc-web/map/details/${area}.png`" />
      </v-card>
    </v-dialog>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <enemy-tooltip v-model="tooltipEnemy" />
    </v-tooltip>
  </div>
</template>

<style scoped>
.v-tab {
  text-transform: none;
}
.world-select {
  max-width: 35%;
}
.world-select-all {
  max-width: 70%;
}
.map-img-area {
  height: 268px;
  user-select: none;
  position: relative;
}
.dummy-map {
  position: absolute;
  top: 0;
  left: calc(50% - 233px);
}
.map-expand-button {
  position: absolute;
  bottom: 10px;
  left: calc(50% - 220px);
}
.node {
  cursor: pointer;
}

.opacity0 {
  opacity: 0;
}

.patterns-container {
  min-height: 340px;
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

.cell-info-row > * {
  align-self: center;
  font-size: 0.9em;
}

.formation-select {
  width: 94px;
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

.map-container {
  max-width: 1200px;
}
.chip-value {
  margin-left: 4px;
}
</style>

<style>
.patterns-container .v-tabs-bar {
  height: 38px !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyDetail from '@/components/enemy/EnemyDetail.vue';
import EnemyTooltip from '@/components/enemy/EnemyTooltip.vue';
import Const, { CELL_TYPE, DIFFICULTY_LEVEL, FORMATION } from '@/classes/const';
import CellMaster from '@/classes/enemy/cellMaster';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Enemy from '@/classes/enemy/enemy';
import ItemMaster from '@/classes/item/itemMaster';
import { MasterMap, MasterWorld } from '@/classes/interfaces/master';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'WorldList',
  components: {
    EnemyDetail,
    EnemyTooltip,
  },
  props: {
    handleSetEnemy: {
      type: Function,
    },
    handleSetFleets: {
      type: Function,
    },
    handleClose: {
      type: Function,
    },
  },
  data: () => ({
    tab: 'fleet0',
    formations: Const.FORMATIONS,
    allCells: [] as CellMaster[],
    world: 1,
    areas: [] as MasterMap[],
    area: 551,
    areaItems: [] as ({ divider: boolean } | { header: string } | { value: number; text: string; group: string })[],
    selectedArea: 551,
    level: DIFFICULTY_LEVEL.HARD,
    levelItems: Const.DIFFICULTY_LEVELS,
    cellIndex: 0,
    cellItems: [] as { text: string; value: number }[],
    imgMapItems: [] as CellMaster[],
    tabNames: [] as string[],
    fleetPatterns: [] as EnemyFleet[],
    isAirRaid: false,
    detailDialog: false,
    destroyDialog: false,
    selectedFleet: undefined as undefined | EnemyFleet,
    enabledCommitBtn: false,
    continuousMode: false,
    snackbar: false,
    unsubscribe: undefined as unknown,
    selectedNodeName: '',
    selectedNodeNames: [] as string[],
    expandMapDialog: false,
    hasBigMap: false,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipEnemy: new Enemy(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  mounted() {
    // 敵編成読み込み
    const cells = this.$store.state.cells as CellMaster[];

    // 海域セレクトボックス初期化
    const items = [];
    const worlds = this.$store.state.worlds as MasterWorld[];
    const masterMaps = this.$store.state.maps as MasterMap[];
    for (let i = 0; i < worlds.length; i += 1) {
      const world = worlds[i];
      const maps = masterMaps.filter((v) => Math.floor(v.area / 10) === world.world);
      if (!maps.length) {
        continue;
      }
      if (i > 0) {
        items.push({ divider: true });
      }

      items.push({ header: world.name });
      for (let j = 0; j < maps.length; j += 1) {
        const map = maps[j];
        const worldText = world.world > 40 ? 'E' : `${world.world}`;
        items.push({ value: map.area, text: `${worldText}-${map.area % 10}：${map.name}`, group: world.name });
      }
    }
    this.areaItems = items;

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
    rawLevel(): number {
      return [4, 3, 2, 1][this.level];
    },
    isEvent(): boolean {
      return Math.floor(this.area / 10) > 40;
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      (this.unsubscribe as () => void)();
    }
  },
  methods: {
    getEnemyName(name: string): string {
      if (name && this.needTrans) {
        const shipName = EnemyMaster.getSuffix(name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return name || '';
    },
    initCells(cells: CellMaster[]) {
      for (let i = 0; i < cells.length; i += 1) {
        this.allCells.push(cells[i]);
      }
      this.worldChanged();
    },
    worldChanged() {
      // 海域-マップ統合セレクトより選択
      this.world = Math.floor(this.selectedArea / 10);
      this.area = this.selectedArea;

      const lv = this.rawLevel;
      const maps = this.$store.state.maps as MasterMap[];
      this.areas = maps.filter((v) => Math.floor(v.area / 10) === this.world);

      if (!this.areas.some((v) => v.area === this.area)) {
        this.area = this.areas[0] ? this.areas[0].area : 0;
      }
      this.hasBigMap = maps.some((v) => v.area === this.area && v.has_detail);

      // 該当するセルを取得
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

      // 空襲をてっぺんに
      cellItems.sort((a, b) => {
        if (a.text === '空襲' && b.text !== '空襲') return -1;
        if (b.text === '空襲' && a.text !== '空襲') return 1;
        return 0;
      });
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
      const enemiesMaster = this.$store.getters.getEnemies as EnemyMaster[];
      const items = this.$store.state.items as ItemMaster[];
      const clickedCell = this.imgMapItems[index];
      this.isAirRaid = false;
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

        // 味方陣形 => 空襲のとき輪形
        const isAirRaid = cell.cellType === CELL_TYPE.AIR_RAID || cell.cellType === CELL_TYPE.HIGH_AIR_RAID || cell.cellType === CELL_TYPE.SUPER_HIGH_AIR_RAID;
        this.isAirRaid = isAirRaid;
        const mainFleetFormation = isAirRaid ? FORMATION.DIAMOND : FORMATION.LINE_AHEAD;

        enemyFleets.push(
          new EnemyFleet({
            enemies,
            formation: cell.formation,
            cellType: cell.cellType,
            radius: cell.radius,
            area: cell.area,
            nodeName: clickedCell.node,
            mainFleetFormation,
          }),
        );
        patternNames.push(cell.detail);
      }

      this.fleetPatterns = enemyFleets;
      this.tabNames = patternNames;
      if (this.fleetPatterns.length > 0) {
        this.selectedFleet = enemyFleets[enemyFleets.length - enemyFleets.length];
        this.enabledCommitBtn = true;
        this.selectedNodeName = clickedCell.node;
      } else {
        this.selectedFleet = undefined;
        this.enabledCommitBtn = false;
      }
    },
    getFormationName(i: number) {
      const formation = Const.FORMATIONS.find((v) => v.value === i);
      return formation ? this.$t(`Common.${formation.text}`) : '';
    },
    getCellName(i: number) {
      const cell = Const.CELL_TYPES.find((v) => v.value === i);
      return cell ? this.$t(`Common.${cell.text}`) : '';
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
      this.selectedNodeNames.push(this.selectedNodeName);
      this.selectedNodeName = '';

      if (this.continuousMode) {
        this.snackbar = true;
      }
    },
    expandMap() {
      this.expandMapDialog = true;
    },
    close() {
      this.handleClose();
    },
    closeDetail() {
      this.detailDialog = false;
    },
    bootTooltip(enemy: Enemy, e: MouseEvent) {
      if (!enemy.data.id) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('text-id')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = e.clientX;
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
