@echo off
title Sistema URABA-PAIS - Hackathon
echo ========================================================
echo  INICIANDO SISTEMA URABA-PAIS (HACKATHON)
echo  Arquitectura MVC: React + Express + Node.js
echo ========================================================
echo.

echo 1. Verificando dependencias del Backend...
cd backend
if not exist node_modules (
    echo Instalando dependencias de Express...
    call npm install
)
echo Levantando Servidor Backend Express (Puerto 5000)...
start "Backend Express (Puerto 5000)" cmd /k "npm start"

echo.
echo 2. Verificando dependencias del Frontend React...
cd ..\frontend
if not exist node_modules (
    echo Instalando dependencias de Vite y React...
    call npm install
)
echo Levantando Frontend React (Puerto 3000)...
start "Frontend React (Puerto 3000)" cmd /k "npm run dev"

echo.
echo ========================================================
echo  SISTEMA LEVANTADO CON EXITO
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000/api/health
echo ========================================================
pause
