<template>
  <div>
    <div class="d-flex justify-end mb-3">
      <v-btn @click="resetShips"><v-icon>mdi-trash-can-outline</v-icon>{{ $t("Common.リセット") }}</v-btn>
    </div>
    <v-divider></v-divider>
    <v-simple-table fixed-header height="64vh" dense>
      <template v-slot:default>
        <thead>
          <tr>
            <th>
              <div class="pb-2">
                <v-checkbox v-model="isDiffMode" :disabled="enabledShipsCount < 2" hide-details dense :label="$t('Extra.差分表示')"></v-checkbox>
              </div>
            </th>
            <th v-for="(ship, i) in ships" :key="`select${i}`" class="py-1 text-right">
              <v-btn v-if="ship.isEmpty" text @click="showShipList(i)"><v-icon>mdi-plus</v-icon>{{ $t("Fleet.艦娘選択") }}</v-btn>
              <div v-else class="d-flex justify-end">
                <div class="ship-img" @click="showShipList(i)" @keypress.enter="showShipList(i)" tabindex="0" v-ripple="{ class: 'text-primary' }">
                  <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120"></v-img>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ $t("Common.艦娘名") }}</td>
            <td v-for="(ship, i) in ships" :key="`name${i}`" class="ship-name text-truncate">{{ getShipName(ship.data) }}</td>
          </tr>
          <tr>
            <td>Lv</td>
            <td v-for="(ship, i) in ships" :key="`level${i}`" class="level-td">
              <div class="d-flex align-center justify-end py-1" v-if="!ship.isEmpty">
                <v-text-field
                  class="level-input"
                  v-model.number="ship.level"
                  dense
                  outlined
                  :max="maxLevel"
                  min="1"
                  type="number"
                  :rules="[rules.level]"
                  hide-details
                  @input="statusChanged(i)"
                ></v-text-field>
              </div>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.耐久") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`HP${i}`"
              :class="{
                top: maxStatuses.hp === ship.displayStatus.HP,
                min: minStatuses.hp === ship.displayStatus.HP,
                empty: ship.isEmpty || !maxStatuses.hp || maxStatuses.hp === minStatuses.hp,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.displayStatus.HP ? ship.displayStatus.HP : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.displayStatus.HP - ships[0].displayStatus.HP) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.火力") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`firePower${i}`"
              :class="{
                top: maxStatuses.firePower === ship.displayStatus.firePower,
                min: minStatuses.firePower === ship.displayStatus.firePower,
                empty: ship.isEmpty || !maxStatuses.firePower || maxStatuses.firePower === minStatuses.firePower,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.displayStatus.firePower ? ship.displayStatus.firePower : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.displayStatus.firePower - ships[0].displayStatus.firePower) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.装甲") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`armor${i}`"
              :class="{
                top: maxStatuses.armor === ship.displayStatus.armor,
                min: minStatuses.armor === ship.displayStatus.armor,
                empty: ship.isEmpty || !maxStatuses.armor || maxStatuses.armor === minStatuses.armor,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.displayStatus.armor ? ship.displayStatus.armor : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.displayStatus.armor - ships[0].displayStatus.armor) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.雷装") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`torpedo${i}`"
              :class="{
                top: maxStatuses.torpedo === ship.displayStatus.torpedo,
                min: minStatuses.torpedo === ship.displayStatus.torpedo,
                empty: ship.isEmpty || !maxStatuses.torpedo || maxStatuses.torpedo === minStatuses.torpedo,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.displayStatus.torpedo ? ship.displayStatus.torpedo : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.displayStatus.torpedo - ships[0].displayStatus.torpedo) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.夜戦火力") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`night${i}`"
              :class="{
                top: maxStatuses.night === ship.nightBattleFirePower,
                min: minStatuses.night === ship.nightBattleFirePower,
                empty: ship.isEmpty || !maxStatuses.night || maxStatuses.night === minStatuses.night,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.nightBattleFirePower ? ship.nightBattleFirePower : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.nightBattleFirePower - ships[0].nightBattleFirePower) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.対空") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`antiAir${i}`"
              :class="{
                top: maxStatuses.antiAir === ship.displayStatus.antiAir,
                min: minStatuses.antiAir === ship.displayStatus.antiAir,
                empty: ship.isEmpty || !maxStatuses.antiAir || maxStatuses.antiAir === minStatuses.antiAir,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.displayStatus.antiAir ? ship.displayStatus.antiAir : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.displayStatus.antiAir - ships[0].displayStatus.antiAir) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.対潜") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`asw${i}`"
              :class="{
                top: maxStatuses.asw === ship.displayStatus.asw,
                min: minStatuses.asw === ship.displayStatus.asw,
                empty: ship.isEmpty || !maxStatuses.asw || maxStatuses.asw === minStatuses.asw,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.displayStatus.asw ? ship.displayStatus.asw : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.displayStatus.asw - ships[0].displayStatus.asw) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.索敵") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`LoS${i}`"
              :class="{
                top: maxStatuses.LoS === ship.displayStatus.LoS,
                min: minStatuses.LoS === ship.displayStatus.LoS,
                empty: ship.isEmpty || !maxStatuses.LoS || maxStatuses.LoS === minStatuses.LoS,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.displayStatus.LoS ? ship.displayStatus.LoS : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.displayStatus.LoS - ships[0].displayStatus.LoS) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.回避") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`avoid${i}`"
              :class="{
                top: maxStatuses.avoid === ship.displayStatus.avoid,
                min: minStatuses.avoid === ship.displayStatus.avoid,
                empty: ship.isEmpty || !maxStatuses.avoid || maxStatuses.avoid === minStatuses.avoid,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.displayStatus.avoid ? ship.displayStatus.avoid : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.displayStatus.avoid - ships[0].displayStatus.avoid) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.運") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`luck${i}`"
              :class="{
                top: maxStatuses.luck === ship.displayStatus.luck,
                min: minStatuses.luck === ship.displayStatus.luck,
                empty: ship.isEmpty || !maxStatuses.luck || maxStatuses.luck === minStatuses.luck,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.displayStatus.luck ? ship.displayStatus.luck : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.displayStatus.luck - ships[0].displayStatus.luck) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.射程") }}</td>
            <td v-for="(ship, i) in ships" :key="`range${i}`">{{ ship.data.range ? $t(`Common.${rangeText[ship.displayStatus.range]}`) : "-" }}</td>
          </tr>
          <tr>
            <td>{{ $t("Common.速力") }}</td>
            <td v-for="(ship, i) in ships" :key="`speed${i}`">{{ !ship.isEmpty ? speedText(ship.speed) : "-" }}</td>
          </tr>
          <tr>
            <td>{{ $t("Common.燃料") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`fuel${i}`"
              :class="{
                top: maxStatuses.fuel === ship.fuel,
                min: minStatuses.fuel === ship.fuel,
                empty: ship.isEmpty || !maxStatuses.fuel || maxStatuses.fuel === minStatuses.fuel,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.data.fuel ? ship.fuel : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.fuel - ships[0].fuel) }}
              </template>
            </td>
          </tr>
          <tr>
            <td>{{ $t("Common.弾薬") }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`ammo${i}`"
              :class="{
                top: maxStatuses.ammo === ship.ammo,
                min: minStatuses.ammo === ship.ammo,
                empty: ship.isEmpty || !maxStatuses.ammo || maxStatuses.ammo === minStatuses.ammo,
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.data.ammo ? ship.ammo : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString(ship.ammo - ships[0].ammo) }}
              </template>
            </td>
          </tr>
          <tr v-for="j in 5" :key="`slot${j}`">
            <td>{{ $t("Fleet.搭載") }}{{ j }}</td>
            <td
              v-for="(ship, i) in ships"
              :key="`ammo${i}`"
              :class="{
                top: maxStatuses[`slot${j}`] === ship.data.slots[j - 1],
                min: minStatuses[`slot${j}`] === ship.data.slots[j - 1],
                empty: ship.isEmpty || !maxStatuses[`slot${j}`] || maxStatuses[`slot${j}`] === minStatuses[`slot${j}`],
              }"
            >
              <template v-if="!isDiffMode || i === 0 || ship.isEmpty">
                {{ ship.data.slots[j - 1] >= 0 ? ship.data.slots[j - 1] : "-" }}
              </template>
              <template v-else>
                {{ diffValueToString((ship.data.slots[j - 1] ? ship.data.slots[j - 1] : 0) - (ships[0].data.slots[j - 1] ? ships[0].data.slots[j - 1] : 0)) }}
              </template>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-dialog v-model="shipListDialog" transition="scroll-x-transition" :width="shipDialogWidth">
      <ship-list ref="shipList" :handle-decide-ship="putShip" :handle-close="closeDialog" :handle-change-width="changeShipWidth" />
    </v-dialog>
  </div>
