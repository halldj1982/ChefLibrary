import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MealPlan } from '../../models/meal-plan.model';
import { Recipe } from '../../models/recipe.model';
import { MealPlanService } from '../../services/meal-plan.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-meal-planner',
  templateUrl: './meal-planner.component.html',
  styleUrls: ['./meal-planner.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent]
})
export class MealPlannerComponent {
  planQuery: string = '';
  adjustmentQuery: string = '';
  mealPlan: MealPlan | null = null;
  recipes: Recipe[] = [];
  isLoading: boolean = false;
  isAdjusting: boolean = false;

  constructor(
    private mealPlanService: MealPlanService,
    private router: Router
  ) {}

  generateMealPlan(): void {
    if (!this.planQuery.trim()) return;
    
    this.isLoading = true;
    this.mealPlanService.generateMealPlan(this.planQuery).subscribe({
      next: (result) => {
        this.mealPlan = result.mealPlan;
        this.recipes = result.recipes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating meal plan:', error);
        this.isLoading = false;
      }
    });
  }

  adjustMealPlan(): void {
    if (!this.adjustmentQuery.trim() || !this.mealPlan) return;
    
    this.isAdjusting = true;
    this.mealPlanService.adjustMealPlan(
      this.adjustmentQuery, 
      this.mealPlan, 
      this.recipes
    ).subscribe({
      next: (result) => {
        this.mealPlan = result.mealPlan;
        this.recipes = result.recipes;
        this.isAdjusting = false;
        this.adjustmentQuery = '';
      },
      error: (error) => {
        console.error('Error adjusting meal plan:', error);
        this.isAdjusting = false;
      }
    });
  }

  saveMealPlan(): void {
    if (!this.mealPlan || !this.mealPlan.name) return;
    
    this.isLoading = true;
    this.mealPlanService.saveMealPlan(this.mealPlan).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/saved-meal-plans']);
      },
      error: (error) => {
        console.error('Error saving meal plan:', error);
        this.isLoading = false;
      }
    });
  }

  cancelPlan(): void {
    this.mealPlan = null;
    this.recipes = [];
    this.planQuery = '';
  }

  getRecipeForMeal(meal: any): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === meal.recipeId);
  }

  // Helper method to safely get the first meal type
  getMealType(recipe: Recipe): string {
    if (!recipe.mealType) return '';
    return Array.isArray(recipe.mealType) ? recipe.mealType[0] : recipe.mealType as string;
  }
}