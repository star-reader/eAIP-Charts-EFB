<template>
  <NConfigProvider :theme="naiveTheme">
    <NDialogProvider>
      <AppLayoutContent />
    </NDialogProvider>
  </NConfigProvider>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue'
import { NDialogProvider, NConfigProvider, darkTheme } from 'naive-ui'
import pubsub from 'pubsub-js'
import AppLayoutContent from './AppLayoutContent.vue'

const isDarkTheme = ref(localStorage.getItem('theme') === 'night')
const naiveTheme = computed(() => isDarkTheme.value ? darkTheme : null)

onMounted(() => {
  // 监听主题变化
  pubsub.subscribe('theme-changed', (_, theme: string) => {
    isDarkTheme.value = theme === 'night'
  })
})
</script>