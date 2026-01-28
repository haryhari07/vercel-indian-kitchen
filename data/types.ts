export interface Ingredient {
  item: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  state: string;
  region: string; // e.g., North, South, East, West
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl: string; // Placeholder for now
  dietary: string[]; // e.g., Vegetarian, Vegan, Gluten-Free
  rating?: number; // 0-5
  reviewCount?: number;
}

export interface State {
  name: string;
  slug: string;
  region: string;
  description: string;
  imageUrl: string;
}

export interface MealPlate {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  items: string[]; // List of dishes in the plate
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
}
