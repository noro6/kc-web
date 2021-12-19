import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
  created() {
    this.$store.dispatch('loadData').then(() => {
      console.log('data initialized');
    });
  },
}).$mount('#app');
