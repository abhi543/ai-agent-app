"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Flame,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/providers/AuthProvider";

interface CourseHistoryRecord {
  id: string;
  topic: string;
  level: string;
  progress: number;
  streak: number;
  completed_lessons: number;
  total_lessons: number;
  certificate_id: string | null;
  completed_at: string | null;
  created_at: string | null;
}

function GlowBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute right-[-140px] top-[260px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,18,0.8)_80%)]" />
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState<CourseHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (authLoading) return;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("courses")
        .select(
          "id, topic, level, progress, streak, completed_lessons, total_lessons, certificate_id, completed_at, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load learning history:", error);
      }

      setCourses((data || []) as CourseHistoryRecord[]);
      setLoading(false);
    }

    loadHistory();
  }, [authLoading, user]);

  if (!user && !authLoading) {
    return (
      <main className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-2xl font-bold">Sign in to view your history</h1>
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950"
          >
            Go to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">
      <GlowBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10 lg:py-14">

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Learning history
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight">
            Every course you&apos;ve started
          </h1>
        </motion.div>

        <div className="mt-10">
          {authLoading || loading ? (
            <p className="text-slate-400">Loading your history...</p>
          ) : courses.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-10 text-center backdrop-blur-xl">
              <BookOpen size={28} className="mx-auto text-slate-600" />
              <p className="mt-4 text-slate-400">
                No courses yet. Once you start one, it&apos;ll show up here.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course, index) => {
                const isComplete = Boolean(course.completed_at);

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-[24px] border border-white/[0.07] bg-white/[0.035] p-6 backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-bold">{course.topic}</p>
                        <p className="mt-1 text-xs text-slate-500">{course.level}</p>
                      </div>

                      {isComplete ? (
                        <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                          <Award size={12} />
                          Completed
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                          In progress
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {course.completed_lessons} of {course.total_lessons} lessons ·{" "}
                        {course.progress}%
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                      <Flame size={13} className="text-orange-400" />
                      {course.streak || 0} day streak
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          isComplete
                            ? `/course/${course.id}/certificate`
                            : `/course/${course.id}`
                        )
                      }
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
                    >
                      {isComplete ? (
                        <>
                          <Sparkles size={14} />
                          View Certificate
                        </>
                      ) : (
                        "Continue Learning"
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
