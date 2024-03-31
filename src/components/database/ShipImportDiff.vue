<template>
  <v-card>
    <div class="d-flex pb-1 px-3 pt-2">
      <div class="align-self-center">{{ $t("Database.成長の記録") }}</div>
      <v-spacer />
      <v-btn icon @click="handleClose">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider />
    <div class="d-flex flex-wrap align-center py-3 px-2 px-sm-3">
      <div class="caption mr-3">{{ $t("Database.表示") }}</div>
      <v-btn
        small
        rounded
        color="error"
        :depressed="showNewcomers"
        :text="!showNewcomers"
        @click="
          showNewcomers = !showNewcomers;
          generateTable();
        "
      >
        {{ $t("Database.新規") }}
      </v-btn>
      <v-btn
        small
        rounded
        color="success"
        class="mx-1"
        :depressed="showDiffs"
        :text="!showDiffs"
        @click="
          showDiffs = !showDiffs;
          generateTable();
        "
      >
        {{ $t("Database.更新") }}
      </v-btn>
      <v-btn
        rounded
        small
        color="secondary"
        :depressed="showExpulsions"
        :text="!showExpulsions"
        @click="
          showExpulsions = !showExpulsions;
          generateTable();
        "
      >
        {{ $t("Database.除籍") }}
      </v-btn>
      <v-spacer></v-spacer>
      <div class="d-flex caption mt-3 mt-sm-0" v-if="showExpMode">
        <div class="mr-1">{{ $t("Database.増加経験値合計") }}</div>
        <div>{{ totalDiffExp ? totalDiffExp.toLocaleString() : 0 }}</div>
      </div>
      <v-switch
        class="ml-1 ml-sm-3 mt-3 mt-sm-0 pt-0"
        v-model="showExpMode"
        :disabled="noDiff"
        hide-details
        @change="generateTable()"
        dense
        :label="$t('Database.経験値表示モード')"
      />
    </div>
    <v-divider />
    <v-simple-table fixed-header :height="isMobile ? '80vh' : '66vh'" dense>
      <template v-slot:default>
        <tbody>
          <tr v-for="(row, i) in diffs" :key="`diff${i}`">
            <td class="image-td">
              <div class="d-flex align-center text-left">
                <div class="mr-1">
                  <v-img :src="`./img/ship/${row.ship.id}.png`" height="30" width="120" />
                </div>
                <div class="d-none d-sm-block flex-grow-1">
                  <div class="ship-level primary--text">Lv {{ row.level }}</div>
                  <div class="d-flex">
                    <div class="ship-name text-truncate">{{ getShipName(row.ship) }}</div>
                  </div>
                </div>
              </div>
            </td>
            <td class="text-center" v-if="!isMobile">
              <v-chip v-if="row.type === 1" color="error" small>{{ $t("Database.新規") }}</v-chip>
              <v-chip v-if="row.type === 2" color="success" small>{{ $t("Database.更新") }}</v-chip>
              <v-chip v-if="row.type === 3" color="secondary" small>{{ $t("Database.除籍") }}</v-chip>
            </td>
            <td class="caption text-td">
              <div v-if="isMobile">
                <v-chip v-if="row.type === 1" color="error" small>{{ $t("Database.新規") }}</v-chip>
                <v-chip v-if="row.type === 2" color="success" small>{{ $t("Database.更新") }}</v-chip>
                <v-chip v-if="row.type === 3" color="secondary" small>{{ $t("Database.除籍") }}</v-chip>
              </div>
              <div v-if="row.type === 1 && !showExpMode">{{ $t("Database.着任しました。") }}</div>
              <div v-if="row.type === 3 && !showExpMode">{{ $t("Database.除籍されました。") }}</div>
              <template v-if="row.logs">
                <div v-for="log in row.logs" :key="log.title" class="d-flex align-center flex-wrap">
                  <template v-if="log.title === '改造'">{{ $t("Database.xから改造されました。", { base: log.old }) }}</template>
                  <template v-else-if="log.title === '補強増設'">
                    <div>{{ $t("Database.補強増設を使用しました。") }}</div>
                    <div>
                      <v-img :src="`./img/util/slot_ex.png`" height="25" width="25" />
                    </div>
                  </template>
                  <template v-else-if="log.title === 'ケッコン'">
                    <div>{{ $t("Database.ケッコンカッコカリしました。") }}</div>
                    <div>{{ $t("Database.おめでとうございます！") }}</div>
                  </template>
                  <template v-else-if="log.title === '最大Lv'">
                    <div>{{ $t("Database.上限Lvに達しました。") }}</div>
                    <div>{{ $t("Database.おめでとうございます！") }}</div>
                  </template>
                  <template v-else-if="log.title === 'Lv'">
                    <div>{{ $t("Database.Lvが上昇しました。") }}</div>
                    <div class="d-flex">
                      <div class="level-text">{{ log.old }}</div>
                      <div class="ml-2">
                        <v-icon small>mdi-arrow-right-thin</v-icon>
                      </div>
                      <div class="level-text">{{ log.current }}</div>
                      <div class="ml-2">( {{ addMinusString(log.diff) }} )</div>
                    </div>
                  </template>
                  <template v-else-if="showExpMode && log.title === 'exp'">
                    <div class="exp-text">{{ log.old }}</div>
                    <div class="d-flex">
                      <div class="ml-2">
                        <v-icon small>mdi-arrow-right-thin</v-icon>
                      </div>
                      <div class="exp-text">
                        {{ log.current }}
                      </div>
                      <div class="ml-2">( {{ addMinusString(log.diff) }} )</div>
                    </div>
                  </template>
                  <template v-else>
                    <div>{{ $t("Database.xしました。", { x: log.title }) }}</div>
                    <div class="d-flex">
                      <div class="level-text">{{ log.old }}</div>
                      <div class="ml-2">
                        <v-icon small>mdi-arrow-right-thin</v-icon>
                      </div>
                      <div class="level-text">{{ log.current }}</div>
                      <div class="ml-2">( {{ addMinusString(log.diff) }} )</div>
                    </div>
                  </template>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-card>
