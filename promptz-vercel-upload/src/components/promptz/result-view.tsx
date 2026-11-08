"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScoreRing } from "@/components/promptz/score-ring";
import { countWords, type ImproveResult } from "@/lib/promptz";
import { cn } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  high: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300",
};

interface ResultViewProps {
  result: ImproveResult;
  originalPrompt: string;
  onReset: () => void;
  onCopy: (text: string) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function ResultView({ result, originalPrompt, onReset, onCopy }: ResultViewProps) {
  const [copied, setCopied] = React.useState(false);

  const originalWords = countWords(originalPrompt);
  const improvedWords = countWords(result.improvedPrompt);
  const ratio = originalWords > 0 ? improvedWords / originalWords : 0;
  const detail = ratio >= 1.15 ? `${ratio.toFixed(1)}× more detail` : "Tightened & sharpened";

  const handleCopy = () => {
    onCopy(result.improvedPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Score summary */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, ease: "easeOut" }}>
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              <ScoreRing score={result.score} />
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h2 className="text-base font-semibold">Here&apos;s the verdict</h2>
                  <p className="mt-1 text-muted-foreground">{result.verdict}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:justify-start">
                  <span>
                    <span className="font-semibold text-foreground tabular-nums">{originalWords}</span>{" "}
                    words in
                  </span>
                  <ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" />
                  <span>
                    <span className="font-semibold text-foreground tabular-nums">{improvedWords}</span>{" "}
                    words out
                  </span>
                  <Badge variant="secondary" className="font-medium">
                    {detail}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" onClick={onReset} className="shrink-0">
                <RotateCcw className="mr-2 h-4 w-4" />
                Start over
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Improved prompt */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}>
        <Card className="border-primary/25 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle className="text-lg">Improved prompt</CardTitle>
                  <CardDescription>Clearer, more descriptive, ready to send</CardDescription>
                </div>
              </div>
              <Button size="sm" onClick={handleCopy} aria-label="Copy improved prompt to clipboard">
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="max-h-[26rem] overflow-y-auto rounded-lg border bg-muted/40 p-4 text-[15px] leading-relaxed">
              <p className="whitespace-pre-wrap">{result.improvedPrompt}</p>
            </div>

            {result.keyChanges.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold">What changed &amp; why</h3>
                  <ul className="mt-3 space-y-2.5">
                    {result.keyChanges.map((change, index) => (
                      <li key={index} className="flex gap-2.5 text-sm text-muted-foreground">
                        <ArrowRight
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback */}
      <div className="grid gap-6 md:grid-cols-2">
        {result.strengths.length > 0 && (
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <CardTitle className="text-base">What works well</CardTitle>
                </div>
                <CardDescription>Keep these strengths in future prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex gap-2.5 text-sm">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {result.issues.length > 0 && (
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.24, ease: "easeOut" }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  <CardTitle className="text-base">What&apos;s holding it back</CardTitle>
                </div>
                <CardDescription>Fix these to get better AI answers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {result.issues.map((issue, index) => (
                    <li key={index} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={cn("text-[11px] font-medium capitalize", severityStyles[issue.severity])}
                        >
                          {issue.severity}
                        </Badge>
                        <span className="text-sm font-medium">{issue.title}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{issue.detail}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
