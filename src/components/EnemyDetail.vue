<template>
  <v-card elevation="2" class="pa-2">
    <div class="pa-2">敵艦隊</div>
    <v-divider></v-divider>
    <div class="ma-2">
      <v-tabs v-model="tab">
        <v-tab href="#info">編成情報</v-tab>
        <v-tab href="#stage2">対空砲火</v-tab>
      </v-tabs>
    </div>
    <div class="detail-body ma-2">
      <v-tabs-items v-model="tab">
        <v-tab-item value="info">
          <div class="d-flex px-2">
            <div>
              <span class="text--secondary">制空:</span>
              <span class="ml-1">{{ fleet.airPower }}</span>
            </div>
            <div class="ml-3">
              <span class="text--secondary">半径:</span>
              <span class="ml-1">{{ fleet.range }}</span>
            </div>
          </div>
          <div class="d-flex flex-wrap">
            <v-card v-for="(enemy, i) in enemies" :key="i" class="ma-1 pa-2 enemy-preview">
              <div class="d-flex">
                <div class="align-self-center">
                  <v-img :src="`/img/enemy/${enemy.data.id - 1500}.png`" height="30" width="120"></v-img>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex caption">
                    <div class="enemy-id ml-2 primary--text">id:{{ enemy.data.id }}</div>
                    <div class="ml-2">
                      <span class="text--secondary">耐久:</span>
                      <span class="ml-1 font-weight-medium">{{ enemy.data.hp }}</span>
                    </div>
                    <div class="ml-2">
                      <span class="text--secondary">装甲:</span>
                      <span class="ml-1 font-weight-medium">{{ enemy.data.armor }}</span>
                    </div>
                  </div>
                  <div class="enemy-name ml-2 text-truncate">
                    {{ enemy.data.name }}
                  </div>
                </div>
              </div>
              <div class="d-flex caption px-2">
                <div>
                  <span class="text--secondary">制空:</span>
                  <span class="ml-1 font-weight-medium">{{ enemy.airPower }}</span>
                </div>
                <div class="ml-1 text--secondary">{{ airPowerDetail(i) }}</div>
              </div>
              <item-input
                v-for="(item, j) in enemy.items"
                :key="j"
                :item="item"
                :index="j"
                :handle-show-item-list="showItemList"
                :readonly="true"
              />
            </v-card>
          </div>
        </v-tab-item>
        <v-tab-item value="stage2">
          <div class="d-flex flex-wrap">
            <div class="form-control">
              <v-select label="陣形" v-model="formation" :items="formations" @change="updateTable()"></v-select>
            </div>
            <div class="form-control">
              <v-text-field type="number" v-model="attackerSlot" label="攻撃機搭載数"></v-text-field>
            </div>
            <div class="form-control">
              <v-select label="対空射撃回避" v-model="avoid" :items="avoids" @change="updateTable()"></v-select>
            </div>
            <div class="form-control">
              <v-text-field
                type="number"
                min="0"
                max="2"
                step="0.1"
                v-model="adj1"
                label="加重対空補正"
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
                @input="updateTable()"
              ></v-text-field>
            </div>
          </div>
          <div>{{ stage2 }}</div>
          <div>{{ adj1 }}</div>
          <div>{{ adj2 }}</div>
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
  height: 64vh;
}

.enemy-name {
  width: 191px;
  font-size: 0.8em;
}

.form-control {
  width: 120px;
  align-self: center;
  margin-right: 1rem;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ItemInput from './ItemInput.vue';
import EnemyFleet, { Stage2Table } from '@/classes/EnemyFleet';
import Item from '@/classes/Item';
import Const from '@/classes/Const';

export default Vue.extend({
  components: { ItemInput },
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
    emptyItem: new Item(),
    tab: 'stage2',
    formations: Const.FORMATIONS,
    formation: 1,
    avoids: Const.AVOID_TYPE,
    avoid: 0,
    attackerSlot: 18,
    adj1: 1,
    adj2: 1,
    stage2: { rateDownList: [], fixDownList: [] } as Stage2Table,
  }),
  computed: {
    enemies() {
      return this.fleet.enemies.filter((v) => v.data.id > 0);
    },
  },
  methods: {
    updateTable() {
      const avoid = Const.AVOID_TYPE.find((v) => v.value === this.avoid);
      if (this.avoid !== Const.MANUAL_AVOID && avoid) {
        [this.adj1, this.adj2] = avoid.adj;
      }

      this.avoid = Const.MANUAL_AVOID;
      this.adj1 = Math.min(Math.abs(this.adj1), 2);
      this.adj2 = Math.min(Math.abs(this.adj2), 2);

      const stage2 = this.fleet.getStage2(this.formation, this.adj1, this.adj2);
      this.stage2 = stage2[stage2.length - 1];
    },
    airPowerDetail(index: number) {
      const airPowers = this.fleet.enemies[index].items.map((v) => v.airPower);
      return airPowers.filter((v) => v > 0).length ? `( ${airPowers.join(' | ')} )` : '';
    },
    showItemList() {
      // 装備変更は許可しない
      // this.handleShowItemList(index, index);
    },
  },
});
</script>
