<template>
  <div class="quest-page">
    <div class="quest-toolbar">
      <div class="quest-switch">
        <button type="button" :class="{ on: tab === 0 }" @click="tab = 0">
          {{ $t("Extra.未達成") }}
          <span>{{ uncompletedQuests.length }}</span>
        </button>
        <button type="button" :class="{ on: tab === 1 }" @click="tab = 1">
          {{ $t("Extra.達成済") }}
          <span>{{ completedQuests.length }}</span>
        </button>
      </div>
      <v-btn text small class="reset-btn" @click="confirmReset()">{{ $t("Common.リセット") }}</v-btn>
    </div>
    <div class="quest-stock">
      <div class="stock-total">
        <span>{{ $t("Extra.戦果砲残弾合計") }}</span>
        <span class="stock-value">{{ totalRankingPoint }}</span>
      </div>
      <div class="stock-split">
        <span>{{ $t("Extra.クォータリー") }} {{ totalQuarterlyRankingPoint }}</span>
        <span>{{ $t("Extra.イヤーリー") }} {{ totalYearlyRankingPoint }}</span>
        <span>{{ $t("Extra.単発") }} {{ totalOnceRankingPoint }}</span>
      </div>
    </div>
    <div v-if="tab === 0" class="quest-filters">
      <button
        v-for="type in availableTypes"
        :key="type.value"
        type="button"
        :class="{ on: questType === type.value }"
        @click="questType = type.value"
      >
        {{ getQuestTypeText(type) }}
        <span>{{ typeCount(type.value) }}</span>
      </button>
    </div>
    <div v-if="tab === 0" class="quest-list">
      <article v-for="quest in visibleQuests" :key="quest.id" class="quest" :class="{ ready: quest.getProgressValue === 100 }">
        <div class="quest-icon">
          <img class="base" :src="'./img/util/sortie_quest.png'" alt="" />
          <img v-if="typeIcon(quest)" class="mark" :src="typeIcon(quest)" alt="" />
        </div>
        <div class="quest-body">
        <header class="quest-head">
          <div class="quest-kind">
            <span class="type" :class="quest.type">{{ typeLabel(quest.type) }}</span>
            <span class="qid">{{ quest.id }}</span>
          </div>
          <div class="quest-name">{{ $t(`Extra.${quest.name}`) }}</div>
          <div class="quest-points">
            <img :src="'./img/util/ranking_point.png'" alt="" />
            <span>{{ quest.rankingPoint }}</span>
          </div>
          <div v-if="quest.type !== 'Once' && deadlines[quest.id]" class="quest-due" :class="deadlines[quest.id].kind">
            <template v-if="deadlines[quest.id].kind === 'expired'">{{ deadlines[quest.id].text }}</template>
            <template v-else>{{ $t("Extra.あと") }} {{ deadlines[quest.id].text }}</template>
          </div>
          <span class="quest-count">{{ quest.getCompletedCount }}/{{ quest.requires.length }}</span>
        </header>
        <div class="quest-row">
        <div class="checks">
          <template v-for="(group, gi) in requireGroups(quest)">
            <button
              v-if="group.items.length === 1"
              :key="`${quest.id}-${gi}`"
              type="button"
              class="check"
              :class="{ on: group.items[0].isComplete }"
              @click="toggleRequire(group.items[0])"
            >
              <i class="pip" />
              <span>{{ group.area }}</span>
              <span>{{ $t(`Extra.${group.rank}勝利`) }}</span>
            </button>
            <div v-else :key="`${quest.id}-${gi}`" class="check multi" :class="{ on: groupDone(group) }">
              <span>{{ group.area }}</span>
              <span>{{ $t(`Extra.${group.rank}勝利`) }}</span>
              <button
                v-for="(req, ri) in group.items"
                :key="ri"
                type="button"
                class="pip-btn"
                :class="{ on: req.isComplete }"
                @click="toggleRequire(req)"
              />
              <span class="pip-count">{{ doneCount(group) }}/{{ group.items.length }}</span>
            </div>
          </template>
        </div>
          <div v-if="rewards(quest).length" class="rewards">
            <span v-for="reward in rewards(quest)" :key="reward.src" class="reward">
              <img :src="reward.src" alt="" />
              {{ reward.value }}
            </span>
          </div>
          <div class="quest-actions">
            <a class="wiki" :href="`https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99#id-${quest.id}`" target="_blank">Japan wiki</a>
            <a class="wiki" :href="`https://en.kancollewiki.net/Quests#${quest.id}`" target="_blank">English wiki</a>
            <v-btn small depressed :color="quest.getProgressValue === 100 ? 'primary' : 'secondary'" @click="confirmComplete(quest)">
              {{ $t("Extra.達成") }}
            </v-btn>
          </div>
        </div>
        <div class="track"><i :style="{ width: `${quest.getProgressValue}%` }" /></div>
        </div>
      </article>
    </div>
    <div v-else class="quest-list">
      <p v-if="!completedQuests.length" class="quest-empty">{{ $t("Extra.達成済みの任務はありません") }}</p>
      <article v-for="quest in completedQuests" :key="quest.id" class="quest is-done">
        <header class="quest-head">
          <div class="quest-icon">
            <img class="base" :src="'./img/util/sortie_quest.png'" alt="" />
            <img v-if="typeIcon(quest)" class="mark" :src="typeIcon(quest)" alt="" />
          </div>
          <div class="quest-kind">
            <span class="type" :class="quest.type">{{ typeLabel(quest.type) }}</span>
            <span class="qid">{{ quest.id }}</span>
          </div>
          <div class="quest-name">{{ $t(`Extra.${quest.name}`) }}</div>
          <div class="quest-points">
            <img :src="'./img/util/ranking_point.png'" alt="" />
            <span>{{ quest.rankingPoint }}</span>
          </div>
          <div class="quest-due">{{ $t("Extra.達成日") }} {{ new Date(quest.completedDate).toLocaleString($vuetify.lang.current) }}</div>
        </header>
      </article>
    </div>
    <v-dialog v-model="confirmCompleteDialog" transition="scroll-x-transition" width="500">
      <v-card class="pa-3" v-if="completeTargetQuest.id">
        <div class="ma-4">
          <div class="my-3 py-3">{{ $t(`Extra.${completeTargetQuest.name}`) }}</div>
          <div class="body-2">{{ $t("Extra.この任務を達成状態にしますか？") }}</div>
          <div class="caption mt-2">※ {{ $t("Extra.達成した任務は、達成済タブに表示されるようになります。") }}</div>
        </div>
        <v-divider class="my-2" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="primary" dark @click.stop="completeQuest()">{{ $t("Common.OK") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmCompleteDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmResetDialog" transition="scroll-x-transition" width="440">
      <v-card class="pa-3">
        <div class="body-2 ma-6">
          {{ $t("Extra.全ての任務進捗をリセットします。よろしいですか？") }}
        </div>
        <v-divider class="my-3" />
        <div class="d-flex">
          <v-btn class="ml-auto" color="error" dark @click.stop="resetAllQuest()">{{ $t("Common.OK") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmResetDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackBar" color="success" top>
      {{ snackBarText }}
      <template v-slot:action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="snackBar = false"><v-icon>mdi-close</v-icon></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.quest-page {
  --accent: #3b82f6;
  --met: #22c55e;
  --surface: #fbfaf8;
  --surface-2: #f1efeb;
}
.theme--dark .quest-page {
  --surface: rgb(32, 33, 40);
  --surface-2: rgb(42, 44, 52);
}
.deep-sea .theme--dark .quest-page {
  --surface: rgb(16, 28, 48);
  --surface-2: rgb(24, 40, 64);
}
.quest-toolbar,
.quest-stock,
.quest-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}
.quest-toolbar {
  justify-content: space-between;
}
.quest-switch,
.quest-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.quest-switch button,
.quest-filters button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(128, 128, 128, 0.28);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 13px;
  cursor: pointer;
}
.quest-switch button.on,
.quest-filters button.on {
  border-color: transparent;
  background: var(--surface-2);
}
.quest-switch span,
.quest-filters span {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  opacity: 0.62;
}
.reset-btn {
  margin-right: 0;
}
.quest-stock {
  margin-top: 14px;
  justify-content: space-between;
}
.stock-total {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 13px;
  opacity: 0.72;
}
.stock-value {
  font-size: 28px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  opacity: 1;
}
.stock-split {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  opacity: 0.72;
}
.quest-filters {
  margin-top: 12px;
}
.quest-list {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}
.quest {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 8px 12px;
  background: var(--surface);
  border: 1px solid rgba(128, 128, 128, 0.22);
  border-radius: 12px;
}
.quest-body {
  flex: 1;
  min-width: 0;
}
.quest.ready {
  border-color: rgba(34, 197, 94, 0.45);
}
.quest.is-done {
  opacity: 0.78;
}
.quest-head,
.quest-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
}
.quest-row {
  margin-top: 6px;
}
.quest-icon {
  position: relative;
  flex: none;
  width: 40px;
  height: 40px;
  margin-right: 12px;
}
.quest-icon .base {
  display: block;
  width: 40px;
  height: 40px;
}
.quest-icon .mark {
  position: absolute;
  right: -10px;
  bottom: -4px;
  width: 34px;
  height: 32px;
  transform: scale(0.72);
}
.quest-kind {
  display: flex;
  align-items: center;
  gap: 6px;
}
.quest-name {
  flex: 1 1 160px;
  min-width: 0;
  font-size: 13px;
  line-height: 1.35;
}
.quest-points {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
.quest-points img {
  width: 18px;
  height: 18px;
}
.quest-count {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  opacity: 0.72;
}
.quest-due {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  opacity: 0.72;
  white-space: nowrap;
}
.quest-due.soon {
  color: #b45309;
  opacity: 1;
}
.quest-due.expired {
  color: #dc2626;
  opacity: 1;
}
.theme--dark .quest-due.soon {
  color: #fbbf24;
}
.theme--dark .quest-due.expired {
  color: #fca5a5;
}
.type {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}
.type.Yearly {
  background: rgba(245, 158, 11, 0.16);
  color: #b45309;
}
.type.Once {
  background: rgba(124, 58, 237, 0.14);
  color: #6d28d9;
}
.theme--dark .type {
  color: #93c5fd;
}
.theme--dark .type.Yearly {
  color: #fbbf24;
}
.theme--dark .type.Once {
  color: #d8b4fe;
}
.qid {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  opacity: 0.5;
}
.track {
  height: 3px;
  margin-top: 5px;
  border-radius: 2px;
  background: rgba(128, 128, 128, 0.16);
}
.track i {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: var(--accent);
}
.quest.ready .track i {
  background: var(--met);
}
.checks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.check {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 26px;
  padding: 0 8px 0 6px;
  border: 1px solid rgba(128, 128, 128, 0.28);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font-size: 12px;
  cursor: pointer;
}
.check.on {
  border-color: rgba(34, 197, 94, 0.5);
  background: rgba(34, 197, 94, 0.12);
}
.pip,
.pip-btn {
  flex: none;
  width: 14px;
  height: 14px;
  padding: 0;
  border: 1.5px solid rgba(128, 128, 128, 0.7);
  border-radius: 3px;
  background: transparent;
}
.pip {
  display: block;
}
.pip-btn {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.check.on .pip,
.pip-btn.on {
  border-color: #22c55e;
  background: #22c55e;
}
.pip-count {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  opacity: 0.72;
}
.rewards,
.quest-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
}
.quest-actions >>> .v-btn {
  height: 24px;
  min-width: 0;
  padding: 0 8px;
  font-size: 12px;
}
.quest-actions {
  margin-left: auto;
}
@media (max-width: 640px) {
  .quest {
    align-items: flex-start;
  }
  .quest-toolbar,
  .quest-page {
    min-width: 0;
    max-width: 100%;
  }
  .reset-btn {
    margin-right: 0;
  }
  .quest-kind {
    order: 1;
  }
  .quest-points {
    order: 2;
  }
  .quest-due {
    order: 3;
  }
  .quest-count {
    order: 4;
  }
  .quest-name {
    order: 5;
    flex-basis: 100%;
  }
  .checks {
    flex: 1 1 100%;
    min-width: 0;
  }
  .quest-actions {
    margin-left: 0;
  }
}
.reward {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.reward img {
  width: 16px;
  height: 16px;
}
.wiki {
  font-size: 12px;
  opacity: 0.75;
}
.quest-empty {
  margin: 8px 2px;
  font-size: 13px;
  opacity: 0.68;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Const from '@/classes/const';
import Quest, { QuestRequireBattle } from '@/classes/quest';
import { sum } from 'lodash';

export default Vue.extend({
  name: 'QuestManager',
  components: {},
  data: () => ({
    tab: 0,
    allQuests: [] as Quest[],
    questTypes: [
      { value: 'All', text: '全て' },
      { value: 'Quarterly', text: 'クォータリー' },
      { value: 'Yearly', text: 'イヤーリー' },
      { value: 'Once', text: '単発' },
      { value: 'Weekly', text: 'ウィークリー' },
      { value: 'Monthly', text: 'マンスリー' },
    ],
    questType: 'All',
    confirmCompleteDialog: false,
    confirmResetDialog: false,
    completeTargetQuest: new Quest(),
    snackBar: false,
    snackBarText: '',
    deadlines: {} as Record<string, { text: string; kind: string }>,
    intervalId: 0,
  }),
  mounted() {
    this.initializeQuests();
  },
  computed: {
    uncompletedQuests(): Quest[] {
      return this.allQuests.filter((v) => !v.isCompleted);
    },
    completedQuests(): Quest[] {
      return this.allQuests.filter((v) => v.isCompleted);
    },
    totalRankingPoint(): number {
      return this.totalQuarterlyRankingPoint + this.totalYearlyRankingPoint + this.totalOnceRankingPoint;
    },
    totalQuarterlyRankingPoint(): number {
      const rankingPoints = this.uncompletedQuests.filter((v) => v.type === 'Quarterly').map((v) => v.rankingPoint);
      return sum(rankingPoints) ?? 0;
    },
    totalYearlyRankingPoint(): number {
      const rankingPoints = this.uncompletedQuests.filter((v) => v.type === 'Yearly').map((v) => v.rankingPoint);
      return sum(rankingPoints) ?? 0;
    },
    totalOnceRankingPoint(): number {
      const rankingPoints = this.uncompletedQuests.filter((v) => v.type === 'Once').map((v) => v.rankingPoint);
      return sum(rankingPoints) ?? 0;
    },
    availableTypes(): { value: string; text: string }[] {
      const present = this.allQuests.map((quest) => `${quest.type}`);
      return this.questTypes.filter((type) => type.value === 'All' || present.includes(type.value));
    },
    visibleQuests(): Quest[] {
      if (this.questType === 'All') return this.uncompletedQuests;
      return this.uncompletedQuests.filter((quest) => quest.type === this.questType);
    },
  },
  watch: {},
  methods: {
    getQuestTypeText(item: { value: string; text: string }): string {
      return `${this.$t(`Extra.${item.text}`)}`;
    },
    typeIcon(quest: Quest): string {
      if (quest.type === 'Yearly') return `./img/util/yearly_${quest.resetMonth}.png`;
      if (quest.type === 'Quarterly') return './img/util/quarterly.png';
      if (quest.type === 'Once') return './img/util/once.png';
      return '';
    },
    typeLabel(type: string): string {
      const item = this.questTypes.find((questType) => questType.value === type);
      return item ? this.getQuestTypeText(item) : type;
    },
    typeCount(value: string): number {
      if (value === 'All') return this.uncompletedQuests.length;
      return this.uncompletedQuests.filter((quest) => quest.type === value).length;
    },
    requireGroups(quest: Quest): { area: string; rank: string; items: QuestRequireBattle[] }[] {
      const groups: { area: string; rank: string; items: QuestRequireBattle[] }[] = [];
      quest.requires.forEach((require) => {
        const last = groups[groups.length - 1];
        if (last && last.area === require.area && last.rank === require.rank) {
          last.items.push(require);
        } else {
          groups.push({ area: require.area, rank: require.rank, items: [require] });
        }
      });
      return groups;
    },
    groupDone(group: { items: QuestRequireBattle[] }): boolean {
      return group.items.every((require) => require.isComplete);
    },
    doneCount(group: { items: QuestRequireBattle[] }): number {
      return group.items.filter((require) => require.isComplete).length;
    },
    rewards(quest: Quest): { src: string; value: number }[] {
      return [
        { src: './img/util/fuel.png', value: quest.fuel },
        { src: './img/util/ammo.png', value: quest.ammo },
        { src: './img/util/steel.png', value: quest.steel },
        { src: './img/util/bauxite.png', value: quest.bauxite },
      ].filter((reward) => reward.value > 0);
    },
    toggleRequire(require: QuestRequireBattle) {
      require.isComplete = !require.isComplete;
      this.updateState();
    },
    initializeQuests(resetAll = false) {
      if (this.intervalId) {
        // タイマー動いていたらいったんストップ
        window.clearInterval(this.intervalId);
      }

      const quests = [];
      const savedQuests = this.$store.state.quests as Quest[];
      // 任務マスタより、全件取得
      for (let i = 0; i < Const.RANKING_POINT_QUESTS.length; i += 1) {
        const master = Const.RANKING_POINT_QUESTS[i];

        // Questクラスとして初期化
        const quest = new Quest();
        quest.id = master.id;
        quest.name = master.name;
        quest.type = master.type as 'Once' | 'Quarterly' | 'Yearly';
        quest.fuel = master.fuel;
        quest.ammo = master.ammo;
        quest.steel = master.steel;
        quest.bauxite = master.bauxite;
        quest.rankingPoint = master.rankingPoint;
        quest.resetMonth = master.resetMonth ?? 6;

        for (let j = 0; j < master.requires.length; j += 1) {
          quest.requires.push({
            area: master.requires[j].area,
            rank: master.requires[j].rank,
            isComplete: false,
          });
        }

        // 全リセット時でも単発(Once)は復元を試行
        if (!resetAll || quest.type === 'Once') {
          // 保存されている任務達成状況から値を復元(あれば)
          const savedQuest = savedQuests.find((v) => v.id === quest.id);
          if (savedQuest) {
            // 達成状況をセット
            quest.isCompleted = !!savedQuest.isCompleted;

            // インデックスに応じて、達成状況を復元
            for (let j = 0; j < savedQuest.requires.length; j += 1) {
              const savedRequire = savedQuest.requires[j];
              if (quest.requires[j]) {
                quest.requires[j].isComplete = !!savedRequire.isComplete;
              } else {
                quest.requires.push({ area: savedRequire.area, rank: savedRequire.rank, isComplete: savedRequire.isComplete });
              }
            }

            if (quest.isCompleted) {
              quest.completedDate = savedQuest.completedDate;
            }
            quest.closingDateTime = savedQuest.closingDateTime;
            quest.resetDateTime = savedQuest.resetDateTime;
          }
        }

        const today = this.getToday();
        const closingDateTime = Quest.getClosingDateTime(quest, today);
        const resetDateTime = Quest.getResetDateTime(quest, today);
        if (!quest.closingDateTime || closingDateTime !== quest.closingDateTime) {
          // 締日を設定
          quest.closingDateTime = closingDateTime;
        }

        if (quest.type !== 'Once' && (!quest.resetDateTime || resetDateTime !== quest.resetDateTime)) {
          // 現在日時より解決されるリセット日が、保存データのリセット日と違う場合
          // 達成状態を戻す
          quest.requires = [];
          for (let j = 0; j < master.requires.length; j += 1) {
            quest.requires.push({
              area: master.requires[j].area,
              rank: master.requires[j].rank,
              isComplete: false,
            });
          }
          quest.isCompleted = false;
          // リセット日を再設定
          quest.resetDateTime = resetDateTime;
        }

        quests.push(quest);
      }

      this.allQuests = quests;
      this.$store.dispatch('updateQuests', this.allQuests);

      this.setTimeRemaining();

      this.intervalId = window.setInterval(() => {
        this.setTimeRemaining();
      }, 1000);
    },
    getToday() {
      return new Date();
    },
    updateState() {
      // ローカルの任務群に保存
      this.$store.dispatch('updateQuests', this.allQuests);
    },
    confirmComplete(quest: Quest) {
      this.completeTargetQuest = quest;
      this.confirmCompleteDialog = true;
    },
    completeQuest() {
      const quest = this.allQuests.find((v) => v.id === this.completeTargetQuest.id);
      if (!quest) {
        return;
      }

      quest.isCompleted = true;
      quest.completedDate = this.getToday().getTime();
      this.confirmCompleteDialog = false;

      // ローカルの任務群に保存
      this.$store.dispatch('updateQuests', this.allQuests);

      this.snackBar = true;
      this.snackBarText = `[ ${this.$t(`Extra.${this.completeTargetQuest.name}`)} ] ${this.$t('Extra.達成しました。')}`;
    },
    confirmReset() {
      this.confirmResetDialog = true;
    },
    resetAllQuest() {
      this.initializeQuests(true);

      this.confirmResetDialog = false;
      this.snackBar = true;
      this.snackBarText = `${this.$t('Extra.リセットしました。')}`;
    },
    setTimeRemaining() {
      const today = this.getToday();
      const todayTime = today.getTime();
      let needUpdate = false;

      const deadlines: Record<string, { text: string; kind: string }> = {};
      for (let i = 0; i < this.allQuests.length; i += 1) {
        const quest = this.allQuests[i];

        // 復活判定
        if (quest.resetDateTime && todayTime > quest.resetDateTime) {
          // リセット日を超えていたら復活
          quest.isCompleted = false;
          quest.completedDate = 0;
          for (let j = 0; j < quest.requires.length; j += 1) {
            quest.requires[j].isComplete = false;
          }

          // 再度、リセット日と締日を再設定
          quest.closingDateTime = Quest.getClosingDateTime(quest, today);
          quest.resetDateTime = Quest.getResetDateTime(quest, today);

          // 更新がかけられたので更新要求
          needUpdate = true;
        }

        const diff = quest.closingDateTime - todayTime;
        const remainingDay = Math.floor(diff / 86400000);

        let timeRemainingText = '';
        if (remainingDay > 1) {
          timeRemainingText = `${this.$t('Extra.x日', { days: remainingDay })}`;
        } else if (remainingDay > 0) {
          timeRemainingText = `${this.$t('Extra.1日')}`;
        } else if (remainingDay === 0) {
          // 残り1日を切った場合、時間単位表示
          // ミリ秒から単位を修正
          const calcHour = Math.floor(diff / 1000 / 60 / 60);
          const calcMin = Math.floor(diff / 1000 / 60) % 60;
          const calcSec = Math.floor(diff / 1000) % 60;

          // 取得した時間を表示（2桁表示）
          const hour = calcHour < 10 ? `0${calcHour}` : calcHour;
          const min = calcMin < 10 ? `0${calcMin}` : calcMin;
          const sec = calcSec < 10 ? `0${calcSec}` : calcSec;
          timeRemainingText = `${hour}:${min}:${sec}`;
        } else {
          // 期限切れ
          timeRemainingText = `${this.$t('Extra.失効')}`;
        }

        let kind = 'ok';
        if (remainingDay < 0) kind = 'expired';
        else if (remainingDay <= 1) kind = 'soon';
        deadlines[quest.id] = { text: timeRemainingText, kind };
      }

      this.deadlines = deadlines;

      if (needUpdate) {
        // ローカルの任務群に保存
        this.$store.dispatch('updateQuests', this.allQuests);
      }
    },
  },
  beforeDestroy() {
    window.clearInterval(this.intervalId);
  },
});
</script>
