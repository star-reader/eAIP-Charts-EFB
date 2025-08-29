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
            </button>
        </div>

        <!-- 机场选择下拉 -->
        <div class="airport-selector">
            <button class="airport-select-btn" @click="toggleAirportSelect" aria-label="选择机场">
                <div class="selector-content">
                    <span class="nav-icon">
                        <Icon :size="iconSize">
                            <LocationOutline />
                        </Icon>
                    </span>
                    <span class="nav-label">{{ selectedAirport || '选择机场' }}</span>
                </div>
            </button>
        </div>

        <!-- 机场导航项 -->
        <div class="nav-section">
            <div class="nav-slider-container">
                <!-- 导航按钮 -->
                <div 
                    v-for="(item, index) in airportNavItems" 
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@vicons/utils'
import pubsub from 'pubsub-js'
import { 
    HomeOutline,
    LocationOutline,
    ChevronDownOutline
} from '@vicons/ionicons5'
import { getCategorizedChartsByICAO } from '@/services/storage/airportHelper'

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

const isAirportSelectOpen = ref(false)
const chartsData = ref<CategorizedCharts | null>(null)
const isLoadingCharts = ref(false)

// Computed
const iconSize = computed(() => props.isMobile ? '24' : '20')

// 机场导航项 - 动态更新数量
const airportNavItems = computed(() => [
    {
        id: 'airport-chart',
        label: '机场',
        count: chartsData.value?.airport?.length || 0,
    },
    {
        id: 'departure',
        label: '离场',
        count: chartsData.value?.dep?.length || 0,
    },
    {
        id: 'arrival',
        label: '进场',
        count: chartsData.value?.arr?.length || 0,
    },
    {
        id: 'approach',
        label: '进近',
        count: chartsData.value?.app?.length || 0,
    },
    {
        id: 'details',
        label: '细则',
        count: null, // 无数量显示
    }
])

// Methods
const goHome = () => {
    emit('goHome')
}

const toggleAirportSelect = () => {
    // 广播打开机场选择器事件
    pubsub.publish('show-airport-selection', {
        selectedAirport: props.selectedAirport
    })
}

const handleNavClick = (item: any) => {
   emit('navigate', item)
   
   // 如果是细则，直接显示
   if (item.id === 'details') {
     // console.log('细则内容:', chartsData.value?.airport || [])
     pubsub.publish('chart-ad-selected', chartsData.value?.ad)
     return
   }
   
   // 其他类别输出对应的航图内容到控制台
   const categoryData = chartsData.value?.[item.id as keyof typeof chartsData.value]
   
   // 广播显示航图选择器事件
   pubsub.publish('show-charts-selection', {
       category: item.id,
       selectedAirport: props.selectedAirport
   })
}

// 加载机场航图数据
const loadAirportCharts = async (icao: string) => {
    if (!icao) {
        chartsData.value = null
        return
    }

    isLoadingCharts.value = true
    try {
        const data = await getCategorizedChartsByICAO(icao)
        chartsData.value = data
    } catch (error) {
        chartsData.value = null
    } finally {
        isLoadingCharts.value = false
    }
}

// 监听机场选择事件
const handleAirportSelected = (message: string, airport: AirportList) => {
    loadAirportCharts(airport.airporticao)
}

// 监听机场变化
watch(() => props.selectedAirport, (newAirport) => {
    if (newAirport) {
        loadAirportCharts(newAirport)
    } else {
        chartsData.value = null
    }
}, { immediate: true })

onMounted(() => {
    // 订阅机场选择事件
    pubsub.subscribe('airport-selected', handleAirportSelected)
    
    // 如果已有选中的机场，加载数据
    if (props.selectedAirport) {
        loadAirportCharts(props.selectedAirport)
    }
})

onUnmounted(() => {
    // 取消订阅
    pubsub.unsubscribe('airport-selected')
})
</script>

