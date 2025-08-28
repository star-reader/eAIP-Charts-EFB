<template>
  <aside 
    class="nav-drawer"
    :class="{ 
      'is-open': isOpen,
      'is-home-mode': isHomeMode,
      'is-secondary-mode': !isHomeMode
    }"
  >
    <!-- Navigation Header -->
    <div class="nav-header">
      <div class="nav-header-content">
        <h2 class="nav-title">{{ currentTitle }}</h2>
        <button 
          v-if="!isHomeMode"
          class="back-btn"
          @click="goBack"
          aria-label="Go back to main navigation"
        >
                      <Icon>
              <ArrowBackOutline />
            </Icon>
        </button>
      </div>
    </div>

    <!-- Primary Navigation (Home Mode) -->
    <nav class="primary-nav" v-show="isHomeMode">
      <ul class="nav-list">
        <li 
          v-for="item in primaryNavItems" 
          :key="item.id"
          class="nav-item"
        >
          <button
            class="nav-link"
            :class="{ 
              'active': activeItem === item.id,
              'has-children': item.children && item.children.length > 0
            }"
            @click="handleNavClick(item)"
          >
            <span class="nav-icon">
              <Icon>
                <component :is="getIconComponent(item.icon)" />
              </Icon>
            </span>
            <span class="nav-label">{{ item.label }}</span>
            <Icon 
              v-if="item.children && item.children.length > 0"
              class="nav-arrow" 
            >
              <ChevronForwardOutline />
            </Icon>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Secondary Navigation (Category Mode) -->
    <nav class="secondary-nav" v-show="!isHomeMode">
      <div class="secondary-nav-content">
        <!-- Category header with airport/region info -->
        <div class="category-header" v-if="currentCategory">
          <div class="category-info">
            <h3 class="category-title">{{ currentCategory.label }}</h3>
            <p class="category-subtitle" v-if="currentCategory.subtitle">
              {{ currentCategory.subtitle }}
            </p>
          </div>
        </div>

        <!-- Secondary navigation items -->
        <ul class="nav-list secondary">
          <li 
            v-for="item in secondaryNavItems" 
            :key="item.id"
            class="nav-item"
          >
            <button
              class="nav-link"
              :class="{ 
                'active': activeSecondaryItem === item.id,
                'expandable': item.children && item.children.length > 0
              }"
              @click="handleSecondaryNavClick(item)"
            >
              <span class="nav-icon" v-if="item.icon">
                <Icon>
                  <component :is="getIconComponent(item.icon)" />
                </Icon>
              </span>
              <span class="nav-label">{{ item.label }}</span>
              <span class="nav-badge" v-if="item.count">{{ item.count }}</span>
              <Icon 
                v-if="item.children && item.children.length > 0"
                class="nav-arrow" 
                :class="{ 'expanded': expandedItems.includes(item.id) }"
              >
                <ChevronDownOutline />
              </Icon>
            </button>

            <!-- Expandable sub-items -->
            <ul 
              v-if="item.children && expandedItems.includes(item.id)"
              class="sub-nav-list"
            >
              <li 
                v-for="subItem in item.children" 
                :key="subItem.id"
                class="sub-nav-item"
              >
                <button
                  class="sub-nav-link"
                  :class="{ 'active': activeSecondaryItem === subItem.id }"
                  @click="handleSecondaryNavClick(subItem)"
                >
                  <span class="sub-nav-label">{{ subItem.label }}</span>
                  <span class="sub-nav-badge" v-if="subItem.count">{{ subItem.count }}</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Navigation Footer -->
    <div class="nav-footer">
      <div class="nav-status">
        <div class="online-status" :class="{ 'offline': !isOnline }">
          <div class="status-indicator"></div>
          <span class="status-text">{{ isOnline ? 'Online' : 'Offline' }}</span>
        </div>
        <div class="data-sync" v-if="lastSyncTime">
          <span class="sync-text">Last sync: {{ formatSyncTime(lastSyncTime) }}</span>
        </div>
      </div>
    </div>
  </aside>

  <!-- Backdrop for mobile -->
  <div 
    v-if="isOpen && isMobile"
    class="nav-backdrop"
    @click="closeDrawer"
  ></div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { Icon } from '@vicons/utils'
