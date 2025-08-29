<template>
  <div class="enroute-view">
    <!-- Enroute Selection Component -->
    <EnrouteSelection 
      :visible="showEnrouteSelection"
      :active-category="activeChartCategory"
      @close="handleEnrouteSelectionClose"
      @select-chart="handleChartSelect"
    />

    <!-- PDF Viewer or Default Content -->
    <div class="enroute-content">
      <PdfViewer 
        v-if="pdfUrl"
        :src="pdfUrl"
        @page-change="handlePdfPageChange"
        @zoom-change="handlePdfZoomChange"
        @loaded="handlePdfLoaded"
        @error="handlePdfError"
      />
      <div v-else class="default-content">
        <h1>航路图查看</h1>
        <p>请选择航路图进行查看</p>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import pubsub from 'pubsub-js'
import EnrouteSelection from '@/components/Selection/EnrouteSelection.vue'
import PdfViewer from '@/components/Common/PDFViewer/PdfViewer.vue'

// Enroute Selection state
const showEnrouteSelection = ref(false)
const activeChartCategory = ref('enroute-chart')
const selectedChart = ref<OfficialENR | null>(null)

// PDF URL computation
const pdfUrl = computed(() => {
  if (!selectedChart.value?.pdfPath) return null
  return import.meta.env.VITE_API_HOST + '/data' + selectedChart.value.pdfPath
})

// Enroute Selection handlers
const handleEnrouteSelectionClose = () => {
  showEnrouteSelection.value = false
}

const handleChartSelect = (chart: OfficialENR) => {
  console.log('Selected ENR chart:', chart)
  showEnrouteSelection.value = false
  selectedChart.value = chart
  console.log('PDF URL will be:', import.meta.env.VITE_API_HOST + '/data' + chart.pdfPath)
  pubsub.publish('title-change', {
    title: chart.name_cn || chart.name_en || 'ENR图',
    subtitle: chart.Section || ''
  })
}

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
const handleShowEnrouteSelection = (message: string, data: any) => {
  if (data?.category) {
    activeChartCategory.value = data.category
  }
  showEnrouteSelection.value = true
}

const handleLoadEnrouteChart = (message: string, chart: OfficialENR) => {
  console.log('直接加载ENR航路图:', chart)
  showEnrouteSelection.value = false
  selectedChart.value = chart
  console.log('PDF URL will be:', import.meta.env.VITE_API_HOST + '/data' + chart.pdfPath)
  pubsub.publish('title-change', {
    title: chart.name_cn || chart.name_en || 'ENR图',
    subtitle: chart.Section || ''
  })
}

// Lifecycle
onMounted(() => {
  // Subscribe to pubsub events
  pubsub.subscribe('show-enroute-selection', handleShowEnrouteSelection)
  pubsub.subscribe('load-enroute-chart', handleLoadEnrouteChart)
})

onUnmounted(() => {
  // Unsubscribe from pubsub events
  pubsub.unsubscribe('show-enroute-selection')
  pubsub.unsubscribe('load-enroute-chart')
})
</script>

<style lang='scss' scoped>
.enroute-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.enroute-content {
  height: 100%;
  overflow: hidden;
  
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
}
</style>
