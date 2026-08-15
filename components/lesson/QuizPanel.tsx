"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleHelp,
  Loader2,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { saveMistake } from "@/lib/mistake-db";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

interface QuizPayload {
  questions: QuizQuestion[];
}

interface QuizPanelProps {
  topic: string;
  lessonTitle: string;
  lessonContent: string;
  courseId: string;
  lessonId: string;
  quiz: QuizPayload | null;
  quizError: string | null;
  onQuizGenerated: (quiz: QuizPayload) => void;
  onQuizError: (error: string | null) => void;
  onPassed: (score: number, total: number) => void;
}

export default function QuizPanel({
  topic,
  lessonTitle,
  lessonContent,
  courseId,
  lessonId,
  quiz,
  quizError,
  onQuizGenerated,
  onQuizError,
  onPassed,
}: QuizPanelProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  async function generateQuiz(previousQuestions: string[] = []) {
    setGenerating(true);
    setSubmitted(false);
    setScore(null);
    setSelectedAnswers([]);
    setExplanations([]);
    onQuizError(null);

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
        onQuizGenerated({ questions: [] });
        onQuizError(data?.error || "Quiz generation failed.");
        return;
      }

      onQuizGenerated(data);
    } catch (error) {
      console.error("Quiz generation error:", error);
      onQuizError("Unable to generate the quiz. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function submitQuiz() {
    if (!quiz?.questions?.length || submitting) {
      return;
    }

    const unanswered = quiz.questions.some(
      (_, index) => selectedAnswers[index] === undefined
    );

    if (unanswered) {
      onQuizError("Please answer every question before submitting.");
      return;
    }

    setSubmitting(true);
    onQuizError(null);

    let totalScore = 0;

    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        totalScore += 1;
      }
    });

    setScore(totalScore);
    setSubmitted(true);

    const passed = totalScore >= Math.ceil(quiz.questions.length * 0.67);

    if (passed) {
      onPassed(totalScore, quiz.questions.length);
      setSubmitting(false);
      return;
    }

    const explanationList: string[] = [];

    try {
      for (let index = 0; index < quiz.questions.length; index++) {
        const question = quiz.questions[index];

        if (selectedAnswers[index] !== question.answer) {
          const response = await fetch("/api/explain-answer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: question.question,
              options: question.options,
              correctAnswer: question.options[question.answer],
              userAnswer: question.options[selectedAnswers[index]],
            }),
          });

          const data = await response.json();

          const explanationText =
            data?.explanation || "Review this question and try again.";

          explanationList.push(explanationText);

          // Persist this mistake so weak areas / past mistakes can be
          // surfaced later — failure here should never block the quiz.
          void saveMistake({
            course_id: courseId,
            lesson_id: lessonId,
            question: question.question,
            options: question.options,
            correct_answer: question.options[question.answer],
            user_answer: question.options[selectedAnswers[index]],
            explanation: explanationText,
          });
        }
      }

      setExplanations(explanationList);
    } catch (error) {
      console.error("Explanation error:", error);
      setExplanations([
        "Some explanations could not be loaded. Please review the incorrect answers and try the quiz again.",
      ]);
    } finally {
      setSubmitting(false);
    }
  }

  function chooseAnswer(questionIndex: number, optionIndex: number) {
    if (submitted) {
      return;
    }

    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(updatedAnswers);
  }

  if (generating) {
    return (
      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <Loader2
              size={22}
              className="animate-spin text-violet-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Creating your quiz
            </h2>

            <p className="text-sm text-slate-400">
              EduGPT is preparing questions from this lesson.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!quiz?.questions?.length) {
    return (
      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10">
            <CircleHelp className="text-blue-400" size={22} />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              Lesson Quiz
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Test your understanding before completing this lesson.
            </p>

            {quizError && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {quizError}
              </p>
            )}

            <button
              type="button"
              onClick={() => generateQuiz()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-3 font-semibold text-white transition hover:scale-[1.02]"
            >
              <Sparkles size={17} />
              Generate Quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/10 backdrop-blur-xl lg:p-8">

      {/* Header */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
            <CircleHelp className="text-violet-400" size={22} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              Knowledge Check
            </h2>

            <p className="text-sm text-slate-400">
              {quiz.questions.length} questions • Pass to complete the lesson
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={generating || submitting}
          onClick={() =>
            generateQuiz(
              quiz.questions.map((question) => question.question)
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
        >
          <RefreshCw size={16} />
          New Quiz
        </button>

      </div>

      {/* Questions */}

      <div className="space-y-6">

        {quiz.questions.map((question, questionIndex) => (
          <motion.div
            key={`${question.question}-${questionIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: questionIndex * 0.05,
            }}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
          >

            <div className="mb-5 flex items-start gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-sm font-bold text-slate-300">
                {questionIndex + 1}
              </div>

              <h3 className="pt-1 font-semibold leading-7 text-white">
                {question.question}
              </h3>

            </div>

            <div className="space-y-3">

              {question.options.map((option, optionIndex) => {
                const isSelected =
                  selectedAnswers[questionIndex] === optionIndex;

                const isCorrect =
                  submitted && optionIndex === question.answer;

                const isWrong =
                  submitted &&
                  isSelected &&
                  optionIndex !== question.answer;

                return (
                  <button
                    key={optionIndex}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      chooseAnswer(questionIndex, optionIndex)
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isCorrect
                        ? "border-emerald-500/60 bg-emerald-500/10"
                        : isWrong
                        ? "border-red-500/60 bg-red-500/10"
                        : isSelected
                        ? "border-blue-500/60 bg-blue-500/10"
                        : "border-slate-700 bg-slate-900/70 hover:border-slate-500 hover:bg-slate-800"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          isCorrect
                            ? "border-emerald-400 text-emerald-400"
                            : isWrong
                            ? "border-red-400 text-red-400"
                            : isSelected
                            ? "border-blue-400 text-blue-400"
                            : "border-slate-600 text-slate-400"
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </div>

                      <span className="text-sm leading-6 text-slate-200">
                        {option}
                      </span>

                      {isCorrect && (
                        <CheckCircle2
                          size={18}
                          className="ml-auto shrink-0 text-emerald-400"
                        />
                      )}

                      {isWrong && (
                        <XCircle
                          size={18}
                          className="ml-auto shrink-0 text-red-400"
                        />
                      )}

                    </div>

                  </button>
                );
              })}

            </div>

          </motion.div>
        ))}

      </div>

      {/* Error */}

      {quizError && (
        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {quizError}
        </div>
      )}

      {/* Result */}

      {submitted && score !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 rounded-2xl border p-5 ${
            score >= Math.ceil(quiz.questions.length * 0.67)
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-amber-500/30 bg-amber-500/10"
          }`}
        >
          <p className="text-lg font-bold text-white">
            {score >= Math.ceil(quiz.questions.length * 0.67)
              ? "🎉 Great work!"
              : "Keep going — you're close."}
          </p>

          <p className="mt-1 text-sm text-slate-300">
            Score: {score}/{quiz.questions.length}
          </p>

          {score < Math.ceil(quiz.questions.length * 0.67) && (
            <p className="mt-2 text-sm text-slate-400">
              Review the explanations below and try another quiz.
            </p>
          )}
        </motion.div>
      )}

      {/* Explanations */}

      {explanations.length > 0 && (
        <div className="mt-6 space-y-4">

          <h3 className="text-lg font-bold text-white">
            Review Your Mistakes
          </h3>

          {explanations.map((explanation, index) => (
            <div
              key={`${explanation}-${index}`}
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
            >
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <Sparkles size={16} />
                <span className="text-sm font-semibold">
                  AI Explanation
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {explanation}
              </p>
            </div>
          ))}

        </div>
      )}

      {/* Submit */}

      {!submitted && (
        <div className="mt-8 flex justify-end">

          <button
            type="button"
            onClick={submitQuiz}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Submit Quiz
              </>
            )}
          </button>

        </div>
      )}

    </section>
  );
}