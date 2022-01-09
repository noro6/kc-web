<template>
  <v-sheet drak>
    <div class="d-flex pa-1">
      <div class="align-self-center">制空権シミュレータ</div>
      <div class="ml-1 align-self-center">v2.0.0</div>
      <div class="ml-auto btn-icons">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="addNewFile" v-bind="attrs" v-on="on">
              <v-icon color="blue lighten-3">mdi-file-plus</v-icon>
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
    <div
      class="item-container"
      @dragover.prevent
      @drop.stop="dropItem($event)"
      @dragleave.stop="dragLeave($event)"
      @dragenter.stop="dragEnter($event)"
    >
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
  data: () => ({
    saveData: new SaveData('ルート', true),
  }),
  mounted() {
    const data = new SaveData(`編成: ${Math.floor(Math.random() * 10000)}`);
    this.saveData.childItems = [data];
  },
  methods: {
    addNewFile() {
      // 新規データ
      const folder = new SaveData(`編成: ${Math.floor(Math.random() * 10000)}`);
      this.addNewSaveData(folder);
    },
    addNewDirectory() {
      // 新規データ
      const folder = new SaveData(`フォルダー: ${Math.floor(Math.random() * 10000)}`, true);
      this.addNewSaveData(folder);
    },
    addNewSaveData(saveData: SaveData) {
      const data = this.saveData.childItems;
      for (let i = 0; i < data.length; i += 1) {
        if (data[i].addNewFileToSelectedData(saveData)) {
          return;
        }
      }

      // 最後まで見つからなければルートに追加
      this.saveData.childItems.push(saveData);
    },
    clearSelectionAll() {
      const data = this.saveData.childItems;
      for (let i = 0; i < data.length; i += 1) {
        data[i].clearSelection();
      }
    },
    closeAllDirectory() {
      const data = this.saveData.childItems;
      for (let i = 0; i < data.length; i += 1) {
        data[i].closeDirectory();
      }
    },
    deleteChild(index: number) {
      this.saveData.childItems = this.saveData.childItems.filter((v, i) => i !== index);
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.backgroundColor = '';
    },
    dragEnter(e: DragEvent): void {
      const draggingDiv = document.getElementById('dragging-item');
      const target = e.target as HTMLDivElement;
      if (!draggingDiv || !target) {
        return;
      }
      // 受け入れ可能 背景色を青っぽく
      target.style.backgroundColor = 'rgba(20, 160, 255, 0.2)';
    },
    dropItem(e: DragEvent) {
      // 受け渡されたデータ
      const draggingDiv = document.getElementById('dragging-item');
      // そもそもドラッグ開始が正常になされているか
      if (!draggingDiv) {
        return;
      }

      // ドロップされる要素
      const target = e.target as HTMLDivElement;
      target.style.backgroundColor = '';
      if (target.id) {
        // 自身へのドロップ禁止
        return;
      }

      const droppedData = (e.dataTransfer as DataTransfer).getData('text/plain');
      const saveData = JSON.parse(droppedData) as SaveData;

      if (!this.saveData.isDirectory) {
        return;
      }

      const moveData = new SaveData(saveData.name, saveData.isDirectory, saveData.childItems, saveData.saveData, saveData.isOpen);
      this.saveData.childItems.push(moveData);

      draggingDiv.classList.add('move-ok');
    },
  },
});
</script>
