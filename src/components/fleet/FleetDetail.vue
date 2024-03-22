<template>
  <v-card class="pa-2 detail-card">
    <div class="d-flex px-2 py-1 align-center">
      <div>{{ $t("Fleet.艦隊詳細") }}</div>
      <v-spacer />
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider class="mb-sm-1" />
    <div class="px-1">
      <v-tabs v-model="tab" show-arrows class="header-tabs">
        <v-tab href="#status">{{ $t("Fleet.艦隊ステータス") }}</v-tab>
        <v-tab href="#stage2">{{ $t("Fleet.対空砲火") }}</v-tab>
        <v-tab href="#contact">{{ $t("Fleet.触接") }}</v-tab>
        <v-tab href="#aircraft-night-attack-power">{{ $t("Fleet.夜間航空攻撃") }}</v-tab>
        <v-tab href="#airstrike">{{ $t("Fleet.航空戦火力") }}</v-tab>
        <v-tab href="#airstrike-support">{{ $t("Fleet.航空支援火力") }}</v-tab>
        <v-tab href="#anti-submarine">{{ $t("Fleet.対潜支援火力") }}</v-tab>
      </v-tabs>
    </div>
    <v-divider />
    <v-tabs-items class="detail-fleet" v-model="tab" touchless>
      <v-tab-item value="status">
        <fleet-status :fleet="fleet" />
      </v-tab-item>
      <v-tab-item value="stage2">
        <anti-air-calculator :fleet="fleet" ref="antiAirCalculator" />
      </v-tab-item>
      <v-tab-item value="contact">
        <contact-rates :fleet="fleet" ref="contactRates" />
      </v-tab-item>
      <v-tab-item value="aircraft-night-attack-power">
        <aircraft-night-attack-power :fleet="fleet" />
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  overscroll-behavior: contain;
}
.detail-fleet {
  overflow-y: auto;
}
@media (min-width: 660px) {
  .detail-card {
    display: block;
    flex-direction: unset;
    height: unset;
    overflow-y: auto;
  }
  .detail-fleet {
    overflow-y: auto;
    height: 75vh;
  }
}
.v-tab {
  text-transform: none;
}

.header-tabs >>> div.v-slide-group__next,
.header-tabs >>> div.v-slide-group__prev {
  min-width: unset !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Fleet from '@/classes/fleet/fleet';
import FleetStatus from '@/components/fleet/FleetStatus.vue';
import ContactRates from '@/components/result/ContactRates.vue';
import AntiAirCalculator from '@/components/result/AntiAirCalculator.vue';
import AirstrikeSupport from '@/components/result/AirstrikeSupport.vue';
import AntiSubmarineSupport from '@/components/result/AntiSubmarineSupport.vue';
import AirstrikeCalculatorWrapper from '@/components/result/AirstrikeCalculatorWrapper.vue';
import AircraftNightAttackPower from '@/components/result/AircraftNightAttackPower.vue';

export default Vue.extend({
  name: 'FleetDetail',
  components: {
    FleetStatus,
    AirstrikeSupport,
    AntiSubmarineSupport,
    AntiAirCalculator,
    ContactRates,
    AirstrikeCalculatorWrapper,
    AircraftNightAttackPower,
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
    tab: 'status',
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
