<template>
  <v-card>
    <div class="d-flex px-2 pt-2 pb-1">
      <div class="align-self-center ml-3">基地航空隊派遣先設定</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <div class="px-4 target-buttons" v-for="(lb, i) in info.landbases" :key="i">
      <v-divider></v-divider>
      <div class="py-3">
        <div v-for="(t, j) in lb.battleTarget" :key="j" class="d-flex ml-5">
          <div class="align-self-center body-2 mr-3">第{{ i + 1 }}基地航空隊 第{{ j + 1 }}波</div>
          <v-btn-toggle v-model="lb.battleTarget[j]" mandatory dense tile color="success">
            <v-btn v-for="battle in battleCount" :key="battle" :value="battle - 1">{{ battle }}</v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped>
.target-buttons .v-btn-toggle .v-btn.v-btn.v-size--default {
  min-width: 36px;
}
.target-buttons .v-btn-toggle--group > .v-btn.v-btn {
  margin: 0;
}
.target-buttons .v-btn.v-btn--has-bg {
  background-color: transparent !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import LandbaseInfo from '@/classes/landbase/landbaseInfo';

export default Vue.extend({
  components: {},
  name: 'LandbaseTarget',
  props: {
    value: {
      type: LandbaseInfo,
      required: true,
    },
    battleCount: {
      type: Number,
      required: true,
    },
    handleClose: {
      type: Function,
    },
  },
  data: () => ({}),
  computed: {
    info(): LandbaseInfo {
      return this.value;
    },
  },
  methods: {
    close() {
      this.handleClose();
    },
  },
});
</script>
