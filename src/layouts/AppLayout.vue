<template>
  <div class="app-layout">
    <!-- Application Header -->
    <AppHeader
      :title="pageTitle"
      :subtitle="pageSubtitle"
      @open-settings="openSettings"
    />

    <AppNavBar />

    <main 
      class="main-content"
      :class="{ 
        'nav-open': isNavOpen,
        'mobile': isMobile
      }"
    >
      <div class="content-container">
        <!-- Router View for page content -->
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppHeader from '@/components/Navs/AppHeader.vue'
import AppNavBar from '@/components/Navs/AppNavBar.vue'

// Router
const router = useRouter()
const route = useRoute()

// State
const isNavOpen = ref(false)
const isMobile = ref(false)
const hasNotifications = ref(false)
const notificationCount = ref(0)
const isOnline = ref(navigator.onLine)
const lastSyncTime = ref<Date>(new Date())

// Navigation state
const activeNavItem = ref('home')
const activeSecondaryItem = ref('')

// Remove breadcrumbs - not part of this design

// Computed properties
const pageTitle = computed(() => {
  // Get title from route meta or use default
  return route.meta?.title as string || 'eAIP Charts EFB'
})

const pageSubtitle = computed(() => {
  return route.meta?.subtitle as string || ''
})


const openSettings = () => {
  router.push('/settings')
}

// Responsive handling
const handleResize = () => {
  const width = window.innerWidth
  isMobile.value = width < 768
  
  // Auto-close navigation on mobile when switching from desktop
  if (isMobile.value && isNavOpen.value) {
    isNavOpen.value = false
  }
}

// Online/offline handling
const handleOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('online', handleOnlineStatus)
  window.removeEventListener('offline', handleOnlineStatus)
})
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--primary-bg);
  color: var(--text-primary);
}

.main-content {
  flex: 1;
  margin-top: var(--header-height);
  margin-left: var(--nav-width-sidebar-md); // Default medium screen navigation width
  margin-bottom: 0;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .content-container {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
    background: var(--content-bg);

    @media (max-width: 768px) {
      padding: var(--spacing-md);
    }

    @media (max-width: 480px) {
      padding: var(--spacing-sm);
    }
  }
}

// Page transition animations
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

// Extra Large Screens (1920px+)
@media (min-width: 1920px) {
  .main-content {
    margin-left: var(--nav-width-sidebar-xl);
  }
}

// Large Screens (1440px - 1919px)
@media (min-width: 1440px) and (max-width: 1919px) {
  .main-content {
    margin-left: var(--nav-width-sidebar-lg);
  }
}

// Small Desktop Screens (768px - 1023px)
@media (min-width: 768px) and (max-width: 1023px) {
  .main-content {
    margin-left: var(--nav-width-sidebar-sm);
  }
}

// Mobile specific styles
@media (max-width: 767px) {
  .main-content {
    margin-left: 0; // No left margin on mobile
    margin-bottom: var(--bottom-nav-height); // Space for bottom navigation
  }
}

// Ensure content doesn't get hidden behind header on small screens
@media (max-height: 600px) {
  .content-container {
    padding-top: var(--spacing-md);
  }
}
</style>