<template>
  <v-card class="my-2 px-1 py-2">
    <div class="d-flex pb-1">
      <div class="pl-2 align-self-center">基地航空隊</div>
      <v-spacer></v-spacer>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="bulkUpdateDialog = true" v-bind="attrs" v-on="on">
            <v-icon>mdi-wrench</v-icon>
          </v-btn>
        </template>
        <span>装備一括設定</span>
      </v-tooltip>
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
        <div>
          <div>基地空襲被害を発生させる</div>
          <div class="caption">※ 第1スロットから順に搭載数を4機減らします</div>
        </div>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="resetAirbaseAll" v-bind="attrs" v-on="on">
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>
        <span>全基地航空隊リセット</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="captureAirbase" v-bind="attrs" v-on="on">
            <v-icon>mdi-camera</v-icon>
          </v-btn>
        </template>
        <span>スクリーンショットを保存</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="handleMinimize(true)" v-bind="attrs" v-on="on">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </template>
        <span>最小化</span>
      </v-tooltip>
    </div>
    <v-divider></v-divider>
    <div>
      <div class="d-flex">
        <v-switch v-model="airbaseInfo.isDefense" dense hide-details :label="'防空計算モード'" @click="setInfo"></v-switch>
        <div class="align-self-center ml-3" v-show="!airbaseInfo.isDefense && battleInfo.battleCount > 1 && existsBattleAirbase">
          <v-btn outlined color="success" @click.stop="targetDialog = true">基地派遣先設定</v-btn>
        </div>
        <div class="align-self-center flex-grow-1" v-show="rangeError">
          <v-alert dense outlined type="warning">{{ rangeError }}</v-alert>
        </div>
      </div>
      <div class="d-flex ml-3 mb-2" v-if="airbaseInfo.isDefense">
        <template v-if="isNormalAirRaidMode">
          <div class="align-self-center text--secondary body-2">防空時制空値:</div>
          <div class="align-self-center ml-1">{{ airbaseInfo.defenseAirPower }}</div>
          <div class="ml-5 align-self-center text--secondary body-2">対重爆制空値:</div>
          <div class="align-self-center ml-1">{{ airbaseInfo.highDefenseAirPower }}</div>
          <div class="ml-5 align-self-center text--secondary body-2">対重爆補正:</div>
          <div class="align-self-center ml-1 body-2">&times;{{ airbaseInfo.highDefenseCoefficient }}</div>
          <div class="ml-8 difficulty-select">
            <v-select
              dense
              v-model="airbaseInfo.difficultyLevel"
              hide-details
              :items="difficultyLevelItem"
              label="難易度"
              @change="setInfo"
            ></v-select>
          </div>
        </template>
        <template v-else>
          <div class="align-self-center text--secondary body-2">防空時制空値:</div>
          <div class="align-self-center ml-1">{{ airbaseInfo.defenseAirPower }}</div>
          <div class="ml-5 align-self-center text--secondary body-2">対超重爆補正:</div>
          <div class="align-self-center ml-1 body-2">
            &times;{{ Math.floor(100000 * airbaseInfo.superHighAirRaidCoefficient) / 100000 }}
          </div>
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on, attrs }">
              <v-icon class="align-self-center ml-1" small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
            </template>
            <div class="body-2">
              <table>
                <tr>
                  <td>補正A</td>
                  <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidCorrA }}</td>
                </tr>
                <tr>
                  <td>補正B</td>
                  <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidCorrB }}</td>
                </tr>
                <tr>
                  <td>補正C</td>
                  <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidCorrC }}</td>
                </tr>
                <tr>
                  <td>補正D1</td>
                  <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidRocketCoefficientA }}</td>
                </tr>
                <tr>
                  <td>補正D2</td>
                  <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidRocketCoefficientB }}</td>
                </tr>
              </table>
            </div>
          </v-tooltip>
          <div class="ml-5 align-self-center text--secondary body-2">対超重爆制空値:</div>
          <div class="align-self-center ml-1">{{ airbaseInfo.fullSuperHighDefenseAirPower }}</div>
        </template>
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
          :is-defense="airbaseInfo.isDefense"
          :handle-show-item-presets="showItemPresets"
        />
      </v-tab-item>
    </v-tabs>
    <draggable
      id="airbase-container"
      class="normal-airbases"
      :class="{ captured: capturing }"
      v-model="airbaseInfo.airbases"
      handle=".airbase-title"
      animation="150"
      @end="setInfo"
    >
      <airbase-comp
        v-for="(lb, i) in airbaseInfo.airbases"
        :key="i"
        :class="{ unMatch: unMatchModes[i] }"
        v-model="airbaseInfo.airbases[i]"
        :index="i"
        :is-defense="airbaseInfo.isDefense"
        :handle-show-item-list="showItemList"
        :handle-show-item-presets="showItemPresets"
        @input="setInfo"
      />
    </draggable>
    <div v-if="isNormalAirRaidMode" class="mx-2 mb-1 mt-3">
      <!-- 通常防空時の計算結果 -->
      <air-status-result-bar :result="airbaseInfo.airbases[0].resultWave1" />
    </div>
    <div v-else-if="airbaseInfo.isDefense" class="mx-2 mb-1">
      <!-- 超重爆時の計算結果 -->
      <div v-for="(result, i) in airbaseInfo.superHighAirRaidResults" :key="`high_result${i}`" class="mt-4 d-flex">
        <div class="mr-1 align-self-center caption">第{{ i + 1 }}波</div>
        <div class="flex-grow-1">
          <air-status-result-bar :result="result" />
        </div>
      </div>
    </div>
    <v-dialog v-model="itemListDialog" :width="itemDialogWidth" transition="scroll-x-transition">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeItemList" :handle-change-width="changeWidth" />
    </v-dialog>
    <v-dialog v-model="targetDialog" width="600" transition="scroll-x-transition" @input="toggleTargetDialog">
      <airbase-target v-model="airbaseInfo" :battleCount="battleInfo.battleCount" :handle-close="closeTargetDialog" />
    </v-dialog>
    <v-dialog v-model="bulkUpdateDialog" transition="scroll-x-transition" width="600" @input="onBulkUpdateDialogToggle">
      <v-card>
        <div class="d-flex pt-2 pb-1 pr-2">
          <div class="align-self-center ml-3">装備一括設定</div>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeBulkUpdateDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="px-5 pt-2 pb-5">
          <div>
            <div class="d-flex">
              <div class="caption">適用対象</div>
              <div class="header-divider"></div>
            </div>
            <div class="caption">選択されている航空隊に対し、下記の設定を適用します。</div>
            <div class="d-flex justify-space-between">
              <v-checkbox
                label="全航空隊"
                dense
                hide-details
                @click="toggleBulkTarget"
                v-model="isBulkUpdateTargetAll"
                readonly
              ></v-checkbox>
              <v-checkbox
                v-for="(check, i) in bulkUpdateTarget"
                :key="i"
                :label="`第${i + 1}基地航空隊`"
                dense
                hide-details
                v-model="bulkUpdateTarget[i]"
              ></v-checkbox>
            </div>
          </div>
          <div class="d-flex mt-8">
            <div class="caption">熟練度</div>
            <div class="header-divider"></div>
          </div>
          <div class="d-flex justify-space-between">
            <div v-for="i in 9" :key="i - 1" v-ripple class="level-list-item" @click="setLevel(i - 1)">
              <v-img :src="`./img/util/prof${i - 1}.png`" width="18" height="24"></v-img>
              <span class="level-list-value">{{ getLevelValue(i - 1) }}</span>
            </div>
            <v-btn color="success" outlined @click="setMaxLevelOnlyFighter">戦闘機のみ最大</v-btn>
          </div>
          <div class="d-flex mt-8">
            <div class="caption">改修値</div>
            <div class="header-divider"></div>
          </div>
          <div class="d-flex justify-space-between">
            <div v-for="i in 11" :key="i" v-ripple @click="setRemodel(i - 1)" class="remodel-list-item">
              <v-icon small color="teal accent-4">mdi-star</v-icon>
              <span class="teal--text text--accent-4">{{ i - 1 }}</span>
            </div>
          </div>
          <div class="d-flex mt-8">
            <div class="caption">艦載機搭載数</div>
            <div class="header-divider"></div>
          </div>
          <div class="d-flex">
            <v-slider
              class="flex-grow-1 align-self-end"
              max="18"
              min="0"
              v-model.number="bulkUpdateSlotValue"
              hide-details
              @input="bulkUpdateSlotChanged = true"
            ></v-slider>
            <div class="d-flex">
              <v-text-field
                class="slot-input mx-2"
                type="number"
                max="18"
                min="0"
                v-model.number="bulkUpdateSlotValue"
                hide-details
                @input="bulkUpdateSlotChanged = true"
              ></v-text-field>
            </div>
          </div>
          <div class="d-flex mt-3">
            <div class="flex-grow-1 mx-2">
              <v-tooltip bottom color="black">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(1)" block color="red">1機</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="red--text">制空権喪失</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-2">
              <v-tooltip bottom color="black">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(2)" block color="orange darken-4">2機</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="orange--text">航空劣勢</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-2">
              <v-tooltip bottom color="black">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(3)" block color="yellow darken-4">3機</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="yellow--text">航空拮抗</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-2">
              <v-tooltip bottom color="black">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(5)" block color="light-green">5機</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="light-green--text">航空優勢</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-2">
              <v-tooltip bottom color="black">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(17)" block color="success">17機</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="success--text">制空権確保</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-2">
              <v-btn outlined @click="resetSlot" block>18機</v-btn>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="itemPresetDialog" transition="scroll-x-transition" width="600">
      <item-preset-component
        v-if="itemPresetDialog"
        v-model="tempAirbase"
        :handle-expand-item-preset="expandItemPreset"
        :handle-close="closeItemPreset"
      ></item-preset-component>
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

