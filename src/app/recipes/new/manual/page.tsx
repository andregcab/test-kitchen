import RecipeForm from "@/components/RecipeForm";
import BackButton from "@/components/BackButton";

export default function ManualNewRecipePage() {
  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-4 mb-8">
        <BackButton href="/recipes/new" />
        <div>
          <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600 }}>
            Type it in
          </h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '15px' }}>
            Enter your recipe from scratch
          </p>
        </div>
      </div>
      <RecipeForm />
    </div>
  );
}
