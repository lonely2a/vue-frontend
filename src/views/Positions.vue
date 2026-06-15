<template>
  <div class="positions-container">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="持仓列表" left-arrow @click-left="$router.back()" />

    <!-- 下拉刷新 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 统计信息 -->
      <van-cell-group inset class="stats-card">
        <div class="stats-row">
          <div class="stat-item">
            <span class="label">总持仓</span>
            <span class="value">{{ positions.length }}</span>
          </div>
          <div class="stat-item">
            <span class="label">总盈亏</span>
            <span class="value" :class="totalProfit >= 0 ? 'profit' : 'loss'">
              {{ totalProfit >= 0 ? '+' : '-' }}${{ Math.abs(totalProfit).toFixed(2) }}
            </span>
          </div>
        </div>
      </van-cell-group>

      <!-- 持仓列表 -->
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group inset>
          <van-swipe-cell
            v-for="position in positions"
            :key="position.ticket"
            right-width="80"
          >
            <van-card
              :title="position.symbol"
              :desc="getPositionDesc(position)"
              :thumb="getSymbolIcon(position.symbol)"
              class="position-card"
              @click="showPositionDetail(position)"
            >
              <template #price>
                <div class="profit-display" :class="position.profit >= 0 ? 'profit' : 'loss'">
                  <van-icon :name="position.profit >= 0 ? 'arrow-up' : 'arrow-down'" />
                  {{ position.profit >= 0 ? '+' : '-' }}${{ Math.abs(position.profit).toFixed(2) }}
                </div>
              </template>

              <template #footer>
                <div class="position-info">
                  <div class="info-row">
                    <span class="label">Ticket:</span>
                    <span class="value">#{{ position.ticket }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">类型:</span>
                    <span class="value" :class="position.type.toUpperCase() === 'BUY' ? 'buy' : 'sell'">
                      {{ position.type.toUpperCase() === 'BUY' ? '买入' : '卖出' }}
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="label">开仓价:</span>
                    <span class="value">{{ position.price_open.toFixed(5) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">当前价:</span>
                    <span class="value">{{ position.price_current?.toFixed(5) || '-' }}</span>
                  </div>
                </div>
              </template>
            </van-card>

            <template #right>
              <van-button
                square
                type="danger"
                text="平仓"
                style="height: 100%"
                @click="closePosition(position)"
              />
            </template>
          </van-swipe-cell>
        </van-cell-group>

        <!-- 空状态 -->
        <van-empty
          v-if="!loading && positions.length === 0"
          image="search"
          description="暂无持仓"
        >
          <van-button round type="primary" @click="$router.push('/trade')">
            去交易
          </van-button>
        </van-empty>
      </van-list>
    </van-pull-refresh>

    <!-- 持仓详情弹窗 -->
    <van-action-sheet
      v-model:show="showDetail"
      :title="selectedPosition?.symbol || '持仓详情'"
    >
      <div v-if="selectedPosition" class="detail-content">
        <van-cell-group inset>
          <van-cell title="票号" :value="`#${selectedPosition.ticket}`" />
          <van-cell title="品种" :value="selectedPosition.symbol" />
          <van-cell title="类型">
            <template #default>
              <van-tag :type="selectedPosition.type.toUpperCase() === 'BUY' ? 'success' : 'danger'">
                {{ selectedPosition.type.toUpperCase() === 'BUY' ? '买入' : '卖出' }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="手数" :value="selectedPosition.volume.toFixed(2)" />
          <van-cell title="开仓价" :value="selectedPosition.price_open.toFixed(5)" />
          <van-cell title="当前价" :value="selectedPosition.price_current?.toFixed(5) || '-'" />
          <van-cell title="盈亏">
            <template #default>
              <span :class="selectedPosition.profit >= 0 ? 'profit-text' : 'loss-text'">
                {{ selectedPosition.profit >= 0 ? '+' : '-' }}${{ Math.abs(selectedPosition.profit).toFixed(2) }}
              </span>
            </template>
          </van-cell>
          <van-cell title="开仓时间" :value="formatTime(selectedPosition.time)" />
        </van-cell-group>

        <div class="detail-actions">
          <van-button block type="danger" @click="closePositionFromDetail">
            平仓
          </van-button>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getPositions } from '@/api/account'
import { closePosition as apiClosePosition } from '@/api/trading'
import { showToast, showConfirmDialog } from 'vant'

const userStore = useUserStore()

// 状态
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const positions = ref([])
const showDetail = ref(false)
const selectedPosition = ref(null)

// 计算总盈亏
const totalProfit = computed(() => {
  return positions.value.reduce((sum, pos) => sum + pos.profit, 0)
})

// 获取持仓列表
const fetchPositions = async () => {
  try {
    const response = await getPositions(userStore.mt5Login)
    if (response && response.positions) {
      positions.value = response.positions
      finished.value = true
    }
  } catch (error) {
    console.error('Fetch Positions Error:', error)
    showToast({
      type: 'fail',
      message: '加载持仓失败',
    })
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  finished.value = false
  await fetchPositions()
  refreshing.value = false
  showToast('刷新成功')
}

// 加载更多
const onLoad = () => {
  finished.value = true
}

// 获取持仓描述
const getPositionDesc = (position) => {
  return `手数: ${position.volume.toFixed(2)} | ${position.type.toUpperCase() === 'BUY' ? '买入' : '卖出'}`
}

// 获取品种图标
const getSymbolIcon = (symbol) => {
  if (symbol.includes('BTC')) return 'https://img.yzcdn.cn/FiJDqK_8LbJvZLl7wF3xP3yXVH8_'
  if (symbol.includes('ETH')) return 'https://img.yzcdn.cn/FnYqK_8LbJvZLl7wF3xP3yXVH8_'
  if (symbol.includes('XAU')) return 'https://img.yzcdn.cn/FmYqK_8LbJvZLl7wF3xP3yXVH8_'
  return 'https://img.yzcdn.cn/FpYqK_8LbJvZLl7wF3xP3yXVH8_'
}

// 显示持仓详情
const showPositionDetail = (position) => {
  selectedPosition.value = position
  showDetail.value = true
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
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
      showDetail.value = false
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

// 从详情页平仓
const closePositionFromDetail = () => {
  if (selectedPosition.value) {
    closePosition(selectedPosition.value)
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await fetchPositions()
})
</script>

<style scoped lang="scss">
.positions-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

.stats-card {
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .stats-row {
    display: flex;
    justify-content: space-around;
    padding: 16px;

    .stat-item {
      text-align: center;

      .label {
        display: block;
        font-size: 14px;
        color: #999;
        margin-bottom: 8px;
      }

      .value {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: #333;

        &.profit {
          color: #4caf50;
        }

        &.loss {
          color: #f44336;
        }
      }
    }
  }
}

.position-card {
  margin-bottom: 8px;

  .profit-display {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 18px;
    font-weight: bold;

    &.profit {
      color: #4caf50;
    }

    &.loss {
      color: #f44336;
    }
  }

  .position-info {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #eee;

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-size: 13px;
        color: #999;
      }

      .value {
        font-size: 14px;
        color: #333;
        font-weight: 500;

        &.buy {
          color: #4caf50;
        }

        &.sell {
          color: #f44336;
        }
      }
    }
  }
}

.detail-content {
  padding: 16px;

  .profit-text {
    color: #4caf50;
    font-weight: bold;
  }

  .loss-text {
    color: #f44336;
    font-weight: bold;
  }

  .detail-actions {
    margin-top: 16px;
  }
}
</style>
