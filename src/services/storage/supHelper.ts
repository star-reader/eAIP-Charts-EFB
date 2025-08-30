/**
 * SUP数据辅助函数
 * 处理SUP数据结构
 */

import { readSUPData } from './transcriptStorage'

/**
 * 获取全部SUP列表（只要有pdfPath的文件）
 * @returns Promise<OfficialSUP[]> SUP列表
 */
export const getSupCharts = async (): Promise<OfficialSUP[]> => {
  try {
    const allSUPData = await readSUPData()
    
    // 过滤出有pdfPath的数据
    return allSUPData.filter(supItem => 
      supItem.Document && supItem.Document.trim() !== ''
    )
    
  } catch (error) {
    console.error('Failed to get sup charts:', error)
    throw new Error('无法获取SUP列表')
  }
}

/**
 * 根据Section分组获取SUP
 * @returns Promise<{ [section: string]: OfficialSUP[] }> 按Section分组的SUP
 */
export const getSupChartsBySection = async (): Promise<{ [section: string]: OfficialSUP[] }> => {
  try {
    const allCharts = await getSupCharts()
    const sectionMap: { [section: string]: OfficialSUP[] } = {}
    
    allCharts.forEach(chart => {
      const section = chart.CHAPTER_TYPE || '其他'
      if (!sectionMap[section]) {
        sectionMap[section] = []
      }
      sectionMap[section].push(chart)
    })
    
    return sectionMap
    
  } catch (error) {
    console.error('Failed to get sup charts by section:', error)
    throw new Error('无法获取分组SUP')
  }
}

/**
 * 获取SUP数量统计
 * @returns Promise<number> SUP总数
 */
export const getSupChartsCount = async (): Promise<number> => {
  try {
    const charts = await getSupCharts()
    return charts.length
  } catch (error) {
    console.error('Failed to get sup charts count:', error)
    return 0
  }
}

/**
 * 检查是否有修改的SUP
 * @returns Promise<boolean> 是否有修改
 */
export const hasSupModifications = async (): Promise<boolean> => {
  try {
    const charts = await getSupCharts()
    return charts.some(chart => chart.IS_MODIFIED === 'Y')
  } catch (error) {
    console.error('Failed to check sup modifications:', error)
    return false
  }
}

/**
 * 根据关键词搜索SUP
 * @param keyword 搜索关键词（支持名称搜索）
 * @returns Promise<OfficialSUP[]> 匹配的SUP列表
 */
export const searchSupCharts = async (keyword: string): Promise<OfficialSUP[]> => {
  try {
    if (!keyword || keyword.trim().length === 0) {
      return []
    }
    
    const allCharts = await getSupCharts()
    const searchTerm = keyword.trim().toLowerCase()
    
    return allCharts.filter(chart => 
      (chart.Subject && chart.Subject.toLowerCase().includes(searchTerm)) ||
      (chart.Local_Subject && chart.Local_Subject.toLowerCase().includes(searchTerm)) ||
      (chart.CHAPTER_TYPE && chart.CHAPTER_TYPE.toLowerCase().includes(searchTerm))
    )
    
  } catch (error) {
    console.error(`Failed to search sup charts with keyword "${keyword}":`, error)
    throw new Error('SUP搜索失败')
  }
}
