import { createRouter, createWebHistory } from 'vue-router'
import AirportView from '@/pages/AirportView.vue'
import AirportsPage from '@/pages/AirportView.vue'
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
      name: 'AirportsPage',
      component: AirportsPage,
      meta: {
        keepAlive: true,
        title: '机场图'
      }
    }
  ],
})

export default router
