#!/bin/bash

# Kill any existing server processes
pkill -f "tsx server/index.ts" 2>/dev/null || true
sleep 1

# Start the dev server
echo "Starting development server..."
npm run dev
