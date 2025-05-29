import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Recipe } from '../../models/recipe.model';
import { RecipeService } from '../../services/recipe.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent]
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const recipeId = params.get('id');
      if (recipeId) {
        this.loadRecipe(recipeId);
      } else {
        this.error = 'Recipe ID not found';
        this.isLoading = false;
      }
    });
  }

  loadRecipe(id: string): void {
    this.isLoading = true;
    this.recipeService.getRecipe(id).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading recipe:', error);
        this.error = 'Failed to load recipe. It may have been deleted or does not exist.';
        this.isLoading = false;
      }
    });
  }

  deleteRecipe(): void {
    if (this.recipe && this.recipe.id) {
      if (confirm('Are you sure you want to delete this recipe?')) {
        this.isLoading = true;
        this.recipeService.deleteRecipe(this.recipe.id).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/search']);
          },
          error: (error) => {
            console.error('Error deleting recipe:', error);
            this.error = 'Failed to delete recipe';
            this.isLoading = false;
          }
        });
      }
    }
  }
  
  goBack(): void {
    this.router.navigate(['/search']);
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
