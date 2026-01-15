<template>
  <div class="pdf-viewer-container" v-if="pdfSrc">
    
    <!-- 大文件警告 -->
    <div v-if="showLargeFileWarning" class="large-file-warning">
      <NAlert type="warning" title="大文件提示" show-icon>
        <div class="warning-content">
          <p>检测到这是一个大型航图文件，在浏览器中预览可能会影响性能。</p>
          <p>建议您选择以下方式之一：</p>
          <div class="warning-actions">
            <NButton type="primary" @click="handleUseIframeMode">
              <Icon size="14" style="margin-right: 4px">
                <DownloadOutline />
              </Icon>
              使用本地阅读器
            </NButton>
            <NButton @click="handleUsePdfEmbed">
              继续在浏览器中查看
            </NButton>
          </div>
        </div>
      </NAlert>
    </div>

    <!-- iframe模式 -->
    <div v-else-if="useIframeMode" class="iframe-mode">
      <iframe 
        :src="pdfSrc + '#toolbar=0'"
        class="pdf-iframe"
        frameborder="0"
      ></iframe>
    </div>

    <!-- 正常PDF渲染区域 -->
    <div 
      v-else
      class="pdf-content" 
      :class="{ 'is-dragging': isDragging }"
      ref="pdfContainer"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div 
        class="pdf-wrapper"
        :style="pdfContainerStyle"
      >
        <VuePdfEmbed
          ref="pdfEmbed"
          :key="`pdf-${rotationKey}-${pdfSrc}`"
          :source="pdfSrc"
          :page="currentPage"
          :width="pdfWidth"
          :rotation="rotation"
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
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-overlay">
        <n-spin size="large" />
        <p class="loading-text">加载航图中...</p>
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
    <div v-if="!useIframeMode" class="pdf-controls">
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
          <span class="page-display">
            {{ currentPage }} / {{ totalPages }}
          </span>
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
          :disabled="zoomLevel >= (isLargeFile ? 3.0 : 6.0)"
          title="放大"
        >
          <Icon size="16">
            <AddOutline />
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
import { NAlert, NButton } from 'naive-ui'
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
const pdfEmbed = ref<any>()

// State
const isLoading = ref(false)
const error = ref('')
const currentPage = ref(props.initialPage)
const totalPages = ref(0)
const zoomLevel = ref(props.initialZoom)
const rotation = ref(0)

const pdfDoc = ref<any>(null) // 存储PDF文档对象
const rerenderKey = ref(0) // 用于强制重新渲染
const rotationKey = ref(0) // 专门用于旋转的key
const pdfWidth = ref<number>(600) // PDF显示宽度
const baseWidth = ref<number>(595) // PDF原始宽度 (A4标准)

// 大文件处理
const showLargeFileWarning = ref(false)
const useIframeMode = ref(false)
const isLargeFile = ref(false)

// 平移和手势控制状态
const panX = ref(0) // X轴平移距离
const panY = ref(0) // Y轴平移距离
const isDragging = ref(false) // 是否正在拖拽
const lastMouseX = ref(0) // 上次鼠标X位置
const lastMouseY = ref(0) // 上次鼠标Y位置
const isTouch = ref(false) // 是否为触摸操作
const lastTouchDistance = ref(0) // 上次触摸点距离
const mouseX = ref(0) // 当前鼠标X位置
const mouseY = ref(0) // 当前鼠标Y位置
const lastWheelTime = ref(0) // 上次滚轮时间
const wheelThrottleDelay = 12 // 节流延迟，约80fps，平衡流畅度和稳定性

// Computed
const pdfSrc = computed(() => props.src)

// PDF容器样式，包含平移
const pdfContainerStyle = computed(() => {
  // 确保平移值是有效的数字
  const validPanX = isFinite(panX.value) ? panX.value : 0
  const validPanY = isFinite(panY.value) ? panY.value : 0
  
  return {
    transform: `translate(${validPanX}px, ${validPanY}px)`,
    transition: isDragging.value ? 'none' : 'transform 0.2s ease'
  }
})

// Methods
const retryLoad = () => {
  error.value = ''
  isLoading.value = true
}

// 页面导航
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    emit('pageChange', currentPage.value)
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    emit('pageChange', currentPage.value)
  }
}



