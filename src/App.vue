<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app temporary> </v-navigation-drawer>
    <v-app-bar app dense dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-btn class="header-btn" depressed><v-icon small>mdi-content-save</v-icon>編成保存</v-btn>
      <v-btn class="header-btn" depressed><v-icon small>mdi-content-duplicate</v-icon>別名保存</v-btn>
      <v-btn class="header-btn" depressed><v-icon small>mdi-share-variant</v-icon>編成共有</v-btn>
      <div id="multipurpose-textarea">
        <v-textarea
          v-model.trim="somethingText"
          outlined
          dense
          hide-details
          no-resize
          placeholder="デッキビルダー形式データ:{version:4,hqlv:120,f1:{s1:..."
          rows="1"
          :color="getTextareaColor"
          :append-icon="somethingText ? 'mdi-send' : ''"
          clear-icon="mdi-close-circle"
          clearable
          :loading="readState"
          @click:append="readSomethingText"
        ></v-textarea>
      </div>
      <v-btn class="header-btn" depressed @click="$route.path !== '/' && $router.push({ path: '/' })">Home</v-btn>
      <v-btn class="header-btn" depressed @click="$route.path !== '/aircalc' && $router.push('aircalc')">制空計算</v-btn>
      <v-btn class="header-btn" depressed @click="$route.path !== '/manager' && $router.push('manager')">所持管理</v-btn>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="config = !config"><v-icon>mdi-cog</v-icon></v-btn>
        </template>
        <span>設定</span>
      </v-tooltip>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
    <v-footer app dark class="d-flex justify-center">
      <span class="d-md-none text-caption">
        <span class="mr-2">要望・バグ報告:</span>
        <a href="https://odaibako.net/u/noro_006" class="blue--text text--accent-1" target="_blank">お題箱</a>
        <span class="ml-3 mr-2">連絡先:</span>
        <a href="https://twitter.com/noro_006" class="blue--text text--accent-1" target="_blank">Twitter</a>
        <span class="ml-3 mr-2">カンパ:</span>
        <a href="https://www.amazon.jp/hz/wishlist/ls/1OX9QVZF828GD?ref_=wl_share" class="blue--text text--accent-1" target="_blank"
          >こちら</a
        >
      </span>
      <span class="d-none d-md-inline text-caption">
        本サイトに関する質問・要望・バグ報告・感想などは
        <a href="https://odaibako.net/u/noro_006" class="blue--text text--accent-1" target="_blank">お題箱</a>
        へ。その他、作者へのご連絡は
        <a href="https://twitter.com/noro_006" class="blue--text text--accent-1" target="_blank">Twitter</a>
        までお願いします。カンパ等ご支援は
        <a href="https://www.amazon.jp/hz/wishlist/ls/1OX9QVZF828GD?ref_=wl_share" class="blue--text text--accent-1" target="_blank"
          >こちら</a
        >から。
      </span>
    </v-footer>
    <v-dialog v-model="config" width="600">
      <v-card>
        <div class="px-10 py-5">
          <div class="my-5">
            <div>タブを閉じる際の挙動</div>
            <div>
              <v-checkbox v-model="confirmTabClose" label="確認ダイアログを表示する"></v-checkbox>
            </div>
          </div>
          <v-divider></v-divider>
          <div class="my-5">
            <div class="mb-2">テーマ</div>
            <v-btn
              @click="$vuetify.theme.dark = false"
              color="grey"
              :class="{
                primary: !$vuetify.theme.dark,
                secondary: $vuetify.theme.dark,
              }"
            >
              <span class="pr-5">Light</span><v-icon>mdi-weather-sunny</v-icon>
            </v-btn>
            <span class="mx-1"></span>
            <v-btn
              @click="$vuetify.theme.dark = true"
              :class="{
                primary: $vuetify.theme.dark,
                secondary: !$vuetify.theme.dark,
              }"
            >
              <span class="pr-5">Dark</span><v-icon>mdi-moon-waxing-crescent</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="loading" width="300">
      <v-card dark>
        <v-card-text>
          <div class="pt-2">マスターデータ読込中...</div>
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Convert from '@/classes/convert';

export default Vue.extend({
  name: 'App',
  data: () => ({
    drawer: null,
    config: false,
    loading: true,
    confirmTabClose: false,
    somethingText: '',
    textareaHasError: false,
    readState: false as boolean | string,
  }),
  computed: {
    completed() {
      return this.$store.getters.getCompleted;
    },
    getTextareaColor() {
      return this.somethingText && this.textareaHasError ? 'red darken-4' : 'primary';
    },
  },
  watch: {
    completed(value) {
      this.loading = !value;
    },
  },
  methods: {
    readSomethingText() {
      this.readState = 'primary';

      try {
        const converter = new Convert(this.$store.state.items, this.$store.state.ships);
        const newManager = converter.loadDeckBuilder(this.somethingText);
        this.somethingText = '';
        this.readState = false;

        this.$store.dispatch('setCalcManager', newManager);
      } catch (error) {
        console.error(error);
        this.readState = false;
        this.textareaHasError = true;
      }
    },
  },
});
</script>

