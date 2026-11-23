<template>
  <div class="mb-5" @dragover.prevent @drop="dropItem">
    <v-card class="general-container bonus-display my-2" :class="bonusDisplayClass">
      <div class="bonus-display-main">
        <div class="bonus-display-label">
          <span class="bonus-kicker" aria-hidden="true" />
          <span>{{ $t("Common.装備特効表示") }}</span>
        </div>
        <div class="bonus-options" role="radiogroup" :aria-label="$t('Common.装備特効表示')">
          <button
            v-for="option in bonusOptions"
            :key="option.value || 'none'"
            type="button"
            role="radio"
            class="bonus-option"
            :class="[option.tone, { active: setting.displayBonusKey === option.value }]"
            :aria-checked="setting.displayBonusKey === option.value"
            @click="selectDisplayBonus(option.value, $event)"
          >
            <v-icon v-if="option.icon" small>{{ option.icon }}</v-icon>
            <span>{{ option.label }}</span>
          </button>
        </div>
        <div v-if="setting.displayBonusKey === 'Saury'" class="saury-watermark" aria-hidden="true">
          <v-icon>mdi-fish</v-icon>
          <v-icon>mdi-fish</v-icon>
        </div>
      </div>
      <div class="bonus-note" v-if="setting.displayBonusKey === '62-3'">
        <div>参考元: <a href="https://x.com/yukicacoon/status/2076251017486967172" target="_blank" rel="noopener noreferrer">@yukicacoon 様のツイートより</a></div>
        <!-- <div class="mt-2">全く同じカテゴリの機体は倍率が重複しません。見辛いですが色分けしてあります。同色だと、重複しても倍率は伸びないってことです。</div>
        <div class="mt-2">できるだけ多くの特効カテゴリ（色）を詰め込めればベストです。</div>
        <div>基地は C1, C2, C3 カテゴリのみ有効です。</div> -->
      </div>
      <div class="bonus-note" v-if="setting.displayBonusKey === '62-4'">
        <div>参考元: <a href="https://x.com/yukicacoon/status/1984134362624094340" target="_blank" rel="noopener noreferrer">@yukicacoon 様のツイートより</a></div>
        <div class="mt-1">全く同じカテゴリの機体は倍率が重複しませんでした。見辛いですが色分けしてあります。同色だと、重複しても倍率は伸びないってことです。</div>
        <div>できるだけ多くの特効カテゴリ（色）を詰め込めればベストです。</div>
      </div>
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
                <v-textarea auto-grow rows="2" v-model="editedRemarks" outlined dense hide-details @blur="commitRemarks()" @keydown="keydownHandler" />
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
          :handle-sync-current-data="() => (syncCurrentDataDialog = true)"
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
          :handle-sync-current-data="() => (syncCurrentDataDialog = true)"
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
    <v-dialog v-model="syncCurrentDataDialog" transition="scroll-x-transition" width="520">
      <v-card class="pa-6">
        <div class="body-2">
          <div>
            {{ $t("Fleet.配備されているすべての艦娘と装備を、") }}<router-link to="manager">{{ $t("Home.艦娘 / 装備管理") }}</router-link
            >{{ $t("Fleet.で登録されている在籍、所持情報をもとに、なるべくいい感じになるように置き換えます。") }}
          </div>
        </div>
        <div class="mt-3">
          <v-checkbox v-model="ignoreItem" hide-details dense label="装備を据え置く" />
        </div>
        <div class="mt-6 body-2">{{ $t("Fleet.存在しない艦娘、装備の置換方法を選択してください。") }}</div>
        <div>
          <v-radio-group v-model="altMode" dense class="mt-2">
            <v-radio :label="$t('Fleet.そのままにする')" :value="0" />
            <v-radio :label="$t('Fleet.はずす')" :value="1" />
          </v-radio-group>
        </div>
        <v-alert v-if="disabledSync" dense type="error" class="body-2">{{ $t("Fleet.この機能を使う場合は、まず艦隊反映を行ってください。") }}</v-alert>
        <div class="d-flex">
          <v-btn class="ml-auto" color="success" @click.stop="syncCurrentData" :disabled="disabledSync">{{ $t("Common.実行") }}</v-btn>
          <v-btn class="ml-3" color="secondary" @click.stop="syncCurrentDataDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
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

.bonus-display {
  position: relative;
  overflow: hidden;
  border-radius: 12px !important;
}

