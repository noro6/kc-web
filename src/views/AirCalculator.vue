<template>
  <div class="mb-5" @dragover.prevent @drop="dropItem">
    <v-card class="general-container d-flex my-2 px-4 py-0" v-if="false">
      <div class="align-self-center mr-5">{{ $t("Common.装備特効表示") }}</div>
      <v-radio-group v-model="setting.displayBonusKey" row @change="changeDisplayBonus">
        <v-radio :label="$t('Common.なし')" value="" />
        <v-radio :label="$t('Common.鎮守府秋刀魚祭り')" value="Saury" />
      </v-radio-group>
    </v-card>
    <div class="general-container d-flex">
      <template v-if="!sortMode">
        <v-btn class="mr-2" small v-if="setting.isMinimizedDescription" @click="toggleMinimizeDescription(false)">{{ $t("Home.補足情報") }}</v-btn>
        <v-btn class="mr-2" small v-if="setting.isMinimizedAirbase" @click="toggleMinimizeAirbase(false)">{{ $t("Airbase.基地航空隊") }}</v-btn>
        <v-btn class="mr-2" small v-if="setting.isMinimizedFleet" @click="toggleMinimizeFleet(false)">{{ $t("Fleet.自艦隊") }}</v-btn>
        <v-btn class="mr-2" small v-if="setting.isMinimizedEnemy" @click="toggleMinimizeEnemy(false)">{{ $t("Enemies.敵艦隊") }}</v-btn>
        <v-btn class="mr-2" small v-if="setting.isMinimizedResult" @click="toggleMinimizeResult(false)">{{ $t("Result.計算結果") }}</v-btn>
        <v-btn class="ml-auto" small @click="startContentOrder" color="primary">{{ $t("Common.順序入替") }}</v-btn>
      </template>
      <template v-else>
        <v-btn class="ml-auto" small @click="commitContentOrder" color="primary">{{ $t("Common.入替完了") }}</v-btn>
        <v-btn class="ml-2" dark small @click="cancelContentOrder" color="secondary">{{ $t("Common.キャンセル") }}</v-btn>
      </template>
    </div>
    <draggable handle=".content-frame" animation="150" :disabled="!sortMode" id="content-container" :class="{ 'sort-mode': sortMode }">
      <div id="description-content" class="content-frame" v-show="sortMode || !setting.isMinimizedDescription">
        <v-card v-if="sortMode" class="sort-container">{{ $t("Home.補足情報") }}</v-card>
        <div v-else>
          <v-card class="my-2 px-1 py-2">
            <div class="d-flex pb-1">
              <div class="pl-2 align-self-center">{{ $t("Home.補足情報") }}</div>
              <v-spacer />
              <v-tooltip bottom color="black">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon @click="toggleMinimizeDescription(true)" v-bind="attrs" v-on="on">
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("Common.最小化") }}</span>
              </v-tooltip>
            </div>
            <v-divider />
            <div class="px-1 pt-2 d-flex">
              <div class="flex-grow-1 remarks-input">
                <v-textarea auto-grow rows="2" v-model="editedRemarks" outlined dense hide-details @blur="commitRemarks()" />
              </div>
            </div>
          </v-card>
        </div>
      </div>
      <div id="airbase-content" class="content-frame" v-show="sortMode || !setting.isMinimizedAirbase">
        <v-card v-if="sortMode" class="sort-container">{{ $t("Airbase.基地航空隊") }}</v-card>
        <airbase-all
          v-else
          v-model="calcManager.airbaseInfo"
          :battle-info="calcManager.battleInfo"
          :handle-minimize="toggleMinimizeAirbase"
          :sort-mode="sortMode"
        />
      </div>
      <div id="fleet-content" class="content-frame" v-show="sortMode || (!calcManager.isDefense && !setting.isMinimizedFleet)">
        <v-card v-if="sortMode" class="sort-container">{{ $t("Fleet.自艦隊") }}</v-card>
        <fleet-all
          v-else
          v-model="calcManager.fleetInfo"
          :handle-change-formation="changeFormation"
          :handle-minimize="toggleMinimizeFleet"
          :sort-mode="sortMode"
          :battle-info="calcManager.battleInfo"
        />
      </div>
      <div id="enemy-content" class="content-frame" v-show="sortMode || !setting.isMinimizedEnemy">
        <v-card v-if="sortMode" class="sort-container">{{ $t("Enemies.敵艦隊") }}</v-card>
        <enemy-fleet-all v-else v-model="calcManager" :handle-minimize="toggleMinimizeEnemy" :sort-mode="sortMode" />
      </div>
      <div id="result-content" class="content-frame" v-show="sortMode || !setting.isMinimizedResult">
        <v-card v-if="sortMode" class="sort-container">{{ $t("Result.計算結果") }}</v-card>
        <main-result
          v-else
          v-model="calcManager"
          v-show="!calcManager.isDefense"
          :handle-change-main-battle="changeMainBattle"
          :handle-change-formation="changeFormation"
          :handle-change-airbase="changeAirbase"
          :handle-change-fleet="changeFleet"
          :handle-more-calculate="calculateMore"
          :handle-minimize="toggleMinimizeResult"
          :sort-mode="sortMode"
          :calculate-count="setting.simulationCount"
          ref="mainResult"
        />
      </div>
    </draggable>
    <div v-if="!sortMode" class="general-container">
      <editable-enemy-list />
    </div>
    <div class="info-area">
      <v-divider class="mb-2" />
      <div class="caption">
        {{ $t("Home.著作権法第32条に基づき画像を引用し、著作権は権利者様へ帰属します。権利者様側からの画像等の削除の依頼や警告には速やかに対処いたします。") }}
      </div>
      <div class="caption">
        {{ $t("Home.また、本サイトの情報、計算結果によって受けた利益・損害その他あらゆる事象については一切の責任を負いません。") }}
      </div>
    </div>
  </div>
