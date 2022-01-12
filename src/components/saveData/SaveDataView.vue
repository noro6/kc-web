<template>
  <v-sheet drak>
    <div class="d-flex pa-1">
      <div class="align-self-center">制空権シミュレータ</div>
      <div class="ml-1 align-self-center">v2.0.0</div>
      <div class="ml-auto btn-icons">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="addNewFile" v-bind="attrs" v-on="on">
              <v-icon color="blue lighten-3">mdi-note-plus</v-icon>
            </v-btn>
          </template>
          <span>新しい編成を作成</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="addNewDirectory" v-bind="attrs" v-on="on">
              <v-icon color="yellow lighten-1">mdi-folder-plus</v-icon>
            </v-btn>
          </template>
          <span>新しいフォルダーを作成</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="closeAllDirectory" v-bind="attrs" v-on="on">
              <v-icon color="light-blue lighten-4">mdi-collapse-all</v-icon>
            </v-btn>
          </template>
          <span>フォルダーを全て閉じる</span>
        </v-tooltip>
      </div>
    </div>
    <v-divider></v-divider>
    <div class="item-container">
      <save-item v-for="(item, i) in saveData.childItems" :key="i" :value="item" :index="i" :handle-delete="deleteChild" />
    </div>
  </v-sheet>
</template>

<style scoped>
.v-sheet {
  height: 100%;
  font-size: 0.8em;
  display: flex;
  flex-flow: column;
}
.btn-icons .v-icon {
  font-size: 20px !important;
}
.item-container {
  flex-grow: 1;
}
</style>

<script lang="ts">
import Vue from 'vue';
import SaveItem from './SaveItem.vue';
import SaveData from '@/classes/saveData/saveData';

export default Vue.extend({
  components: { SaveItem },
  name: 'SaveDataView',
  props: {
    saveData: {
      type: SaveData,
      required: true,
    },
  },
  methods: {
    addNewFile() {
      // 新規データ
      const data = new SaveData();
      data.name = '新規データ';
      data.isUnsaved = false;
      this.addNewSaveData(data);
    },
    addNewDirectory() {
      // 新規データ
      const folder = new SaveData();
      folder.name = `フォルダー: ${Math.floor(Math.random() * 10000)}`;
      folder.isDirectory = true;
      folder.isUnsaved = false;
      this.addNewSaveData(folder);
    },
    addNewSaveData(saveData: SaveData) {
      const data = this.saveData.childItems;
      for (let i = 0; i < data.length; i += 1) {
        if (data[i].addNewFileToSelectedData(saveData)) {
          return;
        }
      }

      // 最後まで選択状態ファイルが見つからなければ、保存されたデータの直下いき
      const folder = this.saveData.childItems.find((v) => v.isDirectory);
      if (folder) {
        if (!saveData.isDirectory) {
          saveData.name = `新規データ${folder.childItems.filter((v) => !v.isDirectory).length + 1}`;
        }
        folder.isOpen = true;
        folder.childItems.push(saveData);
        folder.childItems.sort((a, b) => a.name.localeCompare(b.name));
      }
    },
    clearSelectionAll() {
      this.saveData.clearSelection();
    },
    closeAllDirectory() {
      this.saveData.closeDirectory();
    },
    deleteChild(index: number) {
      this.saveData.childItems = this.saveData.childItems.filter((v, i) => i !== index);
    },
  },
});
</script>