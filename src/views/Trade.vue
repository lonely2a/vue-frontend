<template>
  <div class="trade-container">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="新建订单" left-arrow @click-left="$router.back()" />

    <!-- 交易表单 -->
    <div class="form-container">
      <!-- 交易品种选择器 -->
      <div class="form-group">
        <label class="form-label">交易品种</label>
        <van-field
          v-model="formData.symbol"
          placeholder="请选择交易品种"
          readonly
          is-link
          @click="showSymbolPicker = true"
        />
      </div>

      <!-- 交易方向选择 -->
      <div class="form-group">
        <label class="form-label">交易方向</label>
        <div class="direction-tabs">
          <div 
            :class="['direction-tab', 'buy', { active: formData.type === 'BUY' }]"
            @click="formData.type = 'BUY'"
          >
            做多
          </div>
          <div 
            :class="['direction-tab', 'sell', { active: formData.type === 'SELL' }]"
            @click="formData.type = 'SELL'"
          >
            做空
          </div>
        </div>
      </div>

      <!-- 手数输入 -->
      <div class="form-group">
        <label class="form-label">手数</label>
        <van-field
          v-model="formData.volume"
          placeholder="0.050"
          type="number"
          :rules="[
            { required: true, message: '请输入手数' },
            { validator: validateVolume, message: '手数必须大于0' }
          ]"
        >
          <template #button>
            <div class="stepper-buttons">
              <van-button size="mini" icon="minus" @click="adjustVolume(-0.01)" />
              <van-button size="mini" icon="plus" @click="adjustVolume(0.01)" />
            </div>
          </template>
        </van-field>
      </div>

      <!-- 止损价格 -->
      <div class="form-group">
        <label class="form-label">止损价格 (SL)</label>
        <van-field
          v-model="formData.sl_price"
          placeholder="可选"
          type="number"
        >
          <template #button>
            <div class="stepper-buttons">
              <van-button size="mini" icon="minus" @click="adjustPrice('sl', -1)" />
              <van-button size="mini" icon="plus" @click="adjustPrice('sl', 1)" />
            </div>
          </template>
        </van-field>
      </div>

      <!-- 止盈价格 -->
      <div class="form-group">
        <label class="form-label">止盈价格 (TP)</label>
        <van-field
          v-model="formData.tp_price"
          placeholder="可选"
          type="number"
        >
          <template #button>
            <div class="stepper-buttons">
              <van-button size="mini" icon="minus" @click="adjustPrice('tp', -1)" />
              <van-button size="mini" icon="plus" @click="adjustPrice('tp', 1)" />
            </div>
          </template>
        </van-field>
      </div>

      <!-- EMA策略验证开关 -->
      <div class="form-group switch-group">
        <span class="switch-label">启用EMA60趋势验证</span>
        <van-switch v-model="formData.check_ema_strategy" size="24px" />
      </div>

      <!-- 移动止损开关 -->
      <div class="form-group switch-group">
        <span class="switch-label">启用移动止损策略</span>
        <van-switch v-model="formData.enable_trailing_stop" size="24px" />
      </div>

      <!-- 禁止手动平仓开关 -->
      <div class="form-group switch-group">
        <span class="switch-label">禁止手动平仓策略</span>
        <van-switch v-model="formData.disable_manual_close" size="24px" />
      </div>

      <!-- 提交按钮 -->
      <van-button
        round
        block
        class="submit-btn"
        :class="formData.type === 'BUY' ? 'buy-btn' : 'sell-btn'"
        :loading="loading"
        loading-text="提交中..."
        @click="onSubmit"
      >
        {{ formData.type === 'BUY' ? '买入' : '卖出' }} {{ formData.symbol || 'BTCUSD' }}
      </van-button>
    </div>

    <!-- 品种选择器弹窗 -->
    <van-action-sheet
      v-model:show="showSymbolPicker"
      title="选择交易品种"
      :actions="symbolActions"
      @select="onSymbolSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { placeOrder } from '@/api/trading'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const formData = ref({
  symbol: 'BTCUSD',
  type: 'BUY',
  volume: 0.050,
  sl_price: null,
  tp_price: null,
  check_ema_strategy: true,
  enable_trailing_stop: true,  // 默认开启移动止损
  disable_manual_close: true,  // 默认开启禁止手动平仓
})

// 状态
const loading = ref(false)
const showSymbolPicker = ref(false)

// 常用交易品种列表
const commonSymbols = [
  { name: 'BTCUSD', text: 'BTC/USD - 比特币' },
  { name: 'ETHUSD', text: 'ETH/USD - 以太坊' },
  { name: 'XAUUSD', text: 'XAU/USD - 黄金' },
  { name: 'EURUSD', text: 'EUR/USD - 欧元美元' },
  { name: 'GBPUSD', text: 'GBP/USD - 英镑美元' },
]

