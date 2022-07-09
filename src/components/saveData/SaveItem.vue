<template>
  <div
    :draggable="!value.isUnsaved"
    class="save-list"
    :class="{ 'disabled-drag': value.isUnsaved, highlight: value.highlight }"
    @dragover.prevent
    @drop.stop="dropItem($event)"
    @dragleave.stop="dragLeave($event)"
    @dragenter.stop="dragEnter($event)"
    @dragstart.stop="dragStart($event)"
    @dragend.stop="dragEnd($event)"
  >
    <div
      v-ripple
      class="save-list-item pl-1"
      :class="{ selected: value.selected }"
      @click="itemClicked"
      v-click-outside="onClickOutside"
    >
      <v-icon v-if="value.isDirectory && !value.isOpen" color="yellow lighten-1" small>mdi-folder</v-icon>
      <v-icon v-else-if="value.isDirectory && value.isOpen" color="yellow lighten-1" small>mdi-folder-open</v-icon>
      <v-icon v-else-if="value.isUnsaved" small>mdi-file-question</v-icon>
      <v-icon v-else-if="value.isActive" small color="green lighten-3">mdi-file-eye</v-icon>
      <v-icon v-else small color="blue lighten-3">mdi-file</v-icon>
      <div class="item-name text-truncate">{{ value.name }}</div>
      <div class="ml-auto file-action-buttons">
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-if="!value.isUnsaved && !value.isDirectory" icon small @click.stop="copyAndOpen" v-bind="attrs" v-on="on">
              <v-icon small>mdi-content-duplicate</v-icon>
            </v-btn>
          </template>
          <span>複製して開く</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-if="!value.isUnsaved" icon small @click.stop="showEditDialog" :disabled="value.isReadonly" v-bind="attrs" v-on="on">
              <v-icon small>mdi-file-document-edit-outline</v-icon>
            </v-btn>
          </template>
          <span>情報を変更</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="deleteConfirmDialog = true" :disabled="value.isReadonly" v-bind="attrs" v-on="on">
              <v-icon small>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
          <span>削除</span>
        </v-tooltip>
      </div>
    </div>
    <div v-if="value.isOpen">
      <div v-for="(item, i) in value.childItems" class="d-flex pl-1" :key="`item_${i}`">
        <div class="depth-line" :class="{ 'is-last': i === value.childItems.length - 1 }">
          <div class="depth-file-line"></div>
        </div>
        <div class="flex-grow-1">
          <save-item :value="item" :index="i" :handle-delete="deleteChild" />
        </div>
      </div>
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
    <v-dialog v-model="editDialog" transition="scroll-x-transition" :width="value.isDirectory ? 600 : 800">
      <v-card class="pa-3">
        <div class="mx-1 mt-3">
          <v-text-field
            v-model="editedName"
            dense
            outlined
            maxlength="100"
            counter
            :label="`${value.isDirectory ? 'フォルダー名' : '編成データ名'}`"
          ></v-text-field>
          <v-textarea
            v-if="!value.isDirectory"
            v-model.trim="editedRemarks"
            rows="10"
            dense
            outlined
            hide-details
            label="補足情報"
            class="remarks-input"
          ></v-textarea>
          <div class="d-flex mt-2">
            <v-btn class="ml-auto" color="success" @click.stop="commitName" :disabled="isNameEmptry">更新</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-tooltip v-if="enabledTooltip" v-model="enabledTooltip" color="black" bottom right :position-x="tooltipX" :position-y="tooltipY">
      <save-data-tooltip v-model="tooltipData" />
    </v-tooltip>
  </div>
</template>

<style scoped>
.save-list.disabled-drag {
  user-select: none;
}

.depth-line {
  margin-left: 0.4rem;
  width: 0.5rem;
  border-left: 1px solid #666;
}
.depth-line.is-last {
  height: 50%;
}
.depth-file-line {
  margin-top: 14px;
  border-top: 1px solid #666;
}

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
  width: 1px;
  flex-grow: 1;
  margin-left: 4px;
  align-self: center;
}
.file-action-buttons {
  display: flex;
  flex-wrap: nowrap;
  opacity: 0;
}
.save-list-item:hover .file-action-buttons {
  opacity: 1;
}

