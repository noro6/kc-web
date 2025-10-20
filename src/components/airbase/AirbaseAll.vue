<template>
  <v-card class="my-2 px-1 py-2">
    <div class="d-flex pb-1">
      <div class="pl-2 align-self-center">{{ $t("Airbase.基地航空隊") }}</div>
      <v-spacer />
      <div class="d-none d-sm-flex">
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click="handleSyncCurrentData" v-bind="attrs" v-on="on">
              <v-icon>mdi-database-sync</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Fleet.現在の登録情報に置き換え") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click="bulkUpdateDialog = true" v-bind="attrs" v-on="on">
              <v-icon>mdi-wrench</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Common.一括設定") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click="supply" v-bind="attrs" v-on="on">
              <v-icon>mdi-reload</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Airbase.搭載数を最大に戻す") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click="doAirRaid" v-bind="attrs" v-on="on">
              <v-icon>mdi-bomb</v-icon>
            </v-btn>
          </template>
          <div>
            <div>{{ $t("Airbase.基地空襲被害を発生させる") }}</div>
            <div class="caption">※ {{ $t("Airbase.第1スロットから順に搭載数を4機減らします。") }}</div>
          </div>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click="resetAirbaseAll" v-bind="attrs" v-on="on">
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Airbase.全基地航空隊リセット") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click="captureAirbase" v-bind="attrs" v-on="on">
              <v-icon>mdi-camera</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Common.スクリーンショットを保存") }}</span>
        </v-tooltip>
        <v-tooltip bottom color="black">
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon @click="handleMinimize(true)" v-bind="attrs" v-on="on">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("Common.最小化") }}</span>
        </v-tooltip>
      </div>
      <div class="d-flex d-sm-none">
        <v-btn icon @click="supply">
          <v-icon>mdi-reload</v-icon>
        </v-btn>
        <v-btn icon @click="doAirRaid">
          <v-icon>mdi-bomb</v-icon>
        </v-btn>
        <v-btn icon @click="resetAirbaseAll">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
        <v-menu offset-y left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item @click="handleSyncCurrentData">
              <v-list-item-icon>
                <v-icon>mdi-database-sync</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="text-wrap">{{ $t("Fleet.現在の登録情報に置き換え") }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="bulkUpdateDialog = true">
              <v-list-item-icon>
                <v-icon>mdi-wrench</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="text-wrap">{{ $t("Common.一括設定") }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="supply">
              <v-list-item-icon>
                <v-icon>mdi-reload</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="text-wrap">{{ $t("Airbase.搭載数を最大に戻す") }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="doAirRaid">
              <v-list-item-icon>
                <v-icon>mdi-bomb</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="text-wrap">{{ $t("Airbase.基地空襲被害を発生させる") }}</v-list-item-title>
                <v-list-item-subtitle class="text-wrap">※ {{ $t("Airbase.第1スロットから順に搭載数を4機減らします。") }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="resetAirbaseAll">
              <v-list-item-icon>
                <v-icon>mdi-trash-can-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="text-wrap">{{ $t("Airbase.全基地航空隊リセット") }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="captureAirbase">
              <v-list-item-icon>
                <v-icon>mdi-camera</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="text-wrap">{{ $t("Common.スクリーンショットを保存") }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="handleMinimize(true)">
              <v-list-item-icon>
                <v-icon>mdi-minus</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="text-wrap">{{ $t("Common.最小化") }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
    <v-divider />
    <div :class="{ 'has-error-space': !isDefenseMode && needErrorSpace }">
      <div class="d-flex flex-wrap w-100">
        <v-switch class="ml-3" v-model="airbaseInfo.isDefense" dense hide-details :label="$t('Airbase.防空計算モード')" @click="setInfo" />
        <div class="align-self-center ml-3" v-show="!isDefenseMode && battleInfo.battleCount > 1 && existsBattleAirbase">
          <v-btn outlined color="success" @click.stop="targetDialog = true">{{ $t("Airbase.基地派遣先設定") }}</v-btn>
        </div>
        <div class="align-self-center flex-grow-1" v-show="rangeError">
          <v-alert border="left" dense outlined type="warning" icon="mdi-alert" class="text-caption text-sm-body-2">{{ rangeError }}</v-alert>
        </div>
      </div>
      <v-alert v-if="!isDefenseMode && needAirRaid" outlined type="error" border="left" class="w-100 mt-1 mt-sm-0">
        {{ $t("Airbase.基地空襲が発生します。基地空襲による被害を考慮してください。") }}
        <v-btn color="error" @click="doAirRaid" small><v-icon>mdi-bomb</v-icon>{{ $t("Airbase.基地空襲被害を発生させる") }}</v-btn>
      </v-alert>
      <div class="d-flex flex-wrap ml-2 mb-2" v-if="isDefenseMode">
        <template v-if="isNormalAirRaidMode">
          <div class="d-sm-flex flex-wrap mr-5">
            <div class="mr-3 d-flex align-center">
              <div class="text--secondary body-2">{{ $t("Airbase.防空時制空値") }}</div>
              <div class="ml-1">{{ airbaseInfo.defenseAirPower }}</div>
            </div>
            <div class="mr-3 d-flex align-center">
              <div class="text--secondary body-2">{{ $t("Airbase.対重爆制空値") }}</div>
              <div class="ml-1">{{ airbaseInfo.highDefenseAirPower }}</div>
            </div>
            <div class="mr-3 d-flex align-center">
              <div class="text--secondary body-2">{{ $t("Airbase.対重爆補正") }}</div>
              <div class="ml-1">&times;{{ airbaseInfo.highDefenseCoefficient }}</div>
            </div>
          </div>
          <div class="difficulty-select align-self-end align-sm-self-center mb-1">
            <v-select
              dense
              v-model="airbaseInfo.difficultyLevel"
              hide-details
              :items="difficultyLevelItems"
              :label="$t('Difficulty.難易度')"
              @change="setInfo"
            />
          </div>
        </template>
        <div v-else class="d-flex align-center flex-wrap">
          <div class="mr-3 d-flex align-center">
            <div class="text--secondary body-2">{{ $t("Airbase.防空時制空値") }}</div>
            <div class="ml-1">{{ airbaseInfo.defenseAirPower }}</div>
          </div>
          <div class="mr-3 d-flex align-center">
            <div class="text--secondary body-2">{{ $t("Airbase.対超重爆補正") }}</div>
            <div class="ml-1">&times;{{ Math.floor(100 * airbaseInfo.superHighAirRaidCoefficient) / 100 }}</div>
            <v-tooltip bottom color="black">
              <template v-slot:activator="{ on, attrs }">
                <v-icon class="ml-1" small v-bind="attrs" v-on="on">mdi-help-circle-outline</v-icon>
              </template>
              <div class="body-2">
                <table>
                  <tr>
                    <td>{{ $t("Airbase.補正A") }}</td>
                    <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidCorrA }}</td>
                  </tr>
                  <tr>
                    <td>{{ $t("Airbase.補正B") }}</td>
                    <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidCorrB }}</td>
                  </tr>
                  <tr>
                    <td>{{ $t("Airbase.補正C") }}</td>
                    <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidCorrC }}</td>
                  </tr>
                  <tr>
                    <td>{{ $t("Airbase.補正D1") }}</td>
                    <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidRocketCoefficientA }}</td>
                  </tr>
                  <tr>
                    <td>{{ $t("Airbase.補正D2") }}</td>
                    <td class="pl-5 text-right">{{ airbaseInfo.superHighAirRaidRocketCoefficientB }}</td>
                  </tr>
                </table>
              </div>
            </v-tooltip>
            <div class="ml-3 text--secondary body-2">{{ $t("Airbase.対超重爆制空値") }}</div>
            <div class="ml-1">{{ airbaseInfo.fullSuperHighDefenseAirPower }}</div>
          </div>
        </div>
      </div>
    </div>
    <v-tabs class="small-airbases" v-model="tab" :class="{ captured: capturing }" grow height="42px">
      <v-tab v-for="i in 3" :key="i" :href="`#base${i}`">
        <div>{{ $t("Airbase.第x航空隊", { number: i }) }}</div>
      </v-tab>
      <v-tab-item v-for="(lb, i) in airbaseInfo.airbases" :key="i" :value="`base${i + 1}`" class="py-1">
        <airbase-comp
          v-model="airbaseInfo.airbases[i]"
          :index="i"
          :handle-show-item-list="showItemList"
          :handle-show-batch-item-list="showBatchItemList"
          @input="setInfo"
          :is-defense="isDefenseMode"
          :handle-show-item-presets="showItemPresets"
          :handle-show-temp-airbase-list="showTempAirbaseList"
        />
      </v-tab-item>
    </v-tabs>
    <div id="airbase-container" :class="{ captured: capturing }">
      <draggable class="normal-airbases" v-model="airbaseInfo.airbases" handle=".airbase-title" animation="150" @end="setInfo">
        <airbase-comp
          v-for="(lb, i) in airbaseInfo.airbases"
          :key="i"
          :class="{ unMatch: unMatchModes[i] }"
          v-model="airbaseInfo.airbases[i]"
          :index="i"
          :is-defense="isDefenseMode"
          :handle-show-item-list="showItemList"
          :handle-show-batch-item-list="showBatchItemList"
          :handle-show-item-presets="showItemPresets"
          :handle-show-temp-airbase-list="showTempAirbaseList"
          @input="setInfo"
        />
      </draggable>
      <div v-if="isNormalAirRaidMode" class="mx-2 mb-1 mt-3">
        <!-- 通常防空時の計算結果 -->
        <air-status-result-bar :result="airbaseInfo.airbases[0].resultWave1" />
      </div>
      <div v-else-if="isDefenseMode" class="mx-2 mb-1">
        <!-- 超重爆時の計算結果 -->
        <div v-for="(result, i) in airbaseInfo.superHighAirRaidResults" :key="`high_result${i}`" class="mt-4 d-flex">
          <div class="mr-1 align-self-center caption">{{ $t("Airbase.第x波", { number: i + 1 }) }}</div>
          <div class="flex-grow-1">
            <air-status-result-bar :result="result" />
          </div>
        </div>
      </div>
    </div>
    <v-dialog v-model="itemListDialog" :width="itemDialogWidth" :fullscreen="isMobile" transition="scroll-x-transition" @input="toggleItemListDialog">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeItemList" :handle-change-width="changeWidth" />
    </v-dialog>
    <v-dialog v-model="targetDialog" width="600" transition="scroll-x-transition" @input="toggleTargetDialog">
      <airbase-target v-model="airbaseInfo" :battleInfo="battleInfo" :handle-close="closeTargetDialog" />
    </v-dialog>
    <v-dialog v-model="bulkUpdateDialog" transition="scroll-x-transition" width="640" @input="onBulkUpdateDialogToggle">
      <v-card>
        <div class="d-flex pt-2 pb-1 pr-2">
          <div class="align-self-center ml-3">{{ $t("Common.一括設定") }}</div>
          <v-spacer />
          <v-btn icon @click="closeBulkUpdateDialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider />
        <div class="px-5 pt-2 pb-5">
          <div>
            <div class="d-flex">
              <div class="caption">{{ $t("Common.適用対象") }}</div>
              <div class="header-divider" />
            </div>
            <div class="caption">{{ $t("Common.選択されている航空隊に対し、下記の設定を適用します。") }}</div>
            <div class="d-flex flex-wrap justify-space-between">
              <v-checkbox :label="$t('Airbase.全航空隊')" dense hide-details @click="toggleBulkTarget" v-model="isBulkUpdateTargetAll" readonly />
              <v-checkbox
                v-for="(check, i) in bulkUpdateTarget"
                :key="i"
                :label="$t(`Airbase.第x基地航空隊`, { number: i + 1 })"
                dense
                hide-details
                v-model="bulkUpdateTarget[i]"
              />
            </div>
          </div>
          <div class="d-flex mt-8">
            <div class="caption">{{ $t("Common.熟練度") }}</div>
            <div class="header-divider" />
          </div>
          <div class="d-flex flex-wrap justify-space-between">
            <div v-for="i in 9" :key="i - 1" v-ripple class="level-list-item" @click="setLevel(i - 1)" @keypress.enter="setLevel(i - 1)">
              <v-img :src="`./img/util/prof${i - 1}.png`" width="18" height="24" />
              <span class="level-list-value">{{ getLevelValue(i - 1) }}</span>
            </div>
            <v-btn color="success" outlined @click="setMaxLevelOnlyFighter">{{ $t("Common.戦闘機のみ最大") }}</v-btn>
          </div>
          <div class="d-flex mt-8">
            <div class="caption">{{ $t("Common.改修値") }}</div>
            <div class="header-divider" />
          </div>
          <div class="d-flex flex-wrap justify-space-between">
            <div v-for="i in 11" :key="i" v-ripple @click="setRemodel(i - 1)" class="remodel-list-item" @keypress.enter="setRemodel(i - 1)">
              <v-icon small color="teal accent-4">mdi-star</v-icon>
              <span class="teal--text text--accent-4">{{ i - 1 }}</span>
            </div>
          </div>
          <div class="d-flex mt-8">
            <div class="caption">{{ $t("Common.艦載機搭載数") }}</div>
            <div class="header-divider" />
          </div>
          <div class="d-flex">
            <v-slider
              class="flex-grow-1 align-self-end"
              max="18"
              min="0"
              v-model.number="bulkUpdateSlotValue"
              hide-details
              @input="bulkUpdateSlotChanged = true"
            />
            <div class="d-flex">
              <v-text-field
                class="slot-input mx-2"
                type="number"
                max="18"
                min="0"
                v-model.number="bulkUpdateSlotValue"
                hide-details
                @input="bulkUpdateSlotChanged = true"
              />
            </div>
          </div>
          <div class="d-flex flex-wrap mt-3">
            <div class="flex-grow-1 mx-1 mb-1">
              <v-tooltip bottom color="black" :disabled="needTrans">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(1)" block color="red">{{ $t("ItemList.x機", { number: 1 }) }}</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="red--text">制空権喪失</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-1 mb-1">
              <v-tooltip bottom color="black" :disabled="needTrans">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(2)" block color="orange darken-4">{{ $t("ItemList.x機", { number: 2 }) }}</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="orange--text">航空劣勢</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-1 mb-1">
              <v-tooltip bottom color="black" :disabled="needTrans">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(3)" block color="yellow darken-4">{{ $t("ItemList.x機", { number: 3 }) }}</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="yellow--text">航空拮抗</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-1 mb-1">
              <v-tooltip bottom color="black" :disabled="needTrans">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(5)" block color="light-green">{{ $t("ItemList.x機", { number: 5 }) }}</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="light-green--text">航空優勢</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-1 mb-1">
              <v-tooltip bottom color="black" :disabled="needTrans">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" outlined @click="setSlot(17)" block color="success">{{ $t("ItemList.x機", { number: 17 }) }}</v-btn>
                </template>
                <div class="body-2">
                  <div><span class="success--text">制空権確保</span>において、stage1被撃墜数が0となる最大機数</div>
                </div>
              </v-tooltip>
            </div>
            <div class="flex-grow-1 mx-2 mb-1">
              <v-btn outlined @click="resetSlot" block>{{ $t("ItemList.x機", { number: 18 }) }}</v-btn>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="itemPresetDialog" transition="scroll-x-transition" width="600" :fullscreen="isMobile">
      <item-preset-component
        v-if="itemPresetDialog"
        v-model="tempAirbase"
        :handle-expand-item-preset="expandItemPreset"
        :handle-close="closeItemPreset"
        :isMobile="isMobile"
      />
    </v-dialog>
    <v-dialog v-model="tempAirbaseListDialog" transition="scroll-x-transition" width="900" :fullscreen="isMobile">
      <v-card v-if="tempAirbaseListDialog">
        <div class="d-flex pb-1 px-2 pt-2">
          <div class="align-self-center ml-3">{{ $t("Airbase.基地クリップボード") }}</div>
          <v-spacer />
          <v-btn icon @click="tempAirbaseListDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider />
        <div class="pa-3">
          <div class="temp-airbase-view" v-if="tempAirbase">
            <v-card class="temp-airbase">
              <div v-for="(item, i) in tempAirbase.items" :key="`tempItem${i}`" class="temp-item">
                <div class="caption temp-slot">{{ item.fullSlot }}</div>
                <div class="item-img">
                  <v-img v-if="item.data.iconTypeId > 0" :src="`./img/type/icon${item.data.iconTypeId}.png`" height="30" width="30" />
                </div>
                <div class="temp-airbase-item-name">{{ getItemName(item.data.name) }}</div>
                <div class="item-remodel" v-if="item.remodel">
                  <v-icon x-small color="teal accent-4">mdi-star</v-icon>
                  <span class="teal--text text--accent-4">{{ item.remodel }}</span>
                </div>
              </div>
            </v-card>
            <div>
              <v-btn class="mb-2" color="primary" :disabled="!enabledPushTempAirbase" @click="pushTempAirbase()">
                <v-icon>mdi-clipboard-arrow-down</v-icon>{{ $t("Fleet.クリップボードへ追加") }}
              </v-btn>
              <v-btn class="mb-2" color="success" :disabled="!enabledPushTempAirbase" @click="pushTempAirbaseAll()">
                <v-icon>mdi-clipboard-arrow-down</v-icon>{{ $t("Airbase.基地全てクリップボードへ追加") }}
              </v-btn>
            </div>
          </div>
          <template v-if="tempAirbaseList.length">
            <v-divider class="mt-3 mb-2" />
            <div class="d-flex ml-2 mb-2 align-center">
              <div class="d-flex align-end">
                <div class="body-2">{{ $t("Fleet.クリップボード") }}</div>
                <div class="ml-3 caption">※ {{ $t("Fleet.クリックで展開") }}</div>
              </div>
              <div class="ml-auto">
                <v-btn color="error" :disabled="!tempAirbaseList.length" @click="resetTempAirbaseList()">
                  <v-icon>mdi-trash-can-outline</v-icon>{{ $t("Common.リセット") }}
                </v-btn>
              </div>
            </div>
            <div class="temp-airbase-list">
              <v-card
                class="temp-airbase"
                v-ripple="{ class: 'info--text' }"
                v-for="(temp, i) in tempAirbaseList"
                :key="`tempAirbase${i}`"
                @click="popTempAirbase(temp)"
              >
                <div v-for="(item, j) in temp.items" :key="`tempAirbase${i}item${j}`" class="temp-item">
                  <div class="caption temp-slot">
                    <span :class="{ 'text--secondary': item.fullSlot < 1 }">{{ item.fullSlot }}</span>
                  </div>
                  <div class="item-img">
                    <v-img v-if="item.data.iconTypeId > 0" :src="`./img/type/icon${item.data.iconTypeId}.png`" height="30" width="30" />
                  </div>
                  <div class="temp-airbase-item-name">{{ getItemName(item.data.name) }}</div>
                  <div class="item-remodel" v-if="item.remodel">
                    <v-icon x-small color="teal accent-4">mdi-star</v-icon>
                    <span class="teal--text text--accent-4">{{ item.remodel }}</span>
                  </div>
                </div>
              </v-card>
            </div>
          </template>
        </div>
      </v-card>
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