.unMatch {
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

/** スクショ用調整  */
.normal-airbases.captured {
  width: 1200px !important;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0.2rem;
  padding: 0.75rem 0.5rem;
}
.normal-airbases.captured * {
  box-shadow: none !important;
}
.normal-airbases.captured > div {
  border: 1px solid #bbb;
}
.theme--dark .normal-airbases.captured {
  background: rgb(40, 40, 45);
  border: 1px solid #444;
}
.deep-sea .theme--dark .normal-airbases.captured {
  background: rgb(8, 18, 42);
}
.theme--dark .normal-airbases.captured > div {
  border: 1px solid #444;
}

.remodel-list-item i,
.remodel-list-item span {
  vertical-align: middle;
}

.remodel-list-item,
.level-list-item {
  padding: 0.5rem 0.75rem;
  transition: 0.2s;
  cursor: pointer;
  position: relative;
  border-radius: 0.2rem;
}
.remodel-list-item {
  min-width: 46px;
  text-align: center;
  padding: 0.5rem 0;
}

.remodel-list-item:hover,
.level-list-item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.level-list-value {
  display: inline-block;
  position: absolute;
  font-size: 0.75em;
  text-align: center;
  font-weight: 900;
  bottom: 0;
  width: 30px;
  right: 1px;
  z-index: 1;
  text-shadow: 1px 1px 1px #fff, -1px -1px 1px #fff, -1px 1px 1px #fff, 1px -1px 1px #fff, 1px 0px 1px #fff, -1px -0px 1px #fff,
    0px 1px 1px #fff, 0px -1px 1px #fff;
}
.theme--dark .level-list-value {
  text-shadow: 1px 1px 1px #222, -1px -1px 1px #222, -1px 1px 1px #222, 1px -1px 1px #222, 1px 0px 1px #222, -1px -0px 1px #222,
    0px 1px 1px #222, 0px -1px 1px #222;
}
.slot-input {
  width: 120px;
}
.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}
</style>

