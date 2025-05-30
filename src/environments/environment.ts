// This environment file is used for local development
// Values will be overridden by window.env in production
declare const window: any;

// Get values from window.env if available (for production)
const getEnvValue = (key: string, defaultValue: string = '') => {
  return window.env && window.env[key] ? window.env[key] : defaultValue;
};

export const environment = {
  production: false,
  pineconeApiUrl: getEnvValue('pineconeApiUrl', 'https://main.dymhmcupnyjl5.amplifyapp.com/api/pinecone'),
  openaiApiKey: getEnvValue('openaiApiKey', ''),
  myAwsRegion: getEnvValue('myAwsRegion', 'us-east-1'),
  myAwsAccessKeyId: getEnvValue('myAwsAccessKeyId', ''),
  myAwsSecretAccessKey: getEnvValue('myAwsSecretAccessKey', ''),
  dynamoDbTable: getEnvValue('dynamoDbTable', ''),
  // Cognito configuration
  cognitoUserPoolId: getEnvValue('cognitoUserPoolId', ''),
  cognitoClientId: getEnvValue('cognitoClientId', ''),
  cognitoIdentityPoolId: getEnvValue('cognitoIdentityPoolId', '')
};
