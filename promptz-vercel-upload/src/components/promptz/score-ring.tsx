"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function scoreColor(score: number) {
  if (score >= 75) return { stroke: "var(--score-good)", label: "Strong", text: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 45) return { stroke: "var(--score-mid)", label: "Decent", text: "text-amber-600 dark:text-amber-400" };
  return { stroke: "var(--score-low)", label: "Vague", text: "text-rose-600 dark:text-rose-400" };
}

interface ScoreRingProps {
  score: number;
  size?: number;
  className?: string;
}

export function ScoreRing({ score, size = 120, className }: ScoreRingProps) {
  const [animated, setAnimated] = React.useState(false);
  const { stroke, label, text } = scoreColor(score);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setAnimated(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="img"
      aria-label={`Prompt score: ${score} out of 100 — ${label}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference * (1 - score / 100) : circumference}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold tabular-nums leading-none", text)}>{score}</span>
        <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
