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
    branchId,
  }: { data: RecipeData; tags: string[]; images?: string[]; changeNote?: string; branchId?: string } = await req.json();

  const existing = await prisma.recipe.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Resolve which branch to save to
  let targetBranchId = branchId;
  if (!targetBranchId) {
    const defaultBranch = await prisma.recipeBranch.findFirst({
      where: { recipeId: id, isDefault: true },
    });
    targetBranchId = defaultBranch?.id;
  }

  const nextVersionNumber = (existing.versions[0]?.versionNumber ?? 0) + 1;

  const version = await prisma.recipeVersion.create({
    data: {
      recipeId: id,
      versionNumber: nextVersionNumber,
      changeNote: changeNote ?? null,
      data: data as object,
      branchId: targetBranchId ?? null,
    },
  });

  // Update the branch's currentVersionId
  if (targetBranchId) {
    const branch = await prisma.recipeBranch.update({
      where: { id: targetBranchId },
      data: { currentVersionId: version.id },
    });

    // If saving to the default branch, also update Recipe.currentVersionId
    if (branch.isDefault) {
      await prisma.recipe.update({
        where: { id },
        data: {
          title: data.title,
          tags: tags ?? [],
          images: images ?? [],
          currentVersionId: version.id,
        },
      });
    } else {
      // Non-default branch: still update title/tags/images on the recipe
      await prisma.recipe.update({
        where: { id },
        data: {
          tags: tags ?? [],
          images: images ?? [],
        },
      });
    }
  } else {
    // Fallback: no branch context, update recipe directly
    await prisma.recipe.update({
      where: { id },
      data: {
        title: data.title,
        tags: tags ?? [],
        images: images ?? [],
        currentVersionId: version.id,
      },
    });
  }

  const updated = await prisma.recipe.findUnique({
    where: { id },
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
