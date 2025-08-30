<template>
  <BaseSubNavBar
    nav-class="notam-sub-nav"
    :is-mobile="isMobile"
    :active-item="activeItem"
    :nav-items="notamNavItems"
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

// NOTAM导航项 - 只有列表选项
const notamNavItems = computed(() => [
    {
        id: 'notam-list',
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
   // 列表：显示选择器
   pubsub.publish('show-notam-selection', {
       category: item.id
   })
}
</script>


