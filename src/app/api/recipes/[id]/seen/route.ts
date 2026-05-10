import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { id } = await params;

  await prisma.recipe.updateMany({
    where: { id, userId, seenAt: null },
    data: { seenAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
