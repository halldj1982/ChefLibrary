import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { MealPlan } from '../models/meal-plan.model';
import { Recipe } from '../models/recipe.model';
import { OpenAIService } from './openai.service';
import { RecipeService } from './recipe.service';
import { DynamoDBService } from './dynamodb.service';

@Injectable({
  providedIn: 'root'
})
export class MealPlanService {
  constructor(
    private openaiService: OpenAIService,
    private recipeService: RecipeService,
    private dynamoDbService: DynamoDBService
  ) {}

  /**
   * Generate a meal plan based on natural language query
   * @param query Natural language query
   * @returns Observable with meal plan and recipes
   */
  generateMealPlan(query: string): Observable<{mealPlan: MealPlan, recipes: Recipe[]}> {
    // Step 1: Get all available recipes
    return this.recipeService.getRandomRecipes(100).pipe(
      switchMap(recipes => {
        // Step 2: Use OpenAI to analyze the query and create a meal plan
        const recipeData = recipes.map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          mealType: recipe.mealType,
          cuisine: recipe.cuisine,
          dietaryInfo: recipe.dietaryInfo,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime
        }));
        
        return this.openaiService.generateMealPlan(query, recipeData).pipe(
          map(response => {
            // Step 3: Create meal plan object
            const mealPlan: MealPlan = {
              id: uuidv4(),
              name: '',  // Will be filled by user
              summary: response.summary,
              reasoning: response.reasoning,
              features: response.features,
              meals: response.meals.map(meal => ({
                timeSlot: meal.timeSlot,
                recipeId: meal.recipeId
              })),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            // Step 4: Get full recipe details for the selected recipes
            const selectedRecipes = recipes.filter(recipe => 
              response.meals.some(meal => meal.recipeId === recipe.id)
            );
            
            return { mealPlan, recipes: selectedRecipes };
          })
        );
      })
    );
  }

  /**
   * Adjust an existing meal plan based on natural language query
   * @param query Natural language query
   * @param currentPlan Current meal plan
   * @param currentRecipes Current recipes in the meal plan
   * @returns Observable with updated meal plan and recipes
   */
  adjustMealPlan(
    query: string, 
    currentPlan: MealPlan, 
    currentRecipes: Recipe[]
  ): Observable<{mealPlan: MealPlan, recipes: Recipe[]}> {
    // Get additional recipes to consider for adjustments
    return this.recipeService.getRandomRecipes(50).pipe(
      switchMap(additionalRecipes => {
        // Combine current recipes with additional ones, removing duplicates
        const allRecipeIds = new Set(currentRecipes.map(r => r.id));
        const uniqueAdditionalRecipes = additionalRecipes.filter(r => !allRecipeIds.has(r.id));
        const allRecipes = [...currentRecipes, ...uniqueAdditionalRecipes];
        
        // Format recipe data for OpenAI
        const recipeData = allRecipes.map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          mealType: recipe.mealType,
          cuisine: recipe.cuisine,
          dietaryInfo: recipe.dietaryInfo,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime
        }));
        
        // Send current plan and adjustment query to OpenAI
        return this.openaiService.adjustMealPlan(query, currentPlan, recipeData).pipe(
          map(response => {
            // Update meal plan with adjustments
            const updatedPlan: MealPlan = {
              ...currentPlan,
              summary: response.summary,
              reasoning: response.reasoning,
              features: response.features,
              meals: response.meals.map(meal => ({
                timeSlot: meal.timeSlot,
                recipeId: meal.recipeId
              })),
              updatedAt: new Date().toISOString()
            };
            
            // Get full recipe details for the selected recipes
            const selectedRecipes = allRecipes.filter(recipe => 
              response.meals.some(meal => meal.recipeId === recipe.id)
            );
            
            return { mealPlan: updatedPlan, recipes: selectedRecipes };
          })
        );
      })
    );
  }

  /**
   * Save meal plan to DynamoDB
   * @param mealPlan Meal plan to save
   * @returns Observable with saved meal plan
   */
  saveMealPlan(mealPlan: MealPlan): Observable<MealPlan> {
    return this.dynamoDbService.saveMealPlan(mealPlan);
  }

  /**
   * Get all saved meal plans
   * @returns Observable with all meal plans
   */
  getAllMealPlans(): Observable<MealPlan[]> {
    return this.dynamoDbService.getAllMealPlans();
  }

  /**
   * Get meal plan by ID
   * @param id Meal plan ID
   * @returns Observable with meal plan
   */
  getMealPlan(id: string): Observable<MealPlan> {
    return this.dynamoDbService.getMealPlan(id);
  }

  /**
   * Delete meal plan
   * @param id Meal plan ID
   * @returns Observable with operation result
   */
  deleteMealPlan(id: string): Observable<any> {
    return this.dynamoDbService.deleteMealPlan(id);
  }
}