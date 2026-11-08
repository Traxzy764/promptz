import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Promptz — AI Prompt Feedback & Improver",
  description:
    "Paste any prompt you're about to send an AI. Promptz gives you honest feedback and rewrites it clearer, richer and more descriptive.",
  keywords: ["Promptz", "prompt engineering", "AI prompts", "prompt feedback", "prompt improver"],
  icons: {
    icon: "/promptz.svg",
  },
  openGraph: {
    title: "Promptz — Turn good prompts into great ones",
    description:
      "Paste a prompt, get an honest critique and a clearer, more descriptive rewrite.",
    siteName: "Promptz",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
