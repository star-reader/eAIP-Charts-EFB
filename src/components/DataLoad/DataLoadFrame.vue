<template>
  <div class="data-load-mask">
    <div class="data-load-container">
      <div class="content">
        <h2 class="title">数据更新</h2>
        
        <div class="status-info">
          <p class="description">
            {{ statusMessage }}
          </p>
          
          <div class="version-info" v-if="localVersion">
            <span class="label">当前版本:</span>
            <span class="version">{{ localVersion.name }} - {{ localVersion.cycle }}</span>
          </div>
        </div>
        
        <div class="loading-section">
          <n-spin size="medium" />
          <p class="loading-text">{{ loadingText }}</p>
          
          <div class="progress-bar" v-if="totalSteps > 0">
            <div class="progress-fill" :style="{ width: `${(progress / totalSteps) * 100}%` }"></div>
          </div>
          
          <p class="progress-text" v-if="totalSteps > 0">
            {{ progress }} / {{ totalSteps }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { computed, onMounted, ref } from 'vue'
import { NSpin } from 'naive-ui'
import pubsub from 'pubsub-js'
import { downloadAndUpdateAllData, type ProgressCallback } from '@/services/dataDownload/dataUpdateService'

interface Props {
  localVersion?: AIPVersion | null
}

const props = withDefaults(defineProps<Props>(), {
  localVersion: null
})

const loadingText = ref('正在检查数据版本...')
const isDownloading = ref(false)
const progress = ref(0)
const totalSteps = ref(7)

// 计算状态信息
const statusMessage = computed(() => {
  if (!props.localVersion) {
    return '检测到您是首次使用，需要下载航图数据'
  } else {
    return '检测到数据更新，正在为您更新到最新版本'
  }
})

// 进度回调函数
const onProgress: ProgressCallback = (step: string, current: number, total: number) => {
  loadingText.value = step
  progress.value = current
  totalSteps.value = total
}

// 执行数据下载
const startDownload = async () => {
  if (isDownloading.value) return
  
  isDownloading.value = true
  
  try {
    await downloadAndUpdateAllData(onProgress)
    
    // 下载完成
    loadingText.value = '数据更新完成！'
    
    // 短暂延迟后通知父组件
    setTimeout(() => {
      pubsub.publish('data-load-completed')
    }, 1000)
    
  } catch (error) {
    console.error('Data download failed:', error)
    loadingText.value = '数据更新失败，请重试'
    
    setTimeout(() => {
        pubsub.publish('data-load-error', error as Error)
    }, 1000)
  } finally {
    isDownloading.value = false
  }
}

onMounted(() => {
  // 组件挂载后立即开始下载
  setTimeout(() => {
    startDownload()
  }, 500) // 短暂延迟让用户看到初始界面
})
</script>

<style lang='scss' scoped>
.data-load-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-lg);

  .data-load-container {
    background: var(--nav-bg);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    max-width: 360px;
    // width: 100%;
    box-shadow: var(--shadow-heavy);
    border: 1px solid var(--nav-border-color);

    .content {
      text-align: center;

      .title {
        font-size: 24px;
        font-weight: 600;
        color: var(--nav-text);
        margin: 0 0 var(--spacing-lg) 0;
        letter-spacing: 0.5px;
      }

      .status-info {
        margin-bottom: var(--spacing-xl);

        .description {
          font-size: 16px;
          color: var(--nav-text-secondary);
          line-height: 1.5;
          margin: 0 0 var(--spacing-md) 0;
        }

        .version-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--nav-hover-bg);
          border-radius: var(--radius-md);
          border: 1px solid var(--nav-border-color);

          .label {
            font-size: 14px;
            color: var(--nav-text-secondary);
            font-weight: 500;
          }

          .version {
            font-size: 14px;
            color: var(--nav-text);
            font-weight: 600;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          }
        }
      }

      .loading-section {
        margin-bottom: var(--spacing-xl);

        .loading-text {
          font-size: 15px;
          color: var(--nav-text-secondary);
          margin: var(--spacing-md) 0 0 0;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: var(--nav-hover-bg);
          border-radius: 2px;
          margin: var(--spacing-md) 0 var(--spacing-sm) 0;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: var(--nav-accent);
            border-radius: 2px;
            transition: width 0.3s ease;
          }
        }

        .progress-text {
          font-size: 12px;
          color: var(--nav-text-secondary);
          margin: 0;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        }
      }

      .progress-hint {
        p {
          font-size: 13px;
          color: var(--nav-text-secondary);
          margin: 0;
          opacity: 0.8;
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .data-load-mask {
    padding: var(--spacing-md);

    .data-load-container {
      padding: var(--spacing-lg);
      max-width: 100%;

      .content {
        .title {
          font-size: 20px;
        }

        .status-info {
          .description {
            font-size: 15px;
          }

          .version-info {
            flex-direction: column;
            gap: var(--spacing-xs);
            text-align: center;

            .label, .version {
              font-size: 13px;
            }
          }
        }

        .loading-section {
          .loading-text {
            font-size: 14px;
          }
        }

        .progress-hint p {
          font-size: 12px;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .data-load-mask {
    padding: var(--spacing-sm);

    .data-load-container {
      padding: var(--spacing-md);

      .content {
        .title {
          font-size: 18px;
          margin-bottom: var(--spacing-md);
        }

        .status-info {
          margin-bottom: var(--spacing-lg);

          .description {
            font-size: 14px;
          }
        }

        .loading-section {
          margin-bottom: var(--spacing-lg);
        }
      }
    }
  }
}
</style>