<script lang="ts">
import Vue from 'vue';
import draggable from 'vuedraggable';
import html2canvas from 'html2canvas';
import AirStatusResultBar from '@/components/result/AirStatusResultBar.vue';
import AirbaseTarget from '@/components/airbase/AirbaseTarget.vue';
import AirbaseComp from '@/components/airbase/Airbase.vue';
import ItemList from '@/components/item/ItemList.vue';
import ItemPresetComponent from '@/components/item/ItemPreset.vue';
import AirbaseInfo from '@/classes/airbase/airbaseInfo';
import Airbase, { AirbaseBuilder } from '@/classes/airbase/airbase';
import Const, { AB_MODE, CELL_TYPE } from '@/classes/const';
import Item, { ItemBuilder } from '@/classes/item/item';
import BattleInfo from '@/classes/enemy/battleInfo';
import SiteSetting from '@/classes/siteSetting';
import ItemPreset from '@/classes/item/itemPreset';
import ItemMaster from '@/classes/item/itemMaster';
import Convert from '@/classes/convert';

export default Vue.extend({
  name: 'AirbaseAll',
  components: {
    AirbaseComp,
    ItemList,
    draggable,
    AirStatusResultBar,
    AirbaseTarget,
    ItemPresetComponent,
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
    handleMinimize: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    itemListDialog: false,
    targetDialog: false,
    difficultyLevelItem: Const.DIFFICULTY_LEVELS,
    dialogTarget: [-1, -1],
    tab: 0,
    itemDialogWidth: 1200,
    capturing: false,
    bulkUpdateDialog: false,
    bulkUpdateSlotValue: 18,
    bulkUpdateSlotChanged: false,
    bulkUpdateTarget: [1, 1, 1],
    itemPresetDialog: false,
    tempAirbase: undefined as undefined | Airbase,
  }),
  computed: {
    airbaseInfo(): AirbaseInfo {
      return this.value;
    },
    unMatchModes(): boolean[] {
      const modes = this.airbaseInfo.airbases.map((v) => v.mode);
      if (this.airbaseInfo.isDefense) {
        return modes.map((v) => v !== AB_MODE.DEFENSE);
      }

      return modes.map((v) => v !== AB_MODE.BATTLE);
    },
    existsBattleAirbase(): boolean {
      return this.airbaseInfo.airbases.some((v) => v.mode === AB_MODE.BATTLE);
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
        if (cell1 && airbase.range < cell1.range) {
          // 6-4基地半径緩和チェック
          if (cell1.area !== 64 || cell1.nodeName !== 'N' || !airbase.hasJet) {
            errors.push(`第${i + 1}`);
          }
        } else if (cell2 && airbase.range < cell2.range) {
          // 6-4基地半径緩和チェック
          if (cell2.area !== 64 || cell2.nodeName !== 'N' || !airbase.hasJet) {
            errors.push(`第${i + 1}`);
          }
        }
      }
      return errors.length ? `${errors.join(',')}基地航空隊の半径が不足しています。` : '';
    },
    isBulkUpdateTargetAll(): boolean {
      return !this.bulkUpdateTarget.some((v) => !v);
    },
    isNormalAirRaidMode(): boolean {
      return this.airbaseInfo.isDefense && this.battleInfo.airRaidFleet.cellType !== CELL_TYPE.SUPER_HIGH_AIR_RAID;
    },
  },
  methods: {
    setInfo() {
      this.$emit('input', new AirbaseInfo({ info: this.airbaseInfo }));
    },
    async showItemList(index: number, slot: number) {
      this.dialogTarget = [index, slot];
      const base = this.airbaseInfo.airbases[index];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(base);
    },
    equipItem(argItem: Item) {
      const item = argItem.data;
      const index = this.dialogTarget[0];
      const slot = this.dialogTarget[1];
      const base = this.airbaseInfo.airbases[index];

      if (!base) {
        return;
      }

      const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
      if (slot < base.items.length) {
        // インスタンス化用のいろいろ用意
        let initialSlot = 18;
        let initialLevel = 0;

        if (Const.RECONNAISSANCES.includes(item.apiTypeId)) {
          // 偵察機の場合、搭載数関係はすべて4機制限
          initialSlot = 4;
        } else if (Const.AB_ATTACKERS_LARGE.includes(item.apiTypeId)) {
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

        const builder: ItemBuilder = {
          master: item,
          slot: initialSlot,
          level: initialLevel,
          remodel: argItem.remodel,
        };
        base.items[slot] = new Item(builder);
        this.itemListDialog = false;
      }

      const builder: AirbaseBuilder = { airbase: base };
      if (base.mode === AB_MODE.WAIT && base.items.some((v) => v.data.id > 0 && v.fullSlot > 0)) {
        // 待機札だった場合は出撃か防空札に変更
        builder.mode = this.airbaseInfo.isDefense ? AB_MODE.DEFENSE : AB_MODE.BATTLE;
        // 派遣先を最終戦闘にオート設定
        const lastBattle = this.battleInfo.battleCount - 1;
        builder.battleTarget = [lastBattle, lastBattle];
      }
      // リアクティブ再登録
      this.airbaseInfo.airbases[index] = new Airbase(builder);
      this.setInfo();
    },
    supply() {
      const targets = this.bulkUpdateTarget.concat();
      this.bulkUpdateTarget = [1, 1, 1];

      this.bulkUpdateAllItem({ slot: 99 });
      this.setInfo();

      this.bulkUpdateTarget = targets;
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
      this.$emit('input', new AirbaseInfo());
    },
    toggleTargetDialog() {
      if (!this.targetDialog) {
        this.setInfo();
      }
    },
    closeTargetDialog() {
      this.targetDialog = false;
      this.setInfo();
    },
    closeItemList() {
      this.itemListDialog = false;
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
    captureAirbase() {
      // 背景色とかを塗るフラグ立て
      this.capturing = true;
      const div = document.getElementById('airbase-container') as HTMLDivElement;
      setTimeout(() => {
        html2canvas(div, { scale: 2 }).then((canvas) => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL();
          link.download = `airbase_${Convert.formatDate(new Date(), 'yyyyMMdd-HHmmss')}.jpg`;
          link.click();
          this.capturing = false;
        });
      }, 10);
    },
    toggleBulkTarget() {
      if (this.bulkUpdateTarget.some((v) => !v)) {
        this.bulkUpdateTarget = [1, 1, 1];
      } else {
        this.bulkUpdateTarget = [0, 0, 0];
      }
    },
    getLevelValue(value: number) {
      return Const.PROF_LEVEL_BORDER[value];
    },
    setLevel(index: number) {
      this.bulkUpdateAllItem({ level: Const.PROF_LEVEL_BORDER[index] });
    },
    setRemodel(remodel: number) {
      this.bulkUpdateAllItem({ remodel });
    },
    resetSlot() {
      this.setSlot(18);
    },
    setSlot(value: number) {
      this.bulkUpdateSlotValue = value;
      this.bulkUpdateSlot();
    },
    bulkUpdateSlot() {
      this.bulkUpdateAllItem({ slot: this.bulkUpdateSlotValue });
    },
    setMaxLevelOnlyFighter() {
      this.bulkUpdateAllItem({ level: 120 }, true);
    },
    bulkUpdateAllItem(itemBuilder: ItemBuilder, onlyFighter = false) {
      // 指定ビルダーで装備情報一括更新
      const { airbases } = this.airbaseInfo;
      for (let i = 0; i < airbases.length; i += 1) {
        if (!this.bulkUpdateTarget[i]) {
          continue;
        }
        const { items } = airbases[i];
        for (let j = 0; j < items.length; j += 1) {
          const item = items[j];
          if (!onlyFighter || (onlyFighter && item.data.isFighter)) {
            let { slot } = item;
            if (item.data.isRecon && itemBuilder.slot !== undefined) {
              slot = Math.min(4, itemBuilder.slot);
            } else if (item.data.isShinzan && itemBuilder.slot !== undefined) {
              slot = Math.min(9, itemBuilder.slot);
            } else if (item.data.isPlane && itemBuilder.slot !== undefined) {
              slot = Math.min(18, itemBuilder.slot);
            }
            items[j] = new Item({
              item,
              slot,
              remodel: item.data.canRemodel ? itemBuilder.remodel : undefined,
              level: itemBuilder.level,
            });
          }
        }
        airbases[i] = new Airbase({ airbase: airbases[i] });
      }

      const newInfo = new AirbaseInfo({ info: this.airbaseInfo });
      newInfo.calculated = true;
      this.$emit('input', newInfo);
    },
    closeBulkUpdateDialog() {
      this.bulkUpdateDialog = false;
      this.onBulkUpdateDialogToggle();
    },
    onBulkUpdateDialogToggle() {
      if (!this.bulkUpdateDialog) {
        if (this.bulkUpdateSlotValue && this.bulkUpdateSlotChanged) {
          this.bulkUpdateSlot();
        }
        this.setInfo();
      }

      this.bulkUpdateSlotChanged = false;
    },
    showItemPresets(baseIndex: number) {
      const airbase = this.airbaseInfo.airbases[baseIndex];
      this.dialogTarget = [baseIndex, 0];
      this.tempAirbase = airbase;
      this.itemPresetDialog = true;
    },
    expandItemPreset(preset: ItemPreset) {
      const itemMasters = this.$store.state.items as ItemMaster[];
      const items: Item[] = [];
      for (let i = 0; i < preset.items.length; i += 1) {
        const item = itemMasters.find((v) => v.id === preset.items[i].id);
        if (item) {
          items.push(new Item({ master: item, remodel: preset.items[i].remodel }));
        } else {
          items.push(new Item());
        }
      }
      const index = this.dialogTarget[0];
      const airbase = this.airbaseInfo.airbases[index];
      // もともとここに配備されていた装備情報を抜き取る
      const newItems = airbase.items.concat();
      // 装備搭載可否情報マスタ
      for (let slotIndex = 0; slotIndex < airbase.items.length; slotIndex += 1) {
        if (slotIndex < items.length) {
          const newItem = items[slotIndex];
          if (newItem && Const.PLANE_TYPES.includes(newItem.data.apiTypeId)) {
            // マスタ情報があり、装備条件を満たしている場合は装備引継ぎOK！
            let slot = 18;
            if (Const.RECONNAISSANCES.includes(newItem.data.apiTypeId)) {
              slot = 4;
            } else if (Const.AB_ATTACKERS_LARGE.includes(newItem.data.apiTypeId)) {
              slot = 9;
            }

            // 初期熟練度設定
            const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
            let level = 0;
            if (initialLevels) {
              // 設定情報より初期熟練度を解決
              const initData = initialLevels.find((v) => v.id === newItem.data.apiTypeId);
              if (initData) {
                level = initData.level;
              }

              if (newItem.data.id === 312 && level > 25) {
                // 陸上偵察機(熟練)の制御
                level = 25;
              } else if (newItem.data.id === 311) {
                // 陸上偵察機無印の制御
                level = 0;
              }
            }
            newItems[slotIndex] = new Item({
              master: newItem.data,
              item: newItems[slotIndex],
              slot,
              level,
              remodel: newItem.remodel,
            });
          } else {
            // 不適合、外す
            newItems[slotIndex] = new Item();
          }
        }
      }

      // 再インスタンス化し更新
      this.airbaseInfo.airbases[index] = new Airbase({ airbase, items: newItems });
      const newInfo = new AirbaseInfo({ info: this.airbaseInfo });
      this.$emit('input', newInfo);
    },
    closeItemPreset() {
      this.itemPresetDialog = false;
    },
  },
});
</script>
