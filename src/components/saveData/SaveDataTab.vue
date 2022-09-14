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
        <div class="ml-auto btn-close" :class="{ edited: saveData.isEdited && !saveData.isUnsaved }">
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
    <v-dialog v-model="deleteConfirmDialog" transition="scroll-x-transition" width="580">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <div class="body-2">{{ $t("SaveData.未保存の変更内容がありますが、このまま編成タブを閉じますか？") }}</div>
          <div class="mt-3 caption">
            {{ $t("SaveData.戻って保存するには、サイト上部の保存ボタンを押してください。") }}
          </div>
          <div class="caption">{{ $t("SaveData.変更内容を破棄してタブを閉じる場合は、このままOKボタンを押してください。") }}</div>
        </div>
        <v-divider class="mt-4"></v-divider>
        <div class="d-flex mt-1">
          <div class="ml-4">
            <v-checkbox v-model="disabledConfirm" :label="$t('SaveData.次回以降表示しない')" hide-details dense></v-checkbox>
            <div class="caption ml-1">{{ $t("Home.この設定は、設定からいつでも変更できます。") }}</div>
          </div>
          <v-btn class="ml-auto align-self-end" color="red" dark @click.stop="closeTab(deleteConfirmData)">{{ $t("Common.OK") }}</v-btn>
          <v-btn class="ml-4 align-self-end" color="secondary" @click.stop="deleteConfirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="800">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <v-text-field
            v-model.trim="editedName"
            dense
            outlined
            maxlength="100"
            counter
            :label="$t('SaveData.編成データ名')"
            @keyup.enter="commitName"
          ></v-text-field>
          <v-textarea v-model.trim="editedRemarks" rows="10" outlined dense hide-details :label="$t('SaveData.補足情報')" class="remarks-input"></v-textarea>
          <div class="mt-4 d-flex" v-if="!editedIsUnsaved">
            <div class="align-self-center">
              <v-icon x-large :color="selectedColor">{{ editedIsDirectory ? "mdi-folder" : "mdi-file" }}</v-icon>
            </div>
            <div class="ml-1 flex-grow-1 d-flex justify-space-around">
              <div v-for="color in fileColors" :key="`color${color}`" class="my-1">
                <v-btn fab light x-small :color="color" @click="selectedColor = color">
                  <v-icon v-if="color === selectedColor" >mdi-check-bold</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
          <div class="d-flex mt-3">
            <v-btn class="ml-auto" color="success" @click.stop="commitName" :disabled="isNameEmpty">{{ $t("Common.更新") }}</v-btn>
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

.btn-close.edited {
  position: relative;
}
.btn-close.edited::before {
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
.btn-close.edited .v-icon {
  opacity: 0;
}
.btn-close.edited:hover::before {
  opacity: 0;
}
.btn-close.edited:hover .v-icon {
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
import Const from '@/classes/const';

export default Vue.extend({
  name: 'SaveDataView',
  components: { draggable },
  props: {
    saveData: {
      type: SaveData,
      required: true,
    },
  },
  data: () => ({
    deleteConfirmDialog: false,
    editDialog: false,
    editedName: '',
    editedRemarks: '',
    editedIsUnsaved: false,
    editedIsDirectory: false,
    selectedColor: '',
    editedFile: undefined as SaveData | undefined,
    deleteConfirmData: undefined as SaveData | undefined,
    disabledConfirm: false,
    fileColors: Const.FILE_COLORS,
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
    isNameEmpty(): boolean {
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
      this.editedIsUnsaved = data.isUnsaved;
      this.editedIsDirectory = data.isDirectory;
      this.selectedColor = data.color;
      this.editDialog = true;
    },
    handleCloseTab(data: SaveData, event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();

      const setting = this.$store.state.siteSetting as SiteSetting;
      if (setting.confirmCloseTab && (data.isEdited || data.isUnsaved)) {
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
          const nextData = actives[actives.length - 1];
          nextData.isMain = true;
          this.$store.dispatch('setMainSaveData', nextData);
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
      const setting = this.$store.state.siteSetting as SiteSetting;
      if (this.disabledConfirm && setting.confirmCloseTab) {
        setting.confirmCloseTab = false;
        this.$store.dispatch('updateSetting', setting);
      }

      // 閉じたということでDB更新を促す
      this.$store.dispatch('updateSaveData', this.saveData);

      // もう何もタブがなかったらトップページに戻す
      if (!this.saveData.getMainData() && this.$route.path === '/aircalc') {
        this.$router.push('/');
      }
    },
    commitName() {
      if (this.isNameEmpty) {
        return;
      }
      if (this.editedFile) {
        this.editedFile.name = this.editedName;
        this.editedFile.remarks = this.editedRemarks;
        this.editedFile.color = this.selectedColor;
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
      data.name = this.saveData.getNewSaveDataName();
      if (this.$i18n.locale !== 'ja') {
        data.name = data.name.replace('新規データ', `${this.$t('SaveData.新規データ')} `);
      }
      data.isActive = true;
      // 追加先はルート直下
      this.saveData.childItems.push(data);

      this.clickSaveData(data);
    },
  },
});
</script>
