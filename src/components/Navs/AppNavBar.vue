<template>
    <NavBarContainer>
        <nav class="app-nav-bar">
            <!-- 主导航列表 -->
            <ul 
                v-show="isHome"
                class="nav-list" 
                :class="{ 
                    'slide-out': !showList && isHome, 
                    'slide-in': showList && isAnimating && isHome,
                    'animating': isAnimating 
                }"
            >
                <li v-for="item in navItems" :key="item.id" class="nav-item">
                    <button class="nav-button" :class="{ 'active': activeItem === item.id }"
                        @click="handleNavClick(item)" :aria-label="item.label">
                        <span class="nav-icon">
                            <Icon :size="iconSize">
                                <component :is="item.icon" />
                            </Icon>
                        </span>
                        <span class="nav-label">{{ item.label }}</span>
                    </button>
                </li>
            </ul>

            <!-- 机场子导航 -->
            <div
                v-show="currentPage === 'airports'"
                class="sub-nav-container"
                :class="{ 
                    'slide-in-right': showSubNav,
                    'slide-out-right': !showSubNav,
                    'animating': isAnimating 
                }"
            >
                <AirportSubNavBar 
                    :is-mobile="isMobile"
                    :active-item="activeSubItem"
                    :selected-airport="selectedAirport"
                    @go-home="goHome"
                    @navigate="handleSubNavClick"
                />
            </div>

            <!-- 航路子导航 -->
            <div
                v-show="currentPage === 'enroute'"
                class="sub-nav-container"
                :class="{ 
                    'slide-in-right': showSubNav,
                    'slide-out-right': !showSubNav,
                    'animating': isAnimating 
                }"
            >
                <EnrouteSubNavBar 
                    :is-mobile="isMobile"
                    :active-item="activeSubItem"
                    @go-home="goHome"
                    @navigate="handleSubNavClick"
                />
            </div>

            <!-- SUP子导航 -->
            <div
                v-show="currentPage === 'sup'"
                class="sub-nav-container"
                :class="{ 
                    'slide-in-right': showSubNav,
                    'slide-out-right': !showSubNav,
                    'animating': isAnimating 
                }"
            >
                <SupSubNavBar 
                    :is-mobile="isMobile"
                    :active-item="activeSubItem"
                    @go-home="goHome"
                    @navigate="handleSubNavClick"
                />
            </div>

            <!-- AIC子导航 -->
            <div
                v-show="currentPage === 'aic'"
                class="sub-nav-container"
                :class="{ 
                    'slide-in-right': showSubNav,
                    'slide-out-right': !showSubNav,
                    'animating': isAnimating 
                }"
            >
                <AicSubNavBar 
                    :is-mobile="isMobile"
                    :active-item="activeSubItem"
                    @go-home="goHome"
                    @navigate="handleSubNavClick"
                />
            </div>

            <!-- NOTAM子导航 -->
            <div
                v-show="currentPage === 'notam'"
                class="sub-nav-container"
                :class="{ 
                    'slide-in-right': showSubNav,
                    'slide-out-right': !showSubNav,
                    'animating': isAnimating 
                }"
            >
                <NotamSubNavBar 
                    :is-mobile="isMobile"
                    :active-item="activeSubItem"
                    @go-home="goHome"
                    @navigate="handleSubNavClick"
                />
            </div>
        </nav>
    </NavBarContainer>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted, watch, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@vicons/utils'
import pubsub from 'pubsub-js'
import {
    AirplaneOutline,
    MapOutline,
    FlashOutline,
    BookmarkOutline,
    DocumentTextOutline,
    AddCircleOutline,
    DocumentAttachOutline
} from '@vicons/ionicons5'
import NavBarContainer from './NavBarContainer.vue'
import AirportSubNavBar from './SubNavBar/AirportSubNavBar.vue'
import EnrouteSubNavBar from './SubNavBar/EnrouteSubNavBar.vue'
import SupSubNavBar from './SubNavBar/SupSubNavBar.vue'
import AicSubNavBar from './SubNavBar/AicSubNavBar.vue'
import NotamSubNavBar from './SubNavBar/NotamSubNavBar.vue'

const router = useRouter()
const route = useRoute()

const activeItem = ref('home')
const isMobile = ref(false)

// 从首页到点击到其他页面的导航，有动画和具体内容切换
const currentPage = ref('home')
const isHome = computed(() => currentPage.value === 'home')

// 动画控制
const isAnimating = ref(false)
const showList = ref(true)
const showSubNav = ref(false)

// 子导航状态
const activeSubItem = ref('')
const selectedAirport = ref('') // 默认机场

