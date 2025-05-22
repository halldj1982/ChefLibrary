import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe } from '../models/recipe.model';
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class PineconeService {
  private pinecone: Pinecone;
  private index: any;
  private namespace: any;

  constructor(private envService: EnvironmentService) {
    this.pinecone = new Pinecone({
      apiKey: this.envService.pineconeApiKey
    });
    this.index = this.pinecone.index(this.envService.pineconeIndex).namespace(this.envService.pineconeNamespace);
  }

  /**
   * Store recipe embedding in Pinecone
   * @param recipe Recipe object with embedding
   * @returns Observable with operation result
   */
  storeEmbedding(recipe: Recipe): Observable<any> {
    if (!recipe.embedding) {
      throw new Error('Recipe embedding is required');
    }

    // Process arrays for proper metadata storage
    const mealTypeArray = Array.isArray(recipe.mealType) ? recipe.mealType : 
                         (recipe.mealType ? [recipe.mealType] : []);
    
    const dietaryInfoArray = Array.isArray(recipe.dietaryInfo) ? recipe.dietaryInfo : 
                            (recipe.dietaryInfo ? String(recipe.dietaryInfo).split(',').map(item => item.trim()) : []);

    const record: PineconeRecord = {
      id: recipe.id,
      values: recipe.embedding,
      metadata: {
        title: recipe.title,
        cuisine: recipe.cuisine || '',
        mealType: Array.isArray(recipe.mealType) ? recipe.mealType.join(',') : String(recipe.mealType || ''),
        dietaryInfo: Array.isArray(recipe.dietaryInfo) ? recipe.dietaryInfo.join(',') : String(recipe.dietaryInfo || ''),
        ingredients: recipe.ingredients.join(',')
      }
    };

    console.log('Storing recipe with metadata:', JSON.stringify(record.metadata));
    return from(this.index.upsert([record]));
  }

  /**
   * Search for similar recipes using vector similarity
   * @param embedding Query embedding
   * @param limit Number of results to return
   * @returns Observable with search results
   */
  /**
   * Search for similar recipes using vector similarity with optional filters
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
    }
  ): Observable<any> {
    const queryParams: any = {
      vector: embedding,
      topK: limit,
      includeMetadata: true,
      includeValues: false
    };

    // Add filters if provided
    if (filters) {
      // Log the filters for debugging
      console.log('Applying filters:', JSON.stringify(filters));
      
      // Simple approach: just use the original fields with string matching
      const filterConditions: any = {};
      
      if (filters.cuisine) {
        // Use case-insensitive string matching for cuisine
        filterConditions.cuisine = { $eq: filters.cuisine };
      }
      
      if (filters.mealType) {
        // Use exact match for meal type
        filterConditions.mealType = { $eq: filters.mealType };
      }
      
      if (filters.dietaryInfo) {
        // Use exact match for dietary info
        filterConditions.dietaryInfo = { $eq: filters.dietaryInfo };
      }
      
      // Only add filter if at least one condition is specified
      if (Object.keys(filterConditions).length > 0) {
        queryParams.filter = filterConditions;
      }
      
      // Log the final query params for debugging
      console.log('Query params:', JSON.stringify(queryParams));
    }

    return from(this.index.query(queryParams)).pipe(
      map((response: any) => response.matches)
    );
  }

  /**
   * Check if a recipe with the given title exists
   * @param title Recipe title to check
   * @returns Observable with matching recipes
   */
  findRecipesByTitle(title: string): Observable<any> {
    // Create a dummy vector of the right dimension (1536 for OpenAI embeddings)
    const dummyVector = new Array(1536).fill(0);
    
    return from(this.index.query({
      vector: dummyVector,
      filter: { title: { $eq: title } },
      topK: 10,
      includeMetadata: true,
      includeValues: false
    })).pipe(
      map((response: any) => response.matches)
    );
  }

  /**
   * Delete recipe embedding from Pinecone
   * @param recipeId Recipe ID to delete
   * @returns Observable with operation result
   */
  deleteEmbedding(recipeId: string): Observable<any> {
    return from(this.index.deleteOne(recipeId));
  }
}