import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BalanceView from '../views/BalanceView.vue'
import ConfigView from '@/views/ConfigView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/balance',
      name: 'balance',
      component: BalanceView,
    },
    {
      path: '/config',
      name: 'config',
      component: ConfigView,
    }
  ],
})

export default router