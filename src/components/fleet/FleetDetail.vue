<template>
  <v-card class="pa-2 detail-card">
    <div class="d-flex pb-1">
      <div class="align-self-center ml-3">{{ $t("Fleet.艦隊詳細") }}</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider class="mb-1"></v-divider>
    <v-tabs v-model="tab" show-arrows>
      <v-tab href="#stage2">{{ $t("Fleet.対空砲火") }}</v-tab>
      <v-tab href="#contact">{{ $t("Fleet.触接") }}</v-tab>
      <v-tab href="#airstrike">{{ $t("Fleet.航空戦火力") }}</v-tab>
      <v-tab href="#airstrike-support">{{ $t("Fleet.航空支援火力") }}</v-tab>
      <v-tab href="#anti-submarine">{{ $t("Fleet.対潜支援火力") }}</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-tabs-items class="detail-fleet" v-model="tab">
      <v-tab-item value="stage2">
        <anti-air-calculator :fleet="fleet" ref="antiAirCalculator" />
      </v-tab-item>
      <v-tab-item value="contact">
        <contact-rates :fleet="fleet" ref="contactRates" />
      </v-tab-item>
      <v-tab-item value="airstrike">
        <airstrike-calculator-wrapper :fleet="fleet" />
      </v-tab-item>
      <v-tab-item value="airstrike-support">
        <airstrike-support :fleet="fleet" />
      </v-tab-item>
      <v-tab-item value="anti-submarine">
        <anti-submarine-support :fleet="fleet" />
      </v-tab-item>
    </v-tabs-items>
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
.v-tab {
  text-transform: none;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Fleet from '@/classes/fleet/fleet';
import ContactRates from '@/components/result/ContactRates.vue';
import AntiAirCalculator from '@/components/result/AntiAirCalculator.vue';
import AirstrikeSupport from '@/components/result/AirstrikeSupport.vue';
import AntiSubmarineSupport from '@/components/result/AntiSubmarineSupport.vue';
import AirstrikeCalculatorWrapper from '@/components/result/AirstrikeCalculatorWrapper.vue';

export default Vue.extend({
  name: 'FleetDetail',
  components: {
    AirstrikeSupport,
    AntiSubmarineSupport,
    AntiAirCalculator,
    ContactRates,
    AirstrikeCalculatorWrapper,
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
