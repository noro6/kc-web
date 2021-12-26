<template>
  <v-card class="mx-5 my-2 px-1 py-2 land-base-all">
    <div class="pa-2">敵艦隊</div>
    <v-divider></v-divider>
    <div class="d-flex ma-2" v-if="!isDefense">
      <div class="align-self-center">
        <v-btn color="primary">海域マップから一括入力</v-btn>
      </div>
      <v-spacer></v-spacer>
    </div>
    <div class="d-flex mx-2 mt-5" v-if="!isDefense">
      <div class="align-self-center" id="battle-count-select">
        <v-select dense v-model="battleCount" :items="items" label="戦闘回数" @input="setInfo"></v-select>
      </div>
    </div>
    <div class="d-flex flex-wrap" v-if="!isDefense">
      <enemy-fleet-component
        v-for="(i, index) in battleInfo.battleCount"
        :key="i"
        v-model="battleInfo.fleets[index]"
        :index="index"
        :handle-show-enemy-list="showEnemyList"
        :handle-show-item-list="showItemList"
        @input="setInfo"
      ></enemy-fleet-component>
    </div>
    <div class="d-flex flex-wrap" v-else>
      <enemy-fleet-component
        v-model="battleInfo.airRaidFleet"
        :index="0"
        :handle-show-enemy-list="showEnemyList"
        :handle-show-item-list="showItemList"
        @input="setInfo"
      ></enemy-fleet-component>
    </div>
    <v-dialog v-model="enemyListDialog" width="1200">
      <enemy-list :handle-decide-enemy="putEnemy" />
    </v-dialog>
    <v-dialog v-model="itemListDialog" width="1200">
      <item-list ref="itemList" :handle-equip-item="equipItem" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
#battle-count-select {
  width: 100px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyFleetComponent from '@/components/Enemy/EnemyFleet.vue';
import EnemyList from '@/components/Enemy/EnemyList.vue';
import ItemList from '@/components/Item/ItemList.vue';
import EnemyMaster from '@/classes/Enemy/EnemyMaster';
import BattleInfo, { BattleInfoBuilder } from '@/classes/Enemy/BattleInfo';
import ItemMaster from '@/classes/Item/ItemMaster';
import Enemy from '@/classes/Enemy/Enemy';
import Item, { ItemBuilder } from '@/classes/Item/Item';
import EnemyFleet, { EnemyFleetBuilder } from '@/classes/Enemy/EnemyFleet';

const BattleCountItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default Vue.extend({
  name: 'EnemyFleetAll',
  components: {
    EnemyFleetComponent,
    EnemyList,
    ItemList,
  },
  props: {
    value: {
      type: BattleInfo,
      required: true,
    },
    isDefense: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    battleCount: 1,
    items: BattleCountItems,
    enemyListDialog: false,
    itemListDialog: false,
    dialogTarget: [-1, -1],
  }),
  computed: {
    battleInfo(): BattleInfo {
      return this.value;
    },
  },
  methods: {
    setInfo() {
      const builder: BattleInfoBuilder = {
        info: this.battleInfo,
        fleets: this.battleInfo.fleets,
        airRaidFleet: this.battleInfo.airRaidFleet,
        battleCount: this.battleCount,
      };
      this.$emit('input', new BattleInfo(builder));
    },
    async showItemList(fleetIndex: number, enemyIndex: number) {
      this.dialogTarget = [fleetIndex, enemyIndex];
      const enemy = this.battleInfo.fleets[fleetIndex].enemies[enemyIndex];
      await (this.itemListDialog = true);
      this.itemListDialog = true;
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(enemy);
    },
    showEnemyList(battle: number, index: number) {
      this.dialogTarget = [battle, index];
      this.enemyListDialog = true;
    },
    putEnemy(enemy: EnemyMaster) {
      this.enemyListDialog = false;
      const fleetIndex = this.dialogTarget[0];
      const index = this.dialogTarget[1];
      const fleet = this.isDefense ? this.battleInfo.airRaidFleet : this.battleInfo.fleets[fleetIndex];

      // 装備マスタより装備を解決
      const allItems = this.$store.state.items as ItemMaster[];
      const items: Item[] = [];

      // スロット数が機能していないので、有効装備の数も考慮する
      const slotCount = Math.max(enemy.items.filter((v) => v > 0).length, enemy.slotCount);
      for (let i = 0; i < slotCount; i += 1) {
        const item = allItems.find((v) => v.id === enemy.items[i]);
        if (item) {
          const slot = enemy.slots[i] > 0 ? enemy.slots[i] : 0;
          const builder: ItemBuilder = { master: item, slot };
          // 装備をセット
          items.push(new Item(builder));
        } else {
          items.push(new Item());
        }
      }
      // 6隻目以降なら連合随伴とする
      const isEscort = fleet.isUnion && index >= 6;
      const enemies = fleet.enemies.concat();
      enemies[index] = new Enemy(enemy, items, isEscort);
      const builder: EnemyFleetBuilder = { fleet, enemies };

      // 敵編成が更新されたため、敵艦隊を再インスタンス化し更新
      if (this.isDefense) {
        // 空襲モード時は直で更新かけに行く(setInfoメソッドに頼らない)
        this.$emit('input', new BattleInfo({ info: this.battleInfo, airRaidFleet: new EnemyFleet(builder) }));
      } else {
        this.battleInfo.fleets[fleetIndex] = new EnemyFleet(builder);
        this.setInfo();
      }
    },
    equipItem(item: ItemMaster) {
      console.log(item);
    },
  },
});
</script>
