import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const recipeId = new URL(req.url).searchParams.get('recipeId');

  const users = await prisma.user.findMany({
    where: { id: { not: userId } },
    select: { id: true, username: true, displayName: true },
    orderBy: { displayName: 'asc' },
  });

  if (!recipeId) {
    return NextResponse.json(users.map((u) => ({ ...u, alreadyShared: false })));
  }

  // Find which users already have a copy of this recipe
  const existingCopies = await prisma.recipe.findMany({
    where: {
      sharedFromRecipeId: recipeId,
      userId: { in: users.map((u) => u.id) },
    },
    select: { userId: true },
  });

  const alreadySharedSet = new Set(existingCopies.map((r) => r.userId));

  return NextResponse.json(
    users.map((u) => ({ ...u, alreadyShared: alreadySharedSet.has(u.id) })),
  );
}
