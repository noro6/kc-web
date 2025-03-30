<template>
  <v-card class="pa-3">
    <v-divider />
    <v-data-table
      dense
      fixed-header
      disable-sort
      height="48vh"
      :headers="headers"
      :items="enemies"
      :footer-props="{
        showFirstLastPage: true,
        firstIcon: 'mdi-chevron-double-left',
        lastIcon: 'mdi-chevron-double-right',
        prevIcon: 'mdi-chevron-left',
        nextIcon: 'mdi-chevron-right',
        'items-per-page-options': [50, 100],
      }"
      mobile-breakpoint="0"
    >
      <template v-slot:[`header.rank`]="{ header }">{{ $t(`Extra.${header.text}`) }}</template>
      <template v-slot:[`header.enemy.data.name`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.enemy.data.antiAir`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.shoot.antiAirWeightList`]="{ header }">{{ $t(`Common.${header.text}`) }}</template>
      <template v-slot:[`header.shoot.rateDownList`]="{ header }">{{ $t(`Fleet.${header.text}`) }} (%)</template>
      <template v-slot:[`header.shoot.fixDownList`]="{ header }">{{ $t(`Fleet.${header.text}`) }} ({{ $t("Extra.機") }})</template>
      <template v-slot:[`header.enemy.antiAirCutIn`]="{ header }">{{ $t(`Extra.${header.text}`) }}</template>
      <template v-slot:[`item.enemy.data.id`]="{ item }">
        <v-img :src="`./img/ship/banner/${item.enemy.data.id}.png`" height="30" width="120" />
      </template>
      <template v-slot:[`item.enemy.data.name`]="{ item }">
        <div class="text-truncate" :title="item.enemy.data.name">{{ getEnemyName(item.enemy.data.name) }}</div>
      </template>
      <template v-slot:[`item.shoot.rateDownList`]="{ item }">
        <div>{{ (100 * item.shoot.rateDownList[0]).toFixed(1) }}</div>
      </template>
      <template v-slot:[`item.shoot.fixDownList`]="{ item }">
        <div>{{ item.shoot.fixDownList[0] }}</div>
      </template>
      <template v-slot:[`item.enemy.antiAirCutIn`]="{ item }">
        <div>{{ item.enemy.antiAirCutIn.length ? $t("Extra.対空CI発動可能") : "" }}</div>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.keyword-text {
  width: 200px;
}

.v-card >>> .v-data-table th,
.v-card >>> .v-data-table td {
  white-space: nowrap;
  padding: 0 8px !important;
}
.v-card >>> .v-data-table th:first-child,
.v-card >>> .v-data-table td:first-child {
  width: 60px;
  padding: 0 16px !important;
}

.v-card >>> .v-data-table th:nth-child(2),
.v-card >>> .v-data-table td:nth-child(2) {
  width: 120px;
  padding: 0 !important;
}
</style>

<script lang="ts">
import AntiAirCutIn from '@/classes/aerialCombat/antiAirCutIn';
import ShootDownInfo, { ShootDownStatus } from '@/classes/aerialCombat/shootDownInfo';
import Const from '@/classes/const';
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import ItemMaster from '@/classes/item/itemMaster';
import SiteSetting from '@/classes/siteSetting';
import Vue from 'vue';

export default Vue.extend({
  name: 'EnemyAARanking',
  components: {},
  data: () => ({
    keyword: '',
    headers: [
      {
        text: '順位',
        value: 'rank',
        align: 'end',
      },
      {
        text: '',
        value: 'enemy.data.id',
      },
      {
        text: '艦娘名',
        value: 'enemy.data.name',
      },
      {
        text: '対空',
        align: 'end',
        value: 'enemy.data.antiAir',
      },
      {
        text: '加重対空',
        align: 'end',
        value: 'shoot.antiAirWeightList',
      },
      {
        text: '割合撃墜',
        align: 'end',
        value: 'shoot.rateDownList',
      },
      {
        text: '固定撃墜',
        align: 'end',
        value: 'shoot.fixDownList',
      },
      {
        text: '備考',
        value: 'enemy.antiAirCutIn',
      },
    ],
    allEnemies: [] as Enemy[],
    enemies: [] as { rank: number; enemy: Enemy; shoot: ShootDownStatus }[],
  }),
  mounted() {
    this.setEnemies();
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
  },
  watch: {
    completed(value) {
      if (value) {
        this.setEnemies();
      }
    },
  },
  methods: {
    getEnemyName(name: string): string {
      if (name && this.needTrans) {
        const shipName = EnemyMaster.getSuffix(name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return name || '';
    },
    setEnemies() {
      const all = this.$store.getters.getEnemies as EnemyMaster[];
      const items = this.$store.state.items as ItemMaster[];
      const enemies = [];

      for (let i = 0; i < all.length; i += 1) {
        const enemy = Enemy.createEnemyFromMasterId(all[i].id, false, all, items);
        enemies.push(enemy);
      }
      this.allEnemies = enemies;

      this.calculateEnemies();
    },
    calculateEnemies() {
      const enemies = [];
      for (let i = 0; i < this.allEnemies.length; i += 1) {
        const enemy = this.allEnemies[i];
        const shootDownInfo = ShootDownInfo.getStage2([enemy], true, false, Const.FORMATIONS[0], new AntiAirCutIn());

        enemies.push({ enemy, shoot: shootDownInfo[0] });
      }

      enemies.sort((a, b) => {
        if (a.shoot.fixDownList[0] !== b.shoot.fixDownList[0]) {
          return b.shoot.fixDownList[0] - a.shoot.fixDownList[0];
        }
        if (a.shoot.rateDownList[0] !== b.shoot.rateDownList[0]) {
          return b.shoot.rateDownList[0] - a.shoot.rateDownList[0];
        }
        return b.enemy.data.antiAir - a.enemy.data.antiAir;
      });

      const rows = [];
      for (let index = 0; index < enemies.length; index += 1) {
        rows.push({ rank: index + 1, enemy: enemies[index].enemy, shoot: enemies[index].shoot });
      }

      this.enemies = rows;
    },
  },
});
</script>
