const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Installing dependencies for Lambda function...');
  execSync('npm install', { 
    cwd: path.join(__dirname, 'lambda', 'pinecone-service'),
    stdio: 'inherit'
  });
  
  console.log('Running tests for Lambda function...');
  execSync('npm test', { 
    cwd: path.join(__dirname, 'lambda', 'pinecone-service'),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}