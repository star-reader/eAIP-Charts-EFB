<template>
  <header class="app-header">
    <div class="header-center">
      <h1 class="page-title">{{ title }}</h1>
      <span class="page-subtitle" v-if="subtitle">{{ subtitle }}</span>
    </div>

    <div class="header-right">
      <button 
        v-if="showInstallButton"
        class="action-btn install-btn"
        @click="handleInstall"
        aria-label="安装应用"
      >
        <Icon size="20">
          <DownloadOutline />
        </Icon>
      </button>

      <button 
        class="action-btn theme-toggle"
        @click="toggleTheme"
        :aria-label="isDarkTheme ? 'Switch to day mode' : 'Switch to night mode'"
      >
        <Icon size="20">
          <SunnyOutline v-if="isDarkTheme" />
          <MoonOutline v-else />
        </Icon>
      </button>

      <button 
        class="action-btn fullscreen-btn"
        @click="toggleFullscreen"
        aria-label="Toggle Fullscreen"
      >
        <Icon size="20">
          <ScanOutline />
        </Icon>
      </button>

      <button 
        class="action-btn settings-btn"
        @click="openSettings"
        aria-label="Settings"
      >
        <Icon size="20">
          <SettingsOutline />
        </Icon>
      </button>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Icon } from '@vicons/utils'
import pubsub from 'pubsub-js'
import { 
  SunnyOutline, 
  MoonOutline, 
  ScanOutline, 
  SettingsOutline,
  DownloadOutline
} from '@vicons/ionicons5'

// Props
interface Props {
  title: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'eAIP Charts EFB',
  subtitle: ''
})

// Emits
interface Emits {
  toggleNavigation: []
  openSettings: []
  toggleTheme: []
  toggleFullscreen: []
}

const emit = defineEmits<Emits>()

// State
const _theme = localStorage.getItem('theme')
const isDarkTheme = ref(_theme === 'night')
const showInstallButton = ref(false)
const deferredPrompt = ref<any>(null)

// PWA 安装相关
const setupPWAInstall = () => {
  // 监听 beforeinstallprompt 事件
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showInstallButton.value = true
  })

  // 监听安装完成事件
  window.addEventListener('appinstalled', () => {
    showInstallButton.value = false
    deferredPrompt.value = null
  })

  // 检查是否已经安装
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showInstallButton.value = false
  } else {
    // 如果浏览器不支持 beforeinstallprompt，也显示按钮
    // 用户可以手动通过浏览器菜单安装
    setTimeout(() => {
      if (!deferredPrompt.value) {
        showInstallButton.value = true
      }
    }, 1000)
  }
}

const handleInstall = async () => {
  if (deferredPrompt.value) {
    // 使用浏览器原生安装提示
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      showInstallButton.value = false
    }
    
    deferredPrompt.value = null
  } else {
    // 浏览器不支持原生安装提示，发布事件让父组件显示提示
    pubsub.publish('show-install-guide')
  }
}

const openSettings = () => {
  emit('openSettings')
}

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  const theme = isDarkTheme.value ? 'night' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  pubsub.publish('theme-changed', theme)
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

onMounted(() => {
  setupPWAInstall()
})
</script>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  height: calc(var(--header-height) + var(--safe-area-inset-top));
  background: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border-color);
  padding: 0 var(--spacing-lg);
  padding-top: var(--safe-area-inset-top);
  padding-left: max(var(--spacing-lg), var(--safe-area-inset-left));
  padding-right: max(var(--spacing-lg), var(--safe-area-inset-right));
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-header);
  box-shadow: var(--shadow-light);
  user-select: none;

  .header-left {
    display: flex;
    align-items: center;
    flex: 0 0 auto;

    .nav-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      color: var(--text-inverse);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--nav-hover-bg);
      }

      &:active {
        background: var(--nav-active-bg);
      }
    }
  }

  .header-center {
    position: absolute;
    left: 50%;
    top: calc(50% + var(--safe-area-inset-top)/2);
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    white-space: nowrap;

    .page-title {
      font-size: var(--font-size-md);
      font-weight: 400;
      color: var(--text-inverse);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .page-subtitle {
      font-size: var(--font-size-xs);
      font-weight: 300;
      color: var(--nav-text-secondary);
      margin-top: 1px;
      white-space: nowrap;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-left: auto;
    z-index: 1;

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      color: var(--text-inverse);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--nav-hover-bg);
        color: var(--nav-accent);
      }

      &:active {
        background: var(--nav-active-bg);
      }

      &.theme-toggle:hover {
        color: var(--warning-yellow);
      }

      &.fullscreen-btn:hover {
        color: var(--accent-cyan);
      }

      &.settings-btn:hover {
        color: var(--primary-blue);
      }

      &.install-btn:hover {
        color: var(--success-green);
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .app-header {
    padding: 0 var(--spacing-md);

    .header-center {
      .page-title {
        font-size: var(--font-size-lg);
        font-weight: 500;
      }
      
      .page-subtitle {
        font-size: 12px;
      }
    }

    .header-right {
      gap: var(--spacing-xs);
    }
  }
  .header-center {
    display: none !important;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 0 var(--spacing-sm);

    .header-center {
      .page-title {
        font-size: var(--font-size-md);
        font-weight: 500;
      }
      
      .page-subtitle {
        font-size: 11px;
      }
    }

    .header-right {
      // On very small screens, show only the most important buttons
      .fullscreen-btn {
        display: none;
      }
    }
  }
  .header-center {
    display: none !important;
  }
}
</style>
