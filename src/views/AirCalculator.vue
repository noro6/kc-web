<template>
  <div class="my-5" @dragover.prevent @drop="dropItem">
    <div id="landbase-frame">
      <landbase-all v-model="calcManager.landbaseInfo"></landbase-all>
    </div>
    <div id="fleet-frame" v-show="!calcManager.isDefense">
      <fleet-all v-model="calcManager.fleetInfo"></fleet-all>
    </div>
    <div id="enemy-frame">
      <enemy-fleet-all v-model="calcManager.battleInfo" :is-defense="calcManager.isDefense"></enemy-fleet-all>
    </div>
  </div>
</template>

<style scoped>
#landbase-frame,
#fleet-frame,
#enemy-frame {
  margin: 0 auto;
  max-width: 1200px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyFleetAll from '@/components/enemy/EnemyFleetAll.vue';
import LandbaseAll from '@/components/landbase/LandbaseAll.vue';
import FleetAll from '@/components/fleet/FleetAll.vue';
import CalcManager from '@/classes/calcManager';

export default Vue.extend({
  name: 'AirCalculator',
  components: {
    LandbaseAll,
    FleetAll,
    EnemyFleetAll,
  },
  data: () => ({
    calcManager: new CalcManager(),
  }),
  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setCalcManager') {
        this.calcManager = state.calcManager;
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
