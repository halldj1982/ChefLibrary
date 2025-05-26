import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private apiUrl = 'https://api.openai.com/v1';
  private headers: HttpHeaders;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.envService.openaiApiKey}`
    });
  }

  /**
   * Extract text from an image using OpenAI's Vision API
   * @param imageBase64 Base64 encoded image
   * @returns Observable with extracted text
   */
  extractTextFromImage(imageBase64: string): Observable<string> {
    const payload = {
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the complete recipe from this image. Include title, ingredients, instructions, and any other relevant information like cooking time, servings, etc."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    };

    return this.http.post(`${this.apiUrl}/chat/completions`, payload, { headers: this.headers })
      .pipe(
        map((response: any) => response.choices[0].message.content)
      );
  }

  /**
   * Analyze recipe text to extract structured data
   * @param recipeText Raw recipe text
   * @returns Observable with structured recipe data
   */
  analyzeRecipe(recipeText: string): Observable<any> {
    const payload = {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes recipe text and extracts structured information."
        },
        {
          role: "user",
          content: `Analyze this recipe text and return a JSON object with the following properties: 
          title, ingredients (as array), instructions (as array), prepTime, cookTime, totalTime, servings, 
          cuisine, mealType (breakfast, lunch, dinner, snack, etc.), dietaryInfo (vegetarian, vegan, gluten-free, etc.).
          
          Recipe text:
          ${recipeText}`
        }
      ],
      response_format: { type: "json_object" }
    };

    return this.http.post(`${this.apiUrl}/chat/completions`, payload, { headers: this.headers })
      .pipe(
        map((response: any) => {
          const content = response.choices[0].message.content;
          return JSON.parse(content);
        })
      );
  }

  /**
   * Generate embedding for recipe text for vector search
   * @param text Recipe text to embed
   * @returns Observable with embedding array
   */
  generateEmbedding(text: string): Observable<number[]> {
    const payload = {
      model: "text-embedding-3-small",
      input: text
    };

    return this.http.post(`${this.apiUrl}/embeddings`, payload, { headers: this.headers })
      .pipe(
        map((response: any) => {
          const embedding = response.data[0].embedding;
          
          // Validate embedding
          if (!Array.isArray(embedding) || embedding.length === 0) {
            console.error("Invalid embedding received from OpenAI:", embedding);
            throw new Error("Failed to generate valid embedding from OpenAI");
          }
          
          console.log(`Generated embedding with length: ${embedding.length}`);
          return embedding;
        })
      );
  }

  /**
   * Generate meal plan based on natural language query and available recipes
   * @param query Natural language query
   * @param availableRecipes Available recipes to include in the meal plan
   * @returns Observable with generated meal plan
   */
  generateMealPlan(query: string, availableRecipes: any[]): Observable<any> {
    const payload = {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a meal planning assistant. Create a meal plan based on the user's request using ONLY the provided recipes.
          For each meal, select an appropriate recipe from the available recipes list and assign it to a time slot.
          Return a JSON object with the following structure:
          {
            "summary": "One line summary of the meal plan",
            "reasoning": "Explanation of why these recipes were selected",
            "features": ["Feature 1", "Feature 2", ...],
            "meals": [
              {
                "timeSlot": "Breakfast Day 1",
                "recipeId": "recipe-id-1"
              },
              ...
            ]
          }`
        },
        {
          role: "user",
          content: `Create a meal plan based on this request: "${query}"
          
          Available recipes:
          ${JSON.stringify(availableRecipes)}`
        }
      ],
      response_format: { type: "json_object" }
    };

    return this.http.post(`${this.apiUrl}/chat/completions`, payload, { headers: this.headers })
      .pipe(
        map((response: any) => {
          const content = response.choices[0].message.content;
          return JSON.parse(content);
        })
      );
  }

  /**
   * Adjust an existing meal plan based on natural language query
   * @param query Natural language query for adjustment
   * @param currentPlan Current meal plan
   * @param availableRecipes Available recipes to include in the meal plan
   * @returns Observable with adjusted meal plan
   */
  adjustMealPlan(query: string, currentPlan: any, availableRecipes: any[]): Observable<any> {
    const payload = {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a meal planning assistant. Adjust the provided meal plan based on the user's request using ONLY the provided recipes.
          Return a JSON object with the following structure:
          {
            "summary": "One line summary of the adjusted meal plan",
            "reasoning": "Explanation of why these changes were made",
            "features": ["Feature 1", "Feature 2", ...],
            "meals": [
              {
                "timeSlot": "Breakfast Day 1",
                "recipeId": "recipe-id-1"
              },
              ...
            ]
          }`
        },
        {
          role: "user",
          content: `Adjust this meal plan based on this request: "${query}"
          
          Current meal plan:
          ${JSON.stringify(currentPlan)}
          
          Available recipes:
          ${JSON.stringify(availableRecipes)}`
        }
      ],
      response_format: { type: "json_object" }
    };

    return this.http.post(`${this.apiUrl}/chat/completions`, payload, { headers: this.headers })
      .pipe(
        map((response: any) => {
          const content = response.choices[0].message.content;
          return JSON.parse(content);
        })
      );
  }
}