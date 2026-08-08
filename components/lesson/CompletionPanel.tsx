"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";

interface CompletionPanelProps {
  completed: boolean;
  quizPassed: boolean;
  saving: boolean;
  completionMessage?: string | null;
  onComplete: () => void;
}

export default function CompletionPanel({
  completed,
  quizPassed,
  saving,
  completionMessage,
  onComplete,
}: CompletionPanelProps) {
  if (completed) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-7"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CheckCircle2 className="text-emerald-400" size={25} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Lesson completed
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Great work. Your progress has been saved.
            </p>
          </div>
        </div>

        {completionMessage && (
          <p className="mt-5 rounded-2xl border border-emerald-500/20 bg-slate-950/30 p-4 text-sm text-emerald-300">
            {completionMessage}
          </p>
        )}
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-xl shadow-black/10"
    >
      <div className="flex items-start gap-4">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            quizPassed
              ? "bg-emerald-500/10"
              : "bg-slate-800"
          }`}
        >
          {quizPassed ? (
            <Trophy className="text-yellow-400" size={24} />
          ) : (
            <Lock className="text-slate-500" size={22} />
          )}
        </div>

        <div className="flex-1">

          <h2 className="text-xl font-bold text-white">
            {quizPassed
              ? "Ready to complete this lesson?"
              : "Complete the knowledge check"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {quizPassed
              ? "You've passed the quiz. Mark this lesson complete to save your progress and continue your learning journey."
              : "Pass the lesson quiz before completing this lesson."}
          </p>

          {completionMessage && (
            <p className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-300">
              {completionMessage}
            </p>
          )}

          {!quizPassed && (
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <Sparkles size={14} />
              Your next lesson unlocks after completion.
            </div>
          )}

          <button
            type="button"
            disabled={!quizPassed || saving}
            onClick={onComplete}
            className={`mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition ${
              quizPassed
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/10 hover:scale-[1.02]"
                : "cursor-not-allowed bg-slate-700 text-slate-500"
            }`}
          >
            {saving ? "Saving..." : "Mark Lesson Complete"}

            {!saving && quizPassed && (
              <ChevronRight size={18} />
            )}
          </button>

        </div>
      </div>
    </motion.section>
  );
}