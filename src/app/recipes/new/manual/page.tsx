import Link from "next/link";
import RecipeForm from "@/components/RecipeForm";

export default function ManualNewRecipePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/recipes/new"
          className="flex items-center justify-center w-11 h-11 rounded-full text-lg leading-none flex-shrink-0"
          style={{ background: "var(--border)" }}
          aria-label="Back"
        >
          ‹
        </Link>
        <h1 className="text-2xl font-bold">Type it in</h1>
      </div>

      <RecipeForm />
    </div>
  );
}
