<template>
  <v-card class="pa-2 detail-card">
    <div class="d-flex pb-1">
      <div class="align-self-center ml-3">艦隊詳細</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider class="mb-1"></v-divider>
    <v-tabs v-model="tab">
      <v-tab href="#stage2">対空砲火</v-tab>
      <v-tab href="#contact">触接</v-tab>
      <v-tab href="#anti-submarine-calculator">対潜支援火力</v-tab>
      <v-tab-item value="stage2" class="detail-fleet">
        <v-divider></v-divider>
        <anti-air-calculator :fleet="fleet" ref="antiAirCalculator" />
      </v-tab-item>
      <v-tab-item value="contact" class="detail-fleet">
        <v-divider></v-divider>
        <contact-rates :fleet="fleet" ref="contactRates" />
      </v-tab-item>
      <v-tab-item value="anti-submarine-calculator" class="detail-fleet">
        <v-divider></v-divider>
        <anti-submarine-support :fleet="fleet" />
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
import ContactRates from '@/components/result/ContactRates.vue';
import AntiAirCalculator from '@/components/result/AntiAirCalculator.vue';
import AntiSubmarineSupport from '@/components/result/AntiSubmarineSupport.vue';

export default Vue.extend({
  name: 'FleetDetail',
  components: {
    AntiSubmarineSupport,
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
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    tab: 'stage2',
  }),
  mounted() {
    const contact = this.$refs.contactRates as InstanceType<typeof ContactRates>;
    if (contact) {
      contact.calculate();
    }
    const antiAirCalculator = this.$refs.antiAirCalculator as InstanceType<typeof AntiAirCalculator>;
    if (antiAirCalculator) {
      antiAirCalculator.updateTable();
    }
  },
  methods: {
    close() {
      this.handleClose();
    },
  },
});
</script>
