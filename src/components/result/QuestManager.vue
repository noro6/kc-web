<template>
  <div>
    <v-tabs v-model="tab">
      <v-tab>{{ $t("Extra.未達成") }}</v-tab>
      <v-tab>{{ $t("Extra.達成済") }}</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-tabs-items v-model="tab" :touchless="true">
      <v-tab-item>
        <div class="d-flex mt-3 px-5">
          <v-spacer></v-spacer>
          <div class="mr-12">
            <div class="d-flex justify-end">
              <div class="mr-3">{{ $t("Extra.戦果砲残弾合計") }}</div>
              <div class="total-ranking-point">{{ totalRankingPoint }}</div>
            </div>
            <div class="d-flex justify-end caption">
              <div class="mr-1">{{ $t("Extra.クォータリー") }}:</div>
              <div>{{ totalQuarterlyRankingPoint }}</div>
              <div class="mx-2">/</div>
              <div class="mr-1">{{ $t("Extra.イヤーリー") }}:</div>
              <div>{{ totalYearlyRankingPoint }}</div>
              <div class="mx-2">/</div>
              <div class="mr-1">{{ $t("Extra.単発") }}:</div>
              <div>{{ totalOnceRankingPoint }}</div>
            </div>
          </div>
        </div>
        <div class="pa-2">
          <v-expansion-panels multiple>
            <v-expansion-panel v-for="(quest, i) in uncompletedQuests" :key="i">
              <v-expansion-panel-header>
                <div class="mr-3">
                  <div class="d-flex align-center">
                    <div class="quest-icon">
                      <v-img :src="`./img/util/sortie_quest.png`" width="48" height="48"></v-img>
                      <div class="quest-type-icon">
                        <v-img v-if="quest.type === 'Yearly'" :src="`./img/util/yearly_6.png`" width="42" height="43"></v-img>
                        <v-img v-else-if="quest.type === 'Quarterly'" :src="`./img/util/quarterly.png`" width="41" height="40"></v-img>
                        <v-img v-else-if="quest.type === 'Once'" :src="`./img/util/once.png`" width="41" height="40"></v-img>
                      </div>
                    </div>
                    <div class="ml-4 flex-grow-1">
                      <div class="quest-title">
                        <div class="d-flex align-center">
                          <div class="flex-grow-1 mr-3">
                            {{ $t(`Extra.${quest.name}`) }}
                          </div>
                          <template v-if="quest.type !== 'Once'">
                            <div class="ml-auto d-flex align-center text-no-wrap">
                              <div class="mr-1 caption">{{ $t("Extra.あと") }}</div>
                              <div>{{ timeRemaining[i] }}</div>
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
                        <v-img :src="`./img/util/fuel.png`" height="18" width="18"></v-img>
                        <div class="resource-reward">{{ quest.fuel }}</div>
                        <v-img :src="`./img/util/steel.png`" height="18" width="18"></v-img>
                        <div class="resource-reward">{{ quest.steel }}</div>
                      </div>
                      <div class="d-flex align-center">
                        <v-img :src="`./img/util/ammo.png`" height="18" width="18"></v-img>
                        <div class="resource-reward">{{ quest.ammo }}</div>
                        <v-img :src="`./img/util/bauxite.png`" height="18" width="18"></v-img>
                        <div class="resource-reward">{{ quest.bauxite }}</div>
                      </div>
                    </div>
                    <div class="ml-3">
                      <v-img :src="`./img/util/ranking_point.png`" height="50" width="50"></v-img>
                    </div>
                    <div class="ranking-point-reward">{{ quest.rankingPoint }}</div>
                  </div>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-divider></v-divider>
                <div class="d-flex flex-wrap">
                  <div v-for="(check, j) in quest.requires" :key="`req${j}`" class="check-container">
                    <v-checkbox
                      v-model="check.isComplete"
                      @change="updateState"
                      hide-details
                      :label="`${check.area} ${$t(`Extra.${check.rank}勝利`)}`"
                    ></v-checkbox>
                  </div>
                </div>
                <div class="mt-6">
                  <v-btn v-if="quest.getProgressValue === 100" color="primary" @click="confirmComplete(quest)">{{ $t("Extra.達成") }}</v-btn>
                  <v-btn v-else depressed color="secondary" @click="confirmComplete(quest)">{{ $t("Extra.達成") }}</v-btn>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-tab-item>
      <v-tab-item class="pt-3">
        <v-card class="py-3 px-6 mx-3 my-1" v-for="(quest, i) in completedQuests" :key="i">
          <div class="d-flex align-center">
            <div class="flex-grow-1">
              <div class="quest-title">
                <div class="d-flex align-center">
                  <div class="flex-grow-1 mr-3">
                    {{ $t(`Extra.${quest.name}`) }}
                  </div>
                  <div class="ml-auto text-no-wrap caption">
                    <div class="d-flex align-center">
                      <div class="mr-1 caption">{{ $t("Extra.達成日") }}:</div>
                      <div>{{ new Date(quest.completedDate).toLocaleString($vuetify.lang.current) }}</div>
                    </div>
                    <div class="d-flex align-center">
                      <div class="mr-1 caption">リセット:</div>
                      <div>{{ new Date(quest.resetDate).toLocaleString($vuetify.lang.current) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bar-container">
                <div>
                  <v-progress-linear value="100" color="success" />
                </div>
                <div class="progress-count">{{ quest.requires.length }} / {{ quest.requires.length }}</div>
              </div>
            </div>
            <div class="ml-6">
              <v-img :src="`./img/util/ranking_point.png`" height="50" width="50"></v-img>
            </div>
            <div class="ranking-point-reward">{{ quest.rankingPoint }}</div>
            <div class="ml-3">
              <v-btn color="secondary" @click="confirmReset(quest)">{{ $t("Extra.未達成にする") }}</v-btn>
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
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="primary" dark @click.stop="completeQuest()">{{ $t("Common.OK") }}</v-btn>
          <v-btn class="ml-4" color="secondary" @click.stop="confirmCompleteDialog = false">{{ $t("Common.戻る") }}</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="confirmResetDialog" transition="scroll-x-transition" width="500">
      <v-card class="pa-3" v-if="completeTargetQuest.id">
        <div class="ma-4">
          <div class="my-3 py-3">{{ $t(`Extra.${completeTargetQuest.name}`) }}</div>
          <div class="body-2">{{ $t("Extra.この任務を未達成状態にしますか？") }}</div>
          <div class="caption mt-2">※ {{ $t("Extra.再度、未達成タブに表示されるようになります。") }}</div>
        </div>
        <v-divider class="my-2"></v-divider>
        <div class="d-flex">
          <v-btn class="ml-auto" color="primary" dark @click.stop="resetQuest()">{{ $t("Common.OK") }}</v-btn>
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

.check-container {
  min-width: 128px;
  margin-right: 2rem;
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
    confirmCompleteDialog: false,
    confirmResetDialog: false,
    completeTargetQuest: new Quest(),
    snackBar: false,
    snackBarText: '',
    timeRemaining: [] as string[],
    intervalId: 0,
  }),
  mounted() {
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

      for (let j = 0; j < master.requires.length; j += 1) {
        quest.requires.push({
          area: master.requires[j].area,
          rank: master.requires[j].rank,
          isComplete: false,
        });
      }

      // 保存されている任務達成状況から値を復元
      const savedQuest = savedQuests.find((v) => v.id === quest.id);
      if (savedQuest) {
        // 達成状況をセット
        quest.isCompleted = !!savedQuest.isCompleted;
        quest.requires = savedQuest.requires;
        if (quest.isCompleted) {
          quest.completedDate = savedQuest.completedDate;
          quest.resetDate = savedQuest.resetDate;
        }
      }

      quests.push(quest);
    }

    this.allQuests = quests;
    this.setTimeRemaining();

    this.intervalId = window.setInterval(() => {
      this.setTimeRemaining();
    }, 1000);
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
    updateState() {
      // ローカルの任務群に保存するだけ
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
      quest.completedDate = new Date().getTime();

      // リセット日を算出
      const today = this.createDate(new Date());
      const month = today.getMonth();
      if (quest.type === 'Quarterly') {
        quest.resetDate = this.createDate(new Date(today.getFullYear(), month + 2 - ((month + 1) % 3) + 1, 1, 5, 0, 0)).getTime();
      } else if (quest.type === 'Yearly') {
        if (today.getTime() < this.createDate(new Date(today.getFullYear(), 5, 1, 4, 59, 59)).getTime()) {
          // 今年の 6/1 4:59:59までに任務達成していたら今年の 6/1 5:00:00
          quest.resetDate = this.createDate(new Date(today.getFullYear(), 5, 1, 5, 0, 0)).getTime();
        } else {
          // 上記を超えていたら、来年の 6/1 5:00:00
          quest.resetDate = this.createDate(new Date(today.getFullYear() + 1, 5, 1, 5, 0, 0)).getTime();
        }
      }
      this.confirmCompleteDialog = false;

      // ローカルの任務群に保存
      this.$store.dispatch('updateQuests', this.allQuests);

      this.snackBar = true;
      this.snackBarText = `[ ${this.$t(`Extra.${this.completeTargetQuest.name}`)} ] ${this.$t('Extra.達成しました。')}`;
    },
    confirmReset(quest: Quest) {
      this.completeTargetQuest = quest;
      this.confirmResetDialog = true;
    },
    resetQuest() {
      const quest = this.allQuests.find((v) => v.id === this.completeTargetQuest.id);
      if (!quest) {
        return;
      }

      quest.isCompleted = false;
      quest.completedDate = 0;
      quest.resetDate = 0;
      for (let i = 0; i < quest.requires.length; i += 1) {
        quest.requires[i].isComplete = false;
      }

      this.confirmResetDialog = false;

      // ローカルの任務群に保存
      this.$store.dispatch('updateQuests', this.allQuests);

      this.snackBar = true;
      this.snackBarText = `[ ${this.$t(`Extra.${this.completeTargetQuest.name}`)} ] ${this.$t('Extra.未達成にしました。')}`;
    },
    createDate(date: Date): Date {
      return new Date(date.getTime() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000);
    },
    setTimeRemaining() {
      const today = this.createDate(new Date());
      const month = today.getMonth();
      let needUpdate = false;

      const timeRemainingTexts: string[] = [];
      for (let i = 0; i < this.allQuests.length; i += 1) {
        const quest = this.allQuests[i];

        let closingTime = new Date();
        let timeRemainingText = '';

        if (quest.type === 'Quarterly') {
          // 2,5,8,11の月末 13:59締日
          closingTime = this.createDate(new Date(today.getFullYear(), month + 2 - ((month + 1) % 3) + 1, 0, 13, 59, 59));
        } else if (quest.type === 'Yearly') {
          // 実行日付と同じ年の5月末を過ぎているかどうか
          if (today.getTime() < this.createDate(new Date(today.getFullYear(), 5, 0, 13, 59, 59)).getTime()) {
            // 過ぎていないなら、今年の5月末
            closingTime = this.createDate(new Date(today.getFullYear(), 5, 0, 13, 59, 59));
          } else {
            // 過ぎているなら、来年の5月末
            closingTime = this.createDate(new Date(today.getFullYear() + 1, 5, 0, 13, 59, 59));
          }
        }

        const diff = closingTime.getTime() - today.getTime();
        const remainingDay = Math.floor(diff / 86400000);
        if (remainingDay > 1) {
          timeRemainingText = `${this.$t('Extra.x日', { days: remainingDay })}`;
        } else if (remainingDay > 0) {
          timeRemainingText = `${this.$t('Extra.1日')}`;
        } else if (remainingDay === 0) {
          // 時間単位
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
          timeRemainingText = `${this.$t('Extra.失効')}`;
        }

        // 復活処理
        if (quest.isCompleted && quest.resetDate && today.getTime() > quest.resetDate) {
          // 達成任務かつ単発でないかつリセット日を超えたら復活
          quest.isCompleted = false;
          quest.completedDate = 0;
          quest.resetDate = 0;
          for (let j = 0; j < quest.requires.length; j += 1) {
            quest.requires[j].isComplete = false;
          }

          // 更新がかけられたので更新要求
          needUpdate = true;
        }

        if (!quest.isCompleted) {
          timeRemainingTexts.push(timeRemainingText);
        }
      }

      this.timeRemaining = timeRemainingTexts;

      if (needUpdate) {
        this.updateState();
      }
    },
  },
  beforeDestroy() {
    window.clearInterval(this.intervalId);
  },
});
</script>
