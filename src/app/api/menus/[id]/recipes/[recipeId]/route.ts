import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; recipeId: string }> },
) {
  const { id, recipeId } = await params;
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
  const { id, recipeId } = await params;
  await prisma.menu.update({
    where: { id },
    data: { recipes: { disconnect: { id: recipeId } } },
  });
  return new NextResponse(null, { status: 204 });
}
