import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username?.trim() || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  if (username.trim().length < 2 || username.trim().length > 30) {
    return NextResponse.json({ error: 'Username must be 2–30 characters' }, { status: 400 });
  }

  if (/\s/.test(username.trim())) {
    return NextResponse.json({ error: 'Username cannot contain spaces' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (existing) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username: username.trim(), passwordHash },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true }, { status: 201 });
}
