<template>
  <v-card class="mx-5 my-2 px-1 py-2 land-base-all">
    <div class="pa-2">基地航空隊</div>
    <v-divider></v-divider>
    <div class="d-flex">
      <div class="align-self-center switch-defense">
        <v-switch v-model="isDefenseMode" hide-details :label="'防空計算モード'"></v-switch>
      </div>
      <v-spacer></v-spacer>
    </div>
    <v-tabs class="small-landbases" v-model="tab" vertical>
      <v-tab href="#base1">
        <div class="land-base-tab-text d-none d-sm-block">第1基地航空隊</div>
        <div class="land-base-tab-text d-sm-none">第1航空隊</div>
      </v-tab>
      <v-tab href="#base2">
        <div class="land-base-tab-text d-none d-sm-block">第2基地航空隊</div>
        <div class="land-base-tab-text d-sm-none">第2航空隊</div>
      </v-tab>
      <v-tab href="#base3">
        <div class="land-base-tab-text d-none d-sm-block">第3基地航空隊</div>
        <div class="land-base-tab-text d-sm-none">第3航空隊</div>
      </v-tab>
      <v-tab-item value="base1" class="py-1">
        <land-base :land-base="landBaseInfo.landBases[0]" :handle-show-item-list="showItemList"></land-base>
      </v-tab-item>
      <v-tab-item value="base2" class="py-1">
        <land-base :land-base="landBaseInfo.landBases[1]" :handle-show-item-list="showItemList"></land-base>
      </v-tab-item>
      <v-tab-item value="base3" class="py-1">
        <land-base :land-base="landBaseInfo.landBases[2]" :handle-show-item-list="showItemList"></land-base>
      </v-tab-item>
    </v-tabs>
    <draggable
      class="normal-landbases"
      v-model="landBaseInfo.landBases"
      :options="{ handle: '.land-base-title', animation: 150 }"
      @end="dragEnd()"
    >
      <land-base
        v-for="(landBase, index) in landBaseInfo.landBases"
        :key="index"
        :land-base="landBase"
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
import Const from '@/classes/Const';
import ItemMaster from '@/classes/ItemMaster';
import LandBaseInfo from '@/classes/LandBaseInfo';
import LandBase from '@/components/LandBase.vue';
import ItemList from '@/components/ItemList.vue';

export default Vue.extend({
  name: 'LandBaseAll',
  components: {
    LandBase,
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
  mounted() {
    const info = this.landBaseInfo;
    for (let i = 0; i < info.landBases.length; i += 1) {
      const base = info.landBases[i];
      base.no = i + 1;
      base.items = [new Item(), new Item(), new Item(), new Item()];
    }
  },
  methods: {
    async showItemList(no: number, slot: number) {
      this.dialogTarget = [no, slot];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(Const.PLANE_TYPES);
    },
    dragEnd() {
      for (let i = 0; i < this.landBaseInfo.landBases.length; i += 1) {
        this.landBaseInfo.landBases[i].no = i + 1;
      }
    },
    equipItem(item: ItemMaster) {
      const no = this.dialogTarget[0];
      const slot = this.dialogTarget[1];
      const base = this.landBaseInfo.landBases.find((v) => v.no === no);
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

        if (base.mode === Const.MODE_WAIT && base.items.some((v) => v.data.id > 0 && v.slot > 0)) {
          base.mode = Const.MODE_BATTLE;
        }
      }
    },
  },
});
</script>
