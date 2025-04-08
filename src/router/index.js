import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/home/HomeView.vue'
import BalanceView from '../views/home/BalanceView.vue'
import ConfigView from '@/views/home/ConfigView.vue'
import FarmaciaView from '@/views/farmacia/FarmaciaView.vue'
import BalanceFarmaciaView from '@/views/farmacia/BalanceFarmaciaView.vue'
import ConfigFarmaciaView from '@/views/farmacia/ConfigFarmaciaView.vue'
import LoginView from '@/views/LoginView.vue'
import { requireAuth } from './auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      beforeEnter: requireAuth,
    },
    {
      path: '/balance',
      name: 'balance',
      component: BalanceView,
      beforeEnter: requireAuth,
    },
    {
      path: '/config',
      name: 'config',
      component: ConfigView,
      beforeEnter: requireAuth,
    },
    {
      path: '/farmacia',
      name: 'farmacia',
      component: FarmaciaView,
      beforeEnter: requireAuth,
    },
    {
      path: '/balanceFarmacia',
      name: 'balanceFarmacia',
      component: BalanceFarmaciaView,
      beforeEnter: requireAuth,
    },
    {
      path: '/configFarmacia',
      name: 'configFarmacia',
      component: ConfigFarmaciaView,
      beforeEnter: requireAuth,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

export default router