</template>

<style scoped>
tbody td {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}
.stage2-id {
  font-size: 11px;
  height: 13px;
}
.ship-level {
  font-size: 11px;
  height: 14px;
  font-weight: bold;
}
.ship-name {
  flex-grow: 1;
  font-size: 12px;
  width: 80px;
}
.level-text {
  width: 28px;
  text-align: right;
}
.exp-text {
  width: 72px;
  text-align: right;
}
.image-td {
  padding-right: 0px !important;
  padding-left: 8px !important;
}
.text-td {
  padding-left: 4px !important;
}
@media (min-width: 600px) {
  .image-td {
    padding-right: 16px !important;
    padding-left: 16px !important;
  }
  .text-td {
    padding-left: 16px !important;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipStock from '@/classes/fleet/shipStock';
import ShipMaster from '@/classes/fleet/shipMaster';
import ShipStockDiff from '../../classes/fleet/shipStockDiff';
import SiteSetting from '../../classes/siteSetting';
import Const from '../../classes/const';

type logText = {
  type: number;
  title: string;
  current: string;
  old: string;
  diff: number;
};

type tableRow = {
  type: number;
  ship: ShipMaster;
  level: number;
  logs: logText[];
};

export default Vue.extend({
  name: 'ShipImportDiff',
  props: {
    handleClose: {
      type: Function,
    },
  },
  data: () => ({
    diffs: [] as tableRow[],
    noDiff: false,
    showExpMode: false,
    showNewcomers: true,
    showDiffs: true,
    showExpulsions: true,
    totalDiffExp: 0,
    isMobile: true,
  }),
  mounted() {
    this.generateTable();
  },
  watch: {},
  computed: {
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    newcomersCount(): number {
      return this.diffs.filter((v) => v.type === 1).length;
    },
    diffCount(): number {
      return this.diffs.filter((v) => v.type === 2).length;
    },
    expulsionCount(): number {
      return this.diffs.filter((v) => v.type === 3).length;
    },
  },
  methods: {
    getShipName(ship: ShipMaster) {
      if (this.needTrans) {
        const shipName = ShipMaster.getSuffix(ship);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return ship.name || '';
    },
    generateTable() {
      this.isMobile = window.innerWidth < 600;
      const all = this.$store.state.ships as ShipMaster[];
      const currentStock = this.$store.state.shipStock as ShipStock[];
      const diff = this.$store.state.shipStockDiff as ShipStockDiff;

      this.diffs = [];
      this.totalDiffExp = 0;

      // 着任行
      if (this.showNewcomers) {
        for (let i = 0; i < diff.newcomers.length; i += 1) {
          const newcomer = diff.newcomers[i];
          const master = all.find((v) => v.id === newcomer.id);
          if (!master || (this.showExpMode && !newcomer.exp)) continue;

          const logs = [];
          if (this.showExpMode) {
            logs.push({
              type: 0,
              title: 'exp',
              current: newcomer.exp.toLocaleString(),
              old: '0',
              diff: newcomer.exp,
            });

            this.totalDiffExp += newcomer.exp;
          } else if (newcomer.releaseExpand) {
            logs.push({
              type: 2,
              title: '補強増設',
              current: '',
              old: '',
              diff: 0,
            });
          }
          this.diffs.push({
            type: 1,
            ship: master,
            level: newcomer.level,
            logs,
          });
        }
      }

      if (this.showDiffs) {
        for (let i = 0; i < diff.diffs.length; i += 1) {
          const old = diff.diffs[i];
          const current = currentStock.find((v) => v.uniqueId === old.uniqueId);
          if (current) {
            const master = all.find((v) => v.id === current.id);
            if (!master) continue;

            const logs: logText[] = [];
            // 経験値モード
            if (this.showExpMode) {
              const diffExp = current.exp - old.exp;
              if (current.exp !== old.exp) {
                logs.push({
                  type: 0,
                  title: 'exp',
                  current: current.exp.toLocaleString(),
                  old: old.exp.toLocaleString(),
                  diff: diffExp,
                });
              }
              this.totalDiffExp += diffExp;
            } else {
              if (current.level !== old.level) {
                logs.push({
                  type: 9,
                  title: 'Lv',
                  current: current.level.toLocaleString(),
                  old: old.level.toLocaleString(),
                  diff: current.level - old.level,
                });
              }
              if (current.level >= 100 && old.level <= 99) {
                logs.push({
                  type: 10,
                  title: 'ケッコン',
                  current: '',
                  old: '',
                  diff: 0,
                });
              }
              if (current.level === Const.MAX_LEVEL && old.level < Const.MAX_LEVEL) {
                logs.push({
                  type: 11,
                  title: '最大Lv',
                  current: '',
                  old: '',
                  diff: 0,
                });
              }
              if (current.improvement.luck !== old.improvement.luck) {
                logs.push({
                  type: 4,
                  title: `${this.$t('Database.運改修')}`,
                  current: (master.luck + current.improvement.luck).toLocaleString(),
                  old: (master.luck + old.improvement.luck).toLocaleString(),
                  diff: current.improvement.luck - old.improvement.luck,
                });
              }
              if (current.improvement.hp !== old.improvement.hp) {
                const baseHP = current.level <= 99 ? master.hp : master.hp2;
                logs.push({
                  type: 5,
                  title: `${this.$t('Database.耐久改修')}`,
                  current: (baseHP + current.improvement.hp).toLocaleString(),
                  old: (baseHP + old.improvement.hp).toLocaleString(),
                  diff: current.improvement.hp - old.improvement.hp,
                });
              }
              if (current.improvement.asw !== old.improvement.asw) {
                logs.push({
                  type: 6,
                  title: `${this.$t('Database.対潜改修')}`,
                  current: current.improvement.asw.toLocaleString(),
                  old: old.improvement.asw.toLocaleString(),
                  diff: current.improvement.asw - old.improvement.asw,
                });
              }
              if (current.id !== old.id) {
                const oldMaster = all.find((v) => v.id === old.id);
                logs.push({
                  type: 1,
                  title: '改造',
                  current: this.getShipName(master),
                  old: this.getShipName(oldMaster || new ShipMaster()),
                  diff: 0,
                });
              }
              if (current.releaseExpand && !old.releaseExpand) {
                logs.push({
                  type: 2,
                  title: '補強増設',
                  current: '',
                  old: '',
                  diff: 0,
                });
              }
            }

            if (!logs.length) continue;

            this.diffs.push({
              type: 2,
              ship: master,
              level: current.level,
              logs,
            });
          }
        }
      }

      // 除籍行
      if (this.showExpulsions) {
        for (let i = 0; i < diff.expulsionShips.length; i += 1) {
          const expulsionShip = diff.expulsionShips[i];
          const master = all.find((v) => v.id === expulsionShip.id);
          if (!master || (this.showExpMode && !expulsionShip.exp)) continue;

          const logs = [];
          if (this.showExpMode) {
            logs.push({
              type: 0,
              title: 'exp',
              current: '0',
              old: expulsionShip.exp.toLocaleString(),
              diff: -expulsionShip.exp,
            });
            this.totalDiffExp -= expulsionShip.exp;
          }

          this.diffs.push({
            type: 3,
            ship: master,
            level: expulsionShip.level,
            logs,
          });
        }
      }

      // 条件なしだけどテーブルログがない！
      if (this.showNewcomers && this.showExpulsions && this.showDiffs && !this.diffs.length && !this.showExpMode) {
        // EXPモードでもう一度作成
        this.showExpMode = true;
        this.noDiff = true;
        this.generateTable();
        return;
      }

      if (this.showExpMode) {
        // 経験値差分順
        // ひとえに経験値差分順番
        this.diffs.sort((a, b) => +a.logs[0].diff - +b.logs[0].diff);
      } else {
        // いい感じのソート
        this.diffs.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type - b.type;
          }

          // ログ個数順
          const aLogCount = a.logs.length;
          const bLogCount = b.logs.length;
          if (aLogCount !== bLogCount) {
            return aLogCount - bLogCount;
          }

          if (aLogCount && bLogCount && a.logs[0].type !== b.logs[0].type) {
            return a.logs[0].type - b.logs[0].type;
          }

          return a.level - b.level;
        });
      }
    },
    addMinusString(value: number): string {
      return (value > 0 ? '+ ' : '') + value.toLocaleString();
    },
  },
});
</script>
