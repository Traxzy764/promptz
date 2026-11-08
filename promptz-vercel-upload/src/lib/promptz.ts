export interface PromptIssue {
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
}

export interface ImproveResult {
  /** 0-100 overall clarity & effectiveness score */
  score: number;
  /** One-sentence overall assessment */
  verdict: string;
  /** Specific strengths of the original prompt */
  strengths: string[];
  /** Concrete problems holding the prompt back */
  issues: PromptIssue[];
  /** The rewritten, improved prompt */
  improvedPrompt: string;
  /** What was changed and why */
  keyChanges: string[];
}

export const MAX_PROMPT_CHARS = 50000;

export const EXAMPLE_PROMPTS: { label: string; text: string }[] = [
  {
    label: "Blog post",
    text: "write me a blog post about coffee",
  },
  {
    label: "Work email",
    text: "Write an email to my landlord asking to fix the heater. It's been cold for a week.",
  },
  {
    label: "Coding help",
    text: "help me build a login page",
  },
  {
    label: "Kids' party",
    text: "give me ideas for my son's 5th birthday party",
  },
];

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
