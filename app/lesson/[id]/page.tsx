"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/supabase-auth";

import Header from "@/components/lesson/Header";
import Sidebar from "@/components/lesson/Sidebar";
import LessonContent from "@/components/lesson/LessonContent";
import TutorPanel from "@/components/lesson/TutorPanel";
import QuizPanel from "@/components/lesson/QuizPanel";
import CompletionPanel from "@/components/lesson/CompletionPanel";
import Loading from "@/components/lesson/Loading";

interface LessonMessage {
  role: "user" | "assistant";
  message: string;
}

interface LessonRecord {
  id: string;
  lesson_number: number;
  title: string;
  content: string;
  completed: boolean;
  course_id: string;
  user_id: string;
  stage?: string;
}

interface CourseRecord {
  id: string;
  topic: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  streak: number;
  user_id: string;
}

interface LessonListItem {
  id: string;
  lesson_number: number;
  title: string;
  completed: boolean;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface QuizPayload {
  questions: QuizQuestion[];
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<LessonRecord | null>(null);
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [messages, setMessages] = useState<LessonMessage[]>([]);

  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null
  );

  const currentLessonProgress = useMemo(() => {
    if (!lesson || !course || course.total_lessons <= 0) {
      return 0;
    }

    return Math.round(
      (lesson.lesson_number / course.total_lessons) * 100
    );
  }, [lesson, course]);

  async function generateQuiz(
    topic: string,
    lessonTitle: string,
    lessonContent: string,
    previousQuestions: string[] = []
  ) {
    setQuizError(null);

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          lessonTitle,
          lessonContent,
          previousQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.questions?.length) {
        setQuiz(null);
        setQuizError(
          data?.error || "Unable to generate the lesson quiz."
        );
        return;
      }

