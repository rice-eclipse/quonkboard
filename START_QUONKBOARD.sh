#!/bin/bash
# Quonkboard Startup Script for Linux
# This script starts the Quonkboard React development server

PROJECT_DIR="/home/wilsonh/Documents/GitHub/quonkboard"
LOG_FILE="/tmp/quonkboard.log"

echo "════════════════════════════════════════════════════════════════"
echo "  QUONKBOARD - Mission Control Dashboard Startup"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if node_modules exists
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    cd "$PROJECT_DIR"
    /usr/bin/npm install
    echo ""
fi

# Check Node.js and npm
NODE_VERSION=$(/usr/bin/node --version 2>/dev/null)
NPM_VERSION=$(/usr/bin/npm --version 2>/dev/null)

echo "✅ Node.js version: $NODE_VERSION"
echo "✅ npm version: $NPM_VERSION"
echo ""

# Start the development server
echo "🚀 Starting Quonkboard development server..."
echo "📍 Application will be available at: http://localhost:3000"
echo ""
echo "Logs are being written to: $LOG_FILE"
echo ""
echo "Press Ctrl+C to stop the server"
echo "════════════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_DIR"
/usr/bin/npm start 2>&1 | tee "$LOG_FILE"
