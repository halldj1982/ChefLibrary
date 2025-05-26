#!/bin/bash
# Build script for Lambda function - Unix version for cloud deployment

echo "Building Lambda function..."
npm install
npm run build

echo "Creating deployment package with dependencies..."
mkdir -p dist/node_modules
cp -r node_modules/* dist/node_modules/

cd dist
zip -r function.zip index.js node_modules

echo "Deployment package created at dist/function.zip"