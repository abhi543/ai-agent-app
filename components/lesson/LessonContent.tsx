"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";

interface LessonContentProps {
  lessonNumber: number;
  title: string;
  content: string;
  progress?: number;
}

function splitContent(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean);
}

export default function LessonContent({
  lessonNumber,
  title,
  content,
  progress = 0,
}: LessonContentProps) {
  const sections = splitContent(content);

  return (
    <main className="min-h-full overflow-y-auto bg-slate-950 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-4xl">

        {/* Lesson Header */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-sm text-cyan-400 mb-3">
            <BookOpen size={16} />
            <span>Lesson {lessonNumber}</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {title}
          </h1>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Learning progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Learning Objective */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6"
        >
          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
              <Target className="text-cyan-400" size={22} />
            </div>

            <div>
              <p className="text-sm font-semibold text-cyan-400">
                Learning Objective
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                Understand the key ideas in this lesson and learn how to
                apply them through examples and practice.
              </p>
            </div>

          </div>
        </motion.section>

        {/* Lesson Sections */}

        <div className="space-y-6">

          {sections.length > 0 ? (
            sections.map((section, index) => (
              <motion.section
                key={`${section}-${index}`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-xl shadow-black/10 backdrop-blur-xl"
              >
                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                    {index === 0 ? (
                      <Sparkles
                        size={18}
                        className="text-violet-400"
                      />
                    ) : (
                      <Lightbulb
                        size={18}
                        className="text-violet-400"
                      />
                    )}
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    {index === 0 ? "Core Concept" : `Key Idea ${index}`}
                  </h2>

                </div>

                <div className="whitespace-pre-wrap text-base leading-8 text-slate-300">
                  {section}
                </div>
              </motion.section>
            ))
          ) : (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7"
            >
              <p className="text-slate-400">
                Lesson content is not available yet.
              </p>
            </motion.section>
          )}

        </div>

        {/* Quick Summary */}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-7"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10">
              <Check className="text-emerald-400" size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Quick Summary
              </h2>

              <p className="text-sm text-slate-400">
                Keep these ideas in mind as you practice.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm leading-7 text-slate-300">
            <div className="flex gap-3">
              <span className="text-emerald-400">✓</span>
              <span>Understand the main concept before memorizing details.</span>
            </div>

            <div className="flex gap-3">
              <span className="text-emerald-400">✓</span>
              <span>Use the examples to connect theory with practice.</span>
            </div>

            <div className="flex gap-3">
              <span className="text-emerald-400">✓</span>
              <span>Ask the AI Tutor whenever something is unclear.</span>
            </div>
          </div>
        </motion.section>

      </div>
    </main>
  );
}