const navItems = ref([
    {
        id: 'airports',
        label: '机场图',
        icon: markRaw(AirplaneOutline),
        route: '/airports'
    },
    {
        id: 'enroute',
        label: '航路图',
        icon: markRaw(MapOutline),
        route: '/enroute'
    },
    {
        id: 'amdt',
        label: 'AMDT',
        icon: markRaw(BookmarkOutline),
        route: '/amdt'
    },
    // todo SUP的JSON结构整理
    // {
    //     id: 'sup',
    //     label: 'SUP',
    //     icon: markRaw(AddCircleOutline),
    //     route: '/sup'
    // },
    {
        id: 'aic',
        label: 'AIC',
        icon: markRaw(FlashOutline),
        route: '/aic'
    },
    {
        id: 'notam',
        label: 'NOTAM',
        icon: markRaw(DocumentTextOutline),
        route: '/notam'
    }
])

const iconSize = computed(() => isMobile.value ? '24' : '20')

const handleNavClick = (item: any) => {
    activeItem.value = item.id
    currentPage.value = item.id
    if (item.route) {
        router.push(item.route)
    }
}

// 处理子导航点击
const handleSubNavClick = (item: any) => {
    activeSubItem.value = item.id
    
    // 广播子导航切换事件
    pubsub.publish('sub-nav-navigate', item)
    
    if (item.route) {
        router.push(item.route)
    }
}

// 返回首页的方法
const goHome = () => {
    currentPage.value = 'home'
    activeItem.value = 'home'
    router.push('/')
}

// 暴露给父组件使用
defineExpose({
    goHome
})

const handleResize = () => {
    isMobile.value = window.innerWidth < 768
}

// 监听路由变化，自动更新当前页面状态
watch(() => route.path, (newPath) => {
    const foundItem = navItems.value.find(item => 
        item.route === newPath || (item.route !== '/' && newPath.startsWith(item.route))
    )
    
    if (foundItem) {
        activeItem.value = foundItem.id
        currentPage.value = foundItem.id
    } else if (newPath === '/') {
        activeItem.value = 'home'
        currentPage.value = 'home'
    }
})

// 监听isHome变化，控制动画
watch(isHome, (newValue, oldValue) => {
    if (newValue !== oldValue) {
        isAnimating.value = true
        
        // 统一动画时长
        const animationDuration = 400
        
        if (!newValue) {
            // 进入子页面 - 主导航向左滑出，子导航从右侧滑入
            showList.value = false
            
            // 稍微延迟显示子导航，让主导航先开始滑出
            setTimeout(() => {
                if (currentPage.value === 'airports' || currentPage.value === 'enroute' || currentPage.value === 'sup' || currentPage.value === 'aic' || currentPage.value === 'notam') {
                    showSubNav.value = true
                }
            }, 100)
            
            setTimeout(() => {
                isAnimating.value = false
            }, animationDuration)
            
        } else {
            // 返回首页 - 子导航向右滑出，主导航从左侧滑入
            showSubNav.value = false
            
            // 稍微延迟显示主导航，让子导航先开始滑出
            setTimeout(() => {
                showList.value = true
            }, 100)
            
            setTimeout(() => {
                isAnimating.value = false
            }, animationDuration)
        }
    }
})

// 监听currentPage变化，确保进入airports时显示子导航
watch(() => currentPage.value, (newPage) => {
    if (newPage === 'airports') {
        // 确保子导航显示
        showSubNav.value = true
        // 为机场子导航设置默认选中项
        if (!activeSubItem.value) {
            activeSubItem.value = 'airport-chart'
        }
    } else if (newPage === 'enroute') {
        // 确保子导航显示
        showSubNav.value = true
        // 为航路子导航设置默认选中项
        if (!activeSubItem.value) {
            activeSubItem.value = 'enroute-chart'
        }
    } else if (newPage === 'sup') {
        // 确保子导航显示
        showSubNav.value = true
        // 为SUP子导航设置默认选中项
        if (!activeSubItem.value) {
            activeSubItem.value = 'sup-list'
        }
    } else if (newPage === 'aic') {
        // 确保子导航显示
        showSubNav.value = true
        // 为AIC子导航设置默认选中项
        if (!activeSubItem.value) {
            activeSubItem.value = 'aic-list'
        }
    } else if (newPage === 'notam') {
        // 确保子导航显示
        showSubNav.value = true
        // 为NOTAM子导航设置默认选中项
        if (!activeSubItem.value) {
            activeSubItem.value = 'notam-list'
        }
    } else if (newPage === 'home') {
        showSubNav.value = false
        activeSubItem.value = ''
    }
})

// 监听机场选择事件
const handleAirportSelected = (message: string, airport: AirportList) => {
    selectedAirport.value = airport.airporticao
}

onMounted(() => {
    handleResize()
    // 初始化时设置当前路由状态，但不需要调用setActiveFromRoute，因为路由监听器会自动处理
    window.addEventListener('resize', handleResize)
    
    // 订阅机场选择事件
    pubsub.subscribe('airport-selected', handleAirportSelected)
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    
    // 取消订阅
    pubsub.unsubscribe('airport-selected')
})
</script>

