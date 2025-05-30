import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { RecipeUploadComponent } from './components/recipe-upload/recipe-upload.component';
import { RecipeSearchComponent } from './components/recipe-search/recipe-search.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { MealPlannerComponent } from './components/meal-planner/meal-planner.component';
import { SavedMealPlansComponent } from './components/saved-meal-plans/saved-meal-plans.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';

// Node.js polyfills
import * as process from 'process';
import * as buffer from 'buffer';

window.process = process;
window.Buffer = buffer.Buffer;

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RecipeUploadComponent,
    RecipeSearchComponent,
    RecipeDetailComponent,
    LoadingSpinnerComponent,
    MealPlannerComponent,
    SavedMealPlansComponent,
    SettingsComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    HeaderComponent,
    FooterComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
