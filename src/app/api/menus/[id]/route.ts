import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json(
      { error: 'Name required' },
      { status: 400 },
    );
  }
  const menu = await prisma.menu.update({
    where: { id },
    data: { name: name.trim() },
  });
  return NextResponse.json(menu);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.menu.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
