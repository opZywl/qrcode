@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title QR Code Studio - launcher

for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "OK=%ESC%[92m[ OK ]%ESC%[0m"
set "FAIL=%ESC%[91m[ERRO]%ESC%[0m"
set "INFO=%ESC%[96m[INFO]%ESC%[0m"

set "MODE=dev"
if /I "%~1"=="help" goto :help
if /I "%~1"=="-h" goto :help
if /I "%~1"=="prod" set "MODE=prod"
if /I "%~1"=="check" set "MODE=check"
if not "%~1"=="" if /I not "%~1"=="dev" if /I not "%~1"=="prod" if /I not "%~1"=="check" goto :help
set "PORT=3000"
if not "%~2"=="" set "PORT=%~2"

echo.
echo %ESC%[1m=== QR Code Studio - modo %MODE% ===%ESC%[0m
echo.
echo %ESC%[1m[1/6] Pre-flight%ESC%[0m
where node >nul 2>&1 || (echo %FAIL% Node.js nao encontrado. Instale o Node 24 LTS: https://nodejs.org & exit /b 1)
where npm >nul 2>&1 || (echo %FAIL% npm nao encontrado. Reinstale o Node.js. & exit /b 1)
for /f "tokens=1,2 delims=v." %%a in ('node -v') do (
  set "NODE_MAJOR=%%a"
  set "NODE_MINOR=%%b"
)
set "NODE_OK=0"
if !NODE_MAJOR! GTR 22 set "NODE_OK=1"
if !NODE_MAJOR! EQU 22 if !NODE_MINOR! GEQ 12 set "NODE_OK=1"
if "!NODE_OK!"=="0" (
  echo %FAIL% Node !NODE_MAJOR!.!NODE_MINOR! e antigo demais. Precisa do 22.12+ ^(recomendado: 24 LTS^).
  exit /b 1
)
for /f %%v in ('node -v') do echo %OK% Node %%v
for /f %%v in ('npm -v') do echo %OK% npm %%v
where curl >nul 2>&1 || (echo %FAIL% curl nao encontrado ^(vem com o Windows 10+^). & exit /b 1)
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if defined CHROME (echo %OK% Google Chrome encontrado) else (echo %INFO% Chrome nao encontrado no caminho padrao; vou tentar "start chrome")

echo.
echo %ESC%[1m[2/6] Dependencias%ESC%[0m
set "NEED_INSTALL=0"
if not exist "node_modules\.package-lock.json" set "NEED_INSTALL=1"
if "!NEED_INSTALL!"=="0" (
  for /f %%r in ('powershell -NoProfile -Command "if ((Get-Item 'package-lock.json').LastWriteTime -gt (Get-Item 'node_modules\.package-lock.json').LastWriteTime) { 1 } else { 0 }"') do set "NEED_INSTALL=%%r"
)
if "!NEED_INSTALL!"=="1" (
  echo %INFO% Instalando dependencias com npm ci...
  call npm ci --no-audit --no-fund
  if errorlevel 1 (echo %FAIL% npm ci falhou. Veja o erro acima. & exit /b 1)
  echo %OK% Dependencias instaladas
) else (
  echo %OK% node_modules em dia com o package-lock.json
)

echo.
echo %ESC%[1m[3/6] Configuracao%ESC%[0m
set "HAS_WEBHOOK=0"
if exist ".env.local" findstr /B /C:"DISCORD_WEBHOOK_URL=https://" ".env.local" >nul 2>&1 && set "HAS_WEBHOOK=1"
if "!HAS_WEBHOOK!"=="1" (
  echo %OK% DISCORD_WEBHOOK_URL definido em .env.local: monitoramento no Discord ativo
) else (
  echo %INFO% Nenhuma variavel obrigatoria. DISCORD_WEBHOOK_URL e opcional ^(sem ela o monitoramento fica desligado^)
)

echo.
if "%MODE%"=="check" goto :check
echo %ESC%[1m[4/6] Build%ESC%[0m
if "%MODE%"=="prod" (
  call npm run build
  if errorlevel 1 (echo %FAIL% Build falhou. Veja o erro acima. & exit /b 1)
  echo %OK% Build de producao gerado
  set "START_CMD=npm run start -- -p"
) else (
  echo %INFO% Modo dev: sem build ^(use "dev.cmd prod" para testar a versao de producao^)
  set "START_CMD=npm run dev -- -p"
)

echo.
echo %ESC%[1m[5/6] Servidor%ESC%[0m
set /a TRIES=0
:find_port
netstat -ano | findstr /R /C:":!PORT! .*LISTENING" >nul 2>&1
if not errorlevel 1 (
  set /a TRIES+=1
  if !TRIES! GEQ 10 (echo %FAIL% Nenhuma porta livre entre as testadas. & exit /b 1)
  echo %INFO% Porta !PORT! ocupada, tentando a proxima...
  set /a PORT+=1
  goto :find_port
)
set "URL=http://localhost:!PORT!"
start "QR Code Studio - servidor :!PORT!" cmd /k "!START_CMD! !PORT!"
echo %INFO% Aguardando !URL! responder...
set /a WAITED=0
:wait_server
ping -n 2 127.0.0.1 >nul
set /a WAITED+=1
set "CODE=000"
for /f %%c in ('curl -s -o nul -w "%%{http_code}" !URL!/') do set "CODE=%%c"
if "!CODE!"=="200" goto :server_ready
if !WAITED! GEQ 150 (
  echo %FAIL% O servidor nao respondeu em 150s. Veja os logs na janela "QR Code Studio - servidor :!PORT!".
  exit /b 1
)
goto :wait_server
:server_ready
echo %OK% Servidor respondendo em !URL! ^(!WAITED!s^)

echo.
echo %ESC%[1m[6/6] Healthcheck%ESC%[0m
set "HEALTH_FAIL=0"
for %%p in (/ /robots.txt /sitemap.xml /manifest.webmanifest /opengraph-image.png) do (
  set "HC=000"
  for /f %%c in ('curl -s -o nul -w "%%{http_code}" !URL!%%p') do set "HC=%%c"
  if "!HC!"=="200" (echo %OK% GET %%p -^> 200) else (echo %FAIL% GET %%p -^> !HC! & set "HEALTH_FAIL=1")
)
set "HC=000"
for /f %%c in ('curl -s -o nul -w "%%{http_code}" -X POST -H "Content-Type: application/json" -H "Origin: !URL!" -H "Sec-Fetch-Site: same-origin" --data "{}" !URL!/api/qr-events') do set "HC=%%c"
if "!HC!"=="400" (echo %OK% POST /api/qr-events com payload invalido -^> 400 ^(validacao ativa^)) else (echo %FAIL% POST /api/qr-events -^> !HC! & set "HEALTH_FAIL=1")
if "!HEALTH_FAIL!"=="1" (echo %FAIL% Algum endpoint falhou. Veja os logs do servidor. & exit /b 1)

if not defined QRCODE_NO_BROWSER (
  if defined CHROME (start "" "!CHROME!" "!URL!") else (start "" chrome "!URL!")
)

echo.
echo %ESC%[92m%ESC%[1m=== Tudo rodando ===%ESC%[0m
echo   App ........ !URL!
echo   Modo ....... %MODE%
echo   Logs ....... janela "QR Code Studio - servidor :!PORT!"
echo   Parar ...... feche essa janela ^(ou Ctrl+C dentro dela^)
echo   Checagens .. dev.cmd check  ^(typecheck + lint + testes + build^)
echo.
exit /b 0

:check
echo %ESC%[1m[4/6] Checagens completas%ESC%[0m
call npm run typecheck
if errorlevel 1 (echo %FAIL% TypeScript com erros. & exit /b 1)
echo %OK% TypeScript
call npm run lint
if errorlevel 1 (echo %FAIL% ESLint com erros. & exit /b 1)
echo %OK% ESLint
call npm run test
if errorlevel 1 (echo %FAIL% Testes falharam. & exit /b 1)
echo %OK% Testes
call npm run build
if errorlevel 1 (echo %FAIL% Build falhou. & exit /b 1)
echo %OK% Build
call npm audit --omit=dev
if errorlevel 1 (echo %FAIL% npm audit encontrou vulnerabilidades. & exit /b 1)
echo %OK% npm audit sem vulnerabilidades
echo.
echo %ESC%[92m%ESC%[1m=== Tudo verde ===%ESC%[0m
exit /b 0

:help
echo.
echo Uso: dev.cmd [dev^|prod^|check] [porta]
echo.
echo   dev.cmd            servidor de desenvolvimento na porta 3000 e abre no Chrome
echo   dev.cmd prod       build de producao + next start e abre no Chrome
echo   dev.cmd check      typecheck, lint, testes, build e npm audit ^(sem abrir nada^)
echo   dev.cmd dev 4000   usa outra porta
echo   QRCODE_NO_BROWSER=1 nao abre o Chrome ^(CI^)
echo.
exit /b 0
