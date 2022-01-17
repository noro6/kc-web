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
import SaveData from '@/classes/saveData/saveData';
import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';

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
    unsbscribe: undefined as unknown,
    stockData: undefined as undefined | SaveData,
  }),
  mounted() {
    this.unsbscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setMainSaveData') {
        const saveData = state.mainSaveData as SaveData;
        if (!saveData) {
          // 計算対象データがないならトップページに戻す ありえんけど
          this.$router.push('/');
          return;
        }
        if (!this.completed) {
          // ロード完了前だったら一時保持しておく
          this.stockData = saveData;
          return;
        }

        const items = this.$store.state.items as ItemMaster[];
        const ships = this.$store.state.ships as ShipMaster[];
        const enemies = this.$store.state.enemies as EnemyMaster[];

        const manager = saveData.loadManagerData(items, ships, enemies);

        if (manager.resetAll) {
          this.calcManager = manager;
        } else {
          if (manager.airbaseInfo.airbases.some((v) => v.items.some((i) => i.data.id > 0))) {
            // 空のデータじゃなければ置き換える
            this.calcManager.airbaseInfo = manager.airbaseInfo;
          }
          if (manager.fleetInfo.fleets.some((v) => v.ships.some((s) => s.data.id > 0))) {
            // 空のデータじゃなければ置き換える
            this.calcManager.fleetInfo = manager.fleetInfo;
          }
          if (manager.battleInfo.fleets.some((v) => v.enemies.some((s) => s.data.id > 0))) {
            // 空のデータじゃなければ置き換える
            this.calcManager.battleInfo = manager.battleInfo;
          }
        }

        this.calcManager.mainBattle = manager.battleInfo.fleets.length - 1;
        // 特殊ケース -後続のwatch処理で再計算させないための苦肉の策
        this.calcManager.airbaseInfo.calculated = true;
        this.calcManager.fleetInfo.calculated = true;
        this.calcManager.battleInfo.calculated = true;

        this.calculate();
      }
    });

    // なんかデータがあるならそれを突っ込んで計算開始
    const saveData = this.$store.state.mainSaveData as SaveData;

    if (saveData && saveData.isActive) {
      saveData.isMain = true;
      saveData.isActive = true;
      // 計算開始
      this.$store.dispatch('setMainSaveData', saveData);
    } else {
      this.$router.push('/');
    }
  },
  beforeDestroy() {
    if (this.unsbscribe) {
      (this.unsbscribe as () => void)();
    }
  },
  computed: {
    completed() {
      return this.$store.getters.getCompleted;
    },
  },
  watch: {
    'calcManager.airbaseInfo': {
      handler() {
        if (!this.calcManager.airbaseInfo.calculated) {
          this.calculate();
        }
      },
    },
    'calcManager.fleetInfo': {
      handler() {
        if (!this.calcManager.fleetInfo.calculated) {
          this.calculate();
        }
      },
    },
    'calcManager.battleInfo': {
      handler(current: BattleInfo, old: BattleInfo) {
        if (!this.calcManager.battleInfo.calculated) {
          if (current.fleets.length !== old.fleets.length) {
            // 戦闘回数変更を検知
            this.calcManager.mainBattle = this.calcManager.battleInfo.fleets.length - 1;
          }
          this.calculate();
        }
      },
    },
    completed(value) {
      if (value && this.stockData) {
        // 読み込み完了まで待ってた編成を展開
        this.$store.dispatch('setMainSaveData', this.stockData);
        // 捨てる
        this.stockData = undefined;
      }
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
      // 編成が変更されたわけではないので履歴への追加は行わない
      this.calcManager.battleInfo.ignoreHistory = true;
      this.calculate();
    },
    calculate() {
      // ドラッグ完了までは計算を実行しない
      if (document.getElementById('dragging-item')) {
        return;
      }
      const manager = this.calcManager;

      manager.updateInfo();
      // 計算結果の格納
      const mainData = this.$store.state.mainSaveData as SaveData;
      const needPutHistory = !manager.fleetInfo.calculated || !manager.airbaseInfo.calculated || !manager.battleInfo.calculated;
      const isIgnoreHisotry = manager.fleetInfo.ignoreHistory || manager.airbaseInfo.ignoreHistory || manager.battleInfo.ignoreHistory;
      // シミュレータ内からの更新だった場合(外部のタブ操作やundo redoでの計算処理でない場合)のみ、履歴を更新
      if (mainData && needPutHistory && !isIgnoreHisotry) {
        mainData.putHistory(manager);
      }

      // 次回計算が実行されたら履歴に入れたい
      manager.airbaseInfo.ignoreHistory = false;
      manager.fleetInfo.ignoreHistory = false;
      manager.battleInfo.ignoreHistory = false;

      // 計算結果ページの微調整
      const resultForm = this.$refs.mainResult as InstanceType<typeof MainResult>;
      if (resultForm) {
        resultForm.displayBattle = this.calcManager.mainBattle;
        resultForm.tab = `battle${this.calcManager.mainBattle}`;
      }
    },
  },
});
</script>
