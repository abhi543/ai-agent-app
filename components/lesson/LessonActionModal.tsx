"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lock,
  Sparkles,
  Trophy,
  X,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import QuizPanel from "./QuizPanel";
import CompletionPanel from "./CompletionPanel";

interface LessonActionModalProps {
  courseId: string;
  lessonId: string;
  topic: string;
  lessonTitle: string;
  lessonContent: string;
  lessonNumber: number;
  totalLessons: number;
  completed: boolean;
  quiz: any;
  quizError: string | null;
  quizLoading: boolean;
  quizPassed: boolean;
  saving: boolean;
  completionMessage: string | null;
  onQuizGenerated: (quiz: any) => void;
  onQuizError: (error: string | null) => void;
  onPassed: (score: number, total: number) => void;
  onComplete: () => void;
}

export default function LessonActionModal({
  courseId,
  lessonId,
  topic,
  lessonTitle,
  lessonContent,
  lessonNumber,
  totalLessons,
  completed,
  quiz,
  quizError,
  quizLoading,
  quizPassed,
  saving,
  completionMessage,
  onQuizGenerated,
  onQuizError,
  onPassed,
  onComplete,
}: LessonActionModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Persistent Bottom Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl px-4 py-3 sm:px-6 shadow-2xl shadow-black">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BookOpen size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Lesson {lessonNumber} of {totalLessons}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {completed
                  ? "Completed"
                  : quizPassed
                  ? "Quiz Passed • Ready to complete"
                  : "Ready to test understanding?"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {completed ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 size={16} />
                Completed
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-[0.98]"
              >
                {quizPassed ? (
                  <>
                    <Trophy size={16} className="text-yellow-300" />
                    Complete Lesson
                  </>
                ) : (
                  <>
                    <HelpCircle size={16} />
                    Answer Questions & Complete
                  </>
                )}
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal / Assessment Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/80 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      Knowledge Check & Completion
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lessonTitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <QuizPanel
                  courseId={courseId}
                  lessonId={lessonId}
                  topic={topic}
                  lessonTitle={lessonTitle}
                  lessonContent={lessonContent}
                  quiz={quiz}
                  quizError={quizError}
                  isInitialQuizLoading={quizLoading}
                  onQuizGenerated={onQuizGenerated}
                  onQuizError={onQuizError}
                  onPassed={onPassed}
                />

                <CompletionPanel
                  completed={completed}
                  quizPassed={quizPassed}
                  saving={saving}
                  completionMessage={completionMessage}
                  onComplete={() => {
                    onComplete();
                    setIsOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

