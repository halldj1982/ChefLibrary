@echo off
REM Create a directory for the layer
mkdir pinecone-layer\nodejs

REM Install dependencies in the layer directory
cd pinecone-layer\nodejs
call npm init -y
call npm install @pinecone-database/pinecone@^1.1.0

REM Create the layer zip file
cd ..
tar -acf pinecone-layer.zip nodejs

echo "Pinecone layer created at pinecone-layer.zip"