<template>
  <div>
    <v-card>
      <div class="d-flex px-5 pt-2">
        <div class="align-self-center">
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
        <div class="align-self-center d-none d-sm-block">
          <v-btn depressed :class="{ info: !multiLine }" @click="multiLine = false">
            <v-icon>mdi-view-headline</v-icon>
            <span>一列</span>
          </v-btn>
          <v-btn depressed class="ml-2" :class="{ info: multiLine }" @click="multiLine = true">
            <v-icon>mdi-view-comfy</v-icon>
            <span>複数列</span>
          </v-btn>
        </div>
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
      <v-divider></v-divider>
      <div class="ship-table-body">
        <div class="pa-3" :class="{ multi: multiLine }">
          <div v-ripple="{ class: 'info--text' }" v-for="(ship, i) in ships" :key="i" class="ship-list" @click="clickedShip(ship)">
            <div>
              <v-img :src="`./img/ship/${ship.albumId}.png`" height="30" width="120"></v-img>
            </div>
            <div class="flex-grow-1">
              <div class="ship-id primary--text">id:{{ ship.albumId }}</div>
              <div class="d-flex">
                <div class="ship-name text-truncate">{{ ship.name }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.ship-table-body {
  overflow-y: scroll;
  height: 64vh;
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
</style>

<script lang="ts">
import Vue from 'vue';
import ShipMaster from '@/classes/fleet/shipMaster';
import Const from '@/classes/const';

export default Vue.extend({
  name: 'ShipList',
  props: {
    handleDecideShip: {
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
  },
});
</script>
