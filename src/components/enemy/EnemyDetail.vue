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
    <v-tabs v-model="tab">
      <v-tab href="#fleet">{{ $t("Fleet.艦隊情報") }}</v-tab>
      <v-tab href="#stage2">{{ $t("Fleet.対空砲火") }}</v-tab>
      <v-tab href="#contact">{{ $t("Fleet.触接") }}</v-tab>
      <v-tab-item value="fleet" class="detail-fleet">
        <v-divider></v-divider>
        <div class="ma-1">
          <div class="d-flex air-power-info flex-wrap">
            <div class="text--secondary label-text body-2">{{ $t("Common.制空") }}:</div>
            <div class="value-text mr-3">{{ fleet.fullAirPower }}</div>
            <div>
              <v-chip class="mr-1" color="green" label outlined>
                <span>{{ $t("Common.確保") }}:</span>
                <span class="chip-value">{{ fleet.fullBorders[0] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="light-green" label outlined>
                <span>{{ $t("Common.優勢") }}:</span>
                <span class="chip-value">{{ fleet.fullBorders[1] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="orange" label outlined>
                <span>{{ $t("Common.拮抗") }}:</span>
                <span class="chip-value">{{ fleet.fullBorders[2] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="deep-orange" label outlined>
                <span>{{ $t("Common.劣勢") }}:</span>
                <span class="chip-value">{{ fleet.fullBorders[3] }}</span>
              </v-chip>
            </div>
          </div>
          <div class="mt-1 d-flex air-power-info flex-wrap" v-if="fleet.fullAirPower !== fleet.fullAirbaseAirPower">
            <div class="text--secondary label-text body-2">{{ $t("Common.基地制空") }}:</div>
            <div class="value-text mr-3">{{ fleet.fullAirbaseAirPower }}</div>
            <div>
              <v-chip class="mr-1" color="green" label outlined>
                <span>{{ $t("Common.確保") }}:</span>
                <span class="chip-value">{{ fleet.fullAirbaseBorders[0] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="light-green" label outlined>
                <span>{{ $t("Common.優勢") }}:</span>
                <span class="chip-value">{{ fleet.fullAirbaseBorders[1] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="orange" label outlined>
                <span>{{ $t("Common.拮抗") }}:</span>
                <span class="chip-value">{{ fleet.fullAirbaseBorders[2] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="deep-orange" label outlined>
                <span>{{ $t("Common.劣勢") }}:</span>
                <span class="chip-value">{{ fleet.fullAirbaseBorders[3] }}</span>
              </v-chip>
            </div>
          </div>
        </div>
        <v-divider></v-divider>
        <div>
          <div class="mt-3 mb-5">
            <div v-if="fleet.isUnion" class="d-flex">
              <div class="align-self-center px-2 primary--text">{{ $t("Fleet.第x艦隊", { number: 1 }) }}</div>
              <div class="align-self-center body-2 ml-4 text--secondary">{{ $t("Common.制空値") }}:</div>
              <div class="align-self-center body-2 ml-1">{{ fleet.mainAirPower }}</div>
              <div class="align-self-center body-2 ml-4 text--secondary">{{ $t("Common.基地制空") }}:</div>
              <div class="align-self-center body-2 ml-1">{{ fleet.mainAirbaseAirPower }}</div>
            </div>
            <div class="enemy-inputs-container">
              <enemy-input
                v-for="(enemy, i) in fleet.mainEnemies"
                :key="i"
                :enemy="enemy"
                :handle-show-item-list="showItemList"
              ></enemy-input>
            </div>
          </div>
          <v-divider v-if="fleet.isUnion"></v-divider>
          <div v-if="fleet.isUnion" class="my-3">
            <div class="d-flex">
              <div class="align-self-center px-2 success--text">{{ $t("Fleet.第x艦隊", { number: 2 }) }}</div>
              <div class="align-self-center body-2 ml-4 text--secondary">{{ $t("Common.制空値") }}:</div>
              <div class="align-self-center body-2 ml-1">{{ fleet.escortAirPower }}</div>
              <div class="align-self-center body-2 ml-4 text--secondary">{{ $t("Common.基地制空") }}:</div>
              <div class="align-self-center body-2 ml-1">{{ fleet.escortAirbaseAirPower }}</div>
            </div>
            <div class="enemy-inputs-container">
              <enemy-input
                v-for="(enemy, i) in fleet.escortEnemies"
                :key="i"
                :enemy="enemy"
                :handle-show-item-list="showItemList"
              ></enemy-input>
            </div>
          </div>
        </div>
      </v-tab-item>
      <v-tab-item value="stage2" class="detail-fleet">
        <v-divider></v-divider>
        <anti-air-calculator :fleet="fleet" ref="antiAirCalculator" />
      </v-tab-item>
      <v-tab-item value="contact" class="detail-fleet">
        <v-divider></v-divider>
        <contact-rates :fleet="fleet" ref="contactRates" />
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
.air-power-info > * {
  align-self: center;
}
.air-power-info .label-text {
  width: 96px;
}
.air-power-info .value-text {
  width: 40px;
  text-align: right;
}

.enemy-inputs-container {
  grid-template-columns: 1fr;
  display: grid;
}
@media (min-width: 660px) {
  .enemy-inputs-container {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1060px) {
  .enemy-inputs-container {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.chip-value {
  font-weight: 500;
}
.v-tab {
  text-transform: none;
}
</style>

<script lang="ts">
import Vue from 'vue';
import AntiAirCalculator from '@/components/result/AntiAirCalculator.vue';
import ContactRates from '@/components/result/ContactRates.vue';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import EnemyInput from './EnemyInput.vue';

export default Vue.extend({
  components: {
    EnemyInput,
    AntiAirCalculator,
    ContactRates,
  },
  name: 'EnemyDetail',
  props: {
    handleShowItemList: {
      type: Function,
    },
    fleet: {
      type: EnemyFleet,
      required: true,
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
    showItemList(enemyIndex: number, slotIndex: number): void {
      // 敵の装備変更
      this.handleShowItemList(enemyIndex, slotIndex);
    },
    close() {
      this.handleClose();
    },
  },
});
</script>