<style lang='scss' scoped>
.app-nav-bar {
    position: relative;
    width: var(--nav-width-sidebar-md);
    // height: calc(100vh - var(--header-height) - 40px);
    height: 100%;
    background: var(--nav-bg);
    // border-radius: var(--radius-md);
    padding: var(--spacing-sm) 0;
    box-shadow: var(--shadow-medium);

    .nav-list {
        list-style: none;
        margin: 0;
        padding: var(--spacing-lg) 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        gap: var(--spacing-md);
        // justify-content: center;
        
        // 动画相关样式
        transform: translateX(0);
        opacity: 1;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        
        // 向左滑出动画
        &.slide-out {
            transform: translateX(-100%);
            opacity: 0;
        }
        
        // 从左侧滑入动画
        &.slide-in {
            transform: translateX(0);
            opacity: 1;
        }
        
        // 动画进行中时禁用指针事件
        &.animating {
            pointer-events: none;
        }

        .nav-item {
            margin: 0;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;


            .nav-button {
                width: calc(100% - var(--spacing-sm));
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-xs);
                background: transparent;
                border: none;
                border-radius: var(--radius-sm);
                color: var(--nav-text-secondary);
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 50px;
                max-height: 60px;

                &:hover {
                    background: var(--nav-hover-bg);
                    color: var(--nav-text);
                }

                &.active {
                    background: var(--nav-active-bg);
                    color: var(--nav-accent);

                    .nav-icon {
                        color: var(--nav-accent);
                    }
                }

                .nav-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 4px;
                    transition: color 0.2s ease;
                }

                .nav-label {
                    font-size: 10px;
                    font-weight: 500;
                    text-align: center;
                    line-height: 1.1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }
            }
        }
    }

    // 子导航容器样式
    .sub-nav-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: var(--radius-md);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

        &.slide-in-right {
            transform: translateX(0);
            opacity: 1;
        }

        &.slide-out-right {
            transform: translateX(100%);
            opacity: 0;
        }

        &.animating {
            pointer-events: none;
        }
    }
}

// 动画关键帧定义 - 统一的缓动动画
@keyframes slideInFromLeft {
    0% {
        transform: translateX(-100%);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideInFromRight {
    0% {
        transform: translateX(100%);
        opacity: 0;
    }
    70% {
        transform: translateX(10%);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

@media (min-width: 1920px) {

    .app-nav-bar {
        width: var(--nav-width-sidebar-xl);

        .nav-list {
            .nav-item {
                .nav-button {
                    min-height: 60px;
                    max-height: 75px;

                    .nav-label {
                        font-size: 11px;
                    }
                }
            }
        }
    }
}

@media (min-width: 1440px) and (max-width: 1919px) {

    .app-nav-bar {
        width: var(--nav-width-sidebar-lg);

        .nav-list {
            .nav-item {
                .nav-button {
                    min-height: 55px;
                    max-height: 65px;

                    .nav-label {
                        font-size: 10px;
                    }
                }
            }
        }
    }


    @media (min-width: 768px) and (max-width: 1023px) {

        .app-nav-bar {
            width: var(--nav-width-sidebar-sm);

            .nav-list {
                padding: var(--spacing-md) 0;

                .nav-item {

                    .nav-button {
                        min-height: 45px;
                        max-height: 55px;

                        .nav-label {
                            font-size: 9px;
                        }
                    }
                }
            }
        }
    }
}

@media (max-width: 767px) {

    .app-nav-bar {
        border-radius: 0;
        height: 100%;

        .nav-list {
            flex-direction: column;
            justify-content: flex-start;
            align-items: stretch;
            gap: var(--spacing-xs);
            padding: var(--spacing-md) 0;

            .nav-item {
                flex: none;
                display: flex;
                justify-content: center;

                .nav-button {
                    min-height: 45px;
                    height: auto;
                    padding: var(--spacing-xs);
                    margin: 0 var(--spacing-xs);
                    max-width: none;
                    width: calc(100% - var(--spacing-sm));

                    .nav-icon {
                        margin-bottom: 2px;
                    }

                    .nav-label {
                        font-size: 9px;
                        font-weight: 500;
                        line-height: 1.2;
                    }
                }
            }
        }

        // 移动端子导航容器 - 使用与桌面端相同的动画
        .sub-nav-container {
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--nav-bg);
            border-radius: 0;
        }
    }
}

@media (max-width: 480px) {
    .app-nav-bar {
        padding: 2px var(--spacing-xs);

        .nav-list {
            .nav-item {
                .nav-button {
                    padding: 2px;
                    max-width: 50px;

                    .nav-label {
                        font-size: 9px;
                    }
                }
            }
        }
    }
}

@media (max-width: 767px) and (orientation: landscape) {

    .app-nav-bar {
        .nav-list {
            .nav-item {
                .nav-button {
                    .nav-label {
                        display: none;
                    }
                }
            }
        }
    }
}
</style>