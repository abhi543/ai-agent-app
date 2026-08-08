"use client";

import { createCourse } from "@/lib/course";
import { saveLessons } from "@/lib/lesson-db";
import { createCourse as saveCourse } from "@/lib/course-db";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

interface GeneratedLesson {
  lesson_number: number;
  title: string;
  content: string;
}

interface LessonsPayload {
  lessons?: GeneratedLesson[];
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const goal = searchParams.get("goal");
  const days = searchParams.get("days");
  const normalizedGoal = goal?.trim() ?? "";

  const parsedDays = Number(days);

  const validDays =
    Number.isFinite(parsedDays) && parsedDays > 0
      ? parsedDays
      : 1;

  const course = createCourse(normalizedGoal, validDays);

  useEffect(() => {
    // Use validDays here (not the raw parsedDays) — a missing
    // ?days= param is a normal, valid case (defaults to 1 day),
    // not an error. Number(null) is 0, which would otherwise
    // fail this check even though validDays correctly falls
    // back to 1 for display above.
    if (!normalizedGoal || validDays < 1) {
      setErrorMessage(
        "A valid learning goal and duration are required."
      );
      return;
    }

    const creationKey = `course-created:${normalizedGoal}:${parsedDays}`;
    const creationLockKey = `course-creating:${normalizedGoal}:${parsedDays}`;

    // Already created in this browser session.
    const existingCourseId =
      sessionStorage.getItem(creationKey);

    if (existingCourseId) {
      console.log(
        "Course already exists:",
        existingCourseId
      );

      setSavedCourseId(existingCourseId);
      return;
    }

    // Prevent duplicate creation when the effect runs more than once.
    const alreadyCreating =
      sessionStorage.getItem(creationLockKey);

    if (alreadyCreating === "true") {
      console.log("Course creation already in progress.");
      return;
    }

    // IMPORTANT: Set the lock BEFORE any async operation.
    sessionStorage.setItem(
      creationLockKey,
      "true"
    );

    async function saveToDatabase() {
      try {
        setErrorMessage(null);

        // Confirm authentication.
        const user = await getAuthenticatedUser();

        if (!user) {
          sessionStorage.removeItem(creationLockKey);
          setErrorMessage("Please sign in to create your course.");
          return;
        }

        console.log(
          "Creating course for user:",
          user.id
        );

        // Create the course.
        // course-db.ts automatically attaches user_id.
        const savedCourse = await saveCourse({
          topic: normalizedGoal,
          level: "Beginner",
          target_days: parsedDays,
          total_lessons: parsedDays,
          current_lesson: 1,
          completed_lessons: 0,
          progress: 0,
        });

        console.log(
          "Course created:",
          savedCourse.id
        );

        // Save the course ID so the same course is not created again.
        sessionStorage.setItem(
          creationKey,
          savedCourse.id
        );

        setSavedCourseId(savedCourse.id);

        // Generate lessons.
        const response = await fetch(
          "/api/generate-lessons",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              topic: normalizedGoal,
              days: parsedDays,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error(
            "Lesson generation failed:",
            response.status,
            errorText
          );

          throw new Error(
            "Unable to generate lessons. Please try again."
          );
        }

        const lessonsText =
          await response.text();

        let lessons: LessonsPayload;

        try {
          lessons =
            JSON.parse(
              lessonsText
            ) as LessonsPayload;
        } catch {
          console.error(
            "Invalid lesson response:",
            lessonsText
          );

          throw new Error(
            "Unable to parse the generated lessons."
          );
        }

        const lessonItems =
          lessons?.lessons;

        if (!Array.isArray(lessonItems)) {
          throw new Error(
            "The lesson generator returned an invalid response."
          );
        }

        // Save generated lessons.
        // lesson-db.ts automatically attaches user_id.
        await saveLessons(
          lessonItems.map(
            (lesson: GeneratedLesson) => ({
              course_id: savedCourse.id,
              lesson_number:
                lesson.lesson_number,
              title: lesson.title,
              content: lesson.content,
              completed: false,
            })
          )
        );

        console.log(
          "All lessons saved successfully."
        );
      } catch (error) {
        // Supabase errors (PostgrestError etc.) are plain objects with
        // message/details/hint/code — not `instanceof Error` — so a bare
        // console.error(error) can print as "{}" in the browser console.
        // Log every likely field explicitly so the real reason is visible.
        console.error("Course creation failed. Raw error object:", error);
        console.error("Course creation failed. JSON:", JSON.stringify(error, null, 2));

        if (error && typeof error === "object") {
          const e = error as Record<string, unknown>;
          console.error("  message:", e.message);
          console.error("  details:", e.details);
          console.error("  hint:", e.hint);
          console.error("  code:", e.code);
        }

        // Allow retry if something failed.
        sessionStorage.removeItem(
          creationLockKey
        );

        sessionStorage.removeItem(
          creationKey
        );

        setSavedCourseId(null);

        const readableMessage =
          error instanceof Error
            ? error.message
            : error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : "Something went wrong while creating the course.";

        setErrorMessage(readableMessage);
      } finally {
        // Course creation is finished.
        sessionStorage.removeItem(
          creationLockKey
        );
      }
    }

    saveToDatabase();
  }, [goal, days, validDays, router]);

  const progress = course.progress;

  function openCourse() {
    if (!savedCourseId) {
      return;
    }

    router.push(`/course/${savedCourseId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">

      <div className="mx-auto max-w-4xl">

        {/* Logo */}

        <div className="mb-8 flex justify-center">

          <div className="h-16 w-16">

            <Image
              src="/logo.svg"
              alt="AI Tutor Logo"
              width={64}
              height={64}
              priority
            />

          </div>

        </div>

        {/* Header */}

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-2xl">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="mb-2 text-4xl font-bold">
                🎯 Your Learning Journey Begins
              </h1>

              <p className="text-lg text-blue-100">
                Your personalized AI tutor has prepared your learning plan.
              </p>

            </div>

            <div className="text-6xl opacity-20">
              📚
            </div>

          </div>

        </div>

        {/* Main Card */}

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

            {/* Learning Goal */}

            <div>

              <div className="mb-6">

                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Learning Goal
                </h2>

                <h3 className="mb-1 text-4xl font-bold text-gray-800">
                  🎯 {course.topic}
                </h3>

                <p className="text-gray-500">
                  Your main objective
                </p>

              </div>

              {/* Duration */}

              <div>

                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Duration
                </h2>

                <p className="text-3xl font-bold text-gray-800">

                  {course.targetDays}

                  <span className="text-lg text-gray-500">
                    {" "}days
                  </span>

                </p>

                <p className="text-gray-500">
                  Total learning period
                </p>

              </div>

            </div>

            {/* Progress */}

            <div className="flex flex-col justify-center rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6">

              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Today&apos;s Progress
              </h2>

              <div className="relative h-4 overflow-hidden rounded-full bg-gray-200">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

              <p className="mt-2 text-gray-600">
                {progress}% Complete
              </p>

              <p className="mt-5 text-center text-2xl font-bold text-blue-600">
                Let&apos;s get started! 🚀
              </p>

            </div>

          </div>

          {/* Error */}

          {errorMessage && (

            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 text-sm">
                {errorMessage}
              </p>

            </div>

          )}

          {/* Action */}

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
                onClick={() =>
                  window.location.reload()
                }
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