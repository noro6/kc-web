<template>
  <div class="py-1">
    <div class="d-flex">
      <div class="ml-1">
        <div class="d-flex">
          <div class="tooltip-item-text id">id:{{ value.data.id }}</div>
          <div class="ml-2 tooltip-item-text">{{ $t("Common.耐久") }}: {{ value.data.hp }}</div>
          <div class="ml-2 tooltip-item-text">{{ $t("Common.装甲") }}: {{ value.data.armor }} ({{ armor }})</div>
        </div>
        <div class="d-flex my-1">
          <div>{{ getEnemyName(value.data.name) }}</div>
          <v-spacer></v-spacer>
          <div v-if="value.antiAirCutIn.length" class="ml-3 anti-air-cutin">対空CI発動可能</div>
        </div>
      </div>
    </div>
    <div>
      <div v-for="(item, i) in value.items" :key="i">
        <div class="d-flex">
          <div class="align-self-center item-slot">{{ item.fullSlot }}</div>
          <div>
            <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="30" width="30"></v-img>
          </div>
          <div class="ml-1 align-self-center tooltip-item-text id">id:{{ item.data.id }}</div>
          <div class="ml-1 align-self-center item-name">{{ needTrans ? $t(`${item.data.name}`) : item.data.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tooltip-item-text {
  font-size: 12px;
  height: 20px;
  color: #ddd;
}
.tooltip-item-text.id {
  color: #60c5ff;
}
.item-slot {
  width: 24px;
  text-align: right;
  color: #ddd;
  margin-right: 0.5rem;
  font-size: 0.95em;
}
.item-name {
  font-size: 13px;
  color: #ddd;
}
.anti-air-cutin {
  color: #55ff7a;
  font-size: 12px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';

export default Vue.extend({
  name: 'EnemyTooltip',
  props: {
    value: {
      type: Enemy,
      required: true,
    },
  },
  computed: {
    armor(): number {
      let sum = 0;
      for (let i = 0; i < this.value.items.length; i += 1) {
        sum += this.value.items[i].data.armor;
      }

      return this.value.data.armor + sum;
    },
    needTrans(): boolean {
      return this.$i18n.locale !== 'ja';
    },
  },
  methods: {
    getEnemyName(name: string): string {
      if (name && this.needTrans) {
        const shipName = EnemyMaster.getSuffix(name);
        const trans = (v: string) => (v ? `${this.$t(v)}` : '');
        return shipName.map((v) => trans(v)).join('');
      }
      return name || '';
    },
  },
});
</script>
