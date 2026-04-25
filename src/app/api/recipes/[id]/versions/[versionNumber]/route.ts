import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function PATCH(
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

  const { changeNote }: { changeNote: string } = await req.json();

  const version = await prisma.recipeVersion.update({
    where: { recipeId_versionNumber: { recipeId: id, versionNumber: vNum } },
    data: { changeNote: changeNote.trim() || null },
  });

  return NextResponse.json(version);
}
