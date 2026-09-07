"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Flame,
  History,
  LogOut,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/app/providers/AuthProvider";

interface CourseRecord {
  id: string;
  topic: string;
  level: string;
  target_days: number;
  current_lesson: number;
  completed_lessons: number;
  total_lessons: number;
  progress: number;
  streak: number;
  user_id: string;
  created_at: string | null;
}

interface TodayLesson {
  title: string;
  stage: string;
  lesson_number: number;
}

interface MistakeItem {
  question: string;
  user_answer: string;
  correct_answer: string;
}

interface ActivityItem {
  icon: "course" | "lesson";
  title: string;
  subtitle: string;
}

interface DashboardStats {
  courses: number;
  lessons: number;
  aiChats: number;
  progress: number;
  streak: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  console.log("================================");
  console.log("Auth Loading:", authLoading);
  console.log("Auth User:", user);
  console.log("================================");

  const [userName, setUserName] = useState("Learner");
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [todayLesson, setTodayLesson] = useState<TodayLesson | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [weakAreas, setWeakAreas] = useState<MistakeItem[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    courses: 0,
    lessons: 0,
    aiChats: 0,
    progress: 0,
    streak: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      try {
        if (authLoading) {
          return;
        }

        if (!user) {
          setLoading(false);
          return;
        }
console.log("Current user id:", user.id);
        const fullName =
          user.user_metadata?.full_name?.trim();

        if (fullName) {
          setUserName(fullName.split(" ")[0]);
        }
// Latest course belonging to this user
const {
  data: courses,
  error: latestCourseError,
} = await supabase
  .from("courses")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(1);

console.log("================================");
console.log("Query User ID:", user.id);
console.log("Courses Returned:", courses);
console.log("Course Error:", latestCourseError);
console.log("================================");

if (latestCourseError) {
  console.error("Latest course error:", latestCourseError);
}
console.log("STEP 2");
console.log(courses);
console.log(latestCourseError);
const latestCourse =
  courses && courses.length > 0 ? courses[0] : null;
console.log("Courses:", courses);
console.log("Latest course:", latestCourse);
console.log("Latest Course:", latestCourse);

setCourse(latestCourse);

// Today's actual lesson (real title + stage), instead of a bare
// lesson number — first try the lesson matching current_lesson,
// falling back to the first not-yet-completed lesson.
if (latestCourse) {
  const { data: exactLesson } = await supabase
    .from("lessons")
    .select("title, stage, lesson_number")
    .eq("course_id", latestCourse.id)
    .eq("lesson_number", latestCourse.current_lesson)
    .maybeSingle();

  if (exactLesson) {
    setTodayLesson(exactLesson);
  } else {
    const { data: nextLesson } = await supabase
      .from("lessons")
      .select("title, stage, lesson_number")
      .eq("course_id", latestCourse.id)
      .eq("completed", false)
      .order("lesson_number", { ascending: true })
      .limit(1)
      .maybeSingle();

    setTodayLesson(nextLesson ?? null);
  }
}

        // Total courses for this user
        console.log("STEP 1");
        const {
          count: courseCount,
          error: courseCountError,
        } = await supabase
          .from("courses")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id);

        if (courseCountError) {
          console.error(
            "Course count error:",
            courseCountError
          );
        }

        // Completed lessons for this user
        const {
          count: lessonCount,
          error: lessonCountError,
        } = await supabase
          .from("lessons")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id)
          .eq("completed", true);

        if (lessonCountError) {
          console.error(
            "Lesson count error:",
            lessonCountError
          );
        }

        // AI chat messages for this user
        const {
          count: chatCount,
          error: chatCountError,
        } = await supabase
          .from("lesson_messages")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_id", user.id);

        if (chatCountError) {
          console.error(
            "AI chat count error:",
            chatCountError
          );
        }

       setStats({
  courses: courseCount ?? 0,
  lessons: lessonCount ?? 0,
  aiChats: chatCount ?? 0,
  progress: latestCourse?.progress ?? 0,
  streak: latestCourse?.streak ?? 0,
});

