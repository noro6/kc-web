<template>
  <v-card class="my-2 px-1 py-2">
    <div class="d-flex pb-1">
      <div class="pl-2 align-self-center">自艦隊</div>
      <v-spacer></v-spacer>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="bulkUpdateDialog = true" v-bind="attrs" v-on="on">
            <v-icon>mdi-wrench</v-icon>
          </v-btn>
        </template>
        <span>装備一括設定</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="resetFleetAll" v-bind="attrs" v-on="on">
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>
        <span>全艦隊リセット</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="captureFleet" v-bind="attrs" v-on="on">
            <v-icon>mdi-camera</v-icon>
          </v-btn>
        </template>
        <span>スクリーンショットを保存</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="handleMinimize(true)" v-bind="attrs" v-on="on">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </template>
        <span>最小化</span>
      </v-tooltip>
    </div>
    <v-divider></v-divider>
    <v-row align="center" class="mt-1 mx-4" dense>
      <v-menu v-model="levelMenu" :close-on-content-click="false" @input="onLevelMenuToggle">
        <template v-slot:activator="{ on, attrs }" v-ripple="{ class: 'info--text' }">
          <div class="form-input" v-bind="attrs" v-on="on">
            <v-text-field type="number" dense hide-details label="司令部Lv" v-model.number="fleetInfo.admiralLevel" readonly></v-text-field>
          </div>
        </template>
        <v-card class="pa-5">
          <v-text-field
            class="form-input"
            v-model.number="level"
            max="120"
            min="1"
            hide-details
            type="number"
            label="司令部Lv"
          ></v-text-field>
        </v-card>
      </v-menu>
      <div class="ml-4">
        <v-checkbox label="連合艦隊" v-model="fleetInfo.isUnion" @change="changedInfo"></v-checkbox>
      </div>
      <div class="ml-5">
        <v-select
          class="form-input"
          label="陣形"
          v-model="fleetInfo.mainFleet.formation"
          :items="formations"
          hide-details
          dense
          @change="changedFormation(fleetInfo.mainFleet.formation)"
        ></v-select>
      </div>
    </v-row>
    <v-tabs v-model="tab" class="px-2">
      <v-tab
        v-for="i in 4"
        :key="i"
        :href="`#fleet${i - 1}`"
        @click="changedTab(i - 1)"
        class="fleet-tab"
        :draggable="tab === `fleet${i - 1}`"
        @dragover.prevent
        @drop.stop="dropItem($event)"
        @dragleave.stop="dragLeave($event)"
        @dragenter.stop="dragEnter($event)"
        @dragstart.stop="dragStart($event)"
        @dragend.stop="dragEnd($event)"
      >
        <template v-if="fleetInfo.isUnion && i === 1">主力艦隊</template>
        <template v-else-if="fleetInfo.isUnion && i === 2">随伴艦隊</template>
        <template v-else>第{{ i }}艦隊</template>
      </v-tab>
      <v-tab href="#fleet4" disabled>【工事中】</v-tab>
    </v-tabs>
    <v-divider class="mx-2"></v-divider>
    <v-tabs-items v-model="tab">
      <v-tab-item
        v-for="(fleet, i) in fleetInfo.fleets"
        :key="i"
        :value="`fleet${i}`"
        class="fleet-container"
        :class="{ captured: capturing }"
      >
        <fleet-component
          v-model="fleetInfo.fleets[i]"
          :index="i"
          :handle-show-ship-list="showShipList"
          :handle-show-item-list="showItemList"
          :handle-show-temp-ship-list="showTempShipList"
          :union-fleet="fleetInfo.unionFleet"
          :is-union="fleetInfo.isUnion"
          :admiral-lv="fleetInfo.admiralLevel"
          @input="changedInfo"
        ></fleet-component>
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
    <v-dialog v-model="itemListDialog" transition="scroll-x-transition" :width="itemDialogWidth">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeDialog" :handle-change-width="changeWidth" />
    </v-dialog>
    <v-dialog v-model="tempShipListDialog" transition="scroll-x-transition" width="960">
      <v-card v-if="tempShip" class="pa-3">
        <div class="d-flex">
          <v-card class="temp-ship">
            <div class="d-flex ml-1">
              <div class="align-self-center">
                <v-img :src="`./img/ship/${tempShip.data.id}.png`" height="32" width="128"></v-img>
              </div>
              <div class="align-self-center ml-2 flex-grow-1">
                <div class="d-flex flex-wrap">
                  <div class="caption">Lv: {{ tempShip.level }}</div>
                  <div class="caption ml-2">運: {{ tempShip.luck }}</div>
                  <div class="caption ml-2">対空: {{ tempShip.antiAir }}</div>
                </div>
                <div class="d-flex flex-grow-1">
                  <div class="temp-ship-name text-truncate">{{ tempShip.data.name }}</div>
                </div>
              </div>
            </div>
            <div v-for="(item, i) in tempShip.items" :key="`tempItem${i}`" class="d-flex">
              <div class="align-self-center caption temp-slot">{{ item.fullSlot }}</div>
              <div>
                <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="24" width="24" />
              </div>
              <div class="align-self-center caption">{{ item.data.name ? item.data.name : "未装備" }}</div>
            </div>
          </v-card>
          <div class="ml-3">
            <v-btn @click="pushTempShip()">一時保存リストに追加</v-btn>
          </div>
        </div>
        <v-divider class="my-3"></v-divider>
        <div class="d-flex ml-2 mb-2">
          <div class="body-2">一時保存艦娘一覧</div>
          <div class="ml-3 align-self-end caption">※ クリックすると展開できる予定</div>
        </div>
        <div class="temp-ship-list">
          <v-card class="temp-ship mb-2" v-ripple="{ class: 'info--text' }" v-for="(temp, i) in tempShipList" :key="`tempShip${i}`">
            <div class="d-flex ml-1">
              <div class="align-self-center">
                <v-img :src="`./img/ship/${temp.data.id}.png`" height="32" width="128"></v-img>
              </div>
              <div class="align-self-center ml-2 flex-grow-1">
                <div class="d-flex flex-wrap">
                  <div class="caption">Lv: {{ temp.level }}</div>
                </div>
                <div class="d-flex flex-grow-1">
                  <div class="temp-ship-name text-truncate">{{ temp.data.name }}</div>
                </div>
              </div>
            </div>
            <div v-for="(item, j) in temp.items" :key="`tempSship${i}item${j}`" class="d-flex">
              <div class="align-self-center caption temp-slot">{{ item.fullSlot }}</div>
              <div>
                <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="24" width="24" />
              </div>
              <div class="align-self-center caption">{{ item.data.name ? item.data.name : "未装備" }}</div>
            </div>
          </v-card>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="bulkUpdateDialog" transition="scroll-x-transition" width="600" @input="onBulkUpdateDialogToggle">
      <v-card>
        <div class="d-flex pt-2 pb-1 pr-2">
          <div class="align-self-center ml-3">装備一括設定</div>
          <v-spacer></v-spacer>
          <v-btn icon @click="bulkUpdateDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="px-5 pt-2 pb-5">
          <div>
            <div class="body-2">適用対象...選択した艦隊の全艦娘に対し、下記の設定を適用します。</div>
            <div class="d-flex justify-space-between">
              <v-checkbox label="全艦隊" dense hide-details @click="toggleBulkTarget" v-model="isbulkUpdateTargetAll" readonly></v-checkbox>
              <v-checkbox
                v-for="(check, i) in bulkUpdateTarget"
                :key="i"
                :label="`第${i + 1}艦隊`"
                dense
                hide-details
                v-model="bulkUpdateTarget[i]"
              ></v-checkbox>
            </div>
          </div>
          <v-divider class="mt-4 mb-2"></v-divider>
          <div class="body-2">熟練度</div>
          <div class="d-flex justify-space-between">
            <div v-for="i in 9" :key="i - 1" v-ripple class="level-list-item" @click="setLevel(i - 1)">
              <v-img :src="`./img/util/prof${i - 1}.png`" width="18" height="24"></v-img>
              <span class="level-list-value">{{ getLevelValue(i - 1) }}</span>
            </div>
            <v-btn color="success" outlined @click="setMaxLevelOnlyFighter">戦闘機のみ最大</v-btn>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="body-2">改修値</div>
          <div class="d-flex justify-space-between">
            <div v-for="i in 11" :key="i" v-ripple @click="setRemodel(i - 1)" class="remodel-list-item">
              <v-icon small color="teal accent-4">mdi-star</v-icon>
              <span class="teal--text text--accent-4">{{ i - 1 }}</span>
            </div>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="body-2">艦載機搭載数</div>
          <div class="d-flex">
            <v-btn outlined @click="resetSlot">初期値</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.form-input {
  width: 120px;
}

