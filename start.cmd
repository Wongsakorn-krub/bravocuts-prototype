@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title BRAVOCUTS preview

rem ---- Find Node. It is not on this machine's PATH, so check the usual homes too. ----
set "NODE="

for /f "delims=" %%I in ('where node 2^>nul') do if not defined NODE set "NODE=%%I"

if not defined NODE for %%P in (
  "%ProgramFiles%\nodejs\node.exe"
  "%ProgramFiles(x86)%\nodejs\node.exe"
  "%LOCALAPPDATA%\Programs\nodejs\node.exe"
  "%APPDATA%\nvm\current\node.exe"
  "%USERPROFILE%\scoop\apps\nodejs\current\node.exe"
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
) do if not defined NODE if exist "%%~P" set "NODE=%%~P"

rem Last resort: any node.exe parked under a local runtime cache.
if not defined NODE for /f "delims=" %%I in ('dir /b /s "%LOCALAPPDATA%\node.exe" "%USERPROFILE%\.cache\node.exe" 2^>nul') do if not defined NODE set "NODE=%%I"

if not defined NODE (
  echo.
  echo   Could not find Node.js on this computer.
  echo   Install it from https://nodejs.org  then run this file again.
  echo.
  pause
  exit /b 1
)

echo Using Node: !NODE!
echo.
"!NODE!" server.mjs --open

rem Keep the window up if the server quit on its own, so the error stays readable.
if errorlevel 1 pause
