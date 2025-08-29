/**
 * 航路数据辅助函数
 * 处理ENR数据结构
 */

import { readENRData } from './transcriptStorage'

/**
 * 获取全部航路图列表（只要有pdfPath的文件）
 * @returns Promise<OfficialENR[]> 航路图列表
 */
export const getEnrouteCharts = async (): Promise<OfficialENR[]> => {
  try {
    const allENRData = await readENRData()
    
    // 过滤出有pdfPath的数据
    return allENRData.filter(enrItem => 
      enrItem.pdfPath && enrItem.pdfPath.trim() !== ''
    )
    
  } catch (error) {
    console.error('Failed to get enroute charts:', error)
    throw new Error('无法获取航路图列表')
  }
}

/**
 * 根据Section分组获取航路图
 * @returns Promise<{ [section: string]: OfficialENR[] }> 按Section分组的航路图
 */
export const getEnrouteChartsBySection = async (): Promise<{ [section: string]: OfficialENR[] }> => {
  try {
    const allCharts = await getEnrouteCharts()
    const sectionMap: { [section: string]: OfficialENR[] } = {}
    
    allCharts.forEach(chart => {
      const section = chart.Section || '其他'
      if (!sectionMap[section]) {
        sectionMap[section] = []
      }
      sectionMap[section].push(chart)
    })
    
    return sectionMap
    
  } catch (error) {
    console.error('Failed to get enroute charts by section:', error)
    throw new Error('无法获取分组航路图')
  }
}

/**
 * 获取航路图数量统计
 * @returns Promise<number> 航路图总数
 */
export const getEnrouteChartsCount = async (): Promise<number> => {
  try {
    const charts = await getEnrouteCharts()
    return charts.length
  } catch (error) {
    console.error('Failed to get enroute charts count:', error)
    return 0
  }
}

/**
 * 检查是否有修改的航路图
 * @returns Promise<boolean> 是否有修改
 */
export const hasEnrouteModifications = async (): Promise<boolean> => {
  try {
    const charts = await getEnrouteCharts()
    return charts.some(chart => chart.Is_Modified === 'Y')
  } catch (error) {
    console.error('Failed to check enroute modifications:', error)
    return false
  }
}

/**
 * 获取ENR 6.2 航路图（大图）
 * @returns Promise<OfficialENR | null> ENR 6.2 航路图
 */
export const getEnrouteMainChart = async (): Promise<OfficialENR | null> => {
  try {
    const allCharts = await getEnrouteCharts()
    
    // 查找名字为"ENR 6.2 航路图"的文件
    const mainChart = allCharts.find(chart => 
      chart.name_cn && chart.name_cn.includes('ENR 6.2') && chart.name_cn.includes('航路图')
    )
    
    return mainChart || null
    
  } catch (error) {
    console.error('Failed to get ENR main chart:', error)
    throw new Error('无法获取ENR 6.2 航路图')
  }
}

/**
 * 获取区域图列表（中文名字里有"区域图"的航图）
 * @returns Promise<OfficialENR[]> 区域图列表
 */
export const getRegionCharts = async (): Promise<OfficialENR[]> => {
  try {
    const allCharts = await getEnrouteCharts()
    
    // 过滤出中文名字里有"区域图"的航图
    return allCharts.filter(chart => 
      chart.name_cn && chart.name_cn.includes('区域图')
    )
    
  } catch (error) {
    console.error('Failed to get region charts:', error)
    throw new Error('无法获取区域图列表')
  }
}

/**
 * 根据关键词搜索航路图
 * @param keyword 搜索关键词（支持名称搜索）
 * @returns Promise<OfficialENR[]> 匹配的航路图列表
 */
export const searchEnrouteCharts = async (keyword: string): Promise<OfficialENR[]> => {
  try {
    if (!keyword || keyword.trim().length === 0) {
      return []
    }
    
    const allCharts = await getEnrouteCharts()
    const searchTerm = keyword.trim().toLowerCase()
    
    return allCharts.filter(chart => 
      (chart.name_cn && chart.name_cn.toLowerCase().includes(searchTerm)) ||
      (chart.name_en && chart.name_en.toLowerCase().includes(searchTerm)) ||
      (chart.Section && chart.Section.toLowerCase().includes(searchTerm))
    )
    
  } catch (error) {
    console.error(`Failed to search enroute charts with keyword "${keyword}":`, error)
    throw new Error('航路图搜索失败')
  }
}
