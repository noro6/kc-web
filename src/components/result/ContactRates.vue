<template>
  <div class="ma-2">
    <div class="graph-area">
      <div class="align-self-center mx-auto">ぐらふ予定地</div>
    </div>
    <div class="mt-5">対敵通常艦隊</div>
    <div class="contact-row header-row">
      <div class="text-left">制空状態</div>
      <div>触接開始率</div>
      <div>&times;1.2触接率</div>
      <div>&times;1.17触接率</div>
      <div>&times;1.12触接率</div>
      <div>合計触接率</div>
    </div>
    <div class="contact-row" v-for="(data, i) in rates" :key="i">
      <div class="text-left">{{ airStatus[i] }}</div>
      <div>{{ data.startRate.toFixed(1) }} %</div>
      <div>{{ data.contact120.toFixed(1) }} %</div>
      <div>{{ data.contact117.toFixed(1) }} %</div>
      <div>{{ data.contact112.toFixed(1) }} %</div>
      <div>{{ data.sumRate.toFixed(1) }} %</div>
    </div>
    <div class="mt-5">対敵連合艦隊</div>
    <div class="contact-row header-row">
      <div class="text-left">制空状態</div>
      <div>触接開始率</div>
      <div>&times;1.2触接率</div>
      <div>&times;1.17触接率</div>
      <div>&times;1.12触接率</div>
      <div>合計触接率</div>
    </div>
    <div class="contact-row" v-for="(data, i) in unionRates" :key="i">
      <div class="text-left">{{ airStatus[i] }}</div>
      <div>{{ data.startRate.toFixed(1) }} %</div>
      <div>{{ data.contact120.toFixed(1) }} %</div>
      <div>{{ data.contact117.toFixed(1) }} %</div>
      <div>{{ data.contact112.toFixed(1) }} %</div>
      <div>{{ data.sumRate.toFixed(1) }} %</div>
    </div>
  </div>
</template>

<style scoped>
.graph-area {
  display: flex;
  text-align: center;
  height: 260px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 0.25rem;
}
.contact-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  text-align: right;
  padding: 0.1rem 0.5rem;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
}
.contact-row.header-row {
  border-top: 1px solid rgba(128, 128, 128, 0.4);
  border-bottom: 1px solid rgba(128, 128, 128, 0.4);
  background-color: rgba(128, 128, 128, 0.05);
  padding: 0.25rem 0.5rem;
  font-size: 0.8em;
}
.contact-row:not(.header):hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.contact-row > div {
  align-self: center;
  width: 16%;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Fleet from '@/classes/fleet/fleet';
import { ContactRate } from '@/classes/interfaces/contactRate';

export default Vue.extend({
  name: 'ContactRates',
  props: {
    fleet: {
      type: Fleet,
      required: true,
    },
  },
  data: () => ({
    airStatus: ['制空権確保', '航空優勢', '航空劣勢'],
  }),
  computed: {
    rates(): ContactRate[] {
      return this.fleet.getContactRates();
    },
    unionRates(): ContactRate[] {
      return this.fleet.getContactRates(true);
    },
  },
});
</script>
