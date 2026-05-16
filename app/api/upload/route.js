import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

async function extractPdfText(buffer) {
  // Dynamically import the legacy build (works on Node)
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjs.getDocument({
    data: uint8Array,
    useSystemFonts: true,
    isEvalSupported: false,
    disableFontFace: true,
  });

  const doc = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n\n";
  }

  await doc.cleanup();
  await doc.destroy();
  return fullText.trim();
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large. Max 10 MB." }, { status: 400 });
    if (!file.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "Only PDF files are supported right now." }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();

    let text = "";
    try {
      text = await extractPdfText(arrayBuffer);
    } catch (e) {
      console.error("PDF parse error:", e);
      return NextResponse.json({ error: "Could not read this PDF. It may be scanned, encrypted, or corrupted." }, { status: 400 });
    }

    if (!text || text.length < 20) {
      return NextResponse.json({ error: "This PDF seems to have no readable text. It might be a scanned image — try a text PDF instead." }, { status: 400 });
    }

    const MAX_CHARS = 40000;
    let truncated = false;
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS);
      truncated = true;
    }

    return NextResponse.json({
      filename: file.name,
      size: file.size,
      text,
      truncated,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