<style scoped>
.header-btn {
  font-size: 0.8em;
  padding-right: 0.2rem !important;
  padding-left: 0.2rem !important;
}
</style>

<style>
/** 日本語フォント設定 */
/* .v-application {
  font-family: "游ゴシック", sans-serif !important;
} */
/** 基本背景色変更 */
.theme--light.v-application {
  background-color: rgb(240, 235, 230) !important;
}
/** ダークテーマ 基本背景色変更 */
.theme--dark.v-application {
  background-color: rgb(20, 22, 28) !important;
}
/** dense適用時フォントを小さく */
.v-input--dense .v-select__selection,
.v-input--dense.v-input--selection-controls .v-label {
  font-size: 0.85em;
}

/** ダークテーマ card1層目 */
.theme--dark.v-card {
  background-color: rgb(25, 25, 28) !important;
}
/** ダークテーマ card2層目 */
.theme--dark.v-card .v-card {
  background-color: rgb(32, 32, 35) !important;
}
/** ダークテーマ card3層目 */
.theme--dark.v-card .v-card .v-card {
  background-color: rgb(40, 40, 43) !important;
}

/** タブ内背景色を裏と合わせる */
.v-tabs-bar,
.v-tabs-items {
  background-color: transparent !important;
}

#multipurpose-textarea {
  margin-left: 0.25rem;
  margin-right: 0.25rem;
  flex-grow: 1;
}
#multipurpose-textarea textarea {
  font-size: 0.8em;
  overflow: hidden !important;
}

