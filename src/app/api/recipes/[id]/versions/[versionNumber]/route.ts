import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; versionNumber: string }> }
) {
  const { id, versionNumber } = await params;
  const vNum = parseInt(versionNumber, 10);
  const { changeNote }: { changeNote: string } = await req.json();

  const version = await prisma.recipeVersion.update({
    where: { recipeId_versionNumber: { recipeId: id, versionNumber: vNum } },
    data: { changeNote: changeNote.trim() || null },
  });

  return NextResponse.json(version);
}
