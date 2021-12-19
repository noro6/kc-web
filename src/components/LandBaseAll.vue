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
    <div class="d-flex">
      <draggable
        class="d-flex"
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
    </div>
  </v-card>
</template>

<style scoped>
.theme--dark.v-card {
  background-color: rgb(25, 25, 28);
}
.land-base-all {
  display: inline-block;
}
.switch-defense .v-label {
  font-size: 1em;
}
.v-input--selection-controls {
  margin: 0.6rem 0.5rem;
}
</style>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import Item from '@/classes/Item';
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
          this.$set(base.items, slot, new Item(item));
          if (Const.RECONNAISSANCES.includes(item.apiTypeId)) {
            // 偵察機の場合4機
            base.items[slot].max = 4;
            base.items[slot].slot = 4;
            base.items[slot].init = 4;
          } else {
            // それ以外は18機
            base.items[slot].max = 18;
            base.items[slot].init = 18;
            if (!base.items[slot].slot) {
              base.items[slot].slot = 18;
            }
          }
          if (Const.FIGHTERS.includes(item.apiTypeId)) {
            // 戦闘機系設置時は熟練度最大
            base.items[slot].level = 120;
          }

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
