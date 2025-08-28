/**
 * 机场数据辅助函数
 * 提供机场列表获取和航图查询功能
 */

import { readADData } from './transcriptStorage'

/**
 * 获取全部机场列表
 * @returns Promise<AirportList[]> 机场列表，包含修改状态
 */
export const getAllAirportsList = async (): Promise<AirportList[]> => {
  try {
    const allADData = await readADData()
    
    const airportMap = new Map<string, AirportList>()
    
    allADData.forEach(adItem => {
      const icao = adItem.airporticao
      
      if (!airportMap.has(icao)) {
        airportMap.set(icao, {
          airporticao: icao,
          name_cn: adItem.name_cn,
          Is_Modified: 'false' // 默认为false
        })
      }
      
      // 检查当前AD项是否被修改
      // Is_Modified是字符串类型 "true"/"false" 或者 null
      if (adItem.Is_Modified === 'Y') {
        // 如果有任何一个图表被修改，则整个机场标记为已修改
        const airport = airportMap.get(icao)!
        airport.Is_Modified = 'true'
      }
    })
    
    // 转换Map为数组并按ICAO排序
    return Array.from(airportMap.values()).sort((a, b) => 
      a.airporticao.localeCompare(b.airporticao)
    )
    
  } catch (error) {
    console.error('Failed to get airports list:', error)
    throw new Error('无法获取机场列表')
  }
}

/**
 * 根据ICAO代码获取机场的全部航图列表
 * @param icao 机场ICAO代码
 * @returns Promise<OfficialAD[]> 该机场的所有航图数据
 */
export const getAirportChartsByICAO = async (icao: string): Promise<OfficialAD[]> => {
  try {
    // 验证ICAO参数
    if (!icao || typeof icao !== 'string') {
      throw new Error('ICAO代码无效')
    }
    
    // 转换为大写以确保匹配
    const upperICAO = icao.toUpperCase()
    
    // 从IndexedDB读取所有AD数据
    const allADData = await readADData()
    
    // 过滤出指定机场的所有图表
    const airportCharts = allADData.filter(adItem => 
      adItem.airporticao?.toUpperCase() === upperICAO
    )
    
    // 按图表名称排序，确保有序显示
    airportCharts.sort((a, b) => {
      // 优先按照pId排序（父级结构）
      if (a.pId !== b.pId) {
        return a.pId.localeCompare(b.pId)
      }
      // 其次按照name排序
      return a.name.localeCompare(b.name)
    })
    
    return airportCharts
    
  } catch (error) {
    console.error(`Failed to get charts for airport ${icao}:`, error)
    throw new Error(`无法获取机场 ${icao} 的航图列表`)
  }
}

/**
 * 获取指定机场的航图数量统计
 * @param icao 机场ICAO代码
 * @returns Promise<number> 该机场的航图总数
 */
export const getAirportChartsCount = async (icao: string): Promise<number> => {
  try {
    const charts = await getAirportChartsByICAO(icao)
    return charts.length
  } catch (error) {
    console.error(`Failed to get charts count for airport ${icao}:`, error)
    return 0
  }
}

/**
 * 检查指定机场是否有修改的航图
 * @param icao 机场ICAO代码
 * @returns Promise<boolean> 是否有修改
 */
export const hasAirportModifications = async (icao: string): Promise<boolean> => {
  try {
    const charts = await getAirportChartsByICAO(icao)
    return charts.some(chart => 
      chart.Is_Modified === 'true'
    )
  } catch (error) {
    console.error(`Failed to check modifications for airport ${icao}:`, error)
    return false
  }
}

/**
 * 根据关键词搜索机场
 * @param keyword 搜索关键词（支持ICAO代码或中文名称）
 * @returns Promise<AirportList[]> 匹配的机场列表
 */
export const searchAirports = async (keyword: string): Promise<AirportList[]> => {
  try {
    if (!keyword || keyword.trim().length === 0) {
      return []
    }
    
    const allAirports = await getAllAirportsList()
    const searchTerm = keyword.trim().toLowerCase()
    
    return allAirports.filter(airport => 
      airport.airporticao.toLowerCase().includes(searchTerm) ||
      airport.name_cn.toLowerCase().includes(searchTerm)
    )
    
  } catch (error) {
    console.error(`Failed to search airports with keyword "${keyword}":`, error)
    throw new Error('机场搜索失败')
  }
}
