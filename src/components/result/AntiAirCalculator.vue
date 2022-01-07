<template>
  <div>
    <div class="d-flex flex-wrap">
      <div class="form-control">
        <v-select label="陣形" v-model="formation" :items="formations" hide-details outlined dense @change="updateTable"></v-select>
      </div>
      <div class="form-control">
        <v-select label="対空CI" v-model="cutInId" :items="antiAirItems" hide-details outlined dense @change="updateTable"></v-select>
      </div>
      <div class="form-control">
        <v-text-field
          type="number"
          v-model.number="attackerSlot"
          min="0"
          max="999"
          label="攻撃機搭載数"
          hide-details
          outlined
          dense
          @input="updateTable"
        ></v-text-field>
      </div>
      <div class="form-control">
        <v-select label="対空射撃回避" v-model="avoid" :items="avoids" hide-details outlined dense @change="updateTable"></v-select>
      </div>
      <div class="form-control">
        <v-text-field
          type="number"
          min="0"
          max="2"
          step="0.1"
          v-model.number="adj1"
          label="加重対空補正"
          hide-details
          outlined
          dense
          :disabled="!isManual"
          @input="updateTable"
        ></v-text-field>
      </div>
      <div class="form-control">
        <v-text-field
          type="number"
          min="0"
          max="2"
          step="0.1"
          v-model.number="adj2"
          label="艦隊防空補正"
          hide-details
          outlined
          dense
          :disabled="!isManual"
          @input="updateTable"
        ></v-text-field>
      </div>
      <div class="form-control ml-2">
        <v-checkbox label="敵側式" v-model="isEnemy" @change="updateTable"></v-checkbox>
      </div>
    </div>
    <div class="mt-3 mb-2">
      <span class="text--secondary mr-2">艦隊防空値:</span>
      <span>{{ fleetAntiAir }}</span>
    </div>
    <div class="stage2-row header px-1 px-md-2">
      <div class="flex-grow-1">艦船</div>
      <div class="stage2-col">割合撃墜</div>
      <div class="stage2-col">固定撃墜</div>
      <div class="stage2-col">最低保証</div>
      <div class="stage2-col">両成功</div>
    </div>
    <div
      v-for="(item, i) in stage2Data"
      :key="i"
      class="stage2-row px-1 px-md-2"
      :class="{ warn: item.sum >= attackerSlot / 2, danger: item.sum > attackerSlot }"
    >
      <div class="d-flex flex-grow-1">
        <div class="align-self-center mr-2">
          <v-img v-if="item.isEnemy" :src="`./img/enemy/${item.id - 1500}.png`" height="30" width="120"></v-img>
          <v-img v-else :src="`./img/ship/${item.id}.png`" height="30" width="120"></v-img>
        </div>
        <div class="align-self-center d-none d-sm-block flex-grow-1">
          <div class="stage2-id primary--text" v-if="item.isEnemy">id:{{ item.id }}</div>
          <div class="d-flex">
            <div class="stage2-name text-truncate">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div class="stage2-col">{{ item.rate }}({{ item.rateDown }}機)</div>
      <div class="stage2-col">{{ item.fix }}</div>
      <div class="stage2-col">{{ item.min }}</div>
      <div class="stage2-col">{{ item.sum }}</div>
    </div>
  </div>
</template>

<style scoped>
.form-control {
  width: 136px;
  align-self: center;
  margin-top: 0.5rem;
  margin-right: 0.25rem;
}

