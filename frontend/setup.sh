#!/bin/bash

# SplitGreen Frontend - Quick Start Script

echo "🚀 Setting up SplitGreen Frontend..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node found: $(node --version)"
echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "📄 Copying .env.example to .env..."
    cp .env.example .env
    echo ""
    echo "⚙️  Please edit .env and add:"
    echo "   - Backend API URL (default: http://localhost:8000)"
    echo "   - Google OAuth Client ID"
    echo ""
    echo "   Get Google Client ID from:"
    echo "   https://console.cloud.google.com/"
    echo ""
fi

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Make sure backend is running on http://localhost:8000"
echo "   2. Edit .env with your Google Client ID"
echo "   3. Run: npm run dev"
echo "   4. Visit: http://localhost:5173"
echo ""
echo "📖 See INTEGRATION_GUIDE.md for connecting to backend"
echo ""
