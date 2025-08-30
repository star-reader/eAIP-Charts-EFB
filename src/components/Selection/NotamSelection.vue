<template>
  <BaseSelection
    :visible="visible"
    :active-category="activeCategory"
    :category-titles="categoryTitles"
    loading-text="正在加载NOTAM..."
    :load-charts-function="loadChartsFunction"
    :get-chart-key="getChartKey"
    :get-chart-main-name="getChartMainName"
    :get-chart-sub-name="getChartSubName"
    :is-chart-modified="isChartModified"
    @close="handleClose"
    @select-chart="handleChartSelect"
  />
</template>

<script lang='ts' setup>
import BaseSelection from './BaseSelection.vue'
import { getNotamChartsBySection } from '@/services/storage/notamHelper.js'

// Props
interface Props {
  visible?: boolean
  activeCategory?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activeCategory: 'notam-list'
})

// Emits
const emit = defineEmits<{
  close: []
  selectChart: [chart: OfficialNOTAM]
}>()

// 分类标题映射
const categoryTitles: Record<string, string> = {
  'notam-list': 'NOTAM列表'
}

// Helper functions
const loadChartsFunction = async () => {
  return await getNotamChartsBySection()
}

const getChartKey = (chart: OfficialNOTAM) => {
  return String(chart.Document)
}

const getChartMainName = (chart: OfficialNOTAM) => {
  return chart.SeriesName || 'NOTAM'
}

const getChartSubName = (chart: OfficialNOTAM) => {
  return '' // NOTAM没有副标题
}

const isChartModified = (chart: OfficialNOTAM) => {
  return false // NOTAM没有修改标记
}

// Event handlers
const handleClose = () => {
  emit('close')
}

const handleChartSelect = (chart: OfficialNOTAM) => {
  emit('selectChart', chart)
}
</script>