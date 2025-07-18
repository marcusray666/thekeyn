#!/bin/bash

echo "Building Loggin' mobile app..."

# Build the web app
echo "Building web app..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Web app built successfully!"
    
    # Sync with Capacitor
    echo "Syncing with Capacitor..."
    npx cap sync
    
    if [ $? -eq 0 ]; then
        echo "Capacitor sync completed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. For iOS: npx cap open ios"
        echo "2. For Android: npx cap open android"
        echo ""
        echo "Your mobile app is ready for native development!"
    else
        echo "Capacitor sync failed. Please check the logs above."
        exit 1
    fi
else
    echo "Web app build failed. Please check the logs above."
    exit 1
fi