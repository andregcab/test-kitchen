export type SourceType = "manual" | "url" | "photo" | "pdf";

export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
  notes: string;
  metricAmount?: string;
  metricUnit?: string;
}

export interface Instruction {
  step: number;
  text: string;
}

export interface RecipeData {
  title: string;
  description: string;
  source: string | null;
  sourceType: SourceType;
  servings: number | null;
  prepTime: number | null;
  cookTime: number | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
  notes: string;
}

export const emptyRecipeData = (): RecipeData => ({
  title: "",
  description: "",
  source: null,
  sourceType: "manual",
  servings: null,
  prepTime: null,
  cookTime: null,
  ingredients: [],
  instructions: [],
  notes: "",
});
