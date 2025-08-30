<template>
    <div class="notam-sub-nav">
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

        <!-- NOTAM导航项 -->
        <div class="nav-section">
            <div class="nav-slider-container">
                <!-- 导航按钮 -->
                <div 
                    v-for="(item, index) in notamNavItems" 
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@vicons/utils'
import pubsub from 'pubsub-js'
import { 
    HomeOutline
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
}

const props = withDefaults(defineProps<Props>(), {
    isMobile: false,
    activeItem: ''
})

// Computed
const iconSize = computed(() => props.isMobile ? '24' : '20')

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

const handleNavClick = async (item: any) => {
   emit('navigate', item)
   
   // 列表：显示选择器
   pubsub.publish('show-notam-selection', {
       category: item.id
   })
}

onMounted(() => {
    // 初始化
})

onUnmounted(() => {
    // 清理工作
})
</script>

<style lang='scss' scoped>
.notam-sub-nav {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--spacing-sm) 0;
    overflow: hidden; // 防止动画时文字溢出
    
    // 进入动画
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

    .nav-section {
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
    .notam-sub-nav {
        // 保持和桌面端相同的结构，只调整尺寸
        .home-section {
            .home-btn {
                font-size: inherit; // 保持桌面端样式
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
    .notam-sub-nav {
        // 在极小屏幕上进一步缩小尺寸，但保持相同的布局结构
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
    60% {
        transform: translateX(70%);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
