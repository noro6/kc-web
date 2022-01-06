<template>
  <div class="my-5" @dragover.prevent @drop="dropItem">
    <div class="content-frame">
      <airbase-all v-model="calcManager.airbaseInfo" :battle-info="calcManager.battleInfo" />
    </div>
    <div class="content-frame" v-show="!calcManager.isDefense">
      <fleet-all v-model="calcManager.fleetInfo" />
    </div>
    <div class="content-frame">
      <enemy-fleet-all v-model="calcManager.battleInfo" :airbase-info="calcManager.airbaseInfo" :is-defense="calcManager.isDefense" />
    </div>
    <div class="content-frame">
      <main-result v-model="calcManager" v-show="!calcManager.isDefense" :handle-change-main-battle="changeMainBattle" ref="mainResult" />
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
import AirbaseAll from '@/components/airbase/AirbaseAll.vue';
import MainResult from '@/components/result/MainResult.vue';
import FleetAll from '@/components/fleet/FleetAll.vue';
import CalcManager from '@/classes/calcManager';
import BattleInfo from '@/classes/enemy/battleInfo';

export default Vue.extend({
  name: 'AirCalculator',
  components: {
    AirbaseAll,
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

        if (newManager.airbaseInfo.airbases.some((v) => v.items.some((i) => i.data.id > 0))) {
          this.calcManager.airbaseInfo = newManager.airbaseInfo;
        }
        if (newManager.fleetInfo.fleets.some((v) => v.ships.some((s) => s.data.id > 0))) {
          this.calcManager.fleetInfo = newManager.fleetInfo;
        }

        this.calculate();
      }
    });
  },
  watch: {
    'calcManager.airbaseInfo': {
      handler() {
        this.calculate();
      },
    },
    'calcManager.fleetInfo': {
      handler() {
        this.calculate();
      },
    },
    'calcManager.battleInfo': {
      handler(current: BattleInfo, old: BattleInfo) {
        if (current.fleets.length !== old.fleets.length) {
          // 戦闘回数変更を検知
          this.calcManager.mainBattle = this.calcManager.battleInfo.fleets.length - 1;
        }
        this.calculate();
      },
    },
  },
  methods: {
    dropItem() {
      // ドラッグ中itemをドロップ時消すフラグを建てる
      const draggingDiv = document.getElementById('dragging-item') as HTMLDivElement;
      draggingDiv.classList.add('delete-flg');
    },
    changeMainBattle(index: number) {
      this.calcManager.mainBattle = index;
      this.calculate();
    },
    calculate() {
      // ドラッグ完了までは計算を実行しない
      if (!document.getElementById('dragging-item')) {
        this.calcManager.updateInfo();

        const resultForm = this.$refs.mainResult as InstanceType<typeof MainResult>;
        if (resultForm) {
          resultForm.displayBattle = this.calcManager.mainBattle;
          resultForm.tab = `battle${this.calcManager.mainBattle}`;
        }
      }
    },
  },
});
</script>
