<template>
  <div class="item-input">
    <v-menu offset-y :close-on-content-click="false" transition="slide-y-transition" bottom right>
      <template v-slot:activator="{ on, attrs }">
        <div v-ripple v-bind="attrs" v-on="on" class="item-slot">
          {{ item.slot }}
        </div>
      </template>
      <v-card class="px-5 py-1">
        <div class="d-flex pl-1 pr-2">
          <v-text-field
            class="slot-input"
            type="number"
            max="99"
            min="0"
            v-model="slot"
          ></v-text-field>
          <v-btn depressed class="ml-2 align-self-center" @click="slot = fullSlot"
            >初期値</v-btn
          >
        </div>
        <v-slider max="99" min="0" v-model="slot"></v-slider>
      </v-card>
    </v-menu>
    <!-- 装備名称 -->
    <div v-ripple class="item-name" @click="showItemList()">
      {{ item.name ? item.name : "装備を選択" }}
    </div>
    <!-- 改修値 -->
    <v-menu offset-y transition="slide-y-transition" bottom right>
      <template v-slot:activator="{ on, attrs }">
        <div v-ripple class="item-remodel" v-bind="attrs" v-on="on">
          <v-icon small color="teal accent-4">mdi-star</v-icon>
          <span class="teal--text text--accent-4">{{ item.remodel }}</span>
        </div>
      </template>
      <v-list>
        <v-list-item-group color="primary">
          <v-list-item v-for="i in 11" :key="i" @click="item.remodel = i - 1">
            <v-list-item-content>
              <v-list-item-title>
                <v-icon small color="teal accent-4">mdi-star</v-icon>
                <span class="teal--text text--accent-4">+{{ i - 1 }}</span>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
    <!-- 熟練度 -->
    <v-menu offset-y :close-on-content-click="false" transition="slide-y-transition" bottom right>
      <template v-slot:activator="{ on, attrs }">
        <div v-ripple class="item-level" v-bind="attrs" v-on="on">
          {{ level }}
        </div>
      </template>
      <v-card class="px-5 py-1">
        <div class="d-flex pl-1 pr-2">
          <v-text-field
            class="level-input"
            type="number"
            max="120"
            min="0"
            v-model="item.level"
          ></v-text-field>
        </div>
        <v-slider max="120" min="0" v-model="item.level"></v-slider>
      </v-card>
    </v-menu>
    <!-- 解除 -->
    <v-btn icon small @click="removeItem()">
      <v-icon small>mdi-close</v-icon>
    </v-btn>
  </div>
</template>

<style scoped>
.item-input {
  display: flex;
  margin: 0.2rem 0.1rem;
}
.item-input > div {
  align-self: center;
}
.item-slot {
  text-align: right;
  padding-right: 6px;
  width: 36px;
}
.item-name {
  cursor: pointer;
  width: 180px;
}
.item-remodel {
  width: 38px;
}
.item-level {
  width: 24px;
  text-align: center;
}
.slot-input,
.level-input {
  width: 120px;
}
.v-list-item {
  min-height: 28px;
  height: 28px;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Item from '@/classes/Item';

export default Vue.extend({
  name: 'ItemInput',
  props: {
    handleShowItemList: {
      type: Function,
      required: true,
    },
    item: {
      type: Item,
      required: true,
    },
  },
  data: () => ({
    slot: 0,
    fullSlot: 18,
  }),
  computed: {
    level() {
      const { level } = this.item;
      if (level < 10) {
        return '';
      }
      if (level < 25) {
        return '|';
      }
      if (level < 40) {
        return '||';
      }
      if (level < 55) {
        return '|||';
      }
      if (level < 70) {
        return '\\';
      }
      if (level < 85) {
        return '\\\\';
      }
      if (level < 100) {
        return '\\\\\\';
      }
      return '>>';
    },
  },
  methods: {
    removeItem() {
      this.item.clear();
      console.log(this.$store.state.todos);
    },
    showItemList() {
      this.handleShowItemList();
    },
  },
});
</script>
