<template>
  <div class="fleet-header">
    <div class="d-none d-sm-block d-capture">
      <div class="d-flex flex-wrap align-center">
        <!-- 制空 -->
        <div class="d-flex align-center">
          <div class="caption text--secondary">{{ $t("Common.制空") }}</div>
          <div class="ml-1 mr-2 body-2">{{ value.fullAirPower }}</div>
        </div>
        <!-- 触接 -->
        <div class="d-flex align-center">
          <div class="caption text--secondary">{{ $t("Fleet.触接") }}</div>
          <div class="ml-1 mr-2 body-2">{{ contactRate }}%</div>
        </div>
        <!-- 夜偵 -->
        <div class="d-flex align-center">
          <img :src="`./img/type/icon50.png`" height="24" width="24" alt="夜偵" />
          <div class="ml-1 mr-2 body-2">{{ nightContactRate }}%</div>
        </div>
        <!-- 索敵値 -->
        <div class="d-flex align-center justify-md-space-between flex-grow-1">
          <div class="option-status d-flex mr-1" v-for="(scout, i) in fleetScouts" :key="i">
            <img :src="`./img/type/icon11.png`" height="20" width="20" alt="係数" />
            <div class="option-status-label">{{ i + 1 }}</div>
            <div class="ml-2 body-2">{{ scout }}</div>
          </div>
        </div>
      </div>
      <div class="d-flex flex-wrap align-center">
        <!-- 速力 -->
        <div class="d-flex align-center" v-if="actualFleet.fleetSpeed">
          <div class="caption text--secondary">{{ $t("Common.速力") }}</div>
          <div class="ml-1 mr-2 caption">{{ $t(`Fleet.${actualFleet.fleetSpeed}`) }}{{ $t(`Fleet.艦隊`) }}</div>
        </div>
        <!-- TP -->
        <div class="mr-2 d-flex">
          <div class="option-status d-flex">
            <img :src="`./img/type/icon25.png`" height="24" width="24" alt="TP" />
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
        <!-- TP戦車 -->
        <div class="mr-2 d-flex">
          <div class="option-status d-flex">
            <img :src="`./img/type/icon36.png`" height="24" width="24" alt="TP" />
            <div class="option-status-label label-tp">TP</div>
            <div class="ml-2 body-2 align-self-center tp d-flex">
              <div>{{ actualFleet.tp2 }}</div>
              <div class="status-label">S</div>
            </div>
            <div class="ml-2 mr-1">/</div>
            <div class="body-2 align-self-center tp d-flex">
              <div>{{ tpA }}</div>
              <div class="status-label">A</div>
            </div>
          </div>
        </div>
        <!-- 煙幕 -->
        <div class="d-flex align-center">
          <div class="d-flex align-center mr-1" v-for="(rate, i) in fleetSmoke" :key="i">
            <img :src="`./img/type/smoke${i + 1}.png`" height="24" width="27" :alt="`${i + 1}重煙幕`" />
            <div class="body-2">{{ rate.toFixed(0) }}%</div>
          </div>
        </div>
      </div>
    </div>
    <div class="sp-header d-sm-none d-capture-none">
      <v-btn color="grey" @click="showTooltip = !showTooltip" block outlined>
        <v-icon>mdi-tooltip</v-icon>
        {{ $t("Fleet.艦隊情報") }}
      </v-btn>
      <v-btn color="primary" @click="clickedInfo" block outlined>
        <v-icon>mdi-information-outline</v-icon>
        {{ $t("Fleet.艦隊詳細") }}
      </v-btn>
      <v-dialog v-model="showTooltip" width="100%">
        <v-card class="pa-3">
          <div class="d-flex flex-wrap align-center">
            <!-- 制空 -->
            <div class="d-flex align-center">
              <div class="caption text--secondary">{{ $t("Common.制空") }}</div>
              <div class="ml-1 mr-2 body-2">{{ value.fullAirPower }}</div>
            </div>
            <!-- 触接 -->
            <div class="d-flex align-center">
              <div class="caption text--secondary">{{ $t("Fleet.触接") }}</div>
              <div class="ml-1 mr-2 body-2">{{ contactRate }}%</div>
            </div>
            <!-- 速力 -->
            <div class="d-flex align-center" v-if="actualFleet.fleetSpeed">
              <div class="caption text--secondary">{{ $t("Common.速力") }}</div>
              <div class="ml-1 mr-2 caption">{{ $t(`Fleet.${actualFleet.fleetSpeed}`) }}{{ $t(`Fleet.艦隊`) }}</div>
            </div>
          </div>
          <div class="d-flex align-center mt-3">
            <!-- 夜偵 -->
            <div class="d-flex align-center">
              <div><v-img :src="`./img/type/icon50.png`" height="24" width="24" /></div>
              <div class="ml-1 mr-2 body-2">{{ nightContactRate }}%</div>
            </div>
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
          </div>
          <!-- 煙幕 -->
          <div class="d-flex align-center mt-3">
            <div class="d-flex align-center mr-1" v-for="(rate, i) in fleetSmoke" :key="i">
              <v-img :src="`./img/type/smoke${i + 1}.png`" height="24" width="27" />
              <div class="body-2">{{ rate.toFixed(0) }}%</div>
            </div>
          </div>
          <!-- 索敵値 -->
          <div class="d-flex align-center justify-md-space-between flex-grow-1 mt-3">
            <div class="option-status d-flex mr-1" v-for="(scout, i) in fleetScouts" :key="i">
              <v-img :src="`./img/type/icon11.png`" height="20" width="20" />
              <div class="option-status-label">{{ i + 1 }}</div>
              <div class="ml-2 body-2">{{ scout }}</div>
            </div>
          </div>
        </v-card>
      </v-dialog>
    </div>
    <v-btn class="d-none d-sm-block d-capture-none ml-auto" color="primary" @click="clickedInfo" text>
      <v-icon>mdi-information-outline</v-icon>
      {{ $t("Fleet.艦隊詳細") }}
    </v-btn>
    <v-dialog v-model="detailDialog" transition="scroll-x-transition" width="880" @input="toggleDetailDialog" :fullscreen="isMobile">
      <fleet-detail v-if="!destroyDialog" :fleet="actualFleet" :index="index" :is-union="isUnion" ref="fleetDetail" :handle-close="closeDetail" />
    </v-dialog>
  </div>
</template>

<style scoped>
.fleet-header {
  flex-grow: 1;
}
@media (min-width: 600px) {
  .fleet-header {
    flex-grow: unset;
    display: flex;
    align-items: center;
  }
}

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

.sp-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 5px;
}
</style>

<style>
.captured .d-capture-none {
  display: none !important;
}
.captured .d-capture {
  display: block !important;
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
    showTooltip: false,
    isMobile: true,
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
    fleetSmoke(): number[] {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        // return Fleet.getSmokeTriggerRate(this.value.ships);
        return Fleet.getSmokeTriggerRate2(this.unionFleet.ships);
      }
      // return Fleet.getSmokeTriggerRate(this.value.ships);
      return Fleet.getSmokeTriggerRate2(this.value.ships);
    },
    tpA(): number {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return Math.floor(this.unionFleet.tp * 0.7);
      }
      return Math.floor(this.value.tp * 0.7);
    },
    tp2A(): number {
      if (this.isUnion && this.index <= 1 && this.unionFleet) {
        return Math.floor(this.unionFleet.tp2 * 0.7);
      }
      return Math.floor(this.value.tp2 * 0.7);
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
      this.isMobile = window.innerWidth < 600;
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
