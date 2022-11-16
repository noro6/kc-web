<template>
  <v-card class="d-flex flex-wrap justify-center py-3">
    <div class="input-container mx-3">
      <div class="ship-input-container">
        <ship-input
          v-model="fleet.ships[0]"
          :index="0"
          :handle-show-ship-list="showShipList"
          :handle-show-item-list="showItemList"
          :handle-close-ship="removeShip"
          :fix-down="ship.fixDown"
          :rate-down="ship.rateDown"
          :fleet-ros-corr="fleet.fleetRosCorr"
          :hide-active-button="true"
          @input="updateShip"
        />
      </div>
      <div class="pa-2 status-input-container">
        <div>
          <v-text-field label="Lv" v-model.number="level" max="175" min="1" type="number" @input="statusChanged" :disabled="ship.isEmpty"></v-text-field>
        </div>
        <div>
          <v-text-field
            :label="$t('Database.対潜改修')"
            v-model.number="improveAsw"
            max="9"
            min="0"
            type="number"
            @input="statusChanged"
            :disabled="ship.isEmpty"
          ></v-text-field>
        </div>
        <div>
          <v-text-field :label="$t('Extra.初期対潜')" v-model.number="minAsw" min="0" type="number" @input="statusChanged" disabled></v-text-field>
        </div>
        <div>
          <v-text-field :label="$t('Extra.最大対潜')" v-model.number="maxAsw" min="0" type="number" @input="statusChanged" disabled></v-text-field>
        </div>
        <div>
          <v-text-field :label="$t('Extra.装備対潜合計')" v-model.number="ship.itemAsw" disabled></v-text-field>
        </div>
        <div>
          <v-text-field :label="$t('Extra.装備ボーナス合計')" v-model.number="ship.itemBonusStatus.asw" disabled></v-text-field>
        </div>
        <div>
          <v-text-field :label="$t('Extra.素対潜')" v-model.number="baseAsw" disabled></v-text-field>
        </div>
        <div>
          <v-text-field :label="$t('Extra.表示対潜')" v-model.number="ship.displayStatus.asw" disabled></v-text-field>
        </div>
      </div>
    </div>
    <div class="result-container mx-3 pa-1 flex-grow-1">
      <v-card>
        <v-simple-table v-if="!ship.isEmpty">
          <template v-slot:default>
            <thead>
              <tr>
                <th>{{ $t("Extra.目標対潜値") }} ( 0 ~ 200 )</th>
                <th class="text-right">{{ $t("Fleet.不足対潜値") }}</th>
                <th class="text-right">{{ $t("Fleet.必要艦娘Lv") }}</th>
                <th class="text-right">{{ $t("Extra.必要Exp") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(result, i) in results" :key="`result_${i}`" :class="{ ok: !result.missingAsw }">
                <td class="py-2" width="180px">
                  <v-text-field v-model.number="result.targetAsw" dense hide-details min="0" max="200" type="number" @input="calculate"></v-text-field>
                </td>
                <td class="text-right">{{ result.missingAsw }}</td>
                <template v-if="!result.missingAsw">
                  <td class="text-right">-</td>
                  <td class="text-right">-</td>
                </template>
                <template v-else-if="minAsw || maxAsw">
                  <td class="text-right" :class="{ 'red--text': result.requiredLevel > 175 }">{{ result.requiredLevel }}</td>
                  <td class="text-right" v-if="result.requiredLevel > 175">-</td>
                  <td class="text-right" v-else>{{ result.requiredExp ? result.requiredExp.toLocaleString() : "0" }}</td>
                </template>
                <template v-else>
                  <td class="text-center red--text" colspan="2">{{ $t("Extra.到達不可") }}</td>
                </template>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
    </div>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
    <v-dialog v-model="itemListDialog" transition="scroll-x-transition" :width="itemDialogWidth">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeDialog" :handle-change-width="changeWidth" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.all-container {
  padding: 1rem;
}
@media (min-width: 680px) {
}

.input-container {
  width: 360px;
}
.status-input-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 1rem;
}
</style>

