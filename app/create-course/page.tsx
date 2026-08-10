"use client";

import { createCourse } from "@/lib/course";
import { saveLessons } from "@/lib/lesson-db";
import { createCourse as saveCourse } from "@/lib/course-db";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Compass,
  Dumbbell,
  Flame,
  GraduationCap,
  Sparkles,
  Target,
  BookOpen,
} from "lucide-react";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

interface GeneratedLesson {
  lesson_number: number;
  title: string;
}

interface GeneratedStage {
  name: string;
  lessons: GeneratedLesson[];
}

interface CoursePlanPayload {
  estimated_days?: number;
  stages?: GeneratedStage[];
  // legacy shape support, in case the API ever falls back to it
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

const STAGE_ICONS: Record<string, typeof Compass> = {
  Discover: Compass,
  Learn: BookOpen,
  Practice: Dumbbell,
  Master: GraduationCap,
};

// --- Fallback duration heuristic ---------------------------------------
// Used ONLY if the AI-generated plan comes back malformed. Turns
// (level, daily time, style) into a single-stage, one-lesson-per-day
// plan so the flow never dead-ends even if the AI call has a bad day.
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

function fallbackPlan(level: Level, dailyMinutes: number, style: Style): {
  estimatedDays: number;
  stages: GeneratedStage[];
} {
  const days = estimateDays(level, dailyMinutes, style);
  return {
    estimatedDays: days,
    stages: [
      {
        name: "Learn",
        lessons: Array.from({ length: days }, (_, i) => ({
          lesson_number: i + 1,
          title: `Day ${i + 1}`,
        })),
      },
    ],
  };
}
// ------------------------------------------------------------------------

function isValidPlan(
  plan: CoursePlanPayload
): plan is { estimated_days: number; stages: GeneratedStage[] } {
  if (
    typeof plan.estimated_days !== "number" ||
    !Number.isFinite(plan.estimated_days) ||
    plan.estimated_days < 1
  ) {
    return false;
  }

  if (!Array.isArray(plan.stages) || plan.stages.length === 0) {
    return false;
  }

  return plan.stages.every(
    (stage) =>
      typeof stage.name === "string" &&
      Array.isArray(stage.lessons) &&
      stage.lessons.length > 0 &&
      stage.lessons.every(
        (lesson) =>
          typeof lesson.lesson_number === "number" &&
          typeof lesson.title === "string"
      )
  );
}

type WizardStep = "level" | "time" | "style" | "generating";

const WIZARD_STEP_ORDER: WizardStep[] = ["level", "time", "style"];

function GlowBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute right-[-140px] top-[260px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />
      <div className="absolute bottom-[-180px] left-[35%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,10,18,0.8)_80%)]" />
    </div>
  );
}

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
  const [planDays, setPlanDays] = useState<number>(1);
  const [planStages, setPlanStages] = useState<GeneratedStage[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);

  const course = createCourse(normalizedGoal, planDays);

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

      // Ask the AI to design the journey: it decides the duration itself
      // and organizes lessons into the Discover / Learn / Practice /
      // Master stages, based on the learner's level, time, and style.
      const response = await fetch("/api/generate-lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: normalizedGoal,
          level: finalLevel,
          dailyMinutes: finalDailyMinutes,
          style: finalStyle,
        }),
      });

      let plan: { estimatedDays: number; stages: GeneratedStage[] };

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Lesson generation failed:", response.status, errorText);
        console.warn("Falling back to the heuristic plan.");
        plan = fallbackPlan(finalLevel, finalDailyMinutes, finalStyle);
        setUsedFallback(true);
      } else {
        const rawText = await response.text();
        let parsed: CoursePlanPayload;

        try {
          parsed = JSON.parse(rawText) as CoursePlanPayload;
        } catch {
          console.error("Invalid lesson response:", rawText);
          parsed = {};
        }

        if (isValidPlan(parsed)) {
          plan = { estimatedDays: parsed.estimated_days, stages: parsed.stages };
        } else if (Array.isArray(parsed.lessons) && parsed.lessons.length > 0) {
          // Legacy flat-array shape — wrap it as a single stage.
          plan = {
            estimatedDays: parsed.lessons.length,
            stages: [{ name: "Learn", lessons: parsed.lessons }],
          };
        } else {
          console.warn("AI plan was malformed. Falling back to the heuristic plan.");
          plan = fallbackPlan(finalLevel, finalDailyMinutes, finalStyle);
          setUsedFallback(true);
        }
      }

      setPlanDays(plan.estimatedDays);
      setPlanStages(plan.stages);

      // Keep each lesson's stage name attached as we flatten, so it can
      // be persisted to the database (Phase 3) instead of being lost.
      const flattenedLessons = plan.stages.flatMap((stage) =>
        stage.lessons.map((lesson) => ({ ...lesson, stage: stage.name }))
      );

      // course-db.ts automatically attaches user_id.
      const savedCourseRecord = await saveCourse({
        topic: normalizedGoal,
        level: finalLevel,
        target_days: plan.estimatedDays,
        total_lessons: flattenedLessons.length,
        current_lesson: 1,
        completed_lessons: 0,
        progress: 0,
      });

      console.log("Course created:", savedCourseRecord.id);

      sessionStorage.setItem(creationKey, savedCourseRecord.id);
      setSavedCourseId(savedCourseRecord.id);

      // lesson-db.ts automatically attaches user_id. Lesson content is
      // generated on demand later (see /api/generate-lesson) when the
      // learner opens a specific lesson — not here.
      await saveLessons(
        flattenedLessons.map((lesson) => ({
          course_id: savedCourseRecord.id,
          lesson_number: lesson.lesson_number,
          title: lesson.title,
          content: "",
          completed: false,
          stage: lesson.stage,
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
      <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">
        <GlowBackground />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
          <div className="rounded-3xl border border-red-400/20 bg-red-400/[0.06] p-8 text-center">
            <p className="text-lg font-semibold text-red-300">Something went wrong</p>
            <p className="mt-2 text-sm text-slate-400">A valid learning goal is required.</p>
          </div>
        </div>
      </main>
    );
  }

  // ---- Wizard steps: Level -> Daily time -> Learning style ----
  if (wizardStep !== "generating") {
    return (
      <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">
        <GlowBackground />

        <div className="relative z-10 mx-auto max-w-2xl px-6 py-14 lg:py-20">

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 text-xs font-medium text-cyan-300"
          >
            <Sparkles size={14} />
            Building your personalized journey
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500/10 via-violet-500/10 to-cyan-500/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Learning goal
            </p>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold">
              <Target size={22} className="text-cyan-400 shrink-0" />
              {normalizedGoal}
            </h1>
          </motion.div>

          <div className="mb-8 flex items-center justify-center gap-2">
            {WIZARD_STEP_ORDER.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 w-16 rounded-full transition ${
                  WIZARD_STEP_ORDER.indexOf(wizardStep) >= i
                    ? "bg-gradient-to-r from-blue-500 to-violet-600"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>

          <motion.div
            key={wizardStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-white/10 bg-white/[0.035] p-8 backdrop-blur-xl"
          >

            {wizardStep === "level" && (
              <>
                <h2 className="mb-1 text-2xl font-bold">What&apos;s your current level?</h2>
                <p className="mb-6 text-sm text-slate-400">
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
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.06]"
                    >
                      <p className="font-semibold text-white">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {wizardStep === "time" && (
              <>
                <h2 className="mb-1 text-2xl font-bold">
                  How much time can you study each day?
                </h2>
                <p className="mb-6 text-sm text-slate-400">
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
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-center font-semibold text-white transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.06]"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep("level")}
                  className="mt-6 text-sm font-medium text-slate-500 hover:text-slate-300"
                >
                  ← Back
                </button>
              </>
            )}

            {wizardStep === "style" && (
              <>
                <h2 className="mb-1 text-2xl font-bold">What learning style fits you?</h2>
                <p className="mb-6 text-sm text-slate-400">
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
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-left transition hover:border-cyan-400/40 hover:bg-cyan-400/[0.06]"
                    >
                      <p className="font-semibold text-white">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setWizardStep("time")}
                  className="mt-6 text-sm font-medium text-slate-500 hover:text-slate-300"
                >
                  ← Back
                </button>
              </>
            )}

          </motion.div>
        </div>
      </main>
    );
  }

  // ---- Generating / result screen ----
  return (
    <main className="min-h-screen overflow-hidden bg-[#070A12] text-white">
      <GlowBackground />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-14 lg:py-20">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500/15 via-violet-500/15 to-cyan-500/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl"
        >
          <div className="absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold sm:text-4xl">
                <Target size={28} className="text-cyan-400 shrink-0" />
                Your Personalized Journey
              </h1>
              <p className="text-slate-400">
                Your AI tutor designed this journey around your goal, level, and pace.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[28px] border border-white/10 bg-white/[0.035] p-8 backdrop-blur-xl"
          >

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Learning Goal
            </p>
            <h3 className="mt-1 flex items-center gap-2 text-3xl font-bold">
              <Target size={22} className="text-cyan-400 shrink-0" />
              {course.topic}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {level} · {dailyMinutes} min/day · {style}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Estimated duration
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {planDays}
                  <span className="text-sm font-normal text-slate-500"> days</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Lessons
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {planStages.reduce((n, s) => n + s.lessons.length, 0)}
                </p>
              </div>
            </div>

            {planStages.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Your journey
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {planStages.map((stage, i) => {
                    const Icon = STAGE_ICONS[stage.name] ?? Sparkles;
                    return (
                      <div
                        key={`${stage.name}-${i}`}
                        className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-cyan-300">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            Stage {i + 1} — {stage.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {stage.lessons.length} lesson{stage.lessons.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {usedFallback && !errorMessage && (
              <p className="mt-4 text-xs text-amber-400/80">
                Your AI tutor was briefly unavailable, so this plan uses a simplified journey.
                You can try again below for a fully personalized one.
              </p>
            )}

            {errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-5">
                <p className="font-semibold text-red-300">Something went wrong</p>
                <p className="mt-1 text-sm text-red-300/80">{errorMessage}</p>
              </div>
            )}

            <div className="mt-8 border-t border-white/[0.07] pt-8">
              {savedCourseId ? (
                <button
                  type="button"
                  onClick={openCourse}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02] hover:shadow-blue-500/30"
                >
                  Start Learning Now
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </button>
              ) : errorMessage ? (
                <button
                  type="button"
                  onClick={retryCreation}
                  className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:scale-[1.02]"
                >
                  Try Again
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  suppressHydrationWarning
                  className="cursor-not-allowed rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold text-slate-400"
                >
                  Designing your journey...
                </button>
              )}
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-center rounded-[28px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Today&apos;s Progress
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">{progress}% Complete</p>

            <div className="mt-6 flex items-center gap-2 text-cyan-300">
              <CheckCircle2 size={18} />
              <span className="text-sm font-semibold">Let&apos;s get started!</span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-slate-500">
              <Flame size={16} className="text-orange-400" />
              <span className="text-xs">Streak resets when your first lesson is done</span>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#070A12] text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
              <BrainCircuit size={26} />
            </div>
            <p className="text-sm text-slate-400">Preparing your learning space...</p>
          </div>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
