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

    <div class="airport-content">
      <h1>Airport View Page</h1>
      <p>This is where airport-specific content will be displayed.</p>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref, onMounted, onUnmounted } from 'vue'
import pubsub from 'pubsub-js'
import AirportSelection from '@/components/Selection/AirportSelection.vue'
import CategorizedCharts from '@/components/Selection/CategorizedCharts.vue'

// Airport Selection state
const showAirportSelection = ref(false)
const selectedAirport = ref('ZBAA') // 默认机场
const currentAirportData = ref<AirportList | null>(null)

// Charts Selection state
const showChartsSelection = ref(false)
const activeChartCategory = ref('airport-chart')

// Airport Selection handlers
const handleAirportSelectionClose = () => {
  showAirportSelection.value = false
}

const handleAirportSelect = (airport: AirportList) => {
  selectedAirport.value = airport.airporticao
  currentAirportData.value = airport
  showAirportSelection.value = false
  console.log('Selected airport:', airport)
}

// Charts Selection handlers
const handleChartsSelectionClose = () => {
  showChartsSelection.value = false
}

const handleChartSelect = (chart: OfficialAD) => {
  showChartsSelection.value = false
  console.log('Selected chart:', chart)
  // 这里可以添加打开PDF查看器或其他逻辑
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
  console.log('Airport selected via pubsub:', airport)
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
  padding: var(--spacing-lg);
  height: 100%;
  
  h1 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
  }
  
  p {
    color: var(--text-secondary);
  }
}
</style>