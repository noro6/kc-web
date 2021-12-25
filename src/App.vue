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
    <v-dialog v-model="loading" persistent width="300">
      <v-card dark>
        <v-card-text>
          <div class="pt-2">マスターデータ読込中...</div>
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style>
/** 基本背景色変更 */
.theme--light.v-application {
  background-color: rgb(240, 235, 230) !important;
}
/** ダークテーマ 基本背景色変更 */
.theme--dark.v-application {
  background-color: rgb(20, 22, 28) !important;
}
/** セレクトボックス dense適用時フォントを小さく */
.v-input--dense .v-select__selection {
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
</style>

<style scoped>
.header-btn {
  font-size: 0.8em;
  padding-right: 0.2rem !important;
  padding-left: 0.2rem !important;
}
</style>

<script lang="ts">
import Vue from 'vue';
import Convert from '@/classes/Convert';

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
