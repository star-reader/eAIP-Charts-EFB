/**
 * IndexedDB 存储服务
 * 用于本地存储 AIP 数据，支持离线访问
 */

const DB_NAME = 'AIP_Database'
const DB_VERSION = 2  // 更新版本号以触发数据库重新创建

// 数据表名称
const STORES = {
  AD: 'ad',           // 机场数据
  ENR: 'enr',         // 航路数据  
  AMDT: 'amdt',       // 修订数据
  SUP: 'sup',         // 补充数据
  NOTAM: 'notam',     // 航行通告
  AIC: 'aic'          // 航空情报通告
} as const

/**
 * 初始化 IndexedDB 数据库
 * 创建所需的对象存储空间
 */
const initDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // 创建 AD (机场) 表 - 使用数组索引作为主键保持原始顺序
      if (!db.objectStoreNames.contains(STORES.AD)) {
        const adStore = db.createObjectStore(STORES.AD, { keyPath: '_index' })
        adStore.createIndex('airporticao', 'airporticao', { unique: false })
        adStore.createIndex('pId', 'pId', { unique: false })
        adStore.createIndex('id', 'id', { unique: false })
      }

      // 创建 ENR (航路) 表 - 使用数组索引作为主键保持原始顺序
      if (!db.objectStoreNames.contains(STORES.ENR)) {
        const enrStore = db.createObjectStore(STORES.ENR, { keyPath: '_index' })
        enrStore.createIndex('airporticao', 'airporticao', { unique: false })
        enrStore.createIndex('pId', 'pId', { unique: false })
        enrStore.createIndex('id', 'id', { unique: false })
      }

      // 创建 AMDT (修订) 表 - 使用数组索引作为主键保持原始顺序
      if (!db.objectStoreNames.contains(STORES.AMDT)) {
        const amdtStore = db.createObjectStore(STORES.AMDT, { keyPath: '_index' })
        amdtStore.createIndex('airporticao', 'airporticao', { unique: false })
        amdtStore.createIndex('pId', 'pId', { unique: false })
        amdtStore.createIndex('id', 'id', { unique: false })
      }

      // 创建 SUP (补充) 表 - 使用数组索引作为主键保持原始顺序
      if (!db.objectStoreNames.contains(STORES.SUP)) {
        const supStore = db.createObjectStore(STORES.SUP, { keyPath: '_index' })
        supStore.createIndex('CHAPTER_TYPE', 'CHAPTER_TYPE', { unique: false })
        supStore.createIndex('Serial', 'Serial', { unique: false })
        supStore.createIndex('Id', 'Id', { unique: false })
      }

      // 创建 NOTAM (航行通告) 表 - 使用数组索引作为主键保持原始顺序
      if (!db.objectStoreNames.contains(STORES.NOTAM)) {
        const notamStore = db.createObjectStore(STORES.NOTAM, { keyPath: '_index' })
        notamStore.createIndex('SeriesName', 'SeriesName', { unique: false })
        notamStore.createIndex('Document', 'Document', { unique: false })
      }

      // 创建 AIC (航空情报通告) 表 - 使用数组索引作为主键保持原始顺序
      if (!db.objectStoreNames.contains(STORES.AIC)) {
        const aicStore = db.createObjectStore(STORES.AIC, { keyPath: '_index' })
        aicStore.createIndex('CHAPTER_TYPE', 'CHAPTER_TYPE', { unique: false })
        aicStore.createIndex('Serial', 'Serial', { unique: false })
        aicStore.createIndex('Id', 'Id', { unique: false })
      }
    }
  })
}

/**
 * 通用的数据读取方法 - 按照原始数组顺序返回
 */
const readData = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => {
      // 按照 _index 排序以保持原始数组顺序
      const results = request.result.sort((a: any, b: any) => a._index - b._index)
      // 移除临时添加的 _index 字段
      const cleanResults = results.map((item: any) => {
        const { _index, ...cleanItem } = item
        return cleanItem as T
      })
      resolve(cleanResults)
    }

    request.onerror = () => {
      reject(new Error(`Failed to read data from ${storeName}`))
    }
  })
}

/**
 * 通用的数据写入方法
 */
