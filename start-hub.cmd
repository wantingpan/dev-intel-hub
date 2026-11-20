@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   DevBrief Daily - 本機一鍵更新並開啟情報站
echo ============================================
echo.
call npm start
if errorlevel 1 (
  echo.
  echo 啟動失敗，請確認已安裝 Node.js 20.3+ 並執行過 npm install。
  pause
)
