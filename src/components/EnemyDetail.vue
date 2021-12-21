<template>
  <v-card elevation="2" class="pa-2">
    <div class="pa-2">敵艦隊詳細</div>
    <v-divider></v-divider>
    <div class="mx-2 mt-1">
      <v-tabs v-model="tab">
        <v-tab href="#fleet">艦隊情報</v-tab>
        <v-tab href="#stage2">対空砲火</v-tab>
      </v-tabs>
    </div>
    <v-divider class="mx-2"></v-divider>
    <div class="detail-body ma-2">
      <v-tabs-items v-model="tab">
        <v-tab-item value="fleet">
          <div class="body-1 my-3">
            <div class="d-flex air-power-info flex-wrap">
              <div class="text--secondary label-text">制空値:</div>
              <div class="value-text mr-3">{{ airPower }}</div>
              <div>
                <v-chip class="mr-1" color="green" label outlined>
                  <span>確保:</span>
                  <span class="v-chip-value">{{ airPowerBorders[0] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="light-green" label outlined>
                  <span>優勢:</span>
                  <span class="v-chip-value">{{ airPowerBorders[1] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="orange" label outlined>
                  <span>拮抗:</span>
                  <span class="v-chip-value">{{ airPowerBorders[2] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="deep-orange" label outlined>
                  <span>劣勢:</span>
                  <span class="v-chip-value">{{ airPowerBorders[3] }}</span>
                </v-chip>
              </div>
            </div>
            <div v-if="airPower !== landbaseAirPower" class="mt-1 d-flex air-power-info flex-wrap">
              <div class="text--secondary label-text">基地制空値:</div>
              <div class="value-text mr-3">{{ landbaseAirPower }}</div>
              <div>
                <v-chip class="mr-1" color="green" label outlined>
                  <span>確保:</span>
                  <span class="v-chip-value">{{ landbaseAirPowerBorders[0] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="light-green" label outlined>
                  <span>優勢:</span>
                  <span class="v-chip-value">{{ landbaseAirPowerBorders[1] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="orange" label outlined>
                  <span>拮抗:</span>
                  <span class="v-chip-value">{{ landbaseAirPowerBorders[2] }}</span>
                </v-chip>
                <v-chip class="mr-1" color="deep-orange" label outlined>
                  <span>劣勢:</span>
                  <span class="v-chip-value">{{ landbaseAirPowerBorders[3] }}</span>
                </v-chip>
              </div>
            </div>
          </div>
          <v-divider></v-divider>
          <div class="mt-3 mb-5">
            <div v-if="fleet.isUnion" class="px-2 primary--text">第1艦隊</div>
            <div v-if="fleet.isUnion" class="px-2 my-1 d-flex body-2">
              <div class="text--secondary">制空:</div>
              <div class="ml-1">{{ mainAirPower }}</div>
              <div class="ml-4 text--secondary">基地制空:</div>
              <div class="ml-1">{{ mainLBAirPower }}</div>
            </div>
            <div class="enemy-inputs-container">
              <enemy-input v-for="(enemy, i) in mainEnemies" :key="i" :enemy="enemy" :handle-show-item-list="showItemList"></enemy-input>
            </div>
          </div>
          <v-divider v-if="fleet.isUnion"></v-divider>
          <div v-if="fleet.isUnion" class="my-3">
            <div class="px-2 success--text">第2艦隊</div>
            <div class="px-2 my-1 d-flex body-2">
              <div class="text--secondary">制空:</div>
              <div class="ml-1">{{ escortAirPower }}</div>
              <div class="ml-4 text--secondary">基地制空値:</div>
              <div class="ml-1">{{ escortLBAirPower }}</div>
            </div>
            <div class="enemy-inputs-container">
              <enemy-input v-for="(enemy, i) in escorts" :key="i" :enemy="enemy" :handle-show-item-list="showItemList"></enemy-input>
            </div>
          </div>
        </v-tab-item>
        <v-tab-item value="stage2">
          <div class="pa-1">
            <div class="d-flex flex-wrap pt-3">
              <div class="form-control">
                <v-select
                  label="陣形"
                  v-model="formation"
                  :items="formations"
                  hide-details
                  outlined
                  dense
                  @change="updateTable()"
                ></v-select>
              </div>
              <div class="form-control">
                <v-text-field
                  type="number"
                  v-model="attackerSlot"
                  min="0"
                  max="999"
                  label="攻撃機搭載数"
                  hide-details
                  outlined
                  dense
                  @input="updateTable()"
                ></v-text-field>
              </div>
              <div class="form-control">
                <v-select
                  label="対空射撃回避"
                  v-model="avoid"
                  :items="avoids"
                  hide-details
                  outlined
                  dense
                  @change="updateTable()"
                ></v-select>
              </div>
              <div class="form-control">
                <v-text-field
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  v-model="adj1"
                  label="加重対空補正"
                  hide-details
                  outlined
                  dense
                  :disabled="!isManual"
                  @input="updateTable()"
                ></v-text-field>
              </div>
              <div class="form-control">
                <v-text-field
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  v-model="adj2"
                  label="艦隊防空補正"
                  hide-details
                  outlined
                  dense
                  :disabled="!isManual"
                  @input="updateTable()"
                ></v-text-field>
              </div>
            </div>
            <div class="mt-3 mb-2">
              <span class="text--secondary mr-2">艦隊防空値:</span>
              <span>{{ fleetAntiAir }}</span>
            </div>
            <div class="stage2-row header px-1 px-md-2">
              <div class="flex-grow-1">敵艦</div>
              <div class="stage2-col">割合撃墜</div>
              <div class="stage2-col">割合撃墜</div>
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
                  <v-img :src="`/img/enemy/${item.id - 1500}.png`" height="30" width="120"></v-img>
                </div>
                <div class="align-self-center d-none d-sm-block flex-grow-1">
                  <div class="stage2-id primary--text">id:{{ item.id }}</div>
                  <div class="d-flex">
                    <div class="stage2-name text-truncate">{{ item.name }}</div>
                  </div>
                </div>
              </div>
              <div class="stage2-col">{{ item.rate }}({{ item.rateDown }}機)</div>
              <div class="stage2-col">{{ item.fix }}</div>
              <div class="stage2-col">{{ item.sum }}</div>
            </div>
          </div>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-card>
</template>

<style scoped>
.v-card .theme--dark.v-card {
  background-color: rgb(35, 35, 38);
}
.detail-body {
  overflow-y: auto;
  /* height: 65vh; */
}
.air-power-info > * {
  align-self: center;
}
.air-power-info .label-text {
  width: 96px;
}
.air-power-info .value-text {
  width: 40px;
  text-align: right;
}

.enemy-inputs-container {
  grid-template-columns: 1fr;
  display: grid;
}
@media (min-width: 660px) {
  .enemy-inputs-container {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 1060px) {
  .enemy-inputs-container {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

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
  width: 20%;
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
import { ThisTypedComponentOptionsWithRecordProps } from 'vue/types/options';
import EnemyInput from './EnemyInput.vue';
import EnemyFleet from '@/classes/EnemyFleet';
import Const, { AvoidType, Formation } from '@/classes/Const';
import Enemy from '@/classes/Enemy';

interface Stage2Row {
  id: number;
  name: string;
  rate: string;
  rateDown: number;
  fix: number;
  sum: number;
}
interface DataType {
  tab: string;
  formations: Formation[];
  formation: number;
  avoids: AvoidType[];
  avoid: number;
  attackerSlot: number;
  adj1: number;
  adj2: number;
  fleetAntiAir: number;
  stage2Data: Stage2Row[];
}
interface MethodType {
  showItemList(): void;
  updateTable(): void;
}
interface ComputedType {
  enemies: Enemy[];
}
interface PropType {
  handleShowItemList: void;
  fleet: EnemyFleet;
}

export default Vue.extend({
  components: {
    EnemyInput,
  },
  name: 'EnemyDetail',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    fleet: {
      type: EnemyFleet,
      required: true,
    },
  },
  data: () => ({
    tab: 'fleet',
    formations: Const.FORMATIONS,
    formation: 1,
    avoids: Const.AVOID_TYPE,
    avoid: 0,
    attackerSlot: 18,
    adj1: 1,
    adj2: 1,
    fleetAntiAir: 0,
    stage2Data: [] as Stage2Row[],
  }),
  mounted() {
    this.formation = this.fleet.formation;
    this.updateTable();
  },
  computed: {
    enemies() {
      return this.fleet.enemies.filter((v) => v.data.id > 0);
    },
    mainEnemies() {
      return this.fleet.enemies.filter((v) => v.data.id > 0 && !v.isEscort);
    },
    escorts() {
      return this.fleet.enemies.filter((v) => v.data.id > 0 && v.isEscort);
    },
    airPower() {
      return this.fleet.airPower;
    },
    airPowerBorders() {
      const ap = this.fleet.airPower;
      if (ap) {
        return [ap * 3, Math.ceil(ap * 1.5), Math.floor(ap / 1.5) + 1, Math.floor(ap / 3) + 1];
      }
      return [0, 0, 0, 0];
    },
    landbaseAirPowerBorders() {
      const ap = this.fleet.landBaseAirPower;
      if (ap) {
        return [ap * 3, Math.ceil(ap * 1.5), Math.floor(ap / 1.5) + 1, Math.floor(ap / 3) + 1];
      }
      return [0, 0, 0, 0];
    },
    mainAirPower() {
      return this.fleet.mainAirPower;
    },
    escortAirPower() {
      return this.fleet.escortAirPower;
    },
    landbaseAirPower() {
      return this.fleet.landBaseAirPower;
    },
    mainLBAirPower() {
      return this.fleet.mainLBAirPower;
    },
    escortLBAirPower() {
      return this.fleet.escortLBAirPower;
    },
    isManual() {
      return this.avoid === Const.MANUAL_AVOID;
    },
  },
  methods: {
    showItemList(): void {
      // 装備変更は許可しない
      // this.handleShowItemList(index, index);
    },
    updateTable(): void {
      const avoid = Const.AVOID_TYPE.find((v) => v.value === this.avoid);
      if (this.avoid !== Const.MANUAL_AVOID && avoid) {
        this.adj1 = avoid.c1;
        this.adj2 = avoid.c2;
      } else {
        this.adj1 = Math.min(Math.abs(this.adj1), 2);
        this.adj2 = Math.min(Math.abs(this.adj2), 2);
      }

      const formation = Const.FORMATIONS.find((v) => v.value === this.formation);
      const manualAvoid: AvoidType = {
        text: '',
        value: 0,
        c1: this.adj1,
        c2: this.adj2,
      };

      // 対空砲火テーブルを取得
      const stage2 = this.fleet.getStage2(formation, manualAvoid);
      const d = stage2[stage2.length - 1];
      this.stage2Data = [];
      for (let i = 0; i < this.enemies.length; i += 1) {
        const enemy = this.enemies[i];
        const rate = d.rateDownList[i];
        const rateDown = Math.floor(this.attackerSlot * rate);
        const fix = d.fixDownList[i];
        this.stage2Data.push({
          id: enemy.data.id,
          name: enemy.data.name,
          rate: `${Math.round(1000 * rate) / 10}%`,
          rateDown,
          fix,
          sum: rateDown + fix,
        });
      }
      // 現在選択されている条件での艦隊防空値
      this.fleetAntiAir = this.fleet.getFleetAntiAir(formation, manualAvoid);
    },
  },
} as ThisTypedComponentOptionsWithRecordProps<Vue, DataType, MethodType, ComputedType, PropType>);
</script>
