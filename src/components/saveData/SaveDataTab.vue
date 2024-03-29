<template>
  <div id="active-tab-list">
    <draggable animation="150" class="d-flex" handle=".drag-tab-handle" @end="sortEnd" v-if="!reload">
      <div
        class="tab-item"
        v-for="(saveData, i) in viewData"
        :id="saveData.id"
        :key="i"
        :class="{ active: saveData.isMain }"
        @click="clickSaveData(saveData)"
        @mousedown.middle="handleCloseTab(saveData, $event)"
        @keypress.enter="clickSaveData(saveData)"
        @keypress.delete="handleCloseTab(saveData)"
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
      <div
        v-if="externalData && externalData.length"
        class="tab-item cursor-pointer"
        :class="{ active: isExternalMain || showExternals }"
        :id="saveData.id"
        @click="showExternalMenu($event)"
        @keypress.enter="showExternalMenu($event)"
      >
        <div class="tab-item-icon">
          <v-icon color="yellow lighten-1" small>{{ showExternals ? "mdi-folder-open" : "mdi-folder" }}</v-icon>
        </div>
        <div class="tab-item-name text-truncate">{{ $t("Common.外部データ") }} ( {{ externalData.length }} )</div>
        <v-menu
          v-model="showExternals"
          absolute
          :position-x="externalsX"
          :position-y="externalsY"
          :close-on-content-click="false"
          dark
          transition="slide-y-transition"
        >
          <v-card>
            <div class="external-tabs">
              <div
                v-for="(saveData, i) in externalData"
                :key="`ex_${i}`"
                class="external-tab-item"
                :class="{ active: saveData.isMain }"
                @click="clickSaveData(saveData)"
                @mousedown.middle="handleCloseTab(saveData, $event)"
                @keypress.enter="clickSaveData(saveData)"
                @keypress.delete="handleCloseTab(saveData)"
              >
                <div class="tab-item-icon">
                  <v-icon small>mdi-file-import</v-icon>
                </div>
                <div class="tab-item-name text-truncate">{{ $t("Common.外部データ") }} {{ i + 1 }}</div>
                <div class="ml-auto caption font-weight-bold">{{ externalWorlds[i] }}</div>
                <div class="ml-1 btn-close" :class="{ edited: saveData.isEdited && !saveData.isUnsaved }">
                  <v-btn icon x-small @click.stop="handleCloseTab(saveData, $event)">
                    <v-icon small>mdi-close</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>
        </v-menu>
        <div class="ml-auto btn-close text--secondary align-self-center">
          <v-btn icon x-small @click.stop="closeExternalConfirmDialog = true">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="tab-add-button">
        <v-btn icon small @click.stop="addNewFile()">
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
        <v-divider class="mt-4" />
        <div class="d-flex mt-1">
          <div class="ml-4">
            <v-checkbox v-model="disabledConfirm" :label="$t('SaveData.次回以降表示しない')" hide-details dense />
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
            @keypress.enter="commitName"
            @focus="textFieldFocused"
            :disabled="!editDialog"
            ref="nameInput"
          />
          <v-textarea
            v-model.trim="editedRemarks"
            rows="10"
            outlined
            dense
            hide-details
            :label="$t('SaveData.補足情報')"
            class="remarks-input"
            @keydown="keydownHandler"
          />
          <div class="mt-4 d-flex" v-if="!editedIsUnsaved">
            <div class="align-self-center">
              <v-icon x-large :color="selectedColor">{{ editedIsDirectory ? "mdi-folder" : "mdi-file" }}</v-icon>
            </div>
            <div class="ml-1 flex-grow-1 d-flex justify-space-around">
              <div v-for="color in fileColors" :key="`color${color}`" class="my-1">
                <v-btn fab light x-small :color="color" @click="selectedColor = color">
                  <v-icon v-if="color === selectedColor">mdi-check-bold</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
          <div class="d-flex mt-3 align-center">
            <div class="text--secondary caption ml-auto">{{ $t("Common.最終更新日時") }}</div>
            <div class="text--secondary caption ml-3">{{ lastModified }}</div>
            <v-btn class="ml-6" color="success" @click.stop="commitName" :disabled="isNameEmpty || !editDialog">{{ $t("Common.更新") }}</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="closeExternalConfirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="ma-4 body-2">{{ $t("SaveData.外部データを全て削除します。よろしいですか？") }}</div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="red" dark @click.stop="handleCloseExternalAll($event)">{{ $t("Common.OK") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="closeExternalConfirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
