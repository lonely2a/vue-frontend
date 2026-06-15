import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 引入Vant组件库
import Vant from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Vant) // 全局注册Vant所有组件

app.mount('#app')
