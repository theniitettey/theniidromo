import { NextRequest, NextResponse } from "next/server";
import { incrementPostView, getPostViews } from "@/lib/interactions-db";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const count = await incrementPostView(slug);
  return NextResponse.json({ count });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const count = await getPostViews(slug);
  return NextResponse.json({ count });
}
