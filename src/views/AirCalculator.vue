<template>
  <div class="my-5" @dragover.prevent @drop="dropItem">
    <div class="content-frame">
      <landbase-all v-model="calcManager.landbaseInfo" />
    </div>
    <div class="content-frame" v-show="!calcManager.isDefense">
      <fleet-all v-model="calcManager.fleetInfo" />
    </div>
    <div class="content-frame">
      <enemy-fleet-all v-model="calcManager.battleInfo" :landbase-info="calcManager.landbaseInfo" :is-defense="calcManager.isDefense" />
    </div>
    <div class="content-frame">
      <main-result v-model="calcManager" v-show="!calcManager.isDefense" />
    </div>
  </div>
</template>

<style scoped>
.content-frame {
  margin: 0 auto;
  max-width: 1200px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyFleetAll from '@/components/enemy/EnemyFleetAll.vue';
import LandbaseAll from '@/components/landbase/LandbaseAll.vue';
import MainResult from '@/components/result/MainResult.vue';
import FleetAll from '@/components/fleet/FleetAll.vue';
import CalcManager from '@/classes/calcManager';

export default Vue.extend({
  name: 'AirCalculator',
  components: {
    LandbaseAll,
    FleetAll,
    EnemyFleetAll,
    MainResult,
  },
  data: () => ({
    calcManager: new CalcManager(),
  }),
  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setCalcManager') {
        const newManager = state.calcManager as CalcManager;
        if (!newManager) {
          return;
        }

        if (newManager.landbaseInfo.landbases.some((v) => v.items.some((i) => i.data.id > 0))) {
          this.calcManager.landbaseInfo = newManager.landbaseInfo;
        }
        if (newManager.fleetInfo.fleets.some((v) => v.ships.some((s) => s.data.id > 0))) {
          this.calcManager.fleetInfo = newManager.fleetInfo;
        }

        this.calcManager.updateInfo();
      }
    });
  },
  watch: {
    'calcManager.landbaseInfo': {
      handler() {
        this.calcManager.updateInfo();
      },
    },
    'calcManager.fleetInfo': {
      handler() {
        this.calcManager.updateInfo();
      },
    },
    'calcManager.battleInfo': {
      handler() {
        this.calcManager.updateInfo();
      },
    },
  },
  methods: {
    dropItem() {
      // ドラッグ中itemをドロップ時消すフラグを建てる
      const draggingDiv = document.getElementById('dragging-item') as HTMLDivElement;
      draggingDiv.classList.add('delete-flg');
    },
  },
});
</script>