</template>

<style scoped>
#content-container {
  margin: 0 auto;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
}
.sort-mode .content-frame {
  cursor: move;
}
.sort-container {
  padding: 0.75rem;
  margin-top: 0.5rem;
}
.info-area {
  margin: 2rem auto 0.5rem auto;
  max-width: 1200px;
}

.general-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import EnemyFleetAll from '@/components/enemy/EnemyFleetAll.vue';
import EditableEnemyList from '@/components/enemy/EditableEnemyList.vue';
import AirbaseAll from '@/components/airbase/AirbaseAll.vue';
import MainResult from '@/components/result/MainResult.vue';
import FleetAll from '@/components/fleet/FleetAll.vue';
import CalcManager from '@/classes/calcManager';
import BattleInfo from '@/classes/enemy/battleInfo';
import SaveData from '@/classes/saveData/saveData';
import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import FleetInfo from '@/classes/fleet/fleetInfo';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import SiteSetting from '@/classes/siteSetting';
import AirbaseInfo from '../classes/airbase/airbaseInfo';

export default Vue.extend({
  name: 'AirCalculator',
  components: {
    AirbaseAll,
    FleetAll,
    EnemyFleetAll,
    MainResult,
    draggable,
    EditableEnemyList,
  },
  data: () => ({
    calcManager: new CalcManager(),
    unsubscribe: undefined as unknown,
    stockData: undefined as undefined | SaveData,
    setting: new SiteSetting(),
    sortMode: false,
    editedRemarks: '',
  }),
  mounted() {
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      this.setting = this.$store.state.siteSetting as SiteSetting;
      if (mutation.type === 'setMainSaveData') {
        const saveData = state.mainSaveData as SaveData;
        if (!saveData && this.$route.path !== '/') {
          // 計算対象データがないならトップページに戻す。開いてる途中で削除されたりしたらこうなる
          this.$router.push('/');
          return;
        }
        if (!this.completed) {
          // ロード完了前だったら一時保持しておく
          this.stockData = saveData;
          return;
        }

        // 補足情報の置き換え
        this.editedRemarks = saveData.remarks ?? '';

        // マスターの再読み込み
        const items = this.$store.state.items as ItemMaster[];
        const ships = this.$store.state.ships as ShipMaster[];
        const enemies = this.$store.getters.getEnemies as EnemyMaster[];
        const manager = saveData.loadManagerData(items, ships, enemies, this.setting.admiralLevel);

        this.calcManager = manager;
        this.calcManager.mainBattle = manager.battleInfo.fleets.length - 1;
        // 特殊ケース -後続のwatch処理で再計算させないための苦肉の策
        this.calcManager.airbaseInfo.calculated = true;
        this.calcManager.fleetInfo.calculated = true;
        this.calcManager.battleInfo.calculated = true;

        this.calculate();
        this.sortContentFromSetting();
      } else if (mutation.type === 'updateSaveData') {
        const root = this.$store.state.saveData as SaveData;
        const saveData = root.getMainData();
        if (saveData) {
          // 補足情報の置き換え
          this.editedRemarks = saveData.remarks ?? '';
        } else {
          // なぜかデータが消え去ったのでトップページに戻す
          this.$store.dispatch('setMainSaveData', undefined);
          if (this.$route.path !== '/') {
            this.$router.push('/');
          }
        }
      } else if (mutation.type === 'updateSetting') {
        // 設定情報の更新を購読 常に最新の状態を保つ
        this.setting = state.siteSetting as SiteSetting;
        this.sortContentFromSetting();
      } else {
        this.sortContentFromSetting();
      }
    });

    // なんかデータがあるならそれを突っ込んで計算開始
    const saveData = this.$store.state.mainSaveData as SaveData;

    if (saveData && saveData.isActive) {
      saveData.isMain = true;
      saveData.isActive = true;
      // 計算開始
      this.$store.dispatch('setMainSaveData', saveData);
    } else if (this.$route.path !== '/') {
      this.$router.push('/');
    }
  },
  beforeDestroy() {
    if (this.unsubscribe) {
      (this.unsubscribe as () => void)();
    }
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    disabledDescription(): boolean {
      return !this.$store.state.mainSaveData;
    },
    isEditedRemarks(): boolean {
      if (this.$store.state.mainSaveData) {
        return (this.$store.state.mainSaveData as SaveData).remarks !== this.editedRemarks;
      }
      return false;
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
      const draggingDiv = document.getElementById('dragging-item');
      if (draggingDiv) {
        draggingDiv.classList.add('delete-flg');
      }
    },
    changeMainBattle(index: number) {
      this.calcManager.mainBattle = index;
      // 編成が変更されたわけではないので履歴への追加は行わない
      this.calcManager.battleInfo.ignoreHistory = true;

      // 陣形を整える
      const formation = this.calcManager.battleInfo.fleets[index].mainFleetFormation;
      this.calcManager.fleetInfo = FleetInfo.getInfoWithChangedFormation(this.calcManager.fleetInfo, formation);
    },
    changeFormation(formation: number) {
      // 計算対象の敵編成を更新(味方陣形)
      const index = this.calcManager.mainBattle;
      const fleet = this.calcManager.battleInfo.fleets[index];
      this.calcManager.battleInfo.fleets[index] = new EnemyFleet({ fleet, mainFleetFormation: formation });
      this.calcManager.battleInfo = new BattleInfo({ info: this.calcManager.battleInfo });

      // 陣形を整える
      this.calcManager.fleetInfo = FleetInfo.getInfoWithChangedFormation(this.calcManager.fleetInfo, formation);
    },
    changeAirbase(info: AirbaseInfo) {
      // 詳細画面によって編成が更新された
      this.calcManager.airbaseInfo = info;
    },
    changeFleet(info: FleetInfo) {
      // 詳細画面によって編成が更新された
      this.calcManager.fleetInfo = info;
    },
    calculateMore() {
      this.calculate(100000);
    },
    calculate(count = 0) {
      // ドラッグ完了までは計算を実行しない
      if (document.getElementById('dragging-item')) {
        return;
      }
      const manager = this.calcManager;

      if (count > 0) {
        manager.updateInfo(count);
      } else {
        manager.updateInfo(this.setting.simulationCount);
      }
      // 計算結果の格納
      const mainData = this.$store.state.mainSaveData as SaveData;
      const needPutHistory = !manager.fleetInfo.calculated || !manager.airbaseInfo.calculated || !manager.battleInfo.calculated;
      const isIgnoreHistory = manager.fleetInfo.ignoreHistory || manager.airbaseInfo.ignoreHistory || manager.battleInfo.ignoreHistory;
      // シミュレータ内からの更新だった場合(外部のタブ操作やundo redoでの計算処理でない場合)のみ、履歴を更新
      if (mainData && needPutHistory && !isIgnoreHistory && count === 0) {
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
        resultForm.moreCalculateRequested = count > 0;
      }

      if (mainData.isUnsaved || this.setting.enabledAutoSave) {
        // データの保存
        try {
          mainData.saveManagerData();
          const saveData = this.$store.state.saveData as SaveData;
          this.$store.dispatch('updateSaveData', saveData);
        } catch (error) {
          // 対処済み(どうせ編成はもう閉じてるのでしなくていい)
          console.error(error);
        }
      }

      if (count > 0) {
        this.$emit('inform', '計算が完了しました。');
      }
    },
    startContentOrder() {
      this.$emit('inform', 'ドラッグ & ドロップで入力欄を好きな順に並べ替え、入替完了を押してください。');
      this.sortMode = true;

      const contents = document.querySelectorAll('#content-container .content-frame');
      for (let i = 0; i < contents.length; i += 1) {
        contents[i].className = 'content-frame';
      }
    },
    cancelContentOrder() {
      this.sortMode = false;
      // 復帰
      this.sortContentFromSetting();
    },
    commitContentOrder() {
      this.sortMode = false;

      this.setting.contentOrder = [];
      const contents = document.querySelectorAll('#content-container .content-frame');
      for (let i = 0; i < contents.length; i += 1) {
        const { id } = contents[i];
        if (id) {
          this.setting.contentOrder.push(id);
        }
      }

      this.$emit('inform', '入力欄を入れ替えました。');
      this.$store.dispatch('updateSetting', this.setting);
    },
    toggleMinimizeDescription(isMinimized: boolean) {
      this.setting.isMinimizedDescription = isMinimized;
      this.$store.dispatch('updateSetting', this.setting);
    },
    toggleMinimizeAirbase(isMinimized: boolean) {
      this.setting.isMinimizedAirbase = isMinimized;
      this.$store.dispatch('updateSetting', this.setting);
    },
    toggleMinimizeFleet(isMinimized: boolean) {
      this.setting.isMinimizedFleet = isMinimized;
      this.$store.dispatch('updateSetting', this.setting);
    },
    toggleMinimizeEnemy(isMinimized: boolean) {
      this.setting.isMinimizedEnemy = isMinimized;
      this.$store.dispatch('updateSetting', this.setting);
    },
    toggleMinimizeResult(isMinimized: boolean) {
      this.setting.isMinimizedResult = isMinimized;
      this.$store.dispatch('updateSetting', this.setting);
    },
    sortContentFromSetting() {
      const ids = this.setting.contentOrder;

      // 仲間外れチェック
      let isAdded = false;
      const contents = document.querySelectorAll('#content-container .content-frame');
      for (let i = 0; i < contents.length; i += 1) {
        const { id } = contents[i];
        if (id && !ids.includes(id)) {
          isAdded = true;
          ids.splice(i, 0, id);
        }
      }
      if (isAdded) {
        this.$store.dispatch('updateSetting', this.setting);
      }

      for (let i = 0; i < ids.length; i += 1) {
        const id = ids[i];
        const content = document.getElementById(id);
        if (content) {
          content.className = 'content-frame';
          content.classList.add(`order-${i + 1}`);
        }
      }
    },
    commitRemarks() {
      const saveData = this.$store.state.mainSaveData as SaveData;
      if (saveData) {
        saveData.remarks = this.editedRemarks;
        const root = this.$store.state.saveData as SaveData;
        this.$store.dispatch('updateSaveData', root);
      }
    },
    changeDisplayBonus() {
      this.$store.dispatch('updateSetting', this.setting);
    },
  },
});
</script>
