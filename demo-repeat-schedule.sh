#!/bin/bash

# Demo script for Repeat Schedule functionality

echo "🚀 Demo: Repeat Schedule Functionality"
echo "======================================"

echo "📋 Preparing demo data..."

# Start backend server if not running
if ! pgrep -f "node.*server.js" > /dev/null; then
    echo "Starting backend server..."
    cd be && npm start &
    BACKEND_PID=$!
    sleep 5
    cd ..
fi

# Start frontend server if not running
if ! pgrep -f "react-scripts" > /dev/null; then
    echo "Starting frontend server..."
    cd fe && npm start &
    FRONTEND_PID=$!
    sleep 10
    cd ..
fi

echo "✅ Servers are running!"
echo ""

echo "🎯 Demo Steps:"
echo "1. Open browser at http://localhost:3000"
echo "2. Login as coach (coach@gmail.com / 123456)"
echo "3. Navigate to Schedule page"
echo "4. Select a trainee from the list"
echo "5. Click on any date to view/create workout"
echo "6. Add a workout with title and description"
echo "7. Save the workout"
echo "8. Click the 'Lặp lại' (Repeat) button"
echo "9. Select multiple dates from the calendar"
echo "10. Click 'Lưu lịch lặp lại' to duplicate the workout"
echo ""

echo "🔍 Features to test:"
echo "- ✅ Repeat button appears next to Edit button"
echo "- ✅ Modal opens with workout preview"
echo "- ✅ Date selection with visual indicators"
echo "- ✅ 'Select All' and 'Clear All' buttons"
echo "- ✅ Current date is disabled"
echo "- ✅ Existing workout dates show warning"
echo "- ✅ Confirmation dialog before saving"
echo "- ✅ Loading state during save operation"
echo "- ✅ Success message and data refresh"
echo ""

echo "🌐 Opening browser..."
if command -v open > /dev/null; then
    open http://localhost:3000
elif command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000
else
    echo "Please manually open http://localhost:3000 in your browser"
fi

echo ""
echo "📝 Test Credentials:"
echo "Coach: coach@gmail.com / 123456"
echo "User: user@gmail.com / 123456"
echo ""

echo "🎬 Demo is ready! Follow the steps above to test the repeat schedule functionality."
echo "Press Ctrl+C to stop the demo and clean up processes."

# Wait for user interrupt
trap cleanup INT

cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ Demo completed!"
    exit 0
}

# Keep script running
while true; do
    sleep 1
done
