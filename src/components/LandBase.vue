<template>
  <div class="px-1">
    <div>第{{ landbase.no }}基地航空隊</div>
    <v-card outlined elevation="2">
      <item-input
        v-for="(item, index) in landbase.items"
        :key="index"
        :item="item"
        :handle-show-item-list="showItemList"
      />
    </v-card>
  </div>
</template>

<style scoped></style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from './ItemInput.vue';
import LandBase from '@/classes/LandBase';
import Item from '@/classes/Item';

export default Vue.extend({
  components: { ItemInput },
  name: 'LandBase',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    no: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    landbase: new LandBase(),
  }),
  mounted() {
    this.landbase = new LandBase();
    this.landbase.no = this.no;
    for (let i = 0; i < 4; i += 1) {
      const item = new Item();
      item.name = new Date().getTime().toString(16);
      item.slot = Math.floor(Math.random() * 46);
      item.remodel = Math.floor(Math.random() * 11);
      item.level = Math.floor(Math.random() * 121);
      this.landbase.items.push(item);
    }
  },
  methods: {
    showItemList() {
      this.handleShowItemList();
    },
  },
});
</script>
