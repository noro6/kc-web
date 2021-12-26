<template>
  <v-card class="mx-5 my-2 px-1 py-2 land-base-all">
    <div class="pa-2">基地航空隊</div>
    <v-divider></v-divider>
    <div>
      <div class="d-flex">
        <v-switch v-model="isDefenseMode" dense hide-details :label="'防空計算モード'" @change="setInfo"></v-switch>
        <v-spacer></v-spacer>
      </div>
      <div class="d-flex ml-3 mb-2" v-if="isDefenseMode">
        <div class="align-self-center text--secondary body-2">防空時制空値:</div>
        <div class="align-self-center ml-1">{{ landBaseInfo.defenseAirPower }}</div>
        <div class="ml-5 align-self-center text--secondary body-2">対重爆制空値:</div>
        <div class="align-self-center ml-1">{{ landBaseInfo.highDefenseAirPower }}</div>
        <div class="ml-5 align-self-center text--secondary body-2">対重爆補正:</div>
        <div class="align-self-center ml-1 body-2">&times;{{ landBaseInfo.highDeffenseCoefficient }}</div>
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
      <v-tab-item v-for="(lb, i) in landBaseInfo.landBases" :key="i" :value="`base${i + 1}`" class="py-1">
        <land-base-comp
          v-model="landBaseInfo.landBases[i]"
          :index="i"
          :handle-show-item-list="showItemList"
          @input="setInfo"
          :is-defense="isDefenseMode"
        />
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
        :is-defense="isDefenseMode"
        :handle-show-item-list="showItemList"
        @input="setInfo"
      />
    </draggable>
    <div v-if="isDefenseMode" class="d-flex mt-3">
      <div class="mx-1 text--secondary body-2">{{ resultLabel }}</div>
      <div class="align-self-center flex-grow-1">
        <div class="d-flex">
          <div class="status-bar-label" style="width: 10%">
            <div>喪失</div>
          </div>
          <div class="status-bar-divide"></div>
          <div class="status-bar-label" style="width: 10%">
            <div>劣勢</div>
          </div>
          <div class="status-bar-divide"></div>
          <div class="status-bar-label" style="width: 25%">
            <div>拮抗</div>
          </div>
          <div class="status-bar-divide"></div>
          <div class="status-bar-label" style="width: 45%">
            <div>優勢</div>
          </div>
          <div class="status-bar-divide"></div>
          <div class="status-bar-label" style="width: 10%">
            <div>確保</div>
          </div>
        </div>
        <div>
          <v-progress-linear :color="resultBarColor" :value="resultBarValue"></v-progress-linear>
        </div>
      </div>
    </div>
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

.status-reuslt-label {
  text-align: center;
  position: relative;
  white-space: nowrap;
  font-size: 11px;
  width: 100%;
  bottom: 4px;
}
.status-bar-label {
  margin-bottom: 2px;
  text-align: center;
  border-bottom: 1px solid #888;
  position: relative;
}
.status-bar-label > div {
  opacity: 0.8;
  bottom: -2px;
  width: 100%;
  font-size: 11px;
  white-space: nowrap;
  position: absolute;
}
.status-bar-divide {
  align-self: flex-end;
  height: 10px;
  border-right: 1px solid #888;
  margin-bottom: 2px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import Item, { ItemBuilder } from '@/classes/Item/Item';
import Const, { LB_MODE, DIFFICULTY_LEVEL } from '@/classes/Const';
import ItemMaster from '@/classes/Item/ItemMaster';
import LandBaseInfo, { LandBaseInfoBuilder } from '@/classes/LandBase/LandBaseInfo';
import LandBaseComp from '@/components/LandBase/LandBase.vue';
import ItemList from '@/components/Item/ItemList.vue';
import LandBase, { LandBaseBuilder } from '@/classes/LandBase/LandBase';

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
    resultLabel() {
      const { airState } = this.value.landBases[0].resultWave1;
      const status = Const.AIR_STATUS.find((v) => v.value === airState);
      return status ? status.text : '';
    },
    resultBarValue() {
      return this.value.landBases[0].resultWave1.airStateBarWidth;
    },
    resultBarColor() {
      const value = this.value.landBases[0].resultWave1.airStateBarWidth;
      if (value >= 90) {
        return 'success';
      }
      if (value >= 45) {
        return 'light-green';
      }
      if (value >= 20) {
        return 'yellow';
      }
      if (value >= 10) {
        return 'orange';
      }
      return 'red';
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
