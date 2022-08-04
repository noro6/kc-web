<template>
  <v-card>
    <div class="d-flex px-2 pt-2 pb-1">
      <div class="align-self-center ml-3">{{ $t("Airbase.基地航空隊派遣先設定") }}</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <div class="px-4 target-buttons" v-for="(lb, i) in info.airbases" :key="i">
      <v-divider></v-divider>
      <div class="py-3">
        <div v-for="(t, j) in lb.battleTarget" :key="j" class="d-flex ml-3 pb-1">
          <div class="align-self-center body-2 mr-3">{{ $t("Airbase.第x基地航空隊", { number: i + 1 }) }} {{ $t("Airbase.第x波", { number: j + 1 }) }}</div>
          <v-btn-toggle v-model="lb.battleTarget[j]" mandatory dense tile color="light-blue">
            <v-btn
              v-for="(battle, i) in battleInfo.fleets"
              :key="i"
              :value="i"
              :disabled="lb.mode !== 1"
              @mouseenter="bootTooltip(i, $event)"
              @mouseleave="clearTooltip"
              >{{ battle.nodeName ? battle.nodeName : i + 1 }}</v-btn
            >
          </v-btn-toggle>
        </div>
      </div>
    </div>
    <v-tooltip v-model="enabledTooltip" color="black" right transition="slide-y-transition" :position-x="tooltipX" :position-y="tooltipY">
      <div class="py-1">
        <div class="d-flex my-1">
          <div class="grey--text text--lighten-1">{{ $t("Enemies.戦闘形式") }}:</div>
          <div class="ml-1">{{ getCellName(tooltipFleet.cellType) }}</div>
          <div class="ml-2 grey--text text--lighten-1">{{ $t("Enemies.陣形") }}:</div>
          <div class="ml-1">{{ getFormationName(tooltipFleet.formation) }}</div>
          <div class="ml-2 grey--text text--lighten-1" v-if="tooltipFleet.radius[0]">{{ $t("Common.半径") }}:</div>
          <div class="ml-1" v-if="tooltipFleet.radius[0]">{{ tooltipFleet.radius.join(" or ") }}</div>
        </div>
        <div v-for="(enemy, i) in tooltipFleet.enemies" :key="`preview_enemy${i}`" class="d-flex">
          <template v-if="enemy.data.id">
            <div class="align-self-center">
              <v-img :src="`./img/ship/${enemy.data.id}.png`" height="30" width="120"></v-img>
            </div>
            <div class="ml-1 align-self-center caption">
              <div class="enemy-id info--text">id:{{ enemy.data.id }}</div>
              <div class="enemy-name">{{ getEnemyName(enemy.data.name) }}</div>
            </div>
          </template>
        </div>
      </div>
    </v-tooltip>
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

.enemy-id {
  font-size: 0.9em;
  height: 16px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import AirbaseInfo from '@/classes/airbase/airbaseInfo';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import BattleInfo from '@/classes/enemy/battleInfo';
import SiteSetting from '@/classes/siteSetting';
import Const from '@/classes/const';
import EnemyMaster from '@/classes/enemy/enemyMaster';

export default Vue.extend({
  components: {},
  name: 'AirbaseTarget',
  props: {
    value: {
      type: AirbaseInfo,
      required: true,
    },
    battleInfo: {
      type: BattleInfo,
      required: true,
    },
    handleClose: {
      type: Function,
    },
  },
  data: () => ({
    enabledTooltip: false,
    tooltipTimer: undefined as undefined | number,
    tooltipFleet: new EnemyFleet(),
    tooltipX: 0,
    tooltipY: 0,
  }),
  computed: {
    info(): AirbaseInfo {
      return this.value;
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
  },
  methods: {
    close() {
      this.handleClose();
    },
    bootTooltip(index: number, e: MouseEvent) {
      this.tooltipTimer = window.setTimeout(() => {
        this.tooltipX = e.clientX + 20;
        this.tooltipY = e.clientY;
        this.tooltipFleet = this.battleInfo.fleets[index];
        this.enabledTooltip = true;
      }, 400);
    },
    clearTooltip() {
      this.enabledTooltip = false;
      window.clearTimeout(this.tooltipTimer);
    },
    getFormationName(i: number) {
      const formation = Const.FORMATIONS.find((v) => v.value === i);
      return formation ? this.$t(`Common.${formation.text}`) : '';
    },
    getCellName(i: number) {
      const cell = Const.CELL_TYPES.find((v) => v.value === i);
      return cell ? this.$t(`Common.${cell.text}`) : '';
    },
    getEnemyName(name: string): string {
      if (name && this.needTrans) {
        const shipName = EnemyMaster.getSuffix(name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return name || '';
    },
  },
});
</script>