const writeData = async <T>(storeName: string, data: T[]): Promise<void> => {
  const db = await initDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    // 清空现有数据
    const clearRequest = store.clear()
    
    clearRequest.onsuccess = () => {
      // 批量添加新数据，添加数组索引以保持原始顺序
      let completed = 0
      const total = data.length

      if (total === 0) {
        resolve()
        return
      }

      data.forEach((item, index) => {
        // 为每个数据项添加数组索引
        const itemWithIndex = { ...item, _index: index }
        const addRequest = store.add(itemWithIndex)
        
        addRequest.onsuccess = () => {
          completed++
          if (completed === total) {
            resolve()
          }
        }

        addRequest.onerror = () => {
          reject(new Error(`Failed to write data to ${storeName}`))
        }
      })
    }

    clearRequest.onerror = () => {
      reject(new Error(`Failed to clear ${storeName} store`))
    }
  })
}

// =============== AD (机场) 数据操作 ===============

/**
 * 读取机场数据
 */
export const readADData = async (): Promise<OfficialAD[]> => {
  return readData<OfficialAD>(STORES.AD)
}

/**
 * 写入机场数据
 */
export const writeADData = async (data: OfficialAD[]): Promise<void> => {
  return writeData(STORES.AD, data)
}

// =============== ENR (航路) 数据操作 ===============

/**
 * 读取航路数据
 */
export const readENRData = async (): Promise<OfficialENR[]> => {
  return readData<OfficialENR>(STORES.ENR)
}

/**
 * 写入航路数据
 */
export const writeENRData = async (data: OfficialENR[]): Promise<void> => {
  return writeData(STORES.ENR, data)
}

// =============== AMDT (修订) 数据操作 ===============

/**
 * 读取修订数据
 */
export const readAMDTData = async (): Promise<OfficialAMDT[]> => {
  return readData<OfficialAMDT>(STORES.AMDT)
}

/**
 * 写入修订数据
 */
export const writeAMDTData = async (data: OfficialAMDT[]): Promise<void> => {
  return writeData(STORES.AMDT, data)
}

// =============== SUP (补充) 数据操作 ===============

/**
 * 读取补充数据
 */
export const readSUPData = async (): Promise<OfficialSUP[]> => {
  return readData<OfficialSUP>(STORES.SUP)
}

/**
 * 写入补充数据
 */
export const writeSUPData = async (data: OfficialSUP[]): Promise<void> => {
  return writeData(STORES.SUP, data)
}

// =============== NOTAM (航行通告) 数据操作 ===============

/**
 * 读取航行通告数据
 */
export const readNOTAMData = async (): Promise<OfficialNOTAM[]> => {
  return readData<OfficialNOTAM>(STORES.NOTAM)
}

/**
 * 写入航行通告数据
 */
export const writeNOTAMData = async (data: OfficialNOTAM[]): Promise<void> => {
  return writeData(STORES.NOTAM, data)
}

// =============== AIC (航空情报通告) 数据操作 ===============

/**
 * 读取航空情报通告数据
 */
export const readAICData = async (): Promise<OfficialAIC[]> => {
  return readData<OfficialAIC>(STORES.AIC)
}

/**
 * 写入航空情报通告数据
 */
export const writeAICData = async (data: OfficialAIC[]): Promise<void> => {
  return writeData(STORES.AIC, data)
}

// =============== 数据库管理 ===============

/**
 * 检查数据库是否存在
 */
export const checkDatabaseExists = async (): Promise<boolean> => {
  try {
    const db = await initDatabase()
    db.close()
    return true
  } catch (error) {
    console.error('Database check failed:', error)
    return false
  }
}

/**
 * 清空所有数据（用于数据重置时）
 */
export const clearAllData = async (): Promise<void> => {
  const db = await initDatabase()
  
  return new Promise((resolve, reject) => {
    const storeNames = [STORES.AD, STORES.ENR, STORES.AMDT, STORES.SUP, STORES.NOTAM, STORES.AIC]
    const transaction = db.transaction(storeNames, 'readwrite')
    
    let completed = 0
    const total = storeNames.length

    storeNames.forEach(storeName => {
      const store = transaction.objectStore(storeName)
      const clearRequest = store.clear()

      clearRequest.onsuccess = () => {
        completed++
        if (completed === total) {
          resolve()
        }
      }

      clearRequest.onerror = () => {
        reject(new Error(`Failed to clear ${storeName} store`))
      }
    })
  })
}

/**
 * 初始化数据库（应用启动时调用）
 */
export const initAIPDatabase = async (): Promise<void> => {
  try {
    const db = await initDatabase()
    console.log('AIP Database initialized successfully')
    db.close()
  } catch (error) {
    console.error('Failed to initialize AIP Database:', error)
    throw error
  }
}
