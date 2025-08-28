<template>
  <div class="pdf-viewer-container" v-if="pdfSrc">
    <!-- PDF渲染区域 -->
    <div class="pdf-content" ref="pdfContainer">
      <VuePdfEmbed
        :source="pdfSrc"
        :page="currentPage"
        :scale="zoomLevel"
        :rotation="rotation"
        :width="pdfWidth"
        :height="pdfHeight"
        annotation-layer
        text-layer
        @loaded="handlePdfLoaded"
        @loading-failed="handlePdfError"
        @rendered="handlePdfRendered"
        @progress="handlePdfProgress"
        class="pdf-embed"
        :style="{
          transformOrigin: 'center center'
        }"
      />
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-overlay">
        <n-spin size="large" />
        <p class="loading-text">加载PDF中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-if="error" class="error-overlay">
        <Icon size="48" class="error-icon">
          <AlertCircleOutline />
        </Icon>
        <p class="error-text">{{ error }}</p>
        <button class="retry-btn" @click="retryLoad">
          <Icon size="16">
            <RefreshOutline />
          </Icon>
          重新加载
        </button>
      </div>
    </div>

    <!-- 操作面板 -->
    <div class="pdf-controls">
      <!-- 页面导航 -->
      <div class="page-controls">
        <button 
          class="control-btn"
          :disabled="currentPage <= 1"
          @click="previousPage"
          title="上一页"
        >
          <Icon size="16">
            <ChevronUpOutline />
          </Icon>
        </button>
        
        <div class="page-info">
          <input 
            v-model.number="pageInput"
            @keyup.enter="goToPage"
            @blur="goToPage"
            class="page-input"
            type="number"
            :min="1"
            :max="totalPages"
          />
          <span class="page-separator">/</span>
          <span class="total-pages">{{ totalPages }}</span>
        </div>
        
        <button 
          class="control-btn"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
          title="下一页"
        >
          <Icon size="16">
            <ChevronDownOutline />
          </Icon>
        </button>
      </div>

      <!-- 缩放控制 -->
      <div class="zoom-controls">
        <button 
          class="control-btn"
          @click="zoomOut"
          :disabled="zoomLevel <= 0.25"
          title="缩小"
        >
          <Icon size="16">
            <RemoveOutline />
          </Icon>
        </button>
        
        <div class="zoom-info">
          <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
        </div>
        
        <button 
          class="control-btn"
          @click="zoomIn"
          :disabled="zoomLevel >= 3.0"
          title="放大"
        >
          <Icon size="16">
            <AddOutline />
          </Icon>
        </button>
        
        <button 
          class="control-btn"
          @click="resetZoom"
          title="重置缩放"
        >
          <Icon size="16">
            <ContractOutline />
          </Icon>
        </button>
      </div>

      <!-- 旋转控制 -->
      <div class="rotation-controls">
        <button 
          class="control-btn"
          @click="rotateLeft"
          title="逆时针旋转90°"
        >
          <Icon size="16">
            <RefreshOutline />
          </Icon>
        </button>
        
        <button 
          class="control-btn"
          @click="rotateRight"
          title="顺时针旋转90°"
        >
          <Icon size="16">
            <RefreshOutline style="transform: scaleX(-1)" />
          </Icon>
        </button>
        
        <button 
          class="control-btn"
          @click="resetRotation"
          title="重置旋转"
        >
          <Icon size="16">
            <ExpandOutline />
          </Icon>
        </button>
      </div>

      <!-- 适应控制 -->
      <div class="fit-controls">
        <button 
          class="control-btn"
          @click="fitToWidth"
          title="适应宽度"
        >
          <Icon size="16">
            <ResizeOutline />
          </Icon>
        </button>
        
        <button 
          class="control-btn"
          @click="fitToPage"
          title="适应页面"
        >
          <Icon size="16">
            <CropOutline />
          </Icon>
        </button>
      </div>

      <!-- 分隔线 -->
      <div class="control-divider"></div>

      <!-- 下载控制 -->
      <div class="download-controls">
        <button 
          class="control-btn"
          @click="downloadPDF"
          title="下载PDF"
        >
          <Icon size="16">
            <DownloadOutline />
          </Icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Icon } from '@vicons/utils'
import { NSpin } from 'naive-ui'
import {
  ChevronUpOutline,
  ChevronDownOutline,
  AddOutline,
  RemoveOutline,
  RefreshOutline,
  ExpandOutline,
  ContractOutline,
  ResizeOutline,
  CropOutline,
  DownloadOutline,
  AlertCircleOutline
} from '@vicons/ionicons5'
import VuePdfEmbed from 'vue-pdf-embed'
// 导入可选样式
import 'vue-pdf-embed/dist/styles/annotationLayer.css'
import 'vue-pdf-embed/dist/styles/textLayer.css'

