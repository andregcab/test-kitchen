import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const existing = await prisma.menu.findUnique({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;
  const { id } = await params;

  const existing = await prisma.menu.findUnique({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.menu.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
