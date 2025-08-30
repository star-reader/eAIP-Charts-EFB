<template>
  <div class="notam-view">
    <!-- Notam Selection Component -->
    <NotamSelection 
      :visible="showNotamSelection"
      :active-category="activeChartCategory"
      @close="handleNotamSelectionClose"
      @select-chart="handleChartSelect"
    />

    <!-- PDF Viewer or Default Content -->
    <div class="notam-content">
      <PdfViewer 
        v-if="pdfUrl"
        :src="pdfUrl"
        @page-change="handlePdfPageChange"
        @zoom-change="handlePdfZoomChange"
        @loaded="handlePdfLoaded"
        @error="handlePdfError"
      />
      <div v-else class="default-content">
        <h1>NOTAM查看</h1>
        <p>请选择NOTAM进行查看</p>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import pubsub from 'pubsub-js'
import NotamSelection from '../components/Selection/NotamSelection.vue'
import PdfViewer from '@/components/Common/PDFViewer/PdfViewer.vue'

// Notam Selection state
const showNotamSelection = ref(false)
const activeChartCategory = ref('notam-list')
const selectedChart = ref<OfficialNOTAM | null>(null)

// PDF URL computation
const pdfUrl = computed(() => {
  if (!selectedChart.value?.Document) {
    return null
  }
  const url = import.meta.env.VITE_API_HOST + '/data' + selectedChart.value.Document
  return url
})

// Notam Selection handlers
const handleNotamSelectionClose = () => {
  showNotamSelection.value = false
}

const handleChartSelect = (chart: OfficialNOTAM) => {
  showNotamSelection.value = false
  selectedChart.value = chart
  pubsub.publish('title-change', {
    title: chart.Local_Subject || chart.Subject || 'NOTAM',
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
const handleShowNotamSelection = (message: string, data: any) => {
  if (data?.category) {
    activeChartCategory.value = data.category
  }
  showNotamSelection.value = true
}

// Lifecycle
onMounted(() => {
  pubsub.subscribe('show-notam-selection', handleShowNotamSelection)
})

onUnmounted(() => {
  pubsub.unsubscribe('show-notam-selection')
})
</script>

<style lang='scss' scoped>
.notam-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.notam-content {
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
