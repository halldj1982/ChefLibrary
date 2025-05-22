import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';
import { MealPlan } from '../models/meal-plan.model';
import { EnvironmentService } from './environment.service';
import * as AWS from 'aws-sdk';

@Injectable({
  providedIn: 'root'
})
export class DynamoDBService {
  private docClient: AWS.DynamoDB.DocumentClient;
  private recipeTable: string;
  private mealPlanTable: string;

  constructor(private envService: EnvironmentService) {
    this.recipeTable = this.envService.dynamoDbTable;
    this.mealPlanTable = `${this.envService.dynamoDbTable}-meal-plans`;
    
    AWS.config.update({
      region: this.envService.myAwsRegion,
      accessKeyId: this.envService.myAwsAccessKeyId,
      secretAccessKey: this.envService.myAwsSecretAccessKey
    });
    this.docClient = new AWS.DynamoDB.DocumentClient();
  }

  /**
   * Save recipe to DynamoDB
   * @param recipe Recipe object to save
   * @returns Observable with saved recipe
   */
  saveRecipe(recipe: Recipe): Observable<Recipe> {
    const params = {
      TableName: this.recipeTable,
      Item: {
        ...recipe,
        recipeId: recipe.id, // Using title as recipeId partition key
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    return from(this.docClient.put(params).promise())
      .pipe(
        map(() => recipe)
      );
  }

  /**
   * Get recipe by ID
   * @param id Recipe ID
   * @returns Observable with recipe
   */
  getRecipe(id: string): Observable<Recipe> {
    const params = {
      TableName: this.recipeTable,
      Key: { recipeId: id }
    };

    return from(this.docClient.get(params).promise())
      .pipe(
        map((result) => result.Item as Recipe)
      );
  }

  /**
   * Get all recipes
   * @returns Observable with array of recipes
   */
  getAllRecipes(): Observable<Recipe[]> {
    const params = {
      TableName: this.recipeTable
    };

    return from(this.docClient.scan(params).promise())
      .pipe(
        map((result) => result.Items as Recipe[] || [])
      );
  }

  /**
   * Get recipes by IDs
   * @param ids Array of recipe IDs
   * @returns Observable with array of recipes
   */
  getRecipesByIds(ids: string[]): Observable<Recipe[]> {
    if (!ids.length) {
      return from([[]]);
    }

    const batchGetParams = {
      RequestItems: {
        [this.recipeTable]: {
          Keys: ids.map(id => ({ recipeId: id }))
        }
      }
    };

    return from(this.docClient.batchGet(batchGetParams).promise())
      .pipe(
        map((result) => result.Responses?.[this.recipeTable] as Recipe[] || [])
      );
  }

  /**
   * Update recipe
   * @param recipe Recipe object to update
   * @returns Observable with updated recipe
   */
  updateRecipe(recipe: Recipe): Observable<Recipe> {
    const params = {
      TableName: this.recipeTable,
      Item: {
        ...recipe,
        recipeId: recipe.title, // Ensure recipeId is set on update
        updatedAt: new Date().toISOString()
      }
    };

    return from(this.docClient.put(params).promise())
      .pipe(
        map(() => recipe)
      );
  }

  /**
   * Delete recipe
   * @param id Recipe ID to delete
   * @returns Observable with operation result
   */
  deleteRecipe(id: string): Observable<any> {
    const params = {
      TableName: this.recipeTable,
      Key: { recipeId: id }
    };

    return from(this.docClient.delete(params).promise());
  }

  /**
   * Save meal plan
   * @param mealPlan Meal plan object to save
   * @returns Observable with saved meal plan
   */
  saveMealPlan(mealPlan: MealPlan): Observable<MealPlan> {
    const params = {
      TableName: this.mealPlanTable,
      Item: {
        ...mealPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    return from(this.docClient.put(params).promise())
      .pipe(
        map(() => mealPlan)
      );
  }

  /**
   * Get meal plan by ID
   * @param id Meal plan ID
   * @returns Observable with meal plan
   */
  getMealPlan(id: string): Observable<MealPlan> {
    const params = {
      TableName: this.mealPlanTable,
      Key: { id }
    };

    return from(this.docClient.get(params).promise())
      .pipe(
        map((result) => result.Item as MealPlan)
      );
  }

  /**
   * Get all meal plans
   * @returns Observable with array of meal plans
   */
  getAllMealPlans(): Observable<MealPlan[]> {
    const params = {
      TableName: this.mealPlanTable
    };

    return from(this.docClient.scan(params).promise())
      .pipe(
        map((result) => result.Items as MealPlan[] || [])
      );
  }

  /**
   * Delete meal plan
   * @param id Meal plan ID to delete
   * @returns Observable with operation result
   */
  deleteMealPlan(id: string): Observable<any> {
    const params = {
      TableName: this.mealPlanTable,
      Key: { id }
    };

    return from(this.docClient.delete(params).promise());
  }
}