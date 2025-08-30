<template>
  <BaseSubNavBar
    nav-class="enroute-sub-nav"
    :is-mobile="isMobile"
    :active-item="activeItem"
    :nav-items="enrouteNavItems"
    :on-nav-click="handleNavClick"
    @go-home="goHome"
    @navigate="handleNavigate"
  />
</template>

<script lang='ts' setup>
import { computed } from 'vue'
import pubsub from 'pubsub-js'
import BaseSubNavBar from './BaseSubNavBar.vue'

// Props
interface Props {
    isMobile?: boolean
    activeItem?: string
}

const props = withDefaults(defineProps<Props>(), {
    isMobile: false,
    activeItem: ''
})

// Emits
interface Emits {
    goHome: []
    navigate: [item: any]
}

const emit = defineEmits<Emits>()

// 航路导航项
const enrouteNavItems = computed(() => [
    {
        id: 'enroute-chart',
        label: '大图',
        count: null,
    },
    {
        id: 'enroute-region',
        label: '区域图',
        count: null,
    },
    {
        id: 'enroute-list',
        label: '列表',
        count: null,
    }
])

// Methods
const goHome = () => {
    emit('goHome')
}

const handleNavigate = (item: any) => {
    emit('navigate', item)
}

const handleNavClick = async (item: any) => {
   if (item.id === 'enroute-chart') {
       // 大图：直接加载ENR 6.2 航路图
       try {
           const { getEnrouteMainChart } = await import('@/services/storage/enrouteHelper.js')
           const mainChart = await getEnrouteMainChart()
           
           if (mainChart) {
               pubsub.publish('load-enroute-chart', mainChart)
           } else {
               console.warn('未找到ENR 6.2 航路图')
               // 如果找不到特定图表，还是显示选择器
               pubsub.publish('show-enroute-selection', {
                   category: item.id
               })
           }
       } catch (error) {
           console.error('加载ENR 6.2 航路图失败:', error)
           // 出错时显示选择器
           pubsub.publish('show-enroute-selection', {
               category: item.id
           })
       }
   } else {
       // 区域图和列表：显示选择器
       pubsub.publish('show-enroute-selection', {
           category: item.id
       })
   }
}
</script>

<style lang='scss' scoped>
@import '@/styles/subnavbar-common.scss';
</style>


