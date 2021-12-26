<template>
  <div class="my-5" @dragover.prevent @drop="dropItem">
    <div id="landbase-frame">
      <land-base-all v-model="calcManager.landBaseInfo"></land-base-all>
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
import LandBaseAll from '@/components/LandBase/LandBaseAll.vue';
import FleetAll from '@/components/Fleet/FleetAll.vue';
import EnemyFleetAll from '@/components/Enemy/EnemyFleetAll.vue';
import CalcManager from '@/classes/CalcManager';

export default Vue.extend({
  name: 'AirCalculator',
  components: {
    LandBaseAll,
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
    'calcManager.landBaseInfo': {
      handler() {
        console.log('★ watch landBaseInfo Updated');
        this.calcManager.updateInfo();
      },
    },
    'calcManager.fleetInfo': {
      handler() {
        console.log('★ watch fleetInfo Updated');
        this.calcManager.updateInfo();
      },
    },
    'calcManager.battleInfo': {
      handler() {
        console.log('★ watch battleInfo Updated');
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
