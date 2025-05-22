export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: number;
  cuisine?: string;
  mealType?: string[];
  dietaryInfo?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  imageUrl?: string;
  sourceUrl?: string;
  extractedText?: string;
  createdAt: string;
  updatedAt: string;
  embedding?: number[];
}