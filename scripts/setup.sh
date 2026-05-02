#!/bin/bash

# IoT Parts Management System - Quick Setup Script
# This script helps you set up the development environment quickly

set -e

echo "🚀 IoT Parts Management System - Setup Script"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo "⚙️  Setting up environment file..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "📝 Please edit .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🗄️  Setting up database..."
npx prisma generate

# Setup SQLite database for development
echo "DATABASE_URL=\"file:./dev.db\"" > .env.local
npx prisma db push

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000"
echo ""
echo "For production setup, see SETUP_GUIDE.md"