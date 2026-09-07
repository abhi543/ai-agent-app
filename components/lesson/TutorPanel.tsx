"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  Send,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useElapsedSeconds } from "@/lib/use-elapsed-seconds";

interface TutorMessage {
  role: "user" | "assistant";
  message: string;
}

interface TutorPanelProps {
  lessonId: string;
  messages?: TutorMessage[];
  onMessagesChange?: (messages: TutorMessage[]) => void;
}

export default function TutorPanel({
  lessonId,
  messages = [],
  onMessagesChange,
}: TutorPanelProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const elapsedSeconds = useElapsedSeconds(loading);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [loading, messages]);

  async function askTutor(message?: string) {
    const text = (message ?? question).trim();

    if (!text || loading) return;

    setLoading(true);

    const userMessage: TutorMessage = {
      role: "user",
      message: text,
    };

    const updatedMessages = [...messages, userMessage];

    onMessagesChange?.(updatedMessages);
    setQuestion("");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch("/api/lesson-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          message: text,
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.reply) {
        throw new Error(data?.error || "The AI Mentor could not answer.");
      }

      const assistantMessage: TutorMessage = {
        role: "assistant",
        message: data.reply,
      };

      onMessagesChange?.([
        ...updatedMessages,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("AI Tutor error:", error);

      const isTimeout =
        error instanceof DOMException && error.name === "AbortError";

      onMessagesChange?.([
        ...updatedMessages,
        {
          role: "assistant",
          message: isTimeout
            ? "The AI Mentor is taking too long to respond. Please try again."
            : "The AI Mentor could not answer right now. Please try again.",
        },
      ]);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <aside className="h-full w-full border-l border-slate-800 bg-slate-900/90 flex flex-col">

      {/* Header */}

      <div className="border-b border-slate-800 p-4">

        <div className="flex items-center gap-3">

          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">

            <BrainCircuit size={20} />

          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white">
                AI Mentor
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online
              </span>
            </div>

            <p className="truncate text-xs text-slate-500">
              Ask anything about this lesson
            </p>
          </div>

        </div>

      </div>

      {/* Messages */}

      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 overflow-y-auto p-5"
        aria-live="polite"
      >

        {messages.length === 0 ? (

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-800 bg-slate-800/50 p-5"
          >

            <div className="flex items-center gap-2 text-violet-400 mb-3">
              <MessageCircle size={17} />

              <span className="text-sm font-semibold">
                Start a conversation
              </span>
            </div>

            <p className="text-sm leading-6 text-slate-400">
              {"I'm here while you study. Ask me to explain something differently, give you an analogy, or create a practice question."}
            </p>

          </motion.div>

        ) : (

          <div className="space-y-4">

            <AnimatePresence initial={false}>

              {messages.map((msg, index) => (

                <motion.div
                  key={`${msg.role}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "ml-8 bg-blue-600 text-white"
                      : "mr-4 bg-slate-800 text-slate-200 border border-slate-700"
                  }`}
                >

                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-60">
                    {msg.role === "user" ? "You" : "AI Mentor"}
                  </p>

                  <p className="text-sm leading-6">
                    {msg.message}
                  </p>

                </motion.div>

              ))}

            </AnimatePresence>

            {loading && (

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mr-10 rounded-2xl border border-slate-700 bg-slate-800 p-4"
              >

                <div
                  className="flex items-center gap-2 text-slate-400 text-sm"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  {elapsedSeconds >= 8
                    ? "Still working on your answer..."
                    : "AI Mentor is thinking..."}
                </div>

              </motion.div>

            )}

          </div>

        )}

      </div>

      {/* Input */}

      <div className="p-4">

        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-3 focus-within:border-blue-500/60">

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                askTutor();
              }
            }}
            rows={3}
            placeholder="Ask your AI Mentor..."
            className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />

          <div className="mt-2 flex items-center justify-between">

            <span className="text-[11px] text-slate-500">
              Enter to send • Shift + Enter for new line
            </span>

            <button
              type="button"
              onClick={() => askTutor()}
              disabled={!question.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>

          </div>

        </div>

      </div>

    </aside>
  );
}
