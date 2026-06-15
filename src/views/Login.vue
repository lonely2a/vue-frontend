<template>
  <div class="login-container">
    <!-- 头部标题 -->
    <div class="header">
      <h1 class="title">欢迎回来</h1>
    </div>

    <!-- 登录表单 -->
    <div class="form-container">
      <!-- MT5账号 -->
      <div class="form-group">
        <label class="form-label">登录</label>
        <van-field
          v-model="formData.login"
          placeholder="请输入MT5账号"
          type="number"
          :rules="[{ required: true, message: '请输入MT5账号' }]"
        />
      </div>

      <!-- 服务器 -->
      <div class="form-group">
        <label class="form-label">服务器</label>
        <van-field
          v-model="formData.server"
          placeholder="例如: Exness-MT5Trial"
          :rules="[{ required: true, message: '请输入服务器名称' }]"
        />
      </div>

      <!-- 密码 -->
      <div class="form-group">
        <label class="form-label">密码</label>
        <van-field
          v-model="formData.password"
          placeholder="请输入密码"
          type="password"
          show-password
          :rules="[{ required: true, message: '请输入密码' }, { validator: validatePassword }]"
        />
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        <van-icon name="warning-o" /> {{ errorMessage }}
      </div>

      <!-- 登录按钮 -->
      <van-button
        round
        block
        native-type="submit"
        :loading="loading"
        loading-text="登录中..."
        class="login-btn"
        @click="onSubmit"
      >
        登录
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const formData = ref({
  login: '',
  server: '',
  password: '',
})

// 状态
const loading = ref(false)
const errorMessage = ref('')

// 验证密码
const validatePassword = (value) => {
  if (value.length < 6) {
    return '密码至少6位字符'
  }
  return true
}

// 提交登录
const onSubmit = async () => {
  // 验证必填字段
  if (!formData.value.login || !formData.value.server || !formData.value.password) {
    errorMessage.value = '请填写所有字段'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await userStore.login({
      login: Number(formData.value.login),
      password: formData.value.password,
      server: formData.value.server,
    })

    if (result.success) {
      showToast({
        type: 'success',
        message: '登录成功',
      })
      
      // 跳转到主页
      router.push('/home')
    } else {
      errorMessage.value = result.error || '登录失败'
      showToast({
        type: 'fail',
        message: result.error || '登录失败',
      })
    }
  } catch (error) {
    errorMessage.value = error.message || '网络错误'
    showToast({
      type: 'fail',
      message: error.message || '网络错误',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  background: #ffffff;
  padding: 80px 24px 40px;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 60px;
  text-align: center;

  .title {
    font-size: 32px;
    font-weight: bold;
    color: #2c3e50;
    margin: 0;
  }
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 32px;

  .form-label {
    display: block;
    font-size: 16px;
    color: #2c3e50;
    margin-bottom: 12px;
    font-weight: 500;
  }

  :deep(.van-cell) {
    padding: 0;
    font-size: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    background: #fff;
    
    &::after {
      display: none;
    }
  }

  :deep(.van-field__control) {
    padding: 16px;
    font-size: 16px;
  }

  :deep(.van-field__label) {
    display: none;
  }
}

.error-message {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #e53e3e;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.login-btn {
  height: 56px;
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  margin-top: 40px;
  box-shadow: 0 4px 16px rgba(255, 214, 0, 0.3);
  
  &:active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transform: scale(0.98);
  }
}

:deep(.van-button--primary) {
  background: #ffd600;
  border-color: #ffd600;
  color: #000;
}
</style>
