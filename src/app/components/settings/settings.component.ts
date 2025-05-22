import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SettingsComponent {
  isLoading = false;
  message = '';
  isError = false;

  constructor(private recipeService: RecipeService) {}

  reindexAllRecipes(): void {
    this.isLoading = true;
    this.message = '';
    this.isError = false;
    
    this.recipeService.reindexAllRecipes().subscribe({
      next: (result) => {
        this.isLoading = false;
        this.message = 'All recipes reindexed successfully!';
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        this.message = 'Error reindexing recipes: ' + error.message;
        console.error('Error reindexing recipes:', error);
      }
    });
  }

  clearAllRecipes(): void {
    if (!confirm('Are you sure you want to delete ALL recipes? This action cannot be undone.')) {
      return;
    }
    
    this.isLoading = true;
    this.message = '';
    this.isError = false;
    
    this.recipeService.clearAllRecipes().subscribe({
      next: (result) => {
        this.isLoading = false;
        this.message = 'All recipes deleted successfully!';
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        this.message = 'Error deleting recipes: ' + error.message;
        console.error('Error deleting recipes:', error);
      }
    });
  }
}