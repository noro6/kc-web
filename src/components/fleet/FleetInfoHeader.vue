<template>
  <div>
    <div class="d-flex px-1 flex-wrap align-center">
      <div class="caption text--secondary">{{ $t("Common.制空") }}</div>
      <div class="mx-1 body-2">{{ value.fullAirPower }}</div>
      <div class="caption text--secondary">{{ $t("Fleet.触接") }}</div>
      <div class="mx-1 body-2">{{ contactRate }}%</div>
      <div>
        <v-img :src="`./img/type/icon50.png`" height="24" width="24" />
      </div>
      <div class="mx-1 body-2">{{ nightContactRate }}%</div>
      <!-- 速力 -->
      <template v-if="actualFleet.fleetSpeed">
        <div>
          <v-img :src="`./img/type/icon19.png`" height="24" width="24" />
        </div>
        <div class="mr-1 body-2">{{ $t(`Fleet.${actualFleet.fleetSpeed}`) }}{{ $t(`Fleet.艦隊`) }}</div>
      </template>
      <!-- TP -->
      <div class="mr-2 d-flex">
        <div class="option-status d-flex">
          <v-img :src="`./img/type/icon25.png`" height="24" width="24" />
          <div class="option-status-label label-tp">TP</div>
          <div class="ml-2 body-2 align-self-center tp d-flex">
            <div>{{ actualFleet.tp }}</div>
            <div class="status-label">S</div>
          </div>
          <div class="ml-2 mr-1">/</div>
          <div class="body-2 align-self-center tp d-flex">
            <div>{{ tpA }}</div>
            <div class="status-label">A</div>
          </div>
        </div>
      </div>
      <!-- 索敵値 -->
      <div class="d-flex">
        <div class="option-status d-flex mr-1" v-for="(scout, i) in fleetScouts" :key="i">
          <v-img :src="`./img/type/icon11.png`" height="20" width="20" />
          <div class="option-status-label">{{ i + 1 }}</div>
          <div class="ml-2 body-2">{{ scout }}</div>
        </div>
      </div>
      <div class="ml-2 d-flex align-center">
        <div class="caption d-capture-none">{{ $t("Fleet.艦隊詳細") }}</div>
        <div class="operation-button">
          <v-btn color="primary" icon @click="clickedInfo">
            <v-icon>mdi-information-outline</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
    <v-dialog v-model="detailDialog" transition="scroll-x-transition" width="880" @input="toggleDetailDialog">
      <fleet-detail v-if="!destroyDialog" :fleet="actualFleet" :index="index" :is-union="isUnion" ref="fleetDetail" :handle-close="closeDetail" />
    </v-dialog>
  </div>
</template>

<style scoped>
.option-status {
  position: relative;
}
.option-status .option-status-label {
  align-self: flex-end;
  position: absolute;
  opacity: 0.75;
  font-size: 12px;
  bottom: -2px;
  left: 20px;
}
.tp {
  position: relative;
}
.option-status .option-status-label.label-tp {
  font-size: 11px;
  left: 18px;
}
.tp .status-label {
  align-self: flex-start;
  position: absolute;
  font-size: 11px;
  opacity: 0.75;
  right: -6px;
  top: 6px;
}
.operation-button {
  padding: 0 0.2rem;
}
</style>

<script lang="ts">
import Vue from 'vue';
import FleetDetail from '@/components/fleet/FleetDetail.vue';
import Fleet from '@/classes/fleet/fleet';

export default Vue.extend({
  name: 'FleetInfoHeader',
  components: {
    FleetDetail,
  },
  props: {
    value: {
      type: Fleet,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    unionFleet: {
      type: Fleet,
    },
    isUnion: {
      type: Boolean,
      default: false,
    },
    admiralLv: {
      type: Number,
      default: 120,
    },
  },
  data: () => ({
    detailDialog: false,
    destroyDialog: false,
    lastTab: 'status',
  }),
  mounted() {
    //
  },
  computed: {
    contactRate(): string {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return this.unionFleet.getContactRates(true)[0].sumRate.toFixed(1);
      }
      return this.value.getContactRates()[0].sumRate.toFixed(1);
    },
    nightContactRate(): string {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return (100 * this.unionFleet.nightContactRate).toFixed(1);
      }
      return (100 * this.value.nightContactRate).toFixed(1);
    },
    fleetScouts(): number[] {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return this.unionFleet.getUnionScoutScore(this.admiralLv).map((v) => Math.floor(100 * v) / 100);
      }
      return Fleet.getScoutScore(this.value.ships, this.admiralLv).map((v) => Math.floor(100 * v) / 100);
    },
    tpA(): number {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return Math.floor(this.unionFleet.tp * 0.7);
      }
      return Math.floor(this.value.tp * 0.7);
    },
    actualFleet(): Fleet {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return this.unionFleet;
      }
      return this.value;
    },
  },
  methods: {
    async clickedInfo() {
      this.destroyDialog = false;
      await (this.detailDialog = true);
      (this.$refs.fleetDetail as InstanceType<typeof FleetDetail>).tab = this.lastTab;
    },
    toggleDetailDialog() {
      if (!this.detailDialog) {
        this.lastTab = (this.$refs.fleetDetail as InstanceType<typeof FleetDetail>).tab;
        setTimeout(() => {
          this.destroyDialog = true;
        }, 100);
      } else {
        this.destroyDialog = false;
      }
    },
    closeDetail() {
      this.detailDialog = false;
      this.toggleDetailDialog();
    },
  },
});
</script>
