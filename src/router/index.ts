import { createRouter, createWebHistory } from 'vue-router'
import AirportView from '@/pages/AirportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
