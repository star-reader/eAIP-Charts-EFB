<template>
  <div class="charts-selection-wrapper" v-show="isVisible">
    <div 
      class="charts-selection" 
      :class="{ 
        'show': isVisible && isLoaded,
        'mobile': isMobile,
        'desktop': !isMobile
      }"
    >
      <!-- 标题栏 -->
      <div class="selection-header">
        <h3 class="header-title">{{ categoryTitle }}</h3>
        <button 
          class="close-btn" 
          @click="handleClose"
          aria-label="关闭"
        >
          <Icon size="20">
            <CloseOutline />
          </Icon>
        </button>
      </div>

      <!-- 列表容器 -->
      <div class="charts-list-container">
        <div v-if="isLoading" class="loading-state">
          <n-spin size="small" />
          <span class="loading-text">{{ loadingText }}</span>
        </div>

        <div v-else-if="error" class="error-state">
          <Icon size="32" class="error-icon">
            <AlertCircleOutline />
          </Icon>
          <p class="error-text">{{ error }}</p>
          <button class="retry-btn" @click="loadCharts">
            <Icon size="14">
              <RefreshOutline />
            </Icon>
            重试
          </button>
        </div>

        <div v-else-if="isEmpty" class="empty-state">
          <Icon size="32" class="empty-icon">
            <DocumentOutline />
          </Icon>
          <p class="empty-text">暂无{{ categoryTitle }}</p>
        </div>

        <div v-else class="charts-list">
          <!-- 按Section分组显示 -->
          <div 
            v-for="(charts, section) in chartsBySection" 
            :key="section"
            class="section-group"
          >
            <div class="section-header" @click="toggleSection(String(section))">
              <Icon size="16" class="section-icon" :class="{ 'expanded': expandedSections.has(String(section)) }">
                <ChevronForwardOutline />
              </Icon>
              <span class="section-title">{{ section }}</span>
              <span class="section-count">{{ charts.length }}</span>
            </div>
            
            <div class="section-charts" v-show="expandedSections.has(String(section))">
              <div 
                v-for="chart in charts" 
                :key="getChartKey(chart)"
                class="chart-item section-chart-item"
                :class="{ 'modified': isChartModified(chart) }"
                @click="handleChartSelect(chart)"
              >
                <div class="chart-info">
                  <div class="chart-name">{{ getChartMainName(chart) }}</div>
                  <div class="chart-subtitle" v-if="getChartSubName(chart)">{{ getChartSubName(chart) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端背景遮罩 -->
    <div 
      v-if="isMobile" 
      class="mobile-overlay" 
      @click="handleClose"
    ></div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Icon } from '@vicons/utils'
import { NSpin } from 'naive-ui'
import {
  CloseOutline,
  AlertCircleOutline,
  RefreshOutline,
  DocumentOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5'

// Props
interface Props {
  visible?: boolean
  activeCategory?: string
  categoryTitles: Record<string, string>
  loadingText: string
  loadChartsFunction: () => Promise<{ [section: string]: any[] }>
  getChartKey: (chart: any) => string
  getChartMainName: (chart: any) => string
  getChartSubName: (chart: any) => string
  isChartModified: (chart: any) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activeCategory: ''
})

// Emits
const emit = defineEmits<{
  close: []
  selectChart: [chart: any]
}>()

// State
const isVisible = ref(props.visible)
const isLoaded = ref(false)
const isLoading = ref(false)
const error = ref('')
const isMobile = ref(false)
const charts = ref<any[]>([])
const chartsBySection = ref<{ [section: string]: any[] }>({})
const expandedSections = ref<Set<string>>(new Set())

// Computed
const categoryTitle = computed(() => {
  return props.categoryTitles[props.activeCategory] || '列表'
})

const isEmpty = computed(() => {
  return Object.keys(chartsBySection.value).length === 0
})

// Methods
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

const handleChartSelect = (chart: any) => {
  emit('selectChart', chart)
  handleClose()
}

const handleClose = () => {
  isVisible.value = false
  emit('close')
}

const show = () => {
  isVisible.value = true
  nextTick(() => {
    isLoaded.value = true
  })
}

const hide = () => {
  isLoaded.value = false
  setTimeout(() => {
    isVisible.value = false
  }, 200)
}

const toggleSection = (section: string) => {
  if (expandedSections.value.has(section)) {
    expandedSections.value.delete(section)
  } else {
    expandedSections.value.add(section)
  }
}

const loadCharts = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    const sectionData = await props.loadChartsFunction()
    chartsBySection.value = sectionData
    
    // 默认展开所有section
    expandedSections.value = new Set(Object.keys(sectionData))
    
    // 合并所有图表用于显示总数
    charts.value = Object.values(sectionData).flat()
  } catch (err) {
    console.error('Failed to load charts:', err)
    error.value = err instanceof Error ? err.message : '加载失败'
    charts.value = []
    chartsBySection.value = {}
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(() => props.visible, (newValue) => {
  if (newValue) {
    show()
  } else {
    hide()
  }
})

watch(() => props.activeCategory, async () => {
  if (props.visible) {
    await loadCharts()
  }
})

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  
  if (props.visible) {
    show()
  }
  loadCharts()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法给父组件
defineExpose({
  show,
  hide,
  loadCharts
})
</script>

<style lang='scss' scoped>
@import '@/styles/selection-common.scss';
</style>
