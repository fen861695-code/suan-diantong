@echo off
chcp 65001 >nul
title 算电通 - AI数据中心电力交易智能分析平台
cd /d E:\suan-diantong
echo ========================================
echo   算电通平台启动中...
echo ========================================
echo.
echo 平台地址: http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo.
start http://localhost:3000
node server.js
pause
