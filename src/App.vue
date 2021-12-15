<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app temporary> </v-navigation-drawer>
    <v-app-bar app dense dark class="pr-2">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-btn depressed><v-icon>mdi-content-save</v-icon>編成保存</v-btn>
      <v-btn depressed><v-icon>mdi-content-duplicate</v-icon>別名保存</v-btn>
      <v-btn depressed><v-icon>mdi-share-variant</v-icon>編成共有</v-btn>
      <v-spacer></v-spacer>
      <v-btn @click="$route.path !== '/' && $router.push({ path: '/' })">Home</v-btn>
      <v-btn @click="$route.path !== '/aircalc' && $router.push('aircalc')">制空計算</v-btn>
      <v-btn @click="$route.path !== '/manager' && $router.push('manager')">所持管理</v-btn>
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
        <a href="https://odaibako.net/u/noro_006" class="blue--text text--accent-1" target="_blank"
          >お題箱</a
        >
        <span class="ml-3 mr-2">連絡先:</span>
        <a href="https://twitter.com/noro_006" class="blue--text text--accent-1" target="_blank"
          >Twitter</a
        >
        <span class="ml-3 mr-2">カンパ:</span>
        <a
          href="https://www.amazon.jp/hz/wishlist/ls/1OX9QVZF828GD?ref_=wl_share"
          class="blue--text text--accent-1"
          target="_blank"
          >こちら</a
        >
      </span>
      <span class="d-none d-md-inline text-caption">
        本サイトに関する質問・要望・バグ報告・感想などは
        <a href="https://odaibako.net/u/noro_006" class="blue--text text--accent-1" target="_blank"
          >お題箱</a
        >
        へ。その他、作者へのご連絡は
        <a href="https://twitter.com/noro_006" class="blue--text text--accent-1" target="_blank"
          >Twitter</a
        >
        までお願いします。カンパ等ご支援は
        <a
          href="https://www.amazon.jp/hz/wishlist/ls/1OX9QVZF828GD?ref_=wl_share"
          class="blue--text text--accent-1"
          target="_blank"
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
              <v-checkbox
                v-model="confirmTabClose"
                :label="'確認ダイアログを表示する'"
              ></v-checkbox>
            </div>
          </div>
          <v-divider></v-divider>
          <div class="my-5">
            <div class="mb-2">テーマ</div>
            <v-btn
              @click="$vuetify.theme.dark = false"
              color="grey"
              :class="{ primary: !$vuetify.theme.dark, secondary: $vuetify.theme.dark }"
            >
              <span class="pr-5">Light</span><v-icon>mdi-weather-sunny</v-icon>
            </v-btn>
            <span class="mx-1"></span>
            <v-btn
              @click="$vuetify.theme.dark = true"
              :class="{ primary: $vuetify.theme.dark, secondary: !$vuetify.theme.dark }"
            >
              <span class="pr-5">Dark</span><v-icon>mdi-moon-waxing-crescent</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'App',
  data: () => ({
    drawer: null,
    config: false,
    confirmTabClose: false,
  }),
});
</script>
