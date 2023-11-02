<template>
  <v-card>
    <div class="d-flex pt-2 pb-1 pr-2">
      <div class="align-self-center ml-3">{{ $t("ItemList.装備プリセット") }}</div>
      <v-spacer />
      <v-btn icon @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider />
    <div class="px-3">
      <div class="d-flex flex-wrap">
        <v-btn class="my-2 mr-2" color="teal" :dark="!disabledCommit" :disabled="disabledCommit" @click="readyPreset()">
          {{ $t("ItemList.現在の装備構成で新規登録") }}
        </v-btn>
        <v-btn class="my-2" color="primary" :disabled="disabledCommit || isPresetItemEmpty || isAACIMode || selectedIndex < 0" @click="overwritePreset()">
          {{ $t("ItemList.現在の装備構成で上書き") }}
        </v-btn>
      </div>
      <v-divider />
      <div class="preset-container py-1">
        <div class="preset-list">
          <draggable handle=".preset-id" animation="150" @end="sortEnd()" v-model="presets">
            <div
              v-for="(preset, i) in presets"
              :key="`preset${i}`"
              class="preset-item"
              :class="{ selected: !isAACIMode && i === selectedIndex }"
              v-ripple="{ class: 'info--text' }"
              @click="clickedPreset(preset.id)"
              @dblclick="expandPreset()"
              @keypress.enter="clickedPreset(preset.id)"
            >
              <div class="preset-id primary--text">{{ preset.id }}.</div>
              <div class="preset-name text-truncate">{{ preset.name }}</div>
            </div>
          </draggable>
          <div v-if="uniquePresets.length" class="mt-2 d-flex ml-1">
            <div class="caption">{{ $t("ItemList.固有プリセット") }}</div>
            <div class="divider-line"></div>
          </div>
          <div
            v-for="(preset, i) in uniquePresets"
            :key="`preset${i}`"
            class="preset-item"
            :class="{ selected: isAACIMode && i === selectedIndex }"
            v-ripple="{ class: 'info--text' }"
            @click="clickedUniquePreset(i)"
            @dblclick="expandPreset()"
            @keypress.enter="clickedUniquePreset(i)"
          >
            <div class="aaci-preset-id success--text">AACI.</div>
            <div class="preset-name text-truncate">{{ preset.name }}</div>
            <div class="text--secondary caption d-flex align-center mr-2">
              <div>(</div>
              <div class="mx-1">{{ preset.spec1 }}</div>
              <div>,</div>
              <div class="mx-1">{{ preset.spec2 }}</div>
              <div>)</div>
            </div>
            <div>
              <v-icon v-if="preset.isLack" color="warning" small class="mr-2">mdi-alert-outline</v-icon>
              <v-icon v-else color="transparent" small class="mr-2">mdi-alert-outline</v-icon>
            </div>
          </div>
        </div>
        <div class="preset-view pl-2">
          <div class="mt-5 d-flex align-center" v-if="!isPresetItemEmpty">
            <v-text-field :label="$t('ItemList.名称')" outlined v-model.trim="selectedPreset.name" clearable dense maxlength="100" hide-details />
            <v-btn class="ml-2" color="success" :disabled="!selectedPreset.name || isAACIMode" @click="savePreset()">
              {{ selectedIndex >= 0 ? $t("Common.更新") : $t("Common.保存") }}
            </v-btn>
          </div>
          <div class="items-container pa-2 mt-2" v-if="!isPresetItemEmpty">
            <div v-for="(item, i) in itemView" :key="`view${i}`" class="d-flex align-center py-1">
              <div v-if="item.data.iconTypeId">
                <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" width="30" height="30" />
              </div>
              <div class="ml-1 text-truncate preset-item-name" :class="{ 'is-lack': item.isLack }">
                {{ needTrans ? $t(`${item.data.name}`) : item.data.name }}
              </div>
              <div class="ml-1 d-flex align-center" v-if="item.remodel">
                <v-icon small color="teal accent-4">mdi-star</v-icon>
                <div class="remodel-text">{{ item.remodel }}</div>
              </div>
              <div v-if="item.isLack" class="ml-auto"><v-icon color="warning" small>mdi-alert-outline</v-icon></div>
            </div>
            <div v-if="exItemView.data.id" class="mt-2 d-flex ml-1">
              <div class="caption">{{ $t("ItemList.補強増設") }}</div>
              <div class="divider-line"></div>
            </div>
            <div v-if="exItemView.data.id" class="d-flex align-center py-1">
              <div v-if="exItemView.data.iconTypeId">
                <v-img :src="`./img/type/icon${exItemView.data.iconTypeId}.png`" width="30" height="30" />
              </div>
              <div class="ml-1 text-truncate preset-item-name" :class="{ 'is-lack': exItemView.isLack }">
                {{ needTrans ? $t(`${exItemView.data.name}`) : exItemView.data.name }}
              </div>
              <div class="ml-1 d-flex align-center" v-if="exItemView.remodel">
                <v-icon small color="teal accent-4">mdi-star</v-icon>
                <div class="remodel-text">{{ exItemView.remodel }}</div>
              </div>
              <div v-if="exItemView.isLack" class="ml-auto"><v-icon color="warning" small>mdi-alert-outline</v-icon></div>
            </div>
          </div>
          <div class="d-flex my-3 justify-end" v-if="!isPresetItemEmpty">
            <v-btn v-if="selectedIndex >= 0" color="primary" @click="expandPreset()">{{ $t("Common.展開") }}</v-btn>
            <v-btn v-if="selectedIndex >= 0 && selectedPreset.isLack" color="warning" @click="expandPreset(true)" class="ml-2">
              {{ $t("ItemList.在庫がなくても展開") }}
            </v-btn>
            <v-btn v-if="!isAACIMode" class="ml-2" color="error" :disabled="selectedIndex < 0" @click="deletePreset()">{{ $t("Common.削除") }}</v-btn>
          </div>
        </div>
      </div>
    </div>
    <v-snackbar v-model="snackbar" color="success" :top="snackbar">
      {{ infoText ? $t(`ItemList.${infoText}`) : infoText }}
      <template v-slot:action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="snackbar = false"><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<style scoped>
