import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MAX_BRANCHES = 5;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const branches = await prisma.recipeBranch.findMany({
    where: { recipeId: id },
    include: { currentVersion: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(branches);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, createdFromVersionId }: { name: string; createdFromVersionId: string } =
    await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Enforce branch limit
  const count = await prisma.recipeBranch.count({ where: { recipeId: id } });
  if (count >= MAX_BRANCHES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_BRANCHES} branches per recipe` },
      { status: 422 }
    );
  }

  // Get the source version's data to seed the new branch's first version
  const sourceVersion = await prisma.recipeVersion.findUnique({
    where: { id: createdFromVersionId },
  });
  if (!sourceVersion) {
    return NextResponse.json({ error: "Source version not found" }, { status: 404 });
  }

  const sourceData = sourceVersion.data as { title?: string };

  // Find the next order and version number
  const maxOrder = await prisma.recipeBranch.aggregate({
    where: { recipeId: id },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const latest = await prisma.recipeVersion.findFirst({
    where: { recipeId: id },
    orderBy: { versionNumber: "desc" },
  });
  const nextVersionNumber = (latest?.versionNumber ?? 0) + 1;

  // Create the branch and its first version in a transaction
  const branch = await prisma.$transaction(async (tx) => {
    const newBranch = await tx.recipeBranch.create({
      data: {
        recipeId: id,
        name: name.trim(),
        isDefault: false,
        order: nextOrder,
        createdFromVersionId,
      },
    });

    const newVersion = await tx.recipeVersion.create({
      data: {
        recipeId: id,
        versionNumber: nextVersionNumber,
        changeNote: `Branched from version ${sourceVersion.versionNumber}`,
        data: sourceVersion.data as object,
        branchId: newBranch.id,
      },
    });

    return tx.recipeBranch.update({
      where: { id: newBranch.id },
      data: { currentVersionId: newVersion.id },
      include: { currentVersion: true },
    });
  });

  // Update Recipe.title if source data has it (for display consistency)
  if (sourceData.title) {
    // Don't update Recipe.title — non-default branches don't own the recipe title
  }

  return NextResponse.json(branch, { status: 201 });
}
