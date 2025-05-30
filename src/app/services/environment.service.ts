import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  getValue(key: string, defaultValue: string = ''): string {
    
    // @ts-ignore
    if (window.env && window.env[key]) {
      // @ts-ignore
      console.log(`Getting env value for ${key}: ${window.env[key]}`);
      // @ts-ignore
      return window.env[key];
    }

    if (environment && environment[key]) {
      console.log(`Getting environment value for ${key}: ${environment[key]}`);
      return environment[key];
    }
    
    console.log(`No value found for ${key}, using default: ${defaultValue}`);
    return defaultValue;
  }
  
  get pineconeApiUrl(): string {
    console.log("Returning Value from get pineconeApiUrl: " + this.getValue('pineconeApiUrl'));
    return this.getValue('pineconeApiUrl');
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