<template>
  <v-card class="mx-5 my-2 px-1 py-2 land-base-all">
    <div class="pa-2">敵艦隊</div>
    <v-divider></v-divider>
    <div class="d-flex ma-2">
      <div class="align-self-center">
        <v-btn color="primary">海域マップから一括入力</v-btn>
      </div>
      <v-spacer></v-spacer>
    </div>
    <div class="d-flex mx-2 mt-5">
      <div class="align-self-center" id="battle-count-select">
        <v-select dense v-model="battleInfo.battleCount" :items="items" label="戦闘回数"></v-select>
      </div>
    </div>
    <div class="d-flex flex-wrap">
      <enemy-fleet
        v-for="(i, index) in battleInfo.battleCount"
        :key="i"
        :index="index"
        :fleet="battleInfo.fleets[index]"
        :handle-show-enemy-list="showEnemyList"
        :handle-show-item-list="showItemList"
      ></enemy-fleet>
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
.theme--dark.v-card {
  background-color: rgb(25, 25, 28);
}
#battle-count-select {
  width: 100px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyFleet from '@/components/EnemyFleet.vue';
import EnemyList from '@/components/EnemyList.vue';
import ItemList from '@/components/ItemList.vue';
import EnemyMaster from '@/classes/EnemyMaster';
import BattleInfo from '@/classes/BattleInfo';
import ItemMaster from '@/classes/ItemMaster';
import Const from '@/classes/Const';
import Enemy from '@/classes/Enemy';
import Item from '@/classes/Item';

const BattleCountItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default Vue.extend({
  name: 'EnemyFleetAll',
  components: {
    EnemyFleet,
    EnemyList,
    ItemList,
  },
  data: () => ({
    items: BattleCountItems,
    battleInfo: new BattleInfo(),
    enemyListDialog: false,
    itemListDialog: false,
    dialogTarget: [-1, -1],
  }),
  methods: {
    async showItemList(fleetIndex: number, index: number) {
      this.dialogTarget = [fleetIndex, index];
      await (this.itemListDialog = true);
      this.itemListDialog = true;
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(Const.PLANE_TYPES);
    },
    showEnemyList(battle: number, index: number) {
      this.dialogTarget = [battle, index];
      this.enemyListDialog = true;
    },
    putEnemy(enemy: EnemyMaster) {
      this.enemyListDialog = false;
      const battle = this.dialogTarget[0];
      const index = this.dialogTarget[1];

      const newEnemy = new Enemy(enemy);
      // 装備マスタより装備を解決
      const allItems = this.$store.state.items as ItemMaster[];
      for (let i = 0; i < newEnemy.data.slotCount; i += 1) {
        const item = allItems.find((v) => v.id === newEnemy.data.items[i]);
        if (item) {
          // 装備をセット
          newEnemy.items.push(new Item(item));
          // 搭載数もセット
          newEnemy.items[i].slot = newEnemy.data.slots[i] > 0 ? newEnemy.data.slots[i] : 0;
        } else {
          newEnemy.items.push(new Item());
        }
      }
      this.$set(this.battleInfo.fleets[battle].enemies, index, newEnemy);
    },
    equipItem(item: ItemMaster) {
      console.log(item);
    },
  },
});
</script>
