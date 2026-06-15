<template>
  <div class="home-container">
    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 账户信息卡片 - 蓝色渐变背景 -->
      <div class="account-card">
        <div class="card-header">
          <span class="card-title">账户余额</span>
          <van-icon name="more-o" size="20" color="#fff" />
        </div>
        
        <div class="balance-info">
          <div class="balance-main">
            <span class="currency">$</span>
            <span class="amount">{{ accountInfo.balance?.toFixed(2) || '1,019.04' }}</span>
            <span class="currency-type">USD</span>
          </div>
          <div class="equity">
            {{ accountInfo.equity?.toFixed(2) || '1,019.04' }} USD
          </div>
        </div>
      </div>

      <!-- 快捷操作按钮 -->
      <div class="quick-actions">
        <div class="action-item" @click="handleSwitchAccount">
          <div class="action-icon deposit">
            <van-icon name="user-switch-o" size="24" />
          </div>
          <span class="action-text">切换账户</span>
        </div>
        <div class="action-item">
          <div class="action-icon withdraw">
            <van-icon name="gold-coin-o" size="24" />
          </div>
          <span class="action-text">取出</span>
        </div>
        <div class="action-item">
          <div class="action-icon transfer">
            <van-icon name="transfer" size="24" />
          </div>
          <span class="action-text">转入</span>
        </div>
        <div class="action-item" @click="handleCloseAll">
          <div class="action-icon close-all">
            <van-icon name="close-all" size="24" />
          </div>
          <span class="action-text">一键平仓</span>
        </div>
      </div>

      <!-- 持仓列表标题 -->
      <div class="positions-header">
        <h3>持仓列表</h3>
        <span class="view-all" @click="$router.push('/positions')">查看全部 ></span>
      </div>

      <!-- 持仓列表 -->
      <div class="positions-list">
        <div 
          v-for="position in positions" 
          :key="position.ticket"
          class="position-card"
          @click="showPositionDetail(position)"
        >
          <div class="position-header">
            <div class="position-info">
              <span class="symbol">{{ position.symbol }}</span>
              <span class="type-tag" :class="position.type.toUpperCase() === 'BUY' ? 'buy' : 'sell'">
                {{ position.type.toUpperCase() === 'BUY' ? '多' : '空' }}
              </span>
            </div>
            <div class="profit" :class="position.profit >= 0 ? 'profit-positive' : 'profit-negative'">
              {{ position.profit >= 0 ? '+' : '-' }}${{ Math.abs(position.profit).toFixed(2) }}
            </div>
          </div>
          
          <div class="position-details">
            <div class="detail-row">
              <span class="label">手数</span>
              <span class="value">{{ position.volume.toFixed(2) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">开仓价</span>
              <span class="value">{{ position.price_open.toFixed(5) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">当前价</span>
              <span class="value">{{ position.price_current?.toFixed(5) || '-' }}</span>
            </div>
          </div>

          <van-button 
            size="small" 
            type="danger" 
            plain
            class="close-btn"
            @click.stop="closePosition(position)"
          >
            平仓
          </van-button>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && positions.length === 0" class="empty-state">
          <van-empty image="search" description="暂无持仓" />
        </div>
      </div>
    </van-pull-refresh>

    <!-- 新建订单按钮 -->
    <div class="trade-button-container">
      <van-button
        round
        block
        class="trade-button"
        @click="$router.push('/trade')"
      >
        新建订单
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getAccountInfo, getPositions } from '@/api/account'
import { closePosition as apiClosePosition, closeAllPositions } from '@/api/trading'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()

// 状态
const refreshing = ref(false)
const loading = ref(false)
const positions = ref([])
const accountInfo = ref({})

// 获取账户信息
const fetchAccountInfo = async () => {
  // 验证mt5Login是否有效
  if (!userStore.mt5Login) {
    console.warn('MT5 Login未设置，跳过账户信息获取')
    return
  }
  
  try {
    const response = await getAccountInfo(userStore.mt5Login)
    if (response) {
      accountInfo.value = response
    }
  } catch (error) {
    console.error('Fetch Account Info Error:', error)
    
    // 如果是"账户未连接"错误，提示用户重新登录
    if (error.message && error.message.includes('账户未连接')) {
      showToast({
        type: 'fail',
        message: '账户连接已断开，请重新登录',
        duration: 3000,
      })
      
      // 可选：自动跳转到登录页
      // userStore.logout()
      // router.push('/login')
    }
  }
}

// 获取持仓列表
const fetchPositions = async () => {
  // 验证mt5Login是否有效
  if (!userStore.mt5Login) {
    console.warn('MT5 Login未设置，跳过持仓获取')
    positions.value = []
    return
  }
  
  try {
    const response = await getPositions(userStore.mt5Login)
    if (response && response.positions) {
      positions.value = response.positions
    }
  } catch (error) {
    console.error('Fetch Positions Error:', error)
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  await Promise.all([fetchAccountInfo(), fetchPositions()])
  refreshing.value = false
  showToast('刷新成功')
}

// 显示持仓详情
const showPositionDetail = (position) => {
  // TODO: 实现详情页跳转
  console.log('Position detail:', position)
}

// 平仓
const closePosition = async (position) => {
  try {
    await showConfirmDialog({
      title: '确认平仓',
      message: `确定要平掉 ${position.symbol} 的持仓吗？\n盈亏: ${position.profit >= 0 ? '+' : ''}$${Math.abs(position.profit).toFixed(2)}`,
    })

    const response = await apiClosePosition(position.ticket)
    
    // 检查是否被策略阻止
    if (response.blocked_by_strategy) {
      showToast({
        type: 'fail',
        message: response.message || '该订单已启用禁止手动平仓策略',
        duration: 3000,
      })
      return
    }
    
    if (response.success) {
      showToast({
        type: 'success',
        message: '平仓成功',
      })
      
      // 刷新数据
      await onRefresh()
    } else {
      showToast({
        type: 'fail',
        message: response.message || '平仓失败',
      })
    }
  } catch (error) {
    if (error !== 'cancel') {
      showToast({
        type: 'fail',
        message: error.message || '平仓失败',
      })
    }
  }
}

// 一键平仓
const handleCloseAll = async () => {
  try {
    await showConfirmDialog({
      title: '确认一键平仓',
      message: '确定要平掉所有可平仓的持仓吗？\n（已启用禁止手动平仓策略的订单将被跳过）',
    })

    const response = await closeAllPositions()
    
    if (response.success) {
      showToast({
        type: 'success',
        message: response.message || `一键平仓完成: 成功${response.success_count}个, 跳过${response.skipped_by_strategy}个`,
        duration: 3000,
      })
      
      // 刷新数据
      await onRefresh()
    } else {
      showToast({
        type: 'fail',
        message: '一键平仓失败',
      })
    }
  } catch (error) {
    if (error !== 'cancel') {
      showToast({
        type: 'fail',
        message: error.message || '一键平仓失败',
      })
    }
  }
}

// 切换账户
const handleSwitchAccount = async () => {
  try {
    await showConfirmDialog({
      title: '切换账户',
      message: '确定要退出当前账户并切换到其他账户吗？',
      confirmButtonText: '切换账户',
      cancelButtonText: '取消',
    })

    // 执行登出
    await userStore.logout()
    
    showToast({
      type: 'success',
      message: '已退出登录',
    })
    
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      showToast({
        type: 'fail',
        message: error.message || '操作失败',
      })
    }
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await Promise.all([fetchAccountInfo(), fetchPositions()])
})
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.account-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 16px;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .card-title {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .balance-info {
    .balance-main {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 8px;

      .currency {
        font-size: 24px;
        color: rgba(255, 255, 255, 0.9);
      }

      .amount {
        font-size: 40px;
        font-weight: bold;
        color: #fff;
      }

      .currency-type {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .equity {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 20px 16px;
  background: #fff;
  margin: 0 16px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.deposit {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
      }
      
      &.withdraw {
        background: rgba(255, 214, 0, 0.1);
        color: #ffd600;
      }
      
      &.transfer {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }
      
      &.close-all {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }
    }

    .action-text {
      font-size: 12px;
      color: #666;
    }
  }
}

.positions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  margin-bottom: 12px;

  h3 {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin: 0;
  }

  .view-all {
    font-size: 14px;
    color: #667eea;
    cursor: pointer;
  }
}

.positions-list {
  padding: 0 16px;
}

.position-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .position-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .position-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .symbol {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }

      .type-tag {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;

        &.buy {
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
        }

        &.sell {
          background: rgba(244, 67, 54, 0.1);
          color: #f44336;
        }
      }
    }

    .profit {
      font-size: 20px;
      font-weight: bold;

      &.profit-positive {
        color: #4caf50;
      }

      &.profit-negative {
        color: #f44336;
      }
    }
  }

  .position-details {
    display: flex;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;

    .detail-row {
      text-align: center;

      .label {
        display: block;
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }

      .value {
        display: block;
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
    }
  }

  .close-btn {
    margin-top: 12px;
    width: 100%;
  }
}

.empty-state {
  padding: 40px 0;
}

.trade-button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  .trade-button {
    height: 50px;
    font-size: 16px;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
  }
}
</style>