        // Recent activity
        const activityList: ActivityItem[] = [];

        if (latestCourse) {
          activityList.push({
            icon: "course",
            title: `Started ${latestCourse.topic}`,
            subtitle: "Learning journey created",
          });
        }

        const { data: completedLessons } =
          await supabase
            .from("lessons")
            .select(
              "lesson_number, title, completed_at"
            )
            .eq("user_id", user.id)
            .eq("completed", true)
            .order("lesson_number", {
              ascending: false,
            })
            .limit(4);

        completedLessons?.forEach((lesson) => {
          activityList.push({
            icon: "lesson",
            title: `Completed Lesson ${lesson.lesson_number}`,
            subtitle:
              lesson.title || "Lesson completed",
          });
        });

        setActivities(activityList);

        // Weak areas — most recent quiz mistakes for this learner.
        const { data: recentMistakes, error: mistakesError } = await supabase
          .from("mistakes")
          .select("question, user_answer, correct_answer")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (mistakesError) {
          console.error("Weak areas error:", mistakesError);
        }

        setWeakAreas((recentMistakes || []) as MistakeItem[]);
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [authLoading, user, router]);

  async function handleLogout() {
    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      return;
    }

    router.replace("/auth/login");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <h1 className="text-2xl font-bold">Please sign in to view your dashboard</h1>
          <p className="mt-3 text-slate-400">
            Your learning dashboard is only available after you authenticate.
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">

            <BrainCircuit size={26} />

          </div>

          <p className="mt-4 text-sm text-slate-400">
            Preparing your learning space...
          </p>

        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">

      {/* Ambient background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute right-[-140px] top-[260px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

        <div className="absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,18,0.8)_80%)]" />

      </div>

      {/* Navigation */}

      <header className="relative z-10 border-b border-white/[0.06] bg-[#070A12]/75 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">

              <BrainCircuit
                size={21}
                className="text-cyan-400"
              />

            </div>

            <div>
              <p className="text-lg font-bold">
                EduGPT
              </p>

              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                AI Learning
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold text-white">
                {userName}
              </p>

              <p className="text-xs text-slate-500">
                Learner
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              onClick={() => router.push("/history")}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              title="Learning history"
            >
              <History size={17} />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
              title="Sign out"
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>

      </header>

      {/* Main */}

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">

        {/* Welcome */}

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >

          <p className="text-sm font-medium text-cyan-400">
            {greeting}, {userName}
          </p>

          <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Keep your momentum going.
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
                Your learning workspace is ready. Pick up where you
                left off or start something new.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-3 font-semibold shadow-lg shadow-blue-500/10 transition hover:scale-[1.02]"
            >
              <Plus size={18} />
              New course
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

          </div>

        </motion.section>

        {/* Continue Learning */}

        {course ? (

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-10"
          >

            <div className="mb-4 flex items-center justify-between">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Continue learning
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Pick up where you left off
                </h2>

              </div>

              <Sparkles
                size={20}
                className="text-cyan-400"
              />

            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-500/5 p-7 shadow-2xl shadow-black/20 backdrop-blur-xl">

              <div className="absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
                      {course.level}
                    </span>

                    {todayLesson?.stage && (
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                        {todayLesson.stage}
                      </span>
                    )}

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                      Lesson {course.current_lesson}
                    </span>

                  </div>

                  <h2 className="mt-4 text-3xl font-bold">
                    {course.topic}
                  </h2>

                  {todayLesson && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-slate-500">Today&apos;s lesson:</span>
                      <span className="font-semibold text-white">{todayLesson.title}</span>
                    </p>
                  )}

                  <p className="mt-2 text-sm text-slate-400">
                    {course.completed_lessons} of{" "}
                    {course.total_lessons} lessons completed
                  </p>

                  <div className="mt-6 max-w-xl">

                    <div className="mb-2 flex justify-between text-xs">

                      <span className="text-slate-500">
                        Course progress
                      </span>

                      <span className="font-semibold text-cyan-400">
                        {course.progress}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">

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

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/course/${course.id}`
                      )
                    }
                    className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:scale-[1.02]"
                  >
                    Continue learning

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />

                  </button>

                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">

                  <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">

                    <div className="flex items-center gap-2 text-yellow-400">
                      <Trophy size={16} />
                      <span className="text-xs font-semibold">
                        Progress
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold">
                      {course.progress}%
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

                </div>

              </div>

            </div>

          </motion.section>

        ) : (

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-10"
          >

            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-8 backdrop-blur-xl">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 text-cyan-400">
                <BookOpen size={23} />
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Your first learning journey starts here.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Tell EduGPT what you want to learn and we'll build
                your personalized path.
              </p>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-3 font-semibold"
              >
                <Plus size={18} />
                Create your first course
              </button>

            </div>

          </motion.section>

        )}

        {/* Stats */}

        <section className="mt-10">

          <div className="mb-4">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Your learning
            </p>

            <h2 className="mt-1 text-xl font-bold">
              At a glance
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                label: "Courses",
                value: stats.courses,
                icon: BookOpen,
                color: "text-blue-400",
              },
              {
                label: "Lessons completed",
                value: stats.lessons,
                icon: CheckCircle2,
                color: "text-emerald-400",
              },
              {
                label: "AI conversations",
                value: stats.aiChats,
                icon: BrainCircuit,
                color: "text-violet-400",
              },
              {
                label: "Current streak",
                value: `${stats.streak} days`,
                icon: Flame,
                color: "text-orange-400",
              },
            ].map((item, index) => {

              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-xl"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">

                      <Icon
                        size={19}
                        className={item.color}
                      />

                    </div>

                  </div>

                  <p className="mt-5 text-2xl font-bold">
                    {item.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.label}
                  </p>

                </motion.div>
              );
            })}

          </div>

        </section>

        {/* Recent Activity */}

        <section className="mt-10">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Recent activity
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Your latest progress
              </h2>
            </div>

          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-xl">

            {activities.length > 0 ? (

              <div className="space-y-2">

                {activities.map((activity, index) => (

                  <motion.div
                    key={`${activity.title}-${index}`}
                    initial={{
                      opacity: 0,
                      x: -8,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="flex items-center gap-4 rounded-2xl px-4 py-4 transition hover:bg-white/[0.03]"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">

                      {activity.icon === "course" ? (
                        <BookOpen
                          size={18}
                          className="text-blue-400"
                        />
                      ) : (
                        <CheckCircle2
                          size={18}
                          className="text-emerald-400"
                        />
                      )}

                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-white">
                        {activity.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {activity.subtitle}
                      </p>

                    </div>

                  </motion.div>

                ))}

              </div>

            ) : (

              <div className="py-8 text-center">

                <Sparkles
                  size={24}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-3 text-sm text-slate-500">
                  Your learning activity will appear here.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* Weak Areas */}

        <section className="mt-10">

          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Weak areas
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Questions worth revisiting
            </h2>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-xl">

            {weakAreas.length > 0 ? (

              <div className="space-y-2">

                {weakAreas.map((mistake, index) => (

                  <motion.div
                    key={`${mistake.question}-${index}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl px-4 py-4 transition hover:bg-white/[0.03]"
                  >

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                        <AlertTriangle size={18} className="text-amber-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {mistake.question}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          You answered{" "}
                          <span className="text-red-400">{mistake.user_answer}</span>
                          {" — correct: "}
                          <span className="text-emerald-400">{mistake.correct_answer}</span>
                        </p>
                      </div>

                    </div>

                  </motion.div>

                ))}

              </div>

            ) : (

              <div className="py-8 text-center">
                <Sparkles size={24} className="mx-auto text-slate-600" />
                <p className="mt-3 text-sm text-slate-500">
                  No mistakes yet — quiz answers you get wrong will show up here.
                </p>
              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}