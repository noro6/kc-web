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
        <v-select dense v-model="battleCount" :items="items" label="戦闘回数" @input="setInfo"></v-select>
      </div>
    </div>
    <div class="d-flex flex-wrap">
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
import EnemyFleetComponent from '@/components/EnemyFleet.vue';
import EnemyList from '@/components/EnemyList.vue';
import ItemList from '@/components/ItemList.vue';
import EnemyMaster from '@/classes/EnemyMaster';
import BattleInfo from '@/classes/BattleInfo';
import ItemMaster from '@/classes/ItemMaster';
import Enemy from '@/classes/Enemy';
import Item, { ItemBuilder } from '@/classes/Item';
import EnemyFleet, { EnemyFleetBuilder } from '@/classes/EnemyFleet';

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
      this.$emit('input', new BattleInfo(this.battleInfo.fleets, this.battleCount));
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
      const fleet = this.battleInfo.fleets[fleetIndex];

      // 装備マスタより装備を解決
      const allItems = this.$store.state.items as ItemMaster[];
      const items: Item[] = [];
      for (let i = 0; i < enemy.slotCount; i += 1) {
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
      this.battleInfo.fleets[fleetIndex] = new EnemyFleet(builder);
      this.setInfo();
    },
    equipItem(item: ItemMaster) {
      console.log(item);
    },
  },
});
</script>
