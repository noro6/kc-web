<template>
  <div>
    <v-card class="parent-container">
      <div class="cell-select-header px-2 pt-6">
        <v-select
          dense
          v-model="selectedArea"
          hide-details
          :items="areaItems"
          @change="worldChanged"
          :label="$t('Enemies.海域')"
          :menu-props="{ maxHeight: '600px' }"
        />
        <div class="level-select">
          <v-select dense v-model="cellIndex" hide-details :items="cellItems" @change="cellChanged" :label="$t('Enemies.セル')" />
          <v-select dense v-model="level" :disabled="!isEvent" hide-details :items="levelItems" @change="worldChanged" :label="$t('Difficulty.難易度')" />
        </div>
      </div>
      <div class="map-img-area">
        <div class="background-map">
          <img
            :src="`https://res.cloudinary.com/aircalc/kc-web/maps/${area}.webp`"
            @error="handleImageError"
            :key="mapImageSrc"
            alt="map-img"
          />
        </div>
        <div class="dummy-map">
          <svg xmlns="http://www.w3.org/2000/svg" width="467px" viewBox="0 0 467 268">
            <defs>
              <radialGradient id="yellow-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style="stop-color: rgb(255, 160, 60); stop-opacity: 0.9" />
                <stop offset="40%" style="stop-color: rgb(255, 160, 60); stop-opacity: 0.5" />
                <stop offset="100%" style="stop-color: rgb(255, 160, 60); stop-opacity: 0" />
              </radialGradient>
            </defs>
            <template v-for="(item, i) in imgMapItems">
              <circle
                v-if="item.coords.split(',') && item.coords.split(',')[0] && item.coords.split(',')[1]"
                :cx="+item.coords.split(',')[0] + 10"
                :cy="+item.coords.split(',')[1] + 10"
                r="15"
                fill="rgba(0,0,0,0)"
                onmouseover="evt.target.setAttribute('fill', 'url(#yellow-gradient)');"
                onmouseout="evt.target.setAttribute('fill', 'rgba(0,0,0,0)');"
                style="cursor: pointer"
                @click="cellClicked(i)"
                @dblclick="commitFleet"
                @keypress.enter="cellClicked(i)"
                :key="i"
              />
            </template>
          </svg>
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
            <v-divider />
            <div class="d-flex flex-wrap body-2 align-center mt-1">
              <div class="ml-2 text--secondary caption">{{ $t("Enemies.戦闘形式") }}</div>
              <div class="ml-1">{{ getCellName(fleet.cellType) }}</div>
              <div class="ml-2 text--secondary caption">{{ $t("Enemies.陣形") }}</div>
              <div class="ml-1">{{ getFormationName(fleet.formation) }}</div>
              <div class="ml-2 text--secondary d-none d-sm-block caption">{{ $t("Common.艦隊防空値") }}</div>
              <div class="ml-1 d-none d-sm-block">{{ fleet.fleetAntiAir }}</div>
              <div class="ml-2 text--secondary caption" v-if="fleet.radius[0]">{{ $t("Common.半径") }}</div>
              <div class="ml-1" v-if="fleet.radius[0]">{{ fleet.radius.join(" → ") }}</div>
              <div class="ml-auto d-flex">
                <div class="text--secondary align-self-center">{{ $t("Enemies.詳細") }}</div>
                <v-btn v-show="selectedFleet" color="primary" icon @click.stop="showEnemyFleetDetail">
                  <v-icon>mdi-information-outline</v-icon>
                </v-btn>
              </div>
            </div>
            <div v-if="isAirRaid || fleet.fullAirPower || fleet.isUnion" class="d-none d-sm-flex align-center flex-wrap px-2 body-2">
              <div class="text--secondary mr-1 caption">{{ $t("Common.制空") }}</div>
              <div class="mr-1">{{ isAirRaid ? fleet.fullAirbaseAirPower : fleet.fullAirPower }}</div>
              <div v-if="fleet.existUnknownEnemy">
                <v-tooltip bottom color="black">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon color="warning" v-bind="attrs" v-on="on">mdi-alert</v-icon>
                  </template>
                  <div>{{ $t("Enemies.搭載数が未確定の敵艦が含まれています。") }}</div>
                  <div>{{ $t("Enemies.表示制空値は目安のもので、正確な制空値ではありません。") }}</div>
                </v-tooltip>
              </div>
              <div class="ml-1">
                <v-chip class="mr-1 px-2" color="green" label outlined>
                  <span>{{ $t("Common.確保") }}</span>
                  <span class="chip-value">{{ isAirRaid ? fleet.fullAirbaseBorders[0] : fleet.fullBorders[0] }}</span>
                </v-chip>
                <v-chip class="mr-1 px-2" color="light-green" label outlined>
                  <span>{{ $t("Common.優勢") }}</span>
                  <span class="chip-value">{{ isAirRaid ? fleet.fullAirbaseBorders[1] : fleet.fullBorders[1] }}</span>
                </v-chip>
                <v-chip class="mr-1 px-2" color="orange" label outlined>
                  <span>{{ $t("Common.拮抗") }}</span>
                  <span class="chip-value">{{ isAirRaid ? fleet.fullAirbaseBorders[2] : fleet.fullBorders[2] }}</span>
                </v-chip>
                <v-chip class="mr-1 px-2" color="deep-orange" label outlined>
                  <span>{{ $t("Common.劣勢") }}</span>
                  <span class="chip-value">{{ isAirRaid ? fleet.fullAirbaseBorders[3] : fleet.fullBorders[3] }}</span>
                </v-chip>
              </div>
              <div class="ml-auto" v-if="fleet.isUnion">
                <v-checkbox class="pt-0 mt-0" :label="$t('Enemies.耐久装甲表示')" v-model="showHP" @click="clickedShowHP" dense hide-details />
              </div>
            </div>
            <div class="mt-1 px-1" :class="{ 'enemies-container': fleet.isUnion }">
              <div class="mx-1" v-if="fleet.isUnion">
                <!-- 連合の時 随伴 -->
                <div
                  v-for="(enemy, j) in fleet.escortEnemies"
                  :key="j"
                  class="d-flex enemy-info"
                  @mouseenter="bootTooltip(enemy, $event)"
                  @mouseleave="clearTooltip"
                  @focus="bootTooltip(enemy, $event)"
                  @blur="clearTooltip"
                >
                  <div class="enemy-img">
                    <v-img :src="`./img/ship/banner/${enemy.data.id}.png`" height="30" width="120" />
                    <div v-if="enemy.hasRadar" class="radar-icon">
                      <v-img :src="`./img/type/icon11.png`" height="22" width="22" />
                    </div>
                  </div>
                  <div class="d-none d-sm-block align-self-center flex-grow-1">
                    <div class="d-flex text-id">
                      <template v-if="fleet.isUnion && showHP">
                        <div>
                          <span class="text--secondary mr-1">{{ $t("Common.耐久") }}</span>
                          <span class="font-weight-bold">{{ enemy.data.hp }}</span>
                        </div>
                        <div class="ml-2">
                          <span class="text--secondary mr-1">{{ $t("Common.装甲") }}</span>
                          <span class="font-weight-bold">{{ enemy.actualArmor }}</span>
                        </div>
                      </template>
                      <template v-else>
                        <div class="primary--text">
                          id <span class="font-weight-bold">{{ enemy.data.id }}</span>
                        </div>
                        <div class="ml-2" v-if="enemy.fullAirPower">
                          {{ $t("Common.制空") }} <span class="font-weight-bold">{{ enemy.fullAirPower }}</span>
                        </div>
                        <div v-if="enemy.data.isUnknown && enemy.fullLBAirPower">?</div>
                        <div class="ml-2" v-if="enemy.fullLBAirPower !== enemy.fullAirPower">
                          {{ $t("Common.制空") }} (<span class="font-weight-bold">{{ enemy.fullLBAirPower }}</span
                          >)
                        </div>
                      </template>
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
                  @focus="bootTooltip(enemy, $event)"
                  @blur="clearTooltip"
                >
                  <div class="enemy-img">
                    <v-img :src="`./img/ship/banner/${enemy.data.id}.png`" height="30" width="120" />
                    <div v-if="enemy.hasRadar" class="radar-icon">
                      <v-img :src="`./img/type/icon11.png`" height="22" width="22" />
                    </div>
                  </div>
                  <div class="align-self-center flex-grow-1" :class="{ 'd-none d-sm-block ': fleet.isUnion }">
                    <div class="d-flex text-id">
                      <template v-if="fleet.isUnion && showHP">
                        <div>
                          <span class="text--secondary mr-1">{{ $t("Common.耐久") }}</span>
                          <span class="font-weight-bold">{{ enemy.data.hp }}</span>
                        </div>
                        <div class="ml-2">
                          <span class="text--secondary mr-1">{{ $t("Common.装甲") }}</span>
                          <span class="font-weight-bold">{{ enemy.actualArmor }}</span>
                        </div>
                      </template>
                      <template v-else>
                        <div class="primary--text">
                          id <span class="font-weight-bold">{{ enemy.data.id }}</span>
                        </div>
                        <div class="ml-2 d-none d-sm-block" v-if="enemy.fullAirPower">
                          {{ $t("Common.制空") }} <span class="font-weight-bold">{{ enemy.fullAirPower }}</span>
                        </div>
                        <div class="ml-2 d-none d-sm-block" v-if="enemy.fullLBAirPower !== enemy.fullAirPower">
                          {{ $t("Common.制空") }} (<span class="font-weight-bold">{{ enemy.fullLBAirPower }}</span
                          >)
                        </div>
                        <div class="ml-1 d-none d-sm-block" v-if="enemy.data.isUnknown && enemy.fullLBAirPower">?</div>
                        <div class="ml-2" v-if="!fleet.isUnion">
                          <span class="text--secondary mr-1">{{ $t("Common.耐久") }}</span>
                          <span class="font-weight-bold">{{ enemy.data.hp }}</span>
                        </div>
                        <div class="ml-2" v-if="!fleet.isUnion">
                          <span class="text--secondary mr-1">{{ $t("Common.装甲") }}</span>
                          <span class="font-weight-bold">{{ enemy.actualArmor }}</span>
                        </div>
                      </template>
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
                        <v-img v-if="item.data.iconTypeId" :src="`./img/type/icon${item.data.iconTypeId}.png`" height="30" width="30" />
                        <div class="slot" v-if="item.data.isPlane">{{ item.fullSlot }}</div>
                      </template>
                      <template v-else>
                        <v-img v-if="item.data.iconTypeId" :src="`./img/type/icon${item.data.iconTypeId}.png`" height="24" width="24" />
                        <div class="slot tiny" v-if="item.data.isPlane">{{ item.fullSlot }}</div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-tab-item>
        </v-tabs>
        <div v-show="!enabledCommitBtn" class="pt-10 text-center caption text-sm-body-2">
          {{ $t("Enemies.展開したい海域、セル、敵編成を選択してください。") }}
        </div>
      </div>
      <v-divider class="mt-auto" />
      <v-card-actions>
        <div v-if="selectedNodeNames.length" class="body-2">{{ $t("Enemies.選択したセル") }} {{ selectedNodeNames.join(" → ") }}</div>
        <v-spacer />
        <v-btn color="primary" @click="commitFleet" :disabled="!enabledCommitBtn">{{ $t("Common.展開") }}</v-btn>
        <v-btn color="secondary" @click="close">{{ $t("Common.閉じる") }}</v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog width="1100" v-model="detailDialog" transition="scroll-y-transition" @input="toggleDetailDialog">
      <enemy-detail v-if="!destroyDialog" :fleet="selectedFleet" :handle-close="closeDetail" />
    </v-dialog>
    <v-dialog width="1200" v-model="expandMapDialog">
      <v-card class="py-3 map-container">
        <v-img class="mx-auto" :src="`https://res.cloudinary.com/aircalc/kc-web/maps/details/${area}.webp`" />
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

