import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin, logout as apiLogout } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const mt5Login = ref(userInfo.value.login || null)

  // Actions
  async function login(loginData) {
    try {
      const response = await apiLogin(loginData)
      
      if (response.success && response.session_token) {
        token.value = response.session_token
        userInfo.value = response.account_info || {}
        mt5Login.value = response.account_info?.login || null
        
        // 保存到localStorage
        localStorage.setItem('token', token.value)
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        
        return { success: true, data: response }
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      console.error('Login Error:', error)
      return { success: false, error: error.message }
    }
  }

  async function logout() {
    try {
      if (mt5Login.value) {
        await apiLogout(mt5Login.value)
      }
    } catch (error) {
      console.error('Logout Error:', error)
    } finally {
      // 清除本地状态
      token.value = ''
      userInfo.value = {}
      mt5Login.value = null
      
      // 清除localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }

  function isLoggedIn() {
    return !!token.value
  }

  return {
    token,
    userInfo,
    mt5Login,
    login,
    logout,
    isLoggedIn,
  }
})
