"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flame,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/providers/AuthProvider";

interface CourseRecord {
  id: string;
  topic: string;
  level: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  current_lesson: number;
  streak: number;
  created_at: string;
}

interface LessonRecord {
  id: string;
  lesson_number: number;
  title: string;
  completed: boolean;
  stage?: string;
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const id = params.id as string;

  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);

      try {
        if (authLoading) {
          return;
        }

        if (!user) {
          setLoading(false);
          return;
        }

        const {
          data: courseData,
          error: courseError,
        } = await supabase
          .from("courses")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (courseError || !courseData) {
          console.error("Course loading error:", courseError);
          router.replace("/dashboard");
          return;
        }

        const {
          data: lessonData,
          error: lessonError,
        } = await supabase
          .from("lessons")
          .select(
            "id, lesson_number, title, completed"
          )
          .eq("course_id", id)
          .eq("user_id", user.id)
          .order("lesson_number", {
            ascending: true,
          });

        if (lessonError) {
          console.error("Lesson loading error:", lessonError);
        }

        setCourse(courseData);
        setLessons(lessonData || []);
      } catch (error) {
        console.error("Course page error:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCourse();
    }
  }, [authLoading, id, router, user]);

  const nextLesson = useMemo(() => {
    if (!course || lessons.length === 0) {
      return null;
    }

    return (
      lessons.find(
        (lesson) =>
          !lesson.completed &&
          lesson.lesson_number >= course.current_lesson
      ) ||
      lessons.find((lesson) => !lesson.completed) ||
      null
    );
  }, [course, lessons]);

  const completedCount = lessons.filter(
    (lesson) => lesson.completed
  ).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
          <p className="text-sm text-slate-400">Loading your course…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-2xl font-bold">Sign in to continue learning</h1>
          <p className="mt-3 text-slate-400">
            Your course progress is tied to your authenticated account.
          </p>
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600">
            <BookOpen size={25} />
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Preparing your course...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute right-[-140px] top-[260px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,18,0.82)_80%)]" />

      </div>

      <header className="relative z-10 border-b border-white/[0.06] bg-[#070A12]/75 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
              <Sparkles
                size={20}
                className="text-cyan-400"
              />
            </div>

            <div>
              <p className="text-sm font-bold">
                EduGPT
              </p>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Learning Journey
              </p>
            </div>

          </div>

        </div>

      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-500/5 p-7 shadow-2xl shadow-black/20 backdrop-blur-xl lg:p-10"
        >

          <div className="absolute right-[-80px] top-[-100px] h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                  {course.level}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                  {course.total_lessons} lessons
                </span>

              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                {course.topic}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
                Your personalized learning journey. Learn step by
                step, practice what you learn, and build real progress.
              </p>

              <div className="mt-7 max-w-2xl">

                <div className="mb-2 flex items-center justify-between text-xs">

                  <span className="text-slate-500">
                    Course progress
                  </span>

                  <span className="font-semibold text-cyan-400">
                    {course.progress}%
                  </span>

                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${course.progress}%`,
                    }}
                    transition={{
                      duration: 0.9,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                  />

                </div>

              </div>

              {nextLesson && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/lesson/${nextLesson.id}`
                    )
                  }
                  className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:scale-[1.02]"
                >
                  Continue learning

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              )}

            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">

              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">

                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-semibold">
                    Completed
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold">
                  {completedCount}
                </p>

              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">

                <div className="flex items-center gap-2 text-blue-400">
                  <BookOpen size={16} />
                  <span className="text-xs font-semibold">
                    Total
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold">
                  {course.total_lessons}
                </p>

              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">

                <div className="flex items-center gap-2 text-orange-400">
                  <Flame size={16} />
                  <span className="text-xs font-semibold">
                    Streak
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold">
                  {course.streak || 0}
                </p>

              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">

                <div className="flex items-center gap-2 text-yellow-400">
                  <Trophy size={16} />
                  <span className="text-xs font-semibold">
                    Status
                  </span>
                </div>

                <p className="mt-2 text-sm font-bold">
                  {course.progress >= 100
                    ? "Complete"
                    : "In progress"}
                </p>

              </div>

            </div>

          </div>

        </motion.section>

        <section className="mt-12">

          <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Learning roadmap
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Your lessons
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Complete each lesson to unlock the next step.
            </p>

          </div>

          <div className="space-y-3">

            {lessons.map((lesson, index) => {

              const previousLesson =
                index > 0
                  ? lessons[index - 1]
                  : null;

              const unlocked =
                index === 0 ||
                lesson.completed ||
                previousLesson?.completed === true;

              const isCurrent =
                nextLesson?.id === lesson.id;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.035,
                  }}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition ${
                    lesson.completed
                      ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                      : isCurrent
                      ? "border-blue-500/40 bg-blue-500/[0.06] shadow-lg shadow-blue-500/5"
                      : unlocked
                      ? "border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.05]"
                      : "border-white/[0.04] bg-white/[0.02] opacity-60"
                  }`}
                >

                  {isCurrent && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500" />
                  )}

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          lesson.completed
                            ? "bg-emerald-500/10"
                            : isCurrent
                            ? "bg-blue-500/10"
                            : unlocked
                            ? "bg-white/[0.05]"
                            : "bg-slate-800"
                        }`}
                      >

                        {lesson.completed ? (
                          <CheckCircle2
                            size={21}
                            className="text-emerald-400"
                          />
                        ) : unlocked ? (
                          <BookOpen
                            size={21}
                            className={
                              isCurrent
                                ? "text-blue-400"
                                : "text-slate-400"
                            }
                          />
                        ) : (
                          <Lock
                            size={20}
                            className="text-slate-600"
                          />
                        )}

                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-xs font-medium text-slate-500">
                            Lesson {lesson.lesson_number}
                          </p>

                          {isCurrent && (
                            <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                              Continue here
                            </span>
                          )}

                        </div>

                        <h3
                          className={`mt-1 truncate text-base font-semibold ${
                            lesson.completed
                              ? "text-white"
                              : unlocked
                              ? "text-white"
                              : "text-slate-500"
                          }`}
                        >
                          {lesson.title}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">

                          <Clock3 size={13} />

                          <span>
                            {lesson.completed
                              ? "Completed"
                              : unlocked
                              ? "Ready to learn"
                              : "Locked"}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="shrink-0">

                      {lesson.completed ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/lesson/${lesson.id}`
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/10"
                        >
                          Review
                          <ArrowRight size={15} />
                        </button>
                      ) : unlocked ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/lesson/${lesson.id}`
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                        >
                          Start
                          <ArrowRight size={15} />
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-slate-600">
                          <Lock size={14} />
                          Locked
                        </div>
                      )}

                    </div>

                  </div>

                </motion.div>
              );
            })}

          </div>

          {lessons.length === 0 && (
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-8 text-center">

              <BookOpen
                size={25}
                className="mx-auto text-slate-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                No lessons have been generated for this course yet.
              </p>

            </div>
          )}

        </section>

        {nextLesson && (
          <section className="mt-12">

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/5 p-7">

              <div className="absolute right-[-50px] top-[-80px] h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">

                <div>

                  <div className="flex items-center gap-2 text-cyan-300">

                    <Sparkles size={16} />

                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                      Next up
                    </span>

                  </div>

                  <h3 className="mt-2 text-xl font-bold">
                    {nextLesson.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Lesson {nextLesson.lesson_number}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/lesson/${nextLesson.id}`
                    )
                  }
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-3 font-semibold shadow-lg shadow-blue-500/10 transition hover:scale-[1.02]"
                >
                  Continue

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

              </div>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}