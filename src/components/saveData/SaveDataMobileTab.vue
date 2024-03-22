<template>
  <div>
    <v-divider class="mb-1"></v-divider>
    <div class="save-data-items" v-if="!reload">
      <div class="save-data-item pa-0 new-item">
        <v-btn block @click.stop="addNewFile()" plain text>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
      <div
        class="save-data-item"
        v-for="(saveData, i) in viewData"
        :id="saveData.id"
        :key="i"
        :class="{ active: saveData.isMain }"
        @click="clickSaveData(saveData)"
        @keypress.enter="clickSaveData(saveData)"
        @keypress.delete="handleCloseTab(saveData)"
      >
        <v-icon v-if="saveData.isUnsaved" small>mdi-file-question</v-icon>
        <v-icon v-else color="green lighten-3" small>mdi-file</v-icon>
        <div class="save-data-name text-truncate">{{ saveData.name }}</div>
        <v-btn icon @click.stop="showNameEditDialog(saveData)" small v-if="!saveData.isUnsaved">
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
        <div class="btn-close">
          <v-btn icon @click.stop="handleCloseTab(saveData, $event)" small>
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
      <v-expansion-panels class="pa-0 mt-3" v-if="externalData.length">
        <v-expansion-panel>
          <v-expansion-panel-header class="px-4 py-1">
            <div class="d-flex align-center">
              <v-icon color="yellow lighten-1" small>{{ showExternals ? "mdi-folder-open" : "mdi-folder" }}</v-icon>
              <div>{{ $t("Common.外部データ") }} ( {{ externalData.length }} )</div>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content class="px-0">
            <div class="save-data-items">
              <div
                v-for="(saveData, i) in externalData"
                :key="`ex_${i}`"
                class="save-data-item"
                :class="{ active: saveData.isMain }"
                @click="clickSaveData(saveData)"
                @keypress.enter="clickSaveData(saveData)"
                @keypress.delete="handleCloseTab(saveData)"
              >
                <v-icon small>mdi-file-import</v-icon>
                <div class="save-data-name text-truncate">{{ $t("Common.外部データ") }} {{ i + 1 }}</div>
                <div class="ml-auto caption font-weight-bold">{{ externalWorlds[i] }}</div>
                <v-btn icon @click.stop="handleCloseTab(saveData, $event)" small>
                  <v-icon small>mdi-close</v-icon>
                </v-btn>
              </div>
              <div>
                <v-btn block outlined color="warning" small @click.stop="closeExternalConfirmDialog = true">
                  {{ $t("Common.削除") }}
                </v-btn>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
    <v-dialog v-model="deleteConfirmDialog" transition="scroll-x-transition" width="580">
      <v-card class="py-3 px-4">
        <div class="body-2 mt-4">{{ $t("SaveData.未保存の変更内容がありますが、このまま編成タブを閉じますか？") }}</div>
        <div class="caption mt-2">{{ $t("SaveData.変更内容を破棄してタブを閉じる場合は、このままOKボタンを押してください。") }}</div>
        <v-divider class="mt-4" />
        <div>
          <v-checkbox v-model="disabledConfirm" :label="$t('SaveData.次回以降表示しない')" hide-details dense />
          <div class="caption ml-1">{{ $t("Home.この設定は、設定からいつでも変更できます。") }}</div>
        </div>
        <div class="d-flex mt-3">
          <v-btn class="ml-auto align-self-end" color="red" dark @click.stop="closeTab(deleteConfirmData)">{{ $t("Common.OK") }}</v-btn>
          <v-btn class="ml-4 align-self-end" color="secondary" @click.stop="deleteConfirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="800">
      <v-card class="pa-3">
        <div class="mt-4">
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
            <div class="color-select-items">
              <div v-for="color in fileColors" :key="`color${color}`" class="my-1">
                <v-btn fab light x-small :color="color" @click="selectedColor = color">
                  <v-icon v-if="color === selectedColor">mdi-check-bold</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
          <div class="d-flex mt-3 align-center">
            <div class="text--secondary caption">{{ $t("Common.最終更新日時") }}</div>
            <div class="text--secondary caption ml-3">{{ lastModified }}</div>
            <v-btn class="ml-auto" color="success" @click.stop="commitName" :disabled="isNameEmpty || !editDialog">{{ $t("Common.更新") }}</v-btn>
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
.save-data-items {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 4px;
}
.save-data-item {
  opacity: 0.5;
  padding: 4px 6px;
  border: 2px solid rgba(128, 128, 128, 0.5);
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: 0.2s ease-out;
}
.save-data-item.active {
  opacity: 1;
  border-color: #1867c0;
}
.save-data-item.new-item {
  opacity: 1;
}
.save-data-name {
  margin-left: 4px;
  font-size: 12px;
  width: 1px;
  flex-grow: 1;
}

.color-select-items {
  margin-left: 6px;
  flex-grow: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
}
</style>

<script lang="ts">
import Vue from 'vue';
import SaveData from '@/classes/saveData/saveData';
import SiteSetting from '@/classes/siteSetting';
import Const from '@/classes/const';
import max from 'lodash/max';

export default Vue.extend({
  name: 'SaveDataMobileTab',
  props: {
    saveData: {
      type: SaveData,
      required: true,
    },
    handleClose: {
      type: Function,
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
      }

      this.handleClose();
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
