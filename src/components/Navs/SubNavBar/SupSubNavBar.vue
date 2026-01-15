<template>
  <BaseSubNavBar
    nav-class="sup-sub-nav"
    :is-mobile="isMobile"
    :active-item="activeItem"
    :nav-items="supNavItems"
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

// SUP导航项 - 只有列表选项
const supNavItems = computed(() => [
    {
        id: 'sup-list',
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
   pubsub.publish('show-sup-selection', {
       category: item.id
   })
}
</script>

<style lang='scss' scoped>
@use '@/styles/subnavbar-common.scss';
</style>


