<template>
  <div class="py-2">
    <div class="d-flex">
      <div class="data-name">{{ value.name }}</div>
      <div class="ml-auto edited-date" v-if="editDate">更新日時: {{ editDate }}</div>
    </div>
    <template v-if="!value.isDirectory">
      <div v-if="ships1.length" class="mb-2">
        <v-divider class="mb-2"></v-divider>
        <div class="caption info--text">第1艦隊</div>
        <div class="d-flex">
          <div v-for="(ship, i) in ships1" :key="`ship1_${i}`">
            <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120"></v-img>
          </div>
        </div>
      </div>
      <div v-if="ships2.length" class="mb-2">
        <v-divider class="mb-2"></v-divider>
        <div class="caption success--text">第2艦隊</div>
        <div class="d-flex">
          <div v-for="(ship, i) in ships2" :key="`ship2_${i}`">
            <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120"></v-img>
          </div>
        </div>
      </div>
      <div class="remarks mt-2" v-if="value.remarks">{{ value.remarks }}</div>
    </template>
  </div>
</template>

<style scoped>
.data-name {
  min-width: 200px;
  margin-right: 2rem;
}
.remarks {
  border: 1px solid #444;
  border-radius: 0.2rem;
  padding: 0.5rem;
  font-size: 0.9em;
  white-space: pre-line;
}
.edited-date {
  font-size: 0.75em;
  opacity: 0.8;
}
</style>

<script lang="ts">
import Vue from 'vue';
import SaveData from '@/classes/saveData/saveData';
import Convert from '@/classes/convert';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import Ship from '@/classes/fleet/ship';
import ItemMaster from '@/classes/item/itemMaster';

export default Vue.extend({
  name: 'SaveDataTooltip',
  props: {
    value: {
      type: SaveData,
      required: true,
    },
  },
  data: () => ({
    ships1: [] as Ship[],
    ships2: [] as Ship[],
  }),
  computed: {
    editDate(): string {
      if (this.value.editedDate) {
        return Convert.formatDate(new Date(this.value.editedDate), 'yyyy/MM/dd HH:mm:ss');
      }
      return '';
    },
  },
  mounted() {
    if (!this.value.isDirectory) {
      // 編成復帰
      const items = this.$store.state.items as ItemMaster[];
      const ships = this.$store.state.ships as ShipMaster[];
      const enemies = this.$store.state.enemies as EnemyMaster[];
      const manager = this.value.loadManagerData(items, ships, enemies);

      this.ships1 = manager.fleetInfo.fleets[0].ships.filter((v) => v.data.id > 0);
      if (manager.fleetInfo.isUnion) {
        this.ships2 = manager.fleetInfo.fleets[1].ships.filter((v) => v.data.id > 0);
      }
    }
  },
});
</script>
