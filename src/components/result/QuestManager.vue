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
                    <div class="flex-grow-1">
                      <div class="quest-title">
                        <div class="d-flex align-center">
                          <div class="flex-grow-1">
                            {{ $t(`Extra.${quest.name}`) }}
                          </div>
                          <template v-if="quest.type !== 'Once'">
                            <div class="d-flex align-center text-no-wrap">
                              <div class="ml-auto mr-1 caption">{{ $t("Extra.あと") }}</div>
                              <div>{{ getTimeRemainingText(quest.type) }}</div>
                            </div>
                          </template>
                        </div>
                      </div>
                      <div class="bar-container">
                        <div>
                          <v-progress-linear :value="quest.getProgressValue" :color="getBarColor(quest.getProgressValue)" />
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
                      <v-img :src="`./img/util/slot_ex.png`" height="50" width="50"></v-img>
                    </div>
                    <div class="ranking-point-reward">{{ quest.rankingPoint }}</div>
                  </div>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-divider></v-divider>
                <div class="d-flex flex-wrap">
                  <div v-for="(check, j) in quest.requires" :key="`req${j}`" class="check-container">
                    <v-checkbox v-model="check.isComplete" hide-details :label="`${check.area} ${$t(`Extra.${check.rank}勝利`)}`"></v-checkbox>
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
                <div>
                  {{ $t(`Extra.${quest.name}`) }}
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
              <v-img :src="`./img/util/slot_ex.png`" height="50" width="50"></v-img>
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
  width: 42px;
  text-align: right;
  margin-right: 0.5rem;
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
  }),
  mounted() {
    const quests = [];
    for (let i = 0; i < Const.RANKING_POINT_QUESTS.length; i += 1) {
      const master = Const.RANKING_POINT_QUESTS[i];
      // 初期化
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

      quests.push(quest);
    }

    this.allQuests = quests;
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
    getTimeRemainingText() {
      return (type: string) => {
        const today = new Date('2022-5-31 16:00:00');
        const month = today.getMonth();

        let closingTime = new Date();
        if (type === 'Quarterly') {
          // 2,5,8,11の月末 13:59が締め日
          closingTime = new Date(today.getFullYear(), month + 2 - ((month + 1) % 3) + 1, 0, 14, 59, 59);
        } else if (type === 'Yearly') {
          if (today.getTime() < new Date(today.getFullYear(), 5, 0, 14, 59, 59).getTime()) {
            // 今年の5月末
            closingTime = new Date(today.getFullYear(), 5, 0, 14, 59, 59);
          } else {
            // 来年の5月末
            closingTime = new Date(today.getFullYear() + 1, 5, 0, 14, 59, 59);
          }
        }

        const remainingDay = Math.floor((closingTime.getTime() - today.getTime()) / 86400000);
        if (remainingDay > 1) {
          return `${this.$t('Extra.x日', { days: remainingDay })}`;
        }
        if (remainingDay === 1) {
          return `${this.$t('Extra.1日')}`;
        }
        if (remainingDay < 0) {
          return `${this.$t('Extra.失効')}`;
        }

        // 時間単位
        return 'TODO';
      };
    },
  },
  watch: {},
  methods: {
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
      this.confirmCompleteDialog = false;

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
      this.confirmResetDialog = false;

      this.snackBar = true;
      this.snackBarText = `[ ${this.$t(`Extra.${this.completeTargetQuest.name}`)} ] ${this.$t('Extra.未達成にしました。')}`;
    },
  },
});
</script>
