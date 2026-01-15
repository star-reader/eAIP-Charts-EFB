<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="settings-overlay" @click.self="closeModal">
        <div class="settings-modal">
          <!-- 头部 -->
          <div class="modal-header">
            <h2 class="modal-title">设置</h2>
            <button class="close-btn" @click="closeModal" aria-label="关闭">
              <Icon size="20">
                <CloseOutline />
              </Icon>
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="modal-content">
            <!-- 数据管理 -->
            <section class="settings-section">
              <h3 class="section-title">
                <Icon size="18">
                  <CloudDownloadOutline />
                </Icon>
                数据管理
              </h3>
              
              <div class="section-content">
                <!-- 版本信息 -->
                <div class="info-row">
                  <span class="info-label">当前数据版本</span>
                  <span class="info-value">{{ localVersion?.version_id || '未下载' }}</span>
                </div>
                
                <div class="info-row" v-if="localVersion">
                  <span class="info-label">生效周期</span>
                  <span class="info-value">{{ localVersion.cycle || '-' }}</span>
                </div>

                <!-- 数据操作按钮 -->
                <div class="action-buttons">
                  <button 
                    class="action-btn primary"
                    @click="checkForUpdates"
                    :disabled="isChecking || isDownloading"
                  >
                    <Icon size="16">
                      <RefreshOutline />
                    </Icon>
                    {{ isChecking ? '检查中...' : '检查更新' }}
                  </button>
                  
                  <button 
                    class="action-btn"
                    @click="forceRedownload"
                    :disabled="isDownloading"
                  >
                    <Icon size="16">
                      <DownloadOutline />
                    </Icon>
                    {{ isDownloading ? '下载中...' : '重新下载数据' }}
                  </button>
                  
                  <button 
                    class="action-btn danger"
                    @click="confirmClearData"
                    :disabled="isDownloading"
                  >
                    <Icon size="16">
                      <TrashOutline />
                    </Icon>
                    清空本地数据
                  </button>
                </div>

                <!-- 下载进度 -->
                <div v-if="downloadProgress.visible" class="progress-section">
                  <div class="progress-text">{{ downloadProgress.step }}</div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }"
                    ></div>
                  </div>
                  <div class="progress-detail">{{ downloadProgress.current }} / {{ downloadProgress.total }}</div>
                </div>

                <!-- 状态消息 -->
                <div v-if="statusMessage" :class="['status-message', statusType]">
                  {{ statusMessage }}
                </div>
              </div>
            </section>

            <!-- 显示设置 -->
            <section class="settings-section">
              <h3 class="section-title">
                <Icon size="18">
                  <ColorPaletteOutline />
                </Icon>
                显示设置
              </h3>
              
              <div class="section-content">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">PDF缩放速度</span>
                    <span class="setting-desc">调整滚轮缩放的灵敏度</span>
                  </div>
                  <div class="setting-control">
                    <NSelect 
                      v-model:value="settings.zoomSpeed" 
                      :options="zoomSpeedOptions"
                      @update:value="saveSettings"
                      style="width: 120px"
                    />
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">默认缩放级别</span>
                    <span class="setting-desc">打开PDF时的初始缩放</span>
                  </div>
                  <div class="setting-control">
                    <NSelect 
                      v-model:value="settings.defaultZoom" 
                      :options="defaultZoomOptions"
                      @update:value="saveSettings"
                      style="width: 120px"
                    />
                  </div>
                </div>
              </div>
            </section>

            <!-- 关于 -->
            <section class="settings-section">
              <h3 class="section-title">
                <Icon size="18">
                  <InformationCircleOutline />
                </Icon>
                关于
              </h3>
              
              <div class="section-content">
                <div class="info-row">
                  <span class="info-label">应用名称</span>
                  <span class="info-value">eAIP Charts EFB</span>
                </div>
                <div class="info-row">
                  <span class="info-label">版本</span>
                  <span class="info-value">1.0.0</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Icon } from '@vicons/utils'
import { NSelect, useDialog } from 'naive-ui'
import {
  CloseOutline,
  CloudDownloadOutline,
  RefreshOutline,
  DownloadOutline,
  TrashOutline,
  ColorPaletteOutline,
  InformationCircleOutline
} from '@vicons/ionicons5'
import { 
  getLocalVersion, 
  checkNeedUpdate, 
  forceRedownloadAllData,
  checkDataIntegrity
} from '@/services/dataDownload/dataUpdateService'
import { clearAllData } from '@/services/storage/transcriptStorage'

// Dialog
const dialog = useDialog()

// Props
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

// State
const localVersion = ref<AIPVersion | null>(null)
const isChecking = ref(false)
const isDownloading = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error' | 'info'>('info')
const dataIntegrity = ref<boolean | null>(null)

const downloadProgress = reactive({
  visible: false,
  step: '',
  current: 0,
  total: 0
})

const settings = reactive({
  zoomSpeed: localStorage.getItem('pdfZoomSpeed') || 'normal',
  defaultZoom: localStorage.getItem('pdfDefaultZoom') || 'fit-width'
})

// Select options
const zoomSpeedOptions = [
  { label: '慢', value: 'slow' },
  { label: '正常', value: 'normal' },
  { label: '快', value: 'fast' }
]

const defaultZoomOptions = [
  { label: '适应宽度', value: 'fit-width' },
  { label: '适应页面', value: 'fit-page' },
  { label: '100%', value: '100' },
  { label: '150%', value: '150' }
]

