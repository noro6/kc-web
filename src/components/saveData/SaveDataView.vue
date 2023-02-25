<template>
  <v-sheet dark>
    <div class="d-flex header">
      <div v-if="!fixedDrawer">
        <v-btn icon large @click="handleClose()">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
      <div class="align-self-center">
        <v-btn class="github-button" text href="https://github.com/noro6/kc-web/" target="_blank">
          <v-icon>mdi-github</v-icon>
          <span class="mx-1">{{ $t("Common.制空権シミュレータ") }}</span>
          <span class="caption">v{{ $store.state.siteVersion }}</span>
        </v-btn>
      </div>
      <div class="ml-auto btn-icons">
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="addNewFile" v-bind="attrs" v-on="on">
              <v-icon color="blue lighten-3">mdi-note-plus</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("SaveData.新しい編成を作成") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="showDirectoryNameEditDialog" v-bind="attrs" v-on="on">
              <v-icon color="yellow lighten-1">mdi-folder-plus</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("SaveData.新しいフォルダーを作成") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="openAllDirectory" v-bind="attrs" v-on="on">
              <v-icon color="orange lighten-3">mdi-expand-all</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("SaveData.フォルダーを全て開く") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="closeAllDirectory" v-bind="attrs" v-on="on">
              <v-icon color="grey">mdi-collapse-all</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("SaveData.フォルダーを全て閉じる") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="grey lighten-2" v-show="enabledFixDrawer" icon small @click="toggleFixDrawer()" v-bind="attrs" v-on="on">
              <v-icon v-if="fixedDrawer">mdi-pin</v-icon>
              <v-icon v-else>mdi-pin-outline</v-icon>
            </v-btn>
          </template>
          <span v-if="!fixedDrawer">{{ $t("SaveData.サイドバー固定") }}</span>
          <span v-else>{{ $t("SaveData.サイドバー固定解除") }}</span>
        </v-tooltip>
      </div>
    </div>
    <v-divider></v-divider>
    <div class="item-container">
      <save-item v-for="(item, i) in rootData.childItems" :key="i" :value="item" :index="i" :handle-delete="deleteChild" :parent-directory="rootData" />
    </div>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="500">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <v-text-field
            v-model.trim="editedName"
            dense
            outlined
            maxlength="100"
            counter
            :label="$t('SaveData.フォルダー名')"
            @keydown.enter="addNewDirectory"
            :disabled="!editDialog"
          ></v-text-field>
          <div class="d-flex mt-3">
            <v-btn class="ml-auto" color="success" @click.stop="addNewDirectory" :disabled="isNameEmpty || !editDialog">{{ $t("Common.更新") }}</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<style scoped>
.v-sheet {
  height: 100%;
  font-size: 0.8em;
  display: flex;
  flex-flow: column;
}
.header {
  padding: 2px 2px 2px 0;
}
.btn-icons {
  align-self: center;
}

.btn-icons .v-icon {
  font-size: 20px !important;
}
.item-container {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.github-button {
  font-size: 0.9em;
  padding-left: 2px !important;
  padding-right: 6px !important;
  height: 44px !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import SaveData from '@/classes/saveData/saveData';
import SiteSetting from '@/classes/siteSetting';
import SaveItem from './SaveItem.vue';

export default Vue.extend({
  components: { SaveItem },
  name: 'SaveDataView',
  props: {
    rootData: {
      type: SaveData,
      required: true,
    },
    handleInform: {
      type: Function,
      required: true,
    },
    enabledFixDrawer: {
      type: Boolean,
      default: false,
    },
    fixedDrawer: {
      type: Boolean,
      default: false,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    editDialog: false,
    editedName: '',
  }),
  computed: {
    isNameEmpty(): boolean {
      return this.editedName.length <= 0;
    },
  },
  methods: {
    addNewFile() {
      // 新規データ
      const data = new SaveData();
      data.name = `${this.$t('SaveData.新規データ')}`;
      data.isUnsaved = false;
      this.addNewSaveData(data);
    },
    showDirectoryNameEditDialog() {
      this.editedName = `${this.$t('SaveData.新しいフォルダー')}`;
      this.editDialog = true;
    },
    addNewDirectory() {
      if (this.isNameEmpty) {
        return;
      }
      this.editDialog = false;

      // 新規フォルダー
      const folder = new SaveData();
      folder.name = this.editedName;
      folder.isDirectory = true;
      folder.isUnsaved = false;
      folder.color = 'yellow lighten-1';
      folder.order = 999999;
      this.addNewSaveData(folder);
      this.handleInform('新しいフォルダーを作成しました。');

      this.editedName = '';
    },
    addNewSaveData(saveData: SaveData) {
      saveData.order = 999999;
      const data = this.rootData.childItems;
      for (let i = 0; i < data.length; i += 1) {
        if (data[i].addNewFileToSelectedData(saveData)) {
          // セーブデータの更新を通知
          this.$store.dispatch('updateSaveData', this.rootData);
          this.handleInform(`新しい${saveData.isDirectory ? 'フォルダー' : '編成'}を作成しました。`);
          return;
        }
      }

      // 最後まで選択状態ファイルが見つからなければ、保存されたデータの直下いき
      const folder = this.rootData.childItems.find((v) => v.isDirectory);
      if (folder) {
        if (!saveData.isDirectory) {
          saveData.name = folder.getNewSaveDataName();
          saveData.name = saveData.name.replace('新規データ', `${this.$t('SaveData.新規データ')} `);
        }
        folder.isOpen = true;
        folder.childItems.push(saveData);
        folder.sortChild();
        // セーブデータの更新を通知
        this.$store.dispatch('updateSaveData', this.rootData);
        this.handleInform(`新しい${saveData.isDirectory ? 'フォルダー' : '編成'}を作成しました。`);
      }
    },
    openAllDirectory() {
      this.rootData.openDirectory();
    },
    closeAllDirectory() {
      this.rootData.closeDirectory();
    },
    deleteChild(index: number) {
      this.rootData.childItems = this.rootData.childItems.filter((v, i) => i !== index);
      this.handleInform('削除が完了しました。');
      // セーブデータの更新を通知
      this.$store.dispatch('updateSaveData', this.rootData);
    },
    openGitHub() {
      window.open('https://github.com/noro6/kc-web/', '_blank');
    },
    toggleFixDrawer() {
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.fixedDrawer = !setting.fixedDrawer;
      this.$store.dispatch('updateSetting', setting);
    },
  },
});
</script>