.preset-container {
  display: grid;
  grid-template-columns: 50% 50%;
}

.preset-list {
  height: 70vh;
  overflow-y: scroll;
}
.preset-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;
  border: 1px solid transparent;
  border-radius: 0.2rem;
}
.preset-item:hover {
  background-color: rgba(0, 164, 255, 0.1);
}
.preset-item.selected {
  background-color: rgba(0, 164, 255, 0.1);
  border-color: rgba(0, 164, 255, 0.6);
}
.preset-id {
  cursor: move !important;
  width: 34px;
  text-align: right;
  font-size: 0.75em;
}
.preset-name {
  width: 10;
  flex-grow: 1;
  margin-left: 0.5rem;
  font-size: 0.8em;
}
.aaci-preset-id {
  width: 34px;
  text-align: right;
  font-size: 0.7em;
  font-weight: bold;
}
.cut-in-spec1 {
  text-align: right;
  width: 18px;
  white-space: nowrap;
  margin-right: 2px;
}

.items-container {
  border: 1px solid rgba(128, 128, 128, 0.5);
  border-radius: 0.25rem;
}

.divider-line {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.preset-item-name {
  flex-grow: 1;
  width: 10px;
  font-size: 0.8em;
}
.preset-item-name.is-lack {
  color: rgb(251, 140, 0);
}
.remodel-text {
  color: #00bfa5;
  font-size: 0.8em;
  width: 16px;
  white-space: nowrap;
}
</style>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import max from 'lodash/max';
import cloneDeep from 'lodash/cloneDeep';
import Ship from '@/classes/fleet/ship';
import ItemPreset, { OldItemPreset } from '@/classes/item/itemPreset';
import ItemMaster from '@/classes/item/itemMaster';
import Optimizer from '@/classes/fleet/optimizer';
import Airbase from '@/classes/airbase/airbase';
import Item from '@/classes/item/item';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import Const from '@/classes/const';
import SaveData from '@/classes/saveData/saveData';
import ShipValidation from '@/classes/fleet/shipValidation';

export default Vue.extend({
  name: 'ItemPreset',
  components: { draggable },
  props: {
    value: {
      type: [Ship, Airbase],
      required: true,
    },
    handleExpandItemPreset: {
      type: Function,
      required: true,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    items: [] as ItemMaster[],
    presets: [] as ItemPreset[],
    uniquePresets: [] as (ItemPreset & { isLack: boolean; spec1: string; spec2: string })[],
    isAACIMode: false,
    selectedIndex: -1,
    selectedPreset: new ItemPreset(),
    snackbar: false,
    infoText: '',
  }),
  mounted() {
    this.items = this.$store.state.items as ItemMaster[];

    this.presets = [];
    const savedPresets = this.$store.state.itemPresets as (ItemPreset | OldItemPreset)[];
    this.presets = ItemPreset.convertOldItemPresets(savedPresets);

    this.getAACIPreset();
  },
  watch: {
    value() {
      this.getAACIPreset();
    },
  },
  computed: {
    needTrans() {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    disabledCommit(): boolean {
      // 装備が空の場合判定
      if (this.value instanceof Airbase) {
        return this.value.items.filter((v) => v.data.id > 0).length === 0;
      }
      // 基地以外の時は補強増設まで見て判定
      return this.value.items.concat(this.value.exItem).filter((v) => v.data.id > 0).length === 0;
    },
    itemView(): { data: ItemMaster; remodel: number; isLack?: boolean }[] {
      const itemMasters: { data: ItemMaster; remodel: number; isLack?: boolean }[] = [];
      for (let i = 0; i < this.selectedPreset.items.length; i += 1) {
        const { id, remodel, assumedId } = this.selectedPreset.items[i];
        const item = this.items.find((v) => v.id === id);
        if (item) {
          itemMasters.push({ data: item, remodel });
        } else if (assumedId) {
          const assumedItem = this.items.find((v) => v.id === assumedId);
          if (assumedItem) itemMasters.push({ data: assumedItem, remodel: 0, isLack: true });
          else itemMasters.push({ data: new ItemMaster(), remodel: 0 });
        } else {
          itemMasters.push({ data: new ItemMaster(), remodel: 0 });
        }
      }
      return itemMasters;
    },
    exItemView(): { data: ItemMaster; remodel: number; isLack?: boolean } {
      const item = this.items.find((v) => v.id === this.selectedPreset.exItem.id);
      if (item) {
        return { data: item, remodel: this.selectedPreset.exItem.remodel };
      }
      const assumedItem = this.items.find((v) => v.id === this.selectedPreset.exItem.assumedId);
      return assumedItem ? { data: assumedItem, remodel: 0, isLack: true } : { data: new ItemMaster(), remodel: 0 };
    },
    isPresetItemEmpty(): boolean {
      return !this.selectedPreset.items.some((v) => v.id || v.assumedId) && !this.selectedPreset.exItem.id && !this.selectedPreset.exItem.assumedId;
    },
  },
  methods: {
    clickedPreset(id: number) {
      this.isAACIMode = false;
      const index = this.presets.findIndex((v) => v.id === id);
      if (index >= 0) {
        this.selectedIndex = index;
        this.selectedPreset = cloneDeep(this.presets[index]);
      }
    },
    clickedUniquePreset(index: number) {
      this.isAACIMode = true;
      this.selectedIndex = index;
      this.selectedPreset = cloneDeep(this.uniquePresets[index]);
    },
    readyPreset() {
      this.isAACIMode = false;
      const newPreset = new ItemPreset();
      const maxId = max(this.presets.map((v) => v.id));
      if (maxId) {
        newPreset.id = maxId;
      }
      newPreset.id += 1;
      if (this.$i18n.locale !== 'ja') {
        newPreset.name = `${this.$t('ItemList.プリセット')} ${newPreset.id}`;
      } else {
        newPreset.name = `装備プリセット${newPreset.id}`;
      }
      // 装備id一覧
      for (let i = 0; i < this.value.items.length; i += 1) {
        const item = this.value.items[i];
        newPreset.items.push({ id: item.data.id, remodel: item.remodel });
      }
      if (this.value instanceof Ship) {
        newPreset.exItem = { id: this.value.exItem.data.id, remodel: this.value.exItem.remodel };
      }

      this.selectedIndex = -1;
      this.selectedPreset = newPreset;
    },
    overwritePreset() {
      const { name } = this.selectedPreset;
      this.selectedPreset = new ItemPreset();
      this.selectedPreset.name = name;
      for (let i = 0; i < this.value.items.length; i += 1) {
        const item = this.value.items[i];
        this.selectedPreset.items.push({ id: item.data.id, remodel: item.remodel });
      }
      if (this.value instanceof Ship) {
        this.selectedPreset.exItem = { id: this.value.exItem.data.id, remodel: this.value.exItem.remodel };
      }
    },
    savePreset() {
      if (this.selectedIndex >= 0) {
        // 更新
        this.presets[this.selectedIndex] = this.selectedPreset;
      } else {
        // 新規登録
        this.presets.push(this.selectedPreset);
      }
      // ブラウザに保存
      this.$store.dispatch('updateItemPresets', this.presets);
      this.infoText = '保存しました。';
      this.snackbar = true;
      this.selectedIndex = -1;
      this.selectedPreset = new ItemPreset();
    },
    deletePreset() {
      this.presets = this.presets.filter((v, i) => i !== this.selectedIndex);
      // ブラウザに保存
      this.$store.dispatch('updateItemPresets', this.presets);
      this.snackbar = true;
      this.infoText = '削除しました。';
      this.selectedIndex = -1;
      this.selectedPreset = new ItemPreset();
    },
    expandPreset(isForce = false) {
      if (this.selectedPreset) {
        this.handleExpandItemPreset(this.selectedPreset, isForce);
        this.handleClose();
      }
    },
    sortEnd() {
      const baseIds = this.presets.map((v) => v.id);
      for (let i = 0; i < this.presets.length; i += 1) {
        this.presets[i].id = baseIds[i];
      }
      this.$store.dispatch('updateItemPresets', this.presets);
    },
    getAACIPreset() {
      const parent = this.value;
      if (!(parent instanceof Ship)) {
        return;
      }

      // 今使える全装備を取得
      const allItemMasters = this.items.filter((v) => !v.isEnemyItem);
      const allItems = allItemMasters.map((v) => new Item({ master: v }));

      const stocks = this.$store.state.itemStock as ItemStock[];

      let items: Item[] = [];
      const isStockMode = !!stocks.length && stocks.some((v) => v.num.some((remodel) => !!remodel));

      if (isStockMode) {
        // 所持装備情報がある場合
        // 利用済み装備idと改修値を控えていく
        let usedItems: { id: number; remodel: number; isChecked: boolean }[] = [];
        // 現在の計算画面内で配備されている装備を列挙する
        const mainData = this.$store.state.mainSaveData as SaveData;
        if (mainData) {
          const manager = mainData.tempData[mainData.tempIndex];
          if (manager) {
            // 艦隊データから装備全取得
            for (let i = 0; i < manager.fleetInfo.fleets.length; i += 1) {
              const { ships } = manager.fleetInfo.fleets[i];
              for (let j = 0; j < ships.length; j += 1) {
                const ship = ships[j];
                const shipItems = ship.items.filter((v) => v.data.id);
                if (shipItems.length) {
                  usedItems = usedItems.concat(shipItems.map((v) => ({ id: v.data.id, remodel: v.remodel, isChecked: false })));
                }
                if (ship.exItem.data.id > 0) usedItems.push({ id: ship.exItem.data.id, remodel: ship.exItem.remodel, isChecked: false });
              }
            }
            // 基地航空隊データから装備全取得
            const { airbases } = manager.airbaseInfo;
            for (let i = 0; i < airbases.length; i += 1) {
              const airbaseItems = airbases[i].items.filter((v) => v.data.id);
              if (airbaseItems.length) {
                usedItems = usedItems.concat(airbaseItems.map((v) => ({ id: v.data.id, remodel: v.remodel, isChecked: false })));
              }
            }

            const parentItems = parent.items.concat(parent.exItem).filter((v) => v.data.id);
            for (let i = 0; i < parentItems.length; i += 1) {
              // 自分が装備しているやつは対象外なので抜く
              const item = parentItems[i];
              const index = usedItems.findIndex((v) => v.id === item.data.id && v.remodel === item.remodel);
              if (index >= 0) usedItems = usedItems.filter((v, idx) => idx !== index);
            }
          }
        }

        for (let i = 0; i < stocks.length; i += 1) {
          const stock = stocks[i];
          const master = allItemMasters.find((v) => v.id === stock.id);
          if (!master) continue;

          // ★10からpushしていくことで、高改修のものを優先する
          for (let remodel = 10; remodel >= 0; remodel -= 1) {
            for (let j = 0; j < stock.num[remodel]; j += 1) {
              // 利用済み装備に該当するかチェック
              const uncheckedUsedItem = usedItems.find((v) => v.id === master.id && v.remodel === remodel && !v.isChecked);
              if (uncheckedUsedItem) {
                // 利用済みチェックだけしてスキップ
                uncheckedUsedItem.isChecked = true;
                continue;
              }
              items.push(new Item({ master, remodel }));
            }
          }
        }
      } else {
        items = allItems.concat();
      }

      // 対空CI用のプリセットを取得
      const aaciItems = Optimizer.getShipAACITriggerItems(parent, items, isStockMode);
      // 全装備あり状態の対空CI装備取得
      const assumedItems = Optimizer.getShipAACITriggerItems(parent, allItems);

      this.uniquePresets = [];

      for (let i = 0; i < aaciItems.length; i += 1) {
        const row = aaciItems[i];
        const cutIn = Const.ANTI_AIR_CUTIN.find((v) => v.id === row.id);
        if (!cutIn) continue;

        const preset = new ItemPreset();
        preset.id = cutIn.id;
        preset.items = row.items.map((v, j) => {
          const item = { id: v.data.id, remodel: v.remodel, assumedId: 0 };
          // 見つかってない場合は理想装備を搭載
          if (!item.id) item.assumedId = assumedItems[i].items[j].data.id;
          return item;
        });
        preset.name = `${preset.id}種`;
        // 理想の装備がない疑惑アリ
        const isLack = row.items.some((v) => !v.data.id);

        // おケツの装備はなるべく増設にしたいのでそのチェック
        let lastItem = row.items[row.items.length - 1];
        const isAssumeExItem = !lastItem.data.id;
        if (isAssumeExItem) {
          // おケツの理想装備
          const assumedItem = allItemMasters.find((v) => v.id === preset.items[preset.items.length - 1].assumedId);
          lastItem = assumedItem ? new Item({ master: assumedItem }) : new Item();
        }

        if (ShipValidation.isValidItem(parent.data, lastItem.data, Const.EXPAND_SLOT_INDEX, lastItem.remodel)) {
          // 増設にのりそうなので、ケツの装備を通常装備枠から消す
          preset.exItem = { id: lastItem.data.id, remodel: lastItem.remodel };
          // 見つかってない場合は理想装備を搭載
          if (isAssumeExItem) {
            preset.exItem = { id: 0, remodel: lastItem.remodel, assumedId: lastItem.data.id };
          }
          preset.items.splice(-1);
        }

        if (preset.items.length <= parent.data.slotCount) {
          this.uniquePresets.push(Object.assign(preset, { isLack, spec1: `${cutIn.c1 + cutIn.c2}`, spec2: `x${cutIn.rateBonus.toFixed(2)}` }));
        }
      }
    },
  },
});
</script>
