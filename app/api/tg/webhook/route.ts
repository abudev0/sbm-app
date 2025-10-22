import { handleUpdate } from "@/lib/bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 10;

function log(meta: Record<string, unknown>) {
  console.log("[tg-webhook]", JSON.stringify(meta));
}

export async function POST(req: Request) {
  try {
    const res = await handleUpdate(req);

    log({ level: "info", ok: res.status < 400, status: res.status });

    return res;
  } catch (err) {
    log({ level: "error", err: err instanceof Error ? err.message : String(err) });
    return new Response("internal_error", { status: 500 });
  }
}

export async function GET() {
  return new Response("OK");
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}