.parent-container {
  display: flex;
  flex-direction: column;
  padding-left: 4px;
  padding-right: 4px;
  height: 100vh;
}
.cell-select-header {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 18px;
}
.level-select {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (min-width: 600px) {
  .parent-container {
    height: unset;
    max-height: unset;
  }
  .cell-select-header {
    grid-template-columns: 1fr 1fr;
  }
}

.map-img-area {
  user-select: none;
  position: relative;
}
.background-map {
  display: flex;
  justify-content: center;
}
.background-map img {
  display: block;
  max-width: 100%;
  max-height: 268px;
  aspect-ratio: 467/268;
}

@media (min-width: 600px) {
  .enemy-list-item {
    justify-content: unset;
  }
}

.dummy-map {
  position: absolute;
  top: 0;
  max-height: 268px;
}
.dummy-map svg {
  max-width: 100%;
  max-height: 268px;
  aspect-ratio: 467/268;
}
.map-expand-button {
  display: none;
}
@media (min-width: 476px) {
  .map-expand-button {
    display: block;
    position: absolute;
    bottom: 10px;
    left: calc(50% - 233px);
  }
  .dummy-map {
    left: calc(50% - 233px);
  }
}

.patterns-container {
  overflow-y: auto;
}
@media (min-width: 600px) {
  .patterns-container {
    min-height: 340px;
  }
}

.v-tabs-bar .v-tab {
  padding-left: 0.5rem !important;
  padding-right: 0.5rem !important;
  min-width: 1px;
}

.enemy-img {
  margin-right: 4px;
  align-self: center;
  position: relative;
}
.radar-icon {
  position: absolute;
  right: 0;
  top: 0;
  background-color: rgba(0, 13, 29, 0.75);
  border-radius: 50%;
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

.item-preview {
  display: none;
}
@media (min-width: 600px) {
  .item-preview {
    display: flex;
    align-self: center;
    width: 180px;
  }
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
  margin-left: 2px;
  margin-left: 4px;
}

.patterns-container >>> .v-tabs-bar {
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
import SaveData from '@/classes/saveData/saveData';
import ShipMaster from '@/classes/fleet/shipMaster';

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
    area: 1,
    areaItems: [] as ({ divider: boolean } | { header: string } | { value: number; text: string; group: string })[],
    selectedArea: 1,
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
    unsubscribe: undefined as unknown,
    selectedNodeName: '',
    selectedNodeNames: [] as string[],
    expandMapDialog: false,
    hasBigMap: false,
    showHP: false,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipEnemy: new Enemy(),
    tooltipX: 0,
    tooltipY: 0,
    mapImageSrc: '',
  }),
  mounted() {
    const setting = this.$store.state.siteSetting as SiteSetting;
    this.showHP = setting.showHPandArmor;

    // 敵編成読み込み
    const cells = this.$store.state.cells as CellMaster[];

    // 海域セレクトボックス初期化
    const areaItems = [];
    const worlds = this.$store.state.worlds as MasterWorld[];

    const saveData = this.$store.state.mainSaveData as SaveData;
    const items = this.$store.state.items as ItemMaster[];
    const ships = this.$store.state.ships as ShipMaster[];
    const enemies = this.$store.getters.getEnemies as EnemyMaster[];
    const calcManager = saveData.loadManagerData(items, ships, enemies);

    // 初期map
    if (calcManager.battleInfo.fleets.length && calcManager.battleInfo.fleets[calcManager.battleInfo.fleets.length - 1].area) {
      this.selectedArea = calcManager.battleInfo.fleets[calcManager.battleInfo.fleets.length - 1].area;
      this.area = calcManager.battleInfo.fleets[calcManager.battleInfo.fleets.length - 1].area;
    } else {
      this.selectedArea = worlds[0].world * 10 + 1;
      this.area = worlds[0].world * 10 + 1;
    }

    const masterMaps = this.$store.state.maps as MasterMap[];
    for (let i = 0; i < worlds.length; i += 1) {
      const world = worlds[i];
      const maps = masterMaps.filter((v) => Math.floor(v.area / 10) === world.world);
      if (!maps.length) {
        continue;
      }
      if (i > 0) {
        areaItems.push({ divider: true });
      }

      areaItems.push({ header: world.name });
      for (let j = 0; j < maps.length; j += 1) {
        const map = maps[j];
        const worldText = world.world > 40 ? 'E' : `${world.world}`;
        areaItems.push({ value: map.area, text: `${worldText}-${map.area % 10}：${map.name}`, group: world.name });
      }
    }
    this.areaItems = areaItems;

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

        const isAirRaid = cell.cellType === CELL_TYPE.AIR_RAID || cell.cellType === CELL_TYPE.HIGH_AIR_RAID || cell.cellType === CELL_TYPE.SUPER_HIGH_AIR_RAID;
        this.isAirRaid = isAirRaid;

        // 味方陣形の自動設定
        let mainFleetFormation: number = FORMATION.LINE_AHEAD;
        if (isAirRaid) {
          // 空襲系のとき輪形
          mainFleetFormation = FORMATION.DIAMOND;
        } else if (cell.cellType === CELL_TYPE.NIGHT && cell.area > 400) {
          // 夜戦のときかつイベント警戒
          mainFleetFormation = FORMATION.VANGUARD;
        } else if (enemies[0].isSubmarine) {
          // 旗艦が潜水艦のとき単横
          mainFleetFormation = FORMATION.LINE_ABREAST;
        }

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
    },
    expandMap() {
      this.expandMapDialog = true;
    },
    close() {
      this.handleClose();
    },
    closeDetail() {
      this.detailDialog = false;
      this.toggleDetailDialog();
    },
    bootTooltip(enemy: Enemy, e: MouseEvent) {
      if (!enemy.data.id) {
        return;
      }
      const setting = this.$store.state.siteSetting as SiteSetting;
      const nameDiv = (e.target as HTMLDivElement).getElementsByClassName('text-id')[0] as HTMLDivElement;
      window.clearTimeout(this.tooltipTimer);
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
    clickedShowHP() {
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.showHPandArmor = this.showHP;
      this.$store.dispatch('updateSetting', setting);
    },
    handleImageError(e: Event) {
      const imgElement = e.target as HTMLImageElement;
      imgElement.src = `https://res.cloudinary.com/aircalc/kc-web/maps/${this.area}_temp.webp`;
    },
  },
});
</script>
