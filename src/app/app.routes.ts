import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RecipeUploadComponent } from './components/recipe-upload/recipe-upload.component';
import { RecipeSearchComponent } from './components/recipe-search/recipe-search.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { MealPlannerComponent } from './components/meal-planner/meal-planner.component';
import { SavedMealPlansComponent } from './components/saved-meal-plans/saved-meal-plans.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'upload', component: RecipeUploadComponent, canActivate: [AuthGuard] },
  { path: 'search', component: RecipeSearchComponent, canActivate: [AuthGuard] },
  { path: 'recipe/:id', component: RecipeDetailComponent, canActivate: [AuthGuard] },
  { path: 'meal-planner', component: MealPlannerComponent, canActivate: [AuthGuard] },
  { path: 'saved-meal-plans', component: SavedMealPlansComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
