<template>
  <BaseView
    view-class="notam-view"
    content-class="notam-content"
    :selection-component="NotamSelection"
    default-title="NOTAM查看"
    default-description="请选择NOTAM进行查看"
    default-category="notam-list"
    pubsub-event="show-notam-selection"
    :get-document-path="getDocumentPath"
    :get-title-info="getTitleInfo"
  />
</template>

<script lang='ts' setup>
import BaseView from '@/components/Common/BaseView.vue'
import NotamSelection from '../components/Selection/NotamSelection.vue'

// Helper functions
const getDocumentPath = (chart: OfficialNOTAM) => {
  return chart?.Document || null
}

const getTitleInfo = (chart: OfficialNOTAM) => {
  return {
    title: chart.SeriesName || 'NOTAM',
    subtitle: ''
  }
}
</script>
