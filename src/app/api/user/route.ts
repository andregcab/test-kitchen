import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  const { displayName } = await req.json();

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: { displayName: displayName?.trim() || null },
  });

  return NextResponse.json({ displayName: user.displayName });
}
