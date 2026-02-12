import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@/styles/common.scss'
import { lazyPlugin } from '@/directives'
import { componentsPlugin } from '@/components/index'
//引入持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
const app = createApp(App)
pinia.use(piniaPluginPersistedstate)
app.use(router)
//懒加载
app.use(lazyPlugin)
app.mount('#app')
//渲染图片和sku组件
app.use(componentsPlugin)
//本地存储
app.use(pinia)
