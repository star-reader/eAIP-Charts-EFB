<template>
  <BaseView
    view-class="aic-view"
    content-class="aic-content"
    :selection-component="AicSelection"
    default-title="AIC查看"
    default-description="请选择AIC进行查看"
    default-category="aic-list"
    pubsub-event="show-aic-selection"
    :get-document-path="getDocumentPath"
    :get-title-info="getTitleInfo"
  />
</template>

<script lang='ts' setup>
import BaseView from '@/components/Common/BaseView.vue'
import AicSelection from '../components/Selection/AicSelection.vue'

// Helper functions
const getDocumentPath = (chart: OfficialAIC) => {
  return chart?.Document || null
}

const getTitleInfo = (chart: OfficialAIC) => {
  return {
    title: chart.Local_Subject || chart.Subject || 'AIC',
    subtitle: chart.CHAPTER_TYPE || ''
  }
}
</script>
