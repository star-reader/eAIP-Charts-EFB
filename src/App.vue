<template>
  <AppLayout />
</template>

<script lang='ts' setup>
import { onMounted } from 'vue';
import AppLayout from './layouts/AppLayout.vue';

onMounted( () => {
  const theme = localStorage.getItem('theme')
  if (theme) {
    document.documentElement.setAttribute('data-theme', theme)
  }else{
    localStorage.setItem('theme', 'light')
    document.documentElement.setAttribute('data-theme', 'light')
  }
})

</script>

<style lang='scss' scoped>

</style>