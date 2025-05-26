@echo off
REM Create a directory for the layer - local Windows version

echo "Creating Pinecone layer directories..."
if not exist pinecone-layer mkdir pinecone-layer
if not exist pinecone-layer\nodejs mkdir pinecone-layer\nodejs

echo "Installing dependencies..."
cd pinecone-layer\nodejs
call npm init -y
call npm install @pinecone-database/pinecone@^1.1.0

echo "Creating layer zip file..."
cd ..
tar -acf pinecone-layer.zip nodejs

echo "Pinecone layer created at pinecone-layer.zip"