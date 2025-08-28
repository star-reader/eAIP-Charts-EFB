<template>
    <div class="airport-sub-nav">
        <!-- Home按钮 -->
        <div class="home-section">
            <button class="home-btn" @click="goHome" aria-label="返回主页">
                <span class="nav-icon">
                    <Icon :size="iconSize">
                        <HomeOutline />
                    </Icon>
                </span>
                <span class="nav-label">主页</span>
            </button>
        </div>

        <!-- 机场选择下拉 -->
        <div class="airport-selector">
            <button class="airport-select-btn" @click="toggleAirportSelect" aria-label="选择机场">
                <span class="nav-icon">
                    <Icon :size="iconSize">
                        <LocationOutline />
                    </Icon>
                </span>
                <span class="nav-label">{{ selectedAirport || '选择机场' }}</span>
                <span class="dropdown-arrow">
                    <Icon size="12">
                        <ChevronDownOutline />
                    </Icon>
                </span>
            </button>
        </div>

        <!-- 机场导航项 -->
        <div class="nav-section">
            <div class="nav-slider-container">
                <!-- 滑块背景 -->
                <div 
                    class="nav-slider" 
                    :style="sliderStyle"
                    :class="{ 'show': activeItem && activeItem !== '' }"
                ></div>
                
                <!-- 导航按钮 -->
                <div 
                    v-for="(item, index) in airportNavItems" 
                    :key="item.id" 
                    class="nav-item"
                    :ref="el => setNavItemRef(el as HTMLElement, index)"
                >
                    <button 
                        class="nav-button" 
                        :class="{ 'active': activeItem === item.id }"
                        @click="handleNavClick(item)" 
                        :aria-label="item.label"
                    >
                        <span class="nav-label">{{ item.label }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@vicons/utils'
import { 
    HomeOutline,
    LocationOutline,
    ChevronDownOutline
} from '@vicons/ionicons5'

// Emits
interface Emits {
    goHome: []
    navigate: [item: any]
}

const emit = defineEmits<Emits>()

// Router
const router = useRouter()

// Props
interface Props {
    isMobile?: boolean
    activeItem?: string
    selectedAirport?: string
}

const props = withDefaults(defineProps<Props>(), {
    isMobile: false,
    activeItem: '',
    selectedAirport: ''
})

// State
const isAirportSelectOpen = ref(false)
const navItemRefs = ref<(HTMLElement | null)[]>([])

// Computed
const iconSize = computed(() => props.isMobile ? '24' : '20')

// 滑块样式状态
const sliderStyle = ref<Record<string, string>>({ transform: 'translateY(-100%)', opacity: '0' })

// 计算滑块位置
const updateSliderPosition = async () => {
    if (!props.activeItem) {
        sliderStyle.value = { transform: 'translateY(-100%)', opacity: '0' }
        return
    }
    
    await nextTick()
    
    const activeIndex = airportNavItems.value.findIndex(item => item.id === props.activeItem)
    if (activeIndex === -1) {
        sliderStyle.value = { transform: 'translateY(-100%)', opacity: '0' }
        return
    }
    
    const navItem = navItemRefs.value[activeIndex]
    if (!navItem) {
        sliderStyle.value = { transform: 'translateY(-100%)', opacity: '0' }
        return
    }
    
    const itemHeight = navItem.offsetHeight
    const itemTop = navItem.offsetTop
    
    if (props.isMobile) {
        // 移动端水平滑动
        const itemWidth = navItem.offsetWidth
        const itemLeft = navItem.offsetLeft
        sliderStyle.value = {
            transform: `translateX(${itemLeft}px)`,
            width: `${itemWidth}px`,
            height: `${itemHeight}px`,
            opacity: '1'
        }
    } else {
        // 桌面端垂直滑动
        sliderStyle.value = {
            transform: `translateY(${itemTop}px)`,
            height: `${itemHeight}px`,
            opacity: '1'
        }
    }
}

// 机场导航项
const airportNavItems = ref([
    {
        id: 'airport-chart',
        label: '机场',
        route: '/airports/chart'
    },
    {
        id: 'departure',
        label: '离场',
        route: '/airports/departure'
    },
    {
        id: 'arrival',
        label: '进场',
        route: '/airports/arrival'
    },
    {
        id: 'approach',
        label: '进近',
        route: '/airports/approach'
    },
    {
        id: 'other',
        label: '其他',
        route: '/airports/other'
    }
])

// Methods
const goHome = () => {
    emit('goHome')
}

const toggleAirportSelect = () => {
    isAirportSelectOpen.value = !isAirportSelectOpen.value
}

const handleNavClick = (item: any) => {
    emit('navigate', item)
    if (item.route) {
        router.push(item.route)
    }
}

// 设置导航项ref
const setNavItemRef = (el: HTMLElement | null, index: number) => {
    if (el) {
        navItemRefs.value[index] = el
    }
}

// 监听activeItem变化
watch(() => props.activeItem, () => {
    if (navItemRefs.value.length > 0) {
        updateSliderPosition()
    }
})

// 监听isMobile变化
watch(() => props.isMobile, () => {
    if (navItemRefs.value.length > 0) {
        updateSliderPosition()
    }
})

// 组件挂载后初始化滑块位置
onMounted(() => {
    nextTick(() => {
        if (props.activeItem && navItemRefs.value.length > 0) {
            updateSliderPosition()
        }
    })
})
</script>

<style lang='scss' scoped>
.airport-sub-nav {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--spacing-sm) 0;

    .home-section {
        padding: 0 var(--spacing-sm);
        margin-bottom: var(--spacing-md);

        .home-btn {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: var(--spacing-sm);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--nav-border-color);
            border-radius: var(--radius-md);
            color: var(--nav-text);
            cursor: pointer;
            transition: all 0.2s ease;
            min-height: 50px;

            &:hover {
                background: var(--nav-hover-bg);
                border-color: var(--nav-accent);
            }

            .nav-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 4px;
            }

            .nav-label {
                font-size: 10px;
                font-weight: 500;
                text-align: center;
                line-height: 1.1;
            }
        }
    }

    .airport-selector {
        padding: 0 var(--spacing-sm);
        margin-bottom: var(--spacing-lg);

        .airport-select-btn {
            width: 100%;
            display: flex;
            align-items: center;
            padding: var(--spacing-sm);
            background: var(--glass-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            color: var(--nav-text-secondary);
            cursor: pointer;
            transition: all 0.2s ease;
            min-height: 40px;

            &:hover {
                background: var(--nav-hover-bg);
                border-color: var(--nav-accent);
                color: var(--nav-text);
            }

            .nav-icon {
                margin-right: var(--spacing-xs);
            }

            .nav-label {
                flex: 1;
                font-size: 10px;
                font-weight: 500;
                text-align: left;
            }

            .dropdown-arrow {
                margin-left: var(--spacing-xs);
                transition: transform 0.2s ease;
            }
        }
    }

    .nav-section {
        flex: 1;
        padding: 0 var(--spacing-sm);
        display: flex;
        flex-direction: column;
        justify-content: center;

        .nav-slider-container {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);

            .nav-slider {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                background: linear-gradient(135deg, var(--nav-accent), rgba(var(--nav-accent-rgb), 0.8));
                border-radius: var(--radius-sm);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateY(-100%);
                opacity: 0;
                z-index: 1;
                box-shadow: 0 2px 8px rgba(var(--nav-accent-rgb), 0.3);

                &.show {
                    opacity: 1;
                }
            }

            .nav-item {
                position: relative;
                z-index: 2;
                width: 100%;

                .nav-button {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-sm);
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-sm);
                    color: var(--nav-text-secondary);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-height: 45px;
                    position: relative;

                    &:hover {
                        color: var(--nav-text);
                        background: rgba(255, 255, 255, 0.05);
                    }

                    &.active {
                        color: var(--nav-bg);
                        font-weight: 600;
                        
                        .nav-label {
                            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                        }
                    }

                    .nav-label {
                        font-size: 11px;
                        font-weight: 500;
                        text-align: center;
                        line-height: 1.2;
                        transition: all 0.2s ease;
                    }
                }
            }
        }
    }
}