.bonus-display-main {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 16px;
  min-height: 52px;
  padding: 10px 14px;
}

.bonus-display-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.bonus-kicker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(128, 128, 128, 0.7);
  box-shadow: 0 0 0 3px rgba(128, 128, 128, 0.16);
}

.is-saury .bonus-kicker {
  background: #81d4fa;
  box-shadow: 0 0 0 3px rgba(129, 212, 250, 0.2), 0 0 10px rgba(129, 212, 250, 0.85);
}

.is-event .bonus-kicker {
  background: #2dd4bf;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.18);
}

.bonus-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.bonus-option {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 13px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  opacity: 0.78;
  transition: background-color 0.16s ease, color 0.16s ease, opacity 0.16s ease;
}

.bonus-option:hover {
  opacity: 1;
  background: rgba(128, 128, 128, 0.16);
}

.bonus-option:focus {
  outline: none;
}

.bonus-option:focus-visible {
  outline: 2px solid #81d4fa;
  outline-offset: 1px;
}

.bonus-option.active {
  opacity: 1;
}

.bonus-option.tone-off.active {
  background: rgba(255, 255, 255, 0.1);
}

.theme--light .bonus-option.tone-off.active {
  background: rgba(0, 0, 0, 0.06);
}

.bonus-option.tone-saury >>> .v-icon {
  color: #4fc3f7;
}

.theme--dark .bonus-option.tone-saury >>> .v-icon {
  color: #81d4fa;
}

.bonus-option.tone-saury.active {
  color: #e1f5fe;
  background: rgba(129, 212, 250, 0.18);
}

.theme--light .bonus-option.tone-saury.active {
  color: #01579b;
  background: rgba(3, 169, 244, 0.12);
}

.bonus-option.tone-event.active {
  color: #ccfbf1;
  background: rgba(20, 184, 166, 0.18);
}

.theme--light .bonus-option.tone-event.active {
  color: #0f766e;
  background: rgba(20, 184, 166, 0.12);
}

.saury-watermark {
  position: absolute;
  right: 16px;
  top: 50%;
  display: flex;
  align-items: center;
  gap: 2px;
  pointer-events: none;
  transform: translateY(-50%);
}

.saury-watermark >>> .v-icon {
  color: #4fc3f7;
  font-size: 34px;
  opacity: 0.72;
}

.theme--light .saury-watermark >>> .v-icon {
  color: #0277bd;
  opacity: 0.55;
}

.saury-watermark >>> .v-icon:first-child {
  transform: rotate(-24deg);
}

.saury-watermark >>> .v-icon:last-child {
  margin-top: 8px;
  font-size: 22px;
  transform: rotate(16deg);
}

.bonus-note {
  position: relative;
  z-index: 1;
  margin: 0 14px 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(128, 128, 128, 0.12);
  font-size: 12px;
  line-height: 1.65;
}

.theme--dark .bonus-note a {
  color: #5eead4;
}

.theme--light .bonus-note a {
  color: #0f766e;
}

