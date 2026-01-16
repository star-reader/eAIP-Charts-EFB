<template>
    <div :class="navClass">
        <!-- Home按钮 -->
        <div class="home-section">
            <button class="home-btn" @click="goHome" aria-label="返回主页">
                <span class="nav-icon">
                    <Icon :size="iconSize">
                        <HomeOutline />
                    </Icon>
                </span>
            </button>
        </div>

        <!-- 导航项 -->
        <div class="nav-section">
            <div class="nav-slider-container">
                <!-- 导航按钮 -->
                <div 
                    v-for="(item, index) in navItems" 
                    :key="item.id" 
                    class="nav-item"
                >
                    <button 
                        class="nav-button" 
                        :class="{ 'active': activeItem === item.id }"
                        @click="handleNavClick(item)" 
                        :aria-label="item.label"
                    >
                        <span class="nav-label">{{ item.label }}</span>
                        <span v-if="item.count !== null" class="nav-count">{{ item.count }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@vicons/utils'
import { HomeOutline } from '@vicons/ionicons5'

// Props
interface Props {
    isMobile?: boolean
    activeItem?: string
    navClass: string
    navItems: Array<{
        id: string
        label: string
        count: number | null
    }>
    onNavClick: (item: any) => void
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

// Router
const router = useRouter()

// Computed
const iconSize = computed(() => props.isMobile ? '24' : '20')

// Methods
const goHome = () => {
    emit('goHome')
}

const handleNavClick = async (item: any) => {
    emit('navigate', item)
    props.onNavClick(item)
}
</script>

<style lang='scss' scoped>
@use '@/styles/subnavbar-common.scss';
</style>
