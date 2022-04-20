<template>
  <div class="active-tab-list">
    <draggable animation="150" class="d-flex" handle=".drag-tab-handle">
      <div
        class="tab-item"
        v-for="(saveData, i) in viewData"
        :key="i"
        :class="{ active: saveData.isMain }"
        @mousedown.middle="handleCloseTab(saveData, $event)"
        @click="clickSaveData(saveData)"
      >
        <div class="drag-tab-handle tab-item-icon">
          <v-icon v-if="saveData.isUnsaved" small>mdi-file-question</v-icon>
          <v-icon v-else color="green lighten-3" small>mdi-file</v-icon>
        </div>
        <v-tooltip bottom color="black" open-delay="300">
          <template v-slot:activator="{ on, attrs }">
            <div class="tab-item-name text-truncate" v-bind="attrs" v-on="on">{{ saveData.name }}</div>
          </template>
          <span>{{ saveData.name }}</span>
        </v-tooltip>
        <div class="ml-auto btn-close" :class="{ editted: saveData.isEditted && !saveData.isUnsaved }">
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
    </draggable>
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
            <v-checkbox v-model="disabledConfirm" label="次回以降表示しない" hide-details dense></v-checkbox>
          </div>
          <div class="caption mt-1 ml-1">設定（サイト最右上の<v-icon small>mdi-cog</v-icon>）からいつでも変更できます。</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="red" dark @click.stop="closeTab(deleteConfirmData)">続行</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="deleteConfirmDialog = false">戻る</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="800">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <v-text-field v-model.trim="editedName" dense outlined maxlength="100" counter label="編成データ名"></v-text-field>
          <v-textarea
            v-model.trim="editedRemarks"
            rows="10"
            outlined
            dense
            hide-details
            label="補足情報"
            class="remarks-input"
          ></v-textarea>
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
}
.tab-item {
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;
  max-width: 200px;
  min-width: 60px;
  opacity: 0.6;
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

.drag-tab-handle {
  cursor: move !important;
}
.tab-item-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 0.3rem;
  height: 28px;
}

.tab-item-name {
  margin-left: 0.25rem;
  flex-grow: 1;
  user-select: none;
}

.btn-close.editted {
  position: relative;
}
.btn-close.editted::before {
  content: "";
  position: absolute;
  background-color: #eee;
  border-radius: 50%;
  top: 5px;
  right: 5px;
  width: 10px;
  height: 10px;
  transition: 0.2s;
}
.btn-close.editted .v-icon {
  opacity: 0;
}
.btn-close.editted:hover::before {
  opacity: 0;
}
.btn-close.editted:hover .v-icon {
  opacity: 1;
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
import draggable from 'vuedraggable';
import SaveData from '@/classes/saveData/saveData';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'SaveDataView',
  components: { draggable },
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
    editedRemarks: '',
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
    showNameEditDialog(data: SaveData) {
      this.editedFile = data;
      this.editedName = data.name;
      this.editedRemarks = data.remarks;
      this.editDialog = true;
    },
    handleCloseTab(data: SaveData, event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();

      if (this.setting.confirmCloseTab && data.isEditted) {
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
      data.tempData = [];
      data.tempIndex = -1;

      if (data.isMain) {
        data.isMain = false;
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

      // 閉じたということでDB更新を促す
      this.$store.dispatch('updateSaveData', this.saveData);

      // もう何もタブがなかったらトップページに戻す
      if (!this.saveData.getMainData() && this.$route.path === '/aircalc') {
        this.$router.push('/');
      }
    },
    commitName() {
      if (this.editedFile) {
        this.editedFile.name = this.editedName;
        this.editedFile.remarks = this.editedRemarks;
        this.editedFile.editedDate = Date.now();
        this.editedFile = undefined;
      }
      this.editDialog = false;

      // DB更新を促す
      this.$store.dispatch('updateSaveData', this.saveData);
    },
    clickSaveData(data: SaveData) {
      if (!data.isMain) {
        // 他の全ての計算状態を解除
        this.saveData.disabledMain();
        // 自身を計算状態に変更
        data.isMain = true;
        this.$store.dispatch('setMainSaveData', data);
        if (!this.$route.path.endsWith('/aircalc')) {
          this.$router.push('aircalc');
        }
      } else {
        this.showNameEditDialog(data);
      }
    },
    addNewFile() {
      // 新規タブ追加
      const data = new SaveData();
      data.name = this.saveData.getNewSavedataName();
      data.isActive = true;
      // 追加先はルート直下
      this.saveData.childItems.push(data);

      this.clickSaveData(data);
    },
  },
});
</script>
