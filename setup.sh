#!/bin/bash

echo "🚀 Starting LensyCam - Camera Rental Management System"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update JWT_SECRET for production use."
fi

echo "📦 Installing dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the application:"
echo "  npm run dev     - Start both server and client in development mode"
echo "  npm start       - Start server only (for production)"
echo ""
echo "Default login credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
