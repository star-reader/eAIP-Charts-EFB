/**
 * 数据更新服务
 * 负责下载和存储AIP数据
 */

import { 
  getAIPVersion, 
  getOfficialAD, 
  getOfficialENR, 
  getOfficialAMDT, 
  getOfficialSUP, 
  getOfficialNOTAM, 
  getOfficialAIC 
} from '@/services/apis/chartsApi'

import {
  writeADData,
  writeENRData,
  writeAMDTData,
  writeSUPData,
  writeNOTAMData,
  writeAICData,
  clearAllData,
  initAIPDatabase
} from '@/services/storage/transcriptStorage'

// 下载进度回调类型
export type ProgressCallback = (step: string, progress: number, total: number) => void

/**
 * 检查版本信息
 */
export const checkVersion = async (): Promise<AIPVersion> => {
  try {
    return await getAIPVersion()
  } catch (error) {
    console.error('Failed to check version:', error)
    throw new Error('无法获取版本信息')
  }
}

/**
 * 获取本地存储的版本信息
 */
export const getLocalVersion = (): AIPVersion | null => {
  try {
    const versionStr = localStorage.getItem('aipVersion')
    if (versionStr) {
      return JSON.parse(versionStr) as AIPVersion
    }
    return null
  } catch (error) {
    console.error('Failed to get local version:', error)
    return null
  }
}

/**
 * 保存版本信息到localStorage
 */
export const saveVersionToLocal = (version: AIPVersion): void => {
  try {
    localStorage.setItem('aipVersion', JSON.stringify(version))
  } catch (error) {
    console.error('Failed to save version to localStorage:', error)
    throw new Error('无法保存版本信息')
  }
}

/**
 * 检查是否需要更新数据
 */
export const checkNeedUpdate = async (): Promise<{ needUpdate: boolean, localVersion: AIPVersion | null, remoteVersion: AIPVersion }> => {
  const remoteVersion = await checkVersion()
  const localVersion = getLocalVersion()
  
  // 如果没有本地版本或版本ID不同，则需要更新
  const needUpdate = !localVersion || localVersion.version_id !== remoteVersion.version_id
  
  return {
    needUpdate,
    localVersion,
    remoteVersion
  }
}

/**
 * 下载并更新所有数据
 */
export const downloadAndUpdateAllData = async (
  onProgress?: ProgressCallback
): Promise<void> => {
  try {
    // 初始化数据库
    onProgress?.('正在初始化数据库...', 0, 7)
    await initAIPDatabase()
    
    // 清空现有数据
    onProgress?.('正在清理旧数据...', 1, 7)
    await clearAllData()
    
    // 获取最新版本信息
    onProgress?.('正在获取版本信息...', 2, 7)
    const version = await checkVersion()
    
    // 下载并存储各类数据
    const downloadTasks = [
      {
        name: '机场数据 (AD)',
        fetch: getOfficialAD,
        store: writeADData
      },
      {
        name: '航路数据 (ENR)',
        fetch: getOfficialENR,
        store: writeENRData
      },
      {
        name: '修订数据 (AMDT)',
        fetch: getOfficialAMDT,
        store: writeAMDTData
      },
      {
        name: '补充数据 (SUP)',
        fetch: getOfficialSUP,
        store: writeSUPData
      },
      {
        name: '航行通告 (NOTAM)',
        fetch: getOfficialNOTAM,
        store: writeNOTAMData
      },
      {
        name: '航空情报通告 (AIC)',
        fetch: getOfficialAIC,
        store: writeAICData
      }
    ]
    
    // 串行下载和存储数据
    for (let i = 0; i < downloadTasks.length; i++) {
      const task = downloadTasks[i]
      const stepIndex = 3 + i
      
      try {
        onProgress?.(`正在下载${task.name}...`, stepIndex, 7)
        
        // 下载数据
        const response = await task.fetch()
        let data: any[]
        
        // 处理响应数据
        if (response && typeof response === 'object' && 'data' in response) {
          data = response.data as any
        } else if (Array.isArray(response)) {
          data = response
        } else {
          throw new Error(`Invalid response format for ${task.name}`)
        }
        
        // 存储到IndexedDB
        await task.store(data)
        
        
      } catch (error) {
        console.error(`Failed to download ${task.name}:`, error)
        throw new Error(`下载${task.name}失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }
    
    // 保存版本信息到localStorage
    onProgress?.('正在保存版本信息...', 7, 7)
    saveVersionToLocal(version)
    
  } catch (error) {
    console.error('Data download failed:', error)
    throw error
  }
}

/**
 * 快速检查数据完整性
 */
export const checkDataIntegrity = async (): Promise<boolean> => {
  try {
    // 简单检查：确保所有表都有数据
    const { readADData, readENRData, readAMDTData, readSUPData, readNOTAMData, readAICData } = await import('@/services/storage/transcriptStorage')
    
    const checks = await Promise.allSettled([
      readADData(),
      readENRData(), 
      readAMDTData(),
      readSUPData(),
      readNOTAMData(),
      readAICData()
    ])
    
    // 检查是否所有读取都成功且有数据
    return checks.every(result => 
      result.status === 'fulfilled' && 
      Array.isArray(result.value) && 
      result.value.length > 0
    )
    
  } catch (error) {
    console.error('Data integrity check failed:', error)
    return false
  }
}

/**
 * 强制重新下载所有数据
 */
export const forceRedownloadAllData = async (
  onProgress?: ProgressCallback
): Promise<void> => {
  // 清除本地版本信息，强制重新下载
  localStorage.removeItem('aipVersion')
  return downloadAndUpdateAllData(onProgress)
}
