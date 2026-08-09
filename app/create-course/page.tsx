"use client";

import { createCourse } from "@/lib/course";
import { saveLessons } from "@/lib/lesson-db";
import { createCourse as saveCourse } from "@/lib/course-db";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

interface GeneratedLesson {
  lesson_number: number;
  title: string;
  content: string;
}

interface LessonsPayload {
  lessons?: GeneratedLesson[];
}

type Level = "Beginner" | "Intermediate" | "Expert";
type Style = "Sprint" | "Balanced" | "Mastery";

const LEVEL_OPTIONS: { value: Level; label: string; desc: string }[] = [
  { value: "Beginner", label: "Beginner", desc: "New to this topic" },
  { value: "Intermediate", label: "Intermediate", desc: "Know the basics already" },
  { value: "Expert", label: "Expert", desc: "Sharpening advanced skills" },
];

const TIME_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: "15 min/day" },
  { value: 30, label: "30 min/day" },
  { value: 45, label: "45 min/day" },
  { value: 60, label: "60+ min/day" },
];

const STYLE_OPTIONS: { value: Style; label: string; desc: string }[] = [
  { value: "Sprint", label: "Sprint", desc: "Faster, focused learning" },
  { value: "Balanced", label: "Balanced", desc: "Normal, steady pace" },
  { value: "Mastery", label: "Mastery", desc: "Deeper learning, more practice" },
];

// --- Duration heuristic -----------------------------------------------
// Placeholder logic for Phase 1: turns (level, daily time, style) into a
// day count using simple multipliers, so the rest of the pipeline (which
// already generates exactly one lesson per day) keeps working unchanged.
// Phase 2 replaces this with a real AI-driven course/stage generator.
const LEVEL_BASE_DAYS: Record<Level, number> = {
  Beginner: 21,
  Intermediate: 14,
  Expert: 10,
};

const STYLE_MULTIPLIER: Record<Style, number> = {
  Sprint: 0.7,
  Balanced: 1,
  Mastery: 1.4,
};

function estimateDays(level: Level, dailyMinutes: number, style: Style): number {
  const raw =
    LEVEL_BASE_DAYS[level] * STYLE_MULTIPLIER[style] * (30 / dailyMinutes);

  return Math.max(3, Math.min(60, Math.round(raw)));
}
// ------------------------------------------------------------------------

