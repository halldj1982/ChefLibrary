#!/bin/bash
cat <<EOF > src/assets/env-config.js
window.env = {
  pineconeApiKey: "${pineconeApiKey}",
  pineconeIndex: "${pineconeIndex}",
  pineconeNamespace: "${pineconeNamespace}",
  openaiApiKey: "${openaiApiKey}",
  myAwsRegion: "${myAwsRegion}",
  myAwsAccessKeyId: "${myAwsAccessKeyId}",
  myAwsSecretAccessKey: "${myAwsSecretAccessKey}",
  dynamoDbTable: "${dynamoDbTable}"
};
EOF
