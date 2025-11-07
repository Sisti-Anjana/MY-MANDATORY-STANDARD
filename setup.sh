#!/bin/bash

echo "🚀 Setting up Portfolio Issue Tracking System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo "✅ All dependencies installed successfully!"
echo ""
echo "🎉 Setup complete! To start the application:"
echo "   npm run dev"
echo ""
echo "This will start:"
echo "   - Backend server on http://localhost:5000"
echo "   - Frontend app on http://localhost:3000"
echo ""
echo "📚 See README.md for more information."


