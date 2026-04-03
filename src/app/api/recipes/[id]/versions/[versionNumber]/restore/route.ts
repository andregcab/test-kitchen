import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; versionNumber: string }> }
) {
  const { id, versionNumber } = await params;
  const vNum = parseInt(versionNumber, 10);

  const source = await prisma.recipeVersion.findUnique({
    where: { recipeId_versionNumber: { recipeId: id, versionNumber: vNum } },
  });

  if (!source) {
    return NextResponse.json({ error: "Version not found" }, { status: 404 });
  }

  const latest = await prisma.recipeVersion.findFirst({
    where: { recipeId: id },
    orderBy: { versionNumber: "desc" },
  });

  const nextVersionNumber = (latest?.versionNumber ?? 0) + 1;

  const newVersion = await prisma.recipeVersion.create({
    data: {
      recipeId: id,
      versionNumber: nextVersionNumber,
      changeNote: `Restored from version ${vNum}`,
      data: source.data ?? {},
    },
  });

  const sourceData = source.data as { title?: string };
  const updated = await prisma.recipe.update({
    where: { id },
    data: {
      title: sourceData.title ?? undefined,
      currentVersionId: newVersion.id,
    },
  });

  return NextResponse.json(updated);
}
