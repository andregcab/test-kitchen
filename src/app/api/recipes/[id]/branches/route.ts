import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

const MAX_BRANCHES = 5;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({ where: { id, userId } });
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const branches = await prisma.recipeBranch.findMany({
    where: { recipeId: id },
    include: { currentVersion: true },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(branches);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({ where: { id, userId } });
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { name, createdFromVersionId }: { name: string; createdFromVersionId: string } =
    await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const count = await prisma.recipeBranch.count({ where: { recipeId: id } });
  if (count >= MAX_BRANCHES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_BRANCHES} branches per recipe` },
      { status: 422 }
    );
  }

  const sourceVersion = await prisma.recipeVersion.findUnique({
    where: { id: createdFromVersionId },
  });
  if (!sourceVersion) {
    return NextResponse.json({ error: 'Source version not found' }, { status: 404 });
  }

  const maxOrder = await prisma.recipeBranch.aggregate({
    where: { recipeId: id },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const latest = await prisma.recipeVersion.findFirst({
    where: { recipeId: id },
    orderBy: { versionNumber: 'desc' },
  });
  const nextVersionNumber = (latest?.versionNumber ?? 0) + 1;

  const branch = await prisma.$transaction(async (tx) => {
    const newBranch = await tx.recipeBranch.create({
      data: {
        recipeId: id,
        name: name.trim(),
        isDefault: false,
        order: nextOrder,
        createdFromVersionId,
      },
    });

    const newVersion = await tx.recipeVersion.create({
      data: {
        recipeId: id,
        versionNumber: nextVersionNumber,
        changeNote: `Branched from version ${sourceVersion.versionNumber}`,
        data: sourceVersion.data as object,
        branchId: newBranch.id,
      },
    });

    return tx.recipeBranch.update({
      where: { id: newBranch.id },
      data: { currentVersionId: newVersion.id },
      include: { currentVersion: true },
    });
  });

  return NextResponse.json(branch, { status: 201 });
}
