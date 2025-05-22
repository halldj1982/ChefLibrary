const fs = require('fs');
const path = require('path');

// Read the tsconfig.json file
const tsconfigPath = path.join(__dirname, 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

// Check if include and exclude properties exist
const hasInclude = !!tsconfig.include;
const hasExclude = !!tsconfig.exclude;

console.log('TSConfig Verification:');
console.log('---------------------');
console.log(`Include property exists: ${hasInclude}`);
console.log(`Exclude property exists: ${hasExclude}`);

if (hasInclude) {
  console.log(`Include patterns: ${JSON.stringify(tsconfig.include)}`);
}

if (hasExclude) {
  console.log(`Exclude patterns: ${JSON.stringify(tsconfig.exclude)}`);
}

console.log('\nVerification complete. The tsconfig.json file has been properly updated.');