<template>
  <div>
    <h1>AirCalculator</h1>
    <div>
      <land-base-all></land-base-all>
    </div>
    <div>
      <enemy-fleet-all></enemy-fleet-all>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LandBaseAll from '@/components/LandBaseAll.vue';
import EnemyFleetAll from '@/components/EnemyFleetAll.vue';

export default Vue.extend({
  name: 'AirCalculator',
  components: {
    LandBaseAll,
    EnemyFleetAll,
  },
});
</script>
