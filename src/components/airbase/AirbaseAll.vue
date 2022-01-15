<template>
  <v-card class="my-2 px-1 py-2">
    <div class="d-flex pb-1">
      <div class="pl-2 align-self-center">基地航空隊</div>
      <v-spacer></v-spacer>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="supply" v-bind="attrs" v-on="on">
            <v-icon>mdi-reload</v-icon>
          </v-btn>
        </template>
        <span>搭載数を最大に戻す</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="doAirRaid" v-bind="attrs" v-on="on">
            <v-icon>mdi-bomb</v-icon>
          </v-btn>
        </template>
        <span>基地空襲被害を発生させる</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="resetAirbaseAll" v-bind="attrs" v-on="on">
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>
        <span>基地航空隊を全てリセット</span>
      </v-tooltip>
    </div>
    <v-divider></v-divider>
    <div>
      <div class="d-flex">
        <v-switch v-model="isDefenseMode" dense hide-details :label="'防空計算モード'" @change="setInfo"></v-switch>
        <div class="align-self-center ml-3" v-show="!isDefenseMode && battleInfo.battleCount > 1">
          <v-btn outlined color="success" @click.stop="targetDialog = true">基地派遣先設定</v-btn>
        </div>
        <div class="align-self-center flex-grow-1" v-show="rangeError">
          <v-alert dense outlined type="warning">{{ rangeError }}</v-alert>
        </div>
      </div>
      <div class="d-flex ml-3 mb-2" v-if="isDefenseMode">
        <div class="align-self-center text--secondary body-2">防空時制空値:</div>
        <div class="align-self-center ml-1">{{ airbaseInfo.defenseAirPower }}</div>
        <div class="ml-5 align-self-center text--secondary body-2">対重爆制空値:</div>
        <div class="align-self-center ml-1">{{ airbaseInfo.highDefenseAirPower }}</div>
        <div class="ml-5 align-self-center text--secondary body-2">対重爆補正:</div>
        <div class="align-self-center ml-1 body-2">&times;{{ airbaseInfo.highDeffenseCoefficient }}</div>
        <div class="ml-8 difficulty-select">
          <v-select dense v-model="difficultyLevel" hide-details :items="difficultyLevelItem" label="難易度" @change="setInfo"></v-select>
        </div>
      </div>
    </div>
    <v-tabs class="small-airbases" v-model="tab" vertical>
      <v-tab v-for="i in 3" :key="i" :href="`#base${i}`">
        <div class="airbase-tab-text d-none d-sm-block">第{{ i }}基地航空隊</div>
        <div class="airbase-tab-text d-sm-none">第{{ i }}航空隊</div>
      </v-tab>
      <v-tab-item v-for="(lb, i) in airbaseInfo.airbases" :key="i" :value="`base${i + 1}`" class="py-1">
        <airbase-comp
          v-model="airbaseInfo.airbases[i]"
          :index="i"
          :handle-show-item-list="showItemList"
          @input="setInfo"
          :is-defense="isDefenseMode"
        />
      </v-tab-item>
    </v-tabs>
    <draggable
      class="normal-airbases"
      v-model="airbaseInfo.airbases"
      :options="{ handle: '.airbase-title', animation: 150 }"
      @end="setInfo"
    >
      <airbase-comp
        v-for="(lb, i) in airbaseInfo.airbases"
        :key="i"
        :class="{ unmatch: unmatchModes[i] }"
        v-model="airbaseInfo.airbases[i]"
        :index="i"
        :is-defense="isDefenseMode"
        :handle-show-item-list="showItemList"
        @input="setInfo"
      />
    </draggable>
    <div v-if="isDefenseMode" class="mx-1 mb-1 mt-3">
      <air-status-result-bar :result="airbaseInfo.airbases[0].resultWave1" />
    </div>
    <v-dialog v-model="itemListDialog" :width="itemDialogWidth" transition="scroll-x-transition">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeItemList" :handle-change-width="changeWidth" />
    </v-dialog>
    <v-dialog v-model="targetDialog" width="600" transition="scroll-x-transition" @input="toggleTargetDialog">
      <airbase-target v-model="airbaseInfo" :battleCount="battleInfo.battleCount" :handle-close="closeTargetDialog" />
    </v-dialog>
  </v-card>
