<template>
  <div class="airport-selection-wrapper" v-show="isVisible">
    <div 
      class="airport-selection" 
      :class="{ 
        'show': isVisible && isLoaded,
        'mobile': isMobile,
        'desktop': !isMobile
      }"
    >
      <!-- 标题栏 -->
      <div class="selection-header">
        <h3 class="header-title">选择机场</h3>
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

      <!-- 搜索框 -->
      <div class="search-section">
        <div class="search-input-wrapper">
          <Icon class="search-icon" size="16">
            <SearchOutline />
          </Icon>
          <input 
            ref="searchInput"
            v-model="searchKeyword"
            class="search-input"
            type="text"
            placeholder="搜索机场 (ICAO代码或中文名称)"
            @input="handleSearch"
            @keydown.enter="handleEnterSearch"
          />
          <button 
            v-if="searchKeyword"
            class="clear-btn"
            @click="clearSearch"
            aria-label="清除搜索"
          >
            <Icon size="14">
              <CloseOutline />
            </Icon>
          </button>
        </div>
      </div>

      <!-- 机场列表 -->
      <div class="airports-list-container">
        <div v-if="isLoading" class="loading-state">
          <n-spin size="small" />
          <span class="loading-text">正在加载机场列表...</span>
        </div>

        <div v-else-if="filteredAirports.length === 0" class="empty-state">
          <Icon size="32" class="empty-icon">
            <AirplaneOutline />
          </Icon>
          <p class="empty-text">
            {{ searchKeyword ? '未找到匹配的机场' : '暂无机场数据' }}
          </p>
        </div>

        <div v-else class="airports-list">
          <div 
            v-for="airport in filteredAirports" 
            :key="airport.airporticao"
            class="airport-item"
            :class="{ 
              'selected': selectedAirportCode === airport.airporticao,
              'modified': airport.Is_Modified === 'Y'
            }"
            @click="handleAirportSelect(airport)"
          >
            <div class="airport-info">
              <div class="airport-code">
                {{ airport.airporticao }}
                <!-- <span v-if="airport.Is_Modified === 'Y'" class="modified-indicator">
                  <Icon size="12">
                    <FlashOutline />
                  </Icon>
                </span> -->
              </div>
              <div class="airport-name">{{ airport.name_cn }}</div>
            </div>
            
            <div class="selection-indicator" v-if="selectedAirportCode === airport.airporticao">
              <Icon size="16" class="check-icon">
                <CheckmarkOutline />
              </Icon>
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
  SearchOutline,
  AirplaneOutline,
  CheckmarkOutline,
  FlashOutline
} from '@vicons/ionicons5'
import { getAllAirportsList, searchAirports } from '@/services/storage/airportHelper'

// Props
interface Props {
  visible?: boolean
  selectedAirport?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  selectedAirport: ''
})

// Emits
const emit = defineEmits<{
  close: []
  select: [airport: AirportList]
}>()

// State
const isVisible = ref(props.visible)
const isLoaded = ref(false)
const isMobile = ref(false)
const isLoading = ref(false)
const searchKeyword = ref('')
const selectedAirportCode = ref(props.selectedAirport)
const searchInput = ref<HTMLInputElement>()

// Data
const allAirports = ref<AirportList[]>([])
const searchResults = ref<AirportList[]>([])

// Computed
const filteredAirports = computed(() => {
  if (searchKeyword.value.trim()) {
    return searchResults.value
  }
  return allAirports.value
})

// Methods
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
}

const loadAirports = async () => {
  isLoading.value = true
  try {
    const airports = await getAllAirportsList()
    allAirports.value = airports
  } catch (error) {
    console.error('Failed to load airports:', error)
    // 可以添加错误处理UI
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    searchResults.value = []
    return
  }

  try {
    const results = await searchAirports(keyword)
    searchResults.value = results
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  }
}

const handleEnterSearch = () => {
  if (filteredAirports.value.length === 1) {
    handleAirportSelect(filteredAirports.value[0])
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const handleAirportSelect = (airport: AirportList) => {
  selectedAirportCode.value = airport.airporticao
  
  // 桌面端和移动端都直接选择
  confirmSelection(airport)
}

// 移除 handleConfirm 函数，不再需要

const confirmSelection = (airport: AirportList) => {
  // 广播选择结果
  pubsub.publish('airport-selected', airport)
  
  // 触发父组件事件
  emit('select', airport)
  
  // 关闭组件
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
    // 自动聚焦搜索框
    if (searchInput.value) {
      searchInput.value.focus()
    }
  })
}

const hide = () => {
  isLoaded.value = false
  setTimeout(() => {
    isVisible.value = false
  }, 200) // 等待动画完成
}

// Watchers
watch(() => props.visible, (newValue) => {
  if (newValue) {
    show()
  } else {
    hide()
  }
})

watch(() => props.selectedAirport, (newValue) => {
  selectedAirportCode.value = newValue
})

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  
  // 如果初始可见，则加载数据
  if (props.visible) {
    loadAirports()
    show()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听显示状态，加载数据
watch(isVisible, (newValue) => {
  if (newValue && allAirports.value.length === 0) {
    loadAirports()
  }
})

// 暴露方法给父组件
defineExpose({
  show,
  hide,
  loadAirports
})
</script>

<style lang='scss' scoped>
@import '@/styles/selection-common.scss';

.airport-selection {
  .search-section {
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: var(--spacing-sm);
        color: var(--text-secondary);
        z-index: 1;
      }

      .search-input {
        width: 100%;
        height: 36px;
        padding: 0 var(--spacing-xl) 0 36px;
        background: var(--primary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        color: var(--text-primary);
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--primary-blue);
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
        }

        &::placeholder {
          color: var(--text-muted);
        }
      }

      .clear-btn {
        position: absolute;
        right: var(--spacing-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }
      }
    }
  }

  .airports-list .airport-item {
    justify-content: space-between;
    border-radius: var(--radius-md);
    border: 1px solid transparent;

    .airport-info {
      .airport-code {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: var(--font-size-md);
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 2px;

        .modified-indicator {
          color: var(--warning-yellow);
          display: flex;
          align-items: center;
        }
      }
    }

    .selection-indicator {
      flex-shrink: 0;
      margin-left: var(--spacing-sm);

      .check-icon {
        color: var(--primary-blue);
      }
    }
  }
}

@media (max-width: 767px) {
  .airport-selection {
    .search-section {
      padding: var(--spacing-xs) var(--spacing-md);
    }

    .airports-list .airport-item .airport-info .airport-code {
      font-size: var(--font-size-sm);
    }
  }
}
</style>