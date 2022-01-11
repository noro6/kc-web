<template>
  <div class="d-flex active-tab-list">
    <div
      class="tab-item"
      v-for="(saveData, i) in viewData"
      :key="i"
      :class="{ active: saveData.isMain }"
      @mousedown.middle="handleCloseTab(saveData, $event)"
      @click="clickSaveData(saveData)"
    >
      <div>
        <v-btn icon x-small @click.stop="showNameEditDialog(saveData)">
          <v-icon v-if="saveData.isUnsaved" small>mdi-file-question</v-icon>
          <v-icon v-else color="blue lighten-3" small>mdi-file</v-icon>
        </v-btn>
      </div>
      <div class="tab-item-name text-truncate">{{ saveData.name }}</div>
      <div class="ml-auto">
        <v-btn icon x-small @click.stop="handleCloseTab(saveData, $event)">
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="tab-add-button">
      <v-btn icon small @click.stop="addNewFile">
        <v-icon small>mdi-plus</v-icon>
      </v-btn>
    </div>
    <v-dialog v-model="deleteConfirmDialog" transition="scroll-x-transition" width="520">
      <v-card class="pa-3">
        <div class="ma-4">
          <div class="body-2">未保存の変更内容がありますが、このままこの編成タブを閉じますか？</div>
          <div class="mt-3 caption">
            戻って保存するには、画面上部の「<v-icon small>mdi-content-save</v-icon>編成保存」を押してください。
          </div>
          <div class="caption">変更内容を破棄してタブを閉じる場合は、このままOKボタンを押してください。</div>
          <v-divider class="mt-5"></v-divider>
          <div>
            <v-checkbox v-model="disabledConfirm" label="二度とこの画面を出さない" hide-details dense></v-checkbox>
          </div>
          <div class="caption mt-1 ml-1">設定（サイト最右上の<v-icon small>mdi-cog</v-icon>）からいつでも変更できます。</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="red" dark @click.stop="closeTab(deleteConfirmData)">閉じる</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="deleteConfirmDialog = false">戻る</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <v-text-field v-model="editedName" maxlength="100" counter label="編成データ名"></v-text-field>
          <div class="d-flex mt-3">
            <v-btn class="ml-auto" color="success" @click.stop="commitName" :disabled="isNameEmptry">更新</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.active-tab-list {
  font-size: 12px;
  width: 100%;
  height: 26px;
}
.tab-item {
  display: flex;
  cursor: pointer;
  flex: 1 1 auto;
  overflow: hidden;
  max-width: 200px;
  min-width: 60px;
  opacity: 0.6;
  transition: 0.2s;
  border-right: 1px solid rgb(64, 64, 64);
  border-left: 1px solid transparent;
}
.tab-item:hover {
  opacity: 0.8;
  background-color: rgba(128, 128, 128, 0.4);
}
.tab-item.active {
  background-color: rgb(64, 64, 64);
  border-left: 1px solid rgb(64, 64, 64);
  opacity: 1;
}
.tab-item > div {
  align-self: center;
}
.tab-item-name {
  margin-left: 0.25rem;
  flex-grow: 1;
  user-select: none;
}
.tab-add-button {
  opacity: 0.8;
  margin-left: 0.25rem;
  text-align: center;
  align-self: center;
}
</style>

<script lang="ts">
import Vue from 'vue';
import SaveData from '@/classes/saveData/saveData';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'SaveDataView',
  props: {
    saveData: {
      type: SaveData,
      required: true,
    },
    setting: {
      type: SiteSetting,
      required: true,
    },
  },
  data: () => ({
    deleteConfirmDialog: false,
    editDialog: false,
    editedName: '',
    editedFile: undefined as SaveData | undefined,
    deleteConfirmData: undefined as SaveData | undefined,
    disabledConfirm: false,
  }),
  computed: {
    viewData(): SaveData[] {
      let activeData: SaveData[] = [];
      const data = this.saveData.childItems;
      for (let i = 0; i < data.length; i += 1) {
        const actives = data[i].fetchActiveData();
        if (actives) {
          activeData = activeData.concat(actives);
        }
      }

      if (!activeData.length) {
        this.sendTopPage();
      }

      return activeData;
    },
    isNameEmptry(): boolean {
      return this.editedName.length <= 0;
    },
    mainData(): SaveData | undefined {
      return this.saveData.getMainData();
    },
  },
  methods: {
    sendTopPage(): void {
      if (this.$route.path === '/aircalc') {
        this.$router.push('/');
      }
    },
    showNameEditDialog(data: SaveData) {
      this.editedFile = data;
      this.editedName = data.name;
      this.editDialog = true;
    },
    handleCloseTab(data: SaveData, event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();

      if (this.setting.confirmCloseTab && data.temporaryData.length > 1) {
        this.deleteConfirmDialog = true;
        this.deleteConfirmData = data;
        return;
      }

      this.closeTab(data);
    },
    closeTab(data: SaveData | undefined) {
      if (!data) {
        return;
      }

      this.deleteConfirmDialog = false;
      this.deleteConfirmData = undefined;

      data.isActive = false;
      // 履歴を吹き飛ばす
      data.temporaryData = [];
      data.temporaryIndex = -1;

      if (data.isMain) {
        // メイン計算処理を他のデータに移譲
        const actives = this.saveData.fetchActiveData();
        if (actives.length) {
          actives[0].isMain = true;
          this.$store.dispatch('setMainSaveData', actives[0]);
        }
      }

      // 非保存データなら消し飛ばす
      if (data.isUnsaved) {
        const index = this.saveData.childItems.findIndex((v) => v === data);
        if (index) {
          this.saveData.childItems = this.saveData.childItems.filter((v, i) => i !== index);
        }
      }

      // 設定書き換え
      if (this.disabledConfirm && this.setting.confirmCloseTab) {
        this.setting.confirmCloseTab = false;
      }
    },
    commitName() {
      if (this.editedFile) {
        this.editedFile.name = this.editedName;
        this.editedFile = undefined;
      }
      this.editDialog = false;
    },
    clickSaveData(data: SaveData) {
      // 他の全ての計算状態を解除
      this.saveData.disabledMain();
      // 自身を計算状態に変更
      data.isMain = true;
      this.$store.dispatch('setMainSaveData', data);
      if (!this.$route.path.endsWith('/aircalc')) {
        this.$router.push('aircalc');
      }
    },
    addNewFile() {
      // 新規データタブ追加
      const data = new SaveData();
      data.name = `新規データ${this.saveData.childItems.length}`;
      data.isActive = true;
      // 追加先はルート直下
      this.saveData.childItems.push(data);

      this.clickSaveData(data);
    },
  },
});
</script>
