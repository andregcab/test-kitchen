import { NextRequest, NextResponse } from "next/server";
import { importFromUrl } from "@/lib/import/url";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_url" },
      { status: 400 }
    );
  }

  const result = await importFromUrl(url);
  return NextResponse.json(result);
}
