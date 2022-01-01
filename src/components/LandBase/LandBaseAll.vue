<template>
  <v-card class="my-2 px-1 py-2">
    <div class="pa-2">基地航空隊</div>
    <v-divider></v-divider>
    <div>
      <div class="d-flex">
        <v-switch v-model="isDefenseMode" dense hide-details :label="'防空計算モード'" @change="setInfo"></v-switch>
        <v-spacer></v-spacer>
      </div>
      <div class="d-flex ml-3 mb-2" v-if="isDefenseMode">
        <div class="align-self-center text--secondary body-2">防空時制空値:</div>
        <div class="align-self-center ml-1">{{ landbaseInfo.defenseAirPower }}</div>
        <div class="ml-5 align-self-center text--secondary body-2">対重爆制空値:</div>
        <div class="align-self-center ml-1">{{ landbaseInfo.highDefenseAirPower }}</div>
        <div class="ml-5 align-self-center text--secondary body-2">対重爆補正:</div>
        <div class="align-self-center ml-1 body-2">&times;{{ landbaseInfo.highDeffenseCoefficient }}</div>
        <div class="ml-8 difficulty-select">
          <v-select dense v-model="difficultyLevel" hide-details :items="difficultyLevelItem" label="難易度" @change="setInfo"></v-select>
        </div>
      </div>
    </div>
    <v-tabs class="small-landbases" v-model="tab" vertical>
      <v-tab v-for="i in 3" :key="i" :href="`#base${i}`">
        <div class="land-base-tab-text d-none d-sm-block">第{{ i }}基地航空隊</div>
        <div class="land-base-tab-text d-sm-none">第{{ i }}航空隊</div>
      </v-tab>
      <v-tab-item v-for="(lb, i) in landbaseInfo.landbases" :key="i" :value="`base${i + 1}`" class="py-1">
        <landbase-comp
          v-model="landbaseInfo.landbases[i]"
          :index="i"
          :handle-show-item-list="showItemList"
          @input="setInfo"
          :is-defense="isDefenseMode"
        />
      </v-tab-item>
    </v-tabs>
    <draggable
      class="normal-landbases"
      v-model="landbaseInfo.landbases"
      :options="{ handle: '.land-base-title', animation: 150 }"
      @end="setInfo"
    >
      <landbase-comp
        v-for="(lb, i) in landbaseInfo.landbases"
        :key="i"
        :class="{ unmatch: unmatchModes[i] }"
        v-model="landbaseInfo.landbases[i]"
        :index="i"
        :is-defense="isDefenseMode"
        :handle-show-item-list="showItemList"
        @input="setInfo"
      />
    </draggable>
    <div v-if="isDefenseMode" class="mx-1 mb-1">
      <air-status-result-bar :result="landbaseInfo.landbases[0].resultWave1" />
    </div>
    <v-dialog v-model="itemListDialog" width="1200" transition="scroll-x-transition">
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
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import LandbaseComp from '@/components/landbase/Landbase.vue';
import ItemList from '@/components/item/ItemList.vue';
import LandbaseInfo, { LandbaseInfoBuilder } from '@/classes/landbase/landbaseInfo';
import Landbase, { LandbaseBuilder } from '@/classes/landbase/landbase';
import Const, { LB_MODE, DIFFICULTY_LEVEL } from '@/classes/const';
import Item, { ItemBuilder } from '@/classes/item/item';
import ItemMaster from '@/classes/item/itemMaster';

export default Vue.extend({
  name: 'LandbaseAll',
  components: {
    LandbaseComp,
    ItemList,
    draggable,
    AirStatusResultBar,
  },
  props: {
    value: {
      type: LandbaseInfo,
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
    landbaseInfo(): LandbaseInfo {
      return this.value;
    },
    unmatchModes(): boolean[] {
      const modes = this.landbaseInfo.landbases.map((v) => v.mode);
      if (this.landbaseInfo.isDefense) {
        return modes.map((v) => v !== LB_MODE.DEFFENSE);
      }

      return modes.map((v) => v !== LB_MODE.BATTLE);
    },
  },
  methods: {
    setInfo() {
      const builder: LandbaseInfoBuilder = {
        info: this.landbaseInfo,
        isDefense: this.isDefenseMode,
        difficultyLevel: this.difficultyLevel,
      };
      this.$emit('input', new LandbaseInfo(builder));
    },
    async showItemList(index: number, slot: number) {
      this.dialogTarget = [index, slot];
      const base = this.landbaseInfo.landbases[index];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(base);
    },
    equipItem(item: ItemMaster) {
      const index = this.dialogTarget[0];
      const slot = this.dialogTarget[1];
      const base = this.landbaseInfo.landbases[index];
      if (base) {
        if (slot < base.items.length) {
          // インスタンス化用のいろいろ用意
          let initialSlot = base.items[slot].fullSlot ? base.items[slot].fullSlot : 18;
          let initialLevel = 0;

          if (Const.RECONNAISSANCES.includes(item.apiTypeId)) {
            // 偵察機の場合、搭載数関係はすべて4機制限
            initialSlot = 4;
          } else if (item.apiTypeId === 53) {
            // 大型陸上機は9機
            initialSlot = 9;
          }
          if (Const.FIGHTERS.includes(item.apiTypeId)) {
            // 戦闘機系設置時は熟練度最大
            initialLevel = 100;
          }

          const builder: ItemBuilder = { master: item, slot: initialSlot, level: initialLevel };
          base.items[slot] = new Item(builder);
          this.itemListDialog = false;
        }

        const builder: LandbaseBuilder = { landbase: base };
        if (base.mode === LB_MODE.WAIT && base.items.some((v) => v.data.id > 0 && v.fullSlot > 0)) {
          // 待機札だった場合は出撃か防空札に変更
          builder.mode = this.isDefenseMode ? LB_MODE.DEFFENSE : LB_MODE.BATTLE;
        }
        // リアクティブ再登録
        this.landbaseInfo.landbases[index] = new Landbase(builder);
        this.setInfo();
      }
    },
  },
});
</script>
