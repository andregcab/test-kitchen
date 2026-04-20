import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import RecipeForm from '@/components/RecipeForm';
import { RecipeData } from '@/lib/types';
import BackButton from '@/components/BackButton';

export const dynamic = 'force-dynamic';

export default async function EditRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ branch?: string }>;
}) {
  const { id } = await params;
  const { branch: branchParam } = await searchParams;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      currentVersion: true,
      versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
      menus: { select: { id: true } },
      branches: {
        include: { currentVersion: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!recipe) notFound();

  // Resolve active branch and its current version
  const activeBranch = branchParam
    ? recipe.branches.find((b) => b.id === branchParam)
    : recipe.branches.find((b) => b.isDefault);

  const activeVersion = activeBranch?.currentVersion ?? recipe.currentVersion;
  if (!activeVersion) notFound();

  const data = activeVersion.data as unknown as RecipeData;
  const nextVersionNumber = (recipe.versions[0]?.versionNumber ?? 0) + 1;

  const backHref = activeBranch && !activeBranch.isDefault
    ? `/recipes/${id}?branch=${activeBranch.id}`
    : `/recipes/${id}`;

  const branchLabel = activeBranch && !activeBranch.isDefault
    ? ` — ${activeBranch.name}`
    : '';

  return (
    <div className="px-[150px] py-8">
      <div className="flex items-center gap-3 mb-8">
        <BackButton href={backHref} />
        <h1 className="text-2xl font-bold">Edit Recipe{branchLabel}</h1>
      </div>

      <RecipeForm
        recipeId={id}
        branchId={activeBranch?.id}
        initialData={data}
        initialTags={recipe.tags}
        initialImages={recipe.images}
        versionNumber={nextVersionNumber}
      />
    </div>
  );
}
