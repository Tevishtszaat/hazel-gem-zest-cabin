@echo off
title Axis 2026 Creator Particlewave
cd /d "%~dp0"

set PORT=8787
set HOST=127.0.0.1
set NITRO_PORT=8787
set NITRO_HOST=127.0.0.1

echo.
echo  Axis 2026 Creator Particlewave
echo  Opening http://127.0.0.1:8787/
echo  Close this window to stop the workshop.
echo.

start "" "http://127.0.0.1:8787/"
runtime\node.exe server\index.mjs
if errorlevel 1 pause
