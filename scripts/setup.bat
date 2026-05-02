@echo off
REM IoT Parts Management System - Quick Setup Script for Windows
REM This script helps you set up the development environment quickly

echo 🚀 IoT Parts Management System - Setup Script
echo ==============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Setup environment file
if not exist .env (
    echo ⚙️  Setting up environment file...
    copy .env.example .env
    echo ✅ Created .env file from template
    echo 📝 Please edit .env file with your configuration
) else (
    echo ✅ .env file already exists
)

REM Generate Prisma client
echo 🗄️  Setting up database...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Setup SQLite database for development
echo DATABASE_URL="file:./dev.db" > .env.local
npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Failed to setup database
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Edit .env file with your configuration
echo 2. Run 'npm run dev' to start the development server
echo 3. Visit http://localhost:3000
echo.
echo For production setup, see SETUP_GUIDE.md
pause