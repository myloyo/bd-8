// Database entity types
export interface Country {
  id_country: number;
  name_country: string;
}

export interface Human {
  id_user: number;
  name_user: string;
  email: string;
  age: string; // Date string
  id_country: number;
  sex: string;
}

export interface Season {
  id_season: number;
  name_season: string;
}

export interface Chief {
  id_chief: number;
  name_chief: string;
  id_country: number;
  exp_years: number;
}

export interface DishType {
  id_group: number;
  type: string;
}

export interface Dish {
  id_dish: number;
  name_dish: string;
  id_season: number;
  id_country: number;
  id_group: number;
  id_rate: number | null;
  id_chief: number;
}

export interface DishRating {
  id_rate: number;
  id_user: number;
  id_dish: number;
  rate: number;
  comment: string;
  date: string; // Date string
}

export interface Product {
  id_prod: number;
  name_product: string;
  calories: number;
  cost_product: number;
  id_season: number;
}

export interface Recipe {
  id_dish: number;
  id_product: number;
  gramms: number;
}

export interface Order {
  id_order: number;
  id_dish: number;
  id_user: number;
  date: string; // Date string
}

// Extended types with related data
export interface DishWithDetails extends Dish {
  seasonName?: string;
  countryName?: string;
  typeName?: string;
  chiefName?: string;
  avgRating?: number;
}

export interface RecipeWithDetails extends Recipe {
  productName?: string;
  calories?: number;
  cost_product?: number;
}

export interface OrderWithDetails extends Order {
  dishName?: string;
  userName?: string;
}

export interface DishRatingWithDetails extends DishRating {
  userName?: string;
  dishName?: string;
}

// User roles
export type UserRole = 'admin' | 'user';

// Auth context type
export interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

// Search parameters
export interface SearchParams {
  table: string;
  query: string;
  fields: string[];
}

// Function result types
export interface ProcedureResult {
  success: boolean;
  message: string;
  data?: any;
}
