import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const { userId } = auth;

  const { id: recipeId } = await params;
  const { recipientId }: { recipientId: string } = await req.json();

  if (!recipientId) {
    return NextResponse.json({ error: 'recipientId is required' }, { status: 400 });
  }

  const [recipe, sender, recipient] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { currentVersion: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { displayName: true, username: true } }),
    prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } }),
  ]);

  if (!recipe || recipe.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!recipient) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
  }
  if (!recipe.currentVersion) {
    return NextResponse.json({ error: 'Recipe has no version data' }, { status: 400 });
  }

  const senderName = sender?.displayName || sender?.username || 'Someone';
  const attribution = `Shared by ${senderName}`;

  const extraTags = ['shared', `from ${senderName}`];
  const mergedTags = Array.from(new Set([...recipe.tags, ...extraTags]));

  const copy = await prisma.recipe.create({
    data: {
      userId: recipientId,
      title: recipe.title,
      tags: mergedTags,
      images: recipe.images,
      sourceAttribution: attribution,
      sharedFromRecipeId: recipeId,
      versions: {
        create: {
          versionNumber: 1,
          changeNote: attribution,
          data: recipe.currentVersion.data as object,
        },
      },
    },
    include: { versions: true },
  });

  const version = copy.versions[0];

  const branch = await prisma.recipeBranch.create({
    data: {
      recipeId: copy.id,
      name: 'Original',
      isDefault: true,
      order: 0,
      currentVersionId: version.id,
    },
  });

  await prisma.recipeVersion.update({
    where: { id: version.id },
    data: { branchId: branch.id },
  });

  await prisma.recipe.update({
    where: { id: copy.id },
    data: { currentVersionId: version.id },
  });

  return NextResponse.json({ ok: true, recipeId: copy.id }, { status: 201 });
}
