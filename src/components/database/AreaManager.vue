<template>
  <div class="mt-3">
    <div class="d-flex align-center flex-wrap">
      <div class="search-input">
        <v-text-field :label="$t('Database.名称検索')" dense v-model.trim="searchWord" clearable prepend-inner-icon="mdi-magnify" />
      </div>
      <div class="ml-auto d-flex">
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn fab text @click="expandAll()" v-bind="attrs" v-on="on">
              <v-icon>mdi-expand-all</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Database.全て展開") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn fab text @click="collapseAll()" v-bind="attrs" v-on="on">
              <v-icon>mdi-collapse-all</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Database.全て折りたたむ") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn fab text @click="captureTagManager()" v-bind="attrs" v-on="on">
              <v-icon>mdi-camera</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Common.スクリーンショットを保存") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn fab text @click="confirmResetDialog = true" v-bind="attrs" v-on="on">
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Database.お札一斉解除") }}</span>
        </v-tooltip>
      </div>
    </div>
    <div class="area-manager-container mt-1" id="area-tag-manager" :class="{ captured: capturing }">
      <v-card
        v-for="data in filteredAreaShipList"
        :key="`area_${data.area}`"
        class="px-2 py-3 area-card"
        :class="{ minimize: minimizeArea.includes(data.area) }"
        :data-area="data.area"
        @dragenter="dragEnter($event)"
        @dragleave="dragLeave($event)"
        @drop.stop="dropShip($event)"
        @dragover.prevent
      >
        <div class="d-flex mb-2" v-if="!capturing">
          <div class="area-banner">
            <v-img :src="`./img/tags/area${data.area}.webp`" height="54" width="40" />
          </div>
          <v-btn class="ml-12" color="primary" @click.stop="showShipList(data.area)" :disabled="disabledEdit">
            {{ $t("Common.配備") }}
          </v-btn>
          <v-btn class="ml-3" color="secondary" @click.stop="resetShipsClicked(data.area)" :disabled="disabledEdit">
            {{ $t("Database.解散") }}
          </v-btn>
          <v-btn class="ml-auto" icon @click="toggleMinimize(data.area)">
            <v-icon v-if="minimizeArea.includes(data.area)">mdi-chevron-down</v-icon>
            <v-icon v-else>mdi-chevron-up</v-icon>
          </v-btn>
        </div>
        <template v-if="!minimizeArea.includes(data.area)">
          <div v-for="header in data.headers" :key="`type_${header.text}`">
            <div class="type-divider" :class="{ 'mt-2 mb-1': capturing }">
              <div class="caption">{{ $t(`SType.${header.text}`) }}</div>
              <div class="caption ml-1 text--secondary">({{ header.ships.length }})</div>
              <div class="type-divider-border" />
            </div>
            <div class="ships-container" :class="{ capturing: capturing }">
              <div
                v-for="(ship, i) in header.ships"
                :key="`area_${data.area}_ship${i}`"
                class="ship-container"
                :class="{ draggable: !disabledEdit, capturing: capturing }"
                :draggable="!disabledEdit"
                @dragstart="dragStart(ship, $event)"
                @dragend="dragEnd($event)"
                @click.stop="clickedShip(data.area, ship)"
                @keypress.enter="clickedShip(data.area, ship)"
              >
                <div
                  class="ship-img-container"
                  @mouseenter="bootTooltip(ship, $event)"
                  @mouseleave="clearTooltip"
                  @focus="bootTooltip(ship, $event)"
                  @blur="clearTooltip"
                  draggable="false"
                >
                  <div class="ship-img">
                    <img :src="`./img/ship/banner/${ship.data.id}.png`" :alt="`ship${ship.data.id}`" />
                  </div>
                  <div class="slot-ex-img" v-if="ship.expand">
                    <img :src="`./img/util/slot_ex.png`" alt="slot_ex" />
                  </div>
                  <div class="ship-area-banner" v-if="capturing">
                    <img :src="`./img/tags/area${data.area}.webp`" alt="banner" />
                  </div>
                </div>
                <div class="ship-status-name">
                  <div class="ship-status">
                    <div class="align-self-center primary--text">
                      Lv <span class="font-weight-bold">{{ ship.level }}</span>
                    </div>
                    <div class="ml-1 align-self-center d-none d-sm-block">
                      {{ $t("Common.運") }} <span class="font-weight-bold">{{ ship.luck }}</span>
                    </div>
                  </div>
                  <div class="text-truncate ship-name">{{ getShipName(ship.data) }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </v-card>
    </div>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth" :fullscreen="isMobile">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="ma-4">
          <div class="d-flex mb-3" v-if="confirmShip">
            <div>
              <v-img :src="`./img/ship/banner/${confirmShip.data.id}.png`" height="30" width="120" />
            </div>
            <div class="ship-status-name">
              <div class="ship-status">
                <div class="align-self-center primary--text">Lv:{{ confirmShip.level }}</div>
                <div class="ml-1 align-self-center">{{ $t("Common.運") }} {{ confirmShip.luck }}</div>
              </div>
              <div class="text-truncate">{{ getShipName(confirmShip.data) }}</div>
            </div>
          </div>
          <div v-if="confirmShip">{{ $t("Database.札を解除します。よろしいですか？") }}</div>
          <div v-else>{{ $t("Database.解散します。よろしいですか？") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="red" dark @click.stop="removeShip()" v-if="confirmShip">{{ $t("Database.解除") }}</v-btn>
          <v-btn class="ml-auto" color="red" dark @click.stop="resetShips()" v-else>{{ $t("Database.解散") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmResetDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="ma-4">
          <div>{{ $t("Database.札を解除します。よろしいですか？") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="red" dark @click.stop="resetAreaTag()">{{ $t("Database.解除") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmResetDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-tooltip v-model="enabledTooltip" color="black" bottom right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <ship-tooltip v-model="tooltipShip" />
    </v-tooltip>
  </div>
</template>

<style scoped>
.area-manager-container {
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 0.5rem;
  row-gap: 0.5rem;
}
@media (min-width: 660px) {
  .area-manager-container {
    grid-template-columns: 1fr 1fr;
  }
}

.search-input {
  max-width: 400px;
  min-width: 200px;
  flex-grow: 1;
}

.area-card {
  position: relative;
}
.area-card.dragging:not(.dragging-parent) * {
  pointer-events: none;
}
.area-card.minimize {
  height: 60px;
  overflow: hidden;
}

.area-banner {
  position: absolute;
  left: 10px;
  top: 0;
}
.type-divider {
  display: flex;
  width: 100%;
}
.type-divider-border {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}

.ships-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.ships-container.capturing {
  display: flex;
  flex-wrap: wrap;
}
@media (min-width: 500px) {
  .ships-container {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 600px) {
  .ships-container {
    display: flex;
    flex-wrap: wrap;
  }
}

.ship-container {
  border: 1px solid transparent;
  transition: 0.1s;
  border-radius: 0.2rem;
}
.ship-container .ship-status-name {
  display: flex;
  align-items: center;
  column-gap: 8px;
}
.ship-container.capturing {
  display: flex;
  border: 1px solid transparent;
  height: 32px;
  transition: 0.1s;
  align-items: center;
  border-radius: 0.2rem;
}
.ship-container.capturing .ship-status-name {
  display: block;
  align-items: unset;
  column-gap: unset;
}
@media (min-width: 600px) {
  .ship-container {
    display: flex;
    border: 1px solid transparent;
    height: 32px;
    transition: 0.1s;
    align-items: center;
    border-radius: 0.2rem;
  }
  .ship-container .ship-status-name {
    display: block;
    align-items: unset;
    column-gap: unset;
  }
}
.ship-container.draggable {
  cursor: move;
}
.ship-container:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.ship-img-container {
  position: relative;
}
.ship-img-container img {
  pointer-events: none;
}
.ship-img {
  height: 36px;
}
.ship-img img {
  height: 36px;
  width: 144px;
}
.capturing .ship-img {
  height: 30px;
}
.capturing .ship-img img {
  height: 30px;
  width: 120px;
}
@media (min-width: 600px) {
  .ship-img {
    height: 30px;
  }
  .ship-img img {
    height: 30px;
    width: 120px;
  }
}
.ship-area-banner {
  position: absolute;
  bottom: -4px;
  left: 22px;
  height: 40px;
  width: 29px;
}
.ship-area-banner img {
  height: 40px;
  width: 29px;
}
.slot-ex-img {
  position: absolute;
  height: 25px;
  width: 25px;
  bottom: 0px;
  left: 119px;
}
.slot-ex-img img {
  height: 25px;
  width: 25px;
}
.capturing .slot-ex-img {
  right: 0px;
  left: unset;
}
@media (min-width: 600px) {
  .slot-ex-img {
    right: 0px;
    left: unset;
  }
}
.ship-status {
  display: flex;
  height: 12px;
  font-size: 11px;
}
.ship-status > div {
  align-self: center;
}
.ship-status-name {
  font-size: 0.75em;
  margin-left: 2px;
}
.ship-name {
  width: 80px;
}
</style>

<style>
/** スクショ用調整  */
.area-manager-container.captured {
  width: 1780px !important;
  background: #fff;
  border: 1px solid #bbb;
  border-radius: 0.25rem;
  padding: 0.75rem;
  grid-template-columns: 1fr 1fr;
}
.theme--dark .area-manager-container.captured {
  background: rgb(40, 40, 45);
  border: 1px solid #444;
}
.deep-sea .theme--dark .area-manager-container.captured {
  background: rgb(8, 18, 42);
}
.captured .area-card {
  padding: 0.25rem 0.75rem !important;
  box-shadow: none !important;
  border: 1px solid #bbb;
}
.theme--dark .captured .area-card {
  border: 1px solid #444;
}
</style>

<script lang="ts">
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import ShipList, { ViewShip } from '@/components/fleet/ShipList.vue';
import ShipTooltip from '@/components/fleet/ShipTooltip.vue';
import Const from '@/classes/const';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipStock from '@/classes/fleet/shipStock';
import Ship from '@/classes/fleet/ship';
import SiteSetting from '@/classes/siteSetting';
import html2canvas from 'html2canvas';
import Convert from '../../classes/convert';

interface GroupShip {
  data: ShipMaster;
  hp: number;
  level: number;
  luck: number;
  impHP: number;
  impASW: number;
  impLuck: number;
  expand: boolean;
  unique: number;
}
interface Header {
  text: string;
  types: number[];
  ships: GroupShip[];
}

export default Vue.extend({
  name: 'AreaManager',
  components: {
    ShipList,
    ShipTooltip,
  },
  props: {
    readonly: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    searchWord: '',
    existStock: false,
    areaShipList: [] as { area: number; headers: Header[] }[],
    unsubscribe: undefined as unknown,
    shipListDialog: false,
    shipDialogWidth: 1200,
    selectedArea: 0,
    confirmDialog: false,
    confirmShip: undefined as undefined | GroupShip,
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipShip: new Ship(),
    tooltipX: 0,
    tooltipY: 0,
    draggingShipId: 0,
    minimizeArea: [] as number[],
    capturing: false,
    confirmResetDialog: false,
    isMobile: true,
  }),
  mounted() {
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'setShipStock') {
        this.loadShipStock();
      }
    });
    this.loadShipStock();
  },
  watch: {
    isTempStockMode() {
      this.loadShipStock();
    },
  },
  computed: {
    isTempStockMode(): boolean {
      return this.$store.getters.getExistsTempStock;
    },
    filteredAreaShipList(): { area: number; headers: Header[] }[] {
      if (this.searchWord) {
        const word = this.searchWord;
        const list = cloneDeep(this.areaShipList);
        for (let i = 0; i < list.length; i += 1) {
          const { headers } = list[i];
          for (let j = 0; j < headers.length; j += 1) {
            const header = headers[j];
            header.ships = header.ships.filter((v) => v.data.name.includes(word));
          }
          list[i].headers = headers.filter((v) => v.ships.length);
        }

        return list;
      }
      return this.areaShipList;
    },
    disabledEdit(): boolean {
      if (!this.existStock || this.readonly || this.searchWord) {
        return true;
      }
      return false;
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
    loadShipStock() {
      this.isMobile = window.innerWidth < 600;
      // 海域グループ初期化
      this.areaShipList = [];
      const maxArea = this.$store.state.areaCount as number;
      for (let i = 0; i < maxArea; i += 1) {
        const typeShips = [];
        const types = Const.SHIP_TYPES_ALT;
        for (let j = 0; j < types.length; j += 1) {
          const typeData = types[j];
          typeShips.push({ text: typeData.text, types: typeData.types, ships: [] } as Header);
        }
        this.areaShipList.push({ area: i + 1, headers: typeShips });
      }

      // 登録情報読み込み
      const all = this.$store.state.ships as ShipMaster[];
      let stocks = this.$store.state.shipStock as ShipStock[];
      this.existStock = stocks.length > 0;

      if (this.readonly) {
        // 閲覧モード
        stocks = this.$store.state.tempShipStock as ShipStock[];
      }

      for (let i = 0; i < stocks.length; i += 1) {
        const stock = stocks[i];
        if (stock.area <= 0) continue;
        const master = all.find((v) => v.id === stock.id);
        if (!master) continue;
        const areaRow = this.areaShipList[stock.area - 1];
        if (areaRow) {
          const header = areaRow.headers.find((v) => v.types.includes(master.type));
          if (header) {
            const shipData: GroupShip = {
              data: master,
              hp: (stock.level > 99 ? master.hp2 : master.hp) + stock.improvement.hp,
              level: stock.level,
              luck: master.luck + stock.improvement.luck,
              expand: stock.releaseExpand,
              impHP: stock.improvement.hp,
              impASW: stock.improvement.asw,
              impLuck: stock.improvement.luck,
              unique: stock.uniqueId,
            };
            header.ships.push(shipData);
          }
        }
      }

      // いない艦種を消す
      for (let i = 0; i < this.areaShipList.length; i += 1) {
        const headers = this.areaShipList[i].headers.filter((v) => v.ships.length);
        for (let j = 0; j < headers.length; j += 1) {
          headers[j].ships.sort((a, b) => {
            if (a.level !== b.level) return b.level - a.level;
            return a.data.sort - b.data.sort;
          });
        }
        this.areaShipList[i].headers = headers;
      }
    },
    async showShipList(area: number) {
      this.selectedArea = area;
      await (this.shipListDialog = true);
      const form = this.$refs.shipList as InstanceType<typeof ShipList>;
      form.disabledStockOnlyChange = true;
      form.isStockOnly = true;
      form.initialize(false);
    },
    putShip(ship: ViewShip) {
      // 登録艦娘から検索
      const stocks = this.$store.state.shipStock as ShipStock[];
      const improvement = {
        hp: ship.hp - (ship.level > 99 ? ship.ship.hp2 : ship.ship.hp),
        asw: ship.asw,
        luck: ship.luck - ship.ship.luck,
      };
      const ships = stocks.filter(
        (v) => v.id === ship.ship.id
          && v.level === ship.level
          && v.area === ship.area
          && v.releaseExpand === ship.expanded
          && v.improvement.hp === improvement.hp
          && v.improvement.asw === improvement.asw
          && v.improvement.luck === improvement.luck,
      );

      if (ships.length) {
        ships.sort((a, b) => a.area - b.area);
        ships[0].area = this.selectedArea;

        this.$store.dispatch('updateShipStock', stocks);
      }
      this.shipListDialog = false;
    },
    changeShipWidth(width: number) {
      this.shipDialogWidth = width;
    },
    closeDialog() {
      this.shipListDialog = false;
    },
    clickedShip(area: number, ship: GroupShip) {
      if (this.disabledEdit) {
        return;
      }
      this.clearTooltip();
      this.confirmShip = ship;
      this.selectedArea = area;
      this.confirmDialog = true;
    },
    removeShip() {
      const area = this.selectedArea;
      const ship = this.confirmShip;
      if (area <= 0 || !ship) {
        return;
      }
      const stocks = this.$store.state.shipStock as ShipStock[];
      const target = stocks.find(
        (v) => v.id === ship.data.id
          && v.level === ship.level
          && v.area === area
          && v.releaseExpand === ship.expand
          && v.improvement.hp === ship.impHP
          && v.improvement.asw === ship.impASW
          && v.improvement.luck === ship.impLuck,
      );
      if (target) {
        target.area = 0;
        this.$store.dispatch('updateShipStock', stocks);
      }

      this.confirmDialog = false;
    },
    resetShipsClicked(area: number) {
      this.confirmShip = undefined;
      this.selectedArea = area;
      this.confirmDialog = true;
    },
    resetShips() {
      const area = this.selectedArea;
      const stocks = this.$store.state.shipStock as ShipStock[];
      const areaShips = stocks.filter((v) => v.area === area);
      for (let i = 0; i < areaShips.length; i += 1) {
        areaShips[i].area = 0;
      }
      this.$store.dispatch('updateShipStock', stocks);
      this.confirmDialog = false;
    },
    resetAreaTag() {
      // お札一斉解除
      const stocks = this.$store.state.shipStock as ShipStock[];
      for (let i = 0; i < stocks.length; i += 1) {
        stocks[i].area = 0;
      }
      this.$store.dispatch('updateShipStock', stocks);
      this.confirmResetDialog = false;
    },
    getShipName(ship: ShipMaster) {
      if (this.needTrans) {
        const shipName = ShipMaster.getSuffix(ship);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return ship.name ? ship.name : '';
    },
    bootTooltip(ship: GroupShip, e: MouseEvent) {
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.disabledShipTooltip) {
        return;
      }
      window.clearTimeout(this.tooltipTimer);
      this.tooltipTimer = window.setTimeout(() => {
        this.tooltipX = e.clientX;
        this.tooltipY = e.clientY;

        const asw = Ship.getStatusFromLevel(ship.level, ship.data.maxAsw, ship.data.minAsw);
        const toolTipShip = new Ship({
          master: ship.data,
          level: ship.level,
          hp: ship.hp,
          luck: ship.luck,
          asw: asw + ship.impASW,
        });
        this.tooltipShip = toolTipShip;
        this.enabledTooltip = true;
      }, Math.max(setting.popUpCount, 10));
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
    toggleMinimize(area: number) {
      if (this.minimizeArea.includes(area)) {
        this.minimizeArea = this.minimizeArea.filter((v) => area !== v);
      } else {
        this.minimizeArea.push(area);
      }
    },
    expandAll() {
      this.minimizeArea = [];
    },
    collapseAll() {
      const maxArea = this.$store.state.areaCount as number;
      for (let i = 1; i <= maxArea; i += 1) {
        this.minimizeArea.push(i);
      }
    },
    dragStart(ship: GroupShip, e: DragEvent) {
      const target = e.target as HTMLDivElement;
      if (!target || !target.classList || !target.classList.contains('ship-container') || !target.draggable) {
        return;
      }
      target.style.opacity = '0.4';
      target.id = 'dragging-item';

      // 親要素area-cardは例外
      const parentCard = target.closest('.area-card');
      if (parentCard) {
        parentCard.classList.add('dragging-parent');
      }

      // 一時的に全てのarea-cardの子要素マウスイベントを消す => enterイベントが子要素に食われるため
      const shipContainerList = document.getElementsByClassName('area-card');
      for (let i = 0; i < shipContainerList.length; i += 1) {
        shipContainerList[i].classList.add('dragging');
      }

      this.clearTooltip();
      this.draggingShipId = ship.unique;
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.boxShadow = '';
    },
    dragEnter(e: DragEvent): void {
      const d = document.getElementById('dragging-item');
      const t = e.target as HTMLDivElement;
      if (!d || !d.classList.contains('ship-container') || !t || !t.classList.contains('area-card') || t.classList.contains('dragging-parent')) {
        return;
      }
      // 受け入れ可能 背景色を青っぽく
      t.style.boxShadow = 'inset 0 0 80px rgba(20, 160, 255, 0.6)';
    },
    dropShip(e: DragEvent) {
      e.preventDefault();
      // 受け渡されたデータ
      const draggingDiv = document.getElementById('dragging-item');
      // そもそもドラッグ開始が正常になされているか
      if (!draggingDiv || !draggingDiv.classList.contains('ship-container')) {
        return;
      }

      // ドロップされる要素
      const target = e.target as HTMLDivElement;
      target.style.boxShadow = '';

      const stocks = this.$store.state.shipStock as ShipStock[];
      const ships = stocks.filter((v) => v.uniqueId === this.draggingShipId);
      if (ships.length && target.dataset.area && ships[0].area !== +target.dataset.area) {
        ships.sort((a, b) => a.area - b.area);
        ships[0].area = +target.dataset.area;

        this.$store.dispatch('updateShipStock', stocks);
      }

      this.resetChildMouseEvent(e);
    },
    dragEnd(e: DragEvent) {
      this.resetChildMouseEvent(e);
    },
    resetChildMouseEvent(e: DragEvent) {
      // まずは一時的に消していた全てのarea-cardの子要素マウスイベントを復活
      const shipContainerList = document.getElementsByClassName('area-card');
      for (let i = 0; i < shipContainerList.length; i += 1) {
        shipContainerList[i].classList.remove('dragging', 'dragging-parent');
      }

      const draggingDiv = document.getElementById('dragging-item') as HTMLDivElement;
      if (!draggingDiv || !draggingDiv.draggable || !draggingDiv.classList.contains('ship-container')) {
        // Firefox なんかおかしくなるので再チェック
        const target = e.target as HTMLDivElement;
        if (target && target.classList.contains('ship-container')) {
          target.style.opacity = '1';
          target.id = '';
        }
        return;
      }

      const target = e.target as HTMLDivElement;
      if (target) {
        target.style.opacity = '1';
        target.id = '';
      }
    },
    captureTagManager() {
      // 背景色とかを塗るフラグ立て
      this.capturing = true;
      const div = document.getElementById('area-tag-manager') as HTMLDivElement;
      setTimeout(() => {
        html2canvas(div, { scale: 1 }).then((canvas) => {
          const link = document.createElement('a');
          const setting = this.$store.state.siteSetting as SiteSetting;
          link.href = canvas.toDataURL(setting.imageType === 'png' ? 'image/png' : 'image/jpeg');
          link.download = `area_tag_${Convert.formatDate(new Date(), 'yyyyMMdd-HHmmss')}.${setting.imageType}`;
          link.click();
          this.capturing = false;
        });
      }, 10);
    },
  },
});
</script>
