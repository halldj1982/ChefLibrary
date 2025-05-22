import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-recipe-search',
  templateUrl: './recipe-search.component.html',
  styleUrls: ['./recipe-search.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent]
})
export class RecipeSearchComponent implements OnInit {
  recipes: Recipe[] = [];
  searchQuery: string = '';
  mealTypes: string[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Appetizer'];
  cuisines: string[] = ['Italian', 'Mexican', 'Chinese', 'Indian', 'American', 'French', 'Japanese', 'Mediterranean', 'Thai', 'Greek'];
  dietaryOptions: string[] = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb'];
  
  selectedMealType: string = '';
  selectedCuisine: string = '';
  selectedDietaryOption: string = '';
  
  isLoading: boolean = false;
  selectedRecipe: Recipe | null = null;
  showModal: boolean = false;
  
  // Add Array to component to make it available in the template
  Array = Array;

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRandomRecipes();
  }

  loadRandomRecipes(): void {
    this.isLoading = true;
    this.recipeService.getRandomRecipes(10).subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading random recipes:', error);
        this.isLoading = false;
      }
    });
  }

  searchRecipes(): void {
    this.isLoading = true;
    
    // Build search query from all inputs
    let fullQuery = this.searchQuery;
    
    if (this.selectedMealType) {
      fullQuery += ` meal type:${this.selectedMealType}`;
    }
    
    if (this.selectedCuisine) {
      fullQuery += ` cuisine:${this.selectedCuisine}`;
    }
    
    if (this.selectedDietaryOption) {
      fullQuery += ` dietary:${this.selectedDietaryOption}`;
    }
    
    this.recipeService.searchRecipes(fullQuery).subscribe({
      next: (result) => {
        this.recipes = result.recipes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching recipes:', error);
        this.isLoading = false;
      }
    });
  }

  openRecipeDetails(recipe: Recipe): void {
    // Ensure dietaryInfo is an array before opening the modal
    if (recipe.dietaryInfo && !Array.isArray(recipe.dietaryInfo)) {
      // Use type assertion to tell TypeScript that dietaryInfo might be a string
      const dietaryInfoStr = recipe.dietaryInfo as unknown as string;
      if (typeof dietaryInfoStr === 'string') {
        recipe.dietaryInfo = dietaryInfoStr.split(',').map(item => item.trim());
      } else {
        recipe.dietaryInfo = [];
      }
    }
    
    this.selectedRecipe = recipe;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRecipe = null;
  }
  
  deleteRecipe(): void {
    if (this.selectedRecipe && this.selectedRecipe.id) {
      this.recipeService.deleteRecipe(this.selectedRecipe.id).subscribe({
        next: () => {
          // Remove the recipe from the current list
          this.recipes = this.recipes.filter(recipe => recipe.id !== this.selectedRecipe?.id);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error deleting recipe:', error);
        }
      });
    }
  }
  
  // Helper method to safely get the first meal type
  getMealType(recipe: Recipe): string {
    if (!recipe.mealType) return '';
    return Array.isArray(recipe.mealType) ? recipe.mealType[0] : recipe.mealType as string;
  }
  
  // Helper method to safely get dietary info as array
  getDietaryInfo(recipe: Recipe): string[] {
    if (!recipe.dietaryInfo) return [];
    if (Array.isArray(recipe.dietaryInfo)) return recipe.dietaryInfo;
    
    // Use type assertion to tell TypeScript that dietaryInfo might be a string
    const dietaryInfoStr = recipe.dietaryInfo as unknown as string;
    if (typeof dietaryInfoStr === 'string') {
      return dietaryInfoStr.split(',').map(item => item.trim());
    }
    return [];
  }
}