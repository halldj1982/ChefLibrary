import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { Amplify } from 'aws-amplify';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent]
})
export class AppComponent implements OnInit {
  title = 'Recipe Extractor App';

  ngOnInit() {
    // Configure AWS Amplify
    Amplify.configure({
      Auth: {
        region: environment.myAwsRegion,
        userPoolId: environment.cognitoUserPoolId,
        userPoolWebClientId: environment.cognitoClientId,
        identityPoolId: environment.cognitoIdentityPoolId
      }
    });
    
    console.log('Amplify configuration:', {
      region: environment.myAwsRegion,
      userPoolId: environment.cognitoUserPoolId,
      userPoolWebClientId: environment.cognitoClientId,
      identityPoolId: environment.cognitoIdentityPoolId
    });
  }
}