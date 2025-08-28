import { createRouter, createWebHistory } from 'vue-router'
import AirportView from '@/pages/AirportView.vue'
import HomeView from '@/pages/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
      meta: {
        keepAlive: true,
      }
    },
    {
      path: '/airports',
      name: 'AirportView',
      component: AirportView,
      meta: {
        keepAlive: true,
      }
    }
  ],
})

export default router
