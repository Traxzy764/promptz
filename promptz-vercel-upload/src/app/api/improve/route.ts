import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import type { ImproveResult, PromptIssue } from "@/lib/promptz";
import { MAX_PROMPT_CHARS } from "@/lib/promptz";

const SYSTEM_PROMPT = `You are Promptz, an expert prompt engineering coach and editor.

The user sends you a prompt (or any text) they plan to give to an AI. You must:
1. Critically analyze its clarity, context, specificity, structure and likely output quality.
2. Give honest, specific, actionable feedback.
3. Rewrite it into a significantly clearer, more descriptive and more effective prompt.

Guidelines:
- Respond in the SAME language as the user's prompt (English prompt -> English feedback, Spanish -> Spanish, etc.).
- Preserve the user's true intent. Never invent facts, names, numbers or constraints that contradict it. Where a detail is needed but unknown, use clearly-marked placeholders like [audience] or [topic] instead of inventing.
- In your feedback, reference concrete parts of their text (quote short fragments) so it feels specific, not generic.
- The improved prompt may use light markdown structure (short headings, bullet points, numbered requirements) when it genuinely helps an AI follow it. It should be noticeably richer and more descriptive than the original.
- Score honestly: vague one-liners score below 45; decent but generic prompts score 45-74; specific, well-structured prompts with clear context, task and format score 75+.

Return ONLY valid JSON matching exactly this shape, with no markdown fences and no text before or after:
{"score":<integer 0-100>,"verdict":"<one sentence overall assessment, max 140 characters>","strengths":["<strength>", "..."],"issues":[{"title":"<short issue title>","detail":"<why it matters and how to fix it>","severity":"high"|"medium"|"low"}],"improvedPrompt":"<the rewritten prompt, use \\n for line breaks>","keyChanges":["<what you changed and why>", "..."]}

Constraints: 2-4 strengths, 2-5 issues, 2-6 keyChanges. All strings must be non-empty.`;

function toStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, max);
}

function toIssues(value: unknown): PromptIssue[] {
  if (!Array.isArray(value)) return [];
  const issues: PromptIssue[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const title = String(record.title ?? "").trim();
    const detail = String(record.detail ?? "").trim();
    if (!title && !detail) continue;
    const rawSeverity = String(record.severity ?? "").toLowerCase();
    const severity: PromptIssue["severity"] =
      rawSeverity === "high" || rawSeverity === "low" ? rawSeverity : "medium";
    issues.push({
      title: title || "Issue",
      detail: detail || "No details provided.",
      severity,
    });
    if (issues.length >= 6) break;
  }
  return issues;
}

function extractAndNormalize(raw: string): ImproveResult | null {
  if (!raw || !raw.trim()) return null;

  let text = raw.trim();
  // Strip a markdown code fence if the model wrapped the JSON in one.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) text = fenced[1].trim();

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }

  const improvedPrompt = String(data.improvedPrompt ?? "").trim();
  if (!improvedPrompt) return null;

  const score = Math.max(0, Math.min(100, Math.round(Number(data.score) || 0)));

  return {
    score,
    verdict: String(data.verdict ?? "").trim().slice(0, 220),
    strengths: toStringArray(data.strengths, 6),
    issues: toIssues(data.issues),
    improvedPrompt,
    keyChanges: toStringArray(data.keyChanges, 8),
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const promptText =
    typeof body === "object" && body !== null && typeof (body as Record<string, unknown>).prompt === "string"
      ? ((body as Record<string, unknown>).prompt as string)
      : null;

  if (!promptText || promptText.trim().length === 0) {
    return NextResponse.json({ error: "Please enter a prompt first." }, { status: 400 });
  }
  if (promptText.length > MAX_PROMPT_CHARS) {
    return NextResponse.json(
      { error: `Prompt is too long. Please keep it under ${MAX_PROMPT_CHARS.toLocaleString()} characters.` },
      { status: 400 },
    );
  }

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: promptText },
      ],
      thinking: { type: "disabled" },
      temperature: 0.6,
    });

    const content: string = completion?.choices?.[0]?.message?.content ?? "";
    const result = extractAndNormalize(content);

    if (!result) {
      console.error("[/api/improve] Could not parse AI response:", content.slice(0, 500));
      return NextResponse.json(
        { error: "The AI returned an unreadable response. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/improve] Request failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while analyzing your prompt. Please try again." },
      { status: 500 },
    );
  }
}
