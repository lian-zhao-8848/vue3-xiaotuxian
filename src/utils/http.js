import axios from 'axios'
import { useUserStore } from '@/stores/userStore'
// 1. 创建axios实例
const http = axios.create({
  baseURL: 'http://pcapi-xiaotuxian-front-devtest.itheima.net',
  timeout: 5000
})
// 2. axios请求拦截器
http.interceptors.request.use(config => {
  // 1. 从pinia获取token数据
  const userStore = useUserStore()
  // 2. 按照后端的要求拼接token数据
  const token = userStore.userInfo.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, e => Promise.reject(e))

// 3. axios响应拦截器
http.interceptors.response.use(res => {
  // 这里的 res.data 是为了让组件端直接拿到后端返回的业务数据
  return res.data
}, e => {
  return Promise.reject(e)
})

// 4. 导出实例
export default http

