<template>
  <div
    :draggable="!value.isUnsaved"
    class="save-list"
    :class="{ 'disabled-drag': value.isUnsaved, highlight: value.highlight }"
    @dragover.stop="dragOver($event)"
    @drop.stop="dropItem($event)"
    @dragleave.stop="dragLeave($event)"
    @dragstart.stop="dragStart($event)"
    @dragend.stop="dragEnd($event)"
  >
    <div
      v-ripple
      class="save-list-item pl-1"
      :class="{ selected: value.selected }"
      @click="itemClicked"
      @keypress.enter="itemClicked"
      tabindex="0"
      v-click-outside="onClickOutside"
    >
      <v-icon v-if="value.isDirectory" :color="value.color" small> {{ value.isOpen ? "mdi-folder-open" : "mdi-folder" }}</v-icon>
      <v-icon v-else-if="value.isUnsaved" small>mdi-file-question</v-icon>
      <v-icon v-else-if="value.isActive" small :color="value.color">mdi-file-eye</v-icon>
      <v-icon v-else small :color="value.color">mdi-file</v-icon>
      <div class="item-name text-truncate" :class="{ 'green--text text--lighten-2': !value.isUnsaved && value.isActive }">
        {{ value.name === "保存されたデータ" ? $t(`SaveData.${value.name}`) : value.name }}
      </div>
      <div class="ml-auto file-action-buttons">
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-if="!value.isDirectory" icon small @click.stop="copyAndOpen" v-bind="attrs" v-on="on">
              <v-icon small>mdi-content-duplicate</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("SaveData.複製して開く") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-if="value.isDirectory" icon small @click.stop="sortConfirmDialog = true" v-bind="attrs" v-on="on">
              <v-icon small>mdi-sort</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("SaveData.名前順でソート") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-if="!value.isUnsaved" icon small @click.stop="showEditDialog" :disabled="value.isReadonly" v-bind="attrs" v-on="on">
              <v-icon small>mdi-file-document-edit-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("SaveData.情報を変更") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small @click.stop="deleteConfirmDialog = true" :disabled="value.isReadonly" v-bind="attrs" v-on="on">
              <v-icon small>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Common.削除") }}</span>
        </v-tooltip>
      </div>
    </div>
    <div v-if="value.isOpen">
      <div v-for="(item, i) in value.childItems" class="d-flex pl-1" :key="`item_${i}`">
        <div class="depth-line" :class="{ 'is-last': i === value.childItems.length - 1 }">
          <div class="depth-file-line" />
        </div>
        <div class="flex-grow-1">
          <save-item :value="item" :index="i" :handle-delete="deleteChild" :parent-directory="value" />
        </div>
      </div>
    </div>
    <v-dialog v-model="deleteConfirmDialog" transition="scroll-x-transition" width="400">
      <v-card class="pa-3">
        <div class="ma-4">
          <div>
            <span v-if="value.isDirectory">{{ $t("SaveData.本当にこのフォルダーを削除しますか？") }}</span>
            <span v-else>{{ $t("SaveData.本当にこのデータを削除しますか？") }}</span>
          </div>
          <div class="mt-1">
            <v-icon :color="value.color">{{ value.isDirectory ? "mdi-folder" : "mdi-file" }}</v-icon>
            <span class="ml-1">{{ value.name }}</span>
          </div>
          <div v-if="value.isDirectory" class="caption mt-2">※ {{ $t("SaveData.フォルダー内の全データ、フォルダーが削除されます。") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="red" dark @click.stop="deleteData">{{ $t("Common.削除") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="deleteConfirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="sortConfirmDialog" transition="scroll-x-transition" width="360">
      <v-card class="pa-3">
        <div class="ma-4 body-2">
          <span>{{ $t("SaveData.このフォルダー内の全データ、フォルダーを名前順にソートします。") }}</span>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="primary" dark @click.stop="autoSortDirectory">{{ $t("Common.OK") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="sortConfirmDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editDialog" transition="scroll-x-transition" width="800">
      <v-card class="pa-3">
        <div class="mx-1 mt-3">
          <v-text-field
            v-model="editedName"
            dense
            outlined
            maxlength="100"
            counter
            :label="`${value.isDirectory ? $t('SaveData.フォルダー名') : $t('SaveData.編成データ名')}`"
            @keypress.enter="commitName"
            :disabled="!editDialog"
          />
          <v-textarea
            v-if="!value.isDirectory"
            v-model.trim="editedRemarks"
            rows="10"
            dense
            outlined
            hide-details
            :label="$t('SaveData.補足情報')"
            class="remarks-input"
          />
          <div class="mt-4 d-flex">
            <div class="align-self-center">
              <v-icon x-large :color="selectedColor">{{ value.isDirectory ? "mdi-folder" : "mdi-file" }}</v-icon>
            </div>
            <div class="ml-1 flex-grow-1 d-flex justify-space-around">
              <div v-for="color in colors" :key="`color${color}`" class="my-1">
                <v-btn fab light x-small :color="color" @click="selectedColor = color">
                  <v-icon v-if="color === selectedColor">mdi-check-bold</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
          <div class="d-flex mt-3 align-center">
            <template v-if="value.isDirectory">
              <v-btn class="ml-auto" color="success" @click.stop="commitName" :disabled="isNameEmpty || !editDialog">{{ $t("Common.更新") }}</v-btn>
            </template>
            <template v-else>
              <div class="text--secondary caption ml-auto">最終更新日時</div>
              <div class="text--secondary caption ml-3">{{ lastModified }}</div>
              <v-btn class="ml-6" color="success" @click.stop="commitName" :disabled="isNameEmpty || !editDialog">{{ $t("Common.更新") }}</v-btn>
            </template>
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

.on-item-before,
.on-item-after {
  flex-wrap: wrap;
}
.on-item-before::before,
.on-item-after::after {
  margin-right: 2px;
  display: block;
  content: "";
  height: 28px;
  width: 100%;
  border: 2px dashed rgb(32, 148, 243);
  border-radius: 0.15rem;
}
.on-item-directory {
  box-shadow: inset 0 0 24px rgb(32, 148, 243) !important;
  border-radius: 0.1rem;
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
import Const from '@/classes/const';

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
    parentDirectory: {
      type: SaveData,
      required: true,
    },
  },
  data: () => ({
    editDialog: false,
    deleteConfirmDialog: false,
    sortConfirmDialog: false,
    editedName: '',
    editedRemarks: '',
    selectedColor: '',
    lastModified: '',
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipData: new SaveData(),
    tooltipX: 0,
    tooltipY: 0,
    colors: Const.FILE_COLORS,
  }),
  computed: {
    isNameEmpty(): boolean {
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
      const data = this.value;
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
      const data = this.value;
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
      this.value.selected = false;
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
      this.selectedColor = this.value.color;
      this.lastModified = new Date(this.value.editedDate).toLocaleString(this.$vuetify.lang.current);
      this.editDialog = true;
    },
    commitName() {
      if (this.isNameEmpty) {
        return;
      }
      this.editDialog = false;
      this.value.name = this.editedName.trim();
      this.value.remarks = this.editedRemarks ? this.editedRemarks.trim() : '';
      this.value.editedDate = Date.now();
      this.value.color = this.selectedColor;
      this.handleUpdateSaveData();
    },
    autoSortDirectory() {
      this.value.nameSortChild();
      this.handleUpdateSaveData();
      this.sortConfirmDialog = false;
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
      const target = e.target as HTMLDivElement;
      target.classList.remove('on-item-before', 'on-item-after', 'on-item-directory');
    },
    dragOver(e: DragEvent) {
      const draggingDiv = document.getElementById('dragging-item');
      const target = e.target as HTMLDivElement;
      if (!draggingDiv || !target || target === draggingDiv) {
        target.classList.remove('on-item-before', 'on-item-after', 'on-item-directory');
        return;
      }
      // 乗っている要素に対するマウスのy座標
      const mouseY = e.clientY - target.getBoundingClientRect().top;
      if (this.value.isDirectory) {
        // 並べ替え上下の境界
        const beforeBorder = 5;
        const afterBorder = 23;

        if (!this.value.isReadonly && mouseY <= beforeBorder) {
          target.classList.add('on-item-before');
          target.classList.remove('on-item-after', 'on-item-directory');
        } else if (mouseY <= afterBorder) {
          // 中間地点 フォルダ内に突っ込む判定
          target.classList.add('on-item-directory');
          target.classList.remove('on-item-after', 'on-item-before');
        } else if (!this.value.isOpen) {
          target.classList.add('on-item-after');
          target.classList.remove('on-item-before', 'on-item-directory');
        }
      } else if (!this.value.isUnsaved) {
        // 並べ替え上下の境界
        const border = target.offsetHeight / 2;
        if (mouseY <= border) {
          target.classList.add('on-item-before');
          target.classList.remove('on-item-after');
        } else {
          target.classList.add('on-item-after');
          target.classList.remove('on-item-before');
        }
      }
      e.preventDefault();
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
      if (target.id || this.value.isUnsaved) {
        // 自身へのドロップ禁止 未保存データへのドラッグ禁止
        target.classList.remove('on-item-before', 'on-item-after', 'on-item-directory');
        return;
      }

      // 一時退避していたデータを取得
      const moveData = this.$store.state.draggingSaveData as SaveData;

      if (this.value.isDirectory && target.classList.contains('on-item-directory')) {
        // ディレクトリで、ディレクトリ内に突っ込む判定だった場合
        const childIds = moveData.getAllDataId();
        if (childIds.includes(this.value.id)) {
          // 自身がファイルじゃなかったり、子孫データに対して自分を入れようとした場合は無理
          target.classList.remove('on-item-directory');
          return;
        }

        // フォルダ内に挿入
        moveData.order = 999999;
        this.value.childItems.push(moveData);
      } else if (this.parentDirectory.isDirectory && target.classList.contains('on-item-before')) {
        // 対象の直前に挿入
        moveData.order = this.value.order - 1;
        this.parentDirectory.childItems.push(moveData);
      } else if (this.parentDirectory.isDirectory && target.classList.contains('on-item-after')) {
        // 対象の直後に挿入
        moveData.order = this.value.order + 1;
        this.parentDirectory.childItems.push(moveData);
      } else {
        // 謎の判定 ここで返さないとデータが消えるので返す
        return;
      }

      draggingDiv.classList.add('move-ok');
      target.classList.remove('on-item-before', 'on-item-after', 'on-item-directory');
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
      window.clearTimeout(this.tooltipTimer);
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
