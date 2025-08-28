/**
 * 数据下载服务入口
 * 提供应用级别的数据管理功能
 */

export {
  checkVersion,
  getLocalVersion,
  saveVersionToLocal,
  checkNeedUpdate,
  downloadAndUpdateAllData,
  checkDataIntegrity,
  forceRedownloadAllData,
  type ProgressCallback
} from './dataUpdateService'

/**
 * 应用启动时的数据检查和初始化
 */
export const initializeAppData = async (): Promise<{
  needDownload: boolean
  localVersion: AIPVersion | null
  remoteVersion?: AIPVersion
}> => {
  try {
    const { checkNeedUpdate, checkDataIntegrity } = await import('./dataUpdateService')
    
    // 检查版本
    const { needUpdate, localVersion, remoteVersion } = await checkNeedUpdate()
    
    if (needUpdate) {
      return {
        needDownload: true,
        localVersion,
        remoteVersion
      }
    }
    
    // 检查数据完整性
    const hasValidData = await checkDataIntegrity()
    
    if (!hasValidData) {
      return {
        needDownload: true,
        localVersion,
        remoteVersion
      }
    }
    
    return {
      needDownload: false,
      localVersion
    }
    
  } catch (error) {
    console.error('Failed to initialize app data:', error)
    
    // 如果检查失败，假设需要下载
    return {
      needDownload: true,
      localVersion: null
    }
  }
}
