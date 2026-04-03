import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import RecipeForm from "@/components/RecipeForm";
import { RecipeData } from "@/lib/types";
import BackButton from "@/components/BackButton";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      currentVersion: true,
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
    },
  });

  if (!recipe || !recipe.currentVersion) notFound();

  const data = recipe.currentVersion.data as unknown as RecipeData;
  const nextVersionNumber = (recipe.versions[0]?.versionNumber ?? 0) + 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BackButton href={`/recipes/${id}`} />
        <h1 className="text-2xl font-bold">Edit Recipe</h1>
      </div>

      <RecipeForm
        recipeId={id}
        initialData={data}
        initialTags={recipe.tags}
        versionNumber={nextVersionNumber}
      />
    </div>
  );
}
