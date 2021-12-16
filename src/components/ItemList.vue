<template>
  <div class="item-list">
    <v-card>
      <div class="d-flex px-5 pt-2">
        <div class="align-self-center">
          <v-text-field label="id, 名称検索" prepend-inner-icon="mdi-magnify"></v-text-field>
        </div>
        <v-spacer></v-spacer>
        <div class="align-self-center">
          <v-btn depressed :class="{ primary: !multiLine }" @click="multiLine = false">
            <v-icon>mdi-view-headline</v-icon>
            <span>一列</span>
          </v-btn>
          <v-btn depressed class="ml-2" :class="{ primary: multiLine }" @click="multiLine = true">
            <v-icon>mdi-view-comfy</v-icon>
            <span>複数列</span>
          </v-btn>
        </div>
      </div>
      <v-divider></v-divider>
      <div :class="{ 'd-flex flex-wrap': multiLine }">
        <div v-ripple v-for="(item, i) in items" :key="i" class="list-item">
          <div>{{ item.id }}</div>
          <div>{{ item.name }}</div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.list-item {
  display: flex;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}
.list-item:hover {
  border-color: #ddd;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Item from '@/classes/Item';

export default Vue.extend({
  name: 'ItemList',
  data: () => ({
    items: [] as Item[],
    multiLine: false,
  }),
  mounted() {
    for (let i = 0; i < 20; i += 1) {
      const item = new Item();
      item.id = i;
      item.name = `新規データ${Math.floor(Math.random() * 100)}`;
      item.slot = Math.floor(Math.random() * 46);
      item.remodel = Math.floor(Math.random() * 11);
      item.level = Math.floor(Math.random() * 121);
      this.items.push(item);
    }

    console.log('itemlist initialized!');
  },
  methods: {},
});
</script>
