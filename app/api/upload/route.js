import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SarvamAIClient } from "sarvamai";
import JSZip from "jszip";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export const runtime = "nodejs";
export const maxDuration = 60;

// === Extract text from text-based PDFs (fast path) ===
async function extractTextWithPdfjs(buffer) {
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

// === Extract text from scanned PDFs via Sarvam Vision (powerful path) ===
async function extractTextWithSarvamVision(buffer, filename) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error("Sarvam API key not configured");

  // Write buffer to a temporary file (SDK expects a file path)
  const tmpDir = await mkdtemp(join(tmpdir(), "forge-pdf-"));
  const inputPath = join(tmpDir, filename || "input.pdf");
  const outputPath = join(tmpDir, "output.zip");
  await writeFile(inputPath, buffer);

  let job;
  try {
    const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });

    job = await client.documentIntelligence.createJob({
      language: "en-IN",
      outputFormat: "md",
    });

    await job.uploadFile(inputPath);
    await job.start();
    const status = await job.waitUntilComplete();

    if (status.job_state !== "Completed" && status.job_state !== "PartiallyCompleted") {
      throw new Error(`OCR job failed with state: ${status.job_state}`);
    }

    await job.downloadOutput(outputPath);

    // Read the ZIP file
    const zipBuffer = await readFile(outputPath);
    const zip = await JSZip.loadAsync(zipBuffer);

    let extractedText = "";

    // Look for the JSON file first (most structured)
    const jsonFile = Object.keys(zip.files).find((name) => name.endsWith(".json"));
    if (jsonFile) {
      const jsonContent = await zip.files[jsonFile].async("string");
      try {
        const parsed = JSON.parse(jsonContent);
        // Try common shapes: { pages: [{ text: ... }] } or array of page objects
        if (Array.isArray(parsed.pages)) {
          extractedText = parsed.pages
            .map((p) => p.text || p.content || p.markdown || "")
            .join("\n\n");
        } else if (Array.isArray(parsed)) {
          extractedText = parsed.map((p) => p.text || p.content || "").join("\n\n");
        }
      } catch (e) {
        console.error("JSON parse failed, will try MD files:", e);
      }
    }

    // Fallback: read all .md files from the ZIP
    if (!extractedText || extractedText.length < 20) {
      const mdFiles = Object.keys(zip.files).filter((name) => name.endsWith(".md"));
      for (const fname of mdFiles) {
        const content = await zip.files[fname].async("string");
        extractedText += content + "\n\n";
      }
    }

    // Last resort: read everything text-like
    if (!extractedText || extractedText.length < 20) {
      for (const fname of Object.keys(zip.files)) {
        if (!zip.files[fname].dir) {
          const content = await zip.files[fname].async("string");
          extractedText += content + "\n\n";
        }
      }
    }

    return extractedText.trim();
  } finally {
    // Clean up temp files
    try {
      await unlink(inputPath);
    } catch {}
    try {
      await unlink(outputPath);
    } catch {}
  }
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
    const buffer = Buffer.from(arrayBuffer);

    let text = "";
    let method = "text";

    // === STEP 1: Try fast text extraction first ===
    try {
      text = await extractTextWithPdfjs(arrayBuffer);
    } catch (e) {
      console.error("pdfjs failed (will try Sarvam Vision):", e.message);
    }

    // === STEP 2: If no text, fall back to Sarvam Vision OCR ===
    if (!text || text.length < 30) {
      console.log("Scanned PDF detected — using Sarvam Vision OCR");
      try {
        text = await extractTextWithSarvamVision(buffer, file.name);
        method = "ocr";
      } catch (e) {
        console.error("Sarvam Vision OCR failed:", e);
        return NextResponse.json(
          { error: "Could not read this PDF. It might be too large (max 10 pages), encrypted, or corrupted. Try a smaller text-based PDF." },
          { status: 400 }
        );
      }
    }

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: "We could not extract any text from this PDF. Try a different file." },
        { status: 400 }
      );
    }

    // Truncate to keep within Sarvam token limits
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
      method,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
