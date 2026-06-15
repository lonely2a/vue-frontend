# Exness Trading Frontend (Vue3)

基于Vue3的Exness MT5交易助手移动端前端应用

## 🚀 快速开始

### 前置要求

- Node.js 16+ 
- npm 或 yarn

### 安装依赖

```bash
cd vue-frontend
npm install
```

### 开发模式

```bash
npm run dev
```

访问: http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录

### 预览生产版本

```bash
npm run preview
```

---

##  项目结构

```
vue-frontend/
├── src/
│   ├── api/           # API接口封装
│   │   ├── auth.js    # 认证接口
│   │   ├── account.js # 账户接口
│   │   ├── trading.js # 交易接口
│   │   └── market.js  # 行情接口
│   ├── views/         # 页面组件
│   │   ├── Login.vue      # 登录页
│   │   ├── Home.vue       # 主页
│   │   ├── Trade.vue      # 交易页
│   │   └── Positions.vue  # 持仓列表页
│   ├── components/    # 公共组件
│   ├── stores/        # Pinia状态管理
│   │   └── user.js    # 用户状态
│   ├── router/        # 路由配置
│   ├── utils/         # 工具函数
│   │   ── request.js # Axios封装
│   ├── App.vue        # 根组件
│   └── main.js        # 入口文件
── index.html         # HTML模板
├── vite.config.js     # Vite配置
── package.json       # 项目配置
```

---

## 🔧 技术栈

- **框架**: Vue 3 + Composition API
- **构建工具**: Vite 5
- **UI组件库**: Vant 4（专为移动端设计）
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **路由管理**: Vue Router 4
- **CSS预处理器**: SCSS

---

## 🌐 后端连接配置

### 开发环境

Vite代理会自动将API请求转发到后端：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://192.168.3.57:8000', // 修改为您的后端地址
      changeOrigin: true,
    },
  },
}
```

### 生产环境

#### 方案1: 使用Nginx反向代理（推荐）

```nginx
server {
    listen 80;
    server_name exness-trading.com;

    # 前端静态文件
    location / {
        root /var/www/exness-trading/dist;
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### 方案2: 直接访问后端CORS

确保后端配置了正确的CORS：

```python
# python-backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://exness-trading.com"],  # 您的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔒 安全特性

### httpOnly Cookie认证

登录成功后，后端会在响应中设置httpOnly Cookie：

```python
response.set_cookie(
    key="access_token",
    value=access_token,
    httponly=True,      # JavaScript无法读取，防止XSS攻击
    secure=False,       # 生产环境设为True（需要HTTPS）
    samesite="lax",     # 防止CSRF攻击
    max_age=86400,      # 24小时过期
    path="/api"
)
```

**优点**:
- ✅ XSS攻击无法窃取Token
- ✅ 自动随请求发送，无需手动添加Header
- ✅ 浏览器自动管理生命周期

### 生产环境HTTPS配置

使用Let's Encrypt免费SSL证书：

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d exness-trading.com

# 自动续期
sudo certbot renew --dry-run
```

---

##  移动端适配

### Viewport配置

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

### Vant组件自动适配

Vant 4已经内置了移动端适配，无需额外配置。

### 响应式设计

所有页面都使用了响应式布局，适配各种屏幕尺寸。

---

##  UI设计规范

### 颜色方案

```scss
// 主色调
$primary-color: #0091EA;    // Exness蓝色
$accent-color: #FFD600;     // Exness黄色

// 交易颜色
$buy-color: #4CAF50;        // 买入绿色
$sell-color: #F44336;       // 卖出红色
$profit-color: #4CAF50;     // 盈利绿色
$loss-color: #F44336;       // 亏损红色

// 背景色
$background-color: #F5F5F5; // 浅灰背景
$card-background: #FFFFFF;  // 卡片白色
```

### 字体规范

- 标题: 18px - 28px, bold
- 正文: 14px - 16px, regular
- 辅助文本: 12px - 13px, light

---

## 🐛 常见问题

### 1. 跨域问题

**症状**: 浏览器控制台显示CORS错误

**解决**: 
- 检查后端CORS配置
- 确保前端域名在白名单中
- 使用Nginx反向代理（推荐）

### 2. Cookie不发送

**症状**: 登录后刷新页面，Cookie丢失

**解决**:
- 检查`withCredentials: true`是否设置
- 检查Cookie的`path`和`domain`属性
- 清除浏览器Cookie后重新登录

### 3. 移动端样式异常

**症状**: 在手机上显示不正常

**解决**:
- 确保viewport meta标签正确
- 使用Vant组件而非原生HTML元素
- 测试不同屏幕尺寸

---

## 📊 性能优化

### 代码分割

路由懒加载已自动实现：

```javascript
{
  path: '/home',
  component: () => import('@/views/Home.vue'), // 按需加载
}
```

### 图片优化

- 使用CDN加载图标
- 考虑使用WebP格式
- 添加图片懒加载

### 打包优化

```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router', 'pinia'],
        vant: ['vant'],
      },
    },
  },
}
```

---

## 🔄 部署流程

### 开发环境

1. 修改`vite.config.js`中的后端地址
2. 运行`npm run dev`
3. 手机访问电脑IP: http://192.168.3.57:5173

### 生产环境

1. 运行`npm run build`
2. 上传`dist/`目录到服务器
3. 配置Nginx反向代理
4. 配置HTTPS证书
5. 重启Nginx: `sudo systemctl restart nginx`

---

## 📞 技术支持

如有问题，请检查：

1. **后端服务是否运行**: http://192.168.3.57:8000/docs
2. **网络连接是否正常**: 手机和电脑在同一WiFi
3. **浏览器控制台是否有错误**: F12查看Console
4. **Network面板查看请求**: 检查API请求状态

---

##  功能清单

- ✅ 用户登录/登出
- ✅ 账户信息展示（余额、净值、保证金等）
- ✅ 持仓列表（支持滑动平仓）
- ✅ 新建订单（买入/卖出、SL/TP设置）
- ✅ EMA60趋势验证策略
- ✅ 下拉刷新
- ✅ 响应式移动端UI
- ✅ httpOnly Cookie安全认证

---

**祝您使用愉快！** 🎉
