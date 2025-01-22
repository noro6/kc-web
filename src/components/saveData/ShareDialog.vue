<template>
  <v-card class="pa-2">
    <div class="d-flex pb-1 pr-2">
      <div class="align-self-center ml-3">{{ $t("Common.編成共有") }}</div>
      <v-spacer />
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <v-divider />
    <div class="pa-4">
      <div class="mb-6 mt-4">
        <v-btn v-show="!createdURL" block color="teal" class="white--text" :loading="loadingURL" :disabled="loadingURL" @click="createURL()">
          <v-icon>mdi-web</v-icon>{{ $t("SaveData.共有URLを生成") }}
        </v-btn>
        <v-text-field
          id="createdURL"
          class="mt-0 ml-1"
          v-show="createdURL"
          readonly
          dense
          append-icon="mdi-content-copy"
          v-model="createdURL"
          :hint="copiedURLHint ? $t(`Common.${copiedURLHint}`) : copiedURLHint"
          @click:append="copyURL"
          @blur="clearURLHint"
        />
      </div>
      <div class="my-6">
        <v-btn block color="blue" class="white--text" @click="shareTwitter()" :loading="loadingTwitter" :disabled="loadingTwitter">
          <v-icon>mdi-twitter</v-icon>{{ $t("SaveData.Twitterで共有") }}
        </v-btn>
      </div>
      <div class="my-6">
        <v-btn
          block
          color="indigo"
          class="white--text"
          :disabled="!deckBuilder"
          :href="`https://jervis.vercel.app/?predeck=${encodeURIComponent(deckBuilder)}`"
          target="_blank"
        >
          <v-icon>mdi-anchor</v-icon>{{ $t("SaveData.作戦室で開く") }}
        </v-btn>
      </div>
      <div class="my-6">
        <v-btn
          block
          color="orange lighten-4"
          light
          :disabled="!compressFleetOnlyDeckBuilder"
          :href="`https://x-20a.github.io/compass/?pdz=${encodeURIComponent(compressFleetOnlyDeckBuilder)}`"
          target="_blank"
        >
          <v-icon>mdi-compass-outline</v-icon>{{ $t("SaveData.羅針盤シミュで開く") }}
        </v-btn>
      </div>
      <div class="my-6" v-if="saveData && !saveData.isUnsaved">
        <v-btn block color="deep-purple" class="white--text" :disabled="!saveData || saveData.isUnsaved" @click="showUploadDialog">
          <v-icon>mdi-upload</v-icon>{{ $t("Common.編成アップロード") }}
        </v-btn>
      </div>
      <div class="my-6">
        <v-btn
          block
          :dark="!!deckBuilder"
          color="deep-purple darken-3"
          :disabled="!deckBuilder"
          :href="`http://kancolle-calc.net/deckbuilder.html?predeck=${encodeURIComponent(deckBuilder)}`"
          target="_blank"
        >
          {{ $t("SaveData.デッキビルダーで開く") }}
        </v-btn>
      </div>
      <v-divider />
      <div class="mt-6">
        <v-textarea
          class="mt-0 no-scroll"
          outlined
          readonly
          append-icon="mdi-content-copy"
          v-model="deckBuilder"
          no-resize
          rows="1"
          @click:append="copyDeckBuilder"
          @blur="clearDeckHint"
          :label="$t('Home.デッキビルダー形式データ')"
          id="deck-builder-text"
          :hint="copiedDeckHint ? $t(`Common.${copiedDeckHint}`) : ''"
        />
      </div>
    </div>

    <v-dialog v-model="uploadDialog" width="800">
      <v-card class="px-3 pt-2 pb-6" v-if="saveData">
        <upload-save-data
          ref="uploadSaveDataComp"
          @inform="inform"
          :dataName="dataName"
          :dataRemarks="dataRemarks"
          :saveData="saveData"
          :cancelDialog="closeEditDialog"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import UploadSaveData from '@/components/saveData/UploadSaveData.vue';
import Convert from '@/classes/convert';
import SaveData from '@/classes/saveData/saveData';
import FirebaseManager from '@/classes/firebaseManager';
import LZString from 'lz-string';

export default Vue.extend({
  name: 'ShareDialog',
  components: { UploadSaveData },
  props: {
    handleClose: {
      type: Function,
      required: true,
    },
  },
  data: () => ({
    loadingURL: false,
    loadingTwitter: false,
    createdURL: '',
    copiedURLHint: '',
    copiedDeckHint: '',
    uploadDialog: false,
    dataName: '',
    dataRemarks: '',
  }),
  computed: {
    saveData(): SaveData | undefined {
      const saveData = this.$store.state.mainSaveData as SaveData;
      if (!saveData) {
        return undefined;
      }
      return saveData;
    },
    deckBuilder(): string {
      const saveData = this.$store.state.mainSaveData as SaveData;
      if (!saveData) {
        return '';
      }
      const manager = saveData.tempData[saveData.tempIndex];
      if (!manager) {
        return '';
      }
      return Convert.createDeckBuilderToString(manager, this.$store.state.cellInfos);
    },
    compressFleetOnlyDeckBuilder() {
      const saveData = this.$store.state.mainSaveData as SaveData;
      if (!saveData) {
        return '';
      }
      const manager = saveData.tempData[saveData.tempIndex];
      if (!manager) {
        return '';
      }
      const deck = Convert.createDeckBuilder(manager, this.$store.state.cellInfos);
      delete deck.a1;
      delete deck.a2;
      delete deck.a3;
      delete deck.s;
      return LZString.compressToEncodedURIComponent(JSON.stringify(deck));
    },
  },
  methods: {
    inform(message: string, isError: boolean) {
      return this.$emit('inform', message, isError);
    },
    close() {
      this.handleClose();
    },
    createURL() {
      this.loadingURL = true;
      const url = this.getLongSaveDataURL();
      // URL取得要求
      FirebaseManager.getShortURL(url).then((shortUrl) => {
        if (shortUrl) {
          this.createdURL = shortUrl;
        } else {
          this.createdURL = 'URLの発行に失敗しました。';
        }
        this.loadingURL = false;
      });
    },
    shareTwitter() {
      this.loadingTwitter = true;
      const url = this.getLongSaveDataURL();
      // URL取得要求
      FirebaseManager.getShortURL(url).then((shortUrl) => {
        if (shortUrl) {
          window.open(`https://twitter.com/share?url=${shortUrl}`);
          this.loadingTwitter = false;
        }
      });
    },
    copyURL() {
      const textToCopy = document.getElementById('createdURL') as HTMLInputElement;
      textToCopy.select();
      document.execCommand('copy');
      this.copiedURLHint = 'コピーされました。';
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
    getLongSaveDataURL(): string {
      const saveData = this.$store.state.mainSaveData as SaveData;
      if (!saveData || !saveData.tempData[saveData.tempIndex]) {
        return '';
      }
      const data = saveData.createURLSaveDataString();
      if (data) {
        return `${document.location.protocol}//${document.location.host}${document.location.pathname}?data=${data}`;
      }
      return '';
    },
    async showUploadDialog() {
      if (this.saveData) {
        this.dataName = this.saveData.name.trim();
        this.dataRemarks = this.saveData.remarks ? this.saveData.remarks.trim() : '';
        await (this.uploadDialog = true);
        const form = this.$refs.uploadSaveDataComp as InstanceType<typeof UploadSaveData>;
        if (form) {
          form.initControl();
        }
      }
    },
    closeEditDialog() {
      this.uploadDialog = false;
    },
  },
});
</script>
