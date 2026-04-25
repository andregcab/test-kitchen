import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionNumber: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id, versionNumber } = await params;
  const vNum = parseInt(versionNumber, 10);

  const recipe = await prisma.recipe.findUnique({ where: { id, userId } });
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { branchId }: { branchId?: string } = await req.json().catch(() => ({}));

  const source = await prisma.recipeVersion.findUnique({
    where: { recipeId_versionNumber: { recipeId: id, versionNumber: vNum } },
  });

  if (!source) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 });
  }

  let targetBranchId = branchId;
  if (!targetBranchId) {
    const defaultBranch = await prisma.recipeBranch.findFirst({
      where: { recipeId: id, isDefault: true },
    });
    targetBranchId = defaultBranch?.id;
  }

  const latest = await prisma.recipeVersion.findFirst({
    where: { recipeId: id },
    orderBy: { versionNumber: 'desc' },
  });
  const nextVersionNumber = (latest?.versionNumber ?? 0) + 1;

  const newVersion = await prisma.recipeVersion.create({
    data: {
      recipeId: id,
      versionNumber: nextVersionNumber,
      changeNote: `Restored from version ${vNum}`,
      data: source.data ?? {},
      branchId: targetBranchId ?? null,
    },
  });

  const sourceData = source.data as { title?: string };

  if (targetBranchId) {
    const branch = await prisma.recipeBranch.update({
      where: { id: targetBranchId },
      data: { currentVersionId: newVersion.id },
    });

    if (branch.isDefault) {
      await prisma.recipe.update({
        where: { id },
        data: { title: sourceData.title ?? undefined, currentVersionId: newVersion.id },
      });
    }
  } else {
    await prisma.recipe.update({
      where: { id },
      data: { title: sourceData.title ?? undefined, currentVersionId: newVersion.id },
    });
  }

  const updated = await prisma.recipe.findUnique({
    where: { id },
    include: { currentVersion: true },
  });

  return NextResponse.json(updated);
}
