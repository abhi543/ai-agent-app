"use client";

import Link from "next/link";

interface Props {
  course: {
    id: string;
    topic: string;
    progress: number;
    completed_lessons: number;
    total_lessons: number;
  };
}

export default function CourseProgressCard({
  course,
}: Props) {

  return (

    <div className="bg-white rounded-2xl shadow-lg p-8">

      <h2 className="text-3xl font-bold mb-6">
        {course.topic}
      </h2>

      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

        <div
          className="bg-green-600 h-full"
          style={{
            width: `${course.progress}%`,
          }}
        />

      </div>

      <p className="mt-4 text-gray-600">

        {course.completed_lessons} / {course.total_lessons} Lessons Completed

      </p>

      <Link
        href={`/course/${course.id}`}
        className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
      >
        Continue Learning
      </Link>

    </div>

  );

}