.has-error-space {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
@media (min-width: 600px) {
  .has-error-space {
    min-height: 90px;
  }
}

.difficulty-select {
  width: 100px;
}

.unMatch {
  opacity: 0.6;
}

.normal-airbases {
  display: none;
}
.captured.small-airbases {
  display: none !important;
}
.captured.normal-airbases {
  display: grid !important;
  grid-template-columns: 1fr 1fr 1fr;
}
@media (min-width: 600px) {
  .small-airbases {
    display: none;
  }
  .normal-airbases {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    overflow-x: auto;
  }
  .normal-airbases > div {
    min-width: 320px;
  }
}
@media (min-width: 950px) {
  .normal-airbases {
    overflow-x: unset;
  }
  .normal-airbases > div {
    min-width: unset;
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
  text-shadow: 1px 1px 1px #fff, -1px -1px 1px #fff, -1px 1px 1px #fff, 1px -1px 1px #fff, 1px 0px 1px #fff, -1px -0px 1px #fff, 0px 1px 1px #fff,
    0px -1px 1px #fff;
}
.theme--dark .level-list-value {
  text-shadow: 1px 1px 1px #222, -1px -1px 1px #222, -1px 1px 1px #222, 1px -1px 1px #222, 1px 0px 1px #222, -1px -0px 1px #222, 0px 1px 1px #222,
    0px -1px 1px #222;
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

.w-100 {
  width: 100%;
}
.opacity0 {
  opacity: 0;
}

/** 以下、一時保存リスト用 */
.temp-airbase-list,
.temp-fleet-list {
  max-height: 60vh;
  overflow-y: auto;
}
.temp-airbase-view,
.temp-airbase-list {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 0.5rem;
  column-gap: 0.5rem;
}
@media (min-width: 600px) {
  .temp-airbase-view,
  .temp-airbase-list {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 840px) {
  .temp-airbase-view,
  .temp-airbase-list {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
.temp-airbase {
  padding: 0.25rem 0.2rem;
}
.temp-airbase-list .temp-airbase {
  cursor: pointer;
}
.temp-airbase-list .temp-airbase:hover,
.temp-fleet-list .v-card:hover {
  background-color: rgba(128, 200, 255, 0.1) !important;
}
.temp-airbase-item-name {
  margin-left: 4px;
  flex-grow: 1;
  font-size: 0.85em;
  width: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.temp-item {
  display: flex;
  align-items: center;
  height: 30px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}
.temp-slot {
  text-align: right;
  width: 22px;
  margin-right: 0.25rem;
}
.item-img {
  width: 30px;
}
.temp-airbase-item-name {
  font-size: 0.8em;
}
.item-remodel {
  margin-left: auto;
  font-size: 0.8em;
  width: 30px;
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
import Airbase from '@/classes/airbase/airbase';
import Const, { AB_MODE, CELL_TYPE } from '@/classes/const';
import Item, { ItemBuilder } from '@/classes/item/item';
import BattleInfo from '@/classes/enemy/battleInfo';
import SiteSetting from '@/classes/siteSetting';
import ItemPreset from '@/classes/item/itemPreset';
import ItemMaster from '@/classes/item/itemMaster';
import Convert from '@/classes/convert';
import { MasterMap } from '@/classes/interfaces/master';
import { cloneDeep } from 'lodash';

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
    handleSyncCurrentData: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    itemListDialog: false,
    itemDialogWidth: 1200,
    targetDialog: false,
    dialogTarget: [-1, -1],
    tab: 0,
    capturing: false,
    bulkUpdateDialog: false,
    bulkUpdateSlotValue: 18,
    bulkUpdateSlotChanged: false,
    bulkUpdateTarget: [1, 1, 1],
    itemPresetDialog: false,
    tempAirbase: undefined as undefined | Airbase,
    airRaidAreas: [] as number[],
    tempAirbaseListDialog: false,
    tempAirbaseList: [] as Airbase[],
    enabledPushTempAirbase: true,
    isMobile: true,
    backScrollY: 0,
    backScrollX: 0,
  }),
  computed: {
    airbaseInfo(): AirbaseInfo {
      return this.value;
    },
    needTrans(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    difficultyLevelItems(): { text: string; value: number }[] {
      if (this.needTrans) {
        const items = [];
        for (let i = 0; i < Const.DIFFICULTY_LEVELS.length; i += 1) {
          const { text, value } = Const.DIFFICULTY_LEVELS[i];
          items.push({ text: `${this.$t(`Difficulty.${text}`)}`, value });
        }
        return items;
      }
      return Const.DIFFICULTY_LEVELS;
    },
    isDefenseMode(): boolean {
      return this.airbaseInfo.isDefense;
    },
    unMatchModes(): boolean[] {
      const modes = this.airbaseInfo.airbases.map((v) => v.mode);
      if (this.isDefenseMode) {
        return modes.map((v) => v !== AB_MODE.DEFENSE);
      }

      return modes.map((v) => v !== AB_MODE.BATTLE);
    },
    existsBattleAirbase(): boolean {
      return this.airbaseInfo.airbases.some((v) => v.mode === AB_MODE.BATTLE);
    },
    rangeError(): string {
      const errors: number[] = [];
      const { airbases } = this.value;
      let hasVariableRadius = false;
      for (let i = 0; i < airbases.length; i += 1) {
        const airbase = airbases[i];
        if (airbase.mode !== AB_MODE.BATTLE || !airbase.items.some((v) => v.data.id > 0)) {
          continue;
        }

        const [cell1, cell2] = airbase.battleTarget.map((v) => this.battleInfo.fleets[v]);
        if (cell1 && cell1.radius.some((v) => airbase.radius < v)) {
          hasVariableRadius = !!hasVariableRadius || cell1.radius.length > 1;
          // 6-4基地半径緩和チェック
          if (cell1.area !== 64 || cell1.nodeName !== 'N' || !airbase.hasJet || !airbase.can64BaseRadiusRelax) {
            errors.push(i + 1);
          }
        } else if (cell2 && cell2.radius.some((v) => airbase.radius < v)) {
          hasVariableRadius = !!hasVariableRadius || cell2.radius.length > 1;
          // 6-4基地半径緩和チェック
          if (cell2.area !== 64 || cell2.nodeName !== 'N' || !airbase.hasJet || !airbase.can64BaseRadiusRelax) {
            errors.push(i + 1);
          }
        }
      }
      if (this.needTrans) {
        const target = errors.map((v) => this.$t('Airbase.第x基地航空隊', { number: v })).join(' & ');
        if (hasVariableRadius) {
          return errors.length ? `${this.$t('Airbase.{target}基地航空隊の半径が不足している可能性があります。', { target })}` : '';
        }
        return errors.length ? `${this.$t('Airbase.{target}基地航空隊の半径が不足しています。', { target })}` : '';
      }
      if (hasVariableRadius) {
        return errors.length ? `第${errors.join(', 第')}基地航空隊の半径が不足している可能性があります。` : '';
      }
      return errors.length ? `第${errors.join(', 第')}基地航空隊の半径が不足しています。` : '';
    },
    needErrorSpace(): boolean {
      return this.battleInfo.fleets.some((v) => this.airRaidAreas.includes(v.area));
    },
    needAirRaid(): boolean {
      const hasAirRaid = this.battleInfo.fleets.some((v) => this.airRaidAreas.includes(v.area));
      const hasDefense = this.airbaseInfo.airbases.some((v) => v.mode === AB_MODE.DEFENSE);

      // 出撃になっている航空隊の第1スロットのみを取得
      const firstSlots = this.airbaseInfo.airbases.filter((v) => v.mode === AB_MODE.BATTLE).map((v) => v.items.find((w) => w.data.id));
      // 上記スロットが最大数以下になっているかチェック
      const doneAirRaid = firstSlots.every((v) => v && v.fullSlot < v.data.airbaseMaxSlot);

      return hasAirRaid && !hasDefense && !doneAirRaid;
    },
    isBulkUpdateTargetAll(): boolean {
      return !this.bulkUpdateTarget.some((v) => !v);
    },
    isNormalAirRaidMode(): boolean {
      return this.isDefenseMode && this.battleInfo.airRaidFleet.cellType !== CELL_TYPE.SUPER_HIGH_AIR_RAID;
    },
    lastBattleIndex(): number {
      return this.battleInfo.battleCount - 1;
    },
  },
  mounted() {
    const maps = this.$store.state.maps as MasterMap[];
    this.airRaidAreas = maps.filter((v) => v.has_air_raid).map((v) => v.area);

    this.tempAirbaseList = this.$store.state.tempAirbaseList ?? [];
  },
  methods: {
    setInfo() {
      this.$emit('input', new AirbaseInfo({ info: this.airbaseInfo }));
    },
    async showItemList(index: number, slot: number) {
      this.dialogTarget = [index, slot];
      const base = this.airbaseInfo.airbases[index];
      this.isMobile = window.innerWidth < 600;
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(base, slot);
    },
    async showBatchItemList(index: number) {
      this.dialogTarget = [index, 0];
      const base = this.airbaseInfo.airbases[index];
      this.isMobile = window.innerWidth < 600;
      await (this.itemListDialog = true);
      // 一括モードtrueで起動
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(base, 0, [], 4);
    },
    equipItem(item: Item) {
      const index = this.dialogTarget[0];
      const slot = this.dialogTarget[1];
      const base = this.airbaseInfo.airbases[index];
      const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
      if (!base) return;

      this.airbaseInfo.airbases[index] = base.putItem(item, slot, initialLevels, this.isDefenseMode, this.lastBattleIndex);
      this.itemListDialog = false;
      this.setInfo();

      this.toggleItemListDialog();
    },
    toggleItemListDialog() {
      // 装備一覧が閉じられたとき
      if (!this.itemListDialog) {
        // 一括モードかチェック
        const dialog = this.$refs.itemList as InstanceType<typeof ItemList>;
        if (dialog && dialog.isBatchMode && dialog.batchList.length) {
          // 一括編成モードで何らかの選択があったと判定されたため、上書き展開
          const index = this.dialogTarget[0];
          const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
          let base = this.airbaseInfo.airbases[index];
          for (let slot = 0; slot < base.items.length; slot += 1) {
            const item = dialog.batchList[slot];
            if (item && item.item.data.id) {
              base = base.putItem(item.item, slot, initialLevels, this.isDefenseMode, this.lastBattleIndex);
            } else {
              base = base.putItem(new Item(), slot, initialLevels, this.isDefenseMode, this.lastBattleIndex);
            }
          }

          dialog.isBatchMode = false;
          dialog.batchList = [];

          this.airbaseInfo.airbases[index] = base;
          this.setInfo();
        }
      }
    },
    supply() {
      const targets = this.bulkUpdateTarget.concat();
      this.bulkUpdateTarget = [1, 1, 1];

      this.bulkUpdateAllItem({ slot: 99 });
      this.setInfo();

      this.bulkUpdateTarget = targets;
    },
    doAirRaid() {
      this.airbaseInfo.shootDownByAirRaid();
      this.setInfo();
    },
    resetAirbaseAll() {
      this.$emit('input', new AirbaseInfo());
    },
    toggleTargetDialog() {
      if (!this.targetDialog) {
        // 再インスタンス化
        for (let i = 0; i < this.airbaseInfo.airbases.length; i += 1) {
          this.airbaseInfo.airbases[i] = new Airbase({ airbase: this.airbaseInfo.airbases[i] });
        }
        this.setInfo();
      }
    },
    closeTargetDialog() {
      this.targetDialog = false;
      this.toggleTargetDialog();
    },
    closeItemList() {
      this.itemListDialog = false;
      this.toggleItemListDialog();
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
    captureAirbase() {
      // 背景色とかを塗るフラグ立て
      this.capturing = true;
      const div = document.getElementById('airbase-container') as HTMLDivElement;
      setTimeout(() => {
        html2canvas(div, { scale: 1 }).then((canvas) => {
          const link = document.createElement('a');
          const setting = this.$store.state.siteSetting as SiteSetting;
          link.href = canvas.toDataURL(setting.imageType === 'png' ? 'image/png' : 'image/jpeg');
          link.download = `airbase_${Convert.formatDate(new Date(), 'yyyyMMdd-HHmmss')}.${setting.imageType}`;
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
        if (!this.bulkUpdateTarget[i]) continue;
        airbases[i] = airbases[i].bulkUpdateAllItem(itemBuilder, onlyFighter);
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
      this.isMobile = window.innerWidth < 600;
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
      const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;

      // 再インスタンス化し更新
      this.airbaseInfo.airbases[index] = airbase.expandPreset(items, initialLevels, this.isDefenseMode, this.lastBattleIndex);
      const newInfo = new AirbaseInfo({ info: this.airbaseInfo });
      this.$emit('input', newInfo);
    },
    closeItemPreset() {
      this.itemPresetDialog = false;
    },
    showTempAirbaseList(index: number) {
      const airbase = this.airbaseInfo.airbases[index];
      this.dialogTarget = [index, 0];
      this.tempAirbase = cloneDeep(airbase);
      this.isMobile = window.innerWidth < 600;
      this.tempAirbaseListDialog = true;
      this.enabledPushTempAirbase = true;
    },
    pushTempAirbase() {
      if (this.tempAirbase) {
        // 一時保存リストに追加
        this.enabledPushTempAirbase = false;
        this.tempAirbaseList.push(this.tempAirbase);
        this.$store.dispatch('updateTempAirbaseList', this.tempAirbaseList);
      }
    },
    pushTempAirbaseAll() {
      // 今の基地全部突っ込む
      for (let i = 0; i < this.airbaseInfo.airbases.length; i += 1) {
        const airbase = cloneDeep(this.airbaseInfo.airbases[i]);
        if (airbase.items.some((v) => v.data.id)) {
          this.tempAirbaseList.push(airbase);
        }
      }
      this.enabledPushTempAirbase = false;
      this.$store.dispatch('updateTempAirbaseList', this.tempAirbaseList);
    },
    popTempAirbase(airbase: Airbase) {
      const index = this.dialogTarget[0];
      // 元々いた基地を置き換える
      const items = [];
      for (let i = 0; i < airbase.items.length; i += 1) {
        items.push(new Item({ item: airbase.items[i] }));
      }
      const original = this.airbaseInfo.airbases[index];
      if (original.mode === AB_MODE.WAIT) {
        // 待機札だった場合
        // 出撃か防空札に変更
        const mode = this.isDefenseMode ? AB_MODE.DEFENSE : AB_MODE.BATTLE;
        // 派遣先を最終戦闘にオート設定
        const battleTarget = [this.lastBattleIndex, this.lastBattleIndex];
        this.airbaseInfo.airbases[index] = new Airbase({
          airbase: original,
          items,
          mode,
          battleTarget,
        });
      } else {
        this.airbaseInfo.airbases[index] = new Airbase({ airbase: original, items });
      }
      // 編成が更新されたため、艦隊を再インスタンス化し更新
      const newInfo = new AirbaseInfo({ info: this.airbaseInfo });
      this.$emit('input', newInfo);
      this.tempAirbaseListDialog = false;
    },
    resetTempAirbaseList() {
      // 一時保存リストリセット
      this.enabledPushTempAirbase = true;
      this.tempAirbaseList = [];
      this.$store.dispatch('updateTempAirbaseList', []);
    },
    getItemName(name: string) {
      if (this.needTrans && name) {
        return this.$t(`${name}`);
      }
      return name || `${this.$t('Fleet.未装備')}`;
    },
    saveMainScroll() {
      this.backScrollY = window.scrollY;
      this.backScrollX = window.scrollX;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.backScrollY}px`;
      document.body.style.left = `${this.backScrollX}px`;
    },
    restoreMainScroll() {
      document.body.style.position = '';
      document.body.style.top = '0px';
      document.body.style.left = '0px';

      window.scrollTo({ top: this.backScrollY, left: this.backScrollX });
    },
  },
  watch: {
    itemListDialog(value: boolean) {
      if (value) {
        this.saveMainScroll();
      } else {
        this.restoreMainScroll();
      }
    },
  },
});
</script>
