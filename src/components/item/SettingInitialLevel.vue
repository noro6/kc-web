<template>
  <v-menu offset-y transition="slide-y-transition" left>
    <template v-slot:activator="{ on, attrs }">
      <div class="level-setting-container" v-bind="attrs" v-on="on" v-ripple="{ class: 'info--text' }">
        <template v-if="index >= 0">
          <div>
            <v-img :src="`./img/type/type${typeId}.png`" height="30" width="30"></v-img>
          </div>
          <div class="ml-1 item-name text-truncate">{{ typeName }}</div>
          <div class="item-level">
            <v-img :src="`./img/util/prof${levelValue}.png`" height="24" width="18"></v-img>
            <span class="level-value">{{ level }}</span>
          </div>
        </template>
        <template v-else>
          <div class="mx-auto">一括変更</div>
        </template>
      </div>
    </template>
    <v-card>
      <div class="d-flex">
        <div v-for="i in 9" :key="i - 1" v-ripple="{ class: 'info--text' }" class="level-list-item" @click="setLevel(i - 1)">
          <v-img :src="`./img/util/prof${i - 1}.png`" width="18" height="24"></v-img>
          <span class="level-list-value">{{ getLevelValue(i - 1) }}</span>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<style scoped>
.level-setting-container {
  display: flex;
  margin: 0 0.2rem;
  padding: 0 1rem 0 0.5rem;
  border-bottom: 1px solid rgba(128, 128, 128, 0.4);
}
.level-setting-container > div {
  align-self: center;
}
.level-setting-container:hover {
  background-color: rgba(0, 164, 255, 0.1);
}

.item-name {
  width: 60px;
  flex-grow: 1;
  font-size: 0.8em;
}
.item-level {
  position: relative;
  transition: 0.3s ease-out;
}
.item-level:hover {
  filter: drop-shadow(0 0 2px #ccc);
}
.theme--dark .item-level:hover {
  filter: drop-shadow(0 0 2px #fff);
}
.level-list-item {
  padding: 0.5rem 0.75rem;
  transition: 0.2s;
  cursor: pointer;
  position: relative;
}
.level-list-item:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.level-value,
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
.theme--dark .level-value,
.theme--dark .level-list-value {
  text-shadow: 1px 1px 1px #000, -1px -1px 1px #000, -1px 1px 1px #000, 1px -1px 1px #000, 1px 0px 1px #000, -1px -0px 1px #000,
    0px 1px 1px #000, 0px -1px 1px #000;
}
.level-value {
  text-align: left;
  font-size: 0.7em;
  font-weight: 600;
  bottom: -4px;
  transition: 0.2s;
  left: 10px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Const from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'ItemInput',
  props: {
    index: {
      type: Number,
      required: true,
    },
    setting: {
      type: SiteSetting,
      required: true,
    },
  },
  data: () => ({
    allLevel: 0,
  }),
  computed: {
    typeName(): string {
      if (this.index >= 0) {
        const typeId = this.setting.planeInitialLevels[this.index].id;
        const type = Const.ITEM_API_TYPE.find((v) => v.id === typeId);
        return type ? type.name : '';
      }
      return '一括変更';
    },
    typeId(): number {
      return this.index >= 0 ? this.setting.planeInitialLevels[this.index].id : 0;
    },
    level(): number {
      return this.index >= 0 ? this.setting.planeInitialLevels[this.index].level : this.allLevel;
    },
    levelValue(): number {
      const lv = this.index >= 0 ? this.setting.planeInitialLevels[this.index].level : this.allLevel;
      if (lv < 10) {
        return 0;
      }
      if (lv < 25) {
        return 1;
      }
      if (lv < 40) {
        return 2;
      }
      if (lv < 55) {
        return 3;
      }
      if (lv < 70) {
        return 4;
      }
      if (lv < 85) {
        return 5;
      }
      if (lv < 100) {
        return 6;
      }
      return 7;
    },
  },
  methods: {
    setLevel(value: number) {
      if (this.index >= 0) {
        this.setting.planeInitialLevels[this.index].level = Const.PROF_LEVEL_BORDER[value];
      } else {
        // 一括
        for (let i = 0; i < this.setting.planeInitialLevels.length; i += 1) {
          this.setting.planeInitialLevels[i].level = Const.PROF_LEVEL_BORDER[value];
        }
      }
    },
    getLevelValue(value: number) {
      return Const.PROF_LEVEL_BORDER[value];
    },
  },
});
</script>
