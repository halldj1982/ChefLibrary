import { Recipe } from './recipe.model';

export interface SearchResult {
  recipes: Recipe[];
  totalCount: number;
  page: number;
  pageSize: number;
}