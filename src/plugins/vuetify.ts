import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import ja from 'vuetify/src/locale/ja';
import en from 'vuetify/src/locale/en';
import zhHans from 'vuetify/src/locale/zh-Hans';

Vue.use(Vuetify);

export default new Vuetify({
  theme: { dark: true },
  lang: { locales: { ja, en, cn: zhHans } },
});