import { 
  ArrowBackOutline,
  ChevronForwardOutline,
  ChevronDownOutline,
  HomeOutline,
  AirplaneOutline,
  MapOutline,
  CloudyOutline,
  FlashOutline,
  BookmarkOutline,
  SettingsOutline
} from '@vicons/ionicons5'

// Types
interface NavItem {
  id: string
  label: string
  icon?: string
  route?: string
  children?: NavItem[]
  count?: number
  subtitle?: string
}

// Props
interface Props {
  isOpen: boolean
  isMobile?: boolean
  activeItem?: string
  activeSecondaryItem?: string
  isOnline?: boolean
  lastSyncTime?: Date
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  isMobile: false,
  activeItem: '',
  activeSecondaryItem: '',
  isOnline: true,
  lastSyncTime: undefined
})

// Emits
interface Emits {
  close: []
  navigate: [item: NavItem]
  goBack: []
}

const emit = defineEmits<Emits>()

// State
const isHomeMode = ref(true)
const currentCategory = ref<NavItem | null>(null)
const expandedItems = ref<string[]>([])

// Primary navigation items (main categories)
const primaryNavItems = ref<NavItem[]>([
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    route: '/'
  },
  {
    id: 'airports',
    label: 'Airports',
    icon: 'airport',
    children: []
  },
  {
    id: 'enroute',
    label: 'Enroute',
    icon: 'route',
    children: []
  },
  {
    id: 'weather',
    label: 'Weather',
    icon: 'weather',
    route: '/weather'
  },
  {
    id: 'flight-plan',
    label: 'Flight Plan',
    icon: 'flight-plan',
    route: '/flight-plan'
  },
  {
    id: 'charts',
    label: 'Saved Charts',
    icon: 'bookmark',
    route: '/saved-charts'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    route: '/settings'
  }
])

// Secondary navigation items (specific to selected category)
const secondaryNavItems = ref<NavItem[]>([])

// Computed
const currentTitle = computed(() => {
  if (isHomeMode.value) {
    return 'Navigation'
  }
  return currentCategory.value?.label || 'Back'
})

// Methods
const handleNavClick = (item: NavItem) => {
  if (item.children && item.children.length > 0) {
    // Switch to secondary navigation mode
    isHomeMode.value = false
    currentCategory.value = item
    secondaryNavItems.value = item.children
  } else {
    // Direct navigation
    emit('navigate', item)
  }
}

const handleSecondaryNavClick = (item: NavItem) => {
  if (item.children && item.children.length > 0) {
    // Toggle expansion of sub-items
    const index = expandedItems.value.indexOf(item.id)
    if (index > -1) {
      expandedItems.value.splice(index, 1)
    } else {
      expandedItems.value.push(item.id)
    }
  } else {
    // Navigate to specific item
    emit('navigate', item)
  }
}

const goBack = () => {
  isHomeMode.value = true
  currentCategory.value = null
  secondaryNavItems.value = []
  expandedItems.value = []
  emit('goBack')
}

const closeDrawer = () => {
  emit('close')
}

const getIconComponent = (iconName?: string) => {
  // Return appropriate icon component based on iconName
  const icons: Record<string, any> = {
    home: HomeOutline,
    airport: AirplaneOutline,
    route: MapOutline,
    weather: CloudyOutline,
    'flight-plan': FlashOutline,
    bookmark: BookmarkOutline,
    settings: SettingsOutline
  }
  return icons[iconName || ''] || HomeOutline
}

const formatSyncTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Watch for changes to reset state when drawer closes
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    // Reset to home mode when drawer closes
    isHomeMode.value = true
    currentCategory.value = null
    secondaryNavItems.value = []
    expandedItems.value = []
  }
})
</script>

