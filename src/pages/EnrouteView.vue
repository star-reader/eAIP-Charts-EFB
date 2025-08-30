<template>
  <BaseView
    ref="baseViewRef"
    view-class="enroute-view"
    content-class="enroute-content"
    :selection-component="EnrouteSelection"
    default-title="航路图查看"
    default-description="请选择航路图进行查看"
    default-category="enroute-chart"
    pubsub-event="show-enroute-selection"
    :extra-pubsub-events="extraEvents"
    :get-document-path="getDocumentPath"
    :get-title-info="getTitleInfo"
  />
</template>

<script lang='ts' setup>
import { ref } from 'vue'
import BaseView from '@/components/Common/BaseView.vue'
import EnrouteSelection from '@/components/Selection/EnrouteSelection.vue'

// Ref to BaseView
const baseViewRef = ref<InstanceType<typeof BaseView> | null>(null)

// Helper functions
const getDocumentPath = (chart: OfficialENR) => {
  return chart?.pdfPath || null
}

const getTitleInfo = (chart: OfficialENR) => {
  return {
    title: chart.name_cn || chart.name_en || 'ENR图',
    subtitle: chart.Section || ''
  }
}

// Extra event handler for direct chart loading
const handleLoadEnrouteChart = (message: string, chart: OfficialENR) => {
  console.log('直接加载ENR航路图:', chart)
  if (baseViewRef.value) {
    baseViewRef.value.loadChart(chart)
  }
  console.log('PDF URL will be:', import.meta.env.VITE_API_HOST + '/data' + chart.pdfPath)
}

// Extra pubsub events
const extraEvents = [
  {
    event: 'load-enroute-chart',
    handler: handleLoadEnrouteChart
  }
]
</script>