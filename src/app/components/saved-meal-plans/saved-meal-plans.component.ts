import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MealPlan } from '../../models/meal-plan.model';
import { MealPlanService } from '../../services/meal-plan.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-saved-meal-plans',
  templateUrl: './saved-meal-plans.component.html',
  styleUrls: ['./saved-meal-plans.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent]
})
export class SavedMealPlansComponent implements OnInit {
  mealPlans: MealPlan[] = [];
  isLoading: boolean = false;

  constructor(private mealPlanService: MealPlanService) {}

  ngOnInit(): void {
    this.loadMealPlans();
  }

  loadMealPlans(): void {
    this.isLoading = true;
    this.mealPlanService.getAllMealPlans().subscribe({
      next: (plans) => {
        this.mealPlans = plans;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading meal plans:', error);
        this.isLoading = false;
      }
    });
  }

  deleteMealPlan(id: string): void {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      this.isLoading = true;
      this.mealPlanService.deleteMealPlan(id).subscribe({
        next: () => {
          this.mealPlans = this.mealPlans.filter(plan => plan.id !== id);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting meal plan:', error);
          this.isLoading = false;
        }
      });
    }
  }
}