<style lang='scss' scoped>
.airport-sub-nav {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--spacing-sm) 0;
    overflow: hidden; // 防止动画时文字溢出
    
    // 初始状态：在右侧外面
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    
    // 动画进入状态
    animation: slideInFromRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;

    .home-section {
        padding: 0 var(--spacing-sm);
        margin-top: 30px;
        margin-bottom: var(--spacing-md);
        display: flex;
        justify-content: center;

        .home-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: var(--radius-md);
            color: var(--nav-text);
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: var(--nav-accent);
                color: var(--nav-accent);
            }

            .nav-icon {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }

    .airport-selector {
        padding: 0 var(--spacing-sm);
        margin-bottom: var(--spacing-md);

        .airport-select-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--radius-md);
            color: var(--nav-text);
            cursor: pointer;
            transition: all 0.2s ease;
            min-height: 38px;

            &:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.2);
            }

            &:active {
                transform: translateY(0);
            }

            .selector-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                flex: 1;

                .nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--nav-accent);
                }

                .nav-label {
                    font-size: 9px;
                    font-weight: 600;
                    text-align: center;
                    letter-spacing: 0.3px;
                    color: var(--nav-text);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }
            }

            .dropdown-arrow {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                color: var(--nav-text-secondary);
                transition: all 0.2s ease;
                
                &:hover {
                    color: var(--nav-accent);
                }
            }
        }
    }

    .nav-section {
        // flex: 1;
        // padding: 0 var(--spacing-sm);
        padding: 0px;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .nav-slider-container {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 4px;
            border-radius: 4px;
            // padding: 6px;



            .nav-item {
                position: relative;
                z-index: 2;
                width: 100%;
                min-width: 0; // 允许flex子项收缩

                .nav-button {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 14px 8px;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-sm);
                    color: var(--nav-text-secondary);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-height: 60px;
                    position: relative;
                    gap: 4px;
                    min-width: 0; // 允许flex子项收缩

                    &:hover {
                        color: var(--nav-text);
                        background: rgba(255, 255, 255, 0.04);
                        // transform: translateY(-1px);
                    }

                    &.active {
                        color: #D2B48C;
                        font-weight: 600;
                        
                        .nav-label {
                            color: #D2B48C;
                            font-weight: 600;
                        }

                       
                    }

                    .nav-label {
                        font-size: 12px;
                        font-weight: 500;
                        text-align: center;
                        line-height: 1.2;
                        transition: all 0.3s ease;
                        letter-spacing: 0.3px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 100%;
                    }

                    .nav-count {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        min-width: 22px;
                        height: 18px;
                        padding: 0 6px;
                        background: rgba(255, 255, 255, 0.12);
                        border-radius: 9px;
                        font-size: 10px;
                        font-weight: 600;
                        color: var(--nav-text-secondary);
                        transition: all 0.3s ease;
                        border: 1px solid rgba(255, 255, 255, 0.08);
                    }
                }
            }
        }
    }
}

// 移动端样式调整 - 保持和桌面端一致的布局
@media (max-width: 767px) {
    .airport-sub-nav {
        // 保持和桌面端相同的结构，只调整尺寸
        .home-section {
            .home-btn {
                font-size: inherit; // 保持桌面端样式
            }
        }

        .airport-selector {
            .airport-select-btn {
                .selector-content {
                    .nav-label {
                        font-size: 8px; // 稍微缩小字体
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 100%;
                        width: 100%;
                    }
                }
            }
        }

        .nav-section {
            .nav-slider-container {
                .nav-item {
                    .nav-button {
                        .nav-label {
                            font-size: 10px; // 稍微缩小字体
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            max-width: 100%;
                            width: 100%;
                        }

                        .nav-count {
                            min-width: 18px;
                            height: 16px;
                            font-size: 9px;
                            flex-shrink: 0; // 防止计数徽章被压缩
                        }
                    }
                }
            }
        }
    }
}

@media (max-width: 480px) {
    .airport-sub-nav {
        // 在极小屏幕上进一步缩小尺寸，但保持相同的布局结构
        .airport-selector {
            .airport-select-btn {
                .selector-content {
                    .nav-label {
                        font-size: 7px; // 更小的字体
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 100%;
                        width: 100%;
                    }
                    
                    .nav-icon {
                        font-size: inherit; // 保持图标大小
                        flex-shrink: 0;
                    }
                }
            }
        }

        .nav-section {
            .nav-slider-container {
                .nav-item {
                    .nav-button {
                        .nav-label {
                            font-size: 9px; // 更小的字体
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            max-width: 100%;
                            width: 100%;
                        }

                        .nav-count {
                            min-width: 16px;
                            height: 14px;
                            font-size: 8px;
                            flex-shrink: 0;
                        }
                    }
                }
            }
        }
    }
}

// 从右侧滑入的关键帧动画
@keyframes slideInFromRight {
    0% {
        transform: translateX(100%);
        opacity: 0;
    }
    60%{
        transform: translateX(70%);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>