<template>
  <BaseView
    view-class="sup-view"
    content-class="sup-content"
    :selection-component="SupSelection"
    default-title="SUP查看"
    default-description="请选择SUP进行查看"
    default-category="sup-list"
    pubsub-event="show-sup-selection"
    :get-document-path="getDocumentPath"
    :get-title-info="getTitleInfo"
  />
</template>

<script lang='ts' setup>
import BaseView from '@/components/Common/BaseView.vue'
import SupSelection from '../components/Selection/SupSelection.vue'

// Helper functions
const getDocumentPath = (chart: OfficialSUP) => {
  return chart?.Document || null
}

const getTitleInfo = (chart: OfficialSUP) => {
  return {
    title: chart.Local_Subject || chart.Subject || 'SUP',
    subtitle: chart.CHAPTER_TYPE || ''
  }
}
</script>
