const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);

  if (req.method === "GET") {
    return new Response(STORE_HTML, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const action = body.action;

    if (action === "get_catalog") {
      return Response.json({ ok: true, catalog: CATALOG }, { headers: corsHeaders });
    }

    return Response.json({ ok: false, error: "unknown action" }, { status: 400, headers: corsHeaders });
  }

  return new Response("Not found", { status: 404 });
});
