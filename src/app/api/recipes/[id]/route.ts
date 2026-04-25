import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { RecipeData } from '@/lib/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id, userId },
    include: {
      currentVersion: true,
      versions: { orderBy: { versionNumber: 'desc' } },
    },
  });

  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const {
    data,
    tags,
    images,
    changeNote,
    branchId,
  }: { data: RecipeData; tags: string[]; images?: string[]; changeNote?: string; branchId?: string } =
    await req.json();

  const existing = await prisma.recipe.findUnique({
    where: { id, userId },
    include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
  });

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let targetBranchId = branchId;
  if (!targetBranchId) {
    const defaultBranch = await prisma.recipeBranch.findFirst({
      where: { recipeId: id, isDefault: true },
    });
    targetBranchId = defaultBranch?.id;
  }

  const nextVersionNumber = (existing.versions[0]?.versionNumber ?? 0) + 1;

  const version = await prisma.recipeVersion.create({
    data: {
      recipeId: id,
      versionNumber: nextVersionNumber,
      changeNote: changeNote ?? null,
      data: data as object,
      branchId: targetBranchId ?? null,
    },
  });

  if (targetBranchId) {
    const branch = await prisma.recipeBranch.update({
      where: { id: targetBranchId },
      data: { currentVersionId: version.id },
    });

    if (branch.isDefault) {
      await prisma.recipe.update({
        where: { id },
        data: { title: data.title, tags: tags ?? [], images: images ?? [], currentVersionId: version.id },
      });
    } else {
      await prisma.recipe.update({
        where: { id },
        data: { tags: tags ?? [], images: images ?? [] },
      });
    }
  } else {
    await prisma.recipe.update({
      where: { id },
      data: { title: data.title, tags: tags ?? [], images: images ?? [], currentVersionId: version.id },
    });
  }

  const updated = await prisma.recipe.findUnique({
    where: { id },
    include: { currentVersion: true },
  });

  return NextResponse.json(updated);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const body: { tags?: string[]; images?: string[] } = await req.json();

  const existing = await prisma.recipe.findUnique({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.recipe.update({
    where: { id },
    data: {
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.images !== undefined && { images: body.images }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const existing = await prisma.recipe.findUnique({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.recipe.update({ where: { id }, data: { currentVersionId: null } });
  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
