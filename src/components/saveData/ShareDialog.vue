<template>
  <v-card class="pa-2">
    <div class="d-flex pb-1 pr-2">
      <div class="align-self-center ml-3">編成共有</div>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider></v-divider>
    <div class="pa-4">
      <div class="my-8">
        <v-btn v-show="!createdURL" block color="teal" class="white--text" :loading="loadingURL" :disabled="loadingURL" @click="createURL">
          共有URLを生成
        </v-btn>
        <v-text-field
          id="createdURL"
          class="mt-0"
          v-show="createdURL"
          readonly
          dense
          append-icon="mdi-content-copy"
          v-model="createdURL"
          :hint="copiedURLHint"
          @click:append="copyURL"
          @blur="clearURLHint"
        ></v-text-field>
      </div>
      <div class="my-8">
        <v-btn
          block
          color="blue darken-3"
          class="white--text"
          style="text-transform: none"
          :disabled="!jervisDeckBuilder"
          :href="`https://kcjervis.github.io/jervis/?operation-json=${jervisDeckBuilder}`"
          target="_blank"
        >
          作戦室 Jervis ORで開く
        </v-btn>
      </div>
      <div class="my-8">
        <v-btn
          block
          color="success"
          :disabled="!deckBuilder"
          :href="`http://kancolle-calc.net/deckbuilder.html?predeck=${encodeURIComponent(deckBuilder)}`"
          target="_blank"
        >
          デッキビルダーで開く
        </v-btn>
      </div>
      <div class="mt-10">
        <v-textarea
          class="mt-0 no-scroll"
          readonly
          append-icon="mdi-content-copy"
          v-model="deckBuilder"
          no-resize
          rows="1"
          @click:append="copyDeckBuilder"
          @blur="clearDeckHint"
          label="デッキビルダー形式"
          id="deck-builder-text"
          :hint="copiedDeckHint"
        ></v-textarea>
      </div>
    </div>
  </v-card>
</template>

<style scoped></style>

<script lang="ts">
import Vue from 'vue';
import Convert from '@/classes/convert';
import SaveData from '@/classes/saveData/saveData';

export default Vue.extend({
  name: 'ShareDialog',
  props: {
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    loadingURL: false,
    createdURL: '',
    copiedURLHint: '',
    copiedDeckHint: '',
  }),
  computed: {
    deckBuilder(): string {
      const saveData = this.$store.state.mainSaveData as SaveData;
      if (!saveData) {
        return '';
      }
      const manager = saveData.tempData[saveData.tempIndex];
      if (!manager) {
        return '';
      }
      return Convert.createDeckBuilder(manager);
    },
    jervisDeckBuilder(): string {
      const saveData = this.$store.state.mainSaveData as SaveData;
      if (!saveData) {
        return '';
      }
      const manager = saveData.tempData[saveData.tempIndex];
      if (!manager) {
        return '';
      }
      return Convert.createDeckBuilderForJervis(saveData.name, manager);
    },
  },
  methods: {
    close() {
      this.handleClose();
    },
    createURL() {
      this.loadingURL = true;

      setTimeout(() => {
        this.loadingURL = false;
        this.createdURL = '工事中...';
      }, 100);
    },
    copyURL() {
      const textToCopy = document.getElementById('createdURL') as HTMLInputElement;
      textToCopy.select();
      document.execCommand('copy');
      this.copiedURLHint = 'URLがコピーされました。';
    },
    copyDeckBuilder() {
      const textToCopy = document.getElementById('deck-builder-text') as HTMLInputElement;
      textToCopy.select();
      document.execCommand('copy');
      this.copiedDeckHint = 'コピーされました。';
    },
    clearURLHint() {
      this.copiedURLHint = '';
    },
    clearDeckHint() {
      this.copiedDeckHint = '';
    },
  },
});
</script>
