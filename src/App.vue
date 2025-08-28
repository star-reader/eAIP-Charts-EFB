<template>
  <AppLayout />
  <DataLoadFrame v-if="!isDataLoaded" 
    :localVersion="aipversion" 
    />
</template>

<script lang='ts' setup>
import { onMounted, ref } from 'vue';
import pubsub from 'pubsub-js'
import AppLayout from './layouts/AppLayout.vue';
import { checkDatabaseExists, initAIPDatabase } from './services/storage/transcriptStorage';
import DataLoadFrame from './components/DataLoad/DataLoadFrame.vue';
import { getAIPVersion } from './services/apis/chartsApi';

const isDataLoaded = ref(true) // 先默认为true，等到查找掉没保存本地数据或数据有更新再进行修改
const aipversion = ref<AIPVersion>()

onMounted( () => {
  const theme = localStorage.getItem('theme')
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme)
  }else{
    localStorage.setItem('theme', 'light')
    document.documentElement.setAttribute('data-theme', 'light')
  }
})

onMounted(async () => {

  const checkDataBase = async () => {
    const loadStatus = await checkDatabaseExists()
    if (!loadStatus) {
      await initAIPDatabase()
      isDataLoaded.value = false
    }
  }

  const checkAIPUpdae = async () => {
    const version = await getAIPVersion()
    const localVersion = localStorage.getItem('aipVersion')
    if (!localVersion){
      isDataLoaded.value = false
    }else{
      let parsedJson: AIPVersion = JSON.parse(localVersion)
      aipversion.value = parsedJson
      if (parsedJson.version_id < version.version_id){
        // 更新
        isDataLoaded.value = false
      }
    }
  }

  checkDataBase()
  checkAIPUpdae()  
})

onMounted(() => {
  pubsub.subscribe('data-load-completed', () => {
    isDataLoaded.value = true
  })
  pubsub.subscribe('data-load-error', (msg, error) => {
    console.error('Data update error:', error)
    isDataLoaded.value = true
  })
})

</script>

<style lang='scss' scoped>

</style>