@echo off
echo ========================================
echo Exness Trading Frontend - 淘宝镜像版
echo ========================================
echo.

REM 设置Node.js路径到PATH
set PATH=C:\Program Files\nodejs;%PATH%

echo [1/2] 配置淘宝npm镜像...
npm config set registry https://registry.npmmirror.com
echo ✅ 已切换到淘宝镜像源
echo.

echo [2/2] 安装依赖（使用淘宝镜像，速度更快）...
if exist node_modules (
    echo 清理旧的node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    del package-lock.json
)

npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo  安装失败！请检查网络连接或查看错误信息
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 依赖安装成功！
echo.
echo ========================================
echo 启动开发服务器...
echo ========================================
echo.
echo 访问地址:
echo   本地: http://localhost:5173
echo   手机: http://192.168.3.57:5173
echo.
echo 按 Ctrl+C 停止服务器
echo.

npm run dev

pause
