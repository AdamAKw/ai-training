#!/bin/bash

# Setup X11 forwarding for devcontainer
# This script should be run on the HOST machine (not in container)

echo "🔧 Setting up X11 forwarding for devcontainer..."

# Check if running on Linux
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "📍 Detected Linux host"
    
    # Install X11 utilities if not present
    if ! command -v xauth &> /dev/null; then
        echo "📦 Installing X11 utilities..."
        sudo apt-get update
        sudo apt-get install -y x11-xserver-utils
    fi
    
    # Allow X11 forwarding from localhost
    echo "🔐 Configuring X11 permissions..."
    xhost +local:
    
    # Set DISPLAY environment variable
    export DISPLAY=${DISPLAY:-:0}
    echo "📺 DISPLAY set to: $DISPLAY"
    
    # Check Xauth file exists
    if [ ! -f "$HOME/.Xauthority" ]; then
        echo "🔑 Creating Xauthority file..."
        touch "$HOME/.Xauthority"
        chmod 600 "$HOME/.Xauthority"
    fi
    
    echo "✅ Linux X11 forwarding setup complete!"
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📍 Detected macOS host"
    
    # Check if XQuartz is installed
    if [ ! -d "/Applications/Utilities/XQuartz.app" ]; then
        echo "❌ XQuartz not found. Please install XQuartz:"
        echo "   1. Download from: https://www.xquartz.org/"
        echo "   2. Or install via Homebrew: brew install --cask xquartz"
        echo "   3. Logout and login again"
        echo "   4. Run this script again"
        exit 1
    fi
    
    # Start XQuartz if not running
    if ! pgrep -f "XQuartz" > /dev/null; then
        echo "🚀 Starting XQuartz..."
        open -a XQuartz
        sleep 3
    fi
    
    # Configure XQuartz for network connections
    echo "🔐 Configuring XQuartz permissions..."
    /opt/X11/bin/xhost +localhost
    
    # Set DISPLAY for Docker
    export DISPLAY=host.docker.internal:0
    echo "📺 DISPLAY set to: $DISPLAY"
    
    echo "✅ macOS X11 forwarding setup complete!"
    echo "ℹ️  Make sure XQuartz preferences allow connections from network clients"
    
else
    echo "❌ Unsupported operating system: $OSTYPE"
    echo "This script supports Linux and macOS only"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Rebuild your devcontainer"
echo "2. Test X11 with: npm run x11:test"
echo "3. Test GUI app with: npm run x11:apps"
echo "4. Run Cypress GUI with: npm run test:gui"
echo ""
echo "📝 Commands available:"
echo "   npm run cypress:open         # Open Cypress GUI"
echo "   npm run test:gui             # Start dev server + Cypress GUI"
echo "   npm run x11:test             # Test X11 connection"
echo "   npm run x11:apps             # Test with xclock"
