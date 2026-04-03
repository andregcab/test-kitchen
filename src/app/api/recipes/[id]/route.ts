import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RecipeData } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      currentVersion: true,
      versions: { orderBy: { versionNumber: "desc" } },
    },
  });

  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, changeNote }: { data: RecipeData; changeNote?: string } =
    await req.json();

  const existing = await prisma.recipe.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextVersionNumber = (existing.versions[0]?.versionNumber ?? 0) + 1;

  const [version] = await prisma.$transaction([
    prisma.recipeVersion.create({
      data: {
        recipeId: id,
        versionNumber: nextVersionNumber,
        changeNote: changeNote ?? null,
        data: data as object,
      },
    }),
  ]);

  const updated = await prisma.recipe.update({
    where: { id },
    data: {
      title: data.title,
      currentVersionId: version.id,
    },
    include: { currentVersion: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // currentVersionId has a unique constraint — clear it first
  await prisma.recipe.update({
    where: { id },
    data: { currentVersionId: null },
  });
  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