      setQuiz(data);
    } catch (error) {
      console.error("Quiz generation error:", error);
      setQuiz(null);
      setQuizError(
        "Something went wrong while generating the quiz."
      );
    }
  }

  async function loadLesson() {
    setLoading(true);
    setCompletionMessage(null);
    setQuizPassed(false);

    try {
      const user = await getAuthenticatedUser();

      if (!user) {
        setLoading(false);
        return;
      }

      /*
       * Load the lesson belonging to the logged-in user.
       */
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (lessonError || !lessonData) {
        console.error("Lesson loading error:", lessonError);
        router.replace("/dashboard");
        return;
      }

      /*
       * Load the course belonging to the same user.
       */
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", lessonData.course_id)
        .eq("user_id", user.id)
        .single();

      if (courseError || !courseData) {
        console.error("Course loading error:", courseError);
        router.replace("/dashboard");
        return;
      }

      /*
       * Load all lessons for the course.
       */
      const { data: lessonList, error: lessonListError } = await supabase
        .from("lessons")
        .select("id, lesson_number, title, completed")
        .eq("course_id", courseData.id)
        .eq("user_id", user.id)
        .order("lesson_number", { ascending: true });

      if (lessonListError) {
        console.error("Lesson list error:", lessonListError);
      }

      /*
       * Generate lesson content if it does not exist yet.
       */
      let currentLesson = lessonData as LessonRecord;

      if (!currentLesson.content?.trim()) {
        const lessonResponse = await fetch("/api/generate-lesson", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: courseData.topic,
            title: currentLesson.title,
          }),
        });

        const lessonResult = await lessonResponse.json();

        if (!lessonResponse.ok || !lessonResult?.content) {
          throw new Error(
            lessonResult?.error || "Unable to generate lesson content."
          );
        }

        currentLesson = {
          ...currentLesson,
          content: lessonResult.content,
        };

        await supabase
          .from("lessons")
          .update({
            content: lessonResult.content,
          })
          .eq("id", currentLesson.id)
          .eq("user_id", user.id);
      }

      /*
       * Load AI mentor history for this lesson and this user.
       */
      const { data: previousMessages, error: messagesError } =
        await supabase
          .from("lesson_messages")
          .select("role, message")
          .eq("lesson_id", currentLesson.id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

      if (messagesError) {
        console.error("Message loading error:", messagesError);
      }

      setLesson(currentLesson);
      setCourse(courseData);
      setLessons((lessonList || []) as LessonListItem[]);
      setMessages((previousMessages || []) as LessonMessage[]);

      /*
       * Generate the first quiz automatically.
       */
      await generateQuiz(
        courseData.topic,
        currentLesson.title,
        currentLesson.content
      );
    } catch (error) {
      console.error("Unable to load lesson:", error);
      setQuizError(
        error instanceof Error
          ? error.message
          : "Unable to load this lesson."
      );
    } finally {
      setLoading(false);
    }
  }

  async function completeLesson() {
    if (!lesson || !quizPassed || saving) {
      return;
    }

    setSaving(true);
    setCompletionMessage(null);

    try {
      const response = await fetch("/api/complete-lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Unable to complete the lesson."
        );
      }

      setLesson((current) =>
        current
          ? {
              ...current,
              completed: true,
            }
          : current
      );

      if (result.nextLessonId) {
        setCompletionMessage(
          "Lesson completed. Opening your next lesson..."
        );

        setTimeout(() => {
          router.push(`/lesson/${result.nextLessonId}`);
        }, 900);

        return;
      }

      if (result.isCourseComplete && result.certificateId) {
        setCompletionMessage(
          "Course completed. Opening your certificate..."
        );

        setTimeout(() => {
          router.push(
            `/course/${result.courseId}/certificate`
          );
        }, 900);

        return;
      }

      setCompletionMessage(
        "Lesson completed. Returning to your course..."
      );

      setTimeout(() => {
        router.push(`/course/${result.courseId}`);
      }, 900);
    } catch (error) {
      console.error("Completion error:", error);

      setCompletionMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete the lesson."
      );
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadLesson();
    }
  }, [id]);

  if (loading) {
    return <Loading message="Preparing your learning workspace..." />;
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 text-white">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
          <h2 className="text-xl font-bold">
            Lesson not found
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            We couldn't load this lesson.
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Header
        courseTitle={course.topic}
        lessonTitle={lesson.title}
        lessonNumber={lesson.lesson_number}
        xp={0}
        duration={15}
      />

      <div className="grid min-h-[calc(100vh-5rem)] grid-cols-12">

        {/* LEFT SIDEBAR */}

        <div className="col-span-12 hidden lg:col-span-2 lg:block">
          <div className="sticky top-20 h-[calc(100vh-5rem)]">
            <Sidebar
              courseTitle={course.topic}
              lessons={lessons}
              currentLessonId={lesson.id}
              progress={course.progress}
              xp={0}
              streak={course.streak || 0}
              onLessonClick={(lessonId) => {
                router.push(`/lesson/${lessonId}`);
              }}
            />
          </div>
        </div>

        {/* CENTER */}

        <div className="col-span-12 min-w-0 lg:col-span-7">
          <LessonContent
            lessonNumber={lesson.lesson_number}
            title={lesson.title}
            content={lesson.content}
            progress={currentLessonProgress}
          />

          <div className="bg-slate-950 px-6 pb-10 lg:px-10">
            <div className="mx-auto max-w-4xl">

              <QuizPanel
                topic={course.topic}
                lessonTitle={lesson.title}
                lessonContent={lesson.content}
                courseId={course.id}
                lessonId={lesson.id}
                quiz={quiz}
                quizError={quizError}
                onQuizGenerated={(newQuiz) => {
                  setQuiz(newQuiz);
                  setQuizError(null);
                }}
                onQuizError={setQuizError}
                onPassed={(score, total) => {
                  setQuizPassed(true);
                  setCompletionMessage(
                    `🎉 Quiz passed — ${score}/${total}. You can now complete the lesson.`
                  );
                }}
              />

              <CompletionPanel
                completed={lesson.completed}
                quizPassed={quizPassed}
                saving={saving}
                completionMessage={completionMessage}
                onComplete={completeLesson}
              />

              <div className="h-10" />
            </div>
          </div>
        </div>

        {/* RIGHT AI TUTOR */}

        <div className="col-span-12 hidden lg:col-span-3 lg:block">
          <div className="sticky top-20 h-[calc(100vh-5rem)]">
            <TutorPanel
              lessonId={lesson.id}
              messages={messages}
              onMessagesChange={setMessages}
            />
          </div>
        </div>

      </div>
    </div>
  );
}