// 以鼠标位置为中心的缩放
const zoomAtPoint = (scaleFactor: number, centerX?: number, centerY?: number) => {
  // 确保baseWidth已经初始化
  if (baseWidth.value <= 0) {
    console.warn('baseWidth not initialized yet, skipping zoom')
    return
  }
  
  // 大文件性能优化：限制最大缩放
  const maxZoom = isLargeFile.value ? 3.0 : 6.0
  
  const oldZoom = zoomLevel.value
  const newZoom = Math.max(0.25, Math.min(maxZoom, oldZoom * scaleFactor))
  
  if (newZoom === oldZoom) return // 没有变化就不处理
  
  // 如果提供了中心点，计算缩放后的平移调整
  if (centerX !== undefined && centerY !== undefined && pdfContainer.value) {
    const rect = pdfContainer.value.getBoundingClientRect()
    
    // 将鼠标位置转换为相对于PDF容器的坐标
    const relativeX = centerX - rect.left - rect.width / 2
    const relativeY = centerY - rect.top - rect.height / 2
    
    // 计算缩放比例
    const zoomRatio = newZoom / oldZoom
    
    // 调整平移位置，使缩放以鼠标位置为中心
    panX.value = (panX.value - relativeX) * zoomRatio + relativeX
    panY.value = (panY.value - relativeY) * zoomRatio + relativeY
  }
  
  // 计算新的PDF宽度，确保不为0或负数
  const newPdfWidth = baseWidth.value * newZoom
  if (newPdfWidth > 0) {
    zoomLevel.value = newZoom
    pdfWidth.value = newPdfWidth
    emit('zoomChange', zoomLevel.value)
  } else {
    console.warn('Invalid PDF width calculated:', newPdfWidth)
  }
}

// 以PDF中心为基准的缩放（用于按钮操作，不调整平移位置）
const zoomAtCenter = (scaleFactor: number) => {
  // 确保baseWidth已经初始化
  if (baseWidth.value <= 0) {
    console.warn('baseWidth not initialized yet, skipping zoom')
    return
  }
  
  // 大文件性能优化：限制最大缩放
  const maxZoom = isLargeFile.value ? 3.0 : 6.0
  
  const oldZoom = zoomLevel.value
  const newZoom = Math.max(0.25, Math.min(maxZoom, oldZoom * scaleFactor))
  
  if (newZoom === oldZoom) return // 没有变化就不处理
  
  // 计算新的PDF宽度，确保不为0或负数
  const newPdfWidth = baseWidth.value * newZoom
  if (newPdfWidth > 0) {
    zoomLevel.value = newZoom
    pdfWidth.value = newPdfWidth
    emit('zoomChange', zoomLevel.value)
  } else {
    console.warn('Invalid PDF width calculated:', newPdfWidth)
  }
}

// 缩放控制 - 使用width属性
const zoomIn = () => {
  // 按钮缩放：以PDF中心为基准，不调整平移位置，避免抖动
  zoomAtCenter(1.25)
}

const zoomOut = () => {
  // 按钮缩放：以PDF中心为基准，不调整平移位置，避免抖动
  zoomAtCenter(0.8)
}

const resetZoom = () => {
  zoomLevel.value = 1.0
  pdfWidth.value = baseWidth.value * zoomLevel.value
  resetPan() // 重置缩放时也重置平移
  emit('zoomChange', zoomLevel.value)
}

// 适应控制
const fitToWidth = () => {
  if (!pdfContainer.value) return
  
  const containerWidth = pdfContainer.value.clientWidth - 100
  const calculatedZoom = containerWidth / baseWidth.value
  const maxZoom = isLargeFile.value ? 3.0 : 6.0
  zoomLevel.value = Math.max(0.25, Math.min(maxZoom, calculatedZoom))
  pdfWidth.value = baseWidth.value * zoomLevel.value
  resetPan() // 重置平移
  emit('zoomChange', zoomLevel.value)
}

const fitToPage = () => {
  if (!pdfContainer.value) return
  
  const containerWidth = pdfContainer.value.clientWidth - 100
  const containerHeight = pdfContainer.value.clientHeight - 100
  // A4比例: 595x842
  const standardHeight = 842
  
  const widthScale = containerWidth / baseWidth.value
  const heightScale = containerHeight / standardHeight
  
  const calculatedZoom = Math.min(widthScale, heightScale)
  const maxZoom = isLargeFile.value ? 3.0 : 6.0
  zoomLevel.value = Math.max(0.25, Math.min(maxZoom, calculatedZoom))
  pdfWidth.value = baseWidth.value * zoomLevel.value
  resetPan() // 重置平移
  emit('zoomChange', zoomLevel.value)
}

// 旋转控制
const rotateLeft = () => {
  rotation.value = (rotation.value - 90) % 360
  // 只有旋转需要强制重新渲染
  rotationKey.value++
}

const rotateRight = () => {
  rotation.value = (rotation.value + 90) % 360
  // 只有旋转需要强制重新渲染
  rotationKey.value++
}

