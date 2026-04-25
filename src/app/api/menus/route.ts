import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const menus = await prisma.menu.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { recipes: true } } },
  });
  return NextResponse.json(menus);
}

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name required' }, { status: 400 });
  }

  const menu = await prisma.menu.create({
    data: { userId, name: name.trim() },
  });
  return NextResponse.json(menu, { status: 201 });
}
