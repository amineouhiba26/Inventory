#!/bin/bash

# Development setup script for Inventory Management System

echo "🚀 Setting up Inventory Management System for DevOps..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Backend setup
echo "📦 Setting up Backend dependencies..."
cd Backend
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your MongoDB connection string"
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend npm install failed"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Frontend setup
echo "📦 Setting up Frontend dependencies..."
cd ../Frontend
if [ ! -f .env.local ]; then
    echo "📝 .env.local already exists with default configuration"
fi

npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend npm install failed"
    exit 1
fi
echo "✅ Frontend dependencies installed"

cd ..

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update Backend/.env with your MongoDB connection string"
echo "2. To start development servers:"
echo "   - Backend: cd Backend && npm run dev"
echo "   - Frontend: cd Frontend && npm start"
echo ""
echo "🔗 URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:3001"
echo "   - Backend Health Check: http://localhost:3001/health"
