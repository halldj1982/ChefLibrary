import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RecipeUploadComponent } from './components/recipe-upload/recipe-upload.component';
import { RecipeSearchComponent } from './components/recipe-search/recipe-search.component';
import { RecipeDetailComponent } from './components/recipe-detail/recipe-detail.component';
import { MealPlannerComponent } from './components/meal-planner/meal-planner.component';
import { SavedMealPlansComponent } from './components/saved-meal-plans/saved-meal-plans.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'upload', component: RecipeUploadComponent },
  { path: 'search', component: RecipeSearchComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'meal-planner', component: MealPlannerComponent },
  { path: 'saved-meal-plans', component: SavedMealPlansComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];