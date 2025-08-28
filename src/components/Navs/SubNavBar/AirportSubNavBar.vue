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
import { ref, computed } from 'vue'
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

// Computed
const iconSize = computed(() => props.isMobile ? '24' : '20')

// 移除滑块相关逻辑

// 机场导航项
const airportNavItems = ref([
    {
        id: 'airport-chart',
        label: '机场',
        count: 12,
    },
    {
        id: 'departure',
        label: '离场',
        count: 8,
    },
    {
        id: 'arrival',
        label: '进场',
        count: 6,
    },
    {
        id: 'approach',
        label: '进近',
        count: 15,
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
    isAirportSelectOpen.value = !isAirportSelectOpen.value
}

const handleNavClick = (item: any) => {
   emit('navigate', item)
}

// 移除滑块相关监听器
</script>

<style lang='scss' scoped>
.airport-sub-nav {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: var(--spacing-sm) 0;
    align-items: center;

    .home-section {
        padding: 0 var(--spacing-sm);
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

                    &:hover {
                        color: var(--nav-text);
                        background: rgba(255, 255, 255, 0.04);
                        transform: translateY(-1px);
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

// 移动端样式调整
@media (max-width: 767px) {
    .airport-sub-nav {
        flex-direction: row;
        height: auto;
        padding: 4px var(--spacing-sm);

        .home-section {
            margin-bottom: 0;
            margin-right: var(--spacing-xs);
            padding: 0;
            display: flex;
            align-items: center;
            
            .home-btn {
                width: 36px;
                height: 36px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        .airport-selector {
            margin-bottom: 0;
            margin-right: var(--spacing-xs);
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            
            .airport-select-btn {
                width: 36px;
                height: 36px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: var(--radius-md);
                min-height: unset;
                
                &:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: var(--nav-accent);
                }
                
                .selector-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: row;
                    gap: 0;
                    flex: none;
                    
                    .nav-icon {
                        font-size: 18px;
                        color: var(--nav-accent);
                    }
                    
                    .nav-label {
                        display: none; // 隐藏文字
                    }
                }
                
                .dropdown-arrow {
                    display: none;
                }
            }
        }

        .nav-section {
            flex: 1;
            padding: 0;
            display: flex;
            align-items: center;

            .nav-slider-container {
                flex-direction: row;
                gap: 2px;
                height: 100%;
                padding: 3px;
                width: 100%;



                .nav-item {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    .nav-button {
                        width: 100%;
                        height: 100%;
                        padding: 6px 3px;
                        margin: 0;
                        min-height: 44px;
                        gap: 2px;

                        .nav-label {
                            font-size: 12px;
                            font-weight: 600;
                            line-height: 1.1;
                        }

                        .nav-count {
                            min-width: 20px;
                            height: 18px;
                            padding: 0 6px;
                            font-size: 11px;
                            border-radius: 9px;
                        }
                        
                        &.active {
                            color: #D2B48C;
                            
                            .nav-label {
                                color: #D2B48C;
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
        .home-section {
            display: flex;
            align-items: center;
            
            .home-btn {
                width: 32px;
                height: 32px;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        .airport-selector {
            display: flex;
            align-items: center;
        }
        
        .airport-selector .airport-select-btn {
            width: 32px;
            height: 32px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: var(--radius-md);
            min-height: unset;
            
            &:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: var(--nav-accent);
            }
            
            .selector-content {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: row;
                gap: 0;
                flex: none;
                
                .nav-icon {
                    font-size: 16px;
                    color: var(--nav-accent);
                }
                
                .nav-label {
                    display: none; // 隐藏文字
                }
            }
        }

        .nav-section .nav-slider-container .nav-item .nav-button {
            padding: 5px 2px;
            gap: 1px;
            
            .nav-label {
                font-size: 12px; // 确保最小12px
                font-weight: 600;
            }

            .nav-count {
                min-width: 18px;
                height: 16px;
                font-size: 10px;
                padding: 0 5px;
            }
        }
    }
}
</style>