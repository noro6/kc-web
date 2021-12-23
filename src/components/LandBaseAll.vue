<template>
  <v-card class="mx-5 my-2 px-1 py-2 land-base-all">
    <div class="pa-2">基地航空隊</div>
    <v-divider></v-divider>
    <div>
      <div class="switch-defense d-flex">
        <v-switch v-model="isDefenseMode" hide-details :label="'防空計算モード'" @change="changedMode"></v-switch>
        <v-spacer></v-spacer>
      </div>
      <div class="ml-3 mb-2" v-show="isDefenseMode">
        <span class="text--secondary">防空時制空値:</span>
        <span class="ml-1 font-weight-medium">{{ landBaseInfo.defenseAirPower }}</span>
      </div>
    </div>
    <v-tabs class="small-landbases" v-model="tab" vertical>
      <v-tab v-for="i in 3" :key="i" :href="`#base${i}`">
        <div class="land-base-tab-text d-none d-sm-block">第{{ i }}基地航空隊</div>
        <div class="land-base-tab-text d-sm-none">第{{ i }}航空隊</div>
      </v-tab>
      <v-tab-item v-for="(lb, i) in landBaseInfo.landBases" :key="i" :value="`base${i + 1}`" class="py-1">
        <land-base-comp v-model="landBaseInfo.landBases[i]" :handle-show-item-list="showItemList" />
      </v-tab-item>
    </v-tabs>
    <draggable
      class="normal-landbases"
      v-model="landBaseInfo.landBases"
      :options="{ handle: '.land-base-title', animation: 150 }"
      @end="dragEnd()"
    >
      <land-base-comp
        v-for="(lb, i) in landBaseInfo.landBases"
        :key="i"
        :class="{ unmatch: unmatchModes[i] }"
        v-model="landBaseInfo.landBases[i]"
        :handle-show-item-list="showItemList"
      />
    </draggable>
    <v-dialog v-model="itemListDialog" width="1200">
      <item-list ref="itemList" :handle-equip-item="equipItem" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.theme--dark.v-card {
  background-color: rgb(25, 25, 28);
}
.switch-defense .v-label {
  font-size: 1em;
}
.v-input--selection-controls {
  margin: 0.6rem 0.5rem;
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
import Const, { LB_MODE } from '@/classes/Const';
import ItemMaster from '@/classes/ItemMaster';
import LandBaseInfo from '@/classes/LandBaseInfo';
import LandBaseComp from '@/components/LandBase.vue';
import ItemList from '@/components/ItemList.vue';
import LandBase from '@/classes/LandBase';

export default Vue.extend({
  name: 'LandBaseAll',
  components: {
    LandBaseComp,
    ItemList,
    draggable,
  },
  data: () => ({
    landBaseInfo: new LandBaseInfo(),
    itemListDialog: false,
    isDefenseMode: false,
    dialogTarget: [-1, -1],
    tab: 0,
  }),
  watch: {
    landBaseInfo: {
      handler() {
        console.log('★ watch LandBaseInfo Updated');
      },
      deep: true,
    },
  },
  computed: {
    unmatchModes(): boolean[] {
      const modes = this.landBaseInfo.landBases.map((v) => v.mode);
      if (this.landBaseInfo.isDefense) {
        return modes.map((v) => v !== LB_MODE.DEFFENSE);
      }

      return modes.map((v) => v !== LB_MODE.BATTLE);
    },
  },
  methods: {
    async showItemList(no: number, slot: number) {
      this.dialogTarget = [no, slot];
      const index = this.landBaseInfo.landBases.findIndex((v) => v.no === no);
      const base = this.landBaseInfo.landBases[index];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(base);
    },
    changedMode() {
      this.landBaseInfo = new LandBaseInfo(this.isDefenseMode, this.landBaseInfo.landBases.concat());
    },
    dragEnd() {
      for (let i = 0; i < this.landBaseInfo.landBases.length; i += 1) {
        this.landBaseInfo.landBases[i].no = i + 1;
      }
    },
    equipItem(item: ItemMaster) {
      const no = this.dialogTarget[0];
      const slot = this.dialogTarget[1];
      const index = this.landBaseInfo.landBases.findIndex((v) => v.no === no);

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
          this.$set(base.items, slot, new Item(builder));
          this.itemListDialog = false;
        }

        let landBase: LandBase;
        if (base.mode === LB_MODE.WAIT && base.items.some((v) => v.data.id > 0 && v.slot > 0)) {
          // 待機札だった場合は出撃札に変更してインスタンス化
          landBase = new LandBase(base.no, this.isDefenseMode ? LB_MODE.DEFFENSE : LB_MODE.BATTLE, base.items);
        } else {
          // 特に札は変更せずインスタンス化
          landBase = new LandBase(base.no, base.mode, base.items);
        }
        // リアクティブ再登録
        this.$set(this.landBaseInfo.landBases, index, landBase);
      }
    },
  },
});
</script>
