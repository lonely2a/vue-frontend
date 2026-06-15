import request from '@/utils/request'

/**
 * 获取账户信息
 */
export function getAccountInfo(login) {
  return request({
    url: '/account/info',
    method: 'get',
    params: { login },
  })
}

/**
 * 获取持仓列表
 */
export function getPositions(login) {
  return request({
    url: '/account/positions',
    method: 'get',
    params: { login },
  })
}

/**
 * 获取交易历史
 */
export function getHistory(login, startDate, endDate) {
  return request({
    url: '/account/history',
    method: 'get',
    params: {
      login,
      start_date: startDate,
      end_date: endDate,
    },
  })
}
