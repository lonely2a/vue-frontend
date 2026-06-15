import request from '@/utils/request'

/**
 * 获取交易品种列表
 */
export function getSymbols() {
  return request({
    url: '/market/symbols',
    method: 'get',
  })
}

/**
 * 获取实时报价
 */
export function getQuote(symbol) {
  return request({
    url: `/market/quote/${symbol}`,
    method: 'get',
  })
}