@media (max-width: 880px) {
  .saury-watermark {
    display: none;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import party, { Particle } from 'party-js';
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
import AirbaseInfo from '@/classes/airbase/airbaseInfo';
import Optimizer from '@/classes/fleet/optimizer';
import ShipStock from '@/classes/fleet/shipStock';
import ItemStock from '@/classes/item/itemStock';

const SAURY_SHAPE = '<span class="mdi mdi-fish" style="display:inline-block;font-size:34px;line-height:1"></span>';

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
    syncCurrentDataDialog: false,
    altMode: 0,
    ignoreItem: false,
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
    disabledSync(): boolean {
      return !this.$store.state.itemStock.length || !this.$store.state.shipStock.length;
    },
    bonusOptions(): { value: string; label: string; tone: string; icon?: string }[] {
      return [
        { value: '', label: `${this.$t('Common.なし')}`, tone: 'tone-off' },
        { value: 'Saury', label: `${this.$t('Common.鎮守府秋刀魚祭り')}`, tone: 'tone-saury', icon: 'mdi-fish mdi-rotate-315' },
        // { value: '62-3', label: '26夏 E-3', tone: 'tone-event' },
        // { value: '62-4', label: '26夏 後段', tone: 'tone-event' },
      ];
    },
    bonusDisplayClass(): string {
      if (this.setting.displayBonusKey === 'Saury') return 'is-saury';
      if (this.setting.displayBonusKey === '62-3' || this.setting.displayBonusKey === '62-4') return 'is-event';
      return '';
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
    keydownHandler(event: KeyboardEvent) {
      if (event.ctrlKey && event.code === 'KeyS') {
        event.preventDefault();
        event.stopPropagation();
        this.commitRemarks();
        this.$emit('saveCurrentData');
      }
    },
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

      if (window.innerWidth < 600 && this.setting.simulationCount === 5000) {
        // モバイル初期設定の計算回数を抑制
        this.setting.simulationCount = 1000;
        this.$store.dispatch('updateSetting', this.setting);
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
    selectDisplayBonus(value: string, event: MouseEvent) {
      if (this.setting.displayBonusKey === value) return;
      this.setting.displayBonusKey = value;
      this.changeDisplayBonus();
      if (value === 'Saury' && event.currentTarget instanceof HTMLElement) {
        this.splashSaury(event.currentTarget);
      }
    },
    splashSaury(source: HTMLElement) {
      party.resolvableShapes.saury = SAURY_SHAPE;
      const colors = ['#81d4fa', '#4fc3f7', '#b3e5fc', '#29b6f6', '#ffe082'];
      party.scene.current.createEmitter({
        emitterOptions: {
          loops: 1,
          duration: 2,
          useGravity: false,
          modules: [
            new party.ModuleBuilder()
              .drive('size')
              .by(new party.NumericSpline(
                { time: 0, value: 0.65 },
                { time: 0.12, value: 1 },
                { time: 0.7, value: 1 },
                { time: 1, value: 0.3 },
              ))
              .through('relativeLifetime')
              .relative()
              .build(),
            new party.ModuleBuilder()
              .drive('opacity')
              .by(new party.NumericSpline(
                { time: 0, value: 0 },
                { time: 0.08, value: 1 },
                { time: 0.62, value: 1 },
                { time: 1, value: 0 },
              ))
              .through('relativeLifetime')
              .build(),
            (particle: Particle) => {
              const elapsed = particle.initialLifetime - particle.lifetime;
              const heading = Math.atan2(particle.velocity.y, particle.velocity.x) * (180 / Math.PI);
              // mdi-fish は右上を向いているので、進行方向に頭が来るよう補正する
              particle.rotation.z = heading + 36 + Math.sin(elapsed * 10) * 10;
            },
          ],
        },
        emissionOptions: {
          rate: 0,
          bursts: [{ time: 0, count: party.variation.range(12, 16) }],
          sourceSampler: party.sources.dynamicSource(source),
          angle: party.variation.range(0, 360),
          initialLifetime: party.variation.range(1.3, 1.8),
          initialSpeed: party.variation.range(160, 320),
          initialSize: party.variation.range(0.9, 1.25),
          initialRotation: new party.Vector(0, 0, 0),
          initialColor: () => party.Color.fromHex(colors[Math.floor(Math.random() * colors.length)]),
        },
        rendererOptions: {
          shapeFactory: 'saury',
          applyLighting: undefined,
        },
      });
    },
    changeDisplayBonus() {
      this.$store.dispatch('updateSetting', this.setting);
    },
    syncCurrentData() {
      // 現在配備中のデータを取得
      const saveData = this.$store.state.mainSaveData as SaveData;
      if (!saveData) return;
      const manager = saveData.tempData[saveData.tempIndex];
      if (!manager) return;

      // 面倒なので直で在庫数を書き換えたいのでディープコピーしておく
      const itemStock = JSON.parse(JSON.stringify(this.$store.state.itemStock)) as ItemStock[];
      const shipStock = JSON.parse(JSON.stringify(this.$store.state.shipStock)) as ShipStock[];
      // いなければ外すモードかどうか
      const toEmpty = this.altMode === 1;
      // 艦隊データの反映
      const result = Optimizer.reflectStockData(manager, shipStock, itemStock, toEmpty, this.ignoreItem);
      // 2回計算が行われそうなので片方は再計算フラグを落としておく
      result.airbaseInfo.calculated = true;

      // 置き換えて終了！
      this.calcManager.airbaseInfo = result.airbaseInfo;
      this.calcManager.fleetInfo = result.fleetInfo;

      // ダイアログ閉じる
      this.syncCurrentDataDialog = false;
    },
  },
});
</script>
