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

      <!-- SUP列表 -->
      <div class="charts-list-container">
        <div v-if="isLoading" class="loading-state">
          <n-spin size="small" />
          <span class="loading-text">正在加载SUP...</span>
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

        <div v-else-if="Object.keys(chartsBySection).length === 0" class="empty-state">
          <Icon size="32" class="empty-icon">
            <DocumentOutline />
          </Icon>
          <p class="empty-text">暂无{{ categoryTitle }}</p>
        </div>

        <div v-else class="charts-list">
          <!-- 列表模式按Section分组显示 -->
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
                :key="String(chart.Id)"
                class="chart-item section-chart-item"
                :class="{ 'modified': chart.IS_MODIFIED === 'Y' }"
                @click="handleChartSelect(chart)"
              >
                <div class="chart-info">
                  <div class="chart-name">{{ getChartMainName(chart.Local_Subject || chart.Subject || 'SUP') }}</div>
                  <div class="chart-subtitle" v-if="getChartSubName(chart.Local_Subject || chart.Subject || '')">{{ getChartSubName(chart.Local_Subject || chart.Subject || '') }}</div>
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
import pubsub from 'pubsub-js'
import {
  CloseOutline,
  AlertCircleOutline,
  RefreshOutline,
  DocumentOutline,
  ChevronForwardOutline
} from '@vicons/ionicons5'
import { getSupChartsBySection } from '@/services/storage/supHelper.js'

// Props
interface Props {
  visible?: boolean
  activeCategory?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activeCategory: 'sup-list'
})

// Emits
const emit = defineEmits<{
  close: []
  selectChart: [chart: OfficialSUP]
}>()

// State
const isVisible = ref(props.visible)
const isLoaded = ref(false)
const isLoading = ref(false)
const error = ref('')
const isMobile = ref(false)
const charts = ref<OfficialSUP[]>([])
const chartsBySection = ref<{ [section: string]: OfficialSUP[] }>({})
const expandedSections = ref<Set<string>>(new Set())

// 分类标题映射
const categoryTitles: Record<string, string> = {
  'sup-list': 'SUP列表'
}

// Computed
const categoryTitle = computed(() => {
  return categoryTitles[props.activeCategory] || 'SUP'
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

const handleChartSelect = (chart: OfficialSUP) => {
  console.log('SupSelection: handleChartSelect called with:', chart)
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
  console.log('SupSelection: loadCharts called')
  isLoading.value = true
  error.value = ''
  
  try {
    // 列表模式：按Section分组
    const sectionData = await getSupChartsBySection()
    console.log('SupSelection: loaded section data:', sectionData)
    chartsBySection.value = sectionData
    
    // 默认展开所有section
    expandedSections.value = new Set(Object.keys(sectionData))
    console.log('SupSelection: expanded sections:', expandedSections.value)
    
    // 合并所有图表用于显示总数
    charts.value = Object.values(sectionData).flat()
    console.log('SupSelection: total charts:', charts.value.length)
  } catch (err) {
    console.error('Failed to load sup charts:', err)
    error.value = err instanceof Error ? err.message : '加载SUP失败'
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
.charts-selection-wrapper {
  position: relative;
  z-index: var(--z-modal);
}

.charts-selection {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-heavy);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &.show {
    opacity: 1;
  }

  // 桌面端样式
  &.desktop {
    position: fixed;
    top: var(--header-height);
    left: var(--nav-width-sidebar-md);
    width: 360px;
    height: calc(100vh - var(--header-height) - 40px);
    margin: var(--spacing-lg) 0;
    
    // 桌面端动画：从左侧滑入
    transform: translateX(-100%);
    
    &.show {
      transform: translateX(0);
      opacity: 1;
    }
    
    @media (min-width: 1920px) {
      left: var(--nav-width-sidebar-xl);
    }
    
    @media (min-width: 1440px) and (max-width: 1919px) {
      left: var(--nav-width-sidebar-lg);
    }
    
    @media (min-width: 768px) and (max-width: 1023px) {
      width: 320px;
      left: var(--nav-width-sidebar-sm);
    }
  }

  // 移动端样式 (floating panel)
  &.mobile {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    top: auto;
    width: 100%;
    height: 75vh;
    max-height: 75vh;
    z-index: calc(var(--z-modal) + 1);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    
    // 移动端动画：从底部滑入
    transform: translateY(100%);
    
    &.show {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .selection-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) var(--spacing-lg) var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;

    .header-title {
      font-size: var(--font-size-md);
      font-weight: 600;
      color: var(--text-primary);
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
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--hover-bg);
        color: var(--text-primary);
      }
    }
  }

  .charts-list-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .loading-state,
    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-lg);
      text-align: center;
      flex: 1;

      .loading-text,
      .error-text,
      .empty-text {
        margin-top: var(--spacing-sm);
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
      }

      .error-icon,
      .empty-icon {
        color: var(--text-muted);
        margin-bottom: var(--spacing-sm);
      }

      .retry-btn {
        margin-top: var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--primary-blue);
        color: var(--text-inverse);
        border: none;
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--secondary-blue);
        }
      }
    }

    .charts-list {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-xs) 0;

      .section-group {
        margin-bottom: var(--spacing-md);

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-lg);
          margin: 0 var(--spacing-sm);
          background: var(--hover-bg);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: var(--nav-active-bg);
          }

          .section-icon {
            color: var(--text-secondary);
            transition: transform 0.2s ease;

            &.expanded {
              transform: rotate(90deg);
            }
          }

          .section-title {
            flex: 1;
            color: var(--text-primary);
            font-weight: 500;
            font-size: var(--font-size-sm);
          }

          .section-count {
            color: var(--text-secondary);
            font-size: var(--font-size-xs);
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 6px;
            border-radius: 10px;
          }
        }

        .section-charts {
          margin-top: var(--spacing-sm);
          padding-left: var(--spacing-lg);
        }
      }

      .chart-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-sm) var(--spacing-lg);
        margin: 0 var(--spacing-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
        border-bottom: 1px solid rgba(0,0,0,0.04);

        &:hover {
          background: var(--hover-bg);
        }

        &.modified {
          position: relative;

          &::after {
            content: '';
            position: absolute;
            top: 6px;
            right: 6px;
            width: 6px;
            height: 6px;
            background: var(--warning-yellow);
            border-radius: 50%;
          }
        }

        &.section-chart-item {
          padding: var(--spacing-xs) var(--spacing-md);
          margin: 0 var(--spacing-xs);
        }

        .chart-info {
          flex: 1;

          .chart-name {
            font-size: var(--font-size-sm);
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 2px;
            line-height: 1.3;
          }

          .chart-subtitle {
            font-size: var(--font-size-xs);
            color: var(--text-secondary);
            line-height: 1.2;
          }
        }
      }
    }
  }
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  z-index: var(--z-modal);
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

// 滚动条样式优化
.charts-list::-webkit-scrollbar {
  width: 6px;
}

.charts-list::-webkit-scrollbar-track {
  background: transparent;
}

.charts-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.charts-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

// 响应式调整
@media (max-width: 767px) {
  .charts-selection {
    .selection-header {
      padding: var(--spacing-sm) var(--spacing-md);
      
      .header-title {
        font-size: var(--font-size-sm);
      }
    }

    .charts-list .chart-item {
      padding: var(--spacing-xs) var(--spacing-md);
      margin: 0 var(--spacing-xs);

      .chart-info {
        .chart-name {
          font-size: var(--font-size-sm);
        }

        .chart-subtitle {
          font-size: var(--font-size-xs);
        }
      }
    }
  }
}
</style>
