@echo off
REM Start Expo without Console Ninja NODE_OPTIONS / PATH wrappers
set "NODE_OPTIONS="
set "CI="
set "EXPO_NO_DOTENV="
set "PATH=C:\Program Files\nodejs;%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem"
cd /d "%~dp0.."
"C:\Program Files\nodejs\node.exe" ".\node_modules\expo\bin\cli" start --clear --lan %*
