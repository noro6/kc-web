<template>
  <div class="ma-3 d-flex">
    <land-base :no="1" :handle-show-item-list="showItemList" />
    <land-base :no="2" :handle-show-item-list="showItemList" />
    <land-base :no="3" :handle-show-item-list="showItemList" />
    <v-dialog v-model="itemListDialog" width="800">
      <item-list />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LandBase from '@/components/LandBase.vue';
import ItemList from '@/components/ItemList.vue';

export default Vue.extend({
  name: 'Home',
  components: {
    LandBase,
    ItemList,
  },
  data: () => ({
    itemListDialog: false,
  }),
  methods: {
    showItemList() {
      this.itemListDialog = true;
    },
  },
});
</script>
