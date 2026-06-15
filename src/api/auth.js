import request from '@/utils/request'

/**
 * 登录API
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

/**
 * 登出API
 */
export function logout(login) {
  return request({
    url: '/auth/logout',
    method: 'post',
    params: { login },
  })
}
