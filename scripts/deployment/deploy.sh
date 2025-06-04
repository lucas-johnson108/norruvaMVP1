#!/bin/bash
# Deployment script for Norruva Firebase Studio

set -e

ENVIRONMENT=${1:-dev}
COMPONENT=${2:-all}

echo "🚀 Deploying to $ENVIRONMENT environment..."

case $ENVIRONMENT in
  "dev")
    PROJECT_ID="norruva-dev"
    ;;
  "staging")
    PROJECT_ID="norruva-staging"
    ;;
  "prod")
    PROJECT_ID="norruva-prod"
    ;;
  *)
    echo "❌ Invalid environment: $ENVIRONMENT"
    echo "Usage: ./deploy.sh [dev|staging|prod] [functions|hosting|firestore|all]"
    exit 1
    ;;
esac

# Set Firebase project
firebase use $PROJECT_ID

case $COMPONENT in
  "functions")
    echo "📦 Deploying Cloud Functions..."
    if [ -d "functions" ]; then
      (cd functions && npm run build)
    else
      echo "⚠️ 'functions' directory not found. Skipping build."
    fi
    firebase deploy --only functions
    ;;
  "hosting")
    echo "🌐 Deploying Hosting..."
    # For Next.js with App Hosting, build is handled by App Hosting.
    # If using traditional Firebase Hosting with a static export or custom server:
    # (cd web && npm run build) # Or your Next.js build command (e.g., next build && next export)
    echo "INFO: Assuming Next.js build is handled by Firebase App Hosting or a separate build step."
    firebase deploy --only hosting
    ;;
  "firestore")
    echo "🔥 Deploying Firestore rules and indexes..."
    firebase deploy --only firestore:rules,firestore:indexes
    ;;
  "storage")
    echo "📁 Deploying Storage rules..."
    firebase deploy --only storage
    ;;
  "all")
    echo "🎯 Deploying all components..."
    if [ -d "functions" ]; then
      (cd functions && npm run build)
    else
      echo "⚠️ 'functions' directory not found. Skipping functions build."
    fi
    # For Next.js with App Hosting, build is handled by App Hosting.
    echo "INFO: Assuming Next.js build is handled by Firebase App Hosting or a separate build step for 'all' deploy."
    firebase deploy
    ;;
  *)
    echo "❌ Invalid component: $COMPONENT"
    exit 1
    ;;
esac

echo "✅ Deployment to $ENVIRONMENT complete!"
