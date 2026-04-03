import { describe, it, expect } from "vitest";
import { diffRecipes } from "./diff";
import { RecipeData } from "./types";

const base: RecipeData = {
  title: "Chocolate Cake",
  description: "Rich and moist",
  sourceUrl: null,
  sourceType: "manual",
  servings: 8,
  prepTime: 20,
  cookTime: 35,
  ingredients: [
    { amount: "2", unit: "cups", name: "flour", notes: "" },
    { amount: "1", unit: "cup", name: "sugar", notes: "" },
    { amount: "3", unit: "tbsp", name: "cocoa powder", notes: "" },
  ],
  instructions: [
    { step: 1, text: "Mix dry ingredients." },
    { step: 2, text: "Add wet ingredients and stir." },
  ],
  tags: ["dessert", "chocolate"],
  notes: "",
};

describe("diffRecipes", () => {
  it("returns no changes for identical recipes", () => {
    const changes = diffRecipes(base, { ...base });
    expect(changes).toHaveLength(0);
  });

  it("detects a changed scalar field", () => {
    const updated = { ...base, servings: 10 };
    const changes = diffRecipes(base, updated);
    const match = changes.find((c) => c.field === "Servings");
    expect(match).toBeDefined();
    expect(match?.kind).toBe("changed");
    expect(match?.from).toBe("8");
    expect(match?.to).toBe("10");
  });

  it("detects a changed ingredient amount", () => {
    const updated = {
      ...base,
      ingredients: base.ingredients.map((i) =>
        i.name === "sugar" ? { ...i, amount: "¾" } : i
      ),
    };
    const changes = diffRecipes(base, updated);
    const match = changes.find((c) => c.field === "Ingredient" && c.kind === "changed");
    expect(match).toBeDefined();
    expect(match?.from).toContain("1 cup sugar");
    expect(match?.to).toContain("¾ cup sugar");
  });

  it("detects an added ingredient", () => {
    const updated = {
      ...base,
      ingredients: [
        ...base.ingredients,
        { amount: "1", unit: "tsp", name: "vanilla extract", notes: "" },
      ],
    };
    const changes = diffRecipes(base, updated);
    const match = changes.find((c) => c.field === "Ingredient" && c.kind === "added");
    expect(match).toBeDefined();
    expect(match?.to).toContain("vanilla extract");
  });

  it("detects a removed ingredient", () => {
    const updated = {
      ...base,
      ingredients: base.ingredients.filter((i) => i.name !== "cocoa powder"),
    };
    const changes = diffRecipes(base, updated);
    const match = changes.find((c) => c.field === "Ingredient" && c.kind === "removed");
    expect(match).toBeDefined();
    expect(match?.from).toContain("cocoa powder");
  });

  it("detects a changed instruction", () => {
    const updated = {
      ...base,
      instructions: base.instructions.map((i) =>
        i.step === 1 ? { ...i, text: "Sift and mix dry ingredients." } : i
      ),
    };
    const changes = diffRecipes(base, updated);
    const match = changes.find((c) => c.field === "Instruction" && c.kind === "changed");
    expect(match).toBeDefined();
    expect(match?.to).toContain("Sift");
  });

  it("detects added and removed tags", () => {
    const updated = { ...base, tags: ["dessert", "birthday"] };
    const changes = diffRecipes(base, updated);
    const added = changes.find((c) => c.field === "Tag" && c.kind === "added");
    const removed = changes.find((c) => c.field === "Tag" && c.kind === "removed");
    expect(added?.to).toBe("birthday");
    expect(removed?.from).toBe("chocolate");
  });

  it("detects a title change", () => {
    const updated = { ...base, title: "Double Chocolate Cake" };
    const changes = diffRecipes(base, updated);
    const match = changes.find((c) => c.field === "Title");
    expect(match?.kind).toBe("changed");
    expect(match?.from).toBe("Chocolate Cake");
    expect(match?.to).toBe("Double Chocolate Cake");
  });
});
