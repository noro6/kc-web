<template>
  <v-card>
    <div class="d-flex pa-2">
      <div class="item-search-text">
        <v-text-field
          :placeholder="$t('ItemList.図鑑id 名称検索')"
          clearable
          v-model="keyword"
          @input="filter()"
          hide-details
          dense
          prepend-inner-icon="mdi-magnify"
        />
      </div>
      <v-checkbox class="ml-3" :disabled="!!keyword" v-model="bookmarkOnly" @change="filter()" hide-details dense :label="$t('Fleet.お気に入り')" />
      <v-checkbox class="ml-3" :disabled="!!keyword" v-model="finalOnly" @change="filter()" hide-details dense :label="$t('Fleet.最終改造')" />
      <v-spacer />
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <div class="d-flex flex-wrap pl-2">
      <div
        v-for="(i, index) in types"
        :key="index"
        v-ripple="{ class: 'info--text' }"
        class="type-selector"
        :class="{ active: index === type, disabled: keyword || bookmarkOnly }"
        @click="changeType(index)"
        @keypress="changeType(index)"
        tabindex="0"
      >
        {{ isNotJapanese ? $t(`SType.${i.text}`) : i.text }}
      </div>
    </div>
    <v-divider class="mx-2" />
    <div class="ship-table-body mx-2">
      <div v-for="(typeData, i) in ships" :key="i" class="pl-3">
        <div class="type-divider">
          <div class="caption text--secondary">{{ getShipTypeName(typeData.typeName) }}</div>
          <div class="type-divider-border" />
        </div>
        <div class="multi">
          <div
            v-for="(ship, j) in typeData.ships"
            :key="j"
            class="ship-list pr-3 align-center"
            :class="{ bookmarked: ship.isBookmarked }"
            v-ripple="{ class: 'red--text' }"
            @click="toggleBookmark(ship)"
            @keypress.enter="toggleBookmark(ship)"
            tabindex="0"
          >
            <div>
              <v-img :src="`./img/ship/${ship.data.id}.png`" height="30" width="120" />
            </div>
            <div class="bookmarked-icon" v-if="ship.isBookmarked"><v-icon color="pink lighten-2" small>mdi-heart</v-icon></div>
            <div class="flex-grow-1 ml-1">
              <div class="d-flex ship-caption">
                <div class="primary--text ship-level mr-1">id {{ ship.data.id }}</div>
              </div>
              <div class="d-flex">
                <div class="ship-name text-truncate">{{ getShipName(ship.data) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-divider />
    <div class="d-flex px-3 py-3">
      <v-spacer />
      <v-btn color="secondary" :dark="existsBookmark" :disabled="!existsBookmark" @click.stop="removeAll()">
        {{ $t("Fleet.全解除") }}
      </v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.item-search-text {
  width: 180px;
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
.type-all-text {
  width: 32px;
  text-align: center;
  font-weight: bold;
  font-size: 0.9em;
  align-self: center;
}
.type-divider {
  margin-top: 1rem;
  display: flex;
  width: 100%;
}
.type-divider-border {
  margin-left: 1rem;
  align-self: center;
  flex-grow: 1;
  border-top: 1px solid rgba(128, 128, 128, 0.4);
}

.ship-table-body {
  overflow-y: auto;
  height: 64vh;
  overscroll-behavior: contain;
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
  padding: 0.15rem 0.3rem;
  margin-right: 1px;
  margin-bottom: 1px;
  transition: 0.1s;
  border-radius: 0.2rem;
  border: 1px solid transparent;
  position: relative;
}
.ship-list:hover {
  background-color: rgba(128, 128, 128, 0.1);
}
.ship-list.bookmarked {
  border-color: rgba(255, 128, 128, 0.8);
}
.ship-list.bookmarked:hover {
  background-color: rgba(255, 128, 128, 0.1);
}
.bookmarked-icon {
  position: absolute;
  right: 0px;
  top: -4px;
}
.ship-caption {
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
import Airbase from '@/classes/airbase/airbase';
import Enemy from '@/classes/enemy/enemy';
import Ship from '@/classes/fleet/ship';
import SiteSetting from '@/classes/siteSetting';
import Const from '@/classes/const';
import Convert from '@/classes/convert';
import ShipMaster from '../../classes/fleet/shipMaster';

export default Vue.extend({
  name: 'ShipBookmarkEdit',
  props: {
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    itemParent: undefined as undefined | Ship | Airbase | Enemy,
    all: [] as ShipMaster[],
    types: [] as { text: string; types: number[] }[],
    type: 0,
    ships: [] as { typeName: string; ships: { data: ShipMaster; isBookmarked: boolean }[] }[],
    keyword: '' as string | undefined,
    bookmarkOnly: false,
    finalOnly: true,
    bookmarks: [] as number[],
  }),
  mounted() {
    const setting = this.$store.state.siteSetting as SiteSetting;
    this.bookmarks = setting.bookmarkedShipIds.concat();
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
    this.all.sort((a, b) => a.sort - b.sort);
    this.filter();
  },
  computed: {
    isNotJapanese(): boolean {
      return this.$i18n.locale !== 'ja';
    },
    needTrans(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return this.$i18n.locale !== 'ja' && !setting.nameIsNotTranslate;
    },
    existsBookmark(): boolean {
      const setting = this.$store.state.siteSetting as SiteSetting;
      return !!setting.bookmarkedShipIds.length;
    },
  },
  methods: {
    changeType(index = 0) {
      this.type = index;
      this.filter();
    },
    filter() {
      this.ships = [];
      let result = [];

      const word = this.keyword ? this.keyword.toUpperCase() : '';
      if (word) {
        result = this.all.filter((v) => v.id === +word || v.name.toUpperCase().indexOf(word) >= 0);
      } else if (this.bookmarkOnly) {
        result = this.all.filter((v) => this.bookmarks.includes(v.id));
      } else {
        const t = this.types[this.type];
        result = this.all.filter((v) => t.types.includes(v.type));

        if (this.finalOnly) {
          result = result.filter((v) => v.isFinal);
        }
      }

      const tempShips = [];
      for (let i = 0; i < result.length; i += 1) {
        const data = result[i];
        tempShips.push({ data, isBookmarked: this.bookmarks.includes(data.id) });
      }

      // 艦型に応じて分けたい
      const altTypes = Const.SHIP_TYPES_ALT_INFO;
      const resultShips = [];

      for (let i = 0; i < altTypes.length; i += 1) {
        const type = altTypes[i];
        const ships = tempShips.filter((v) => v.data.type2 === type.id);
        if (ships.length) {
          // 母港ソート
          ships.sort((a, b) => a.data.sort - b.data.sort);
          // 存在する艦型を生成
          resultShips.push({ typeName: type.name, ships });
        }
      }

      this.ships = resultShips;
    },
    toggleBookmark(ship: { data: ShipMaster; isBookmarked: boolean }) {
      // ブックマークの更新
      const setting = this.$store.state.siteSetting as SiteSetting;
      ship.isBookmarked = !ship.isBookmarked;

      if (ship.isBookmarked) {
        setting.bookmarkedShipIds.push(ship.data.id);
      } else {
        setting.bookmarkedShipIds = setting.bookmarkedShipIds.filter((v) => v !== ship.data.id);
      }
      this.bookmarks = setting.bookmarkedShipIds.concat();
      this.$store.dispatch('updateSetting', setting);
    },
    close() {
      this.handleClose();
    },
    removeAll() {
      // ブックマーク全解除
      const setting = this.$store.state.siteSetting as SiteSetting;
      setting.bookmarkedShipIds = [];
      this.bookmarks = [];
      this.bookmarkOnly = false;
      this.$store.dispatch('updateSetting', setting);

      this.filter();
    },
    translate(v: string): string {
      return v ? `${this.$t(v)}` : '';
    },
    getShipName(ship: ShipMaster) {
      if (this.needTrans) {
        const shipName = ShipMaster.getSuffix(ship);
        return `${shipName.map((v) => this.translate(v)).join('')}`;
      }
      return ship.name || '';
    },
    getShipTypeName(name: string): string {
      if (this.isNotJapanese) {
        const array = Convert.getShipTypeNameArray(name);
        return `${array.map((v) => this.translate(v)).join('')}`;
      }

      return name;
    },
  },
});
</script>
