"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useElapsedSeconds } from "@/lib/use-elapsed-seconds";

interface LoadingProps {
  message?: string;
}

export default function Loading({
  message = "Preparing your lesson...",
}: LoadingProps) {
  const elapsedSeconds = useElapsedSeconds(true);
  const waitingMessage =
    elapsedSeconds >= 12
      ? "Still working on it. Your lesson is on the way."
      : "Just a moment...";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl shadow-black/20 backdrop-blur-xl"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
          <BrainCircuit size={30} />
        </div>

        <h2 className="text-xl font-bold">
          EduGPT
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {message}
        </p>

        <div
          className="mt-6 flex items-center justify-center gap-2 text-cyan-400"
          role="status"
          aria-live="polite"
        >
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">
            {waitingMessage}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