.stage2-row {
  display: flex;
  padding-top: 0.15rem;
  padding-bottom: 0.15rem;
  transition: 0.1s;
  border-bottom: 1px solid rgba(128, 128, 128, 0.4);
}
.header.stage2-row {
  border-top: 1px solid rgba(128, 128, 128, 0.4);
  background-color: rgba(128, 128, 128, 0.05);
  font-size: 12px !important;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.stage2-row:not(.header):hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.stage2-row > div {
  align-self: center;
}
.stage2-col {
  width: 18%;
  text-align: right;
}
.stage2-row:not(.header) .stage2-col {
  font-size: 0.9em;
}
.stage2-id {
  font-size: 11px;
  height: 14px;
}
.stage2-name {
  flex-grow: 1;
  font-size: 12px;
  width: 10px;
}
.stage2-row.warn {
  background-color: rgba(255, 255, 10, 0.1);
}
.stage2-row.warn:hover {
  background-color: rgba(255, 255, 10, 0.2);
}
.stage2-row.danger {
  background-color: rgba(255, 0, 0, 0.1);
}
.stage2-row.danger:hover {
  background-color: rgba(255, 0, 0, 0.2);
}
</style>

<script lang="ts">
import Vue from 'vue';
import EnemyFleet from '@/classes/enemy/enemyFleet';
import Const, { AvoidType, Formation } from '@/classes/const';
import ShootDownInfo from '@/classes/aerialCombat/shootDownInfo';
import AntiAirCutIn from '@/classes/aerialCombat/antiAirCutIn';
import Enemy from '@/classes/enemy/enemy';
import Fleet from '@/classes/fleet/fleet';
import Ship from '@/classes/fleet/ship';

interface Stage2Row {
  id: number;
  name: string;
  rate: string;
  rateDown: number;
  fix: number;
  min: number;
  sum: number;
  isEnemy: boolean;
}

export default Vue.extend({
  name: 'AntiAirCalculator',
  props: {
    fleet: {
      type: [Fleet, EnemyFleet],
      required: true,
    },
  },
  data: () => ({
    formations: Const.FORMATIONS,
    formation: 1,
    avoids: Const.AVOID_TYPE,
    avoid: 0,
    attackerSlot: 18,
    adj1: 1,
    adj2: 1,
    fleetAntiAir: '0.00',
    cutInId: 0,
    isEnemy: false,
    stage2Data: [] as Stage2Row[],
  }),
  computed: {
    ships(): Ship[] | Enemy[] {
      if (this.fleet instanceof EnemyFleet) {
        return this.fleet.enemies.filter((v) => v.data.id > 0);
      }
      return this.fleet.ships.filter((v) => v.isActive && !v.isEmpty);
    },
    isManual(): boolean {
      return this.avoid === Const.MANUAL_AVOID;
    },
    antiAirItems(): { text: string; value: number }[] {
      const items = [{ text: '不発', value: 0 }];
      if (this.fleet instanceof Fleet) {
        // 使えるCIだけ
        const cutIns = this.fleet.allAntiAirCutIn;
        for (let i = 0; i < cutIns.length; i += 1) {
          const { id } = cutIns[i];
          const cutin = Const.ANTIAIR_CUTIN.find((v) => v.id === id);
          if (cutin && !items.some((v) => v.value === id)) {
            items.push({ text: cutin.text, value: cutin.id });
          }
        }
      } else {
        for (let i = 0; i < Const.ANTIAIR_CUTIN.length; i += 1) {
          const cutin = Const.ANTIAIR_CUTIN[i];
          if (!items.some((v) => v.value === cutin.id)) {
            items.push({ text: cutin.text, value: cutin.id });
          }
        }
      }
      return items;
    },
  },
  mounted() {
    this.isEnemy = this.ships[0] instanceof Enemy;
    this.formation = this.fleet.formation;
    this.updateTable();
  },
  methods: {
    updateTable(): void {
      let adj3 = 1;
      let adj4 = 1;
      const avoid = Const.AVOID_TYPE.find((v) => v.value === this.avoid);
      if (this.avoid !== Const.MANUAL_AVOID && avoid) {
        this.adj1 = avoid.c1;
        this.adj2 = avoid.c2;
        adj3 = avoid.c3;
        adj4 = avoid.c4;
      } else {
        this.adj1 = Math.min(Math.abs(this.adj1), 2);
        this.adj2 = Math.min(Math.abs(this.adj2), 2);
      }

      let formation = Const.FORMATIONS.find((v) => v.value === this.formation) as Formation;
      if (!formation) {
        // 保険で単縦を入れる
        formation = Const.FORMATIONS.find(() => true) as Formation;
      }
      const manualAvoid: AvoidType = {
        text: '',
        value: 0,
        c1: this.adj1,
        c2: this.adj2,
        c3: adj3,
        c4: adj4,
      };

      // 対空砲火テーブルを取得
      let aaci = new AntiAirCutIn();
      const cutIn = Const.ANTIAIR_CUTIN.find((v) => v.id === this.cutInId);
      if (cutIn) {
        aaci = new AntiAirCutIn(cutIn.id, cutIn.rateBonus, cutIn.c1, cutIn.c2, cutIn.rate);
      }
      const stage2 = ShootDownInfo.getStage2(this.ships, this.isEnemy, this.fleet.isUnion, formation, aaci, manualAvoid);
      const d = stage2[stage2.length - 1];
      this.stage2Data = [];
      for (let i = 0; i < this.ships.length; i += 1) {
        const ship = this.ships[i];
        const rate = d.rateDownList[i];
        const rateDown = Math.floor(this.attackerSlot * rate);
        const fix = d.fixDownList[i];
        const min = d.minimumDownList[i];
        const isEnemy = ship instanceof Enemy;
        this.stage2Data.push({
          id: ship instanceof Enemy ? ship.data.id : ship.data.albumId,
          name: ship.data.name,
          rate: `${(100 * rate).toFixed(1)}%`,
          rateDown,
          fix,
          min,
          sum: rateDown + fix + min,
          isEnemy,
        });
      }
      // 現在選択されている条件での艦隊防空値
      this.fleetAntiAir = this.fleet.getFleetAntiAir(formation, manualAvoid).toFixed(2);
    },
  },
});
</script>
