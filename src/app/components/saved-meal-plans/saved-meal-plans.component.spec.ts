import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedMealPlansComponent } from './saved-meal-plans.component';

describe('SavedMealPlansComponent', () => {
  let component: SavedMealPlansComponent;
  let fixture: ComponentFixture<SavedMealPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedMealPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedMealPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
