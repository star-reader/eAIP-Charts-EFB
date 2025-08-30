<template>
  <div class="sup-view">
    <!-- Sup Selection Component -->
    <SupSelection 
      :visible="showSupSelection"
      :active-category="activeChartCategory"
      @close="handleSupSelectionClose"
      @select-chart="handleChartSelect"
    />

    <!-- PDF Viewer or Default Content -->
    <div class="sup-content">
      <PdfViewer 
        v-if="pdfUrl"
        :src="pdfUrl"
        @page-change="handlePdfPageChange"
        @zoom-change="handlePdfZoomChange"
        @loaded="handlePdfLoaded"
        @error="handlePdfError"
      />
      <div v-else class="default-content">
        <h1>SUP查看</h1>
        <p>请选择SUP进行查看</p>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import pubsub from 'pubsub-js'
import SupSelection from '../components/Selection/SupSelection.vue'
import PdfViewer from '@/components/Common/PDFViewer/PdfViewer.vue'

// Sup Selection state
const showSupSelection = ref(false)
const activeChartCategory = ref('sup-list')
const selectedChart = ref<OfficialSUP | null>(null)

// PDF URL computation
const pdfUrl = computed(() => {
  if (!selectedChart.value?.Document) {
    return null
  }
  const url = import.meta.env.VITE_API_HOST + '/data' + selectedChart.value.Document
  return url
})

// Sup Selection handlers
const handleSupSelectionClose = () => {
  showSupSelection.value = false
}

const handleChartSelect = (chart: OfficialSUP) => {
  showSupSelection.value = false
  selectedChart.value = chart
  pubsub.publish('title-change', {
    title: chart.Local_Subject || chart.Subject || 'SUP',
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
const handleShowSupSelection = (message: string, data: any) => {
  if (data?.category) {
    activeChartCategory.value = data.category
  }
  showSupSelection.value = true
}

// Lifecycle
onMounted(() => {
  pubsub.subscribe('show-sup-selection', handleShowSupSelection)
})

onUnmounted(() => {
  pubsub.unsubscribe('show-sup-selection')
})
</script>

<style lang='scss' scoped>
.sup-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.sup-content {
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
