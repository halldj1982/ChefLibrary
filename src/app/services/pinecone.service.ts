import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe.model';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class PineconeService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = this.envService.pineconeApiUrl;
  }

  /**
   * Store recipe embedding in Pinecone via Lambda
   * @param recipe Recipe object with embedding
   * @returns Observable with operation result
   */
  storeEmbedding(recipe: Recipe): Observable<any> {
    if (!recipe.embedding) {
      throw new Error('Recipe embedding is required');
    }

    return this.http.post(this.apiUrl, {
      action: 'store',
      recipe: {
        id: recipe.id,
        title: recipe.title,
        cuisine: recipe.cuisine,
        mealType: recipe.mealType,
        dietaryInfo: recipe.dietaryInfo,
        ingredients: recipe.ingredients,
        embedding: recipe.embedding
      }
    });
  }

  /**
   * Search for similar recipes using vector similarity with optional filters via Lambda
   * @param embedding Query embedding
   * @param limit Number of results to return
   * @param filters Optional filters for cuisine, mealType, and dietaryInfo
   * @returns Observable with search results
   */
  searchSimilarRecipes(
    embedding: number[],
    limit: number = 10,
    filters?: {
      cuisine?: string,
      mealType?: string,
      dietaryInfo?: string
    }): Observable<any> {
      console.log("Calling Pinecone Lambda Api at url " + this.apiUrl);
    return this.http.post(this.apiUrl, {
      action: 'search',
      embedding,
      limit,
      filters
    });
  }

  /**
   * Find recipes by title
   * @param title Recipe title to search for
   * @returns Observable with search results
   */
  findRecipesByTitle(title: string): Observable<any> {
    return this.http.post(this.apiUrl, {
      action: 'search',
      title
    });
  }

  /**
   * Delete recipe embedding from Pinecone via Lambda
   * @param recipeId Recipe ID to delete
   * @returns Observable with operation result
   */
  deleteEmbedding(recipeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}?recipeId=${recipeId}`);
  }
}