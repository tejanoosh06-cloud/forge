export async function POST(req) {
  const { message, chat_id } = await req.json();
  if (!message || message.length < 30) return Response.json({ tasks: [] });

  const prompt = `You are a task extractor. Read this AI response and extract any clear, specific action items the founder should do.

Rules:
- Only extract CONCRETE actions (not vague suggestions)
- Max 3 tasks per message
- Each task: short (under 8 words), actionable, starts with a verb
- Assign priority: high (urgent/critical), med (important), low (nice to have)
- If no clear tasks exist, return empty array
- Return ONLY valid JSON, nothing else

Message:
"${message.slice(0, 1500)}"

Return format:
{"tasks": [{"task_text": "...", "priority": "high|med|low"}]}`;

  try {
    const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
    });

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return Response.json({ tasks: parsed.tasks || [] });
  } catch {
    return Response.json({ tasks: [] });
  }
}