type WizardStep = "level" | "time" | "style" | "generating";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const goal = searchParams.get("goal");
  const normalizedGoal = goal?.trim() ?? "";

  const [wizardStep, setWizardStep] = useState<WizardStep>("level");
  const [level, setLevel] = useState<Level | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState<number | null>(null);
  const [style, setStyle] = useState<Style | null>(null);

  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validDays =
    level && dailyMinutes && style
      ? estimateDays(level, dailyMinutes, style)
      : 1;

  const course = createCourse(normalizedGoal, validDays);

  async function beginCourseCreation(
    finalLevel: Level,
    finalDailyMinutes: number,
    finalStyle: Style
  ) {
    setWizardStep("generating");
    setErrorMessage(null);

    if (!normalizedGoal) {
      setErrorMessage("A valid learning goal is required.");
      return;
    }

    const days = estimateDays(finalLevel, finalDailyMinutes, finalStyle);

    const creationKey = `course-created:${normalizedGoal}`;
    const creationLockKey = `course-creating:${normalizedGoal}`;

    const existingCourseId = sessionStorage.getItem(creationKey);
    if (existingCourseId) {
      console.log("Course already exists:", existingCourseId);
      setSavedCourseId(existingCourseId);
      return;
    }

    const alreadyCreating = sessionStorage.getItem(creationLockKey);
    if (alreadyCreating === "true") {
      console.log("Course creation already in progress.");
      return;
    }

    sessionStorage.setItem(creationLockKey, "true");

    try {
      const user = await getAuthenticatedUser();

      if (!user) {
        sessionStorage.removeItem(creationLockKey);
        setErrorMessage("Please sign in to create your course.");
        return;
      }

      console.log("Creating course for user:", user.id);

      // course-db.ts automatically attaches user_id.
      const savedCourseRecord = await saveCourse({
        topic: normalizedGoal,
        level: finalLevel,
        target_days: days,
        total_lessons: days,
        current_lesson: 1,
        completed_lessons: 0,
        progress: 0,
      });

      console.log("Course created:", savedCourseRecord.id);

      sessionStorage.setItem(creationKey, savedCourseRecord.id);
      setSavedCourseId(savedCourseRecord.id);

      const response = await fetch("/api/generate-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: normalizedGoal,
          days,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Lesson generation failed:", response.status, errorText);
        throw new Error("Unable to generate lessons. Please try again.");
      }

      const lessonsText = await response.text();

      let lessons: LessonsPayload;
      try {
        lessons = JSON.parse(lessonsText) as LessonsPayload;
      } catch {
        console.error("Invalid lesson response:", lessonsText);
        throw new Error("Unable to parse the generated lessons.");
      }

      const lessonItems = lessons?.lessons;

      if (!Array.isArray(lessonItems)) {
        throw new Error("The lesson generator returned an invalid response.");
      }

      // lesson-db.ts automatically attaches user_id.
      await saveLessons(
        lessonItems.map((lesson: GeneratedLesson) => ({
          course_id: savedCourseRecord.id,
          lesson_number: lesson.lesson_number,
          title: lesson.title,
          content: lesson.content,
          completed: false,
        }))
      );

      console.log("All lessons saved successfully.");
    } catch (error) {
      console.error("Course creation failed. Raw error object:", error);
      console.error("Course creation failed. JSON:", JSON.stringify(error, null, 2));

      if (error && typeof error === "object") {
        const e = error as Record<string, unknown>;
        console.error("  message:", e.message);
        console.error("  details:", e.details);
        console.error("  hint:", e.hint);
        console.error("  code:", e.code);
      }

      sessionStorage.removeItem(creationLockKey);
      sessionStorage.removeItem(creationKey);
      setSavedCourseId(null);

      const readableMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "Something went wrong while creating the course.";

      setErrorMessage(readableMessage);
    } finally {
      sessionStorage.removeItem(creationLockKey);
    }
  }

  function retryCreation() {
    if (level && dailyMinutes && style) {
      setSavedCourseId(null);
      setErrorMessage(null);
      beginCourseCreation(level, dailyMinutes, style);
    }
  }

  const progress = course.progress;

  function openCourse() {
    if (!savedCourseId) return;
    router.push(`/course/${savedCourseId}`);
  }

  if (!normalizedGoal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-sm">A valid learning goal is required.</p>
        </div>
      </div>
    );
  }

  // ---- Wizard steps: Level -> Daily time -> Learning style ----
  if (wizardStep !== "generating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="mx-auto max-w-2xl">

          <div className="mb-8 flex justify-center">
            <div className="h-16 w-16">
              <Image src="/logo.svg" alt="AI Tutor Logo" width={64} height={64} priority />
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
              Learning goal
            </p>
            <h1 className="mt-1 text-2xl font-bold">🎯 {normalizedGoal}</h1>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2">
            {(["level", "time", "style"] as WizardStep[]).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 w-16 rounded-full ${
                  ["level", "time", "style"].indexOf(wizardStep) >= i
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">

            {wizardStep === "level" && (
              <>
                <h2 className="mb-1 text-2xl font-bold text-gray-800">
                  What&apos;s your current level?
                </h2>
                <p className="mb-6 text-gray-500">
                  This helps us pitch lessons at the right depth.
                </p>
                <div className="grid gap-3">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setLevel(opt.value);
                        setWizardStep("time");
                      }}
                      className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <p className="font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-sm text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {wizardStep === "time" && (
              <>
                <h2 className="mb-1 text-2xl font-bold text-gray-800">
                  How much time can you study each day?
                </h2>
                <p className="mb-6 text-gray-500">
                  We&apos;ll pace your journey around this.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setDailyMinutes(opt.value);
                        setWizardStep("style");
                      }}
                      className="rounded-xl border border-gray-200 p-4 text-center font-semibold text-gray-800 transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep("level")}
                  className="mt-6 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
              </>
            )}

            {wizardStep === "style" && (
              <>
                <h2 className="mb-1 text-2xl font-bold text-gray-800">
                  What learning style fits you?
                </h2>
                <p className="mb-6 text-gray-500">
                  This shapes your pace and how much practice you get.
                </p>
                <div className="grid gap-3">
                  {STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStyle(opt.value);
                        if (level && dailyMinutes) {
                          beginCourseCreation(level, dailyMinutes, opt.value);
                        }
                      }}
                      className="rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <p className="font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-sm text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep("time")}
                  className="mt-6 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    );
  }

  // ---- Generating / result screen (existing, working flow) ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">

      <div className="mx-auto max-w-4xl">

        <div className="mb-8 flex justify-center">
          <div className="h-16 w-16">
            <Image src="/logo.svg" alt="AI Tutor Logo" width={64} height={64} priority />
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold">🎯 Your Learning Journey Begins</h1>
              <p className="text-lg text-blue-100">
                Your personalized AI tutor has prepared your learning plan.
              </p>
            </div>
            <div className="text-6xl opacity-20">📚</div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            <div>
              <div className="mb-6">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Learning Goal
                </h2>
                <h3 className="mb-1 text-4xl font-bold text-gray-800">🎯 {course.topic}</h3>
                <p className="text-gray-500">
                  {level} · {dailyMinutes} min/day · {style}
                </p>
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Duration
                </h2>
                <p className="text-3xl font-bold text-gray-800">
                  {course.targetDays}
                  <span className="text-lg text-gray-500"> days</span>
                </p>
                <p className="text-gray-500">Total learning period</p>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Today&apos;s Progress
              </h2>
              <div className="relative h-4 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-gray-600">{progress}% Complete</p>
              <p className="mt-5 text-center text-2xl font-bold text-blue-600">
                Let&apos;s get started! 🚀
              </p>
            </div>

          </div>

          {errorMessage && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="mt-8 border-t border-gray-100 pt-8">
            {savedCourseId ? (
              <button
                type="button"
                onClick={openCourse}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-bold text-white shadow-lg transition hover:scale-105 hover:from-blue-700 hover:to-purple-700 active:scale-95"
              >
                ✨ Start Learning Now
              </button>
            ) : errorMessage ? (
              <button
                type="button"
                onClick={retryCreation}
                className="rounded-lg bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>
            ) : (
              <button
                type="button"
                disabled
                suppressHydrationWarning
                className="cursor-not-allowed rounded-lg bg-gray-300 px-8 py-4 font-bold text-gray-700"
              >
                Saving your course...
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
