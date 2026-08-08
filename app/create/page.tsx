"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/lib/course-db";
export default function CreatePage() {
  const router = useRouter();

  const [goal, setGoal] = useState("");
  const [days, setDays] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!goal.trim()) return;

    try {
  const savedCourse = await createCourse({
    topic: goal,
    level: "Beginner",
    target_days: days,
    total_lessons: days,
    current_lesson: 1,
    completed_lessons: 0,
    progress: 0,
  });
const response = await fetch("/api/generate-lessons", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    topic: goal,
    days,
  }),
});

const lessonData = await response.json();

console.log(lessonData);
  router.push(`/dashboard?courseId=${savedCourse.id}`);

} catch (err) {
  console.error(err);
  alert("Unable to create course.");
}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >

        <h1 className="text-3xl font-bold mb-6">
          Create Learning Plan
        </h1>

        <label className="block mb-2">
          What do you want to learn?
        </label>

        <input
          className="border rounded w-full p-3 mb-5"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Java, Python, AI..."
        />

        <label className="block mb-2">
          Number of days
        </label>

        <input
          type="number"
          className="border rounded w-full p-3 mb-6"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        />

        <button
          className="bg-blue-600 text-white w-full p-3 rounded"
        >
          Continue
        </button>

      </form>

    </div>
  );
}