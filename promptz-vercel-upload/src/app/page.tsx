"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ClipboardPaste,
  Loader2,
  SearchCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ResultView } from "@/components/promptz/result-view";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { EXAMPLE_PROMPTS, MAX_PROMPT_CHARS, type ImproveResult } from "@/lib/promptz";
import { cn } from "@/lib/utils";

const LOADING_STEPS = [
  "Reading your prompt…",
  "Checking clarity, context & structure…",
  "Spotting what's missing…",
  "Rewriting a sharper version…",
];

function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[55%] w-[55%]" aria-hidden="true">
        <path d="M12 2c.6 4.9 2.6 7.4 7.5 10-4.9 2.6-6.9 5.1-7.5 10-.6-4.9-2.6-7.4-7.5-10C14.6 9.4 12.6 6.9 12 2Z" />
      </svg>
    </div>
  );
}

export default function Home() {
  const [prompt, setPrompt] = React.useState("");
  const [result, setResult] = React.useState<ImproveResult | null>(null);
  const [submittedPrompt, setSubmittedPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingStep, setLoadingStep] = React.useState(0);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const canSubmit = prompt.trim().length > 0 && !loading;

  // Rotate the loading status message while the AI works.
  React.useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = window.setInterval(() => {
      setLoadingStep((step) => (step + 1) % LOADING_STEPS.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [loading]);

  // Auto-grow the textarea to fit its content.
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }, [prompt]);

  const handleSubmit = React.useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSubmittedPrompt(trimmed);

    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      setResult(data as ImproveResult);
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [prompt, loading]);

  const handleReset = () => {
    setPrompt("");
    setResult(null);
    setError(null);
    setSubmittedPrompt("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => textareaRef.current?.focus(), 400);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text).then(
      () => toast({ title: "Copied to clipboard", description: "Paste it straight into your AI chat." }),
      () => toast({ title: "Copy failed", description: "Please select the text and copy manually." }),
    );
  };

  const charCount = prompt.length;
  const charCountClass =
    charCount > MAX_PROMPT_CHARS
      ? "text-destructive"
      : charCount >= MAX_PROMPT_CHARS * 0.9
        ? "text-amber-600 dark:text-amber-400"
        : "text-muted-foreground";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <div className="leading-tight">
              <span className="text-lg font-bold tracking-tight">Promptz</span>
              <p className="text-[11px] text-muted-foreground">AI prompt coach</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="dot-grid border-b">
          <div className="mx-auto w-full max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
            <Badge variant="secondary" className="mb-4 px-3 py-1 text-xs font-medium">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Free AI prompt feedback
            </Badge>
            <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Turn good prompts into{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                great ones
              </span>
              .
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground sm:text-lg">
              Paste any prompt you&apos;re about to send an AI. Promptz critiques it and rewrites it
              clearer, richer and more descriptive.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
          {/* Input */}
          <Card className="overflow-hidden border-border/80 shadow-lg shadow-black/[0.03] ring-1 ring-black/[0.02]">
            <CardContent className="space-y-5 p-5 sm:p-7">
              <div className="space-y-2">
                <label htmlFor="prompt-input" className="sr-only">
                  Your prompt
                </label>
                <Textarea
                  id="prompt-input"
                  ref={textareaRef}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value.slice(0, MAX_PROMPT_CHARS))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Paste your prompt here. Add as much context, detail, code, or requirements as you need…"
                  rows={4}
                  className="min-h-[280px] resize-y border-0 p-0 text-base leading-7 shadow-none focus-visible:ring-0 dark:bg-transparent sm:min-h-[320px]"
                  aria-describedby="prompt-hint"
                  disabled={loading}
                />
                <p id="prompt-hint" className="text-xs text-muted-foreground">
                  Press{" "}
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">
                    ⌘/Ctrl
                  </kbd>{" "}
                  +{" "}
                  <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">
                    Enter
                  </kbd>{" "}
                  to improve
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Try:</span>
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setPrompt(example.text)}
                    disabled={loading}
                    className="rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    {example.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className={cn("text-xs font-medium tabular-nums", charCountClass)}>
                    {charCount.toLocaleString()} / {MAX_PROMPT_CHARS.toLocaleString()} characters
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((charCount / MAX_PROMPT_CHARS) * 100)}% used
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Prompt character limit used" aria-valuemin={0} aria-valuemax={MAX_PROMPT_CHARS} aria-valuenow={charCount}>
                  <div className={cn("h-full rounded-full transition-all", charCount >= MAX_PROMPT_CHARS * 0.9 ? "bg-amber-500" : "bg-primary")} style={{ width: `${Math.min(100, (charCount / MAX_PROMPT_CHARS) * 100)}%` }} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">Supports long, detailed prompts up to {MAX_PROMPT_CHARS.toLocaleString()} characters.</span>
                  <Button onClick={handleSubmit} disabled={!canSubmit} size="lg" className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Improving…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" aria-hidden="true" />
                      Improve my prompt
                    </>
                  )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status region */}
          <div aria-live="polite" className="space-y-8">
            {loading && (
              <Card>
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-medium"
                    >
                      {LOADING_STEPS[loadingStep]}
                    </motion.p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted [animation-delay:150ms]" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-muted [animation-delay:300ms]" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This usually takes 10–30 seconds.
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <AlertTitle>Couldn&apos;t analyze your prompt</AlertTitle>
                <AlertDescription className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={handleSubmit} className="shrink-0">
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!loading && !error && result && (
              <div ref={resultRef} className="scroll-mt-24">
                <ResultView
                  result={result}
                  originalPrompt={submittedPrompt}
                  onReset={handleReset}
                  onCopy={handleCopy}
                />
              </div>
            )}
          </div>

          {/* How it works */}
          {!loading && !result && !error && (
            <section aria-label="How Promptz works" className="pt-2">
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  {
                    icon: ClipboardPaste,
                    title: "1. Paste your draft",
                    description: "Drop in the exact prompt you're about to send to any AI.",
                  },
                  {
                    icon: SearchCheck,
                    title: "2. Get honest feedback",
                    description: "A clarity score, what works, and what's holding it back.",
                  },
                  {
                    icon: Wand2,
                    title: "3. Copy the upgrade",
                    description: "A clearer, more descriptive rewrite — ready to send.",
                  },
                ].map((step) => (
                  <div key={step.title} className="flex gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="mt-auto border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-1.5 px-4 py-6 text-center text-sm text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
          <p>Promptz — paste a prompt, get a better one.</p>
          <p>Powered by Z.ai</p>
        </div>
      </footer>
    </div>
  );
}
