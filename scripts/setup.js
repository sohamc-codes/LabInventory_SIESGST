#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 IoT Parts Management System - Setup Script');
console.log('==============================================\n');

try {
  // Check if .env exists
  if (!fs.existsSync('.env')) {
    console.log('⚙️  Creating environment file...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ Created .env file from template\n');
  } else {
    console.log('✅ .env file already exists\n');
  }

  // Generate Prisma client
  console.log('🗄️  Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Setup development database
  console.log('📊 Setting up development database...');
  
  // Create .env.local with SQLite for development
  const envLocal = 'DATABASE_URL="file:./dev.db"\nNODE_ENV="development"\n';
  fs.writeFileSync('.env.local', envLocal);
  
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Development database setup complete\n');

  console.log('🎉 Setup completed successfully!\n');
  console.log('Next steps:');
  console.log('1. Edit .env file with your configuration');
  console.log('2. Run "npm run dev" to start the development server');
  console.log('3. Visit http://localhost:3000\n');
  console.log('For production setup, see SETUP_GUIDE.md');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}