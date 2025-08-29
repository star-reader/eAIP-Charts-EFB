<template>
  <div class="airport-view">
    <!-- Airport Selection Component -->
    <AirportSelection 
      :visible="showAirportSelection"
      :selected-airport="selectedAirport"
      @close="handleAirportSelectionClose"
      @select="handleAirportSelect"
    />

    <!-- Charts Selection Component -->
    <CategorizedCharts 
      :visible="showChartsSelection"
      :selected-airport="currentAirportData"
      :active-category="activeChartCategory"
      @close="handleChartsSelectionClose"
      @select-chart="handleChartSelect"
    />

    <!-- PDF Viewer or Default Content -->
    <div class="airport-content">
      <PdfViewer 
        v-if="pdfUrl"
        :src="pdfUrl"
        @page-change="handlePdfPageChange"
        @zoom-change="handlePdfZoomChange"
        @loaded="handlePdfLoaded"
        @error="handlePdfError"
      />
      <div v-else class="default-content">
        <h1>机场图查看</h1>
        <p>请选择机场和航图进行查看</p>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import pubsub from 'pubsub-js'
import AirportSelection from '@/components/Selection/AirportSelection.vue'
import CategorizedCharts from '@/components/Selection/CategorizedCharts.vue'
import PdfViewer from '@/components/Common/PDFViewer/PdfViewer.vue'

// Airport Selection state
const showAirportSelection = ref(false)
const selectedAirport = ref('ZBAA') // 默认机场
const currentAirportData = ref<AirportList | null>(null)

// Charts Selection state
const showChartsSelection = ref(false)
const activeChartCategory = ref('airport-chart')
const selectedChart = ref<OfficialAD | null>(null)

// PDF URL computation
const pdfUrl = computed(() => {
  if (!selectedChart.value?.pdfPath) return null
  return import.meta.env.VITE_API_HOST + '/data' + selectedChart.value.pdfPath
})

// Airport Selection handlers
const handleAirportSelectionClose = () => {
  showAirportSelection.value = false
}

const handleAirportSelect = (airport: AirportList) => {
  selectedAirport.value = airport.airporticao
  currentAirportData.value = airport
  showAirportSelection.value = false
}

// Charts Selection handlers
const handleChartsSelectionClose = () => {
  showChartsSelection.value = false
}

const handleChartSelect = (chart: OfficialAD) => {
  showChartsSelection.value = false
  selectedChart.value = chart
  pubsub.publish('title-change', {
    title: chart.name,
    subtitle: ''
  })
}


// PDF Viewer event handlers
// 真不知道写啥了， console.log也不用了
const handlePdfPageChange = (page: number) => {
}

const handlePdfZoomChange = (zoom: number) => {
}

const handlePdfLoaded = (totalPages: number) => {
}

const handlePdfError = (error: string) => {
}

// PubSub event handlers
const handleShowAirportSelection = (message: string, data: any) => {
  if (data?.selectedAirport) {
    selectedAirport.value = data.selectedAirport
  }
  showAirportSelection.value = true
}

const handleAirportSelected = (message: string, airport: AirportList) => {
  selectedAirport.value = airport.airporticao
  currentAirportData.value = airport
  showAirportSelection.value = false
}

const handleShowChartsSelection = (message: string, data: any) => {
  if (data?.category) {
    activeChartCategory.value = data.category
  }
  if (data?.selectedAirport) {
    selectedAirport.value = data.selectedAirport
  }
  showChartsSelection.value = true
}

// Lifecycle
onMounted(() => {
  // Subscribe to pubsub events
  pubsub.subscribe('show-airport-selection', handleShowAirportSelection)
  pubsub.subscribe('airport-selected', handleAirportSelected)
  pubsub.subscribe('show-charts-selection', handleShowChartsSelection)
  pubsub.subscribe('chart-ad-selected', (_, data) => handleChartSelect(data))
})

onUnmounted(() => {
  // Unsubscribe from pubsub events
  pubsub.unsubscribe('show-airport-selection')
  pubsub.unsubscribe('airport-selected')
  pubsub.unsubscribe('show-charts-selection')
})
</script>

<style lang='scss' scoped>
.airport-view {
  position: relative;
  width: 100%;
  height: 100%;
}

.airport-content {
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