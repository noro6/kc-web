<template>
  <v-card>
    <div class="d-flex pt-2 pb-1 pr-2">
      <div class="align-self-center ml-3">艦娘選択</div>
      <v-spacer></v-spacer>
      <div class="d-none d-sm-block mr-10">
        <v-btn depressed class="px-2" :class="{ info: !multiLine }" @click="changeMultiLine(false)">
          <v-icon>mdi-view-headline</v-icon>
          <span>一列</span>
        </v-btn>
        <v-btn depressed class="ml-2 px-2" :class="{ info: multiLine }" @click="changeMultiLine(true)">
          <v-icon>mdi-view-comfy</v-icon>
          <span>複数列</span>
        </v-btn>
      </div>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="d-flex px-5 pt-2">
      <div class="align-self-center ship-search-text">
        <v-text-field
          label="id 名称検索"
          v-model.trim="keyword"
          @input="filter()"
          clearable
          prepend-inner-icon="mdi-magnify"
        ></v-text-field>
      </div>
      <div class="ml-5 align-self-center">
        <v-checkbox v-model="isFinal" @change="filter()" label="最終改造"></v-checkbox>
      </div>
      <v-spacer></v-spacer>
    </div>
    <div class="d-flex flex-wrap mx-3">
      <div
        v-for="(i, index) in types"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: index === type, disabled: keyword }"
        @click="changeType(index)"
      >
        {{ i.text }}
      </div>
    </div>
    <v-divider class="ml-3" :class="{ 'mr-3': multiLine }"></v-divider>
    <div class="ship-table-body ml-3" :class="{ 'mr-3': multiLine }">
      <div :class="{ multi: multiLine }">
        <div v-if="!multiLine && ships.length" class="ship-status-header pr-3">
          <div class="ship-status" v-for="i in 5" :key="`slot${i}`">搭載{{ i }}</div>
        </div>
        <div
          v-ripple="{ class: 'info--text' }"
          v-for="(ship, i) in ships"
          :key="i"
          class="ship-list"
          :class="{ 'pr-3': !multiLine }"
          @click="clickedShip(ship)"
        >
          <div>
            <v-img :src="`./img/ship/${ship.albumId}.png`" height="30" width="120"></v-img>
          </div>
          <div class="flex-grow-1">
            <div class="ship-id primary--text">id:{{ ship.albumId }}</div>
            <div class="d-flex">
              <div class="ship-name text-truncate">{{ ship.name }}</div>
            </div>
          </div>
          <template v-if="!multiLine">
            <div class="ship-status" v-for="i in 5" :key="`ship_slot${i - 1}`">{{ ship.slots[i - 1] ? ship.slots[i - 1] : "" }}</div>
          </template>
        </div>
      </div>
      <div v-show="ships.length === 0" class="caption text-center mt-10">配備可能な艦娘が見つかりませんでした。</div>
    </div>
  </v-card>
</template>

<style scoped>
.ship-table-body {
  overflow-y: auto;
  height: 64vh;
}
.ship-search-text {
  width: 168px;
}

.type-selector {
  border: 1px solid transparent;
  padding: 0.5rem 0.6rem;
  font-size: 0.9em;
  cursor: pointer;
}
.type-selector:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.type-selector.active {
  border-color: rgba(33, 150, 243, 0.4);
  background-color: rgba(33, 150, 243, 0.1);
}
.type-selector.disabled {
  opacity: 0.4;
  background-color: transparent;
  pointer-events: none;
}

.multi {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 600px) {
  .multi {
    grid-template-columns: 1fr 1fr;
  }
}
@media (min-width: 880px) {
  .multi {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (min-width: 1100px) {
  .multi {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.ship-list {
  display: flex;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: 0.1s;
  border-radius: 0.2rem;
}
.ship-list:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.ship-list > div {
  align-self: center;
}
.ship-id {
  font-size: 11px;
  margin-left: 0.1rem;
}
.ship-name {
  flex-grow: 1;
  font-size: 0.8em;
  width: 10px;
  margin-left: 0.1rem;
  overflow: hidden;
  white-space: nowrap;
}

.ship-status-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  background-color: #f8f8f8;
  position: sticky;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5rem 0;
  z-index: 1;
  top: 0;
}
.theme--dark .ship-status-header {
  background-color: #333;
}
.ship-status {
  align-self: center;
  text-align: right;
  width: 10%;
  font-size: 0.8em;
}
.ship-status-header .ship-status {
  font-size: 11px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import ShipMaster from '@/classes/fleet/shipMaster';
import Const from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';

export default Vue.extend({
  name: 'ShipList',
  props: {
    handleDecideShip: {
      type: Function,
      required: true,
    },
    handleChangeWidth: {
      type: Function,
      required: true,
    },
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    all: [] as ShipMaster[],
    ships: [] as ShipMaster[],
    types: [] as { text: string; types: number[] }[],
    type: 0,
    isFinal: true,
    keyword: '',
    multiLine: true,
    setting: new SiteSetting(),
  }),
  mounted() {
    const existTypes: number[] = [];
    const ships = this.$store.state.ships as ShipMaster[];
    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];
      this.all.push(ship);
      if (!existTypes.includes(ship.type)) {
        existTypes.push(ship.type);
      }
    }
    for (let i = 0; i < Const.SHIP_TYPES_ALT.length; i += 1) {
      const data = Const.SHIP_TYPES_ALT[i];
      if (data.types.some((v) => existTypes.includes(v))) {
        this.types.push({ text: data.text, types: data.types });
      }
    }
    this.setting = this.$store.state.siteSetting as SiteSetting;
    this.changeMultiLine(this.setting.isMultiLineForShipList);
    this.filter();
  },
  methods: {
    changeType(index = 0) {
      this.type = index;
      this.filter();
    },
    filter() {
      const word = this.keyword;
      let result = this.all.concat();
      const t = this.types[this.type];

      // 検索語句あればこれ以外の検索はしない
      if (word) {
        result = result.filter((v) => v.albumId === +word || v.name.indexOf(word) >= 0);
      } else {
        if (this.isFinal) {
          // 最終改造状態ONLY
          result = result.filter((v) => v.isFinal);
        }
        // カテゴリ検索
        result = result.filter((v) => t.types.includes(v.type));
      }

      this.ships = result;
    },
    clickedShip(ship: ShipMaster) {
      this.handleDecideShip(ship);
    },
    close() {
      this.handleClose();
    },
    changeMultiLine(isMulti: boolean) {
      this.handleChangeWidth(isMulti ? 1200 : 700);
      this.multiLine = isMulti;
      // 設定書き換え
      this.setting.isMultiLineForItemList = isMulti;
      this.$store.dispatch('updateSetting', this.setting);
    },
  },
});
</script>
