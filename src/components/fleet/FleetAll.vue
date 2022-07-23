<template>
  <v-card class="my-2 px-1 py-2">
    <div class="d-flex pb-1">
      <div class="pl-2 align-self-center">自艦隊</div>
      <v-spacer></v-spacer>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="optimizeFighterSlot()" v-bind="attrs" v-on="on">
            <v-icon>mdi-refresh-auto</v-icon>
          </v-btn>
        </template>
        <span>戦闘機スロットを最適化</span>
      </v-tooltip>
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
          <v-btn icon @click="resetFleetAll" v-bind="attrs" v-on="on">
            <v-icon>mdi-trash-can-outline</v-icon>
          </v-btn>
        </template>
        <span>全艦隊リセット</span>
      </v-tooltip>
      <v-tooltip bottom color="black">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon @click="captureFleet" v-bind="attrs" v-on="on">
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
    <v-row align="center" class="mt-1 mx-4" dense>
      <v-menu v-model="levelMenu" :close-on-content-click="false" @input="onLevelMenuToggle">
        <template v-slot:activator="{ on, attrs }" v-ripple="{ class: 'info--text' }">
          <div class="form-input" v-bind="attrs" v-on="on">
            <v-text-field type="number" dense hide-details label="司令部Lv" v-model.number="fleetInfo.admiralLevel" readonly></v-text-field>
          </div>
        </template>
        <v-card class="pa-5">
          <v-text-field
            class="form-input"
            v-model.number="level"
            max="120"
            min="1"
            hide-details
            type="number"
            label="司令部Lv"
          ></v-text-field>
        </v-card>
      </v-menu>
      <div class="ml-4">
        <v-checkbox label="連合艦隊" v-model="fleetInfo.isUnion" @change="changedInfo"></v-checkbox>
      </div>
      <div class="ml-5">
        <v-select
          class="form-input"
          label="陣形"
          v-model="fleetInfo.mainFleet.formation"
          :items="formations"
          hide-details
          dense
          @change="changedFormation(fleetInfo.mainFleet.formation)"
        ></v-select>
      </div>
    </v-row>
    <v-tabs v-model="tab" class="px-2">
      <v-tab
        v-for="i in 4"
        :key="i"
        :href="`#fleet${i - 1}`"
        @click="changedTab(i - 1)"
        class="fleet-tab"
        :draggable="tab === `fleet${i - 1}`"
        @dragover.prevent
        @drop.stop="dropItem($event)"
        @dragleave.stop="dragLeave($event)"
        @dragenter.stop="dragEnter($event)"
        @dragstart.stop="dragStart($event)"
        @dragend.stop="dragEnd($event)"
      >
        <template v-if="fleetInfo.isUnion && i === 1">主力艦隊</template>
        <template v-else-if="fleetInfo.isUnion && i === 2">随伴艦隊</template>
        <template v-else>第{{ i }}艦隊</template>
      </v-tab>
      <v-tab href="#gkcoi" @click="initializeOutput()">画像出力</v-tab>
      <v-tab href="#fleet4" disabled></v-tab>
    </v-tabs>
    <v-divider class="mx-2"></v-divider>
    <v-tabs-items v-model="tab" :touchless="true">
      <v-tab-item
        v-for="(fleet, i) in fleetInfo.fleets"
        :key="i"
        :value="`fleet${i}`"
        class="fleet-container"
        :class="{ captured: capturing }"
      >
        <fleet-component
          v-model="fleetInfo.fleets[i]"
          :index="i"
          :handle-show-ship-list="showShipList"
          :handle-show-item-list="showItemList"
          :handle-show-temp-ship-list="showTempShipList"
          :handle-show-item-preset="showItemPreset"
          :union-fleet="fleetInfo.unionFleet"
          :is-union="fleetInfo.isUnion"
          :admiral-lv="fleetInfo.admiralLevel"
          @input="changedInfo"
        ></fleet-component>
      </v-tab-item>
      <v-tab-item value="gkcoi" class="pa-2">
        <v-alert border="left" outlined dense type="warning" class="body-2">
          本サイトでは対潜、索敵以外の装備ボーナスによる上昇値については未実装のため、出力画像に反映されません。ご注意ください。
        </v-alert>
        <div class="d-flex flex-wrap">
          <div class="gkcoi-select mr-3 my-1">
            <v-select
              :items="gkcoiThemes"
              dense
              hide-details
              v-model="gkcoiTheme"
              outlined
              label="Theme"
              @input="enabledOutput = true"
            ></v-select>
          </div>
          <div class="gkcoi-select mr-3 my-1">
            <v-select
              :items="gkcoiLangs"
              dense
              hide-details
              v-model="gkcoiLang"
              outlined
              label="Languages"
              @input="enabledOutput = true"
            ></v-select>
          </div>
          <div class="d-flex mr-3 my-1">
            <v-checkbox
              v-for="(check, i) in gkcoiOutputTarget"
              :key="i"
              :label="`第${i + 1}艦隊`"
              dense
              hide-details
              v-model="gkcoiOutputTarget[i]"
              class="mr-3"
              @click="enabledOutput = true"
            ></v-checkbox>
          </div>
        </div>
        <div class="d-flex">
          <div class="my-1 mr-3">
            <v-btn @click="generateImage()" color="teal" :dark="enabledOutput" :disabled="!enabledOutput">出力</v-btn>
          </div>
          <div class="my-1" v-if="generatedCanvas">
            <v-btn @click="saveImage()" color="success"><v-icon small>mdi-content-save</v-icon>保存</v-btn>
            <a class="d-none" id="gkcoi-download" />
          </div>
        </div>
        <div v-if="generatingImage">
          <div class="d-flex justify-center">
            <v-progress-circular size="100" width="4" color="secondary" indeterminate></v-progress-circular>
          </div>
        </div>
        <div v-if="generateError">
          <v-alert border="left" outlined type="error">
            <div>
              画像出力ライブラリ側でエラーが発生しました。新装備や新艦娘が未対応である可能性があります。更新されるまでお待ちください。
            </div>
            <div class="caption">{{ generateError }}</div>
          </v-alert>
        </div>
        <div id="image-area" class="mt-3"></div>
        <div class="d-flex">
          <v-btn class="ml-auto" @click="openGkcoiPage()"><v-icon>mdi-github</v-icon>Nishisonic/gkcoi</v-btn>
        </div>
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
    <v-dialog v-model="itemListDialog" transition="scroll-x-transition" :width="itemDialogWidth">
      <item-list ref="itemList" :handle-equip-item="equipItem" :handle-close="closeDialog" :handle-change-width="changeWidth" />
    </v-dialog>
    <v-dialog v-model="tempShipListDialog" transition="scroll-x-transition" width="900">
      <v-card v-if="tempShipListDialog">
        <div class="d-flex pb-1 px-2 pt-2">
          <div class="align-self-center ml-3">艦娘一時保存リスト</div>
          <v-spacer></v-spacer>
          <v-btn icon @click="tempShipListDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-divider></v-divider>
        <div class="pa-3">
          <div class="temp-ship-view">
            <v-card class="temp-ship">
              <div class="d-flex ml-1">
                <div class="align-self-center">
                  <v-img :src="`./img/ship/${tempShip.data.id}.png`" height="30" width="120"></v-img>
                </div>
                <div class="align-self-center ml-1 flex-grow-1">
                  <div class="d-flex">
                    <div class="caption blue--text">Lv: {{ tempShip.level }}</div>
                    <div class="caption ml-2">{{ $t('Common.制空') }}: {{ tempShip.fullAirPower }}</div>
                  </div>
                  <div class="d-flex flex-grow-1">
                    <div class="temp-ship-name">{{ tempShip.data.name }}</div>
                  </div>
                </div>
              </div>
              <v-divider class="mb-1"></v-divider>
              <div v-for="(item, i) in tempShip.items.concat(tempShip.exItem)" :key="`tempItem${i}`" class="temp-item">
                <div class="caption temp-slot">
                  <span :class="{ 'text--secondary': item.fullSlot < 1 }">{{ item.fullSlot }}</span>
                </div>
                <div class="item-img">
                  <v-img v-if="item.data.iconTypeId > 0" :src="`./img/type/icon${item.data.iconTypeId}.png`" height="30" width="30" />
                </div>
                <div class="temp-ship-item-name">{{ item.data.name ? item.data.name : "未装備" }}</div>
                <div class="item-remodel" v-if="item.remodel">
                  <v-icon x-small color="teal accent-4">mdi-star</v-icon>
                  <span class="teal--text text--accent-4">{{ item.remodel }}</span>
                </div>
              </div>
            </v-card>
            <div>
              <v-btn color="primary" :disabled="!enabledPushTempShip" @click="pushTempShip()"
                ><v-icon>mdi-tray-arrow-down</v-icon>リストへ追加
              </v-btn>
            </div>
          </div>
          <v-divider class="mt-3 mb-1"></v-divider>
          <div class="d-flex ml-2 mb-2">
            <div class="align-self-center d-flex">
              <div class="body-2 align-self-end">一時保存済みリスト</div>
              <div class="ml-3 align-self-end caption">※ クリックで展開</div>
            </div>
            <div class="ml-auto">
              <v-btn color="error" :disabled="!tempShipList.length" @click="resetTempShipList()"
                ><v-icon>mdi-trash-can-outline</v-icon>リセット</v-btn
              >
            </div>
          </div>
          <div class="temp-ship-list">
            <v-card
              class="temp-ship"
              v-ripple="{ class: 'info--text' }"
              v-for="(temp, i) in tempShipList"
              :key="`tempShip${i}`"
              @click="popTempShip(temp)"
            >
              <div class="d-flex ml-1">
                <div class="align-self-center">
                  <v-img :src="`./img/ship/${temp.data.id}.png`" height="30" width="120"></v-img>
                </div>
                <div class="align-self-center ml-1 flex-grow-1">
                  <div class="d-flex">
                    <div class="caption blue--text">Lv: {{ temp.level }}</div>
                    <div class="caption ml-2">{{ $t('Common.制空') }}: {{ temp.fullAirPower }}</div>
                  </div>
                  <div class="d-flex flex-grow-1">
                    <div class="temp-ship-name">{{ temp.data.name }}</div>
                  </div>
                </div>
              </div>
              <v-divider class="mb-1"></v-divider>
              <div v-for="(item, j) in temp.items.concat(temp.exItem)" :key="`tempShip${i}item${j}`" class="temp-item">
                <div class="caption temp-slot">
                  <span :class="{ 'text--secondary': item.fullSlot < 1 }">{{ item.fullSlot }}</span>
                </div>
                <div class="item-img">
                  <v-img v-if="item.data.iconTypeId > 0" :src="`./img/type/icon${item.data.iconTypeId}.png`" height="30" width="30" />
                </div>
                <div class="temp-ship-item-name">{{ item.data.name ? item.data.name : "未装備" }}</div>
                <div class="item-remodel" v-if="item.remodel">
                  <v-icon x-small color="teal accent-4">mdi-star</v-icon>
                  <span class="teal--text text--accent-4">{{ item.remodel }}</span>
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </v-card>
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
            <div class="caption">選択されている艦隊の全艦娘に対し、下記の設定を適用します。</div>
            <div class="d-flex justify-space-between">
              <v-checkbox label="全艦隊" dense hide-details @click="toggleBulkTarget" v-model="isBulkUpdateTargetAll" readonly></v-checkbox>
              <v-checkbox
                v-for="(check, i) in bulkUpdateTarget"
                :key="i"
                :label="`第${i + 1}艦隊`"
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
              <v-btn outlined @click="resetSlot" block>初期値</v-btn>
            </div>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="itemPresetDialog" transition="scroll-x-transition" width="600">
      <item-preset-component
        v-if="itemPresetDialog"
        v-model="tempShip"
        :handle-expand-item-preset="expandItemPreset"
        :handle-close="closeDialog"
      ></item-preset-component>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.form-input {
  width: 120px;
}

