<template>
  <v-card class="my-2 px-1 py-2">
    <div class="d-flex pb-2 pt-1 flex-wrap">
      <div class="pl-2 align-self-center">{{ $t('EnemyEdit.敵艦編集') }}</div>
      <v-spacer></v-spacer>
    </div>
    <v-divider></v-divider>
    <div class="px-2 mt-3 mb-1">
      <v-alert border="left" outlined type="error" class="my-2 body-2">
       {{ $t('EnemyEdit.本機能は計算結果に大きな影響を及ぼすため、理解できる方のみ利用してください。') }}
      </v-alert>
      <div class="body-2">{{ $t('EnemyEdit.指定した敵艦の装備や搭載数を自由に変更できます。') }}</div>
      <div class="body-2">{{ $t('EnemyEdit.設定内容はお使いのブラウザでのみ有効で、各種共有機能等による共有は行いません。') }}</div>
      <div class="my-3">
        <v-btn color="teal" dark @click="showEnemyList()">{{ $t('EnemyEdit.編集する敵艦を選択') }}</v-btn>
      </div>
      <div class="d-flex" v-if="manualEnemyRows.length">
        <div class="body-2">{{ $t('EnemyEdit.変更済み敵艦一覧') }}</div>
        <div class="header-divider"></div>
      </div>
      <div class="manual-enemies-container">
        <div
          v-for="(enemy, i) in manualEnemyRows"
          :key="i"
          class="enemy-list"
          v-ripple="{ class: 'info--text' }"
          @click="showEditedEnemy(i)"
        >
          <div class="enemy-header">
            <div>
              <div class="caption-2">
                <div class="primary--text mr-2">id:{{ enemy.data.id }}</div>
              </div>
              <div class="enemy-name">{{ enemy.data.name }}</div>
            </div>
            <div>
              <v-img :src="`./img/ship/${enemy.data.id}.png`" height="30" width="120"></v-img>
            </div>
            <div class="enemy-status">
              <div>{{ $t('Common.制空') }}</div>
              <div class="text-right">{{ enemy.fullAirPower }}</div>
              <div class="ml-1">{{ $t('Common.基地制空') }}</div>
              <div class="text-right">{{ enemy.fullLBAirPower }}</div>
            </div>
          </div>
          <div class="d-flex">
            <div class="caption">
              <div v-for="(item, j) in enemy.items" :key="`slot${j}`" class="d-flex">
                <div class="enemy-slot">{{ item.fullSlot >= 0 ? item.fullSlot : "-" }}</div>
                <div class="px-1">
                  <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="22" width="22"></v-img>
                </div>
                <div class="align-self-center text-truncate">{{ needTrans ? $t(`${item.data.name}`) : item.data.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-dialog v-model="enemyEditDialog" transition="scroll-x-transition" width="400">
      <v-card v-if="editingEnemy && editingEnemy.data.id">
        <div class="d-flex pt-2 pb-1 pr-2">
          <div class="align-self-center ml-3">{{ $t('EnemyEdit.敵艦編集') }}</div>
          <v-spacer></v-spacer>
          <v-btn icon @click="enemyEditDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="ma-3">
          <div class="body-2">{{ $t('EnemyEdit.装備、搭載数を設定してください。') }}</div>
          <div>
            <enemy-input :enemy="editingEnemy" :handle-show-item-list="showItemList" :readonly="false" @input="onChanged" />
          </div>
        </div>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="commitManualEnemy()">{{ $t('Common.適用') }}</v-btn>
          <v-btn color="error" @click="deleteManualEnemy()" :disabled="disabledDelete">{{ $t('Common.削除') }}</v-btn>
          <v-btn color="secondary" @click="resetEditingEnemy()">{{ $t('Common.既定値') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="enemyListDialog" transition="scroll-x-transition" width="1200">
      <enemy-list :handle-decide-enemy="putEnemy" :handleClose="closeEnemyList" />
    </v-dialog>
    <v-dialog v-model="itemListDialog" transition="scroll-x-transition" :width="itemDialogWidth">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeItemDialog" :handle-change-width="changeWidth" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.enemy-list {
  display: flex;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: 0.1s;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}
.enemy-list:hover {
  background-color: rgba(128, 200, 255, 0.05);
}
.enemy-list > div,
.enemy-list .d-flex > div {
  align-self: center;
}
.enemy-name {
  font-size: 0.8em;
  margin-left: 0.1rem;
  flex-grow: 1;
}
.enemy-slot {
  min-width: 24px;
  text-align: right;
}
.enemy-header {
  width: 160px;
}

.caption-2 {
  font-size: 0.7em;
}
.enemy-status {
  width: 120px;
  font-size: 0.7em;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.manual-enemies-container {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 1000px) {
  .manual-enemies-container {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import ItemList from '@/components/item/ItemList.vue';
import EnemyList from '@/components/enemy/EnemyList.vue';
import EnemyInput from '@/components/enemy/EnemyInput.vue';
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import ItemMaster from '@/classes/item/itemMaster';
import Item from '@/classes/item/item';
import SaveData from '@/classes/saveData/saveData';

export default Vue.extend({
  name: 'EditableEnemyList',
  components: {
    ItemList,
    EnemyList,
    EnemyInput,
  },
  data: () => ({
    items: [] as ItemMaster[],
    defaultEnemies: [] as EnemyMaster[],
    manualEnemies: [] as EnemyMaster[],
    editingEnemy: undefined as undefined | Enemy,
    enemyListDialog: false,
    enemyEditDialog: false,
    itemListDialog: false,
    itemDialogWidth: 1200,
    editingItemIndex: 0,
  }),
  mounted() {
    this.items = this.$store.state.items as ItemMaster[];
    this.defaultEnemies = this.$store.state.defaultEnemies as EnemyMaster[];
    const dbManualEnemies = this.$store.state.manualEnemies as EnemyMaster[];
    if (dbManualEnemies && dbManualEnemies.length) {
      this.manualEnemies = dbManualEnemies;
    }
  },
  computed: {
    needTrans(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    manualEnemyRows(): Enemy[] {
      const rows = [];
      const enemies = this.manualEnemies;
      for (let i = 0; i < enemies.length; i += 1) {
        const enemy = enemies[i];
        rows.push(Enemy.createEnemyFromMaster(enemy, false, this.items));
      }
      return rows;
    },
    disabledDelete(): boolean {
      const enemy = this.editingEnemy;
      if (enemy) {
        return !this.manualEnemies.some((v) => v.id === enemy.data.id);
      }
      return false;
    },
  },
  methods: {
    showEnemyList() {
      this.enemyListDialog = true;
    },
    putEnemy(enemy: EnemyMaster) {
      if (enemy && enemy.id) {
        this.editingEnemy = Enemy.createEnemyFromMaster(cloneDeep(enemy), false, this.items);
        this.enemyEditDialog = true;
      }
    },
    showEditedEnemy(index: number) {
      const dbManualEnemies = this.$store.state.manualEnemies as EnemyMaster[];
      const enemy = dbManualEnemies[index];
      if (enemy) {
        this.editingEnemy = Enemy.createEnemyFromMaster(enemy, false, this.items);
        this.enemyEditDialog = true;
      }
    },
    async showItemList(slotIndex: number) {
      const enemy = this.editingEnemy;
      if (enemy) {
        this.editingItemIndex = slotIndex;
        await (this.itemListDialog = true);
        (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(enemy, slotIndex);
      }
    },
    equipItem(item: Item) {
      const enemy = this.editingEnemy;
      if (!enemy) {
        return;
      }
      enemy.items[this.editingItemIndex] = new Item({ item, level: 0 });
      this.editingEnemy = new Enemy(enemy.data, enemy.items);
      this.itemListDialog = false;
    },
    onChanged() {
      const enemy = this.editingEnemy;
      if (!enemy) {
        return;
      }
      this.editingEnemy = new Enemy(enemy.data, enemy.items);
    },
    resetEditingEnemy() {
      // サーバー値にリセット
      const enemy = this.editingEnemy;
      if (!enemy) {
        return;
      }
      const master = this.defaultEnemies.find((v) => v.id === enemy.data.id);
      if (master) {
        this.editingEnemy = Enemy.createEnemyFromMaster(cloneDeep(master), false, this.items);
      }
    },
    commitManualEnemy() {
      // 手動敵艦を削除
      const newManualEnemies = this.manualEnemies.concat();
      // 現在選択の敵艦データを挿入
      if (this.editingEnemy) {
        const newEnemy = this.editingEnemy.data;
        // 搭載と装備を更新
        newEnemy.slots = this.editingEnemy.items.map((v) => v.fullSlot);
        newEnemy.items = this.editingEnemy.items.map((v) => v.data.id);

        // 更新か追加か
        const index = newManualEnemies.findIndex((v) => v.id === newEnemy.id);
        if (index >= 0) {
          newManualEnemies[index] = newEnemy;
        } else {
          newManualEnemies.push(newEnemy);
        }
        this.$store.dispatch('updateManualEnemies', newManualEnemies);
        this.updatedEnemy(newEnemy);

        this.manualEnemies = newManualEnemies;
        this.enemyEditDialog = false;
      }
    },
    deleteManualEnemy() {
      // 手動敵艦を削除
      let newManualEnemies = this.manualEnemies.concat();
      // 現在選択のidを削除
      if (this.editingEnemy) {
        const { id } = this.editingEnemy.data;
        newManualEnemies = newManualEnemies.filter((v) => v.id !== id);
        this.$store.dispatch('updateManualEnemies', newManualEnemies);

        const defaultEnemies = this.defaultEnemies.find((v) => v.id === id);
        if (defaultEnemies) {
          this.updatedEnemy(defaultEnemies);
        }

        this.manualEnemies = newManualEnemies;
        this.enemyEditDialog = false;
      }
    },
    closeEnemyList() {
      this.enemyListDialog = false;
    },
    closeItemDialog() {
      this.itemListDialog = false;
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
    updatedEnemy(enemy: EnemyMaster) {
      // セーブデータルート取得
      const saveData = this.$store.state.saveData as SaveData;
      if (!saveData) {
        return;
      }
      const activeData = saveData.fetchActiveData();
      for (let i = 0; i < activeData.length; i += 1) {
        // 全履歴内の該当敵艦を置き換えて再計算
        activeData[i].updateEnemyMasterInCalcData(enemy, this.items);
      }
      const mainSaveData = saveData.getMainData();
      if (mainSaveData) {
        // 計算開始
        this.$store.dispatch('setMainSaveData', mainSaveData);
      } else {
        this.$router.push('/');
      }
    },
  },
});
</script>
