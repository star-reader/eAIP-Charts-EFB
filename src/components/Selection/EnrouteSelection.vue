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

      <!-- 航路图列表 -->
      <div class="charts-list-container">
        <div v-if="isLoading" class="loading-state">
          <n-spin size="small" />
          <span class="loading-text">正在加载航路图...</span>
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

        <div v-else-if="displayCharts.length === 0 && activeCategory !== 'enroute-list'" class="empty-state">
          <Icon size="32" class="empty-icon">
            <DocumentOutline />
          </Icon>
          <p class="empty-text">暂无{{ categoryTitle }}</p>
        </div>

        <div v-else-if="activeCategory === 'enroute-list' && Object.keys(chartsBySection).length === 0" class="empty-state">
          <Icon size="32" class="empty-icon">
            <DocumentOutline />
          </Icon>
          <p class="empty-text">暂无{{ categoryTitle }}</p>
        </div>

        <div v-else class="charts-list">
          <!-- 大图和区域图显示为普通列表 -->
          <template v-if="activeCategory === 'enroute-chart' || activeCategory === 'enroute-region'">
            <div 
              v-for="chart in displayCharts" 
              :key="String(chart.id)"
              class="chart-item"
              :class="{ 'modified': chart.Is_Modified === 'Y' }"
              @click="handleChartSelect(chart)"
            >
              <div class="chart-info">
                <div class="chart-name">{{ getChartMainName(chart.name_cn || chart.name_en || 'ENR图') }}</div>
                <div class="chart-subtitle" v-if="getChartSubName(chart.name_cn || chart.name_en || '')">{{ getChartSubName(chart.name_cn || chart.name_en || '') }}</div>
              </div>
            </div>
          </template>

          <!-- 列表模式按Section分组显示 -->
          <template v-else-if="activeCategory === 'enroute-list'">
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
                  :key="String(chart.id)"
                  class="chart-item section-chart-item"
                  :class="{ 'modified': chart.Is_Modified === 'Y' }"
                  @click="handleChartSelect(chart)"
                >
                  <div class="chart-info">
                    <div class="chart-name">{{ getChartMainName(chart.name_cn || chart.name_en || 'ENR图') }}</div>
                    <div class="chart-subtitle" v-if="getChartSubName(chart.name_cn || chart.name_en || '')">{{ getChartSubName(chart.name_cn || chart.name_en || '') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 移动端背景遮罩 -->
    <div 
      v-if="isMobile" 
      class="mobile-overlay"
      :class="{ 'show': isVisible && isLoaded }"
      @click="handleClose"
    ></div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Icon } from '@vicons/utils'
import { NSpin } from 'naive-ui'
import pubsub from 'pubsub-js'
import {
  CloseOutline,
  AlertCircleOutline,
  RefreshOutline,
  DocumentOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5'
import { getEnrouteCharts, getEnrouteChartsBySection, getRegionCharts } from '@/services/storage/enrouteHelper.js'

// Props
interface Props {
  visible?: boolean
  activeCategory?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activeCategory: 'enroute-chart'
})

// Emits
const emit = defineEmits<{
  close: []
  selectChart: [chart: OfficialENR]
}>()

// State
const isVisible = ref(props.visible)
const isLoaded = ref(false)
const isLoading = ref(false)
const error = ref('')
const isMobile = ref(false)
const charts = ref<OfficialENR[]>([])
const chartsBySection = ref<{ [section: string]: OfficialENR[] }>({})
const expandedSections = ref<Set<string>>(new Set())

// 分类标题映射
const categoryTitles: Record<string, string> = {
  'enroute-chart': '航路大图',
  'enroute-region': '区域图',
  'enroute-list': '航路列表'
}

// Computed
const categoryTitle = computed(() => {
  return categoryTitles[props.activeCategory] || '航路图'
})

const displayCharts = computed(() => {
  return charts.value
})

// Methods
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

const getChartMainName = (chartName: string) => {
  // 获取冒号后面的部分作为主要显示内容
  if (!chartName) return ''
  const parts = chartName.split(':')
  return parts.length > 1 ? parts[1].trim() : chartName
}

const getChartSubName = (chartName: string) => {
  // 获取冒号前面的部分作为副标题
  if (!chartName) return ''
  const parts = chartName.split(':')
  return parts.length > 1 ? parts[0].trim() : ''
}

const handleChartSelect = (chart: OfficialENR) => {
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
    if (props.activeCategory === 'enroute-list') {
      // 列表模式：按Section分组
      const sectionData = await getEnrouteChartsBySection()
      chartsBySection.value = sectionData
      
      // 默认展开所有section
      expandedSections.value = new Set(Object.keys(sectionData))
      
      // 合并所有图表用于显示总数
      charts.value = Object.values(sectionData).flat()
    } else if (props.activeCategory === 'enroute-region') {
      // 区域图模式：只获取区域图
      charts.value = await getRegionCharts()
      chartsBySection.value = {}
    } else {
      // 大图模式：直接获取所有图表
      charts.value = await getEnrouteCharts()
      chartsBySection.value = {}
    }
  } catch (err) {
    console.error('Failed to load enroute charts:', err)
    error.value = err instanceof Error ? err.message : '加载航路图失败'
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