/** スクショ用調整  */
.fleet-container.captured {
  width: 1200px !important;
  background: #fff;
  border: 1px solid #bbb;
  border-radius: 0.25rem;
  padding: 0.75rem;
}
.theme--dark .fleet-container.captured {
  background: #111;
  border: 1px solid #444;
}

.remodel-list-item i,
.remodel-list-item span {
  vertical-align: middle;
}

.remodel-list-item,
.level-list-item {
  padding: 0.5rem 0.75rem;
  transition: 0.2s;
  cursor: pointer;
  position: relative;
  border-radius: 0.2rem;
}
.remodel-list-item {
  min-width: 46px;
  text-align: center;
  padding: 0.5rem 0;
}

.remodel-list-item:hover,
.level-list-item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.level-list-value {
  display: inline-block;
  position: absolute;
  font-size: 0.75em;
  text-align: center;
  font-weight: 900;
  bottom: 0;
  width: 30px;
  right: 1px;
  z-index: 1;
  text-shadow: 1px 1px 1px #fff, -1px -1px 1px #fff, -1px 1px 1px #fff, 1px -1px 1px #fff, 1px 0px 1px #fff, -1px -0px 1px #fff,
    0px 1px 1px #fff, 0px -1px 1px #fff;
}
.theme--dark .level-list-value {
  text-shadow: 1px 1px 1px #222, -1px -1px 1px #222, -1px 1px 1px #222, 1px -1px 1px #222, 1px 0px 1px #222, -1px -0px 1px #222,
    0px 1px 1px #222, 0px -1px 1px #222;
}

