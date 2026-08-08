"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({
  value,
  label = "Lesson Progress",
  showPercentage = true,
}: ProgressBarProps) {
  const progress = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          {label}
        </span>

        {showPercentage && (
          <span className="text-xs font-semibold text-cyan-400">
            {progress}%
          </span>
        )}
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
        />
      </div>
    </div>
  );
}