// 移动端样式调整
@media (max-width: 767px) {
    .airport-sub-nav {
        flex-direction: row;
        height: auto;
        padding: 4px var(--spacing-sm);

        .home-section {
            margin-bottom: 0;
            margin-right: var(--spacing-sm);
            
            .home-btn {
                min-height: auto;
                padding: 4px;
                max-width: 50px;
                
                .nav-label {
                    font-size: 8px;
                }
            }
        }

        .airport-selector {
            margin-bottom: 0;
            margin-right: var(--spacing-sm);
            flex: 0 0 auto;
            
            .airport-select-btn {
                min-height: auto;
                padding: 4px var(--spacing-xs);
                max-width: 80px;
                
                .nav-label {
                    font-size: 7px;
                }
            }
        }

        .nav-section {
            flex: 1;
            padding: 0;

            .nav-slider-container {
                flex-direction: row;
                gap: 0;
                height: 100%;

                .nav-slider {
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: auto;
                    transform: translateX(-100%);
                    
                    &.show {
                        transform: translateX(0);
                    }
                }

                .nav-item {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .nav-button {
                        min-height: auto;
                        height: auto;
                        padding: 4px;
                        margin: 0;
                        max-width: 60px;
                        min-height: 42px;

                        .nav-label {
                            font-size: 8px;
                            font-weight: 600;
                            line-height: 1;
                        }
                        
                        &.active {
                            .nav-label {
                                font-weight: 700;
                            }
                        }
                    }
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .airport-sub-nav {
        .home-section .home-btn {
            max-width: 45px;
            .nav-label {
                font-size: 7px;
            }
        }

        .airport-selector .airport-select-btn {
            max-width: 70px;
            .nav-label {
                font-size: 6px;
            }
        }

        .nav-section .nav-slider-container .nav-item .nav-button {
            max-width: 50px;
            .nav-label {
                font-size: 7px;
            }
        }
    }
}
</style>