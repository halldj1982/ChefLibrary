@echo off
REM Build script for Lambda function

echo "Building Lambda function..."
call npm install
call npm run build

echo "Creating deployment package with dependencies..."
mkdir dist\node_modules
xcopy /E /I node_modules dist\node_modules

cd dist
tar -acf function.zip index.js node_modules

echo "Deployment package created at dist/function.zip"