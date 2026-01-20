#!/bin/bash
# Render Deployment Script for Railji Applications
# This script prepares BOTH railji-business and railji-dashboard for Render deployment

echo "Preparing Railji Applications for Render Deployment..."

# Step 1: Verify Node.js and npm
echo "✓ Checking Node.js and npm..."
node --version
npm --version

# Step 2: Install dependencies
echo "✓ Installing root dependencies..."
npm install

# Step 3: Build shared library
echo "✓ Building shared library..."
npm run build:shared

# Step 4: Build business app
echo "✓ Building railji-business..."
npm run build:business

# Step 5: Build dashboard app
echo "✓ Building railji-dashboard..."
npm run build:dashboard

# Step 6: Verify builds
echo "✓ Verifying build outputs..."
if [ -d "apps/railji-business/dist" ] && [ -d "apps/railji-dashboard/dist" ]; then
  echo "Build successful! Both dist folders created."
  echo ""
  echo "Files ready for Render:"
  echo "  - render.yaml (configuration file)"
  echo "  - package.json (root)"
  echo "  - apps/railji-business/dist (compiled code)"
  echo "  - apps/railji-dashboard/dist (compiled code)"
  echo ""
  echo "Next steps:"
  echo "  1. Push this code to GitHub: git push origin main"
  echo "  2. Go to https://dashboard.render.com"
  echo "  3. Create TWO Web Services:"
  echo "     a) railji-business"
  echo "     b) railji-dashboard"
  echo "  4. Set shared environment variables:"
  echo "     - JWT_SECRET (required - secret)"
  echo "     - MONGODB_URI (required - secret)"
  echo "     - CORS_ORIGIN (optional)"
  echo "     - NODE_ENV = production"
  echo "     - LOG_LEVEL = info"
  echo ""
  echo "  5. Set service-specific variables:"
  echo "     - railji-business: BUSINESS_PORT = 10000"
  echo "     - railji-dashboard: DASHBOARD_PORT = 10001"
  echo ""
  echo "Render will automatically use render.yaml configuration"
  echo ""
  echo "Test locally first:"
  echo "  npm run start:business"
  echo "  npm run start:dashboard"
else
  echo "Build failed! One or more dist folders not found."
  if [ ! -d "apps/railji-business/dist" ]; then
    echo "  Missing: apps/railji-business/dist"
  fi
  if [ ! -d "apps/railji-dashboard/dist" ]; then
    echo "  Missing: apps/railji-dashboard/dist"
  fi
  exit 1
fi
