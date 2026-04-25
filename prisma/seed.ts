import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = process.env.TK_SEED_PASSWORD;
  if (!password) {
    throw new Error('TK_SEED_PASSWORD env var is required');
  }

  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log('User already exists, skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { passwordHash } });
  console.log('User created successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
