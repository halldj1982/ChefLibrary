export interface MealPlan {
  id: string;
  name: string;
  summary: string;
  reasoning: string;
  features: string[];
  meals: {
    timeSlot: string;
    recipeId: string;
  }[];
  createdAt: string;
  updatedAt: string;
}