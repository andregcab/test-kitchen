import RecipeForm from "@/components/RecipeForm";
import BackButton from "@/components/BackButton";

export default function ManualNewRecipePage() {
  return (
    <div className="px-[150px] py-8">
      <div className="flex items-center gap-3 mb-8">
        <BackButton href="/recipes/new" />
        <h1 className="text-2xl font-bold">Type it in</h1>
      </div>

      <RecipeForm />
    </div>
  );
}
