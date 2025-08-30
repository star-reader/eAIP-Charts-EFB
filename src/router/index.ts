import { createRouter, createWebHistory } from 'vue-router'
import AirportView from '@/pages/AirportView.vue'
import AirportsPage from '@/pages/AirportView.vue'
import EnrouteView from '@/pages/EnrouteView.vue'
import SupView from '@/pages/SupView.vue'
import AicView from '@/pages/AicView.vue'
import NotamView from '@/pages/NotamView.vue'
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
    },
    {
      path: '/enroute',
      name: 'EnrouteView',
      component: EnrouteView,
      meta: {
        keepAlive: true,
        title: '航路图'
      }
    },
    {
      path: '/sup',
      name: 'SupView',
      component: SupView,
      meta: {
        keepAlive: true,
        title: 'SUP'
      }
    },
    {
      path: '/aic',
      name: 'AicView',
      component: AicView,
      meta: {
        keepAlive: true,
        title: 'AIC'
      }
    },
    {
      path: '/notam',
      name: 'NotamView',
      component: NotamView,
      meta: {
        keepAlive: true,
        title: 'NOTAM'
      }
    }
  ],
})

export default router
