import Link from "next/link";
import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/recipes"
          className="flex items-center justify-center w-10 h-10 rounded-full text-xl"
          style={{ background: "var(--border)" }}
          aria-label="Back"
        >
          ‹
        </Link>
        <h1 className="text-2xl font-bold">New Recipe</h1>
      </div>

      <RecipeForm />
    </div>
  );
}