const resetRotation = () => {
  rotation.value = 0
  // 只有旋转需要强制重新渲染
  rotationKey.value++
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
const handlePdfLoaded = async (doc: any) => {
  totalPages.value = doc.numPages
  pdfDoc.value = doc
  
  try {
    // 获取第一页来确定PDF的真实尺寸
    const page = await doc.getPage(1)
    const viewport = page.getViewport({ scale: 1 })
    baseWidth.value = viewport.width
    
    // 检测是否为大文件（基于宽度或页数）
    const isLargeWidth = baseWidth.value > 3000
    // 优化：机场AD也会显示大文件，其实是不对的，具体原因是页数太多，ENC只有一页；所以这里判断largeWidth后也要判断页数等于1
    // const isManyPages = totalPages.value > 20
    isLargeFile.value = isLargeWidth && totalPages.value == 1
    
    // 如果是大文件，显示警告
    if (isLargeFile.value) {
      showLargeFileWarning.value = true
      return // 等待用户选择
    }
    
    // 计算初始显示宽度
    if (pdfContainer.value) {
      const containerWidth = pdfContainer.value.clientWidth - 100
      zoomLevel.value = Math.min(containerWidth / baseWidth.value, 1.0)
      pdfWidth.value = baseWidth.value * zoomLevel.value
    } else {
      pdfWidth.value = baseWidth.value * zoomLevel.value
    }
    
  } catch (err) {
    // 使用默认值
    pdfWidth.value = baseWidth.value * zoomLevel.value
  }
  
  isLoading.value = false
  emit('loaded', totalPages.value)
}

const handlePdfError = (error: any) => {
  error.value = error.message || '加载航图失败'
  isLoading.value = false
  emit('error', error.value)
}

// 大文件处理方法
const handleUseIframeMode = () => {
  useIframeMode.value = true
  showLargeFileWarning.value = false
}

const handleUsePdfEmbed = () => {
  showLargeFileWarning.value = false
  // 继续使用vue-pdf-embed，设置初始宽度
  if (pdfContainer.value) {
    const containerWidth = pdfContainer.value.clientWidth - 100
    zoomLevel.value = Math.min(containerWidth / baseWidth.value, 1.0)
    pdfWidth.value = baseWidth.value * zoomLevel.value
  } else {
    pdfWidth.value = baseWidth.value * zoomLevel.value
  }
  
  isLoading.value = false
  emit('loaded', totalPages.value)
}

const handlePdfRendered = () => {
  isLoading.value = false
}

const handlePdfProgress = (progress: any) => {
}

// 鼠标滚轮处理 - 只控制缩放
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  // 如果PDF还在加载中，阻止缩放操作
  if (isLoading.value || !pdfDoc.value) {
    return
  }
  
  // 节流处理
  const currentTime = Date.now()
  if (currentTime - lastWheelTime.value < wheelThrottleDelay) {
    return
  }
  lastWheelTime.value = currentTime
  
  const delta = event.deltaY
  if (delta === 0) return
  
  // 统一使用缩放，步长适中
  const scaleFactor = delta < 0 ? 1.1 : 0.91
  zoomAtCenter(scaleFactor)
}

// 鼠标拖拽处理
const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) { // 左键
    isDragging.value = true
    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
    event.preventDefault()
  }
}

const handleMouseMove = (event: MouseEvent) => {
  // 始终更新鼠标位置
  mouseX.value = event.clientX
  mouseY.value = event.clientY
  
  if (isDragging.value) {
    const deltaX = event.clientX - lastMouseX.value
    const deltaY = event.clientY - lastMouseY.value
    
    panX.value += deltaX
    panY.value += deltaY
    
    lastMouseX.value = event.clientX
    lastMouseY.value = event.clientY
    event.preventDefault()
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// 触摸手势处理
const handleTouchStart = (event: TouchEvent) => {
  event.preventDefault()
  
  if (event.touches.length === 1) {
    // 单指：拖拽
    isDragging.value = true
    isTouch.value = true
    lastMouseX.value = event.touches[0].clientX
    lastMouseY.value = event.touches[0].clientY
  } else if (event.touches.length === 2) {
    // 双指：缩放
    isDragging.value = false
    isTouch.value = true
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    lastTouchDistance.value = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }
}

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault()
  
  if (event.touches.length === 1 && isDragging.value) {
    // 单指拖拽
    const deltaX = event.touches[0].clientX - lastMouseX.value
    const deltaY = event.touches[0].clientY - lastMouseY.value
    
    panX.value += deltaX
    panY.value += deltaY
    
    lastMouseX.value = event.touches[0].clientX
    lastMouseY.value = event.touches[0].clientY
  } else if (event.touches.length === 2) {
    // 双指缩放
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
    
    if (lastTouchDistance.value > 0) {
      const scale = currentDistance / lastTouchDistance.value
      
      // 计算两指中心点作为缩放中心
      const centerX = (touch1.clientX + touch2.clientX) / 2
      const centerY = (touch1.clientY + touch2.clientY) / 2
      
      // 使用中心点缩放，但限制缩放速度
      const limitedScale = Math.max(0.95, Math.min(1.05, scale))
      zoomAtPoint(limitedScale, centerX, centerY)
    }
    
    lastTouchDistance.value = currentDistance
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
  isTouch.value = false
  lastTouchDistance.value = 0
}

// 重置平移
const resetPan = () => {
  panX.value = 0
  panY.value = 0
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
        resetPan()
      }
      break
    case 'r':
    case 'R':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        resetPan()
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
    // 重置大文件相关状态
    showLargeFileWarning.value = false
    useIframeMode.value = false
    isLargeFile.value = false
  }
}, { immediate: true })

