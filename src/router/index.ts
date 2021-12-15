import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/aircalc',
    name: 'AirCalculator',
    component: () => import('../views/AirCalculator.vue'),
  },
  {
    path: '/manager',
    name: 'FleetManager',
    component: () => import('../views/FleetManager.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
