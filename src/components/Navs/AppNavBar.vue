<template>
    <NavBarContainer>
        <nav class="app-nav-bar">
            <ul class="nav-list">
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
        </nav>
    </NavBarContainer>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@vicons/utils'
import {
    AirplaneOutline,
    MapOutline,
    FlashOutline,
    BookmarkOutline,
    DocumentTextOutline,
    AddCircleOutline
} from '@vicons/ionicons5'
import NavBarContainer from './NavBarContainer.vue'

const router = useRouter()
const route = useRoute()

const activeItem = ref('home')
const isMobile = ref(false)

// 从首页到点击到其他页面的导航，有动画和具体内容切换
const currentPage = ref('home')
const isHome = ref(currentPage.value === 'home')

const navItems = ref([
    {
        id: 'airports',
        label: '机场图',
        icon: AirplaneOutline,
        route: '/airports'
    },
    {
        id: 'enroute',
        label: '航路图',
        icon: MapOutline,
        route: '/enroute'
    },
    {
        id: 'amdt',
        label: 'AMDT',
        icon: BookmarkOutline,
        route: '/amdt'
    },
    {
        id: 'sup',
        label: 'SUP',
        icon: AddCircleOutline,
        route: '/sup'
    },
    {
        id: 'aic',
        label: 'AIC',
        icon: FlashOutline,
        route: '/aic'
    },
    {
        id: 'notam',
        label: 'NOTAM',
        icon: DocumentTextOutline,
        route: '/notam'
    }
])

const iconSize = computed(() => isMobile.value ? '24' : '20')

const handleNavClick = (item: any) => {
    activeItem.value = item.id
    if (item.route) {
        router.push(item.route)
    }
}

const handleResize = () => {
    isMobile.value = window.innerWidth < 768
}

const setActiveFromRoute = () => {
    const path = route.path
    const foundItem = navItems.value.find(item =>
        item.route === path || (item.route !== '/' && path.startsWith(item.route))
    )
    if (foundItem) {
        activeItem.value = foundItem.id
    }
}

onMounted(() => {
    handleResize()
    setActiveFromRoute()
    window.addEventListener('resize', handleResize)
})
</script>

<style lang='scss' scoped>
.app-nav-bar {
    position: relative;
    width: var(--nav-width-sidebar-md);
    height: calc(100vh - var(--header-height) - 40px);
    background: var(--nav-bg);
    border-radius: var(--radius-md);
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
        gap: var(--spacing-xs);

        justify-content: center;

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
        width: 100%;
        height: 100%;
        background: transparent;
        border-radius: 0;
        padding: 4px var(--spacing-sm);
        box-shadow: none;

        .nav-list {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            gap: 0;

            .nav-item {
                flex: 1;
                display: flex;
                justify-content: center;

                .nav-button {
                    min-height: auto;
                    height: auto;
                    padding: 4px;
                    margin: 0;
                    max-width: 60px;

                    .nav-icon {
                        margin-bottom: 1px;
                    }

                    .nav-label {
                        font-size: 8px;
                        font-weight: 600;
                        line-height: 1;
                    }
                }
            }
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
                        font-size: 7px;
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