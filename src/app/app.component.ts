import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { Amplify } from 'aws-amplify';
import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent]
})
export class AppComponent implements OnInit {
  title = 'Recipe Extractor App';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

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

    // Check auth status on each navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.authService.checkAuthStatus();
    });
  }
}