.temp-ship-list {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 600px) {
  .temp-ship-list {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 800px) {
  .temp-ship-list {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
.temp-ship {
  margin: 0 0.2rem;
  padding: 0.25rem;
}
.temp-ship-list .temp-ship {
  cursor: pointer;
}
.temp-ship-list .temp-ship:hover {
  background-color: rgba(128, 200, 255, 0.1);
}
.temp-ship-name {
  flex-grow: 1;
  font-size: 0.9em;
  width: 10px;
}
.temp-slot {
  text-align: right;
  width: 22px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import html2canvas from 'html2canvas';
import FleetComponent from '@/components/fleet/Fleet.vue';
import ItemList from '@/components/item/ItemList.vue';
import ShipList, { ViewShip } from '@/components/fleet/ShipList.vue';
import FleetInfo from '@/classes/fleet/fleetInfo';
import Fleet, { FleetBuilder } from '@/classes/fleet/fleet';
import Ship, { ShipBuilder } from '@/classes/fleet/ship';
import Item, { ItemBuilder } from '@/classes/item/item';
import Const, { Formation } from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';
import { MasterEquipmentExSlot, MasterEquipmentShip } from '@/classes/interfaces/master';

export default Vue.extend({
  name: 'FleetAll',
  components: {
    FleetComponent,
    ItemList,
    ShipList,
  },
  props: {
    value: {
      type: FleetInfo,
      required: true,
    },
    handleChangeFormation: {
      type: Function,
      required: true,
    },
    handleMinimize: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    shipListDialog: false,
    itemListDialog: false,
    itemDialogTarget: [-1, -1, -1],
    shipDialogTarget: [-1, -1],
    tab: 'fleet0',
    itemDialogWidth: 1200,
    shipDialogWidth: 1200,
    level: 120,
    levelMenu: false,
    capturing: false,
    tempShip: undefined as undefined | Ship,
    tempShipListDialog: false,
    tempShipList: [] as Ship[],
    bulkUpdateDialog: false,
    bulkUpdateTarget: [1, 1, 1, 1],
  }),
  computed: {
    fleetInfo(): FleetInfo {
      return this.value;
    },
    formations(): Formation[] {
      return Const.FORMATIONS;
    },
    isbulkUpdateTargetAll(): boolean {
      return !this.bulkUpdateTarget.some((v) => !v);
    },
  },
  methods: {
    setInfo(value: FleetInfo) {
      this.$emit('input', value);
    },
    async showItemList(fleetIndex: number, shipIndex: number, slotIndex: number) {
      const ship = this.fleetInfo.fleets[fleetIndex].ships[shipIndex];
      this.itemDialogTarget = [fleetIndex, shipIndex, slotIndex];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(ship, slotIndex);
    },
    async showShipList(fleetIndex: number, shipIndex: number) {
      this.shipDialogTarget = [fleetIndex, shipIndex];
      await (this.shipListDialog = true);
      (this.$refs.shipList as InstanceType<typeof ShipList>).initialize();
    },
    showTempShipList(ship: Ship) {
      this.tempShip = ship;
      this.tempShipListDialog = true;
    },
    pushTempShip() {
      if (this.tempShip) {
        this.tempShipList.push(this.tempShip);
      }
    },
    putShip(viewShip: ViewShip) {
      const { ship } = viewShip;
      this.shipListDialog = false;
      const fleetIndex = this.shipDialogTarget[0];
      const index = this.shipDialogTarget[1];
      const fleet = this.fleetInfo.fleets[fleetIndex];

      // もともとここに配備されていた艦娘の装備情報を抜き取る
      const oldShip = fleet.ships[index];
      const oldItems: Item[] = oldShip.items.concat();
      const newItems: Item[] = [];

      // 装備搭載可否情報マスタ
      const link = this.$store.state.equipShips as MasterEquipmentShip[];
      const exLink = this.$store.state.exSlotEquipShips as MasterEquipmentExSlot[];

      // 元々が空の艦で、艦娘数と配置番号が一致している場合、自動で空の艦娘を追加するが6隻まで
      if (oldShip.isEmpty && index === fleet.ships.length - 1 && fleet.ships.length < 6) {
        fleet.ships.push(new Ship());
      }

      for (let slotIndex = 0; slotIndex < ship.slotCount; slotIndex += 1) {
        const slot = ship.slots[slotIndex] > 0 ? ship.slots[slotIndex] : 0;
        if (slotIndex < oldItems.length) {
          const oldItem = oldItems[slotIndex];
          const itemMaster = oldItem.data;
          if (ship.isValidItem(itemMaster, link, exLink, slotIndex)) {
            // マスタ情報があり、装備条件を満たしている場合は装備引継ぎOK！
            newItems.push(new Item({ item: oldItem, slot }));
          } else {
            // マスタ情報なし or 装備条件を満たさなかった装備は搭載数だけセット
            newItems.push(new Item({ slot }));
          }
        } else {
          // スロット数があっていない場合も空の装備で搭載数だけセット
          newItems.push(new Item({ slot }));
        }
      }

      // 補強増設チェック
      const oldExItem = oldShip.exItem.data;
      let exItem;
      if (oldExItem.id && ship.isValidItem(oldExItem, link, exLink, Const.EXPAND_SLOT_INDEX)) {
        exItem = new Item({ master: oldExItem });
      } else {
        exItem = new Item();
      }

      // 元々いた艦娘を置き換える
      fleet.ships[index] = new Ship({
        master: ship,
        items: newItems,
        exItem,
        isActive: oldShip.isActive,
        level: viewShip.level,
        luck: viewShip.luck,
      });

      // 編成が更新されたため、艦隊を再インスタンス化し更新
      this.fleetInfo.fleets[fleetIndex] = new Fleet({ fleet });
      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
    },
    equipItem(item: Item) {
      const master = item.data;
      this.itemListDialog = false;
      const fleetIndex = this.itemDialogTarget[0];
      const shipIndex = this.itemDialogTarget[1];
      const slotIndex = this.itemDialogTarget[2];
      const fleet = this.fleetInfo.fleets[fleetIndex];
      const ship = fleet.ships[shipIndex];
      let newShip: Ship;

      // 新しい装備配列を生成
      const items = ship.items.concat();
      // 初期熟練度設定
      const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
      let level = 0;
      if (initialLevels) {
        // 設定情報より初期熟練度を解決
        const initData = initialLevels.find((v) => v.id === master.apiTypeId);
        if (initData) {
          level = initData.level;
        }
      }

      if (slotIndex < items.length) {
        // 装備を置き換え
        items[slotIndex] = new Item({
          item: items[slotIndex],
          master,
          remodel: item.remodel,
          level,
        });
        // 装備を変更した艦娘インスタンス再生成
        newShip = new Ship({ ship, items });
      } else if (slotIndex === Const.EXPAND_SLOT_INDEX) {
        // 補強増設を変更した艦娘インスタンス再生成
        const builder: ShipBuilder = { ship, exItem: new Item({ item: ship.exItem, master, remodel: item.remodel }) };
        newShip = new Ship(builder);
      } else {
        // 搭載失敗
        return;
      }

      if (shipIndex < fleet.ships.length) {
        fleet.ships[shipIndex] = newShip;
      } else {
        return;
      }

      // 再生成した艦娘インスタンスで該当艦娘を置き換えた艦隊インスタンスを設定
      const builder: FleetBuilder = { fleet, ships: fleet.ships.concat() };
      this.fleetInfo.fleets[fleetIndex] = new Fleet(builder);
      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
    },
    onLevelMenuToggle() {
      if (!this.levelMenu) {
        this.setInfo(new FleetInfo({ info: this.fleetInfo, admiralLevel: this.level }));
      } else {
        this.level = this.fleetInfo.admiralLevel;
      }
    },
    changedFormation(formation: number) {
      this.handleChangeFormation(formation);
    },
    changedInfo() {
      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
    },
    changedTab(index: number) {
      if (this.fleetInfo.mainFleetIndex === index) {
        return;
      }
      const info = new FleetInfo({ info: this.fleetInfo, mainFleetIndex: index });
      // 編成が変更されたわけではないので履歴への追加を起こさない
      info.ignoreHistory = true;
      this.setInfo(info);
    },
    resetFleetAll() {
      this.setInfo(new FleetInfo());
    },
    closeDialog() {
      this.itemListDialog = false;
      this.shipListDialog = false;
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
    changeShipWidth(width: number) {
      this.shipDialogWidth = width;
    },
    captureFleet() {
      // 背景色とかを塗るフラグ立て
      this.capturing = true;
      const index = this.value.mainFleetIndex;
      const div = document.getElementsByClassName('fleet-container')[index] as HTMLDivElement;
      setTimeout(() => {
        html2canvas(div, { scale: 2, width: 1200 }).then((canvas) => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL();
          link.download = 'export_image.png';
          link.click();
          this.capturing = false;
        });
      }, 10);
    },
    dragStart(e: DragEvent) {
      const target = e.target as HTMLDivElement;
      target.style.opacity = '0.4';
      target.style.backgroundColor = 'rgba(20, 120, 255, 0.2)';
      target.id = 'dragging-item';

      const transfer = e.dataTransfer as DataTransfer;
      const rect = target.getBoundingClientRect();
      if (transfer && rect) {
        transfer.setDragImage(target, rect.width / 2, rect.height);
      }
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.backgroundColor = '';
    },
    dragEnter(e: DragEvent): void {
      const draggingDiv = document.getElementById('dragging-item');
      const target = e.target as HTMLDivElement;
      if (!draggingDiv || !target) {
        return;
      }
      // 受け入れ可能 背景色を青っぽく
      target.style.backgroundColor = 'rgba(255, 200, 100, 0.4)';
    },
    dropItem(e: DragEvent) {
      // 受け渡されたデータ
      const draggingDiv = document.getElementById('dragging-item');
      // そもそもドラッグ開始が正常になされているか
      if (!draggingDiv) {
        return;
      }

      // ドロップされる要素
      const target = e.target as HTMLDivElement;
      target.style.backgroundColor = '';
      if (target.id) {
        // 自身へのドロップ なにもなし
        return;
      }

      const fleetTabs = document.querySelectorAll('.fleet-tab.v-tab');
      let fromIndex = -1;
      let toIndex = -1;
      for (let i = 0; i < fleetTabs.length; i += 1) {
        if (fleetTabs[i] === target) {
          toIndex = i;
        }
        if (fleetTabs[i] === draggingDiv) {
          fromIndex = i;
        }
      }

      if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
        const fromFleet = this.fleetInfo.fleets[fromIndex];
        const toFleet = this.fleetInfo.fleets[toIndex];

        this.fleetInfo.fleets[toIndex] = new Fleet({ fleet: fromFleet });
        this.fleetInfo.fleets[fromIndex] = new Fleet({ fleet: toFleet });
      }
    },
    dragEnd(e: DragEvent) {
      // 後片付け
      const target = e.target as HTMLDivElement;
      target.style.opacity = '1';
      target.style.backgroundColor = '';
      target.id = '';

      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
    },
    toggleBulkTarget() {
      if (this.bulkUpdateTarget.some((v) => !v)) {
        this.bulkUpdateTarget = [1, 1, 1, 1];
      } else {
        this.bulkUpdateTarget = [0, 0, 0, 0];
      }
    },
    getLevelValue(value: number) {
      return Const.PROF_LEVEL_BORDER[value];
    },
    setLevel(index: number) {
      this.bulkUpdateAllItem({ level: Const.PROF_LEVEL_BORDER[index] });
    },
    setRemodel(remodel: number) {
      this.bulkUpdateAllItem({ remodel });
    },
    resetSlot() {
      this.bulkUpdateAllItem({}, true);
    },
    setMaxLevelOnlyFighter() {
      this.bulkUpdateAllItem({ level: 120 }, false, true);
    },
    bulkUpdateAllItem(itemBuilder: ItemBuilder, isResetSlot = false, onlyFighter = false) {
      // 指定ビルダーで装備情報一括更新
      const { fleets } = this.fleetInfo;
      for (let i = 0; i < fleets.length; i += 1) {
        if (!this.bulkUpdateTarget[i]) {
          continue;
        }
        const { ships } = fleets[i];
        for (let j = 0; j < ships.length; j += 1) {
          const shipMaster = ships[j].data;
          const { items } = ships[j];
          for (let k = 0; k < items.length; k += 1) {
            if (!onlyFighter || (onlyFighter && items[k].isFighter)) {
              items[k] = new Item({
                item: items[k],
                slot: isResetSlot ? shipMaster.slots[k] : undefined,
                remodel: items[k].data.canRemodel ? itemBuilder.remodel : undefined,
                level: itemBuilder.level,
              });
            }
          }

          const newExItem = new Item({
            item: ships[j].exItem,
            remodel: ships[j].exItem.data.canRemodel ? itemBuilder.remodel : undefined,
            level: itemBuilder.level,
          });
          ships[j] = new Ship({ ship: ships[j], exItem: newExItem });
        }
        fleets[i] = new Fleet({ fleet: fleets[i] });
      }

      const newInfo = new FleetInfo({ info: this.fleetInfo });
      // 閉じるまで計算はさせない
      newInfo.calculated = true;
      this.setInfo(newInfo);
    },
    onBulkUpdateDialogToggle() {
      if (!this.bulkUpdateDialog) {
        this.setInfo(new FleetInfo({ info: this.fleetInfo }));
      }
    },
  },
});
</script>
