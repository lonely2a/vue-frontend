@echo off
echo ========================================
echo Exness Trading Frontend - 快速启动脚本
echo ========================================
echo.

REM 设置Node.js路径到PATH
set PATH=C:\Program Files\nodejs;%PATH%

echo [1/3] 检查Node.js版本...
node --version
npm --version
echo.

echo [2/3] 清理旧的node_modules...
if exist node_modules (
    echo 正在删除node_modules目录...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo 正在删除package-lock.json...
    del package-lock.json
)
echo.

echo [3/3] 安装依赖（这可能需要几分钟）...
npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo  依赖安装失败！
    echo.
    echo 请尝试以下解决方案：
    echo 1. 使用淘宝镜像: npm config set registry https://registry.npmmirror.com
    echo 2. 然后重新运行此脚本
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