// 品种选择器动作
const symbolActions = computed(() => {
  return commonSymbols.map(sym => ({
    name: sym.text,
    value: sym.name,
  }))
})

// 验证手数
const validateVolume = (value) => {
  const num = parseFloat(value)
  return !isNaN(num) && num > 0
}

// 调整手数
const adjustVolume = (delta) => {
  const current = parseFloat(formData.value.volume) || 0
  const newValue = Math.max(0.01, current + delta)
  formData.value.volume = newValue.toFixed(2)
}

// 调整价格
const adjustPrice = (type, direction) => {
  const field = type === 'sl' ? 'sl_price' : 'tp_price'
  const current = parseFloat(formData.value[field]) || 0
  const step = formData.value.symbol.includes('BTC') ? 100 : 0.0001
  formData.value[field] = (current + step * direction).toFixed(
    formData.value.symbol.includes('BTC') ? 0 : 5
  )
}

// 选择品种
const onSymbolSelect = (action) => {
  formData.value.symbol = action.value
  showSymbolPicker.value = false
}

// 提交订单
const onSubmit = async () => {
  // 验证禁止手动平仓策略
  if (formData.value.disable_manual_close) {
    const hasTpPrice = formData.value.tp_price && parseFloat(formData.value.tp_price) > 0
    
    if (!hasTpPrice && !formData.value.enable_trailing_stop) {
      showToast({
        type: 'fail',
        message: '启用禁止手动平仓时，必须设置止盈(TP)或启用移动止损策略',
        duration: 3000,
      })
      return
    }
    /*
    if (!hasTpPrice && formData.value.enable_trailing_stop) {
      // 提示用户将使用移动止损来平仓
      showToast({
        type: 'warning',
        message: '未设置止盈，将依赖移动止损策略自动平仓',
        duration: 2000,
      })
    }*/
  }
  
  try {
    await showConfirmDialog({
      title: '确认订单',
      message: `确定要${formData.value.type === 'BUY' ? '买入' : '卖出'} ${formData.value.symbol} ${formData.value.volume}手吗？`,
    })

    loading.value = true

    // 准备请求数据
    const requestData = {
      symbol: formData.value.symbol,
      type: formData.value.type,
      volume: parseFloat(formData.value.volume),
      comment: 'Vue Frontend Order',
      magic: 12345,
      check_ema_strategy: formData.value.check_ema_strategy,
      ema_period: 60,
      timeframe: 15,
      enable_trailing_stop: formData.value.enable_trailing_stop,
      disable_manual_close: formData.value.disable_manual_close,
    }

    // 添加止损止盈价格（如果填写了）
    if (formData.value.sl_price) {
      requestData.sl_price = parseFloat(formData.value.sl_price)
    }
    if (formData.value.tp_price) {
      requestData.tp_price = parseFloat(formData.value.tp_price)
    }

    // 发送请求
    const response = await placeOrder(requestData)

    if (response.success) {
      showToast({
        type: 'success',
        message: `订单成功！订单ID: ${response.order_id}`,
        duration: 2000,
      })

      // 延迟返回主页
      setTimeout(() => {
        router.push('/home')
      }, 1500)
    } else {
      showToast({
        type: 'fail',
        message: response.message || '开单失败',
      })
    }
  } catch (error) {
    if (error !== 'cancel') {
      // axios拦截器已经显示了详细错误，这里不需要再显示
      console.error('开单异常:', error)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.trade-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}

.form-container {
  padding: 16px;
}

.form-group {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .form-label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 12px;
  }

  :deep(.van-cell) {
    padding: 0;
    
    &::after {
      display: none;
    }
  }

  :deep(.van-field__control) {
    padding: 12px 0;
    font-size: 16px;
  }
}

.direction-tabs {
  display: flex;
  gap: 8px;

  .direction-tab {
    flex: 1;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;

    &.buy {
      background: #f0f9ff;
      color: #0ea5e9;
      border: 2px solid transparent;

      &.active {
        background: #0ea5e9;
        color: #fff;
      }
    }

    &.sell {
      background: #fef2f2;
      color: #ef4444;
      border: 2px solid transparent;

      &.active {
        background: #ef4444;
        color: #fff;
      }
    }
  }
}

.stepper-buttons {
  display: flex;
  gap: 4px;
}

.switch-group {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .switch-label {
    font-size: 14px;
    color: #333;
  }
}

.submit-btn {
  height: 56px;
  font-size: 18px;
  font-weight: bold;
  margin-top: 24px;
  border: none;

  &.buy-btn {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: #fff;
  }

  &.sell-btn {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: #fff;
  }
}
</style>
