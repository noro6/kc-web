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
          @input="changedAdmiralLv"
        ></v-text-field>
      </div>
      <div class="ml-4">
        <v-checkbox v-model="fleetInfo.isUnion" label="連合艦隊" @change="changedIsUnion"></v-checkbox>
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
.theme--dark.v-card {
  background-color: rgb(25, 25, 28);
}
.theme--dark.v-tabs-items {
  background-color: transparent;
}

.admiral-level {
  width: 120px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import FleetComponent from '@/components/Fleet.vue';
import ItemList from '@/components/ItemList.vue';
import ShipList from '@/components/ShipList.vue';
import ShipMaster from '@/classes/ShipMaster';
import ItemMaster from '@/classes/ItemMaster';
import FleetInfo from '@/classes/FleetInfo';
import Const from '@/classes/Const';
import Ship, { ShipBuilder } from '@/classes/Ship';
import Item, { ItemBuilder } from '@/classes/Item';
import Fleet, { FleetBuilder } from '@/classes/Fleet';

export default Vue.extend({
  name: 'FleetAll',
  components: {
    FleetComponent,
    ItemList,
    ShipList,
  },
  data: () => ({
    fleetInfo: new FleetInfo(),
    shipListDialog: false,
    itemListDialog: false,
    itemDialogTarget: [-1, -1, -1],
    shipDialogTarget: [-1, -1],
    tab: 'fleet0',
  }),
  watch: {
    fleetInfo: {
      handler() {
        console.log('★ watch FleetInfo Updated');
      },
      deep: true,
    },
  },
  methods: {
    async showItemList(fleetIndex: number, shipIndex: number, slotIndex: number) {
      const ship = this.fleetInfo.fleets[fleetIndex].ships[shipIndex];
      this.itemDialogTarget = [fleetIndex, shipIndex, slotIndex];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(ship, slotIndex === Const.EXPAND_SLOT_INDEX);
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
        fleet.ships.push(new Ship());
      }

      // 装備マスタより装備を解決
      const allItems = this.$store.state.items as ItemMaster[];
      const items: Item[] = [];

      // もともとここに装備されていた艦娘を取得
      const ships = fleet.ships.concat();
      const orgShip = ships[index];

      for (let i = 0; i < ship.slotCount; i += 1) {
        const slot = ship.slots[i] > 0 ? ship.slots[i] : 0;
        if (i < orgShip.items.length) {
          const item = allItems.find((v) => v.id === orgShip.items[i].data.id);
          if (item) {
            const builder: ItemBuilder = { master: item, slot };
            // 装備をセット
            items.push(new Item(builder));
          } else {
            items.push(new Item({ slot }));
          }
        } else {
          items.push(new Item({ slot }));
        }
      }
      // 連合フラグかつ6隻目以降なら連合随伴とする todo 第2艦隊固定など
      const isEscort = fleet.isUnion && index >= 6;
      // 元々いた艦娘を置き換える
      ships[index] = new Ship({
        ship: orgShip,
        master: ship,
        items,
        isEscort,
      });

      // 編成が更新されたため、艦隊を再インスタンス化し更新
      const builder: FleetBuilder = { fleet, ships };
      this.$set(this.fleetInfo.fleets, fleetIndex, new Fleet(builder));
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
      this.$set(this.fleetInfo.fleets, fleetIndex, new Fleet(builder));
    },
    changedAdmiralLv() {
      // 索敵値を再計算
    },
    changedIsUnion() {
      // 連合非連合かわった
    },
  },
});
</script>
