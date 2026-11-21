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
      <section class="share-section share-section-main">
        <div class="section-title">
          <v-icon small color="teal lighten-2" class="mr-1">mdi-link-variant</v-icon>{{ $t("SaveData.共有URL") }}
        </div>
        <div class="section-description">{{ $t("SaveData.このサイトで編成を開けるURLを発行します。") }}</div>
        <v-checkbox v-model="includeRemarks" class="mt-2 pt-0" dense hide-details :label="$t('SaveData.補足情報を含める')" />
        <div class="share-actions mt-3">
          <v-btn color="teal" class="white--text" :loading="loadingURL" :disabled="loadingURL" @click="createURL()">
            <v-icon small class="mr-1">mdi-web</v-icon>{{ $t("SaveData.共有URLを生成") }}
          </v-btn>
          <v-btn color="blue" class="white--text" :loading="loadingTwitter" :disabled="loadingTwitter" @click="shareTwitter()">
            <v-icon small class="mr-1">mdi-twitter</v-icon>{{ $t("SaveData.Twitterで共有") }}
          </v-btn>
        </div>
        <v-expand-transition>
          <div v-show="createdURL" class="mt-3">
            <v-text-field
              id="createdURL"
              readonly
              outlined
              dense
              append-icon="mdi-content-copy"
              v-model="createdURL"
              :hint="copiedURLHint ? $t(`Common.${copiedURLHint}`) : copiedURLHint"
              :persistent-hint="!!copiedURLHint"
              :hide-details="!copiedURLHint"
              @click:append="copyURL"
              @blur="clearURLHint"
            />
          </div>
        </v-expand-transition>
      </section>

      <section class="share-section">
        <div class="section-title">
          <v-icon small class="mr-1">mdi-open-in-new</v-icon>{{ $t("SaveData.他のサイトで開く") }}
        </div>
        <div class="open-links mt-3">
          <v-btn
            outlined
            height="64"
            class="open-link"
            :disabled="!deckBuilder"
            :href="`https://jervis.vercel.app/?predeck=${encodeURIComponent(deckBuilder)}`"
            target="_blank"
          >
            <v-icon color="indigo lighten-2">mdi-anchor</v-icon>
            <span class="open-link-label">{{ $t("SaveData.作戦室で開く") }}</span>
          </v-btn>
          <v-btn
            outlined
            height="64"
            class="open-link"
            :disabled="!compressFleetOnlyDeckBuilder"
            :href="`https://x-20a.github.io/compass/?pdz=${encodeURIComponent(compressFleetOnlyDeckBuilder)}`"
            target="_blank"
          >
            <v-icon color="orange lighten-3">mdi-compass-outline</v-icon>
            <span class="open-link-label">{{ $t("SaveData.羅針盤シミュで開く") }}</span>
          </v-btn>
          <v-btn outlined height="64" class="open-link" disabled>
            <v-icon>mdi-cards-outline</v-icon>
            <span class="open-link-label">{{ $t("SaveData.デッキビルダーで開く") }}</span>
          </v-btn>
        </div>
      </section>

      <section class="share-section" v-if="saveData && !saveData.isUnsaved">
        <div class="section-title">
          <v-icon small color="deep-purple lighten-2" class="mr-1">mdi-account-group</v-icon>{{ $t("Home.みんなの編成") }}
        </div>
        <div class="section-description">{{ $t("SaveData.『トップページ > みんなの編成』ページにて公開される編成をアップロードできます。") }}</div>
        <v-btn block color="deep-purple" class="white--text mt-3" @click="showUploadDialog">
          <v-icon small class="mr-1">mdi-upload</v-icon>{{ $t("Common.編成アップロード") }}
        </v-btn>
      </section>

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
import DeckShare from '@/classes/saveData/deckShare';
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
    includeRemarks: true,
    createdURL: '',
    lastShareKey: '',
    lastShareURL: '',
    copiedURLHint: '',
    copiedDeckHint: '',
    uploadDialog: false,
    dataName: '',
    dataRemarks: '',
  }),
  watch: {
    includeRemarks() {
      // 表示中のURLは切り替え前の設定で発行したものなので、作り直してもらう
      this.createdURL = '';
    },
  },
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
    async createURL() {
      this.loadingURL = true;
      const url = await this.createShareURL();
      if (url) {
        this.createdURL = url;
      }
      this.loadingURL = false;
    },
    async shareTwitter() {
      this.loadingTwitter = true;
      const url = await this.createShareURL();
      if (url) {
        window.open(`https://twitter.com/share?url=${url}`);
      }
      this.loadingTwitter = false;
    },
    async createShareURL(): Promise<string> {
      const { saveData } = this;
      if (!saveData || !saveData.tempData[saveData.tempIndex]) {
        return '';
      }
      const remarks = this.includeRemarks ? saveData.remarks ?? '' : '';
      if (remarks.length > DeckShare.MAX_REMARKS_LENGTH) {
        this.inform('補足情報が長すぎるため共有できません。', true);
        return '';
      }

      const content = { name: saveData.name, remarks, manager: saveData.createURLSaveDataString() };
      // 発行した共有は書き換えないので、同じ中身ならURL作成とXでの共有で同じURLを使い回す
      const key = JSON.stringify(content);
      if (key === this.lastShareKey) {
        return this.lastShareURL;
      }
      const result = await DeckShare.create(content);
      if (result.ok) {
        this.lastShareKey = key;
        this.lastShareURL = result.data;
        return result.data;
      }
      if (result.status === 413) {
        this.inform('補足情報が長すぎるため共有できません。', true);
      } else if (result.status === 429) {
        this.inform('しばらく待ってから再度お試しください。', true);
      } else {
        this.inform('共有URLの生成に失敗しました。', true);
      }
      return '';
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

<style scoped>
.share-section {
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 8px;
  padding: 12px 14px 14px;
}
.share-section + .share-section {
  margin-top: 16px;
}
.share-section-main {
  border-color: rgba(0, 150, 136, 0.6);
  background-color: rgba(0, 150, 136, 0.06);
}
.section-title {
  display: flex;
  align-items: center;
  font-size: 0.95em;
  font-weight: bold;
}
.section-description {
  margin-top: 2px;
  font-size: 0.75em;
  opacity: 0.7;
}
.share-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.share-actions > * {
  flex: 1 1 160px;
}
.open-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.open-link.v-btn {
  min-width: 0 !important;
  padding: 0 6px !important;
  border-color: rgba(128, 128, 128, 0.45);
  text-transform: none;
  letter-spacing: 0;
}
.open-link >>> .v-btn__content {
  flex-direction: column;
  max-width: 100%;
}
.open-link-label {
  max-width: 100%;
  margin-top: 4px;
  font-size: 0.75em;
  line-height: 1.2;
  text-align: center;
  white-space: normal;
}
</style>