// Props
interface Props {
  src: string | null
  initialPage?: number
  initialZoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialPage: 1,
  initialZoom: 1.0
})

// Emits
const emit = defineEmits<{
  pageChange: [page: number]
  zoomChange: [zoom: number]
  error: [error: string]
  loaded: [totalPages: number]
}>()

// Refs
const pdfContainer = ref<HTMLDivElement>()

// State
const isLoading = ref(false)
const error = ref('')
const currentPage = ref(props.initialPage)
const totalPages = ref(0)
const zoomLevel = ref(props.initialZoom)
const rotation = ref(0)
const pageInput = ref(props.initialPage)
const pdfWidth = ref<number | undefined>(undefined)
const pdfHeight = ref<number | undefined>(undefined)

// Computed
const pdfSrc = computed(() => props.src)

// Methods
const retryLoad = () => {
  error.value = ''
  isLoading.value = true
}

// 页面导航
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    pageInput.value = currentPage.value
    emit('pageChange', currentPage.value)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    pageInput.value = currentPage.value
    emit('pageChange', currentPage.value)
  }
}

const goToPage = () => {
  const page = Math.max(1, Math.min(pageInput.value, totalPages.value))
  if (page !== currentPage.value) {
    currentPage.value = page
    pageInput.value = page
    emit('pageChange', currentPage.value)
  }
}

// 缩放控制
const zoomIn = () => {
  if (zoomLevel.value < 3.0) {
    zoomLevel.value = Math.min(3.0, zoomLevel.value * 1.25)
    emit('zoomChange', zoomLevel.value)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.25) {
    zoomLevel.value = Math.max(0.25, zoomLevel.value / 1.25)
    emit('zoomChange', zoomLevel.value)
  }
}

const resetZoom = () => {
  zoomLevel.value = 1.0
  emit('zoomChange', zoomLevel.value)
}

// 适应控制
const fitToWidth = () => {
  if (!pdfContainer.value) return
  
  const containerWidth = pdfContainer.value.clientWidth - 100
  // 估算标准PDF页面宽度为595px (A4)
  const standardWidth = 595
  zoomLevel.value = containerWidth / standardWidth
  emit('zoomChange', zoomLevel.value)
}

const fitToPage = () => {
  if (!pdfContainer.value) return
  
  const containerWidth = pdfContainer.value.clientWidth - 100
  const containerHeight = pdfContainer.value.clientHeight - 100
  // 估算标准PDF页面尺寸 (A4: 595x842)
  const standardWidth = 595
  const standardHeight = 842
  
  zoomLevel.value = Math.min(
    containerWidth / standardWidth,
    containerHeight / standardHeight
  )
  emit('zoomChange', zoomLevel.value)
}

// 旋转控制
const rotateLeft = () => {
  rotation.value = (rotation.value - 90) % 360
}

const rotateRight = () => {
  rotation.value = (rotation.value + 90) % 360
}

const resetRotation = () => {
  rotation.value = 0
}

// 下载控制
const downloadPDF = () => {
  if (typeof props.src === 'string') {
    const link = document.createElement('a')
    link.href = props.src
    link.download = 'document.pdf'
    link.click()
  }
}

// Vue PDF Embed 事件处理
const handlePdfLoaded = (doc: any) => {
  console.log('PDF loaded:', doc)
  totalPages.value = doc.numPages
  isLoading.value = false
  emit('loaded', totalPages.value)
}

const handlePdfError = (error: any) => {
  console.error('PDF loading failed:', error)
  error.value = error.message || '加载PDF失败'
  isLoading.value = false
  emit('error', error.value)
}

const handlePdfRendered = () => {
  console.log('PDF rendered')
  isLoading.value = false
}

const handlePdfProgress = (progress: any) => {
  console.log('PDF loading progress:', progress)
}

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'PageUp':
      event.preventDefault()
      previousPage()
      break
    case 'ArrowDown':
    case 'PageDown':
      event.preventDefault()
      nextPage()
      break
    case '=':
    case '+':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomIn()
      }
      break
    case '-':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        zoomOut()
      }
      break
    case '0':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        resetZoom()
      }
      break
  }
}

// 窗口大小调整处理
const handleResize = () => {
  // Vue PDF Embed 会自动处理大小调整
}

