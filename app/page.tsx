"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
};

const BOT_URL =
  "https://b75v7st3u1.execute-api.us-east-1.amazonaws.com/prod/praveen-aiops-bot?q=";

const STREAM_DELAY_MS = 18;

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const streamBotText = async (fullText: string) => {
    const botId = createId();
    const parts = fullText.split(/(\s+)/).filter((part) => part.length > 0);

    setMessages((prev) => [...prev, { id: botId, role: "bot", text: "" }]);

    let built = "";
    for (const part of parts) {
      built += part;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === botId ? { ...msg, text: built } : msg))
      );
      await wait(STREAM_DELAY_MS);
    }
  };

  const askBot = async () => {
    if (!query.trim() || loading) return;

    const currentQuery = query.trim();
    const userId = createId();

    setMessages((prev) => [...prev, { id: userId, role: "user", text: currentQuery }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch(`${BOT_URL}${encodeURIComponent(currentQuery)}`);
      const text = await res.text();
      await streamBotText(text);
    } catch (_e: unknown) {
      await streamBotText("Error connecting to IntelliOps Assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await askBot();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(34,211,238,0.18),transparent_38%),radial-gradient(circle_at_86%_14%,rgba(56,189,248,0.12),transparent_36%),linear-gradient(180deg,#020617,#020617_50%,#0b1222)]" />

      <div className="relative mx-auto flex h-screen w-full max-w-[1440px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 px-5 py-4 shadow-[0_8px_32px_rgba(2,6,23,0.48)] backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/bot.png"
                alt="IntelliOps Bot"
                className="h-16 w-16 rounded-full border border-cyan-400/50 bg-slate-950 p-1 shadow-[0_0_24px_rgba(34,211,238,0.3)]"
              />
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-cyan-300 sm:text-xl">
                  IntelliOps Assistant
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Incident triage workspace with deployment-aware AI responses.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-12">
          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.4)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Session Guide
              </p>
              <ul className="mt-3 space-y-3 text-sm text-slate-300">
                <li>Summarize the issue clearly with the affected service and symptoms.</li>
                <li>Ask for matching historical incidents with confirmed resolutions.</li>
                <li>Request next-step recommendations based on current evidence.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.4)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Assistant Context
              </p>
              <p className="mt-3 text-sm text-slate-300">
                Designed for incident commanders, SREs, and platform teams to accelerate
                diagnosis, reduce MTTR, and preserve operational continuity.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 shadow-[0_10px_30px_rgba(2,6,23,0.4)]">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Response Mode
              </p>
              <p className="mt-3 text-sm text-slate-300">
                Streaming enabled. Answers appear progressively for better readability.
              </p>
              <div className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
                {loading ? "Assistant is generating a response..." : "Assistant is ready."}
              </div>
            </div>
          </aside>

          <div className="min-h-0 lg:col-span-8">
            <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-800/90 bg-slate-900/70 shadow-[0_14px_40px_rgba(2,6,23,0.5)] backdrop-blur-sm">
              <div className="border-b border-slate-800/90 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 sm:px-6">
                Chat
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
                {messages.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-400">
                    Describe the issue to start. The assistant will stream a detailed response.
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[92%] rounded-xl border px-4 py-3 text-sm leading-6 whitespace-pre-wrap sm:max-w-[85%] ${
                      msg.role === "user"
                        ? "ml-auto border-cyan-500/40 bg-cyan-500/15 text-cyan-50"
                        : "border-slate-700 bg-slate-950/90 text-slate-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}

                {loading && (
                  <div className="max-w-[85%] rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-400">
                    Drafting response...
                  </div>
                )}

                <div ref={endRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-3 border-t border-slate-800/90 bg-slate-900/80 p-4 sm:p-5"
              >
                <input
                  className="h-11 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/70 focus:outline-none"
                  placeholder="Describe your issue..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  aria-label={loading ? "Sending message" : "Send message"}
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {loading ? (
                    <span className="text-lg leading-none">...</span>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 2 11 13" />
                      <path d="m22 2-7 20-4-9-9-4Z" />
                    </svg>
                  )}
                </button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}




