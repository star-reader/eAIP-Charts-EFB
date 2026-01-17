<template>
    <div class="home-view">
        <div class="welcome-container">
            <div class="welcome-content">
                <h1 class="app-title">eAIP Charts EFB</h1>
                
                <div class="guide-section">
                    <div class="guide-icon">
                        <Icon size="48">
                            <ArrowBackOutline />
                        </Icon>
                    </div>
                    <p class="guide-text">请从左侧导航栏选择航图类型</p>
                </div>

                <div class="chart-types">
                    <div class="chart-type-item">
                        <Icon size="24">
                            <AirplaneOutline />
                        </Icon>
                        <span>机场 (AD)</span>
                    </div>
                    <div class="chart-type-item">
                        <Icon size="24">
                            <NavigateOutline />
                        </Icon>
                        <span>航路 (ENR)</span>
                    </div>
                    <div class="chart-type-item">
                        <Icon size="24">
                            <DocumentTextOutline />
                        </Icon>
                        <span>补充 (SUP)</span>
                    </div>
                    <div class="chart-type-item">
                        <Icon size="24">
                            <AlertCircleOutline />
                        </Icon>
                        <span>通告 (NOTAM)</span>
                    </div>
                    <div class="chart-type-item">
                        <Icon size="24">
                            <InformationCircleOutline />
                        </Icon>
                        <span>情报 (AIC)</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { ref, onMounted } from 'vue'
import { Icon } from '@vicons/utils'
import {
    ArrowBackOutline,
    AirplaneOutline,
    NavigateOutline,
    DocumentTextOutline,
    AlertCircleOutline,
    InformationCircleOutline
} from '@vicons/ionicons5'
import { getLocalVersion } from '@/services/dataDownload/dataUpdateService'

const localVersion = ref<AIPVersion | null>(null)

onMounted(() => {
    localVersion.value = getLocalVersion()
})
</script>

<style lang='scss' scoped>
.home-view {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100% - var(--safe-area-inset-top) - var(--header-height));
    padding: var(--spacing-xl);
    background: var(--content-bg);
}

.welcome-container {
    max-width: 600px;
    width: 100%;
}

.welcome-content {
    text-align: center;
    
    .app-title {
        font-size: var(--font-size-2xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-sm);
    }
    
    .app-description {
        font-size: var(--font-size-md);
        color: var(--text-secondary);
        margin: 0 0 var(--spacing-xl);
    }
}

.guide-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    margin: var(--spacing-xl) 0;
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    
    .guide-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-blue);
    }
    
    .guide-text {
        font-size: var(--font-size-md);
        color: var(--text-primary);
        margin: 0;
        font-weight: 500;
    }
}

.chart-types {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--spacing-md);
    margin: var(--spacing-xl) 0;
    
    .chart-type-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-lg);
        background: var(--secondary-bg);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        transition: all 0.2s ease;
        
        &:hover {
            border-color: var(--primary-blue);
            color: var(--primary-blue);
            transform: translateY(-2px);
        }
        
        span {
            font-size: var(--font-size-sm);
            font-weight: 500;
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .home-view {
        padding: var(--spacing-lg);
    }
    
    .welcome-content {
        .app-title {
            font-size: var(--font-size-xl);
        }
        
        .app-description {
            font-size: var(--font-size-sm);
        }
    }
    
    .guide-section {
        flex-direction: column;
        gap: var(--spacing-sm);
        
        .guide-text {
            font-size: var(--font-size-md);
        }
    }
    
    .chart-types {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
        
        .chart-type-item {
            padding: var(--spacing-md);
        }
    }
}

@media (max-width: 480px) {
    .home-view {
        padding: var(--spacing-md);
    }
    
    .chart-types {
        grid-template-columns: 1fr;
    }
}
</style>