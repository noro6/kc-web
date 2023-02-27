<template>
  <div class="pa-2">
    <v-alert v-if="includePlane" border="left" dense outlined type="warning">
      {{
        $t(
          "Common.艦隊に艦載機が含まれています。遠征における艦載機の性能に対する補正の計算式が不明なため、遠征のステータス調整に利用する際は十分注意してください。"
        )
      }}
    </v-alert>
    <v-divider />
    <v-simple-table fixed-header height="64vh">
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
          <tr v-for="(ship, i) in ships" :key="`ship${i}`">
            <td class="d-flex align-center">
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
  </div>
</template>

<style scoped>
.v-data-table thead th {
  height: 36px !important;
}
.v-data-table tbody td {
  height: 42px !important;
}
.ship-name {
  flex-grow: 1;
  width: 10px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import sum from 'lodash/sum';
import Fleet from '@/classes/fleet/fleet';
import SiteSetting from '@/classes/siteSetting';
import Ship from '@/classes/fleet/ship';
import ShipMaster from '@/classes/fleet/shipMaster';

export default Vue.extend({
  name: 'FleetStatus',
  props: {
    fleet: {
      type: Fleet,
      required: true,
    },
  },
  data: () => ({}),
  mounted() {
    //
  },
  computed: {
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    ships(): Ship[] {
      return this.fleet.ships.filter((v) => v.data.id > 0);
    },
    totalLevel(): number {
      return sum(this.ships.map((v) => v.level));
    },
    totalFirePower(): number {
      return sum(this.ships.map((v) => v.displayStatus.firePower));
    },
    totalAntiAir(): number {
      return sum(this.ships.map((v) => v.displayStatus.antiAir));
    },
    totalAsw(): number {
      return sum(this.ships.map((v) => v.displayStatus.asw));
    },
    totalLoS(): number {
      return sum(this.ships.map((v) => v.displayStatus.LoS));
    },
    includePlane(): boolean {
      return this.ships.some((v) => v.items.some((x) => x.data.isPlane));
    },
  },
  methods: {
    getShipName(ship: ShipMaster) {
      if (ship.name && this.needTrans) {
        const shipName = ShipMaster.getSuffix(ship);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return ship.name ? ship.name : '';
    },
  },
});
</script>
