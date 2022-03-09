<template>
  <v-card class="my-2 px-1 py-2">
    <div class="d-flex pb-1">
      <div class="pl-2 align-self-center">自艦隊</div>
      <v-spacer></v-spacer>
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
          <v-btn icon @click="resetFleetAll" v-bind="attrs" v-on="on">
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>
        <span>全艦隊リセット</span>
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
      <v-tab v-for="i in 4" :key="i" :href="`#fleet${i - 1}`" @click="changedTab(i - 1)">
        <template v-if="fleetInfo.isUnion && i === 1">主力艦隊</template>
        <template v-else-if="fleetInfo.isUnion && i === 2">随伴艦隊</template>
        <template v-else>第{{ i }}艦隊</template>
      </v-tab>
      <v-tab href="#fleet4" disabled>【工事中】機動部隊(航空)友軍</v-tab>
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
</style>

<script lang="ts">
import Vue from 'vue';
import html2canvas from 'html2canvas';
import FleetComponent from '@/components/fleet/Fleet.vue';
import ItemList from '@/components/item/ItemList.vue';
import ShipList, { ViewShip } from '@/components/fleet/ShipList.vue';
import FleetInfo, { FleetInfoBuilder } from '@/classes/fleet/fleetInfo';
import Fleet, { FleetBuilder } from '@/classes/fleet/fleet';
import Ship, { ShipBuilder } from '@/classes/fleet/ship';
import Item from '@/classes/item/item';
import Const, { Formation } from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';

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
  }),
  computed: {
    fleetInfo(): FleetInfo {
      return this.value;
    },
    formations(): Formation[] {
      return Const.FORMATIONS;
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

      // 元々が空の艦で、艦娘数と配置番号が一致している場合、自動で空の艦娘を追加するが6隻まで
      if (oldShip.isEmpty && index === fleet.ships.length - 1 && fleet.ships.length < 6) {
        fleet.ships.push(new Ship());
      }

      for (let slotIndex = 0; slotIndex < ship.slotCount; slotIndex += 1) {
        const slot = ship.slots[slotIndex] > 0 ? ship.slots[slotIndex] : 0;
        if (slotIndex < oldItems.length) {
          const oldItem = oldItems[slotIndex];
          const itemMaster = oldItem.data;
          if (ship.isValidItem(itemMaster, slotIndex)) {
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
      if (oldExItem.id && ship.isValidItem(oldExItem, Const.EXPAND_SLOT_INDEX)) {
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

      const infoBuilder: FleetInfoBuilder = { info: this.fleetInfo };
      this.setInfo(new FleetInfo(infoBuilder));
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

      const infoBuilder: FleetInfoBuilder = { info: this.fleetInfo };
      this.setInfo(new FleetInfo(infoBuilder));
    },
    onLevelMenuToggle() {
      if (!this.levelMenu) {
        const infoBuilder: FleetInfoBuilder = { info: this.fleetInfo, admiralLevel: this.level };
        this.setInfo(new FleetInfo(infoBuilder));
      } else {
        this.level = this.fleetInfo.admiralLevel;
      }
    },
    changedFormation(formation: number) {
      this.handleChangeFormation(formation);
    },
    changedInfo() {
      const infoBuilder: FleetInfoBuilder = { info: this.fleetInfo };
      this.setInfo(new FleetInfo(infoBuilder));
    },
    changedTab(index: number) {
      if (this.fleetInfo.mainFleetIndex === index) {
        return;
      }
      const infoBuilder: FleetInfoBuilder = { info: this.fleetInfo, mainFleetIndex: index };
      const info = new FleetInfo(infoBuilder);
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
  },
});
</script>
