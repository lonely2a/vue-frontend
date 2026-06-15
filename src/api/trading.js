import request from '@/utils/request'

/**
 * 执行交易订单
 */
export function placeOrder(data) {
  return request({
    url: '/trade/place-order',
    method: 'post',
    data,
  })
}

/**
 * 平仓
 */
export function closePosition(ticket) {
  return request({
    url: '/trade/close-position',
    method: 'post',
    data: { ticket },
  })
}

/**
 * 手动触发移动止损检查
 */
export function checkTrailingStop(enableTrailingStop = true) {
  return request({
    url: '/trade/trailing-stop/check',
    method: 'post',
    params: {
      enable_trailing_stop: enableTrailingStop,
    },
  })
}

/**
 * 一键平仓所有可平仓的持仓
 */
export function closeAllPositions() {
  return request({
    url: '/trade/close-all',
    method: 'post',
  })
}
