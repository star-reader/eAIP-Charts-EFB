<template>
  <div class="aic-view">
    <!-- Aic Selection Component -->
    <AicSelection 
      :visible="showAicSelection"
      :active-category="activeChartCategory"
      @close="handleAicSelectionClose"
      @select-chart="handleChartSelect"
    />

    <!-- PDF Viewer or Default Content -->
    <div class="aic-content">
      <PdfViewer 
        v-if="pdfUrl"
        :src="pdfUrl"
        @page-change="handlePdfPageChange"
        @zoom-change="handlePdfZoomChange"
        @loaded="handlePdfLoaded"
        @error="handlePdfError"
      />
      <div v-else class="default-content">
        <h1>AIC查看</h1>
        <p>请选择AIC进行查看</p>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import pubsub from 'pubsub-js'
import AicSelection from '../components/Selection/AicSelection.vue'
import PdfViewer from '@/components/Common/PDFViewer/PdfViewer.vue'

// Aic Selection state
const showAicSelection = ref(false)
const activeChartCategory = ref('aic-list')
const selectedChart = ref<OfficialAIC | null>(null)

// PDF URL computation
const pdfUrl = computed(() => {
  if (!selectedChart.value?.Document) {
    return null
  }
  const url = import.meta.env.VITE_API_HOST + '/data' + selectedChart.value.Document
  return url
})

// Aic Selection handlers
const handleAicSelectionClose = () => {
  showAicSelection.value = false
}

const handleChartSelect = (chart: OfficialAIC) => {
  showAicSelection.value = false
  selectedChart.value = chart
  pubsub.publish('title-change', {
    title: chart.Local_Subject || chart.Subject || 'AIC',
    subtitle: chart.CHAPTER_TYPE || ''
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
const handleShowAicSelection = (message: string, data: any) => {
  if (data?.category) {
    activeChartCategory.value = data.category
  }
  showAicSelection.value = true
}

// Lifecycle
onMounted(() => {
  pubsub.subscribe('show-aic-selection', handleShowAicSelection)
})

onUnmounted(() => {
  pubsub.unsubscribe('show-aic-selection')
})
</script>

<style lang='scss' scoped>
.aic-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.aic-content {
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