// Watchers
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    isLoading.value = true
    error.value = ''
  }
}, { immediate: true })

watch(() => props.initialPage, (newPage) => {
  currentPage.value = newPage
  pageInput.value = newPage
})

// Lifecycle
onMounted(() => {
  // 添加事件监听
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
})

// 暴露方法给父组件
defineExpose({
  nextPage,
  previousPage,
  goToPage,
  zoomIn,
  zoomOut,
  resetZoom,
  fitToWidth,
  fitToPage,
  rotateLeft,
  rotateRight,
  resetRotation
})
</script>

<style lang='scss' scoped>
.pdf-viewer-container {
  display: flex;
  height: 100vh;
  background: var(--primary-bg);
  position: relative;
}

.pdf-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  overflow: auto;
  position: relative;
  background: var(--secondary-bg);
  
  .pdf-embed {
    max-width: 100%;
    max-height: 100%;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-heavy);
    background: white;
  }
  
  .loading-overlay,
  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    z-index: 10;
    
    .loading-text,
    .error-text {
      margin-top: var(--spacing-md);
      color: var(--text-secondary);
      font-size: var(--font-size-md);
      text-align: center;
    }
    
    .error-icon {
      color: var(--error-red);
    }
    
    .retry-btn {
      margin-top: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--primary-blue);
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--secondary-blue);
        transform: translateY(-1px);
      }
    }
  }
}

.pdf-controls {
  width: 56px;
  background: var(--nav-bg);
  border-left: 1px solid var(--nav-border-color);
  display: flex;
  flex-direction: column;
  padding: var(--spacing-sm) var(--spacing-xs);
  gap: var(--spacing-md);
  overflow-y: auto;
  z-index: var(--z-nav);
  
  .page-controls,
  .zoom-controls,
  .rotation-controls,
  .fit-controls,
  .download-controls {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .control-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--nav-border-color);
    border-radius: var(--radius-sm);
    color: var(--nav-text);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    
    &:hover:not(:disabled) {
      background: var(--nav-hover-bg);
      color: var(--nav-accent);
      border-color: var(--nav-accent);
      transform: translateY(-1px);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
  
  .page-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 4px 2px;
    background: var(--nav-hover-bg);
    border-radius: var(--radius-xs);
    
    .page-input {
      width: 28px;
      padding: 1px 2px;
      text-align: center;
      border: 1px solid var(--nav-border-color);
      border-radius: var(--radius-xs);
      background: var(--primary-bg);
      color: var(--text-primary);
      font-size: 10px;
      font-weight: 500;
      
      &:focus {
        outline: none;
        border-color: var(--nav-accent);
      }
    }
    
    .page-separator {
      color: var(--nav-text-secondary);
      font-size: 9px;
      font-weight: 500;
    }
    
    .total-pages {
      color: var(--nav-text);
      font-size: 9px;
      font-weight: 600;
    }
  }
  
  .zoom-info {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    background: var(--nav-hover-bg);
    border-radius: var(--radius-xs);
    
    .zoom-level {
      color: var(--nav-text);
      font-size: 9px;
      font-weight: 600;
    }
  }
  
  .control-divider {
    height: 1px;
    background: var(--nav-border-color);
    margin: var(--spacing-sm) 0;
  }
}

// 响应式调整
@media (max-width: 1023px) {
  .pdf-controls {
    width: 48px;
    padding: var(--spacing-xs);
    
    .control-btn {
      width: 32px;
      height: 32px;
    }
    
    .page-info .page-input {
      width: 24px;
      font-size: 9px;
    }
  }
}

@media (max-width: 767px) {
  .pdf-viewer-container {
    flex-direction: column;
  }
  
  .pdf-content {
    padding: var(--spacing-md);
  }
  
  .pdf-controls {
    width: 100%;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
    padding: var(--spacing-sm);
    border-left: none;
    border-top: 1px solid var(--nav-border-color);
    
    .page-controls,
    .zoom-controls,
    .rotation-controls,
    .fit-controls,
    .download-controls {
      flex-direction: row;
      flex-shrink: 0;
    }
    
    .control-divider {
      width: 1px;
      height: 32px;
      margin: 0 var(--spacing-sm);
    }
  }
}

// 滚动条样式
.pdf-controls::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.pdf-controls::-webkit-scrollbar-track {
  background: transparent;
}

.pdf-controls::-webkit-scrollbar-thumb {
  background: var(--nav-border-color);
  border-radius: 2px;
}

.pdf-controls::-webkit-scrollbar-thumb:hover {
  background: var(--nav-text-secondary);
}
</style>