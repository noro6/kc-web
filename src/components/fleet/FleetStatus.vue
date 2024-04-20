<template>
  <div class="pa-2">
    <div class="d-flex mb-1 align-center justify-end">
      <v-btn icon @click="setStructureText()">
        <v-icon>mdi-sync</v-icon>
      </v-btn>
      <div class="ml-2 structure-text body-2">
        <v-text-field class="mt-0 pt-0" v-model="structureText" dense hide-details readonly @focus="textFieldFocused" />
      </div>
      <div class="ml-2 structure-text sub body-2" v-if="structureText2">
        <v-text-field class="mt-0 pt-0" v-model="structureText2" dense hide-details readonly @focus="textFieldFocused" />
      </div>
    </div>
    <v-divider />
    <v-simple-table dense>
      <template v-slot:default>
        <thead>
          <tr>
            <th></th>
            <th class="text-right">Lv</th>
            <th class="text-right">{{ $t("Common.火力") }}</th>
            <th class="text-right">{{ $t("Common.対空") }}</th>
            <th class="text-right">{{ $t("Common.対潜") }}</th>
            <th class="text-right">{{ $t("Common.索敵") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ship, i) in ships" :key="`ship${i}`" :class="{ 'tr-escort': ship.isEscort }">
            <td class="d-flex align-center pl-0">
              <div>
                <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120" />
              </div>
              <div class="d-flex flex-grow-1 ml-1">
                <div class="ship-name text-truncate">{{ getShipName(ship.data) }}</div>
              </div>
            </td>
            <td class="text-right">{{ ship.level }}</td>
            <td class="text-right">{{ ship.displayStatus.firePower }}</td>
            <td class="text-right">{{ ship.displayStatus.antiAir }}</td>
            <td class="text-right">{{ ship.displayStatus.asw }}</td>
            <td class="text-right">{{ ship.displayStatus.LoS }}</td>
          </tr>
          <tr>
            <td>{{ $t("Common.合計") }}</td>
            <td class="text-right">{{ totalLevel }}</td>
            <td class="text-right">{{ totalFirePower }}</td>
            <td class="text-right">{{ totalAntiAir }}</td>
            <td class="text-right">{{ totalAsw }}</td>
            <td class="text-right">{{ totalLoS }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-divider class="mb-6"></v-divider>
    <div>
      <div>{{ $t("Common.遠征ステータスチェッカー") }}</div>
    </div>
    <v-alert v-if="includePlane" border="left" dense outlined type="warning" class="my-2 text-caption text-sm-body-2">
      {{
        $t(
          "Common.艦隊に艦載機が含まれています。遠征における艦載機の性能に対する補正の計算式が不明なため、遠征のステータス調整に利用する際は十分注意してください。"
        )
      }}
    </v-alert>
    <v-card class="pa-2">
      <div class="d-flex flex-wrap align-center justify-md-space-between">
        <v-checkbox
          class="mr-3"
          v-for="(item, i) in worlds"
          :key="`world${i}`"
          dense
          v-model="item.isChecked"
          :label="item.text"
          hide-details
          @change="setExpeditionRow"
        />
        <v-btn small @click="toggleAllWorld()" outlined color="primary"> <v-icon small>mdi-check-all</v-icon> {{ $t("Database.一括チェック") }} </v-btn>
      </div>
      <v-divider class="mt-2" />
      <v-simple-table dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th>{{ $t("ItemList.名称") }}</th>
              <th class="text-right">{{ $t("Common.旗艦Lv") }}</th>
              <th class="text-right">{{ $t("Common.合計Lv") }}</th>
              <th class="text-right">{{ $t("Common.火力") }}</th>
              <th class="text-right">{{ $t("Common.対空") }}</th>
              <th class="text-right">{{ $t("Common.対潜") }}</th>
              <th class="text-right">{{ $t("Common.索敵") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in expeditionRows" :key="`expedition${i}`" :class="{ 'tr-lack': row.failed }">
              <td class="text-no-wrap caption">{{ row.id }} : {{ row.name }}</td>
              <td class="text-right">
                <v-icon v-if="row.flagshipLevel >= 0" color="success" small>mdi-check</v-icon>
                <v-icon v-else color="error" small>mdi-close</v-icon>
                <span class="status-area" v-if="row.flagshipLevel < 0">{{ row.flagshipLevel }}</span>
                <span class="status-area" v-else>+{{ row.flagshipLevel }}</span>
              </td>
              <td class="text-right">
                <v-icon v-if="row.level >= 0" color="success" small>mdi-check</v-icon>
                <v-icon v-else color="error" small>mdi-close</v-icon>
                <span class="status-area" v-if="row.level < 0">{{ row.level }}</span>
              </td>
              <td class="text-right">
                <v-icon v-if="row.fire >= 217" color="primary" small>mdi-star</v-icon>
                <v-icon v-else-if="row.fire >= 0" color="success" small>mdi-check</v-icon>
                <v-icon v-else color="error" small>mdi-close</v-icon>
                <span class="status-area" v-if="row.fire">{{ row.fire > 0 ? `${row.fire}%` : row.fire }}</span>
              </td>
              <td class="text-right">
                <v-icon v-if="row.antiAir >= 217" color="primary" small>mdi-star</v-icon>
                <v-icon v-else-if="row.antiAir >= 0" color="success" small>mdi-check</v-icon>
                <v-icon v-else color="error" small>mdi-close</v-icon>
                <span class="status-area" v-if="row.antiAir">{{ row.antiAir > 0 ? `${row.antiAir}%` : row.antiAir }}</span>
              </td>
              <td class="text-right">
                <v-icon v-if="row.asw >= 217" color="primary" small>mdi-star</v-icon>
                <v-icon v-else-if="row.asw >= 0" color="success" small>mdi-check</v-icon>
                <v-icon v-else color="error" small>mdi-close</v-icon>
                <span class="status-area" v-if="row.asw">{{ row.asw > 0 ? `${row.asw}%` : row.asw }}</span>
              </td>
              <td class="text-right">
                <v-icon v-if="row.scout >= 217" color="primary" small>mdi-star</v-icon>
                <v-icon v-else-if="row.scout >= 0" color="success" small>mdi-check</v-icon>
                <v-icon v-else color="error" small>mdi-close</v-icon>
                <span class="status-area" v-if="row.scout">{{ row.scout > 0 ? `${row.scout}%` : row.scout }}</span>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <v-divider v-if="expeditionRows.length" />
    </v-card>
  </div>
</template>

<style scoped>
@media (min-width: 660px) {
  .structure-text {
    width: 220px;
  }
  .structure-text.sub {
    width: 200px;
  }
}
.v-data-table th {
  white-space: nowrap;
}
.v-data-table tbody tr.tr-escort {
  background-color: rgba(128, 128, 128, 0.1);
}
.v-data-table tbody tr.tr-escort:hover {
  background-color: rgba(128, 128, 128, 0.2) !important;
}
.v-data-table tbody tr.tr-lack {
  background-color: rgba(255, 10, 10, 0.05);
}
.v-data-table tbody tr.tr-lack:hover {
  background-color: rgba(255, 10, 10, 0.1) !important;
}
.ship-name {
  flex-grow: 1;
  width: 72px;
}
.status-area {
  display: inline-block;
  font-size: 12px;
  width: 34px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import sum from 'lodash/sum';
import Fleet from '@/classes/fleet/fleet';
import SiteSetting from '@/classes/siteSetting';
import Ship from '@/classes/fleet/ship';
import ShipMaster from '@/classes/fleet/shipMaster';
import { MasterWorld } from '@/classes/interfaces/master';
import Const from '../../classes/const';

type ExpeditionRow = {
  id: string;
  name: string;
  flagshipLevel: number;
  level: string;
  fire: number;
  antiAir: number;
  asw: number;
  scout: number;
  failed: boolean;
};

export default Vue.extend({
  name: 'FleetStatus',
  props: {
    fleet: {
      type: Fleet,
      required: true,
    },
  },
  data: () => ({
    worlds: [] as { world: number; text: string; isChecked: boolean }[],
    expeditionRows: [] as ExpeditionRow[],
    structureText: '',
    structureText2: '',
    outputLang: 'ja',
  }),
  mounted() {
    const worlds = this.$store.state.worlds as MasterWorld[];
    this.worlds = [];
    const checked = this.$store.state.checkedExpeditionWorlds as number[];

    for (let i = 0; i < worlds.length; i += 1) {
      const data = worlds[i];
      if (Const.EXPEDITIONS.some((v) => v.world === data.world)) {
        let isChecked = true;
        if (checked && checked.length && !checked.includes(data.world)) {
          isChecked = false;
        }
        this.worlds.push({
          world: data.world,
          text: data.name,
          isChecked,
        });
      }
    }
    this.setExpeditionRow();
    this.setStructureText();
  },
  computed: {
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    ships(): Ship[] {
      return this.fleet.ships.filter((v) => v.data.id > 0 && v.isActive);
    },
    totalLevel(): number {
      return sum(this.ships.map((v) => v.level));
    },
    totalFirePower(): number {
      return sum(
        this.ships.map((v) => {
          const itemTotal = sum(v.items.map((w) => w.bonusExpeditionFire));
          return v.displayStatus.firePower + Math.floor(itemTotal);
        }),
      );
    },
    totalAntiAir(): number {
      return sum(
        this.ships.map((v) => {
          const itemTotal = sum(v.items.map((w) => w.bonusExpeditionAntiAir));
          return v.displayStatus.antiAir + Math.floor(itemTotal);
        }),
      );
    },
    totalAsw(): number {
      return sum(
        this.ships.map((v) => {
          const itemTotal = sum(v.items.map((w) => w.bonusExpeditionAsw));
          return v.displayStatus.asw + Math.floor(itemTotal);
        }),
      );
    },
    totalLoS(): number {
      return sum(
        this.ships.map((v) => {
          const itemTotal = sum(v.items.map((w) => w.bonusExpeditionScout));
          return v.displayStatus.LoS + Math.floor(itemTotal);
        }),
      );
    },
    includePlane(): boolean {
      return this.ships.some((v) => v.items.some((x) => x.data.isPlane));
    },
  },
  methods: {
    textFieldFocused(focusEvent: FocusEvent) {
      if (focusEvent) (focusEvent.target as HTMLInputElement).select();
    },
    getShipName(ship: ShipMaster) {
      if (ship.name && this.needTrans) {
        const shipName = ShipMaster.getSuffix(ship);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return ship.name ? ship.name : '';
    },
    setExpeditionRow() {
      this.expeditionRows = [];
      const expeditions = Const.EXPEDITIONS;
      for (let i = 0; i < expeditions.length; i += 1) {
        const expedition = expeditions[i];

        if (this.worlds.some((v) => v.world === expedition.world && v.isChecked)) {
          const flagshipLevel = (this.ships[0] ? this.ships[0].level : 0) - expedition.minFlagshipLv;
          const level = this.totalLevel - expedition.totalLevel;
          let fire = this.totalFirePower - (expedition.statuses.fire ?? 0);
          let antiAir = this.totalAntiAir - (expedition.statuses.antiAir ?? 0);
          let asw = this.totalAsw - (expedition.statuses.asw ?? 0);
          let scout = this.totalLoS - (expedition.statuses.scout ?? 0);
          if (fire >= 0) {
            if (expedition.statuses.fire) fire = Math.floor((100 * this.totalFirePower) / expedition.statuses.fire);
            else fire = 0;
            if (fire >= 1000) fire = 999;
          }
          if (antiAir >= 0) {
            if (expedition.statuses.antiAir) antiAir = Math.floor((100 * this.totalAntiAir) / expedition.statuses.antiAir);
            else antiAir = 0;
            if (antiAir >= 1000) antiAir = 999;
          }
          if (asw >= 0) {
            if (expedition.statuses.asw) asw = Math.floor((100 * this.totalAsw) / expedition.statuses.asw);
            else asw = 0;
            if (asw >= 1000) asw = 999;
          }
          if (scout >= 0) {
            if (expedition.statuses.scout) scout = Math.floor((100 * this.totalLoS) / expedition.statuses.scout);
            else scout = 0;
            if (scout >= 1000) scout = 999;
          }

          this.expeditionRows.push({
            id: expedition.id,
            name: expedition.name,
            flagshipLevel,
            level: level >= 0 ? '' : `${level}`,
            fire,
            antiAir,
            asw,
            scout,
            failed: flagshipLevel < 0 || level < 0 || fire < 0 || antiAir < 0 || asw < 0 || scout < 0,
          });
        }
      }

      const worlds = this.worlds.filter((v) => v.isChecked).map((v) => v.world);
      this.$store.dispatch('updateExpeditionWorlds', worlds);
    },
    toggleAllWorld() {
      // いずれか1つでも未チェックがあれば全チェック => 全チェック状態だった場合のみチェックを解除ということ。
      const checked = this.worlds.some((v) => !v.isChecked);
      for (let i = 0; i < this.worlds.length; i += 1) {
        this.worlds[i].isChecked = checked;
      }

      this.setExpeditionRow();
    },
    setStructureText() {
      const text: string[] = [];
      const text2: string[] = [];

      this.structureText = '';
      this.structureText2 = '';

      const ships1 = this.ships.filter((v) => !v.isEscort);
      const ships2 = this.ships.filter((v) => v.isEscort);

      for (let i = 0; i < Const.SHIP_TYPES_ALT3.length; i += 1) {
        const type = Const.SHIP_TYPES_ALT3[i];
        let count = ships1.filter((v) => type.type === v.data.type).length;
        if (count) {
          if (this.outputLang === 'ja') {
            text.push(`${count > 1 ? count : ''}${this.$t(`SType.${type.text}`, 'en')}`);
          } else {
            text.push(`${type.text}${count > 1 ? count : ''}`);
          }
        }

        count = ships2.filter((v) => type.type === v.data.type).length;
        if (count) {
          if (this.outputLang === 'ja') {
            text2.push(`${count > 1 ? count : ''}${this.$t(`SType.${type.text}`, 'en')}`);
          } else {
            text2.push(`${type.text}${count > 1 ? count : ''}`);
          }
        }
      }
      if (this.outputLang === 'ja') {
        this.outputLang = 'en';
      } else {
        this.outputLang = 'ja';
      }
      this.structureText = text.join(' ');
      this.structureText2 = text2.join(' ');
    },
  },
});
</script>
