import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function makeSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = await makeSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("[tasks GET] auth error:", authError);
      return Response.json({ error: "auth failed", details: authError.message }, { status: 401 });
    }
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("founder_tasks")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[tasks GET] query error:", error);
      return Response.json({ error: error.message, code: error.code }, { status: 500 });
    }
    return Response.json({ tasks: data || [] });
  } catch (err) {
    console.error("[tasks GET] unexpected:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = await makeSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { tasks, source_chat_id } = await req.json();
    if (!tasks || !tasks.length) return Response.json({ ok: true, inserted: 0 });

    const rows = tasks.map(t => ({
      user_id: user.id,
      task_text: t.task_text,
      priority: t.priority || "med",
      source_chat_id: source_chat_id || null,
    }));

    const { error } = await supabase.from("founder_tasks").insert(rows);
    if (error) {
      console.error("[tasks POST] insert error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ ok: true, inserted: rows.length });
  } catch (err) {
    console.error("[tasks POST] unexpected:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const supabase = await makeSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id, done } = await req.json();
    const { error } = await supabase
      .from("founder_tasks")
      .update({ done, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[tasks PATCH] unexpected:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