<style>
.result-container .v-data-table {
  background-color: unset !important;
}
.result-container .v-data-table.v-data-table--fixed-header thead th {
  background-color: #eee !important;
}
.theme--dark .result-container .v-data-table.v-data-table--fixed-header thead th {
  background-color: rgb(36, 36, 38) !important;
}
.deep-sea .theme--dark .result-container .v-data-table.v-data-table--fixed-header thead th {
  background-color: rgb(36, 42, 53) !important;
}
.result-container .v-data-table tbody tr:hover {
  background-color: rgba(128, 128, 128, 0.1) !important;
}
.result-container .v-data-table tbody tr.ok {
  background-color: rgba(0, 255, 64, 0.075);
}
.result-container .v-data-table tbody tr.ok:hover {
  background-color: rgba(0, 255, 64, 0.15) !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipInput from '@/components/fleet/ShipInput.vue';
import ShipList, { ViewShip } from '@/components/fleet/ShipList.vue';
import ItemList from '@/components/item/ItemList.vue';
import Ship, { ShipBuilder } from '@/classes/fleet/ship';
import Fleet from '@/classes/fleet/fleet';
import Item from '@/classes/item/item';
import SiteSetting from '@/classes/siteSetting';
import Const from '@/classes/const';
import ShipValidation from '@/classes/fleet/shipValidation';

export default Vue.extend({
  name: 'RequiredAswCalculator',
  components: { ShipInput, ShipList, ItemList },
  data: () => ({
    fleet: new Fleet(),
    shipListDialog: false,
    itemListDialog: false,
    itemDialogTargetIndex: 0,
    itemDialogWidth: 1200,
    shipDialogWidth: 1200,
    level: 1,
    improveAsw: 0,
    minAsw: 0,
    maxAsw: 0,
    results: [] as { targetAsw: number; missingAsw: number; requiredLevel: number; requiredExp: number }[],
  }),
  mounted() {
    for (let i = 0; i < 7; i += 1) {
      this.results.push({
        targetAsw: 0,
        missingAsw: 0,
        requiredLevel: 0,
        requiredExp: 0,
      });
    }

    this.results[0].targetAsw = 100;
    this.results[1].targetAsw = 85;
    this.results[2].targetAsw = 70;
    this.results[3].targetAsw = 65;
    this.results[4].targetAsw = 60;
    this.results[5].targetAsw = 50;
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    ship(): Ship {
      return this.fleet.ships[0];
    },
    baseAsw(): number {
      return this.ship.asw - this.improveAsw;
    },
  },
  watch: {
    fleet() {
      this.calculate();
    },
  },
  methods: {
    statusChanged() {
      const asw = Ship.getStatusFromLevel(this.level, this.ship.data.maxAsw, this.ship.data.minAsw);
      this.level = Math.max(Math.min(175, this.level), 1);
      this.fleet = new Fleet({ ships: [new Ship({ ship: this.fleet.ships[0], level: this.level, asw: asw + this.improveAsw })] });
    },
    updateShip() {
      this.fleet = new Fleet({ ships: [new Ship({ ship: this.fleet.ships[0] })] });
      this.level = this.ship.level;
      this.improveAsw = this.ship.improveAsw;
    },
    async showShipList() {
      await (this.shipListDialog = true);
      (this.$refs.shipList as InstanceType<typeof ShipList>).initialize();
    },
    async showItemList(fleetIndex: number, slotIndex: number) {
      this.itemDialogTargetIndex = slotIndex;
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(this.ship, slotIndex);
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
    putShip(viewShip: ViewShip) {
      const { ship } = viewShip;
      this.shipListDialog = false;
      // もともとここに配備されていた艦娘の装備情報を抜き取る
      const oldShip = this.ship;
      const oldItems: Item[] = oldShip.items.concat();
      const newItems: Item[] = [];

      for (let slotIndex = 0; slotIndex < ship.slotCount; slotIndex += 1) {
        const slot = ship.slots[slotIndex] > 0 ? ship.slots[slotIndex] : 0;
        if (slotIndex < oldItems.length) {
          const oldItem = oldItems[slotIndex];
          const itemMaster = oldItem.data;
          if (ShipValidation.isValidItem(ship, itemMaster, slotIndex)) {
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
      if (oldExItem.id && ShipValidation.isValidItem(ship, oldExItem, Const.EXPAND_SLOT_INDEX)) {
        exItem = new Item({ master: oldExItem, remodel: oldShip.exItem.remodel });
      } else {
        exItem = new Item();
      }

      // 元々いた艦娘を置き換える
      const newShip = new Ship({
        master: ship,
        items: newItems,
        exItem,
        isActive: oldShip.isActive,
        hp: viewShip.hp,
        level: viewShip.level,
        luck: viewShip.luck,
        asw: viewShip.asw + Ship.getStatusFromLevel(viewShip.level, ship.maxAsw, ship.minAsw),
        area: viewShip.area,
      });

      this.fleet = new Fleet({ ships: [newShip] });
      this.level = newShip.level;
      this.improveAsw = newShip.improveAsw;
      this.minAsw = newShip.data.minAsw;
      this.maxAsw = newShip.data.maxAsw;
    },
    equipItem(item: Item) {
      const master = item.data;
      this.itemListDialog = false;
      const slotIndex = this.itemDialogTargetIndex;
      const { ship } = this;
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
        if (item.data.apiTypeId === 41 && ship.data.type2 === 90) {
          // 日進 & 大型飛行艇
          items[slotIndex] = new Item({
            item: items[slotIndex],
            master,
            remodel: item.remodel,
            level,
            slot: 1,
          });
        } else {
          // 装備を置き換え
          items[slotIndex] = new Item({
            item: items[slotIndex],
            master,
            remodel: item.remodel,
            level,
          });
        }
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

      this.fleet = new Fleet({ ships: [newShip] });
    },
    removeShip() {
      this.fleet = new Fleet();
    },
    calculate() {
      const results = this.results.concat();
      for (let index = 0; index < results.length; index += 1) {
        const result = results[index];

        result.targetAsw = Math.max(Math.min(result.targetAsw, 200), 0);

        const currentAsw = this.ship.asw - this.improveAsw;
        result.missingAsw = Math.max(result.targetAsw - this.ship.displayStatus.asw, 0);
        result.requiredLevel = 0;
        result.requiredExp = 0;

        if (!result.missingAsw || !result.targetAsw || !this.ship.data.id) {
          continue;
        }

        for (let level = this.level + 1; level <= 999; level += 1) {
          const prevLevelInfo = Const.LEVEL_BORDERS.find((v) => v.lv === level - 1);
          const levelInfo = Const.LEVEL_BORDERS.find((v) => v.lv === level);
          if (levelInfo) {
            result.requiredExp += levelInfo.req - (prevLevelInfo ? prevLevelInfo.req : 0);
          }

          const asw = Ship.getStatusFromLevel(level, this.maxAsw, this.minAsw);
          if (asw - currentAsw >= result.missingAsw) {
            result.requiredLevel = level;
            break;
          }
        }
      }

      this.results = results;
    },
  },
});
</script>
