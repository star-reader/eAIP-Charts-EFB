<template>
  <BaseSelection
    :visible="visible"
    :active-category="activeCategory"
    :category-titles="categoryTitles"
    loading-text="正在加载AIC..."
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
import { getAicChartsBySection } from '@/services/storage/aicHelper.js'

// Props
interface Props {
  visible?: boolean
  activeCategory?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activeCategory: 'aic-list'
})

// Emits
const emit = defineEmits<{
  close: []
  selectChart: [chart: OfficialAIC]
}>()

// 分类标题映射
const categoryTitles: Record<string, string> = {
  'aic-list': 'AIC列表'
}

// Helper functions
const loadChartsFunction = async () => {
  return await getAicChartsBySection()
}

const getChartKey = (chart: OfficialAIC) => {
  return String(chart.Id)
}

const getChartMainName = (chart: OfficialAIC) => {
  const chartName = chart.Local_Subject || chart.Subject || 'AIC'
  // 获取冒号后面的部分作为主要显示内容
  if (!chartName) return ''
  const parts = chartName.split(':')
  return parts.length > 1 ? parts[1].trim() : chartName
}

const getChartSubName = (chart: OfficialAIC) => {
  const chartName = chart.Local_Subject || chart.Subject || ''
  // 获取冒号前面的部分作为副标题
  if (!chartName) return ''
  const parts = chartName.split(':')
  return parts.length > 1 ? parts[0].trim() : ''
}

const isChartModified = (chart: OfficialAIC) => {
  return chart.IS_MODIFIED === 'Y'
}

// Event handlers
const handleClose = () => {
  emit('close')
}

const handleChartSelect = (chart: OfficialAIC) => {
  emit('selectChart', chart)
}
</script>