// Methods
const closeModal = () => {
  emit('update:visible', false)
  emit('close')
}

const loadVersionInfo = () => {
  localVersion.value = getLocalVersion()
}

const checkIntegrity = async () => {
  dataIntegrity.value = null
  dataIntegrity.value = await checkDataIntegrity()
}

const checkForUpdates = async () => {
  isChecking.value = true
  statusMessage.value = ''
  
  try {
    const { needUpdate, remoteVersion } = await checkNeedUpdate()
    
    if (needUpdate) {
      statusMessage.value = `发现新版本: ${remoteVersion.version_id}，请点击"重新下载数据"更新`
      statusType.value = 'info'
    } else {
      statusMessage.value = '当前已是最新版本'
      statusType.value = 'success'
    }
  } catch (error) {
    statusMessage.value = `检查更新失败: ${error instanceof Error ? error.message : '未知错误'}`
    statusType.value = 'error'
  } finally {
    isChecking.value = false
  }
}

const forceRedownload = async () => {
  isDownloading.value = true
  downloadProgress.visible = true
  statusMessage.value = ''
  
  try {
    await forceRedownloadAllData((step, current, total) => {
      downloadProgress.step = step
      downloadProgress.current = current
      downloadProgress.total = total
    })
    
    statusMessage.value = '数据下载完成'
    statusType.value = 'success'
    loadVersionInfo()
    await checkIntegrity()
  } catch (error) {
    statusMessage.value = `下载失败: ${error instanceof Error ? error.message : '未知错误'}`
    statusType.value = 'error'
  } finally {
    isDownloading.value = false
    downloadProgress.visible = false
  }
}

const confirmClearData = () => {
  dialog.warning({
    title: '确认清空数据',
    content: '确定要清空所有本地数据吗？此操作不可恢复。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await clearAllData()
        localStorage.removeItem('aipVersion')
        localVersion.value = null
        statusMessage.value = '本地数据已清空'
        statusType.value = 'success'
        await checkIntegrity()
      } catch (error) {
        statusMessage.value = `清空数据失败: ${error instanceof Error ? error.message : '未知错误'}`
        statusType.value = 'error'
      }
    }
  })
}

const saveSettings = () => {
  localStorage.setItem('pdfZoomSpeed', settings.zoomSpeed)
  localStorage.setItem('pdfDefaultZoom', settings.defaultZoom)
}

// Watchers
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadVersionInfo()
    checkIntegrity()
  }
})

// Lifecycle
onMounted(() => {
  loadVersionInfo()
})
</script>

<style lang="scss" scoped>
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(4px);
}

.settings-modal {
  width: 90%;
  max-width: 560px;
  max-height: 85vh;
  background: var(--secondary-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-heavy);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--nav-bg);
  
  .modal-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--text-inverse);
    margin: 0;
  }
  
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--text-inverse);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--nav-hover-bg);
      color: var(--error-red);
    }
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.settings-section {
  margin-bottom: var(--spacing-lg);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--spacing-md);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
  }
  
  .section-content {
    padding: 0 var(--spacing-sm);
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  
  .info-label {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
  }
  
  .info-value {
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    
    &.success {
      color: var(--success-green);
    }
    
    &.warning {
      color: var(--warning-yellow);
    }
  }
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--hover-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      background: var(--active-bg);
      border-color: var(--primary-blue);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.primary {
      background: var(--primary-blue);
      border-color: var(--primary-blue);
      color: var(--text-inverse);
      
      &:hover:not(:disabled) {
        background: var(--secondary-blue);
      }
    }
    
    &.danger {
      &:hover:not(:disabled) {
        background: var(--error-red);
        border-color: var(--error-red);
        color: var(--text-inverse);
      }
    }
  }
}

.progress-section {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--hover-bg);
  border-radius: var(--radius-md);
  
  .progress-text {
    font-size: var(--font-size-sm);
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }
  
  .progress-bar {
    height: 6px;
    background: var(--border-color);
    border-radius: 3px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: var(--primary-blue);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
  }
  
  .progress-detail {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
    text-align: right;
  }
}

.status-message {
  padding: var(--spacing-sm);
  font-size: var(--font-size-sm);
  
  &.success {
    color: var(--success-green);
  }
  
  &.error {
    color: var(--error-red);
  }
  
  &.info {
    color: var(--primary-blue);
  }
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--divider-color);
  
  &:last-child {
    border-bottom: none;
  }
  
  .setting-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .setting-label {
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .setting-desc {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }
  }
  
  .setting-control {
    flex-shrink: 0;
  }
}

.theme-switch {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  
  .switch-track {
    width: 44px;
    height: 24px;
    background: var(--border-color);
    border-radius: 12px;
    position: relative;
    transition: background 0.2s ease;
  }
  
  .switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: var(--secondary-bg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    color: var(--warning-yellow);
  }
  
  .switch-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }
  
  &.is-night {
    .switch-track {
      background: var(--primary-blue);
    }
    
    .switch-thumb {
      transform: translateX(20px);
      color: var(--primary-blue);
    }
  }
}

// Transition
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
  
  .settings-modal {
    transition: transform 0.2s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  
  .settings-modal {
    transform: scale(0.95);
  }
}

// Responsive
@media (max-width: 480px) {
  .settings-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .action-buttons {
    flex-direction: column;
    
    .action-btn {
      width: 100%;
      justify-content: center;
    }
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
    
    .setting-control {
      width: 100%;
    }
  }
}
</style>
