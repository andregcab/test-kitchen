import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({ where: { id, userId } });
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.recipe.update({
    where: { id },
    data: { isFavorite: !recipe.isFavorite },
  });

  return NextResponse.json({ isFavorite: updated.isFavorite });
}
