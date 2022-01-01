<template>
  <v-card class="mx-1 py-2"> タゲ </v-card>
</template>

<style scoped></style>

<script lang="ts">
import Vue from 'vue';
import LandbaseInfo from '@/classes/landbase/landbaseInfo';

export default Vue.extend({
  components: {},
  name: 'LandbaseTarget',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    value: {
      type: LandbaseInfo,
      required: true,
    },
  },
  data: () => ({}),
  computed: {},
  methods: {},
});
</script>
