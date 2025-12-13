#!/bin/bash

# LensyCam - macOS Setup Script
# This script will install all dependencies and start the application

set -e  # Exit on error

echo "🎬 LensyCam - macOS Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ This script is designed for macOS only${NC}"
    exit 1
fi

echo "📋 Step 1: Checking prerequisites..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}⚠️  Homebrew not found. Installing Homebrew...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo -e "${GREEN}✅ Homebrew is installed${NC}"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found.${NC}"
    echo ""
    echo "Please install Docker Desktop for Mac:"
    echo "  1. Visit: https://www.docker.com/products/docker-desktop"
    echo "  2. Download and install Docker Desktop"
    echo "  3. Start Docker Desktop"
    echo "  4. Run this script again"
    echo ""
    read -p "Do you want to download Docker Desktop now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://www.docker.com/products/docker-desktop"
    fi
    exit 1
else
    if ! docker ps &> /dev/null; then
        echo -e "${RED}❌ Docker is installed but not running${NC}"
        echo "Please start Docker Desktop and run this script again"
        open -a Docker
        exit 1
    else
        echo -e "${GREEN}✅ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) is running${NC}"
    fi
fi

echo ""
echo "📋 Step 2: Setting up environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from template...${NC}"
    cp .env.example .env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Update .env with generated secret (using | as delimiter to avoid issues with / in base64)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|your-secret-key-change-this-in-production|${JWT_SECRET}|" .env
    else
        sed -i "s|your-secret-key-change-this-in-production|${JWT_SECRET}|" .env
    fi
    
    echo -e "${GREEN}✅ .env file created with secure JWT secret${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p database backups
echo -e "${GREEN}✅ Directories created${NC}"

echo ""
echo "📋 Step 3: Starting application with Docker..."
echo ""

# Stop any existing containers
docker compose down 2>/dev/null || true

# Build and start
echo "🔨 Building Docker image (this may take a few minutes)..."
docker compose build

echo "🚀 Starting application..."
docker compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for application to be ready..."
sleep 5

# Check if container is running
if docker compose ps | grep -q "Up"; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Installation Complete!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo "🌐 Your application is running at:"
    echo -e "   ${GREEN}http://localhost:5000${NC}"
    echo ""
    echo "🔑 Default Login:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo "⚠️  IMPORTANT: Change the default password after first login!"
    echo ""
    echo "📝 Useful commands:"
    echo "   View logs:    docker compose logs -f"
    echo "   Stop app:     docker compose down"
    echo "   Restart app:  docker compose restart"
    echo "   Backup DB:    ./scripts/backup.sh"
    echo "   Restore DB:   ./scripts/restore.sh backups/your-backup.db"
    echo ""
    
    # Open browser
    sleep 2
    open http://localhost:5000
else
    echo -e "${RED}❌ Failed to start application${NC}"
    echo "Check logs with: docker compose logs"
    exit 1
fi
