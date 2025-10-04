<template>
  <div>
    <div class="d-flex">
      <v-tabs v-model="tab">
        <v-tab>{{ $t("Extra.未達成") }}</v-tab>
        <v-tab>{{ $t("Extra.達成済") }}</v-tab>
      </v-tabs>
      <div class="ml-3 align-self-center">
        <v-btn color="secondary" @click="confirmReset()">{{ $t("Common.リセット") }}</v-btn>
      </div>
    </div>
    <v-divider />
    <v-tabs-items v-model="tab" :touchless="true">
      <v-tab-item>
        <div class="d-flex align-center mt-3 pr-5 flex-wrap">
          <div class="ml-3 mb-3 mb-sm-0">
            <v-select
              prepend-inner-icon="mdi-magnify"
              v-model="questType"
              :items="questTypes"
              :item-text="getQuestTypeText"
              hide-details
              dense
            />
          </div>
          <div class="ml-auto">
            <div class="d-flex justify-end">
              <div class="mr-3">{{ $t("Extra.戦果砲残弾合計") }}</div>
              <div class="total-ranking-point">{{ totalRankingPoint }}</div>
            </div>
            <div class="d-sm-flex justify-end caption">
              <div class="d-flex justify-end">
                <div class="mr-1">{{ $t("Extra.クォータリー") }}</div>
                <div>{{ totalQuarterlyRankingPoint }}</div>
                <div class="mx-2 d-none d-sm-block">/</div>
              </div>
              <div class="d-flex justify-end">
                <div class="mr-1">{{ $t("Extra.イヤーリー") }}</div>
                <div>{{ totalYearlyRankingPoint }}</div>
                <div class="mx-2 d-none d-sm-block">/</div>
              </div>
              <div class="d-flex justify-end">
                <div class="mr-1">{{ $t("Extra.単発") }}</div>
                <div>{{ totalOnceRankingPoint }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="pa-2">
          <v-expansion-panels multiple>
            <v-expansion-panel v-for="(quest, i) in uncompletedQuests" :key="i" v-show="questType === 'All' || quest.type === questType">
              <v-expansion-panel-header class="py-3 px-2 px-sm-3" :hide-actions="isMobile">
                <div class="mr-sm-3">
                  <div class="d-flex align-center">
                    <div class="quest-icon">
                      <v-img :src="`./img/util/sortie_quest.png`" width="48" height="48" />
                      <div class="quest-type-icon">
                        <v-img v-if="quest.type === 'Yearly'" :src="`./img/util/yearly_${quest.resetMonth}.png`" width="42" height="43" />
                        <v-img v-else-if="quest.type === 'Quarterly'" :src="`./img/util/quarterly.png`" width="41" height="40" />
                        <v-img v-else-if="quest.type === 'Once'" :src="`./img/util/once.png`" width="41" height="40" />
                      </div>
                    </div>
                    <div class="ml-4 flex-grow-1">
                      <div class="quest-title">
                        <div class="d-flex align-center">
                          <div class="flex-grow-1 mr-1 text-caption text-sm-body-2">
                            {{ $t(`Extra.${quest.name}`) }}
                          </div>
                          <template v-if="quest.type !== 'Once'">
                            <div class="ml-auto d-flex align-center text-no-wrap">
                              <div class="mr-1 caption">{{ $t("Extra.あと") }}</div>
                              <div class="text-body-2">{{ timeRemaining[i] }}</div>
                            </div>
                          </template>
                        </div>
                      </div>
                      <div class="bar-container">
                        <div>
                          <v-progress-linear rounded :value="quest.getProgressValue" :color="getBarColor(quest.getProgressValue)" />
                        </div>
                        <div class="progress-count">{{ quest.getCompletedCount }} / {{ quest.requires.length }}</div>
                      </div>
                    </div>
                    <div class="ml-6 d-none d-sm-block">
                      <div class="mb-1 d-flex align-center">
                        <v-img :src="`./img/util/fuel.png`" height="18" width="18" />
                        <div class="resource-reward">{{ quest.fuel }}</div>
                        <v-img :src="`./img/util/steel.png`" height="18" width="18" />
                        <div class="resource-reward">{{ quest.steel }}</div>
                      </div>
                      <div class="d-flex align-center">
                        <v-img :src="`./img/util/ammo.png`" height="18" width="18" />
                        <div class="resource-reward">{{ quest.ammo }}</div>
                        <v-img :src="`./img/util/bauxite.png`" height="18" width="18" />
                        <div class="resource-reward">{{ quest.bauxite }}</div>
                      </div>
                    </div>
                    <div class="ml-3 d-none d-sm-flex align-center">
                      <div>
                        <v-img :src="`./img/util/ranking_point.png`" height="50" width="50" />
                      </div>
                      <div class="ranking-point-reward">{{ quest.rankingPoint }}</div>
                    </div>
                  </div>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-divider />
                <div class="check-item-container">
                  <div v-for="(check, j) in quest.requires" :key="`req${j}`">
                    <v-checkbox
                      v-model="check.isComplete"
                      :dense="isMobile"
                      @change="updateState"
                      hide-details
                      :label="`${check.area} ${$t(`Extra.${check.rank}勝利`)}`"
                    />
                  </div>
                </div>
                <div class="mt-3 mt-sm-6 d-sm-flex align-center">
                  <v-btn v-if="quest.getProgressValue === 100" color="primary" @click="confirmComplete(quest)" :block="isMobile">{{ $t("Extra.達成") }}</v-btn>
                  <v-btn v-else depressed color="secondary" @click="confirmComplete(quest)" :block="isMobile">{{ $t("Extra.達成") }}</v-btn>
                  <div class="ml-sm-auto mt-3 mt-sm-0">
                    <div class="wiki-button">
                      <v-btn outlined :block="isMobile" color="info" :href="`https://wikiwiki.jp/kancolle/%E4%BB%BB%E5%8B%99#id-${quest.id}`" target="_blank">
                        Japan wiki
                      </v-btn>
                      <v-btn outlined :block="isMobile" color="info" :href="`https://en.kancollewiki.net/Quests#${quest.id}`" target="_blank">
                        English wiki
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-tab-item>
      <v-tab-item class="pt-3">
        <v-card class="py-3 px-2 px-sm-6 mx-3 my-1" v-for="(quest, i) in completedQuests" :key="i">
          <div class="d-flex align-center">
            <div class="flex-grow-1">
              <div class="quest-title">
                <div class="d-flex flex-wrap align-center">
                  <div class="flex-grow-1 mr-3 text-body-2">
                    {{ $t(`Extra.${quest.name}`) }}
                  </div>
                  <div class="ml-auto text-no-wrap caption">
                    <div class="d-flex align-center justify-space-between">
                      <div class="mr-1 caption">{{ $t("Extra.達成日") }}</div>
                      <div>{{ new Date(quest.completedDate).toLocaleString($vuetify.lang.current) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bar-container">
                <div>
                  <v-progress-linear rounded value="100" color="success" />
                </div>
                <div class="progress-count">{{ quest.requires.length }} / {{ quest.requires.length }}</div>
              </div>
            </div>
            <div class="ml-2 ml-sm-6 d-sm-flex align-center">
              <div>
                <v-img :src="`./img/util/ranking_point.png`" height="50" width="50" />
              </div>
              <div class="text-center text-sm-right ranking-point-reward">{{ quest.rankingPoint }}</div>
            </div>
          </div>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
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
.quest-icon {
  position: relative;
}
.quest-type-icon {
  position: absolute;
  right: -18px;
  bottom: -10px;
  transform: scale(0.75);
}

.quest-title {
  display: flex;
  flex-direction: column;
  min-height: 32px;
  justify-content: center;
}

.bar-container {
  position: relative;
  margin-top: 4px;
  margin-bottom: 12px;
}
.progress-count {
  position: absolute;
  top: 6px;
  left: calc(50% - 24px);
  font-size: 12px;
  width: 48px;
  text-align: center;
}
.resource-reward {
  width: 38px;
  text-align: right;
  margin-right: 0.5rem;
  font-size: 0.8em;
}
.ranking-point-reward {
  min-width: 36px;
  text-align: right;
}
.total-ranking-point {
  width: 36px;
  text-align: right;
}

.check-item-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
@media (min-width: 600px) {
  .check-item-container {
    display: flex;
    flex-wrap: wrap;
    column-gap: 24px;
  }
}

.wiki-button {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 8px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Const from '@/classes/const';
import Quest from '@/classes/quest';
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
    timeRemaining: [] as string[],
    intervalId: 0,
    isMobile: true,
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
    getBarColor() {
      return (value: number) => {
        if (value === 0) {
          return 'grey';
        }
        if (value < 50) {
          return 'amber';
        }
        if (value < 75) {
          return 'lime';
        }
        if (value < 80) {
          return 'light-green';
        }
        if (value < 100) {
          return 'green';
        }
        return 'light-blue';
      };
    },
  },
  watch: {},
  methods: {
    getQuestTypeText(item: { value: string; text: string }): string {
      return `${this.$t(`Extra.${item.text}`)}`;
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
      this.isMobile = window.innerWidth < 600;
      const today = this.getToday();
      const todayTime = today.getTime();
      let needUpdate = false;

      const timeRemainingTexts: string[] = [];
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

        if (!quest.isCompleted) {
          timeRemainingTexts.push(timeRemainingText);
        }
      }

      this.timeRemaining = timeRemainingTexts;

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
