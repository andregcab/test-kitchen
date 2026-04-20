import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
  const { id, branchId } = await params;
  const { name }: { name: string } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const branch = await prisma.recipeBranch.update({
    where: { id: branchId, recipeId: id },
    data: { name: name.trim() },
  });

  return NextResponse.json(branch);
}
