import Vue from 'vue';
import { initializeApp } from 'firebase/app';
import VueGtag from 'vue-gtag';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

const firebaseConfig = {
  apiKey: 'AIzaSyC_rEnvKFFlZv54xvxP8MXPht081xYol4s',
  authDomain: 'development-74af0.firebaseapp.com',
  databaseURL: 'https://development-74af0.firebaseio.com',
  projectId: 'development-74af0',
  storageBucket: 'development-74af0.appspot.com',
  messagingSenderId: '789701529106',
  appId: '1:789701529106:web:3498f515937607158592cb',
  measurementId: 'G-90V5M1BZB9',
};

initializeApp(firebaseConfig);

Vue.use(VueGtag, { config: { id: 'UA-152888142-2' } }, router);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
  created() {
    this.$store.dispatch('loadSetting');
    this.$store.dispatch('loadSaveData');
    this.$store.dispatch('loadData');
  },
}).$mount('#app');
