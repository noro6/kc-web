<template>
  <div class="my-5">
    <div id="landbase-frame">
      <land-base-all></land-base-all>
    </div>
    <div id="fleet-frame">
      <fleet-all></fleet-all>
    </div>
    <div id="enemy-frame">
      <enemy-fleet-all></enemy-fleet-all>
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
import LandBaseAll from '@/components/LandBaseAll.vue';
import FleetAll from '@/components/FleetAll.vue';
import EnemyFleetAll from '@/components/EnemyFleetAll.vue';

export default Vue.extend({
  name: 'AirCalculator',
  components: {
    LandBaseAll,
    FleetAll,
    EnemyFleetAll,
  },
});
</script>
