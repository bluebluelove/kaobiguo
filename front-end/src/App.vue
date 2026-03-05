<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
</script>

<style>
/* 移动端用 100dvh 避免地址栏收起时整页「漂」动 */
#app {
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