</template>

<style scoped>
.ship-img {
  cursor: pointer;
  transition: 0.2s;
}
.ship-img:hover {
  box-shadow: 0 0 12px rgb(128, 128, 128);
}

table td:not(:first-child) {
  text-align: right;
}
table td:first-child {
  white-space: nowrap;
}
table tbody td.level-td {
  padding-right: 0px !important;
  padding-left: 2px !important;
}
table tbody td:not(.level-td) {
  padding-right: 27px !important;
}
.level-input >>> input {
  text-align: right !important;
}

.v-data-table tbody td.min:not(.empty) {
  background-color: rgba(255, 0, 0, 0.1);
}
.v-data-table tbody td.top:not(.empty) {
  background-color: rgba(0, 255, 64, 0.1);
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipList, { ViewShip } from '@/components/fleet/ShipList.vue';
import ShipMaster from '@/classes/fleet/shipMaster';
import SiteSetting from '@/classes/siteSetting';
import Ship from '@/classes/fleet/ship';
import { max, min } from 'lodash';
import ShipValidation from '@/classes/fleet/shipValidation';
import ItemMaster from '@/classes/item/itemMaster';
import Const from '@/classes/const';

interface displayStatus {
  hp: number;
  firePower: number;
  armor: number;
  torpedo: number;
  night: number;
  antiAir: number;
  asw: number;
  LoS: number;
  avoid: number;
  luck: number;
  fuel: number;
  ammo: number;
  slot1: number;
  slot2: number;
  slot3: number;
  slot4: number;
  slot5: number;
}

export default Vue.extend({
  name: 'ShipStatusCompare',
  components: { ShipList },
  data: () => ({
    ships: [new Ship(), new Ship(), new Ship(), new Ship(), new Ship(), new Ship()] as Ship[],
    maxStatuses: {
      hp: 0,
      firePower: 0,
      armor: 0,
      torpedo: 0,
      night: 0,
      antiAir: 0,
      asw: 0,
      LoS: 0,
      avoid: 0,
      luck: 0,
      fuel: 0,
      ammo: 0,
      slot1: 0,
      slot2: 0,
      slot3: 0,
      slot4: 0,
      slot5: 0,
    } as displayStatus,
    minStatuses: {
      hp: 0,
      firePower: 0,
      armor: 0,
      torpedo: 0,
      night: 0,
      antiAir: 0,
      asw: 0,
      LoS: 0,
      avoid: 0,
      luck: 0,
      fuel: 0,
      ammo: 0,
      slot1: 0,
      slot2: 0,
      slot3: 0,
      slot4: 0,
      slot5: 0,
    } as displayStatus,
    rangeText: ['', '短', '中', '長', '超長', '超長+'],
    putShipIndex: 0,
    shipListDialog: false,
    shipDialogWidth: 1200,
    rules: {
      level: (value: number) => !(value < 1 || value > Const.MAX_LEVEL) || `1 ～ ${Const.MAX_LEVEL}`,
    },
    maxLevel: Const.MAX_LEVEL,
    isDiffMode: false,
    diffs: [] as number[],
  }),
  mounted() {
    //
  },
  computed: {
    completed() {
      return this.$store.getters.getCompletedAll;
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    getShipName() {
      return (ship: ShipMaster) => {
        if (this.needTrans) {
          const array = ShipMaster.getSuffix(ship);
          return `${array.map((v) => (v ? `${this.$t(v)}` : '')).join('')}`;
        }
        return ship.name ? ship.name : '';
      };
    },
    speedText() {
      return (value: number) => {
        if (value <= 5) {
          return `${this.$t('Fleet.低速')}`;
        }
        if (value <= 10) {
          return `${this.$t('Fleet.高速')}`;
        }
        if (value <= 15) {
          return `${this.$t('Fleet.高速+')}`;
        }
        return `${this.$t('Fleet.最速')}`;
      };
    },
    diffValueToString() {
      return (value: number) => {
        if (value > 0) {
          return `+${value}`;
        }
        if (value < 0) {
          return `${value}`;
        }
        return '±0';
      };
    },
    validDaihatsu() {
      return (value: Ship) => {
        const daihatsu = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 68);
        return daihatsu && ShipValidation.isValidItem(value.data, daihatsu);
      };
    },
    validTank() {
      return (value: Ship) => {
        const tank = (this.$store.state.items as ItemMaster[]).find((v) => v.id === 167);
        return tank && ShipValidation.isValidItem(value.data, tank);
      };
    },
    enabledShipsCount(): number {
      return this.ships.filter((v) => !v.isEmpty).length;
    },
  },
  watch: {
    completed(value) {
      if (value) {
        //
      }
    },
  },
  methods: {
    resetShips() {
      this.ships = [new Ship(), new Ship(), new Ship(), new Ship(), new Ship(), new Ship()];
    },
    async showShipList(index: number) {
      this.putShipIndex = index;
      await (this.shipListDialog = true);
      (this.$refs.shipList as InstanceType<typeof ShipList>).initialize();
    },
    putShip(viewShip: ViewShip) {
      this.shipListDialog = false;
      const newShip = new Ship({
        master: viewShip.ship,
        hp: viewShip.hp,
        level: viewShip.level,
        luck: viewShip.luck,
        asw: viewShip.asw + Ship.getStatusFromLevel(viewShip.level, viewShip.ship.maxAsw, viewShip.ship.minAsw),
      });
      const ships = this.ships.concat();
      if (this.putShipIndex < this.ships.length) {
        ships[this.putShipIndex] = newShip;
      } else {
        ships.push(newShip);
      }

      this.ships = ships;
      this.setMaxStatuses();
      this.setMinStatuses();
    },
    removeShip(index: number) {
      this.ships[index] = new Ship();
    },
    changeShipWidth(width: number) {
      this.shipDialogWidth = width;
    },
    closeDialog() {
      this.shipListDialog = false;
    },
    statusChanged(index: number) {
      const ships = this.ships.concat();
      const ship = ships[index];
      const level = Math.max(Math.min(ships[index].level, this.maxLevel), 1);
      const asw = Ship.getStatusFromLevel(level, ship.data.maxAsw, ship.data.minAsw);
      ships[index] = new Ship({ ship: this.ships[index], level, asw: asw + ship.improveAsw });
      this.ships = ships;
      this.setMaxStatuses();
      this.setMinStatuses();
    },
    setMaxStatuses() {
      const targets = this.ships.filter((v) => !v.isEmpty);
      if (targets.length) {
        this.maxStatuses.hp = max(targets.map((v) => v.displayStatus.HP)) ?? 0;
        this.maxStatuses.firePower = max(targets.map((v) => v.displayStatus.firePower)) ?? 0;
        this.maxStatuses.armor = max(targets.map((v) => v.displayStatus.armor)) ?? 0;
        this.maxStatuses.torpedo = max(targets.map((v) => v.displayStatus.torpedo)) ?? 0;
        this.maxStatuses.night = max(targets.map((v) => v.nightBattleFirePower)) ?? 0;
        this.maxStatuses.antiAir = max(targets.map((v) => v.displayStatus.antiAir)) ?? 0;
        this.maxStatuses.asw = max(targets.map((v) => v.displayStatus.asw)) ?? 0;
        this.maxStatuses.LoS = max(targets.map((v) => v.displayStatus.LoS)) ?? 0;
        this.maxStatuses.avoid = max(targets.map((v) => v.displayStatus.avoid)) ?? 0;
        this.maxStatuses.luck = max(targets.map((v) => v.displayStatus.luck)) ?? 0;
        this.maxStatuses.fuel = min(targets.map((v) => v.fuel)) ?? 0;
        this.maxStatuses.ammo = min(targets.map((v) => v.ammo)) ?? 0;
        this.maxStatuses.slot1 = max(targets.map((v) => v.data.slots[0])) ?? 0;
        this.maxStatuses.slot2 = max(targets.map((v) => v.data.slots[1])) ?? 0;
        this.maxStatuses.slot3 = max(targets.map((v) => v.data.slots[2])) ?? 0;
        this.maxStatuses.slot4 = max(targets.map((v) => v.data.slots[3])) ?? 0;
        this.maxStatuses.slot5 = max(targets.map((v) => v.data.slots[4])) ?? 0;
      } else {
        Object.keys(this.maxStatuses).forEach((key) => {
          this.maxStatuses[key as keyof displayStatus] = 0;
        });
      }
    },
    setMinStatuses() {
      const targets = this.ships.filter((v) => !v.isEmpty);
      if (targets.length) {
        this.minStatuses.hp = min(targets.map((v) => v.displayStatus.HP)) ?? 0;
        this.minStatuses.firePower = min(targets.map((v) => v.displayStatus.firePower)) ?? 0;
        this.minStatuses.armor = min(targets.map((v) => v.displayStatus.armor)) ?? 0;
        this.minStatuses.torpedo = min(targets.map((v) => v.displayStatus.torpedo)) ?? 0;
        this.minStatuses.night = min(targets.map((v) => v.nightBattleFirePower)) ?? 0;
        this.minStatuses.antiAir = min(targets.map((v) => v.displayStatus.antiAir)) ?? 0;
        this.minStatuses.asw = min(targets.map((v) => v.displayStatus.asw)) ?? 0;
        this.minStatuses.LoS = min(targets.map((v) => v.displayStatus.LoS)) ?? 0;
        this.minStatuses.avoid = min(targets.map((v) => v.displayStatus.avoid)) ?? 0;
        this.minStatuses.luck = min(targets.map((v) => v.displayStatus.luck)) ?? 0;
        this.minStatuses.fuel = max(targets.map((v) => v.fuel)) ?? 0;
        this.minStatuses.ammo = max(targets.map((v) => v.ammo)) ?? 0;
        this.minStatuses.slot1 = min(targets.map((v) => v.data.slots[0])) ?? 0;
        this.minStatuses.slot2 = min(targets.map((v) => v.data.slots[1])) ?? 0;
        this.minStatuses.slot3 = min(targets.map((v) => v.data.slots[2])) ?? 0;
        this.minStatuses.slot4 = min(targets.map((v) => v.data.slots[3])) ?? 0;
        this.minStatuses.slot5 = min(targets.map((v) => v.data.slots[4])) ?? 0;
      } else {
        Object.keys(this.minStatuses).forEach((key) => {
          this.minStatuses[key as keyof displayStatus] = 0;
        });
      }
    },
  },
});
</script>
