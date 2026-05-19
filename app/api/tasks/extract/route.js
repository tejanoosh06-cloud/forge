export async function POST(req) {
  const { message, chat_id } = await req.json();
  if (!message || message.length < 30) return Response.json({ tasks: [], reason: "message too short" });

  const prompt = `Extract action items from this AI response. Return ONLY a JSON object with a "tasks" array.

Rules:
- Extract 1-3 CONCRETE actions (not vague advice)
- Each task: short (under 10 words), starts with a verb
- Priority: "high" / "med" / "low"
- If no clear actions exist, return {"tasks": []}
- NO explanation, NO markdown, ONLY raw JSON

AI Response to analyze:
"""
${message.slice(0, 2000)}
"""

Output ONLY this format (no other text):
{"tasks":[{"task_text":"...","priority":"med"}]}`;

  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      console.error("[extract] Missing SARVAM_API_KEY");
      return Response.json({ tasks: [], reason: "missing api key" });
    }

    const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.3,
        reasoning_effort: "low",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[extract] Sarvam API error:", res.status, errText);
      return Response.json({ tasks: [], reason: `sarvam ${res.status}` });
    }

    const data = await res.json();
    let text = data?.choices?.[0]?.message?.content || "";
    console.log("[extract] Raw Sarvam output:", text.slice(0, 500));

    // Strip thinking blocks if present
    text = text.replace(/<think>[\s\S]*?<\/think>/g, "");
    // Strip markdown fences
    text = text.replace(/```json|```/g, "");
    // Trim
    text = text.trim();

    // Try direct parse first
    let tasks = [];
    try {
      const parsed = JSON.parse(text);
      tasks = parsed.tasks || [];
    } catch (e1) {
      // Fallback: extract JSON object from anywhere in the text
      const match = text.match(/\{[\s\S]*"tasks"[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          tasks = parsed.tasks || [];
        } catch (e2) {
          console.error("[extract] Could not parse JSON. Text was:", text.slice(0, 300));
          return Response.json({ tasks: [], reason: "parse failed", raw: text.slice(0, 200) });
        }
      } else {
        console.error("[extract] No JSON object found. Text was:", text.slice(0, 300));
        return Response.json({ tasks: [], reason: "no json found", raw: text.slice(0, 200) });
      }
    }

    // Validate task shape
    tasks = tasks
      .filter(t => t && t.task_text && typeof t.task_text === "string")
      .map(t => ({
        task_text: t.task_text.slice(0, 200),
        priority: ["high", "med", "low"].includes(t.priority) ? t.priority : "med",
      }))
      .slice(0, 3);

    console.log("[extract] Returning", tasks.length, "tasks");
    return Response.json({ tasks });
  } catch (err) {
    console.error("[extract] Unexpected error:", err);
    return Response.json({ tasks: [], reason: "unexpected", error: String(err) });
  }
}
