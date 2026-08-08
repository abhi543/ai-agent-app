import { Course } from "@/types/course";

export function createCourse(
  topic: string,
  days: number
): Course {
  return {
    id: "",
    topic,
    level: "Beginner",
    targetDays: days,
    totalLessons: days,
    currentLesson: 1,
    completedLessons: 0,
    progress: 0,
  };
}