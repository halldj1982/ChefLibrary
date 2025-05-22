import { Injectable } from '@angular/core';

// Try to import environment, but it might not exist in production
let environment: any;
try {
  environment = require('../../environments/environment').environment;
} catch (e) {
  // In production, environment file might not exist
  environment = {};
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  // Get value from environment file or from window.env (set by Amplify)
  getValue(key: string, defaultValue: string = ''): string {
    if (environment && environment[key]) {
      return environment[key];
    }
    
    // @ts-ignore
    if (window.env && window.env[key]) {
      // @ts-ignore
      return window.env[key];
    }
    
    return defaultValue;
  }
  
  get pineconeApiKey(): string {
    return this.getValue('pineconeApiKey');
  }
  
  get pineconeIndex(): string {
    return this.getValue('pineconeIndex');
  }
  
  get pineconeNamespace(): string {
    return this.getValue('pineconeNamespace');
  }
  
  get openaiApiKey(): string {
    return this.getValue('openaiApiKey');
  }
  
  get myAwsRegion(): string {
    return this.getValue('myAwsRegion');
  }
  
  get myAwsAccessKeyId(): string {
    return this.getValue('myAwsAccessKeyId');
  }
  
  get myAwsSecretAccessKey(): string {
    return this.getValue('myAwsSecretAccessKey');
  }
  
  get dynamoDbTable(): string {
    return this.getValue('dynamoDbTable');
  }
}