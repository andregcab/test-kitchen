import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { RecipeData } from '@/lib/types';

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const recipes = await prisma.recipe.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { currentVersion: true },
  });
  return NextResponse.json(recipes);
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const {
    data,
    tags,
    images,
    changeNote,
  }: { data: RecipeData; tags: string[]; images?: string[]; changeNote?: string } =
    await req.json();

  const recipe = await prisma.recipe.create({
    data: {
      userId,
      title: data.title,
      tags: tags ?? [],
      images: images ?? [],
      versions: {
        create: {
          versionNumber: 1,
          changeNote: changeNote ?? 'Initial version',
          data: data as object,
        },
      },
    },
    include: { versions: true },
  });

  const version = recipe.versions[0];

  const branch = await prisma.recipeBranch.create({
    data: {
      recipeId: recipe.id,
      name: 'Original',
      isDefault: true,
      order: 0,
      currentVersionId: version.id,
    },
  });

  await prisma.recipeVersion.update({
    where: { id: version.id },
    data: { branchId: branch.id },
  });

  const updated = await prisma.recipe.update({
    where: { id: recipe.id },
    data: { currentVersionId: version.id },
    include: { currentVersion: true },
  });

  return NextResponse.json(updated, { status: 201 });
}
