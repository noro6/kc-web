<template>
  <v-card class="mx-5 my-2 px-1 py-2 land-base-all">
    <div class="pa-2">自艦隊</div>
    <div>
      <v-btn @click="test">テスト用ボタン</v-btn>
    </div>
    <v-divider></v-divider>
    <v-tabs class="small-landbases" v-model="tab">
      <v-tab v-for="(fleet, i) in fleetInfo.fleets" :key="i" :href="`#fleet${i}`">第{{ i + 1 }}艦隊</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <div>
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="(fleet, i) in fleetInfo.fleets" :key="i" :value="`fleet${i}`">
          <fleet-component
            v-model="fleetInfo.fleets[i]"
            :index="i"
            :handle-show-ship-list="showShipList"
            :handle-show-item-list="showItemList"
          ></fleet-component>
        </v-tab-item>
      </v-tabs-items>
    </div>
    <!-- <v-dialog v-model="shipListDialog" width="1200">
      <ship-list :handle-decide-enemy="putShip" />
    </v-dialog> -->
    <v-dialog v-model="itemListDialog" width="1200">
      <item-list ref="itemList" :handle-equip-item="equipItem" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.theme--dark.v-card {
  background-color: rgb(25, 25, 28);
}
.theme--dark.v-tabs-items {
  background-color: transparent;
}
</style>

<script lang="ts">
import Vue from 'vue';
import FleetComponent from '@/components/Fleet.vue';
import ItemList from '@/components/ItemList.vue';
import ShipMaster from '@/classes/ShipMaster';
import ItemMaster from '@/classes/ItemMaster';
import FleetInfo from '@/classes/FleetInfo';
import Const from '@/classes/Const';
import Ship from '@/classes/Ship';
import Item, { ItemBuilder } from '@/classes/Item';
import Fleet, { FleetBuilder } from '@/classes/Fleet';

export default Vue.extend({
  name: 'FleetAll',
  components: {
    FleetComponent,
    ItemList,
  },
  data: () => ({
    fleetInfo: new FleetInfo(),
    shipListDialog: false,
    itemListDialog: false,
    itemDialogTarget: [-1, -1, -1],
    shipDialogTarget: [-1, -1],
    tab: 'fleet0',
  }),
  methods: {
    async showItemList(fleetIndex: number, shipIndex: number, slotIndex: number) {
      this.itemDialogTarget = [fleetIndex, shipIndex, slotIndex];
      await (this.itemListDialog = true);
      this.itemListDialog = true;
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(Const.PLANE_TYPES);
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

      // 装備マスタより装備を解決
      const allItems = this.$store.state.items as ItemMaster[];
      const items: Item[] = [];

      // もともとここに装備されていた艦娘を取得
      const ships = fleet.ships.concat();
      const orgShip = ships[index];

      for (let i = 0; i < ship.slotCount; i += 1) {
        if (orgShip.items.length < i) {
          const item = allItems.find((v) => v.id === orgShip.items[i].data.id);
          if (item) {
            const slot = ship.slots[i] > 0 ? ship.slots[i] : 0;
            const builder: ItemBuilder = { master: item, slot };
            // 装備をセット
            items.push(new Item(builder));
          } else {
            items.push(new Item());
          }
        }
      }
      // 連合フラグかつ6隻目以降なら連合随伴とする todo 第2艦隊固定など
      const isEscort = fleet.isUnion && index >= 6;
      // 元々いた艦娘を置き換える
      ships[index] = new Ship(ship, items, new Item(), isEscort);

      // 編成が更新されたため、艦隊を再インスタンス化し更新
      const builder: FleetBuilder = { fleet, ships };
      this.$set(this.fleetInfo.fleets, fleetIndex, new Fleet(builder));
    },
    test() {
      const allShips = this.$store.state.ships as ShipMaster[];
      const ships = [];

      for (let i = 0; i < 6; i += 1) {
        const id = Math.floor(Math.random() * 200 + 1);
        const shipMaster = allShips.find((v) => v.albumId === id);
        if (shipMaster) {
          const imtes = [];
          for (let j = 0; j < shipMaster.slotCount; j += 1) {
            imtes.push(new Item());
          }

          const ship = new Ship(shipMaster, imtes);
          ships.push(ship);
        } else {
          console.log('配備失敗', id);
        }
      }
      const fleet = this.fleetInfo.fleets[0];
      const builder: FleetBuilder = { fleet, ships };
      this.$set(this.fleetInfo.fleets, 0, new Fleet(builder));
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
        newShip = new Ship(ship.data, items, ship.exItem, ship.isEscort);
      } else if (slotIndex === Const.EXPAND_SLOT_INDEX) {
        // 補強増設を変更した艦娘インスタンス再生成
        newShip = new Ship(ship.data, items, new Item({ item: ship.exItem, master: selectedItem }), ship.isEscort);
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
      this.$set(this.fleetInfo.fleets, fleetIndex, new Fleet(builder));
    },
  },
});
</script>