watch(() => props.initialPage, (newPage) => {
  currentPage.value = newPage
})

// 不再需要监听缩放变化，因为vue-pdf-embed会响应width属性变化

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
  zoomIn,
  zoomOut,
  resetZoom,
  fitToWidth,
  fitToPage,
  rotateLeft,
  rotateRight,
  resetRotation,
  resetPan
})
</script>

<style lang='scss' scoped>
.pdf-viewer-container {
  display: flex;
  height: calc(100vh - var(--header-height));
  background: var(--primary-bg);
  position: relative;
}

.pdf-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  // padding: var(--spacing-lg);
  overflow: auto;
  position: relative;
  background: var(--secondary-bg);
  user-select: none; // 防止拖拽时选中文本
  overflow: hidden;
  align-items: center;
  cursor: grab;
  
  &.is-dragging {
    cursor: grabbing;
  }
  
  .pdf-wrapper {
    display: inline-block;
    cursor: inherit;
    
    .pdf-embed {
      max-width: none; // 允许超出容器进行平移
      max-height: none;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-heavy);
      background: white;
      display: block;
      cursor: inherit;
      
      // 覆盖 vue-pdf-embed 内部的文本层样式
      :deep(.textLayer) {
        cursor: inherit !important;
        user-select: none !important;
        
        span {
          cursor: inherit !important;
          user-select: none !important;
        }
      }
      
      :deep(.annotationLayer) {
        cursor: inherit !important;
      }
    }
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
    background: var(--content-bg);
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
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  background: var(--nav-bg);
  border: 1px solid var(--nav-border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-xs);
  gap: var(--spacing-xs);
  overflow-y: auto;
  z-index: var(--z-nav);
  user-select: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
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
    justify-content: center;
    align-items: center;
    gap: 1px;
    padding: 4px 2px;
    background: var(--nav-hover-bg);
    border-radius: var(--radius-xs);
    
    .page-display {
      width: 28px;
      text-align: center;
      color: var(--nav-text);
      font-size: 10px;
      line-height: 1.2;
      font-weight: 500;
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
    padding: var(--spacing-sm) var(--spacing-xs);
    border-radius: 10px;
    
    .control-btn {
      width: 32px;
      height: 32px;
    }
    
    .page-info .page-display {
      width: 24px;
      font-size: 9px;
    }
  }
}

@media (max-width: 767px) {
  .pdf-controls {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 48px;
    height: auto;
    flex-direction: column;
    overflow-y: auto;
    padding: var(--spacing-md) var(--spacing-xs);
    border-radius: 8px 0 0 8px;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
    
    .page-controls,
    .zoom-controls,
    .rotation-controls,
    .fit-controls,
    .download-controls {
      flex-direction: column;
      flex-shrink: 0;
    }
    
    .control-divider {
      width: 32px;
      height: 1px;
      margin: var(--spacing-sm) 0;
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

// 大文件警告样式
.large-file-warning {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  padding: 20vh var(--spacing-xl) var(--spacing-xl);
  
  .warning-content {
    text-align: center;
    max-width: 500px;
    width: 100%;
    
    p {
      margin: var(--spacing-sm) 0;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    
    .warning-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      margin-top: var(--spacing-lg);
      
      @media (max-width: 767px) {
        flex-direction: column;
        align-items: center;
      }
    }
  }
}

// iframe模式样式
.iframe-mode {
  width: 100%;
  height: 100%;
  position: relative;
  
  .pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  }
}
</style>