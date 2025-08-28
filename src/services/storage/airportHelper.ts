/**
 * 机场数据辅助函数
 * 处理复杂的层级化AD JSON数据结构
 */

import { readADData } from './transcriptStorage'

/**
 * 根据图表名称中的关键词确定类型
 * @param chartName 图表名称，如 "ZBAA-2F:APDC", "ZBOW-10C:IAC VOR/DME RWY13"
 * @returns 图表类型：
 * - 'dep': 包含 SID 关键词的离场图
 * - 'arr': 包含 STAR 关键词的进场图  
 * - 'app': 包含 ILS/RNAV/RNP/VOR/DME/NDB/IAC 关键词的进近图
 * - 'airport': 其他机场图
 */
const parseChartType = (chartName: string): 'dep' | 'arr' | 'app' | 'airport' => {
  if (!chartName) return 'airport';
  
  const upperName = chartName.toUpperCase();
  
  // SID关键词：离场图
  if (upperName.includes('SID')) return 'dep';
  
  // STAR关键词：进场图
  if (upperName.includes('STAR')) return 'arr';
  
  // 进近图关键词：ILS RNAV RNP VOR DME NDB IAC
  const approachKeywords = ['ILS', 'RNAV', 'RNP', 'VOR', 'DME', 'NDB', 'IAC'];
  if (approachKeywords.some(keyword => upperName.includes(keyword))) {
    return 'app';
  }
  
  // 其他都算机场图
  return 'airport';
}

/**
 * 获取全部机场列表
 * @returns Promise<AirportList[]> 机场列表，包含修改状态
 */
export const getAllAirportsList = async (): Promise<AirportList[]> => {
  try {
    const allADData = await readADData()
    const airportMap = new Map<string, AirportList>()
    
    // 遍历所有AD数据，找到有airporticao的项目作为机场起始点
    allADData.forEach((adItem, index) => {
      // 只处理有ICAO代码的项目（机场起始点）
      if (adItem.airporticao && adItem.airporticao.trim() !== '') {
        const icao = adItem.airporticao.trim().toUpperCase()
        
        if (!airportMap.has(icao)) {
          airportMap.set(icao, {
            airporticao: icao,
            name_cn: adItem.name_cn,
            Is_Modified: 'false'
          })
        }
        
        // 从当前位置开始向后搜索，直到遇到下一个机场或数据结束
        let hasModified = false
        for (let i = index; i < allADData.length; i++) {
          const currentItem = allADData[i]
          
          // 如果遇到下一个不同的机场ICAO代码，停止搜索
          if (i > index && currentItem.airporticao && 
              currentItem.airporticao.trim() !== '' && 
              currentItem.airporticao.trim().toUpperCase() !== icao) {
            break
          }
          
          // 检查是否有修改
          if (currentItem.Is_Modified === 'Y') {
            hasModified = true
          }
        }
        
        // 更新机场的修改状态
        if (hasModified) {
          const airport = airportMap.get(icao)!
          airport.Is_Modified = 'Y'
        }
      }
    })
    
    // 转换为数组并排序
    return Array.from(airportMap.values()).sort((a, b) => 
      a.airporticao.localeCompare(b.airporticao)
    )
    
  } catch (error) {
    console.error('Failed to get airports list:', error)
    throw new Error('无法获取机场列表')
  }
}

/**
 * 根据ICAO代码获取机场的全部航图列表（严格按照数据结构解析）
 * @param icao 机场ICAO代码
 * @returns Promise<OfficialAD[]> 该机场的所有相关数据
 */
export const getAirportChartsByICAO = async (icao: string): Promise<OfficialAD[]> => {
  try {
    if (!icao || typeof icao !== 'string') {
      throw new Error('ICAO代码无效')
    }
    
    const upperICAO = icao.toUpperCase()
    const allADData = await readADData()
    const airportCharts: OfficialAD[] = []
    
    // 找到机场起始位置：第一个 airporticao 等于目标 ICAO 的位置
    let startIndex = -1
    for (let i = 0; i < allADData.length; i++) {
      if (allADData[i].airporticao === upperICAO) {
        startIndex = i
        break
      }
    }
    
    if (startIndex === -1) {
      return [] // 未找到该机场
    }
    
    // 从起始位置开始收集数据
    // 第一个位置是 AD 信息（airporticao 有值）
    // 后续位置的 airporticao 都应该是 null，直到遇到下一个机场
    for (let i = startIndex; i < allADData.length; i++) {
      const currentItem = allADData[i]
      
      // 如果不是起始位置，且遇到了新的 airporticao（不为空且不是当前机场），停止收集
      if (i > startIndex && 
          currentItem.airporticao && 
          currentItem.airporticao.trim() !== '' && 
          currentItem.airporticao.trim() !== upperICAO) {
        break
      }
      
      airportCharts.push(currentItem)
    }
    
    return airportCharts
    
  } catch (error) {
    console.error(`Failed to get charts for airport ${icao}:`, error)
    throw new Error(`无法获取机场 ${icao} 的航图列表`)
  }
}

/**
 * 根据ICAO获取按类别整理的航图
 * @param icao 机场ICAO代码
 * @returns Promise<CategorizedCharts> 按类别整理的航图
 */
export const getCategorizedChartsByICAO = async (icao: string): Promise<CategorizedCharts> => {
  try {
    const allCharts = await getAirportChartsByICAO(icao)
    const upperICAO = icao.toUpperCase()
    
    const categorized: CategorizedCharts = {
      ad: null,
      airport: [],
      dep: [],
      arr: [],
      app: []
    }
    
    for (let i = 0; i < allCharts.length; i++) {
      const chart = allCharts[i]
      
      if (i === 0) {
        // 第一个项目是 AD 信息
        categorized.ad = chart
      } else {
        // 后续项目需要过滤和分类
        
        // 过滤掉不需要的数据
        // 1. 跳过 name 以 "AD " 开头的数据
        if (chart.name && chart.name.startsWith('AD ')) {
          continue
        }
        
        // 2. 跳过 name 不以 ICAO- 开头的数据
        if (chart.name && !chart.name.startsWith(`${upperICAO}-`)) {
          continue
        }
        
        // 3. 对剩余数据进行分类
        if (chart.name && chart.name.includes(':')) {
          const chartType = parseChartType(chart.name)
          categorized[chartType].push(chart)
        } else {
          // 其他符合条件的归入机场图
          categorized.airport.push(chart)
        }
      }
    }
    
    return categorized
    
  } catch (error) {
    console.error(`Failed to get categorized charts for airport ${icao}:`, error)
    throw new Error(`无法获取机场 ${icao} 的分类航图`)
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
    // 只计算真正的航图，不包括AD信息
    return charts.filter(chart => 
      !chart.airporticao || chart.airporticao !== icao.toUpperCase()
    ).length
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
    return charts.some(chart => chart.Is_Modified === 'Y')
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