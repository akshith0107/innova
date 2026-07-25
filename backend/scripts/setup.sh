#!/bin/bash

# PRAMAAN AI Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up PRAMAAN AI Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys and configuration"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Initialize database
echo "🗄️  Initializing database..."
python scripts/init_db.py

# Initialize Qdrant (if running locally)
echo "🔍 Initializing Qdrant..."
python scripts/init_qdrant.py

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Start Redis: redis-server"
echo "3. Start Qdrant: docker run -p 6333:6333 qdrant/qdrant"
echo "4. Run the application: python main.py"
echo "5. Access API docs at: http://localhost:8000/docs"
