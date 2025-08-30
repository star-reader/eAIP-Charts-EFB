<template>
  <div :class="viewClass">
    <!-- Selection Component -->
    <component 
      :is="selectionComponent"
      :visible="showSelection"
      :active-category="activeChartCategory"
      v-bind="selectionProps"
      @close="handleSelectionClose"
      @select-chart="handleChartSelect"
    />

    <!-- PDF Viewer or Default Content -->
    <div :class="contentClass">
      <PdfViewer 
        v-if="pdfUrl"
        :src="pdfUrl"
        @page-change="handlePdfPageChange"
        @zoom-change="handlePdfZoomChange"
        @loaded="handlePdfLoaded"
        @error="handlePdfError"
      />
      <div v-else class="default-content">
        <h1>{{ defaultTitle }}</h1>
        <p>{{ defaultDescription }}</p>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import pubsub from 'pubsub-js'
import PdfViewer from '@/components/Common/PDFViewer/PdfViewer.vue'

// Props
interface Props {
  viewClass: string
  contentClass: string
  selectionComponent: any
  selectionProps?: Record<string, any>
  defaultTitle: string
  defaultDescription: string
  defaultCategory: string
  pubsubEvent: string
  extraPubsubEvents?: Array<{
    event: string
    handler: (message: string, data: any) => void
  }>
  getDocumentPath: (chart: any) => string | null
  getTitleInfo: (chart: any) => { title: string; subtitle: string }
}

const props = withDefaults(defineProps<Props>(), {
  selectionProps: () => ({}),
  extraPubsubEvents: () => ([])
})

// State
const showSelection = ref(false)
const activeChartCategory = ref(props.defaultCategory)
const selectedChart = ref<any>(null)

// PDF URL computation
const pdfUrl = computed(() => {
  if (!selectedChart.value) return null
  const documentPath = props.getDocumentPath(selectedChart.value)
  if (!documentPath) return null
  return import.meta.env.VITE_API_HOST + '/data' + documentPath
})

// Selection handlers
const handleSelectionClose = () => {
  showSelection.value = false
}

const handleChartSelect = (chart: any) => {
  showSelection.value = false
  selectedChart.value = chart
  const titleInfo = props.getTitleInfo(chart)
  pubsub.publish('title-change', titleInfo)
}

// Expose method for direct chart loading
const loadChart = (chart: any) => {
  showSelection.value = false
  selectedChart.value = chart
  const titleInfo = props.getTitleInfo(chart)
  pubsub.publish('title-change', titleInfo)
}

// Expose methods to parent
defineExpose({
  loadChart
})

// PDF Viewer event handlers
const handlePdfPageChange = (page: number) => {
}

const handlePdfZoomChange = (zoom: number) => {
}

const handlePdfLoaded = (totalPages: number) => {
}

const handlePdfError = (error: string) => {
}

// PubSub event handlers
const handleShowSelection = (message: string, data: any) => {
  if (data?.category) {
    activeChartCategory.value = data.category
  }
  showSelection.value = true
}

// Lifecycle
onMounted(() => {
  pubsub.subscribe(props.pubsubEvent, handleShowSelection)
  
  // Subscribe to extra events
  props.extraPubsubEvents.forEach(({ event, handler }) => {
    pubsub.subscribe(event, handler)
  })
})

onUnmounted(() => {
  pubsub.unsubscribe(props.pubsubEvent)
  
  // Unsubscribe from extra events
  props.extraPubsubEvents.forEach(({ event }) => {
    pubsub.unsubscribe(event)
  })
})
</script>

<style lang='scss' scoped>
// 通用样式
.default-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  text-align: center;
  
  h1 {
    color: var(--text-primary);
    margin: 0 0 var(--spacing-md) 0;
    font-size: var(--font-size-xl);
  }
  
  p {
    color: var(--text-secondary);
    margin: 0;
    font-size: var(--font-size-md);
  }
}

// 各种View的样式
:deep(.sup-view),
:deep(.aic-view),
:deep(.notam-view),
:deep(.enroute-view) {
  position: relative;
  width: 100%;
  height: 100%;
}

:deep(.sup-content),
:deep(.aic-content),
:deep(.notam-content),
:deep(.enroute-content) {
  height: 100%;
  overflow: hidden;
}
</style>
