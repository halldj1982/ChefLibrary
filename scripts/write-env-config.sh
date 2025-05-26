#!/bin/bash
# Print environment variables for debugging (will be visible in build logs)
echo "============= Environment Variables Check ============="
echo "PINECONE_API_KEY: ${PINECONE_API_KEY:0:3}... (truncated for security)"
echo "PINECONE_INDEX: $PINECONE_INDEX"
echo "PINECONE_NAMESPACE: $PINECONE_NAMESPACE"
echo "PINECONE_API_URL: $PINECONE_API_URL"
echo "pineconeApiKey: ${pineconeApiKey:0:3}... (truncated for security)"
echo "pineconeIndex: $pineconeIndex"
echo "pineconeNamespace: $pineconeNamespace"
echo "pineconeApiUrl: $pineconeApiUrl"
echo "myAwsRegion: $myAwsRegion"
echo "dynamoDbTable: $dynamoDbTable"
echo "=================================================="

# Create env-config.js with proper escaping
cat <<EOF > src/assets/env-config.js
window.env = {
  pineconeApiKey: "${PINECONE_API_KEY:-${pineconeApiKey:-''}}",
  pineconeIndex: "${PINECONE_INDEX:-${pineconeIndex:-''}}",
  pineconeNamespace: "${PINECONE_NAMESPACE:-${pineconeNamespace:-''}}",
  pineconeApiUrl: "${PINECONE_API_URL:-${pineconeApiUrl:-''}}",
  openaiApiKey: "${openaiApiKey:-''}",
  myAwsRegion: "${myAwsRegion:-''}",
  myAwsAccessKeyId: "${myAwsAccessKeyId:-''}",
  myAwsSecretAccessKey: "${myAwsSecretAccessKey:-''}",
  dynamoDbTable: "${dynamoDbTable:-''}"
};
EOF

# Verify the generated file has values (without showing sensitive data)
echo "============= Generated env-config.js Check ============="
echo "Checking if pineconeApiUrl is set in env-config.js:"
grep -o "pineconeApiUrl: \".*\"" src/assets/env-config.js
echo "=================================================="
