/**
 * NOTAM数据辅助函数
 * 处理NOTAM数据结构
 */

import { readNOTAMData } from './transcriptStorage'

/**
 * 获取全部NOTAM列表（只要有Document的文件）
 * @returns Promise<OfficialNOTAM[]> NOTAM列表
 */
export const getNotamCharts = async (): Promise<OfficialNOTAM[]> => {
  try {
    const allNOTAMData = await readNOTAMData()
    
    // 过滤出有Document的数据
    return allNOTAMData.filter(notamItem => 
      notamItem.Document && notamItem.Document.trim() !== ''
    )
    
  } catch (error) {
    console.error('Failed to get notam charts:', error)
    throw new Error('无法获取NOTAM列表')
  }
}

/**
 * 根据Section分组获取NOTAM
 * @returns Promise<{ [section: string]: OfficialNOTAM[] }> 按Section分组的NOTAM
 */
export const getNotamChartsBySection = async (): Promise<{ [section: string]: OfficialNOTAM[] }> => {
  try {
    const allCharts = await getNotamCharts()
    const sectionMap: { [section: string]: OfficialNOTAM[] } = {}
    
    allCharts.forEach(chart => {
      const section = 'NOTAM'
      if (!sectionMap[section]) {
        sectionMap[section] = []
      }
      sectionMap[section].push(chart)
    })
    
    return sectionMap
    
  } catch (error) {
    console.error('Failed to get notam charts by section:', error)
    throw new Error('无法获取分组NOTAM')
  }
}

/**
 * 获取NOTAM数量统计
 * @returns Promise<number> NOTAM总数
 */
export const getNotamChartsCount = async (): Promise<number> => {
  try {
    const charts = await getNotamCharts()
    return charts.length
  } catch (error) {
    console.error('Failed to get notam charts count:', error)
    return 0
  }
}

/**
 * 检查是否有修改的NOTAM
 * @returns Promise<boolean> 是否有修改
 */
export const hasNotamModifications = async (): Promise<boolean> => {
  return false
}

/**
 * 根据关键词搜索NOTAM
 * @param keyword 搜索关键词（支持名称搜索）
 * @returns Promise<OfficialNOTAM[]> 匹配的NOTAM列表
 */
export const searchNotamCharts = async (keyword: string): Promise<OfficialNOTAM[]> => {
  try {
    if (!keyword || keyword.trim().length === 0) {
      return []
    }
    
    const allCharts = await getNotamCharts()
    const searchTerm = keyword.trim().toLowerCase()
    
    return allCharts.filter(chart => 
      (chart.SeriesName && chart.SeriesName.toLowerCase().includes(searchTerm))
    )
    
  } catch (error) {
    console.error(`Failed to search notam charts with keyword "${keyword}":`, error)
    throw new Error('NOTAM搜索失败')
  }
}
