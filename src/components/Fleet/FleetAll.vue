<template>
  <v-card class="mx-5 my-2 px-1 py-2 land-base-all">
    <div class="pa-2">自艦隊</div>
    <v-divider></v-divider>
    <v-row align="center" class="mt-1 ml-4" dense>
      <div class="admiral-level align-self-center">
        <v-text-field
          type="number"
          dense
          hide-details
          label="司令部Lv"
          max="120"
          min="1"
          v-model.number="fleetInfo.admiralLevel"
          @input="changedInfo"
        ></v-text-field>
      </div>
      <div class="ml-4">
        <v-checkbox label="連合艦隊" v-model="fleetInfo.isUnion" @change="changedInfo"></v-checkbox>
      </div>
    </v-row>
    <v-tabs v-model="tab" class="px-2">
      <v-tab v-for="i in 4" :key="i" :href="`#fleet${i - 1}`">
        <template v-if="fleetInfo.isUnion && i === 1">主力艦隊</template>
        <template v-else-if="fleetInfo.isUnion && i === 2">随伴艦隊</template>
        <template v-else>第{{ i }}艦隊</template>
      </v-tab>
      <v-tab href="#fleet4">機動部隊(航空)友軍</v-tab>
    </v-tabs>
    <v-divider class="mx-2"></v-divider>
    <v-tabs-items v-model="tab">
      <v-tab-item v-for="(fleet, i) in fleetInfo.fleets" :key="i" :value="`fleet${i}`">
        <fleet-component
          v-model="fleetInfo.fleets[i]"
          :index="i"
          :handle-show-ship-list="showShipList"
          :handle-show-item-list="showItemList"
          :fleet-scouts="fleetScouts[i]"
          @input="changedInfo"
        ></fleet-component>
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="shipListDialog" width="1200">
      <ship-list :handle-decide-ship="putShip" />
    </v-dialog>
    <v-dialog v-model="itemListDialog" width="1200">
      <item-list ref="itemList" :handle-equip-item="equipItem" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.admiral-level {
  width: 120px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import FleetComponent from '@/components/Fleet/Fleet.vue';
import ItemList from '@/components/Item/ItemList.vue';
import ShipList from '@/components/Fleet/ShipList.vue';
import ShipMaster from '@/classes/Fleet/ShipMaster';
import ItemMaster from '@/classes/Item/ItemMaster';
import FleetInfo, { FleetInfoBuilder } from '@/classes/Fleet/FleetInfo';
import Const from '@/classes/Const';
import Ship, { ShipBuilder } from '@/classes/Fleet/Ship';
import Item from '@/classes/Item/Item';
import Fleet, { FleetBuilder } from '@/classes/Fleet/Fleet';

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
  },
  data: () => ({
    shipListDialog: false,
    itemListDialog: false,
    itemDialogTarget: [-1, -1, -1],
    shipDialogTarget: [-1, -1],
    tab: 'fleet0',
  }),
  computed: {
    fleetInfo(): FleetInfo {
      return this.value;
    },
    fleetScouts(): number[][] {
      const scouts = [];
      const fleetInfo = this.value;
      const { fleets } = this.value;
      for (let i = 0; i < fleets.length; i += 1) {
        scouts.push(fleetInfo.getScoutScore(i));
      }
      // 連合艦隊なら第1と第2を合算
      if (this.value.isUnion) {
        const [scouts1, scouts2] = scouts;
        for (let i = 0; i < scouts1.length; i += 1) {
          // 第1と第2を合算した値で置き換え
          scouts[0][i] = scouts1[i] + scouts2[i];
          scouts[1][i] = scouts1[i] + scouts2[i];
        }
      }
      return scouts;
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
    showShipList(fleetIndex: number, shipIndex: number) {
      this.shipDialogTarget = [fleetIndex, shipIndex];
      this.shipListDialog = true;
    },
    putShip(ship: ShipMaster) {
      this.shipListDialog = false;
      const fleetIndex = this.shipDialogTarget[0];
      const index = this.shipDialogTarget[1];
      const fleet = this.fleetInfo.fleets[fleetIndex];

      if (index === fleet.ships.length) {
        // 新規作成時
        fleet.ships.push(new Ship());
      }

      // もともとここに配備されていた艦娘の装備情報を抜き取る
      const oldShip = fleet.ships[index];
      const oldItems: Item[] = oldShip.items.concat();
      const newItems: Item[] = [];

      for (let slotIndex = 0; slotIndex < ship.slotCount; slotIndex += 1) {
        const slot = ship.slots[slotIndex] > 0 ? ship.slots[slotIndex] : 0;
        if (slotIndex < oldItems.length) {
          const itemMaster = oldItems[slotIndex].data;
          if (ship.isValidItem(itemMaster, slotIndex)) {
            // マスタ情報があり、装備条件を満たしている場合は装備引継ぎOK！
            newItems.push(new Item({ master: itemMaster, slot }));
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

      // 連合フラグかつ第2艦隊(fleetIndex: 1)なら連合随伴とする
      const isEscort = fleet.isUnion && fleetIndex === 1;
      // 元々いた艦娘を置き換える
      fleet.ships[index] = new Ship({
        master: ship,
        items: newItems,
        isEscort,
        exItem,
        isActive: oldShip.isActive,
      });

      // 編成が更新されたため、艦隊を再インスタンス化し更新
      this.fleetInfo.fleets[fleetIndex] = new Fleet({ fleet });

      const infoBuilder: FleetInfoBuilder = { info: this.fleetInfo };
      this.setInfo(new FleetInfo(infoBuilder));
    },
    equipItem(selectedItem: ItemMaster) {
      this.itemListDialog = false;
      const fleetIndex = this.itemDialogTarget[0];
      const shipIndex = this.itemDialogTarget[1];
      const slotIndex = this.itemDialogTarget[2];
      const fleet = this.fleetInfo.fleets[fleetIndex];
      const ship = fleet.ships[shipIndex];

      let newShip: Ship;

      // 新しい装備配列を生成
      const items = ship.items.concat();

      if (slotIndex < items.length) {
        // 装備を置き換え
        items[slotIndex] = new Item({ item: items[slotIndex], master: selectedItem });
        // 装備を変更した艦娘インスタンス再生成
        newShip = new Ship({ ship, items });
      } else if (slotIndex === Const.EXPAND_SLOT_INDEX) {
        // 補強増設を変更した艦娘インスタンス再生成
        const builder: ShipBuilder = { ship, exItem: new Item({ item: ship.exItem, master: selectedItem }) };
        newShip = new Ship(builder);
      } else {
        // 搭載失敗
        console.log('搭載に失敗 装備スロットインデックス不正', slotIndex);
        return;
      }

      if (shipIndex < fleet.ships.length) {
        fleet.ships[shipIndex] = newShip;
      } else {
        console.log('搭載に失敗 艦娘インデックス不正', shipIndex);
        return;
      }

      // 再生成した艦娘インスタンスで該当艦娘を置き換えた艦隊インスタンスを設定
      const builder: FleetBuilder = { fleet, ships: fleet.ships.concat() };
      this.fleetInfo.fleets[fleetIndex] = new Fleet(builder);

      const infoBuilder: FleetInfoBuilder = { info: this.fleetInfo };
      this.setInfo(new FleetInfo(infoBuilder));
    },
    changedInfo() {
      const infoBuilder: FleetInfoBuilder = { info: this.fleetInfo };
      this.setInfo(new FleetInfo(infoBuilder));
    },
  },
});
</script>
