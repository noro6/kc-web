<template>
  <item-status-view v-model="value" :bonus="bonus" :dense="true" :dark="true"></item-status-view>
</template>

<script lang="ts">
import Vue from 'vue';
import Item from '@/classes/item/item';
import ItemStatusView from '@/components/item/ItemStatusView.vue';

export default Vue.extend({
  name: 'ItemTooltip',
  components: { ItemStatusView },
  props: {
    value: {
      type: Item,
      required: true,
    },
    bonus: {
      type: String,
      default: '',
    },
  },
});
</script>
