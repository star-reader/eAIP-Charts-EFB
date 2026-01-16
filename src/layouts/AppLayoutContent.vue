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
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <keep-alive>
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Settings Modal -->
    <SettingsModal 
      :visible="isSettingsOpen" 
      @update:visible="isSettingsOpen = $event"
      @close="isSettingsOpen = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useDialog } from 'naive-ui'
import pubsub from 'pubsub-js'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/Navs/AppHeader.vue'
import AppNavBar from '@/components/Navs/AppNavBar.vue'
import SettingsModal from '@/components/Settings/SettingsModal.vue'

// Router
const router = useRouter()

// Dialog
const dialog = useDialog()

// State
const isNavOpen = ref(false)
const isMobile = ref(false)
const isOnline = ref(navigator.onLine)
const isSettingsOpen = ref(false)
const isDarkTheme = ref(localStorage.getItem('theme') === 'night')

interface TitleChangeData {
  title: string
  subTitle?: string
}

// Computed properties
const pageTitle = ref('eAIP Charts')
const pageSubtitle = ref('')

const openSettings = () => {
  isSettingsOpen.value = true
}

// 检测平台
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const isIOS = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

// 显示安装引导
const showInstallGuide = () => {
  const mobile = isMobileDevice()
  const ios = isIOS()
  const safari = isSafari()
  
  let message = ''
  
  if (ios) {
    message = '请点击浏览器底部的"分享"按钮，然后选择"添加到主屏幕"来安装应用。'
  } else if (mobile) {
    message = '请点击浏览器菜单，选择"添加到主屏幕"或"安装应用"来安装。'
  } else if (safari) {
    message = '请点击浏览器菜单栏的"文件" > "添加到程序坞"来安装应用。'
  } else {
    message = '请点击浏览器地址栏右侧的安装图标，或通过浏览器菜单选择"安装应用"。'
  }
  
  dialog.info({
    title: '安装应用',
    content: message,
    positiveText: '知道了'
  })
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

  pubsub.subscribe('title-change', (_, data: TitleChangeData) => {
    pageTitle.value = data.title
    pageSubtitle.value = data.subTitle || ''
  })

  // 监听主题变化
  pubsub.subscribe('theme-changed', (_, theme: string) => {
    isDarkTheme.value = theme === 'night'
  })

  // 监听安装引导请求
  pubsub.subscribe('show-install-guide', () => {
    showInstallGuide()
  })

  // 初始化主题
  const theme = localStorage.getItem('theme')
  isDarkTheme.value = theme === 'night'
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('online', handleOnlineStatus)
  window.removeEventListener('offline', handleOnlineStatus)
  pubsub.unsubscribe('title-change')
  pubsub.unsubscribe('theme-changed')
  pubsub.unsubscribe('show-install-guide')
})
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--primary-bg);
  color: var(--text-primary);
  padding-top: var(--safe-area-inset-top);
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
    padding: 0;
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
    margin-left: var(--nav-width-sidebar-sm); // Space for left navigation on mobile
    margin-bottom: 0; // No bottom margin since nav is on left
  }
}

// Ensure content doesn't get hidden behind header on small screens
@media (max-height: 600px) {
  .content-container {
    padding-top: var(--spacing-md);
  }
}
</style>
