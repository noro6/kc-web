<template>
  <v-card class="ma-5 px-1 py-2 land-base-all">
    <div class="pa-2">敵艦隊</div>
    <v-divider></v-divider>
    <div class="d-flex ma-2">
      <div class="align-self-center">
        <v-btn color="primary">海域マップから一括入力</v-btn>
      </div>
      <v-spacer></v-spacer>
    </div>
    <div class="d-flex">
      <enemy-fleet></enemy-fleet>
      <enemy-fleet></enemy-fleet>
      <enemy-fleet></enemy-fleet>
    </div>
  </v-card>
</template>

<style scoped></style>

<script lang="ts">
import Vue from 'vue';
import EnemyFleet from '@/components/EnemyFleet.vue';

export default Vue.extend({
  name: 'EnemyFleetAll',
  components: { EnemyFleet },
  data: () => ({}),
});
</script>
