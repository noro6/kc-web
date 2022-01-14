<template>
  <v-card class="pa-2 detail-card">
    <div class="d-flex pb-1">
      <div class="align-self-center ml-3">敵艦隊詳細</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider class="mb-1"></v-divider>
    <v-tabs v-model="tab">
      <v-tab href="#fleet">艦隊情報</v-tab>
      <v-tab href="#stage2">対空砲火</v-tab>
      <v-tab href="#contact">触接</v-tab>
      <v-tab-item value="fleet" class="detail-fleet">
        <v-divider></v-divider>
        <div class="body-1 ma-1">
          <div class="d-flex air-power-info flex-wrap">
            <div class="text--secondary label-text">制空値:</div>
            <div class="value-text mr-3">{{ fleet.fullAirPower }}</div>
            <div>
              <v-chip class="mr-1" color="green" label outlined>
                <span>確保:</span>
                <span class="chip-value">{{ fleet.fullBorders[0] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="light-green" label outlined>
                <span>優勢:</span>
                <span class="chip-value">{{ fleet.fullBorders[1] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="orange" label outlined>
                <span>拮抗:</span>
                <span class="chip-value">{{ fleet.fullBorders[2] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="deep-orange" label outlined>
                <span>劣勢:</span>
                <span class="chip-value">{{ fleet.fullBorders[3] }}</span>
              </v-chip>
            </div>
          </div>
          <div class="mt-1 d-flex air-power-info flex-wrap" v-if="fleet.fullAirPower !== fleet.fullAirbaseAirPower">
            <div class="text--secondary label-text">基地制空値:</div>
            <div class="value-text mr-3">{{ fleet.fullAirbaseAirPower }}</div>
            <div>
              <v-chip class="mr-1" color="green" label outlined>
                <span>確保:</span>
                <span class="chip-value">{{ fleet.fullAirbaseBorders[0] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="light-green" label outlined>
                <span>優勢:</span>
                <span class="chip-value">{{ fleet.fullAirbaseBorders[1] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="orange" label outlined>
                <span>拮抗:</span>
                <span class="chip-value">{{ fleet.fullAirbaseBorders[2] }}</span>
              </v-chip>
              <v-chip class="mr-1" color="deep-orange" label outlined>
                <span>劣勢:</span>
                <span class="chip-value">{{ fleet.fullAirbaseBorders[3] }}</span>
              </v-chip>
            </div>
          </div>
        </div>
        <v-divider></v-divider>
        <div>
          <div class="mt-3 mb-5">
            <div v-if="fleet.isUnion" class="d-flex">
              <div class="align-self-center px-2 primary--text">第1艦隊</div>
              <div class="align-self-center body-2 ml-4 text--secondary">制空:</div>
              <div class="align-self-center body-2 ml-1">{{ fleet.mainAirPower }}</div>
              <div class="align-self-center body-2 ml-4 text--secondary">基地制空:</div>
              <div class="align-self-center body-2 ml-1">{{ fleet.mainAirbaseAirPower }}</div>
            </div>
            <div class="enemy-inputs-container">
              <enemy-input v-for="(enemy, i) in mainEnemies" :key="i" :enemy="enemy" :handle-show-item-list="showItemList"></enemy-input>
            </div>
          </div>
          <v-divider v-if="fleet.isUnion"></v-divider>
          <div v-if="fleet.isUnion" class="my-3">
            <div class="d-flex">
              <div class="align-self-center px-2 success--text">第2艦隊</div>
              <div class="align-self-center body-2 ml-4 text--secondary">制空:</div>
              <div class="align-self-center body-2 ml-1">{{ fleet.escortAirPower }}</div>
              <div class="align-self-center body-2 ml-4 text--secondary">基地制空値:</div>
              <div class="align-self-center body-2 ml-1">{{ fleet.escortAirbaseAirPower }}</div>
            </div>
            <div class="enemy-inputs-container">
              <enemy-input v-for="(enemy, i) in escorts" :key="i" :enemy="enemy" :handle-show-item-list="showItemList"></enemy-input>
            </div>
          </div>
        </div>
      </v-tab-item>
      <v-tab-item value="stage2" class="detail-fleet">
        <v-divider></v-divider>
        <anti-air-calculator :fleet="fleet" />
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
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyInput from './EnemyInput.vue';
import AntiAirCalculator from '../result/AntiAirCalculator.vue';
import ContactRates from '../result/ContactRates.vue';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import Enemy from '@/classes/enemy/enemy';

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
  computed: {
    enemies(): Enemy[] {
      return this.fleet.enemies.filter((v) => v.data.id > 0);
    },
    mainEnemies(): Enemy[] {
      return this.fleet.enemies.filter((v) => v.data.id > 0 && !v.isEscort);
    },
    escorts(): Enemy[] {
      return this.fleet.enemies.filter((v) => v.data.id > 0 && v.isEscort);
    },
  },
  methods: {
    showItemList(): void {
      // 装備変更は許可しない
      // this.handleShowItemList(index, index);
    },
    close() {
      this.handleClose();
    },
  },
});
</script>