/** アイコン毎の背景色 */
.item-input.type-1,
.item-input.type-2,
.item-input.type-3,
.item-input.type-7 {
  box-shadow: inset 0 0 24px rgba(255, 0, 0, 0.15) !important;
}
.item-input.type-1:hover,
.item-input.type-2:hover,
.item-input.type-3:hover,
.item-input.type-7:hover {
  box-shadow: inset 0 0 24px rgba(255, 0, 0, 0.4) !important;
}
.item-input.type-4,
.item-input.type-9,
.item-input.type-19,
.item-input.type-27,
.item-input.type-39,
.item-input.type-40 {
  box-shadow: inset 0 0 24px rgba(255, 255, 70, 0.15) !important;
}
.item-input.type-4:hover,
.item-input.type-9:hover,
.item-input.type-19:hover,
.item-input.type-27:hover,
.item-input.type-39:hover,
.item-input.type-40:hover {
  box-shadow: inset 0 0 24px rgba(255, 255, 70, 0.4) !important;
}
.item-input.type-5,
.item-input.type-8 {
  box-shadow: inset 0 0 24px rgba(0, 190, 255, 0.15) !important;
}
.item-input.type-5:hover,
.item-input.type-8:hover {
  box-shadow: inset 0 0 24px rgba(0, 190, 255, 0.4) !important;
}
.item-input.type-6,
.item-input.type-12,
.item-input.type-15,
.item-input.type-16,
.item-input.type-21,
.item-input.type-44 {
  box-shadow: inset 0 0 24px rgba(0, 255, 100, 0.15) !important;
}
.item-input.type-6:hover,
.item-input.type-12:hover,
.item-input.type-15:hover,
.item-input.type-16:hover,
.item-input.type-21:hover,
.item-input.type-44:hover {
  box-shadow: inset 0 0 24px rgba(0, 255, 100, 0.4) !important;
}
.item-input.type-10,
.item-input.type-33,
.item-input.type-43 {
  box-shadow: inset 0 0 24px rgba(86, 255, 122, 0.15) !important;
}
.item-input.type-10:hover,
.item-input.type-33:hover,
.item-input.type-43:hover {
  box-shadow: inset 0 0 24px rgba(86, 255, 122, 0.4) !important;
}
.item-input.type-11 {
  box-shadow: inset 0 0 24px rgba(210, 120, 20, 0.15) !important;
}
.item-input.type-11:hover {
  box-shadow: inset 0 0 24px rgba(210, 120, 20, 0.4) !important;
}
.item-input.type-13 {
  box-shadow: inset 0 0 24px rgba(255, 125, 125, 0.15) !important;
}
.item-input.type-13:hover {
  box-shadow: inset 0 0 24px rgba(255, 125, 125, 0.4) !important;
}
.item-input.type-14,
.item-input.type-34 {
  box-shadow: inset 0 0 20px rgba(196, 196, 196, 0.25) !important;
}
.item-input.type-14:hover,
.item-input.type-34:hover {
  box-shadow: inset 0 0 20px rgba(196, 196, 196, 0.4) !important;
}
.item-input.type-17,
.item-input.type-18,
.item-input.type-22 {
  box-shadow: inset 0 0 24px rgba(27, 187, 255, 0.15) !important;
}
.item-input.type-17:hover,
.item-input.type-18:hover,
.item-input.type-22:hover {
  box-shadow: inset 0 0 24px rgba(27, 187, 255, 0.4) !important;
}
.item-input.type-20,
.item-input.type-36 {
  box-shadow: inset 0 0 24px rgba(155, 165, 95, 0.15) !important;
}
.item-input.type-20:hover,
.item-input.type-36:hover {
  box-shadow: inset 0 0 24px rgba(155, 165, 95, 0.4) !important;
}
.item-input.type-23 {
  box-shadow: inset 0 0 20px rgba(150, 125, 175, 0.25) !important;
}
.item-input.type-23:hover {
  box-shadow: inset 0 0 20px rgba(150, 125, 175, 0.5) !important;
}
.item-input.type-24 {
  box-shadow: inset 0 0 24px rgba(240, 130, 60, 0.15) !important;
}
.item-input.type-24:hover {
  box-shadow: inset 0 0 24px rgba(240, 130, 60, 0.4) !important;
}
.item-input.type-25 {
  box-shadow: inset 0 0 20px rgba(128, 128, 128, 0.25) !important;
}
.item-input.type-25:hover {
  box-shadow: inset 0 0 20px rgba(128, 128, 128, 0.5) !important;
}
.item-input.type-26,
.item-input.type-29 {
  box-shadow: inset 0 0 24px rgba(205, 165, 100, 0.15) !important;
}
.item-input.type-26:hover,
.item-input.type-29:hover {
  box-shadow: inset 0 0 24px rgba(205, 165, 100, 0.4) !important;
}
.item-input.type-28 {
  box-shadow: inset 0 0 24px rgba(140, 120, 170, 0.15) !important;
}
.item-input.type-28:hover {
  box-shadow: inset 0 0 24px rgba(140, 120, 170, 0.4) !important;
}
.item-input.type-30 {
  box-shadow: inset 0 0 24px rgba(135, 150, 75, 0.15) !important;
}
.item-input.type-30:hover {
  box-shadow: inset 0 0 24px rgba(135, 150, 75, 0.4) !important;
}
.item-input.type-31 {
  box-shadow: inset 0 0 24px rgba(255, 55, 55, 0.15) !important;
}
.item-input.type-31:hover {
  box-shadow: inset 0 0 24px rgba(255, 55, 55, 0.4) !important;
}
.item-input.type-32 {
  box-shadow: inset 0 0 24px rgba(190, 240, 150, 0.15) !important;
}
.item-input.type-32:hover {
  box-shadow: inset 0 0 24px rgba(190, 240, 150, 0.4) !important;
}
.item-input.type-35 {
  box-shadow: inset 0 0 24px rgba(95, 195, 155, 0.15) !important;
}
.item-input.type-35:hover {
  box-shadow: inset 0 0 24px rgba(95, 195, 155, 0.4) !important;
}
.item-input.type-37,
.item-input.type-38,
.item-input.type-41,
.item-input.type-49 {
  box-shadow: inset 0 0 24px rgba(53, 199, 17, 0.15) !important;
}
.item-input.type-37:hover,
.item-input.type-38:hover,
.item-input.type-41:hover,
.item-input.type-49:hover {
  box-shadow: inset 0 0 24px rgba(53, 199, 17, 0.4) !important;
}
.item-input.type-44 {
  box-shadow: inset 0 0 24px rgba(36, 255, 91, 0.15) !important;
}
.item-input.type-44:hover {
  box-shadow: inset 0 0 24px rgba(36, 255, 91, 0.4) !important;
}
.item-input.type-45,
.item-input.type-46 {
  box-shadow: inset 0 0 24px rgba(122, 98, 255, 0.15) !important;
}
.item-input.type-45:hover,
.item-input.type-46:hover {
  box-shadow: inset 0 0 24px rgba(122, 98, 255, 0.4) !important;
}
.item-input.type-47 {
  box-shadow: inset 0 0 24px rgba(0, 110, 255, 0.15) !important;
}
.item-input.type-47:hover {
  box-shadow: inset 0 0 24px rgba(0, 110, 255, 0.4) !important;
}
</style>
