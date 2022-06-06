<template>
  <div class="area-manager-container mt-3">
    <div class="align-self-center pl-2 d-flex">
      <v-checkbox v-model="visibleShipName" dense label="艦娘名表示"></v-checkbox>
      <v-text-field
        class="search-input ml-5"
        label="名称検索"
        dense
        v-model.trim="searchWord"
        clearable
        prepend-inner-icon="mdi-magnify"
      ></v-text-field>
    </div>
    <div>
      <div class="d-flex my-2" v-if="!readonly">
        <v-btn class="ml-auto" color="secondary" @click="resetAreaHuda()">お札一斉解除</v-btn>
      </div>
    </div>
    <v-card v-for="data in filteredAreaShipList" :key="`area_${data.area}`" class="mb-2 px-2 py-3 area-card">
      <div class="d-flex">
        <div class="area-banner">
          <v-img :src="`https://res.cloudinary.com/aircalc/kc-web/area/area${data.area}.png`" height="55" width="38"></v-img>
        </div>
        <v-btn class="ml-12" color="primary" @click.stop="showShipList(data.area)" :disabled="disabledEdit"> 配備 </v-btn>
        <v-btn class="ml-3" color="secondary" @click.stop="resetShipsClicked(data.area)" :disabled="disabledEdit"> 解散 </v-btn>
      </div>
      <div v-if="data.headers.length > 0" class="py-1"></div>
      <div v-for="header in data.headers" :key="`type_${header.text}`">
        <div class="type-divider mt-1">
          <div class="caption">{{ header.text }}</div>
          <div class="type-divider-border"></div>
        </div>
        <div class="d-flex flex-wrap">
          <div
            v-for="(ship, i) in header.ships"
            :key="`area_${data.area}_ship${i}`"
            class="ship-container"
            :class="{ clickable: !disabledEdit }"
            v-ripple="{ class: 'info--text' }"
            @click.stop="clickedShip(data.area, ship)"
            @mouseenter="bootTooltip(ship, $event)"
            @mouseleave="clearTooltip"
          >
            <div class="ship-img">
              <div>
                <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120"></v-img>
              </div>
              <div class="ship-area-banner">
                <v-img :src="`https://res.cloudinary.com/aircalc/kc-web/area/area${data.area}_min.png`" height="33" width="30" />
              </div>
              <div class="slot-ex-img" v-if="ship.expand">
                <v-img :src="`./img/util/slot_ex.png`" height="27" width="27"></v-img>
              </div>
            </div>
            <div class="caption" v-if="visibleShipName">
              <div class="ship-status">
                <div class="align-self-center primary--text">Lv:{{ ship.level }}</div>
                <div class="ml-1 align-self-center">運:{{ ship.luck }}</div>
              </div>
              <div class="ml-1 text-truncate ship-name">{{ ship.data.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </v-card>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
    <v-dialog v-model="confirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="ma-4">
          <div class="d-flex mb-3" v-if="confirmShip">
            <div>
              <v-img :src="`./img/ship/${confirmShip.data.id}.png`" height="30" width="120"></v-img>
            </div>
            <div class="caption">
              <div class="ship-status">
                <div class="align-self-center primary--text">Lv:{{ confirmShip.level }}</div>
                <div class="ml-1 align-self-center">運:{{ confirmShip.luck }}</div>
              </div>
              <div class="ml-1 text-truncate ship-name">{{ confirmShip.data.name }}</div>
            </div>
          </div>
          <div v-if="confirmShip">札を解除します。よろしいですか？</div>
          <div v-else>解散します。よろしいですか？</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="red" dark @click.stop="removeShip()" v-if="confirmShip">解除</v-btn>
          <v-btn class="ml-auto" color="red" dark @click.stop="resetShips()" v-else>解散</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
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
      <ship-tooltip v-model="tooltipShip" />
    </v-tooltip>
  </div>
</template>

<style scoped>
.area-manager-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 0.5rem;
}
.area-card {
  position: relative;
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
.ship-container {
  display: flex;
  border: 1px solid transparent;
  height: 38px;
  transition: 0.1s;
  border-radius: 0.2rem;
}
.ship-container.clickable {
  cursor: pointer;
}
.ship-container:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.ship-container > div {
  align-self: center;
}
.ship-img {
  position: relative;
}
.ship-area-banner {
  position: absolute;
  bottom: 0px;
  left: 20px;
}
.slot-ex-img {
  position: absolute;
  bottom: -4px;
  right: -2px;
}
.ship-status {
  display: flex;
  height: 12px;
  font-size: 11px;
}
.ship-status > div {
  align-self: center;
  margin-left: 4px;
}
.ship-name {
  width: 80px;
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

interface GroupShip {
  data: ShipMaster;
  hp: number;
  level: number;
  luck: number;
  impHP: number;
  impASW: number;
  impLuck: number;
  expand: boolean;
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
    visibleShipName: false,
    existStock: false,
    areaShipList: [] as { area: number; headers: Header[] }[],
    unsbscribe: undefined as unknown,
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
  }),
  mounted() {
    this.unsbscribe = this.$store.subscribe((mutation) => {
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
  },
  beforeDestroy() {
    if (this.unsbscribe) {
      (this.unsbscribe as () => void)();
    }
  },
  methods: {
    loadShipStock() {
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
            };
            header.ships.push(shipData);
          }
        }
      }

      // いない艦種を消す
      for (let i = 0; i < this.areaShipList.length; i += 1) {
        const headers = this.areaShipList[i].headers.filter((v) => v.ships.length);
        for (let j = 0; j < headers.length; j += 1) {
          headers[j].ships.sort((a, b) => a.data.sort - b.data.sort);
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
    resetAreaHuda() {
      // お札一斉解除
      const stocks = this.$store.state.shipStock as ShipStock[];
      for (let i = 0; i < stocks.length; i += 1) {
        stocks[i].area = 0;
      }
      this.$store.dispatch('updateShipStock', stocks);
    },
    bootTooltip(ship: GroupShip, e: MouseEvent) {
      this.tooltipTimer = window.setTimeout(() => {
        this.tooltipX = e.clientX;
        this.tooltipY = e.clientY;
        const toolTipShip = new Ship({
          master: ship.data,
          level: ship.level,
          hp: ship.hp,
          luck: ship.luck,
          asw: ship.impASW,
        });
        this.tooltipShip = toolTipShip;
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