</template>

<style scoped>
.v-input--selection-controls {
  margin: 0.6rem 0.5rem;
}
.v-alert {
  font-size: 0.9em;
  margin: 0 0.75rem;
  padding: 5px 0.5rem;
}

.difficulty-select {
  width: 80px;
}

.unmatch {
  opacity: 0.6;
}

.normal-airbases {
  display: none;
}
.small-airbases {
  display: flex;
}
@media (min-width: 960px) {
  .small-airbases {
    display: none;
  }
  .normal-airbases {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 600px) {
  .v-tabs--vertical > .v-tabs-bar .v-tab {
    width: 150px;
  }
}
@media (min-width: 660px) {
  .v-tabs--vertical > .v-tabs-bar .v-tab {
    width: 225px;
  }
}
@media (min-width: 720px) {
  .v-tabs--vertical > .v-tabs-bar .v-tab {
    width: 300px;
  }
}
@media (min-width: 780px) {
  .v-tabs--vertical > .v-tabs-bar .v-tab {
    width: 375px;
  }
}
</style>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import AirbaseTarget from '@/components/airbase/AirbaseTarget.vue';
import AirbaseComp from '@/components/airbase/Airbase.vue';
import ItemList from '@/components/item/ItemList.vue';
import AirbaseInfo, { AirbaseInfoBuilder } from '@/classes/airbase/airbaseInfo';
import Airbase, { AirbaseBuilder } from '@/classes/airbase/airbase';
import Const, { AB_MODE, DIFFICULTY_LEVEL } from '@/classes/const';
import Item, { ItemBuilder } from '@/classes/item/item';
import ItemMaster from '@/classes/item/itemMaster';
import BattleInfo from '@/classes/enemy/battleInfo';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'AirbaseAll',
  components: {
    AirbaseComp,
    ItemList,
    draggable,
    AirStatusResultBar,
    AirbaseTarget,
  },
  props: {
    value: {
      type: AirbaseInfo,
      required: true,
    },
    battleInfo: {
      type: BattleInfo,
      required: true,
    },
  },
  data: () => ({
    itemListDialog: false,
    targetDialog: false,
    isDefenseMode: false,
    difficultyLevel: DIFFICULTY_LEVEL.HARD,
    difficultyLevelItem: Const.DIFFICULTY_LEVELS,
    dialogTarget: [-1, -1],
    tab: 0,
    itemDialogWidth: 1200,
  }),
  computed: {
    airbaseInfo(): AirbaseInfo {
      return this.value;
    },
    unmatchModes(): boolean[] {
      const modes = this.airbaseInfo.airbases.map((v) => v.mode);
      if (this.airbaseInfo.isDefense) {
        return modes.map((v) => v !== AB_MODE.DEFFENSE);
      }

      return modes.map((v) => v !== AB_MODE.BATTLE);
    },
    rangeError(): string {
      const errors: string[] = [];
      const { airbases } = this.value;
      for (let i = 0; i < airbases.length; i += 1) {
        const airbase = airbases[i];
        if (airbase.mode !== AB_MODE.BATTLE || !airbase.items.some((v) => v.data.id > 0)) {
          continue;
        }

        const [cell1, cell2] = airbase.battleTarget.map((v) => this.battleInfo.fleets[v]);
        if ((cell1 && airbase.range < cell1.range) || (cell2 && airbase.range < cell2.range)) {
          errors.push(`第${i + 1}`);
        }
      }
      return errors.length ? `${errors.join(',')}基地航空隊の半径が不足しています。` : '';
    },
  },
  methods: {
    setInfo() {
      const builder: AirbaseInfoBuilder = {
        info: this.airbaseInfo,
        isDefense: this.isDefenseMode,
        difficultyLevel: this.difficultyLevel,
      };
      this.$emit('input', new AirbaseInfo(builder));
    },
    async showItemList(index: number, slot: number) {
      this.dialogTarget = [index, slot];
      const base = this.airbaseInfo.airbases[index];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(base);
    },
    equipItem(item: ItemMaster) {
      const index = this.dialogTarget[0];
      const slot = this.dialogTarget[1];
      const base = this.airbaseInfo.airbases[index];

      if (!base) {
        return;
      }

      const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
      if (slot < base.items.length) {
        // インスタンス化用のいろいろ用意
        let initialSlot = base.items[slot].fullSlot ? base.items[slot].fullSlot : 18;
        let initialLevel = 0;

        if (Const.RECONNAISSANCES.includes(item.apiTypeId)) {
          // 偵察機の場合、搭載数関係はすべて4機制限
          initialSlot = 4;
        } else if (item.apiTypeId === 53) {
          // 大型陸上機は9機
          initialSlot = 9;
        }
        if (initialLevels) {
          // 設定情報より初期熟練度を解決
          const initData = initialLevels.find((v) => v.id === item.apiTypeId);
          if (initData) {
            initialLevel = initData.level;
          }

          if (item.id === 312 && initialLevel > 25) {
            // 陸上偵察機(熟練)の制御
            initialLevel = 25;
          } else if (item.id === 311) {
            // 陸上偵察機無印の制御
            initialLevel = 0;
          }
        }

        const builder: ItemBuilder = { master: item, slot: initialSlot, level: initialLevel };
        base.items[slot] = new Item(builder);
        this.itemListDialog = false;
      }

      const builder: AirbaseBuilder = { airbase: base };
      if (base.mode === AB_MODE.WAIT && base.items.some((v) => v.data.id > 0 && v.fullSlot > 0)) {
        // 待機札だった場合は出撃か防空札に変更
        builder.mode = this.isDefenseMode ? AB_MODE.DEFFENSE : AB_MODE.BATTLE;
        // 派遣先を最終戦闘にオート設定
        const lastBattle = this.battleInfo.battleCount - 1;
        builder.battleTarget = [lastBattle, lastBattle];
      }
      // リアクティブ再登録
      this.airbaseInfo.airbases[index] = new Airbase(builder);
      this.setInfo();
    },
    supply() {
      const { airbases } = this.airbaseInfo;
      for (let i = 0; i < airbases.length; i += 1) {
        const { items } = airbases[i];
        for (let j = 0; j < items.length; j += 1) {
          const item = items[j];
          if (item.isRecon) {
            items[j] = new Item({ item, slot: 4 });
          } else if (item.isShinzan) {
            items[j] = new Item({ item, slot: 9 });
          } else if (item.isPlane) {
            items[j] = new Item({ item, slot: 18 });
          }
        }
        airbases[i] = new Airbase({ airbase: airbases[i], items });
      }
      this.setInfo();
    },
    doAirRaid() {
      const { airbases } = this.airbaseInfo;
      for (let i = 0; i < airbases.length; i += 1) {
        if (airbases[i].mode === AB_MODE.WAIT) {
          continue;
        }

        let count = 4;
        const { items } = airbases[i];
        for (let j = 0; j < items.length; j += 1) {
          const item = items[j];

          if (item.fullSlot <= 1) {
            continue;
          }

          if (item.fullSlot > count) {
            items[j] = new Item({ item, slot: item.fullSlot - count });
            break;
          } else {
            items[j] = new Item({ item, slot: 1 });
            count -= item.fullSlot - 1;
          }
        }

        airbases[i] = new Airbase({ airbase: airbases[i], items });
      }
      this.setInfo();
    },
    resetAirbaseAll() {
      this.isDefenseMode = false;
      this.$emit('input', new AirbaseInfo());
    },
    toggleTargetDialog() {
      if (!this.targetDialog) {
        this.setInfo();
      }
    },
    closeTargetDialog() {
      this.targetDialog = false;
    },
    closeItemList() {
      this.itemListDialog = false;
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
  },
});
</script>
