"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  BookOpen,
  Clock3,
  Trophy,
  Flame,
} from "lucide-react";

interface LessonItem {
  id: string;
  lesson_number: number;
  title: string;
  completed: boolean;
}

interface SidebarProps {
  courseTitle: string;
  lessons: LessonItem[];
  currentLessonId: string;
  progress: number;
  xp?: number;
  streak?: number;
  onLessonClick?: (lessonId: string) => void;
}

export default function Sidebar({
  courseTitle,
  lessons,
  currentLessonId,
  progress,
  xp = 0,
  streak = 0,
  onLessonClick,
}: SidebarProps) {
  return (
    <aside className="h-full w-full bg-slate-900/90 border-r border-slate-800 p-5 overflow-y-auto">

      {/* Course Header */}

      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <BookOpen size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-white truncate">
              {courseTitle}
            </h2>

            <p className="text-xs text-slate-400">
              Learning journey
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}

      <div className="mb-7 rounded-2xl bg-slate-800/70 border border-slate-700 p-4">

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">
            Course Progress
          </span>

          <span className="text-sm font-semibold text-cyan-400">
            {progress}%
          </span>
        </div>

        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          />
        </div>
      </div>

      {/* Lesson List */}

      <div className="mb-7">

        <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
          Lessons
        </p>

        <div className="space-y-2">

          {lessons.map((lesson) => {
            const isCurrent = lesson.id === currentLessonId;

            const lessonIndex = lessons.findIndex(
              (item) => item.id === lesson.id
            );

            const previousLesson =
              lessonIndex > 0 ? lessons[lessonIndex - 1] : null;

            const unlocked =
              lessonIndex === 0 ||
              lesson.completed ||
              previousLesson?.completed === true;

            return (
              <motion.button
                key={lesson.id}
                whileHover={unlocked ? { x: 3 } : undefined}
                whileTap={unlocked ? { scale: 0.98 } : undefined}
                disabled={!unlocked}
                onClick={() => {
                  if (unlocked) {
                    onLessonClick?.(lesson.id);
                  }
                }}
                className={`w-full text-left rounded-xl p-3 border transition ${
                  isCurrent
                    ? "bg-blue-500/10 border-blue-500/60 shadow-lg shadow-blue-500/10"
                    : lesson.completed
                    ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                    : unlocked
                    ? "bg-slate-800/60 border-slate-700 hover:bg-slate-700/70"
                    : "bg-slate-800/30 border-slate-800 opacity-60 cursor-not-allowed"
                }`}
              >

                <div className="flex items-start gap-3">

                  <div className="mt-0.5 shrink-0">

                    {lesson.completed ? (
                      <CheckCircle2
                        size={18}
                        className="text-emerald-400"
                      />
                    ) : isCurrent ? (
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-blue-400 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                      </div>
                    ) : unlocked ? (
                      <BookOpen
                        size={18}
                        className="text-slate-400"
                      />
                    ) : (
                      <Lock
                        size={18}
                        className="text-slate-500"
                      />
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-2">

                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent
                            ? "text-blue-300"
                            : "text-white"
                        }`}
                      >
                        {lesson.lesson_number}. {lesson.title}
                      </p>

                    </div>

                    <div className="flex items-center gap-2 mt-1">

                      <Clock3 size={12} className="text-slate-500" />

                      <span className="text-[11px] text-slate-500">
                        {lesson.completed
                          ? "Completed"
                          : isCurrent
                          ? "Current lesson"
                          : unlocked
                          ? "Ready to learn"
                          : "Locked"}
                      </span>

                    </div>

                  </div>

                </div>

              </motion.button>
            );
          })}

        </div>
      </div>

      {/* Stats */}

      <div className="border-t border-slate-800 pt-5">

        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Trophy size={16} />
              <span className="text-xs font-semibold">
                XP
              </span>
            </div>

            <p className="text-lg font-bold text-white">
              {xp}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <Flame size={16} />
              <span className="text-xs font-semibold">
                Streak
              </span>
            </div>

            <p className="text-lg font-bold text-white">
              {streak} days
            </p>
          </div>

        </div>

      </div>
    </aside>
  );
}