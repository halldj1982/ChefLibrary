#!/bin/bash
# Create a directory for the layer - Unix version for cloud deployment

echo "Creating Pinecone layer directories..."
mkdir -p pinecone-layer/nodejs

echo "Installing dependencies..."
cd pinecone-layer/nodejs
npm init -y
npm install @pinecone-database/pinecone@^1.1.0

echo "Creating layer zip file..."
cd ..
zip -r pinecone-layer.zip nodejs

echo "Pinecone layer created at pinecone-layer.zip"