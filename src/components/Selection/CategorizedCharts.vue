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

      <!-- 机场信息 -->
      <div v-if="selectedAirport" class="airport-info-section">
        <div class="airport-name">
          {{ selectedAirport.name_cn }}
        </div>
      </div>

      <!-- 航图列表 -->
      <div class="charts-list-container">
        <div v-if="isLoading" class="loading-state">
          <n-spin size="small" />
          <span class="loading-text">正在加载航图...</span>
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

        <div v-else-if="filteredCharts.length === 0" class="empty-state">
          <Icon size="32" class="empty-icon">
            <DocumentOutline />
          </Icon>
          <p class="empty-text">暂无{{ categoryTitle }}</p>
        </div>

        <div v-else class="charts-list">
          <div 
            v-for="chart in filteredCharts" 
            :key="chart.id"
            class="chart-item"
            :class="{ 'modified': chart.Is_Modified === 'Y' }"
            @click="handleChartSelect(chart)"
          >
            <div class="chart-info">
              <div class="chart-name">{{ getChartMainName(chart.name) }}</div>
              <div class="chart-subtitle" v-if="getChartSubName(chart.name)">{{ getChartSubName(chart.name) }}</div>
            </div>
          </div>
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
  FlashOutline,
  DocumentOutline,
  EyeOutline
} from '@vicons/ionicons5'
import { getCategorizedChartsByICAO } from '@/services/storage/airportHelper'

// Props
interface Props {
  visible?: boolean
  selectedAirport?: AirportList | null
  activeCategory?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  selectedAirport: null,
  activeCategory: 'airport-chart'
})

// Emits
const emit = defineEmits<{
  close: []
  selectChart: [chart: OfficialAD]
}>()

// State
const isVisible = ref(props.visible)
const isLoaded = ref(false)
const isLoading = ref(false)
const error = ref('')
const isMobile = ref(false)
const categorizedData = ref<CategorizedCharts | null>(null)

// 分类标题映射
const categoryTitles: Record<string, string> = {
  'airport-chart': '机场图',
  'departure': '离场图',
  'arrival': '进场图',
  'approach': '进近图',
  'details': '细则'
}

// Computed
const categoryTitle = computed(() => {
  return categoryTitles[props.activeCategory] || '机场图'
})

const filteredCharts = computed(() => {
  if (!categorizedData.value) return []
  
  switch (props.activeCategory) {
    case 'airport-chart':
      // 机场图包含AD信息和机场图
      const charts: OfficialAD[] = []
      if (categorizedData.value.ad) {
        charts.push(categorizedData.value.ad)
      }
      if (categorizedData.value.airport) {
        charts.push(...categorizedData.value.airport)
      }
      return charts
    case 'departure':
      return categorizedData.value.dep || []
    case 'arrival':
      return categorizedData.value.arr || []
    case 'approach':
      return categorizedData.value.app || []
    default:
      return []
  }
})

// Methods
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

const loadCharts = async () => {
  if (!props.selectedAirport) {
    categorizedData.value = null
    return
  }

  isLoading.value = true
  error.value = ''
  
  try {
    const data = await getCategorizedChartsByICAO(props.selectedAirport.airporticao)
    categorizedData.value = data
  } catch (err) {
    console.error('Failed to load categorized charts:', err)
    error.value = err instanceof Error ? err.message : '加载航图失败'
    categorizedData.value = null
  } finally {
    isLoading.value = false
  }
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

const handleChartSelect = (chart: OfficialAD) => {
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

// Watchers
watch(() => props.visible, (newValue) => {
  if (newValue) {
    show()
  } else {
    hide()
  }
})

watch(() => props.selectedAirport, (newAirport) => {
  if (newAirport) {
    loadCharts()
  } else {
    categorizedData.value = null
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  
  if (props.visible) {
    show()
  }
  if (props.selectedAirport) {
    loadCharts()
  }
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

// 组件特有样式：机场信息区域
.charts-selection {
  .airport-info-section {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;

    .airport-name {
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);

      .updated-badge {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 1px var(--spacing-xs);
        background: var(--warning-yellow);
        color: var(--text-inverse);
        font-size: 10px;
        font-weight: 500;
        border-radius: var(--radius-sm);
      }
    }
  }
}

@media (max-width: 767px) {
  .charts-selection {
    .airport-info-section {
      padding: var(--spacing-xs) var(--spacing-md);
    }
  }
}
</style>
