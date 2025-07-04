#!/bin/bash
# Deploy script for Google Cloud Platform

# Set your project ID
PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

echo "🚀 Deploying Road Sign Factory to Google Cloud..."

# 1. Deploy backend API service
echo "📡 Deploying backend API..."
cd backend
gcloud app deploy app.yaml --service=api --no-promote --quiet

# 2. Build and deploy frontend
echo "🎨 Building and deploying frontend..."
cd ..
npm run build
gcloud app deploy app.yaml --service=default --no-promote --quiet

# 3. Route traffic to new versions
echo "🔄 Routing traffic..."
gcloud app services set-traffic api --splits=LATEST=1 --quiet
gcloud app services set-traffic default --splits=LATEST=1 --quiet

echo "✅ Deployment complete!"
echo "Frontend: https://roadsignfactory.appspot.com"
echo "API: https://api-dot-roadsignfactory.appspot.com"
