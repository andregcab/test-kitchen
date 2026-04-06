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
  const {
    data,
    tags,
    images,
    changeNote,
  }: { data: RecipeData; tags: string[]; images?: string[]; changeNote?: string } = await req.json();

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
      tags: tags ?? [],
      images: images ?? [],
      currentVersionId: version.id,
    },
    include: { currentVersion: true },
  });

  return NextResponse.json(updated);
}

// PATCH — update tags and/or images, no new version
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: { tags?: string[]; images?: string[] } = await req.json();

  const updated = await prisma.recipe.update({
    where: { id },
    data: {
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.images !== undefined && { images: body.images }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.recipe.update({
    where: { id },
    data: { currentVersionId: null },
  });
  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