/** スクショ用調整  */
.fleet-container.captured {
  width: 1200px !important;
  background: #fff;
  border: 1px solid #bbb;
  border-radius: 0.25rem;
  padding: 0.75rem;
}
.theme--dark .fleet-container.captured {
  background: rgb(40, 40, 45);
  border: 1px solid #444;
}
.deep-sea .theme--dark .fleet-container.captured {
  background: rgb(8, 18, 42);
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

/** 以下、一時保存リスト用 */
.temp-ship-list {
  min-height: 120px;
}
.temp-ship-view,
.temp-ship-list {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 0.5rem;
  column-gap: 0.5rem;
}
@media (min-width: 600px) {
  .temp-ship-view,
  .temp-ship-list {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 840px) {
  .temp-ship-view,
  .temp-ship-list {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
.temp-ship {
  padding: 0.25rem 0.2rem;
}
.temp-ship-list .temp-ship {
  cursor: pointer;
}
.temp-ship-list .temp-ship:hover {
  background-color: rgba(128, 200, 255, 0.1) !important;
}
.temp-ship-item-name,
.temp-ship-name {
  flex-grow: 1;
  font-size: 0.85em;
  width: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.temp-item {
  display: flex;
  height: 30px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}
.temp-item > div {
  align-self: center;
}
.temp-slot {
  text-align: right;
  width: 22px;
  margin-right: 0.25rem;
}
.item-img {
  width: 30px;
}
.temp-ship-item-name {
  font-size: 0.8em;
}
.item-remodel {
  margin-left: auto;
  font-size: 0.8em;
  width: 30px;
}

.header-divider {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.gkcoi-select,
.gkcoi-select {
  width: 140px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import html2canvas from 'html2canvas';
import { Lang } from 'gkcoi/dist/lang';
import { DeckBuilder, Theme } from 'gkcoi/dist/type';
import { generate } from 'gkcoi';
import FleetComponent from '@/components/fleet/Fleet.vue';
import ItemList from '@/components/item/ItemList.vue';
import ShipList, { ViewShip } from '@/components/fleet/ShipList.vue';
import ItemPresetComponent from '@/components/item/ItemPreset.vue';
import FleetInfo from '@/classes/fleet/fleetInfo';
import Fleet, { FleetBuilder } from '@/classes/fleet/fleet';
import Ship, { ShipBuilder } from '@/classes/fleet/ship';
import ShipValidation from '@/classes/fleet/shipValidation';
import Item, { ItemBuilder } from '@/classes/item/item';
import Const, { Formation } from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';
import ItemPreset from '@/classes/item/itemPreset';
import ItemMaster from '@/classes/item/itemMaster';
import Convert from '@/classes/convert';
import SaveData from '@/classes/saveData/saveData';

export default Vue.extend({
  name: 'FleetAll',
  components: {
    FleetComponent,
    ItemList,
    ShipList,
    ItemPresetComponent,
  },
  props: {
    value: {
      type: FleetInfo,
      required: true,
    },
    handleChangeFormation: {
      type: Function,
      required: true,
    },
    handleMinimize: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    shipListDialog: false,
    itemListDialog: false,
    itemDialogTarget: [-1, -1, -1],
    shipDialogTarget: [-1, -1],
    tab: 'fleet0',
    itemDialogWidth: 1200,
    shipDialogWidth: 1200,
    level: 120,
    levelMenu: false,
    capturing: false,
    tempShip: undefined as undefined | Ship,
    tempShipListDialog: false,
    tempShipList: [] as Ship[],
    enabledPushTempShip: true,
    bulkUpdateDialog: false,
    bulkUpdateTarget: [1, 1, 1, 1],
    itemPresetDialog: false,
    gkcoiThemes: [
      { value: 'dark', text: 'Dark' },
      { value: 'dark-ex', text: 'Dark(遠征)' },
      { value: 'light', text: 'Light' },
      { value: 'light-ex', text: 'Light(遠征)' },
      { value: 'white', text: 'White' },
      { value: '74lc', text: '74式(大型)' },
      { value: '74mc', text: '74式(中型)' },
      { value: '74sb', text: '74式(小型)' },
      { value: 'official', text: '公式' },
    ],
    gkcoiTheme: 'dark' as Theme,
    gkcoiLangs: ['jp', 'en', 'kr', 'scn', 'tcn'],
    gkcoiLang: 'jp' as Lang,
    gkcoiOutputTarget: [1, 0, 0, 0],
    generatedCanvas: undefined as undefined | HTMLCanvasElement,
    enabledOutput: false,
    generatingImage: false,
    generateError: '',
  }),
  computed: {
    fleetInfo(): FleetInfo {
      return this.value;
    },
    formations(): Formation[] {
      return Const.FORMATIONS;
    },
    isBulkUpdateTargetAll(): boolean {
      return !this.bulkUpdateTarget.some((v) => !v);
    },
  },
  methods: {
    setInfo(value: FleetInfo) {
      this.$emit('input', value);
    },
    async showItemList(fleetIndex: number, shipIndex: number, slotIndex: number) {
      const ship = this.fleetInfo.fleets[fleetIndex].ships[shipIndex];
      this.itemDialogTarget = [fleetIndex, shipIndex, slotIndex];
      await (this.itemListDialog = true);
      (this.$refs.itemList as InstanceType<typeof ItemList>).initialFilter(ship, slotIndex);
    },
    async showShipList(fleetIndex: number, shipIndex: number) {
      this.shipDialogTarget = [fleetIndex, shipIndex];
      await (this.shipListDialog = true);
      (this.$refs.shipList as InstanceType<typeof ShipList>).initialize();
    },
    showItemPreset(fleetIndex: number, shipIndex: number) {
      const ship = this.fleetInfo.fleets[fleetIndex].ships[shipIndex];
      this.shipDialogTarget = [fleetIndex, shipIndex];
      this.tempShip = cloneDeep(ship);
      this.itemPresetDialog = true;
    },
    showTempShipList(fleetIndex: number, shipIndex: number) {
      const ship = this.fleetInfo.fleets[fleetIndex].ships[shipIndex];
      this.shipDialogTarget = [fleetIndex, shipIndex];
      this.tempShip = cloneDeep(ship);
      this.tempShipListDialog = true;
      this.enabledPushTempShip = true;
    },
    pushTempShip() {
      if (this.tempShip) {
        // 一時保存リストに追加
        this.enabledPushTempShip = false;
        this.tempShipList.push(this.tempShip);
      }
    },
    popTempShip(ship: Ship) {
      const fleetIndex = this.shipDialogTarget[0];
      const index = this.shipDialogTarget[1];
      const fleet = this.fleetInfo.fleets[fleetIndex];
      // 元々いた艦娘を置き換える
      const original = fleet.ships[index];
      const items = [];
      for (let i = 0; i < ship.items.length; i += 1) {
        items.push(new Item({ item: ship.items[i] }));
      }
      fleet.ships[index] = new Ship({ ship, isEscort: original.isEscort, items });

      // 編成が更新されたため、艦隊を再インスタンス化し更新
      this.fleetInfo.fleets[fleetIndex] = new Fleet({ fleet });
      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
      this.tempShipListDialog = false;
    },
    resetTempShipList() {
      // 一時保存リストリセット
      this.enabledPushTempShip = true;
      this.tempShipList = [];
    },
    putShip(viewShip: ViewShip) {
      const { ship } = viewShip;
      this.shipListDialog = false;
      const fleetIndex = this.shipDialogTarget[0];
      const index = this.shipDialogTarget[1];
      const fleet = this.fleetInfo.fleets[fleetIndex];

      // もともとここに配備されていた艦娘の装備情報を抜き取る
      const oldShip = fleet.ships[index];
      const oldItems: Item[] = oldShip.items.concat();
      const newItems: Item[] = [];

      // 元々が空の艦で、艦娘数と配置番号が一致している場合、自動で空の艦娘を追加するが6隻まで
      if (oldShip.isEmpty && index === fleet.ships.length - 1 && fleet.ships.length < 6) {
        fleet.ships.push(new Ship());
      }

      for (let slotIndex = 0; slotIndex < ship.slotCount; slotIndex += 1) {
        const slot = ship.slots[slotIndex] > 0 ? ship.slots[slotIndex] : 0;
        if (slotIndex < oldItems.length) {
          const oldItem = oldItems[slotIndex];
          const itemMaster = oldItem.data;
          if (ShipValidation.isValidItem(ship, itemMaster, slotIndex)) {
            // マスタ情報があり、装備条件を満たしている場合は装備引継ぎOK！
            newItems.push(new Item({ item: oldItem, slot }));
          } else {
            // マスタ情報なし or 装備条件を満たさなかった装備は搭載数だけセット
            newItems.push(new Item({ slot }));
          }
        } else {
          // スロット数があっていない場合も空の装備で搭載数だけセット
          newItems.push(new Item({ slot }));
        }
      }

      // 補強増設チェック
      const oldExItem = oldShip.exItem.data;
      let exItem;
      if (oldExItem.id && ShipValidation.isValidItem(ship, oldExItem, Const.EXPAND_SLOT_INDEX)) {
        exItem = new Item({ master: oldExItem, remodel: oldShip.exItem.remodel });
      } else {
        exItem = new Item();
      }

      // 元々いた艦娘を置き換える
      fleet.ships[index] = new Ship({
        master: ship,
        items: newItems,
        exItem,
        isActive: oldShip.isActive,
        hp: viewShip.hp,
        level: viewShip.level,
        luck: viewShip.luck,
        asw: viewShip.asw + Ship.getStatusFromLevel(viewShip.level, ship.maxAsw, ship.minAsw),
        area: viewShip.area,
      });

      // 編成が更新されたため、艦隊を再インスタンス化し更新
      this.fleetInfo.fleets[fleetIndex] = new Fleet({ fleet });
      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
    },
    equipItem(item: Item) {
      const master = item.data;
      this.itemListDialog = false;
      const fleetIndex = this.itemDialogTarget[0];
      const shipIndex = this.itemDialogTarget[1];
      const slotIndex = this.itemDialogTarget[2];
      const fleet = this.fleetInfo.fleets[fleetIndex];
      const ship = fleet.ships[shipIndex];
      let newShip: Ship;

      // 新しい装備配列を生成
      const items = ship.items.concat();
      // 初期熟練度設定
      const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
      let level = 0;
      if (initialLevels) {
        // 設定情報より初期熟練度を解決
        const initData = initialLevels.find((v) => v.id === master.apiTypeId);
        if (initData) {
          level = initData.level;
        }
      }

      if (slotIndex < items.length) {
        if (item.data.apiTypeId === 41 && ship.data.type2 === 90) {
          // 日進 & 大型飛行艇
          items[slotIndex] = new Item({
            item: items[slotIndex],
            master,
            remodel: item.remodel,
            level,
            slot: 1,
          });
        } else {
          // 装備を置き換え
          items[slotIndex] = new Item({
            item: items[slotIndex],
            master,
            remodel: item.remodel,
            level,
          });
        }
        // 装備を変更した艦娘インスタンス再生成
        newShip = new Ship({ ship, items });
      } else if (slotIndex === Const.EXPAND_SLOT_INDEX) {
        // 補強増設を変更した艦娘インスタンス再生成
        const builder: ShipBuilder = { ship, exItem: new Item({ item: ship.exItem, master, remodel: item.remodel }) };
        newShip = new Ship(builder);
      } else {
        // 搭載失敗
        return;
      }

      if (shipIndex < fleet.ships.length) {
        fleet.ships[shipIndex] = newShip;
      } else {
        return;
      }

      // 再生成した艦娘インスタンスで該当艦娘を置き換えた艦隊インスタンスを設定
      const builder: FleetBuilder = { fleet, ships: fleet.ships.concat() };
      this.fleetInfo.fleets[fleetIndex] = new Fleet(builder);
      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
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

      const fleetIndex = this.shipDialogTarget[0];
      const index = this.shipDialogTarget[1];
      const fleet = this.fleetInfo.fleets[fleetIndex];

      // もともとここに配備されていた艦娘の装備情報を抜き取る
      const oldShip = fleet.ships[index];
      const ship = oldShip.data;
      const newItems = oldShip.items.concat();

      for (let slotIndex = 0; slotIndex < newItems.length; slotIndex += 1) {
        if (slotIndex < items.length) {
          const newItem = items[slotIndex];
          if (newItem && ShipValidation.isValidItem(ship, newItem.data, slotIndex)) {
            // マスタ情報があり、装備条件を満たしている場合は装備引継ぎOK！
            // 初期熟練度設定
            const initialLevels = (this.$store.state.siteSetting as SiteSetting).planeInitialLevels;
            let level = 0;
            if (initialLevels) {
              // 設定情報より初期熟練度を解決
              const initData = initialLevels.find((v) => v.id === newItem.data.apiTypeId);
              if (initData) {
                level = initData.level;
              }
            }

            if (newItem.data.id === 138 && ship.type2 === 90) {
              // 日進 & 二式大艇
              newItems[slotIndex] = new Item({
                master: newItem.data,
                item: newItems[slotIndex],
                level,
                remodel: newItem.remodel,
                slot: 1,
              });
            } else {
              newItems[slotIndex] = new Item({
                master: newItem.data,
                item: newItems[slotIndex],
                level,
                remodel: newItem.remodel,
              });
            }
          } else {
            // 不適合、外す
            newItems[slotIndex] = new Item();
          }
        }
      }

      // 補強増設チェック
      const presetExItem = itemMasters.find((v) => v.id === preset.exItem.id);
      let exItem;
      if (presetExItem && ShipValidation.isValidItem(ship, presetExItem, Const.EXPAND_SLOT_INDEX)) {
        // 搭載可能なら入れ替え
        exItem = new Item({ master: presetExItem, remodel: preset.exItem.remodel });
      }

      // 元々いた艦娘を置き換える
      fleet.ships[index] = new Ship({
        ship: oldShip,
        items: newItems,
        exItem,
      });

      // 編成が更新されたため、艦隊を再インスタンス化し更新
      this.fleetInfo.fleets[fleetIndex] = new Fleet({ fleet });
      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
    },
    onLevelMenuToggle() {
      if (!this.levelMenu) {
        // 司令部レベル変更 => サイト設定値も変更してやる
        this.setInfo(new FleetInfo({ info: this.fleetInfo, admiralLevel: this.level }));
        const setting = this.$store.state.siteSetting as SiteSetting;
        if (setting) {
          setting.admiralLevel = this.level;
          this.$store.dispatch('updateSetting', setting);
        }
      } else {
        this.level = this.fleetInfo.admiralLevel;
      }
    },
    changedFormation(formation: number) {
      this.handleChangeFormation(formation);
    },
    changedInfo() {
      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
    },
    changedTab(index: number) {
      if (this.fleetInfo.mainFleetIndex === index) {
        return;
      }
      const info = new FleetInfo({ info: this.fleetInfo, mainFleetIndex: index });
      // 編成が変更されたわけではないので履歴への追加を起こさない
      info.ignoreHistory = true;
      this.setInfo(info);
    },
    resetFleetAll() {
      this.setInfo(new FleetInfo());
    },
    closeDialog() {
      this.itemListDialog = false;
      this.shipListDialog = false;
      this.itemPresetDialog = false;
    },
    changeWidth(width: number) {
      this.itemDialogWidth = width;
    },
    changeShipWidth(width: number) {
      this.shipDialogWidth = width;
    },
    captureFleet() {
      // 背景色とかを塗るフラグ立て
      this.capturing = true;
      const index = this.value.mainFleetIndex;
      const div = document.getElementsByClassName('fleet-container')[index] as HTMLDivElement;
      setTimeout(() => {
        html2canvas(div, { scale: 2, width: 1200 }).then((canvas) => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL();
          link.download = `fleet_${Convert.formatDate(new Date(), 'yyyyMMdd-HHmmss')}.jpg`;
          link.click();
          this.capturing = false;
        });
      }, 10);
    },
    dragStart(e: DragEvent) {
      const target = e.target as HTMLDivElement;
      if (target && target.classList && target.classList.contains('fleet-tab')) {
        target.style.opacity = '0.4';
        target.style.backgroundColor = 'rgba(20, 120, 255, 0.2)';
        target.id = 'dragging-item';
      } else {
        return;
      }

      const transfer = e.dataTransfer as DataTransfer;
      const rect = target.getBoundingClientRect();
      if (transfer && rect) {
        transfer.setDragImage(target, rect.width / 2, rect.height);
      }
    },
    dragLeave(e: DragEvent) {
      (e.target as HTMLDivElement).style.backgroundColor = '';
    },
    dragEnter(e: DragEvent): void {
      const draggingDiv = document.getElementById('dragging-item');
      const target = e.target as HTMLDivElement;
      if (!draggingDiv || !target) {
        return;
      }
      // 受け入れ可能 背景色を青っぽく
      target.style.backgroundColor = 'rgba(255, 200, 100, 0.4)';
    },
    dropItem(e: DragEvent) {
      // 受け渡されたデータ
      const draggingDiv = document.getElementById('dragging-item');
      // そもそもドラッグ開始が正常になされているか
      if (!draggingDiv) {
        return;
      }

      // ドロップされる要素
      const target = e.target as HTMLDivElement;
      target.style.backgroundColor = '';
      if (target.id) {
        // 自身へのドロップ なにもなし
        return;
      }

      const fleetTabs = document.querySelectorAll('.fleet-tab.v-tab');
      let fromIndex = -1;
      let toIndex = -1;
      for (let i = 0; i < fleetTabs.length; i += 1) {
        if (fleetTabs[i] === target) {
          toIndex = i;
        }
        if (fleetTabs[i] === draggingDiv) {
          fromIndex = i;
        }
      }

      if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
        const fromFleet = this.fleetInfo.fleets[fromIndex];
        const toFleet = this.fleetInfo.fleets[toIndex];

        this.fleetInfo.fleets[toIndex] = new Fleet({ fleet: fromFleet });
        this.fleetInfo.fleets[fromIndex] = new Fleet({ fleet: toFleet });
      }
    },
    dragEnd(e: DragEvent) {
      // 後片付け
      const target = e.target as HTMLDivElement;
      if (target && target.classList && target.classList.contains('fleet-tab')) {
        target.style.opacity = '1';
        target.style.backgroundColor = '';
        target.id = '';
      }

      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
    },
    toggleBulkTarget() {
      if (this.bulkUpdateTarget.some((v) => !v)) {
        this.bulkUpdateTarget = [1, 1, 1, 1];
      } else {
        this.bulkUpdateTarget = [0, 0, 0, 0];
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
      this.bulkUpdateAllItem({}, true);
    },
    setSlot(value: number) {
      this.bulkUpdateAllItem({ slot: value }, true);
    },
    setMaxLevelOnlyFighter() {
      this.bulkUpdateAllItem({ level: 120 }, false, true);
    },
    bulkUpdateAllItem(itemBuilder: ItemBuilder, isResetSlot = false, onlyFighter = false) {
      // 指定ビルダーで装備情報一括更新
      const { fleets } = this.fleetInfo;
      for (let i = 0; i < fleets.length; i += 1) {
        if (!this.bulkUpdateTarget[i]) {
          continue;
        }
        const { ships } = fleets[i];
        for (let j = 0; j < ships.length; j += 1) {
          const shipMaster = ships[j].data;
          const { items } = ships[j];
          for (let k = 0; k < items.length; k += 1) {
            if (!onlyFighter || (onlyFighter && items[k].data.isFighter)) {
              const isPlane = items[k] && items[k].data.isPlane;
              const slot = itemBuilder.slot ? Math.min(itemBuilder.slot, shipMaster.slots[k]) : shipMaster.slots[k];
              items[k] = new Item({
                item: items[k],
                slot: isResetSlot && isPlane ? slot : undefined,
                remodel: items[k].data.canRemodel ? itemBuilder.remodel : undefined,
                level: itemBuilder.level,
              });
            }
          }

          const newExItem = new Item({
            item: ships[j].exItem,
            remodel: ships[j].exItem.data.canRemodel ? itemBuilder.remodel : undefined,
            level: itemBuilder.level,
          });
          ships[j] = new Ship({ ship: ships[j], exItem: newExItem });
        }
        fleets[i] = new Fleet({ fleet: fleets[i] });
      }

      const newInfo = new FleetInfo({ info: this.fleetInfo });
      // 閉じるまで計算はさせない
      newInfo.calculated = true;
      this.setInfo(newInfo);
    },
    closeBulkUpdateDialog() {
      this.bulkUpdateDialog = false;
      this.onBulkUpdateDialogToggle();
    },
    onBulkUpdateDialogToggle() {
      if (!this.bulkUpdateDialog) {
        this.setInfo(new FleetInfo({ info: this.fleetInfo }));
      }
    },
    optimizeFighterSlot() {
      const { ships } = this.value.fleets[this.value.mainFleetIndex];
      const newShips = ShipValidation.getOptimizedFighterFleet(ships);
      this.value.fleets[this.value.mainFleetIndex] = new Fleet({ ships: newShips });
      this.setInfo(new FleetInfo({ info: this.fleetInfo }));
    },
    initializeOutput() {
      // 画像出力初期化
      const saveData = this.$store.state.mainSaveData as SaveData;
      if (!saveData) {
        return;
      }
      const manager = saveData.tempData[saveData.tempIndex];
      if (!manager) {
        return;
      }

      // 連合か？
      if (manager.fleetInfo.isUnion) {
        this.gkcoiOutputTarget = [1, 1, 0, 0];
      } else {
        this.gkcoiOutputTarget = [1, 0, 0, 0];
      }
      this.enabledOutput = true;
    },
    generateImage() {
      // 連打禁止
      this.enabledOutput = false;
      this.generatedCanvas = undefined;
      this.generatingImage = true;
      this.generateError = '';
      const imageArea = document.getElementById('image-area') as HTMLDivElement;
      imageArea.innerHTML = '';

      const saveData = this.$store.state.mainSaveData as SaveData;
      if (!saveData) {
        return;
      }
      const manager = saveData.tempData[saveData.tempIndex];
      if (!manager) {
        return;
      }
      const deck = Convert.createDeckBuilder(manager, true);
      if (!this.gkcoiOutputTarget[0]) delete deck.f1;
      if (!this.gkcoiOutputTarget[1]) delete deck.f2;
      if (!this.gkcoiOutputTarget[2]) delete deck.f3;
      if (!this.gkcoiOutputTarget[3]) delete deck.f4;

      const gkcoiBuilder: DeckBuilder = Object.assign(deck, {
        lang: this.gkcoiLang,
        theme: this.gkcoiTheme,
        cmt: '',
      });
      generate(gkcoiBuilder)
        .then((canvas) => {
          canvas.style.maxWidth = '100%';
          imageArea.appendChild(canvas);
          this.generatedCanvas = canvas;
          this.generatingImage = false;
        })
        .catch((e) => {
          this.generatingImage = false;
          this.generateError = e;
        });
    },
    saveImage() {
      const canvas = this.generatedCanvas;
      if (canvas) {
        const base64 = canvas.toDataURL('image/jpeg');
        const download = document.getElementById('gkcoi-download') as HTMLAnchorElement;
        download.href = base64;
        download.download = `fleet_${Convert.formatDate(new Date(), 'yyyyMMdd-HHmmss')}.jpg`;
        download.click();
      }
    },
    openGkcoiPage() {
      window.open('https://github.com/Nishisonic/gkcoi/', '_blank');
    },
  },
});
</script>
