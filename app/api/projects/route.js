import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: list all non-archived projects
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .eq("archived", false)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[projects GET]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ projects: data || [] });
  } catch (err) {
    console.error("[projects GET] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST: create new project
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, description, emoji } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: name.trim().slice(0, 80),
        description: (description || "").slice(0, 500),
        emoji: emoji || "📁",
      })
      .select()
      .single();

    if (error) {
      console.error("[projects POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ project: data });
  } catch (err) {
    console.error("[projects POST] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH: rename / edit project
export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, name, description, emoji, archived } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const update = { updated_at: new Date().toISOString() };
    if (name !== undefined) update.name = name.trim().slice(0, 80);
    if (description !== undefined) update.description = (description || "").slice(0, 500);
    if (emoji !== undefined) update.emoji = emoji;
    if (archived !== undefined) update.archived = archived;

    const { error } = await supabase
      .from("projects")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[projects PATCH]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[projects PATCH] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE: hard delete (chats become standalone since project_id is ON DELETE SET NULL)
export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[projects DELETE]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[projects DELETE] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
