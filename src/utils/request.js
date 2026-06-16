import axios from 'axios'
import { showToast } from 'vant'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://localhost:8000/api', // 直接指定后端API地址（包含/api前缀）
  timeout: 30000,
  withCredentials: true, // 允许发送Cookie
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是200，说明接口有错误
    if (response.status !== 200) {
      showToast({
        message: res.detail || '请求失败',
        type: 'fail',
      })
      return Promise.reject(new Error(res.detail || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.error('Response Error:', error)
    
    let message = '网络错误'
    if (error.response) {
      const detail = error.response.data?.detail
      
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 400:
          // 处理策略验证等客户端错误
          if (typeof detail === 'string') {
            message = detail
          } else if (typeof detail === 'object' && detail.message) {
            // EMA策略验证失败时，detail是一个对象
            message = detail.message
          } else {
            message = '请求参数错误'
          }
          break
        default:
          if (typeof detail === 'string') {
            message = detail
          } else if (typeof detail === 'object' && detail.message) {
            message = detail.message
          } else {
            message = '请求失败'
          }
      }
    }
    
    showToast({
      message,
      type: 'fail',
      duration: 3000, // 延长显示时间，方便阅读
    })
    
    return Promise.reject(error)
  }
)

export default service
