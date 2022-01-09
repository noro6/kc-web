<template>
  <div
    draggable
    class="save-list"
    @dragover.prevent
    @drop.stop="dropItem($event)"
    @dragleave.stop="dragLeave($event)"
    @dragenter.stop="dragEnter($event)"
    @dragstart.stop="dragStart($event)"
    @dragend.stop="dragEnd($event)"
  >
    <div
      v-ripple
      class="save-list-item"
      :class="{ selected: value.selected }"
      @click="itemClicked"
      v-click-outside="onClickOutside"
      :style="`padding-left: ${0.5 + depth * 1.25}rem`"
    >
      <v-icon v-if="value.isDirectory && !value.isOpen" color="yellow lighten-1" small>mdi-folder</v-icon>
      <v-icon v-else-if="value.isDirectory && value.isOpen" color="yellow lighten-1" small>mdi-folder-open</v-icon>
      <v-icon v-else small color="blue lighten-3">mdi-file</v-icon>
      <div class="item-name text-truncate">{{ value.name }}</div>
      <div class="ml-auto file-action-buttons">
        <v-btn icon small @click.stop="showNameEditDialog" title="名前を変更">
          <v-icon small>mdi-file-document-edit-outline</v-icon>
        </v-btn>
        <v-btn icon small @click.stop="deleteConfirmDialog = true" title="削除">
          <v-icon small>mdi-trash-can-outline</v-icon>
        </v-btn>
      </div>
    </div>
    <div v-if="value.isOpen">
      <save-item v-for="(item, i) in value.childItems" :key="i" :value="item" :index="i" :depth="depth + 1" :handle-delete="deleteChild" />
    </div>
    <v-dialog v-model="deleteConfirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="ma-4">
          <div>本当にこの<span v-if="value.isDirectory">フォルダー</span><span v-else>データ</span>を削除しますか？</div>
          <div v-if="value.isDirectory" class="caption mt-2">※フォルダー内の全データ、フォルダーが削除されます。</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="red" dark @click.stop="deleteData">削除</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="deleteConfirmDialog = false">戻る</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="mx-4 mt-4">
          <v-text-field
            v-model="editedName"
            maxlength="100"
            counter
            :label="`${value.isDirectory ? 'フォルダー名' : '編成データ名'}`"
          ></v-text-field>
          <div class="d-flex mt-3">
            <v-btn class="ml-auto" color="success" @click.stop="commitName" :disabled="isNameEmptry">更新</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.save-list-item {
  cursor: pointer;
  display: flex;
}
.save-list-item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.save-list-item.selected {
  background-color: rgba(128, 128, 128, 0.4);
}
.save-list.dragging .save-list-item * {
  pointer-events: none;
}

.item-name {
  margin-left: 4px;
  align-self: center;
  flex-grow: 1;
}

input[type="text"] {
  margin-right: 0.1rem;
  padding-left: 0.25rem;
  color: #ddd;
  outline: none;
  border: 1px solid rgb(0, 153, 255);
  height: 24px;
  margin-top: 2px;
  margin-bottom: 2px;
  background: #000;
}

.file-action-buttons {
  opacity: 0;
}
.save-list-item:hover .file-action-buttons {
  opacity: 1;
}
</style>

<script lang="ts">
import Vue from 'vue';
import SaveData from '@/classes/saveData/saveData';

export default Vue.extend({
  name: 'SaveItem',
  props: {
    value: {
      type: SaveData,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
    handleDelete: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    editDialog: false,
    deleteConfirmDialog: false,
    editedName: '',
  }),
  computed: {
    saveData(): SaveData {
      return this.value;
    },
    isNameEmptry(): boolean {
      return this.editedName.length <= 0;
    },
  },
  methods: {
    itemClicked(): void {
      const data = this.saveData;
      data.selected = true;
      data.isOpen = !data.isOpen;
    },
    onClickOutside(): void {
      this.saveData.selected = false;
    },
    deleteData() {
      this.deleteConfirmDialog = false;
      this.handleDelete(this.index);
    },
    deleteChild(index: number) {
      this.value.childItems = this.value.childItems.filter((v, i) => i !== index);
    },
    showNameEditDialog() {
      this.editedName = this.value.name;
      this.editDialog = true;
    },
    commitName() {
      this.editDialog = false;
      this.value.name = this.editedName.trim();
    },
    dragStart(e: DragEvent) {
      const target = e.target as HTMLDivElement;
      target.style.opacity = '0.6';
      target.id = 'dragging-item';
      (e.dataTransfer as DataTransfer).setData('text/plain', JSON.stringify(this.value));

      const itemList = document.getElementsByClassName('save-list');
      for (let i = 0; i < itemList.length; i += 1) {
        itemList[i].classList.add('dragging');
      }
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.backgroundColor = '';
    },
    dragEnter(e: DragEvent): void {
      const draggingDiv = document.getElementById('dragging-item');
      const target = e.target as HTMLDivElement;
      if (!draggingDiv || !target || !this.value.isDirectory) {
        return;
      }
      // 受け入れ可能 背景色を青っぽく
      target.style.backgroundColor = 'rgba(20, 160, 255, 0.6)';
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
      const d = JSON.parse(droppedData) as SaveData;
      const moveData = new SaveData(d.name, d.isDirectory, d.childItems, d.saveData, d.isOpen, d.id);
      console.log('sine');

      const childIds = moveData.getAllDataId();
      if (!this.value.isDirectory || childIds.includes(this.value.id)) {
        // 自身がファイルじゃなかったり、子孫データに対して自分を入れようとした場合は無理
        return;
      }

      this.value.childItems.push(moveData);
      this.value.isOpen = true;

      draggingDiv.classList.add('move-ok');
    },
    dragEnd(e: DragEvent) {
      const target = e.target as HTMLDivElement;
      target.style.opacity = '1';

      target.id = '';
      if (target.classList.contains('move-ok')) {
        this.deleteData();
        target.classList.remove('move-ok');
      }

      const itemList = document.getElementsByClassName('save-list');
      for (let i = 0; i < itemList.length; i += 1) {
        itemList[i].classList.remove('dragging');
      }
    },
  },
});
</script>
