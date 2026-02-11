#!/bin/bash

# Agent Management System Launcher
# Quick setup and launch script for Daniel's Agent Management System

echo "🤖 Agent Management System Launcher"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "dashboard.html" ]; then
    echo "❌ Error: dashboard.html not found. Please run from agent-management directory."
    exit 1
fi

# Check for required files
required_files=("dashboard.html" "cron-manager.html" "profiles/index.html" "assets/css/main.css" "assets/js/main.js")

echo "📋 Checking required files..."
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        exit 1
    fi
done

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    mkdir -p logs
    echo "📁 Created logs directory"
fi

# Start simple HTTP server if requested
if [ "$1" = "--server" ] || [ "$1" = "-s" ]; then
    echo ""
    echo "🌐 Starting local HTTP server..."
    
    # Try different Python versions
    if command -v python3 &> /dev/null; then
        echo "📡 Server starting on http://localhost:8000"
        echo "🔗 Dashboard: http://localhost:8000/dashboard.html"
        echo ""
        echo "Press Ctrl+C to stop the server"
        python3 -m http.server 8000
    elif command -v python &> /dev/null; then
        echo "📡 Server starting on http://localhost:8000"
        echo "🔗 Dashboard: http://localhost:8000/dashboard.html"
        echo ""
        echo "Press Ctrl+C to stop the server"
        python -m SimpleHTTPServer 8000
    else
        echo "❌ Python not found. Please install Python to use server mode."
        echo "💡 Alternatively, open dashboard.html directly in your browser"
        exit 1
    fi
else
    # Open directly in browser
    echo ""
    echo "🚀 Launching Agent Management System..."
    
    dashboard_path="$(pwd)/dashboard.html"
    
    # Try different browsers/commands
    if command -v open &> /dev/null; then
        # macOS
        open "$dashboard_path"
        echo "✅ Opened in default browser (macOS)"
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open "$dashboard_path"
        echo "✅ Opened in default browser (Linux)"
    elif command -v start &> /dev/null; then
        # Windows
        start "$dashboard_path"
        echo "✅ Opened in default browser (Windows)"
    else
        echo "📋 Please open the following file in your browser:"
        echo "   file://$dashboard_path"
    fi
    
    echo ""
    echo "🎯 Quick Links:"
    echo "   Dashboard:      file://$(pwd)/dashboard.html"
    echo "   Cron Manager:   file://$(pwd)/cron-manager.html"  
    echo "   Agent Profiles: file://$(pwd)/profiles/index.html"
    echo "   Communication:  file://$(pwd)/communication-hub.html"
    echo "   Analytics:      file://$(pwd)/analytics.html"
    echo ""
    echo "💡 Tips:"
    echo "   • Run with --server flag for HTTP server mode"
    echo "   • Bookmark the dashboard for quick access"
    echo "   • Check browser console for any errors"
fi

echo ""
echo "🎉 Agent Management System is ready!"
echo "📚 See README.md for detailed usage instructions"