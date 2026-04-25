import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; recipeId: string }> },
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id, recipeId } = await params;

  const menu = await prisma.menu.findUnique({ where: { id, userId } });
  if (!menu) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.menu.update({
    where: { id },
    data: { recipes: { connect: { id: recipeId } } },
  });
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; recipeId: string }> },
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id, recipeId } = await params;

  const menu = await prisma.menu.findUnique({ where: { id, userId } });
  if (!menu) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.menu.update({
    where: { id },
    data: { recipes: { disconnect: { id: recipeId } } },
  });
  return new NextResponse(null, { status: 204 });
}
