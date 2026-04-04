import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const menus = await prisma.menu.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { recipes: true } } },
  });
  return NextResponse.json(menus);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json(
      { error: 'Name required' },
      { status: 400 },
    );
  }
  const menu = await prisma.menu.create({
    data: { name: name.trim() },
  });
  return NextResponse.json(menu, { status: 201 });
}