<style lang="scss" scoped>
.nav-drawer {
  position: fixed;
  top: var(--header-height);
  left: 0;
  bottom: 0;
  width: var(--nav-width-desktop);
  background: var(--nav-bg);
  border-right: 1px solid var(--border-color);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: var(--z-nav);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.is-open {
    transform: translateX(0);
  }

  .nav-header {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md);
    border-bottom: 1px solid var(--nav-border-color);
    background: var(--nav-bg);

    .nav-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .nav-title {
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--nav-text);
        margin: 0;
      }

      .back-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: transparent;
        border: none;
        border-radius: var(--radius-md);
        color: var(--nav-text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--nav-hover-bg);
          color: var(--nav-text);
        }
      }
    }
  }

  .primary-nav,
  .secondary-nav {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) 0;

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;

      &.secondary {
        padding: 0 var(--spacing-md);
      }

      .nav-item {
        margin-bottom: var(--spacing-xs);

        .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          padding: var(--spacing-md);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--nav-text-secondary);
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 0 var(--spacing-md);

          &:hover {
            background: var(--nav-hover-bg);
            color: var(--nav-text);
          }

          &.active {
            background: var(--nav-active-bg);
            color: var(--nav-accent);
            border: 1px solid var(--nav-accent);
          }

          .nav-icon {
            width: 24px;
            height: 24px;
            margin-right: var(--spacing-md);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .nav-label {
            flex: 1;
            font-size: var(--font-size-md);
            font-weight: 500;
          }

          .nav-badge {
            background: var(--nav-accent);
            color: var(--text-inverse);
            border-radius: var(--radius-lg);
            padding: 2px 8px;
            font-size: var(--font-size-xs);
            font-weight: 600;
            margin-left: var(--spacing-sm);
          }

          .nav-arrow {
            margin-left: var(--spacing-sm);
            transition: transform 0.2s ease;

            &.expanded {
              transform: rotate(180deg);
            }
          }
        }

        .sub-nav-list {
          list-style: none;
          margin: var(--spacing-sm) 0 0 0;
          padding: 0;

          .sub-nav-item {
            margin-bottom: var(--spacing-xs);

            .sub-nav-link {
              width: 100%;
              display: flex;
              align-items: center;
              padding: var(--spacing-sm) var(--spacing-md);
              background: transparent;
              border: none;
              border-radius: var(--radius-sm);
              color: var(--text-muted);
              text-align: left;
              cursor: pointer;
              transition: all 0.2s ease;
              margin-left: var(--spacing-xl);

              &:hover {
                background: var(--hover-bg);
                color: var(--text-secondary);
              }

              &.active {
                background: var(--selected-bg);
                color: var(--primary-blue);
              }

              .sub-nav-label {
                flex: 1;
                font-size: var(--font-size-sm);
              }

              .sub-nav-badge {
                background: var(--text-muted);
                color: var(--text-inverse);
                border-radius: var(--radius-md);
                padding: 1px 6px;
                font-size: 10px;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }

  .secondary-nav {
    .category-header {
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      background: var(--glass-bg);
      border-radius: var(--radius-md);
      margin: 0 var(--spacing-md) var(--spacing-md);

      .category-info {
        .category-title {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs) 0;
        }

        .category-subtitle {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          margin: 0;
        }
      }
    }
  }

  .nav-footer {
    padding: var(--spacing-md);
    border-top: 1px solid var(--nav-border-color);
    background: var(--nav-bg);

    .nav-status {
      .online-status {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xs);

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--success-green);
        }

        &.offline .status-indicator {
          background: var(--error-red);
        }

        .status-text {
          font-size: var(--font-size-sm);
          color: var(--nav-text-secondary);
        }
      }

      .data-sync {
        .sync-text {
          font-size: var(--font-size-xs);
          color: var(--nav-text-secondary);
        }
      }
    }
  }
}

.nav-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  z-index: calc(var(--z-nav) - 1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

// Mobile responsiveness
@media (max-width: 768px) {
  .nav-drawer {
    width: var(--nav-width-tablet);
  }
}

@media (max-width: 480px) {
  .nav-drawer {
    width: 100vw;
    max-width: 320px;
  }
}
</style>
