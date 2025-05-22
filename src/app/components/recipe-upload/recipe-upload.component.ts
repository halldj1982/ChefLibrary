import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-upload',
  templateUrl: './recipe-upload.component.html',
  styleUrls: ['./recipe-upload.component.scss'],
  standalone: true,
  imports: [FormsModule, NgIf, NgClass, LoadingSpinnerComponent]
})
export class RecipeUploadComponent {
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isLoading = false;
  errorMessage = '';
  uploadProgress = 0;
  processingStep = '';
  
  // Duplicate recipe handling
  showDuplicateModal = false;
  extractedRecipe: Recipe | null = null;
  existingRecipeId: string | null = null;

  constructor(
    private recipeService: RecipeService,
    private router: Router
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.previewImage();
    }
  }

  previewImage(): void {
    if (!this.selectedFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  uploadRecipe(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select an image to upload.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.uploadProgress = 10;
    this.processingStep = 'Reading image...';

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      
      this.uploadProgress = 30;
      this.processingStep = 'Extracting text from image...';
      
      // First extract the recipe and check for duplicates
      this.recipeService.extractRecipeFromImage(base64String).subscribe({
        next: (result) => {
          this.uploadProgress = 70;
          this.processingStep = 'Checking for duplicates...';
          
          const { recipe, existingRecipes } = result;
          this.extractedRecipe = recipe;
          
          // Check if there are any existing recipes with the same title
          if (existingRecipes && existingRecipes.length > 0) {
            this.existingRecipeId = existingRecipes[0].id;
            this.showDuplicateModal = true;
            this.isLoading = false;
          } else {
            // No duplicates, proceed with saving
            this.saveNewRecipe(recipe);
          }
        },
        error: (error) => {
          console.error('Error extracting recipe:', error);
          this.errorMessage = 'Failed to extract recipe. Please try again.';
          this.isLoading = false;
          this.uploadProgress = 0;
        }
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  // Save a new recipe (no duplicates)
  saveNewRecipe(recipe: Recipe): void {
    this.isLoading = true;
    this.uploadProgress = 80;
    this.processingStep = 'Saving recipe...';
    
    this.recipeService.saveRecipe(recipe).subscribe({
      next: (savedRecipe) => {
        this.uploadProgress = 100;
        this.processingStep = 'Recipe saved successfully!';
        this.isLoading = false;
        
        // Navigate to the recipe detail page
        setTimeout(() => {
          this.router.navigate(['/recipe', savedRecipe.id]);
        }, 1000);
      },
      error: (error) => {
        console.error('Error saving recipe:', error);
        this.errorMessage = 'Failed to save recipe. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Replace existing recipe
  replaceRecipe(): void {
    if (!this.extractedRecipe || !this.existingRecipeId) return;
    
    this.showDuplicateModal = false;
    this.isLoading = true;
    this.uploadProgress = 80;
    this.processingStep = 'Replacing existing recipe...';
    
    this.recipeService.replaceRecipe(this.extractedRecipe, this.existingRecipeId).subscribe({
      next: (savedRecipe) => {
        this.uploadProgress = 100;
        this.processingStep = 'Recipe replaced successfully!';
        this.isLoading = false;
        
        // Navigate to the recipe detail page
        setTimeout(() => {
          this.router.navigate(['/recipe', savedRecipe.id]);
        }, 1000);
      },
      error: (error) => {
        console.error('Error replacing recipe:', error);
        this.errorMessage = 'Failed to replace recipe. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Add as new recipe despite duplicate title
  addAsNew(): void {
    if (!this.extractedRecipe) return;
    
    this.showDuplicateModal = false;
    this.saveNewRecipe(this.extractedRecipe);
  }

  // Cancel upload
  cancelUpload(): void {
    this.showDuplicateModal = false;
    this.extractedRecipe = null;
    this.existingRecipeId = null;
    this.resetForm();
  }

  resetForm(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.errorMessage = '';
    this.uploadProgress = 0;
    this.processingStep = '';
  }
}