.highlight {
  animation-name: flash;
  animation-duration: 0.8s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: 2;
}
@keyframes flash {
  0% {
    background-color: transparent;
    color: #fff;
  }
  50% {
    box-shadow: 0px 0px 30px rgb(80, 200, 255);
    background-color: rgb(80, 200, 255);
    color: #000;
  }
  100% {
    background-color: transparent;
    color: #fff;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import SaveData from '@/classes/saveData/saveData';
import SaveDataTooltip from '@/components/saveData/SaveDataTooltip.vue';

export default Vue.extend({
  name: 'SaveItem',
  components: {
    SaveDataTooltip,
  },
  props: {
    value: {
      type: SaveData,
      required: true,
    },
    index: {
      type: Number,
      required: true,
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
    editedRemarks: '',
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipData: new SaveData(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  computed: {
    saveData(): SaveData {
      return this.value;
    },
    isNameEmptry(): boolean {
      return this.editedName.length <= 0;
    },
  },
  updated() {
    if (this.value.highlight) {
      // 光り終わったら消す通知
      setTimeout(() => {
        const saveData = this.$store.state.saveData as SaveData;
        saveData.clearHighlight();
        this.$store.dispatch('updateSaveData', saveData);
      }, 1600);
    }
  },
  methods: {
    handleUpdateSaveData(): void {
      // セーブデータの更新を通知
      const saveData = this.$store.state.saveData as SaveData;
      saveData.sortChild();
      this.$store.dispatch('updateSaveData', saveData);
    },
    itemClicked(): void {
      const data = this.saveData;
      data.selected = true;
      if (!data.isDirectory) {
        if (data.isActive && data.isMain) {
          // 何度もやらせない
          return;
        }
        // ルートのセーブデータを取得し、いったん全てのメイン状態を解除
        const saveData = this.$store.state.saveData as SaveData;
        saveData.disabledMain();

        // クリックされたこれをメイン状態とする
        data.isActive = true;
        data.isMain = true;
        this.$store.dispatch('setMainSaveData', data);

        this.handleUpdateSaveData();
        if (!this.$route.path.endsWith('/aircalc')) {
          // ページ遷移
          this.$router.push('aircalc');
        }
        return;
      }
      data.isOpen = !data.isOpen;
    },
    copyAndOpen() {
      const data = this.saveData;
      if (!data.isDirectory) {
        // ルートのセーブデータを取得し、いったん全てのメイン状態を解除
        const saveData = this.$store.state.saveData as SaveData;
        saveData.disabledMain();

        // クリックされたこれを複製
        const newData = new SaveData();
        newData.name = `${data.name}_コピー`;
        newData.manager = data.manager;
        newData.isActive = true;
        newData.isMain = true;

        saveData.childItems.push(newData);
        this.$store.dispatch('setMainSaveData', newData);

        this.handleUpdateSaveData();
        if (!this.$route.path.endsWith('/aircalc')) {
          // ページ遷移
          this.$router.push('aircalc');
        }
        return;
      }
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
      // データの削除は常にこのメソッドにより行われる
      this.value.childItems = this.value.childItems.filter((v, i) => i !== index);
      // 更新を通知
      this.handleUpdateSaveData();

      // メイン計算データの削除がされていないかチェック されていたら更新通知 => 計算画面だったらトップページに戻ってくれる
      const saveData = this.$store.state.saveData as SaveData;
      if (!saveData.getMainData()) {
        this.$store.dispatch('setMainSaveData', undefined);
      }
    },
    showEditDialog() {
      this.editedName = this.value.name;
      this.editedRemarks = this.value.remarks ? this.value.remarks : '';
      this.editDialog = true;
    },
    commitName() {
      this.editDialog = false;
      this.value.name = this.editedName.trim();
      this.value.remarks = this.editedRemarks ? this.editedRemarks.trim() : '';
      this.value.editedDate = Date.now();
      this.handleUpdateSaveData();
    },
    dragStart(e: DragEvent) {
      this.clearTooltip();
      const target = e.target as HTMLDivElement;
      target.style.opacity = '0.6';
      target.id = 'dragging-item';

      // ドラッグ中セーブデータを一時保持
      this.$store.dispatch('setDraggingSaveData', this.value);

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
      target.style.backgroundColor = 'rgba(20, 160, 255, 0.8)';
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

      // 一時退避していたデータをセット
      const moveData = this.$store.state.draggingSaveData as SaveData;
      const childIds = moveData.getAllDataId();
      if (!this.value.isDirectory || childIds.includes(this.value.id)) {
        // 自身がファイルじゃなかったり、子孫データに対して自分を入れようとした場合は無理
        return;
      }

      this.value.childItems.push(moveData);

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
    bootTooltip(data: SaveData, e: MouseEvent) {
      if (data.isDirectory) {
        return;
      }
      const nameDiv = (e.target as HTMLDivElement).closest('.save-list')?.getElementsByClassName('item-name')[0] as HTMLDivElement;
      this.tooltipTimer = window.setTimeout(() => {
        const rect = nameDiv.getBoundingClientRect();
        this.tooltipX = rect.x;
        this.tooltipY = rect.y + rect.height + 30;
        this.tooltipData = data;
        this.enabledTooltip = true;
      }, 200);
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
  },
});
</script>
