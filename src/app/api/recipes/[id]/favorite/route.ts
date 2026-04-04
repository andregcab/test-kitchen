import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.recipe.update({
    where: { id },
    data: { isFavorite: !recipe.isFavorite },
  });

  return NextResponse.json({ isFavorite: updated.isFavorite });
}
