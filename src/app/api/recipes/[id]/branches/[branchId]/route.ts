import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id, branchId } = await params;

  const recipe = await prisma.recipe.findUnique({ where: { id, userId } });
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { name }: { name: string } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const branch = await prisma.recipeBranch.update({
    where: { id: branchId, recipeId: id },
    data: { name: name.trim() },
  });

  return NextResponse.json(branch);
}
