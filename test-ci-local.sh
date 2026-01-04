#!/bin/bash

# Local CI Pipeline Test Script
# This script mimics what Jenkins will do, for local testing

set -e  # Exit on any error

# Configuration
IMAGE_NAME="amineouhiba26/inventory-app"
BUILD_TAG="local-$(date +%s)"

echo "🚀 Starting local CI pipeline test..."
echo "Image name: ${IMAGE_NAME}"
echo "Build tag: ${BUILD_TAG}"
echo ""

# Step 1: Build Docker Image
echo "📦 Step 1: Building Docker image..."
cd backend
docker build -t ${IMAGE_NAME}:${BUILD_TAG} .
docker tag ${IMAGE_NAME}:${BUILD_TAG} ${IMAGE_NAME}:latest
cd ..
echo "✅ Docker image built successfully"
echo ""

# Step 2: Scan Image with Trivy (optional, install trivy first)
echo "🔍 Step 2: Scanning image with Trivy..."
if command -v trivy &> /dev/null; then
    echo "Trivy found, scanning image..."
    trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_NAME}:${BUILD_TAG}
    echo "✅ Trivy scan completed"
else
    echo "⚠️  Trivy not found. Install with: brew install trivy"
    echo "Skipping security scan..."
fi
echo ""

# Step 3: Test the image locally
echo "🧪 Step 3: Testing image locally..."
echo "Starting container in background on port 3002..."
CONTAINER_ID=$(docker run -d -p 3002:3001 ${IMAGE_NAME}:${BUILD_TAG})
echo "Container ID: ${CONTAINER_ID}"

# Wait for container to start
sleep 5

# Check if container is running
if docker ps | grep -q ${CONTAINER_ID}; then
    echo "✅ Container is running successfully"
    echo "You can test the API at: http://localhost:3002"
else
    echo "❌ Container failed to start"
    docker logs ${CONTAINER_ID}
fi

# Cleanup
echo ""
echo "🧹 Cleaning up..."
docker stop ${CONTAINER_ID} || true
docker rm ${CONTAINER_ID} || true

echo ""
echo "📝 Summary:"
echo "- Image built: ${IMAGE_NAME}:${BUILD_TAG}"
echo "- Image tagged: ${IMAGE_NAME}:latest"
echo "- Image tested locally"
echo ""
echo "🎯 Next steps:"
echo "1. Push to Jenkins for full CI pipeline"
echo "2. Configure Docker Hub credentials in Jenkins"
echo "3. Run the actual Jenkins pipeline"
echo ""
echo "To push manually to Docker Hub (optional):"
echo "  docker login"
echo "  docker push ${IMAGE_NAME}:${BUILD_TAG}"
echo "  docker push ${IMAGE_NAME}:latest"
