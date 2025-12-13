#!/bin/bash

# LensyCam - Linux Setup Script
# This script will install all dependencies and start the application

set -e  # Exit on error

echo "🎬 LensyCam - Linux Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}❌ Cannot detect Linux distribution${NC}"
    exit 1
fi

echo "📋 Step 1: Checking prerequisites..."

# Check if Node.js is installed
# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found.${NC}"
    echo ""
    read -p "Do you want to install Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
            # Install Docker on Ubuntu/Debian
            sudo apt-get update
            sudo apt-get install -y ca-certificates curl gnupg
            sudo install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            sudo chmod a+r /etc/apt/keyrings/docker.gpg
            
            echo \
              "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
              "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
              sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            # Add user to docker group
            sudo usermod -aG docker $USER
            echo -e "${GREEN}✅ Docker installed${NC}"
            echo -e "${YELLOW}⚠️  You may need to log out and back in for Docker group permissions${NC}"
        else
            echo -e "${RED}❌ Automatic Docker installation not supported for $OS${NC}"
            echo "Please install Docker manually: https://docs.docker.com/engine/install/"
            exit 1
        fi
    else
        echo "Continuing without Docker..."
    fi
else
    if ! docker ps &> /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Docker is installed but you don't have permission${NC}"
        echo "Running: sudo usermod -aG docker $USER"
        sudo usermod -aG docker $USER
        echo -e "${YELLOW}⚠️  Please log out and back in, then run this script again${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) is running${NC}"
    fi
fi

# Check docker compose
if ! docker compose version &> /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  docker compose plugin not found${NC}"
    echo "Docker Compose should be included with Docker. Please reinstall Docker."
    exit 1
else
    echo -e "${GREEN}✅ docker compose is installed${NC}"
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
    sed -i "s|your-secret-key-change-this-in-production|${JWT_SECRET}|" .env
    
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
docker-compose down 2>/dev/null || true

# Build and start
echo "🔨 Building Docker image (this may take a few minutes)..."
docker-compose build

echo "🚀 Starting application..."
docker-compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for application to be ready..."
sleep 5

# Check if container is running
if docker-compose ps | grep -q "Up"; then
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
    echo "   View logs:    docker-compose logs -f"
    echo "   Stop app:     docker-compose down"
    echo "   Restart app:  docker-compose restart"
    echo "   Backup DB:    ./backup.sh"
    echo "   Restore DB:   ./restore.sh backups/your-backup.db"
    echo ""
    
    # Try to open browser
    if command -v xdg-open &> /dev/null; then
        sleep 2
        xdg-open http://localhost:5000 2>/dev/null || true
    fi
else
    echo -e "${RED}❌ Failed to start application${NC}"
    echo "Check logs with: docker-compose logs"
    exit 1
fi
