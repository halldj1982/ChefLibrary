// Polyfills
(window as any).global = window;
(window as any).process = { env: {} };

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Amplify } from 'aws-amplify';
import { environment } from './environments/environment';

// Configure AWS Amplify
Amplify.configure({
  Auth: {
    region: environment.myAwsRegion,
    userPoolId: environment.cognitoUserPoolId,
    userPoolWebClientId: environment.cognitoClientId,
    identityPoolId: environment.cognitoIdentityPoolId
  }
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
