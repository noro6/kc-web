<template>
  <v-card class="pa-2 detail-card">
    <div class="pa-2">艦隊詳細</div>
    <v-divider class="mb-1"></v-divider>
    <v-tabs v-model="tab">
      <v-tab href="#stage2">対空砲火</v-tab>
      <v-tab href="#contact">触接</v-tab>
      <v-tab-item value="stage2" class="detail-fleet">
        <v-divider></v-divider>
        <anti-air-calculator :fleet="fleet" ref="antiAirCalculator" />
      </v-tab-item>
      <v-tab-item value="contact" class="detail-fleet">
        <v-divider></v-divider>
        <contact-rates :fleet="fleet" />
      </v-tab-item>
    </v-tabs>
  </v-card>
</template>

<style scoped>
.detail-card {
  overflow-y: auto;
}
.detail-fleet {
  overflow-y: auto;
  height: 66vh;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Fleet from '@/classes/fleet/fleet';
import AntiAirCalculator from '@/components/result/AntiAirCalculator.vue';
import ContactRates from '@/components/result/ContactRates.vue';

export default Vue.extend({
  name: 'FleetDetail',
  components: {
    AntiAirCalculator,
    ContactRates,
  },
  props: {
    fleet: {
      type: Fleet,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    isUnion: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    tab: 'stage2',
  }),
});
</script>
