<template>
  <v-card class="my-2 px-1 py-2">
    <div class="d-flex pb-1">
      <div class="pl-2 align-self-center">敵艦隊</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="resetFleetAll">
        <v-icon>mdi-trash-can-outline</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="d-flex mx-2 mt-3 mb-2" v-if="!isDefense">
      <div class="align-self-center">
        <v-btn color="primary" @click.stop="showWorldListContinuous">海域マップから一括入力</v-btn>
      </div>
      <div class="align-self-center ml-3" v-show="battleCount > 1">
        <v-btn outlined color="success" @click.stop="targetDialog = true">基地派遣先設定</v-btn>
      </div>
      <div class="align-self-center ml-4" id="battle-count-select">
        <v-select dense hide-details v-model="battleCount" :items="items" label="戦闘回数" @input="setInfo"></v-select>
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
        :handle-show-world-list="showWorldList"
        @input="setInfo"
      ></enemy-fleet-component>
    </div>
    <div class="d-flex flex-wrap" v-else>
      <enemy-fleet-component
        v-model="battleInfo.airRaidFleet"
        :index="0"
        :handle-show-enemy-list="showEnemyList"
        :handle-show-item-list="showItemList"
        :handle-show-world-list="showWorldList"
        @input="setInfo"
      ></enemy-fleet-component>
    </div>
    <v-dialog v-model="enemyListDialog" transition="scroll-x-transition" width="1200">
      <enemy-list :handle-decide-enemy="putEnemy" />
    </v-dialog>
    <v-dialog v-model="itemListDialog" :width="itemDialogWidth">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeItemList" :handle-change-width="changeWidth" />
    </v-dialog>
    <v-dialog v-model="worldListDialog" transition="scroll-x-transition" width="600" @input="toggleWorldList">
      <world-list ref="worldList" :handle-set-enemy="setEnemyFleet" :handleClose="closeWorldList" />
    </v-dialog>
    <v-dialog v-model="targetDialog" width="600" transition="scroll-x-transition" @input="toggleTargetDialog">
      <airbase-target v-model="airbaseInfo" :battleCount="battleInfo.battleCount" :handle-close="closeTargetDialog" />
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
import AirbaseTarget from '@/components/airbase/AirbaseTarget.vue';
import EnemyFleetComponent from '@/components/enemy/EnemyFleet.vue';
import EnemyList from '@/components/enemy/EnemyList.vue';
import WorldList from '@/components/map/WorldList.vue';
import ItemList from '@/components/item/ItemList.vue';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import BattleInfo, { BattleInfoBuilder } from '@/classes/enemy/battleInfo';
import AirbaseInfo from '@/classes/airbase/airbaseInfo';
import ItemMaster from '@/classes/item/itemMaster';
import Enemy from '@/classes/enemy/enemy';
import EnemyFleet, { EnemyFleetBuilder } from '@/classes/enemy/enemyFleet';

const BattleCountItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default Vue.extend({
  name: 'EnemyFleetAll',
  components: {
    EnemyFleetComponent,
    EnemyList,
    WorldList,
    ItemList,
    AirbaseTarget,
  },
  props: {
    value: {
      type: BattleInfo,
      required: true,
    },
    airbaseInfo: {
      type: AirbaseInfo,
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
    worldListDialog: false,
    targetDialog: false,
    dialogTarget: [-1, -1],
    fleetStock: [] as EnemyFleet[],
    itemDialogWidth: 1200,
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
      // 基地派遣先の整合性チェック
      const { airbases } = this.airbaseInfo;
      for (let i = 0; i < airbases.length; i += 1) {
        const targets = airbases[i].battleTarget;
        for (let j = 0; j < targets.length; j += 1) {
          const target = targets[j];
          if (target >= this.battleCount) {
            targets[j] = this.battleCount - 1;
          }
        }
      }
      this.$emit('input', new BattleInfo(builder));
    },
    async showItemList(fleetIndex: number, enemyIndex: number) {
      this.dialogTarget = [fleetIndex, enemyIndex];
      const enemy = this.battleInfo.fleets[fleetIndex].enemies[enemyIndex];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(enemy);
    },
    showEnemyList(battle: number, index: number) {
      this.dialogTarget = [battle, index];
      this.enemyListDialog = true;
    },
    async showWorldListContinuous() {
      this.fleetStock = [];
      await (this.worldListDialog = true);
      (this.$refs.worldList as InstanceType<typeof WorldList>).continuousMode = true;
    },
    async showWorldList(index: number) {
      this.fleetStock = [];
      this.dialogTarget = [index, 0];
      await (this.worldListDialog = true);
      (this.$refs.worldList as InstanceType<typeof WorldList>).continuousMode = false;
    },
    putEnemy(enemy: EnemyMaster) {
      this.enemyListDialog = false;
      const fleetIndex = this.dialogTarget[0];
      const index = this.dialogTarget[1];
      const fleet = this.isDefense ? this.battleInfo.airRaidFleet : this.battleInfo.fleets[fleetIndex];

      // 装備マスタより装備を解決
      const allItems = this.$store.state.items as ItemMaster[];
      // 6隻目以降なら連合随伴とする
      const isEscort = fleet.isUnion && index >= 6;
      const newEnemy = Enemy.createEnemyFromMaster(enemy, isEscort, allItems);
      const enemies = fleet.enemies.concat();
      enemies[index] = newEnemy;
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
    setEnemyFleet(fleet: EnemyFleet, isCoutinue = false) {
      if (isCoutinue) {
        this.fleetStock.push(fleet);
      } else if (this.isDefense) {
        // 空襲モード時は直で更新かけに行く(setInfoメソッドに頼らない)
        this.$emit('input', new BattleInfo({ info: this.battleInfo, airRaidFleet: fleet }));
      } else {
        const index = this.dialogTarget[0];
        this.battleInfo.fleets[index] = new EnemyFleet({ fleet });
        this.setInfo();
        this.worldListDialog = false;
      }
    },
    closeWorldList() {
      this.worldListDialog = false;
      this.toggleWorldList();
    },
    toggleWorldList() {
      if (!this.worldListDialog && this.fleetStock.length) {
        // 連続入力モード データがあればそれをそのまま登録(setInfoメソッドに頼らない)
        const builder: BattleInfoBuilder = {
          info: this.battleInfo,
          fleets: this.fleetStock,
          battleCount: this.fleetStock.length,
        };
        this.$emit('input', new BattleInfo(builder));
        this.battleCount = this.fleetStock.length;
      }
    },
    resetFleetAll() {
      this.battleCount = 1;
      this.battleInfo.fleets[0] = new EnemyFleet();
      this.setInfo();
    },
    toggleTargetDialog() {
      if (!this.targetDialog) {
        this.setInfo();
      }
    },
    closeTargetDialog() {
      this.targetDialog = false;
    },
    closeItemList() {
      this.itemListDialog = false;
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
  },
});
</script>
