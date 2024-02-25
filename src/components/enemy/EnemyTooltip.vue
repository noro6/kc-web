<template>
  <div class="py-1">
    <div class="d-flex">
      <div class="ml-1">
        <div class="d-flex">
          <div class="tooltip-item-text id">
            id <span class="font-weight-bold">{{ value.data.id }}</span>
          </div>
          <div class="ml-2 tooltip-item-text">
            {{ $t("Common.耐久") }} <span class="font-weight-bold">{{ value.data.hp }}</span>
          </div>
          <div class="ml-2 tooltip-item-text">
            {{ $t("Common.装甲") }} <span class="font-weight-bold">{{ value.data.armor }} ({{ armor }})</span>
          </div>
        </div>
        <div class="my-1">
          <div>{{ getEnemyName(value.data.name) }}</div>
        </div>
      </div>
    </div>
    <div>
      <div v-for="(item, i) in value.items" :key="i">
        <div class="d-flex">
          <div class="align-self-center item-slot" :class="{ 'orange--text text--darken-2': value.data.isUnknown }">
            <span class="font-weight-bold">{{ item.fullSlot }}</span
            >{{ value.data.isUnknown ? "?" : "" }}
          </div>
          <div>
            <v-img :src="`./img/type/icon${item.data.iconTypeId}.png`" height="30" width="30" />
          </div>
          <div class="ml-1 align-self-center tooltip-item-text id">
            id <span class="font-weight-bold">{{ item.data.id }}</span>
          </div>
          <div class="ml-1 align-self-center item-name">{{ needTrans ? $t(`${item.data.name}`) : item.data.name }}</div>
        </div>
      </div>
    </div>
    <template v-if="hasOASW || hasOpeningTorpedo || nightSpecialAttacks.length || value.antiAirCutIn.length || specialAttacks.length">
      <v-divider class="my-2" />
      <div class="ml-1 caption grey--text text--lighten-1 text-left">{{ $t("Fleet.特殊攻撃") }}</div>
      <div class="mx-1 d-flex flex-wrap mt-1 body-2">
        <div v-if="value.antiAirCutIn.length" class="mr-3 anti-air-cutin">{{ $t("Fleet.対空CI") }}</div>
        <div v-if="hasOASW" class="mr-3 light-blue--text text--lighten-2">{{ $t("Fleet.先制対潜") }}</div>
        <div v-if="hasOpeningTorpedo" class="mr-3 blue--text text--lighten-1">先制雷撃</div>
        <div v-for="text in specialAttacks" :key="`day${text}`" class="orange--text text--lighten-2 mr-3">{{ $t(`Fleet.${text}`) }}</div>
        <div v-for="text in nightSpecialAttacks" :key="`night${text}`" class="indigo--text text--lighten-3 mr-3">{{ $t(`Fleet.${text}`) }}</div>
      </div>
    </template>
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
  width: 30px;
  text-align: right;
  margin-right: 0.5rem;
  font-size: 0.95em;
}
.item-name {
  font-size: 13px;
  color: #ddd;
}
.anti-air-cutin {
  color: #55ff7a;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Enemy from '@/classes/enemy/enemy';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import SiteSetting from '@/classes/siteSetting';
import SpecialAttack from '@/classes/specialAttack';

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
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    hasOpeningTorpedo(): boolean {
      if (this.value.data.name.indexOf('深海日棲姫') >= 0) {
        return false;
      }
      return this.value.items.some((v) => v.data.apiTypeId === 22) || (this.value.isSubmarine && this.value.level >= 10);
    },
    hasOASW(): boolean {
      return (
        (this.value.data.type === 7 && this.value.items.some((v) => [1574, 1575, 1586].includes(v.data.id)))
        || [1623, 1624, 1862, 1690, 1691, 1692, 1849, 1850, 1851, 1927, 1928, 1929, 1930, 1931, 1932, 1947].includes(this.value.data.id)
      );
    },
    specialAttacks(): string[] {
      return SpecialAttack.getDayBattleSpecialAttackRate(this.value, 1, false).map((v) => v.text);
    },
    nightSpecialAttacks(): string[] {
      return SpecialAttack.getNightBattleSpecialAttackRate(this.value, false).map((v) => v.text);
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
