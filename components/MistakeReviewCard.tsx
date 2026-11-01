"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getMistakes, markMistakeMastered, MistakeRecord } from "@/lib/mistake-db";

export default function MistakeReviewCard() {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "mastered">("pending");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const items = await getMistakes();
      setMistakes(items);
    } catch (err) {
      console.warn("Could not load mistakes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMaster(id?: string) {
    if (!id) return;
    await markMistakeMastered(id);
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, mastered: true } : m))
    );
  }

  const pendingMistakes = mistakes.filter((m) => !m.mastered);
  const masteredMistakes = mistakes.filter((m) => m.mastered);
  const displayedMistakes = filter === "pending" ? pendingMistakes : masteredMistakes;

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Mistake Notebook & Weak Spot Review
              {pendingMistakes.length > 0 && (
                <span className="rounded-full bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 font-semibold border border-amber-500/30">
                  {pendingMistakes.length} to review
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-400">
              Review and master real-world questions you previously missed in quizzes.
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              filter === "pending"
                ? "bg-amber-500/20 text-amber-300 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Needs Practice ({pendingMistakes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("mastered")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              filter === "mastered"
                ? "bg-emerald-500/20 text-emerald-300 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Mastered ({masteredMistakes.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">
            Loading your mistake notebook...
          </div>
        ) : displayedMistakes.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/60 text-slate-400">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white">
              {filter === "pending"
                ? "No pending weak spots!"
                : "No mastered items yet."}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {filter === "pending"
                ? "Whenever you miss a scenario-based question in a lesson quiz, it will be automatically collected here for spaced review."
                : "Once you review and understand a missed question, mark it as mastered to see it here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedMistakes.map((item, idx) => {
              const isExpanded = expandedId === (item.id || String(idx));
              const itemId = item.id || String(idx);

              return (
                <div
                  key={itemId}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 transition hover:border-slate-700"
                >
                  <div
                    onClick={() =>
                      setExpandedId(isExpanded ? null : itemId)
                    }
                    className="flex cursor-pointer items-start justify-between p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                        ✕
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-sm leading-6">
                          {item.question}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1 text-red-400">
                            <XCircle size={13} />
                            Your answer: {item.user_answer}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 size={13} />
                            Solution: {item.correct_answer}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="ml-3 shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-800/80 bg-slate-900/40 p-5 rounded-b-2xl"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                          <Lightbulb size={15} />
                          Senior Engineer Diagnostic & Explanation
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                          {item.explanation}
                        </p>

                        {!item.mastered && (
                          <div className="mt-5 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleMaster(item.id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                            >
                              <CheckCircle2 size={15} />
                              I understand this concept now • Mark Mastered
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

