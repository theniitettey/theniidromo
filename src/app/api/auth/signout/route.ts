import { clearSession } from "@/lib/session";

export async function POST(): Promise<Response> {
  await clearSession();
  return Response.json({ ok: true });
}
