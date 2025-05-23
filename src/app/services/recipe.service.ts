import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Recipe } from '../models/recipe.model';
import { SearchResult } from '../models/search-result.model';
import { OpenAIService } from './openai.service';
import { PineconeService } from './pinecone.service';
import { DynamoDBService } from './dynamodb.service';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  constructor(
    private openaiService: OpenAIService,
    private pineconeService: PineconeService,
    private dynamoDbService: DynamoDBService
  ) {}

  /**
   * Check if a recipe with the same title already exists
   * @param title Recipe title to check
   * @returns Observable with matching recipes
   */
  checkRecipeExists(title: string): Observable<any[]> {
    console.log("Checking of recipe exists...")
    return this.pineconeService.findRecipesByTitle(title);
  }

  /**
   * Process recipe from image with duplicate checking
   * @param imageBase64 Base64 encoded image
   * @returns Observable with processed recipe and existence check
   */
  extractRecipeFromImage(imageBase64: string): Observable<{recipe: Recipe, existingRecipes: any[]}> {
    // Step 1: Extract text from image
    return this.openaiService.extractTextFromImage(imageBase64).pipe(
      switchMap(extractedText => {
        // Step 2: Analyze recipe text
        return this.openaiService.analyzeRecipe(extractedText).pipe(
          map(analyzedRecipe => {
            // Create recipe object
            const recipe: Recipe = {
              id: uuidv4(),
              title: analyzedRecipe.title,
              ingredients: analyzedRecipe.ingredients,
              instructions: analyzedRecipe.instructions,
              prepTime: analyzedRecipe.prepTime,
              cookTime: analyzedRecipe.cookTime,
              totalTime: analyzedRecipe.totalTime,
              servings: analyzedRecipe.servings,
              cuisine: analyzedRecipe.cuisine,
              mealType: analyzedRecipe.mealType,
              dietaryInfo: analyzedRecipe.dietaryInfo,
              extractedText: extractedText,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            return recipe;
          })
        );
      }),
      switchMap(recipe => {
        // Step 3: Generate embedding for the recipe
        const recipeText = `${recipe.title} ${recipe.ingredients.join(' ')} ${recipe.instructions.join(' ')}`;
        return this.openaiService.generateEmbedding(recipeText).pipe(
          map(embedding => {
            recipe.embedding = embedding;
            return recipe;
          })
        );
      }),
      switchMap(recipe => {
        // Step 4: Check if recipe with same title exists
        return this.checkRecipeExists(recipe.title).pipe(
          map(existingRecipes => {
            return { recipe, existingRecipes };
          })
        );
      })
    );
  }

  /**
   * Save recipe to database
   * @param recipe Recipe to save
   * @returns Observable with saved recipe
   */
  saveRecipe(recipe: Recipe): Observable<Recipe> {
    return forkJoin([
      this.dynamoDbService.saveRecipe(recipe),
      this.pineconeService.storeEmbedding(recipe)
    ]).pipe(
      map(() => recipe)
    );
  }

  /**
   * Replace existing recipe with new one
   * @param newRecipe New recipe
   * @param existingRecipeId ID of existing recipe to replace
   * @returns Observable with saved recipe
   */
  replaceRecipe(newRecipe: Recipe, existingRecipeId: string): Observable<Recipe> {
    return this.deleteRecipe(existingRecipeId).pipe(
      switchMap(() => this.saveRecipe(newRecipe))
    );
  }

  /**
   * Process recipe from image
   * @param imageBase64 Base64 encoded image
   * @returns Observable with processed recipe
   */
  processRecipeFromImage(imageBase64: string): Observable<Recipe> {
    // Step 1: Extract text from image
    return this.openaiService.extractTextFromImage(imageBase64).pipe(
      switchMap(extractedText => {
        console.log(extractedText);
        // Step 2: Analyze recipe text
        return this.openaiService.analyzeRecipe(extractedText).pipe(
          map(analyzedRecipe => {
            // Create recipe object
            const recipe: Recipe = {
              id: uuidv4(),
              title: analyzedRecipe.title,
              ingredients: analyzedRecipe.ingredients,
              instructions: analyzedRecipe.instructions,
              prepTime: analyzedRecipe.prepTime,
              cookTime: analyzedRecipe.cookTime,
              totalTime: analyzedRecipe.totalTime,
              servings: analyzedRecipe.servings,
              cuisine: analyzedRecipe.cuisine,
              mealType: analyzedRecipe.mealType,
              dietaryInfo: analyzedRecipe.dietaryInfo,
              extractedText: extractedText,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            return recipe;
          })
        );
      }),
      switchMap(recipe => {
        // Step 3: Generate embedding for the recipe
        const recipeText = `${recipe.title} ${recipe.ingredients.join(' ')} ${recipe.instructions.join(' ')}`;
        return this.openaiService.generateEmbedding(recipeText).pipe(
          map(embedding => {
            recipe.embedding = embedding;
            return recipe;
          })
        );
      }),
      switchMap(recipe => {
        // Step 4: Save recipe to DynamoDB and Pinecone
        console.log("Passed to dynamoDB and Pinecone: " + recipe);
        return forkJoin([
          this.dynamoDbService.saveRecipe(recipe),
          this.pineconeService.storeEmbedding(recipe)
        ]).pipe(
          map(() => recipe)
        );
      })
    );
  }

  /**
   * Search recipes by natural language query
   * @param query Search query
   * @param limit Number of results to return
   * @returns Observable with search results
   */
  searchRecipes(query: string, limit: number = 10): Observable<SearchResult> {
    // Step 1: Parse query for filters
    const filters: {
      cuisine?: string,
      mealType?: string,
      dietaryInfo?: string
    } = {};
    
    let cleanQuery = query;
    
    // Extract cuisine filter
    const cuisineMatch = query.match(/cuisine:([^\s]+)/i);
    if (cuisineMatch && cuisineMatch[1]) {
      filters.cuisine = cuisineMatch[1];
      cleanQuery = cleanQuery.replace(cuisineMatch[0], '').trim();
    }
    
    // Extract meal type filter - handle spaces in meal type values
    const mealTypeMatch = query.match(/meal type:([^\s]+)/i);
    if (mealTypeMatch && mealTypeMatch[1]) {
      filters.mealType = mealTypeMatch[1];
      cleanQuery = cleanQuery.replace(mealTypeMatch[0], '').trim();
    }
    
    // Extract dietary filter
    const dietaryMatch = query.match(/dietary:([^\s]+)/i);
    if (dietaryMatch && dietaryMatch[1]) {
      filters.dietaryInfo = dietaryMatch[1];
      cleanQuery = cleanQuery.replace(dietaryMatch[0], '').trim();
    }
    
    console.log("Search Recipes Query: " + cleanQuery);
    console.log("Filters:", JSON.stringify(filters));
    
    // Step 2: Generate embedding for the clean query
    return this.openaiService.generateEmbedding(cleanQuery).pipe(
      switchMap(embedding => {
        // Step 3: Search similar recipes in Pinecone with filters
        console.log("Embedding: " + embedding);
        return this.pineconeService.searchSimilarRecipes(embedding, limit, filters).pipe(
          switchMap(matches => {
            console.log("Matches: " + JSON.stringify(matches));
            if (!matches.length) {
              return of({
                recipes: [],
                totalCount: 0,
                page: 1,
                pageSize: limit
              });
            }
            
            // Step 4: Get full recipe details from DynamoDB
            const recipeIds = matches.map((match: any) => match.id);
            console.log("Recipe IDs: " + recipeIds);
            return this.dynamoDbService.getRecipesByIds(recipeIds).pipe(
              map(recipes => {
                // Sort recipes in the same order as the matches
                const sortedRecipes = recipeIds.map(id => 
                  recipes.find(recipe => recipe.id === id)
                ).filter(recipe => recipe !== undefined) as Recipe[];
                
                return {
                  recipes: sortedRecipes,
                  totalCount: sortedRecipes.length,
                  page: 1,
                  pageSize: limit
                };
              })
            );
          })
        );
      }),
      catchError(error => {
        console.error('Error searching recipes:', error);
        return of({
          recipes: [],
          totalCount: 0,
          page: 1,
          pageSize: limit
        });
      })
    );
  }

  /**
   * Get random recipes
   * @param limit Number of recipes to return
   * @returns Observable with random recipes
   */
  getRandomRecipes(limit: number = 10): Observable<Recipe[]> {
    return this.dynamoDbService.getAllRecipes().pipe(
      map(recipes => {
        // Shuffle array and take first 'limit' items
        const shuffled = [...recipes].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
      }),
      catchError(error => {
        console.error('Error getting random recipes:', error);
        return of([]);
      })
    );
  }

  /**
   * Get recipe by ID
   * @param id Recipe ID
   * @returns Observable with recipe
   */
  getRecipe(id: string): Observable<Recipe> {
    return this.dynamoDbService.getRecipe(id);
  }

  /**
   * Update recipe
   * @param recipe Recipe to update
   * @returns Observable with updated recipe
   */
  updateRecipe(recipe: Recipe): Observable<Recipe> {
    return this.dynamoDbService.updateRecipe(recipe).pipe(
      switchMap(() => {
        // Update embedding in Pinecone if recipe text changed
        if (recipe.embedding) {
          return this.pineconeService.storeEmbedding(recipe).pipe(
            map(() => recipe)
          );
        }
        return of(recipe);
      })
    );
  }
  
  /**
   * Reindex all recipes in Pinecone
   * This is useful when the metadata structure changes
   * @returns Observable with operation result
   */
  reindexAllRecipes(): Observable<any> {
    return this.dynamoDbService.getAllRecipes().pipe(
      switchMap(recipes => {
        console.log(`Reindexing ${recipes.length} recipes`);
        
        // Process recipes in batches to avoid overwhelming Pinecone
        const batchSize = 10;
        const batches: Recipe[][] = [];
        
        for (let i = 0; i < recipes.length; i += batchSize) {
          const batch = recipes.slice(i, i + batchSize);
          batches.push(batch);
        }
        
        // Process each batch sequentially
        return batches.reduce<Observable<any>>((acc, batch) => {
          return acc.pipe(
            switchMap(() => {
              const operations = batch.map(recipe => {
                if (!recipe.embedding) {
                  // Generate embedding if missing
                  const recipeText = `${recipe.title} ${recipe.ingredients.join(' ')} ${recipe.instructions.join(' ')}`;
                  return this.openaiService.generateEmbedding(recipeText).pipe(
                    switchMap(embedding => {
                      recipe.embedding = embedding;
                      return this.pineconeService.storeEmbedding(recipe);
                    })
                  );
                } else {
                  // Use existing embedding
                  return this.pineconeService.storeEmbedding(recipe);
                }
              });
              
              return forkJoin(operations);
            })
          );
        }, of(null));
      }),
      map(() => ({ success: true, message: 'All recipes reindexed successfully' })),
      catchError(error => {
        console.error('Error reindexing recipes:', error);
        return of({ success: false, message: 'Error reindexing recipes', error });
      })
    );
  }

  /**
   * Delete recipe
   * @param id Recipe ID to delete
   * @returns Observable with operation result
   */
  deleteRecipe(id: string): Observable<any> {
    return forkJoin([
      this.dynamoDbService.deleteRecipe(id),
      this.pineconeService.deleteEmbedding(id)
    ]);
  }
  
  /**
   * Clear all recipes from both databases
   * @returns Observable with operation result
   */
  clearAllRecipes(): Observable<any> {
    return this.dynamoDbService.getAllRecipes().pipe(
      switchMap(recipes => {
        if (recipes.length === 0) {
          return of({ success: true, message: 'No recipes to delete' });
        }
        
        const deleteOperations = recipes.map(recipe => this.deleteRecipe(recipe.id));
        return forkJoin(deleteOperations).pipe(
          map(() => ({ success: true, message: `Deleted ${recipes.length} recipes` }))
        );
      }),
      catchError(error => {
        console.error('Error clearing recipes:', error);
        return of({ success: false, message: 'Error clearing recipes', error });
      })
    );
  }
}