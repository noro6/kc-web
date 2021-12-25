<template>
  <v-card class="mx-5 my-2 px-1 py-2 land-base-all">
    <div class="pa-2">基地航空隊</div>
    <v-divider></v-divider>
    <div>
      <div class="d-flex mb-2">
        <v-switch v-model="isDefenseMode" hide-details :label="'防空計算モード'" @change="setInfo"></v-switch>
        <v-spacer></v-spacer>
      </div>
      <template v-if="isDefenseMode">
        <div class="ml-3">
          <span class="text--secondary">防空時制空値:</span>
          <span class="ml-1 font-weight-medium">{{ landBaseInfo.defenseAirPower }}</span>
        </div>
        <div class="ml-3 my-3 d-flex">
          <div class="align-self-center text--secondary">対重爆制空値:</div>
          <div class="align-self-center ml-1 font-weight-medium">{{ landBaseInfo.highDefenseAirPower }}</div>
          <div class="ml-8 difficulty-select">
            <v-select dense v-model="difficultyLevel" hide-details :items="difficultyLevelItem" label="難易度" @change="setInfo"></v-select>
          </div>
        </div>
      </template>
    </div>
    <v-tabs class="small-landbases" v-model="tab" vertical>
      <v-tab v-for="i in 3" :key="i" :href="`#base${i}`">
        <div class="land-base-tab-text d-none d-sm-block">第{{ i }}基地航空隊</div>
        <div class="land-base-tab-text d-sm-none">第{{ i }}航空隊</div>
      </v-tab>
      <v-tab-item v-for="(lb, i) in landBaseInfo.landBases" :key="i" :value="`base${i + 1}`" class="py-1">
        <land-base-comp v-model="landBaseInfo.landBases[i]" :index="i" :handle-show-item-list="showItemList" @input="setInfo" />
      </v-tab-item>
    </v-tabs>
    <draggable
      class="normal-landbases"
      v-model="landBaseInfo.landBases"
      :options="{ handle: '.land-base-title', animation: 150 }"
      @end="setInfo"
    >
      <land-base-comp
        v-for="(lb, i) in landBaseInfo.landBases"
        :key="i"
        :class="{ unmatch: unmatchModes[i] }"
        v-model="landBaseInfo.landBases[i]"
        :index="i"
        :handle-show-item-list="showItemList"
        @input="setInfo"
      />
    </draggable>
    <v-dialog v-model="itemListDialog" width="1200">
      <item-list ref="itemList" :handle-equip-item="equipItem" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.v-input--selection-controls {
  margin: 0.6rem 0.5rem;
}

.difficulty-select {
  width: 80px;
}

.unmatch {
  opacity: 0.6;
}

.normal-landbases {
  display: none;
}
.small-landbases {
  display: flex;
}
@media (min-width: 960px) {
  .small-landbases {
    display: none;
  }
  .normal-landbases {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 600px) {
  .v-tabs--vertical > .v-tabs-bar .v-tab {
    width: 150px;
  }
}
@media (min-width: 660px) {
  .v-tabs--vertical > .v-tabs-bar .v-tab {
    width: 225px;
  }
}
@media (min-width: 720px) {
  .v-tabs--vertical > .v-tabs-bar .v-tab {
    width: 300px;
  }
}
@media (min-width: 780px) {
  .v-tabs--vertical > .v-tabs-bar .v-tab {
    width: 375px;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import Item, { ItemBuilder } from '@/classes/Item';
import Const, { LB_MODE, DIFFICULTY_LEVEL } from '@/classes/Const';
import ItemMaster from '@/classes/ItemMaster';
import LandBaseInfo, { LandBaseInfoBuilder } from '@/classes/LandBaseInfo';
import LandBaseComp from '@/components/LandBase.vue';
import ItemList from '@/components/ItemList.vue';
import LandBase, { LandBaseBuilder } from '@/classes/LandBase';

export default Vue.extend({
  name: 'LandBaseAll',
  components: {
    LandBaseComp,
    ItemList,
    draggable,
  },
  props: {
    value: {
      type: LandBaseInfo,
      required: true,
    },
  },
  data: () => ({
    itemListDialog: false,
    isDefenseMode: false,
    difficultyLevel: DIFFICULTY_LEVEL.HARD,
    difficultyLevelItem: Const.DIFFICULTY_LEVELS,
    dialogTarget: [-1, -1],
    tab: 0,
  }),
  computed: {
    landBaseInfo(): LandBaseInfo {
      return this.value;
    },
    unmatchModes(): boolean[] {
      const modes = this.landBaseInfo.landBases.map((v) => v.mode);
      if (this.landBaseInfo.isDefense) {
        return modes.map((v) => v !== LB_MODE.DEFFENSE);
      }

      return modes.map((v) => v !== LB_MODE.BATTLE);
    },
  },
  methods: {
    setInfo() {
      const builder: LandBaseInfoBuilder = {
        info: this.landBaseInfo,
        isDefense: this.isDefenseMode,
        difficultyLevel: this.difficultyLevel,
      };
      this.$emit('input', new LandBaseInfo(builder));
    },
    async showItemList(index: number, slot: number) {
      this.dialogTarget = [index, slot];
      const base = this.landBaseInfo.landBases[index];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(base);
    },
    equipItem(item: ItemMaster) {
      const index = this.dialogTarget[0];
      const slot = this.dialogTarget[1];
      const base = this.landBaseInfo.landBases[index];
      if (base) {
        if (slot < base.items.length) {
          // インスタンス化用のいろいろ用意
          let initialSlot = base.items[slot].slot ? base.items[slot].slot : 18;
          let initialLevel = 0;

          if (Const.RECONNAISSANCES.includes(item.apiTypeId)) {
            // 偵察機の場合、搭載数関係はすべて4機制限
            initialSlot = 4;
          }
          if (Const.FIGHTERS.includes(item.apiTypeId)) {
            // 戦闘機系設置時は熟練度最大
            initialLevel = 120;
          }

          const builder: ItemBuilder = { master: item, slot: initialSlot, level: initialLevel };
          base.items[slot] = new Item(builder);
          this.itemListDialog = false;
        }

        const builder: LandBaseBuilder = { landbase: base };
        if (base.mode === LB_MODE.WAIT && base.items.some((v) => v.data.id > 0 && v.slot > 0)) {
          // 待機札だった場合は出撃か防空札に変更
          builder.mode = this.isDefenseMode ? LB_MODE.DEFFENSE : LB_MODE.BATTLE;
        }
        // リアクティブ再登録
        this.landBaseInfo.landBases[index] = new LandBase(builder);
        this.setInfo();
      }
    },
  },
});
</script>
