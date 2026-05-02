# 🚀 Quick Start Guide

Get the IoT Parts Management System running in 5 minutes!

## Option 1: Automated Setup (Recommended)

### Windows
```cmd
# Run the setup script
scripts\setup.bat
```

### macOS/Linux
```bash
# Make script executable
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

### Cross-platform (Node.js)
```bash
npm run setup
```

## Option 2: Manual Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

### 3. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```

## 🎯 Access the Application

1. Open your browser and go to: `http://localhost:3000`
2. You'll see the sign-in page
3. In development mode, authentication is bypassed - you can access the system directly

## 🔑 Default Access

Since authentication is optional in development:
- Visit `http://localhost:3000` to see the landing page
- The system will redirect you based on your role
- You can manually navigate to different dashboards:
  - Student: `http://localhost:3000/dashboard/student`
  - Lab Assistant: `http://localhost:3000/dashboard/lab-assistant`
  - HOD: `http://localhost:3000/dashboard/hod`

## 📊 Database Management

```bash
# View database in browser
npm run db:studio

# Reset database (development only)
npm run db:reset

# Generate Prisma client after schema changes
npm run db:generate
```

## 🛠️ Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for TypeScript errors
npm run type-check

# Run linter
npm run lint
```

## 🎨 Key Features to Test

1. **Dashboard Navigation**: Switch between different role dashboards
2. **Inventory Browse**: View and search components
3. **Request System**: Create and manage component requests
4. **QR Scanner**: Test the scanning interface
5. **Inventory Management**: Add and edit components (Lab Assistant role)
6. **Approval Workflow**: Approve/reject requests (HOD role)

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Database Issues
```bash
# Reset and recreate database
npm run db:reset
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Next Steps

1. **Explore the Interface**: Navigate through different dashboards and features
2. **Add Sample Data**: Use the inventory management to add components
3. **Test Workflows**: Create requests and test the approval process
4. **Customize**: Modify the code to fit your institution's needs
5. **Production Setup**: Follow SETUP_GUIDE.md for production deployment

## 📚 Need Help?

- Check `SETUP_GUIDE.md` for detailed setup instructions
- Review the code comments for implementation details
- Check browser console for any JavaScript errors
- Look at server logs in the terminal for API errors

Happy coding! 🎉