#active-tab-list {
  font-size: 12px;
  width: 100%;
}
.tab-item,
.external-tab-item {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  overflow: hidden;
  max-width: 200px;
  min-width: 60px;
  opacity: 0.6;
  border-right: 1px solid rgb(64, 64, 64);
  border-left: 1px solid transparent;
}
.tab-item:hover,
.external-tab-item:hover {
  opacity: 0.8;
  background-color: rgba(128, 128, 128, 0.4);
}
.tab-item.active,
.external-tab-item.active {
  background-color: rgb(64, 64, 64);
  border-left: 1px solid rgb(64, 64, 64);
  opacity: 1;
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

.external-tabs {
  background-color: #0a0a0c !important;
  max-height: 50vh;
  overflow-y: auto;
}
.external-tab-item {
  width: 200px;
  opacity: 0.7;
  border-right-color: transparent;
  border-top: 1px solid rgb(64, 64, 64);
  font-size: 12px;
}
.external-tab-item.active {
  border-left: unset !important;
}
.cursor-pointer {
  cursor: pointer;
}
</style>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import SaveData from '@/classes/saveData/saveData';
import SiteSetting from '@/classes/siteSetting';
import Const from '@/classes/const';
import max from 'lodash/max';

export default Vue.extend({
  name: 'SaveDataTab',
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
    lastModified: '',
    editedFile: undefined as SaveData | undefined,
    deleteConfirmData: undefined as SaveData | undefined,
    disabledConfirm: false,
    fileColors: Const.FILE_COLORS,
    reload: false,
    showExternals: false,
    externalsX: 0,
    externalsY: 0,
    externalWorlds: [] as string[],
    closeExternalConfirmDialog: false,
  }),
  computed: {
    viewData(): SaveData[] {
      if (this.reload) {
        return [];
      }
      let activeData: SaveData[] = [];
      const data = this.saveData.childItems;
      for (let i = 0; i < data.length; i += 1) {
        const actives = data[i].fetchActiveData().filter((v) => !v.isUnsaved || v.name !== '外部データ');
        if (actives) {
          activeData = activeData.concat(actives);
        }
      }
      activeData.sort((a, b) => a.activeOrder - b.activeOrder);
      return activeData;
    },
    externalData(): SaveData[] {
      if (this.reload) {
        return [];
      }
      let activeData: SaveData[] = [];
      const data = this.saveData.childItems;
      for (let i = 0; i < data.length; i += 1) {
        const actives = data[i].fetchActiveData().filter((v) => v.isUnsaved && v.name === '外部データ');
        if (actives) {
          activeData = activeData.concat(actives);
        }
      }
      activeData.sort((a, b) => a.activeOrder - b.activeOrder);
      return activeData;
    },
    isExternalMain(): boolean {
      return this.externalData.some((v) => v.isMain);
    },
    isNameEmpty(): boolean {
      return this.editedName.length <= 0;
    },
    mainData(): SaveData | undefined {
      return this.saveData.getMainData();
    },
  },
  watch: {
    editDialog(value) {
      if (value) {
        setTimeout(() => {
          (this.$refs.nameInput as HTMLInputElement).focus();
        }, 150);
      }
    },
  },
  methods: {
    textFieldFocused(focusEvent: FocusEvent) {
      if (focusEvent) (focusEvent.target as HTMLInputElement).select();
    },
    sortEnd() {
      const base = document.getElementById('active-tab-list') as HTMLElement;
      const itemElements = base.getElementsByClassName('tab-item');

      for (let i = 0; i < this.viewData.length; i += 1) {
        const data = this.viewData[i];
        const targetElement = document.getElementById(data.id);
        if (targetElement) {
          const index = ([].slice.call(itemElements) as HTMLElement[]).indexOf(targetElement);
          data.activeOrder = index ?? 0;
        }
      }

      // インデックスが変更になったので
      this.$store.dispatch('updateSaveData', this.saveData);
      this.reload = true;
      this.$nextTick(() => {
        this.reload = false;
      });
    },
    showNameEditDialog(data: SaveData) {
      this.editedFile = data;
      this.editedName = data.name;
      if (data.isUnsaved && data.name === '外部データ') {
        this.editedName = '';
      }
      this.editedRemarks = data.remarks;
      this.editedIsUnsaved = data.isUnsaved;
      this.editedIsDirectory = data.isDirectory;
      this.selectedColor = data.color;
      this.lastModified = new Date(data.editedDate).toLocaleString(this.$vuetify.lang.current);
      this.editDialog = true;
    },
    handleCloseExternalAll(event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();

      // 外部データがメイン計算画面かどうか取得
      const isMain = this.externalData.some((v) => v.isMain);

      // 外部データのみ消し飛ばす
      this.saveData.childItems = this.saveData.childItems.filter((v) => v.name !== '外部データ' || !v.isUnsaved);

      if (isMain) {
        const actives = this.saveData.fetchActiveData();
        if (actives.length) {
          const nextData = actives[actives.length - 1];
          nextData.isMain = true;
          this.$store.dispatch('setMainSaveData', nextData);
        }
      }

      // 閉じたということでDB更新を促す
      this.$store.dispatch('updateSaveData', this.saveData);
      this.closeExternalConfirmDialog = false;

      // もう何もタブがなかったらトップページに戻す
      if (!this.saveData.getMainData() && this.$route.path === '/aircalc') {
        this.$router.push('/');
      }
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

      // 外部データ表示されているなら、海域情報の更新だけ
      if (this.showExternals) {
        this.setExternalWorlds();
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
    showExternalMenu(e: MouseEvent) {
      if (e && e.target && e.target instanceof HTMLElement && e.target.closest('.tab-item')) {
        const rect = (e.target.closest('.tab-item') as HTMLElement).getBoundingClientRect();
        this.externalsX = rect.left;
        this.externalsY = rect.bottom;

        this.setExternalWorlds();
        this.showExternals = true;
      }
    },
    setExternalWorlds() {
      // 海域の情報だけぶっこ抜く処理
      this.externalWorlds = [];

      for (let i = 0; i < this.externalData.length; i += 1) {
        const data = this.externalData[i];
        const area = data.getLastBattleArea();
        const world = Math.floor(area / 10);

        let areaText = '';
        if (area) {
          areaText = `#${world > 40 ? 'E' : world}-${area % 10}`;
        }

        this.externalWorlds.push(areaText);
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
      // 最大のソート番号を取得
      data.activeOrder = max(this.viewData.map((v) => v.activeOrder)) ?? 1;
      // 追加先はルート直下
      this.saveData.childItems.push(data);

      this.clickSaveData(data);
    },
    keydownHandler(event: KeyboardEvent) {
      if (event.ctrlKey && event.code === 'KeyS') {
        event.preventDefault();
        event.stopPropagation();
        this.commitName();
      }
    },
  },
});
</script>
