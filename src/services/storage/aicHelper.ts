/**
 * AIC数据辅助函数
 * 处理AIC数据结构
 */

import { readAICData } from './transcriptStorage'

/**
 * 获取全部AIC列表（只要有Document的文件）
 * @returns Promise<OfficialAIC[]> AIC列表
 */
export const getAicCharts = async (): Promise<OfficialAIC[]> => {
  try {
    const allAICData = await readAICData()
    
    // 过滤出有Document的数据
    return allAICData.filter(aicItem => 
      aicItem.Document && aicItem.Document.trim() !== ''
    )
    
  } catch (error) {
    throw new Error('无法获取AIC列表')
  }
}

/**
 * 根据Section分组获取AIC
 * @returns Promise<{ [section: string]: OfficialAIC[] }> 按Section分组的AIC
 */
export const getAicChartsBySection = async (): Promise<{ [section: string]: OfficialAIC[] }> => {
  try {
    const allCharts = await getAicCharts()
    const sectionMap: { [section: string]: OfficialAIC[] } = {}
    
    allCharts.forEach(chart => {
      const section = chart.CHAPTER_TYPE || '其他'
      if (!sectionMap[section]) {
        sectionMap[section] = []
      }
      sectionMap[section].push(chart)
    })
    
    return sectionMap
    
  } catch (error) {
    console.error('Failed to get aic charts by section:', error)
    throw new Error('无法获取分组AIC')
  }
}

/**
 * 获取AIC数量统计
 * @returns Promise<number> AIC总数
 */
export const getAicChartsCount = async (): Promise<number> => {
  try {
    const charts = await getAicCharts()
    return charts.length
  } catch (error) {
    console.error('Failed to get aic charts count:', error)
    return 0
  }
}

/**
 * 检查是否有修改的AIC
 * @returns Promise<boolean> 是否有修改
 */
export const hasAicModifications = async (): Promise<boolean> => {
  try {
    const charts = await getAicCharts()
    return charts.some(chart => chart.IS_MODIFIED === 'Y')
  } catch (error) {
    console.error('Failed to check aic modifications:', error)
    return false
  }
}

/**
 * 根据关键词搜索AIC
 * @param keyword 搜索关键词（支持名称搜索）
 * @returns Promise<OfficialAIC[]> 匹配的AIC列表
 */
export const searchAicCharts = async (keyword: string): Promise<OfficialAIC[]> => {
  try {
    if (!keyword || keyword.trim().length === 0) {
      return []
    }
    
    const allCharts = await getAicCharts()
    const searchTerm = keyword.trim().toLowerCase()
    
    return allCharts.filter(chart => 
      (chart.Subject && chart.Subject.toLowerCase().includes(searchTerm)) ||
      (chart.Local_Subject && chart.Local_Subject.toLowerCase().includes(searchTerm)) ||
      (chart.CHAPTER_TYPE && chart.CHAPTER_TYPE.toLowerCase().includes(searchTerm))
    )
    
  } catch (error) {
    console.error(`Failed to search aic charts with keyword "${keyword}":`, error)
    throw new Error('AIC搜索失败')
  }
}
