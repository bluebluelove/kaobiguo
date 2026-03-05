import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';

import App from './App.vue';
import router from './router';
import './styles/main.scss';

const app = createApp(App);  
const pinia = createPinia();

app.config.errorHandler = (err, vm, info) => {
  console.error('[Global error]', err, info);
  // TODO: 上报服务端或展示用户友好提示
};

app.use(pinia);
app.use(router);
app.use(ElementPlus, { locale: zhCn });
app.mount('#app');
