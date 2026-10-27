import React from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaPlay } from "react-icons/fa";

export default function CourseAlreadyEnrolled({
  id,
  isCenterCourse,
  isLiveCourse,
  t,
}) {
  return (
    <section className="min-h-screen py-10 bg-background text-text">
      <div className="max-w-4xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="p-6 mx-auto mb-6 bg-green-100 border border-green-200 rounded-full w-fit dark:bg-green-900 dark:border-green-700">
            <FaCheck className="text-4xl text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-green-600 dark:text-green-400">
            {t("courses.already_enrolled", "Already Enrolled!")}
          </h1>
          <p className="mb-6 text-lg text-text-secondary">
            {t(
              "courses.already_enrolled_message",
              "You are already enrolled in this course. You can start learning now!"
            )}
          </p>
          <Link
            to={
              isCenterCourse
                ? `/center-courses/${id}`
                : isLiveCourse
                ? `/live-courses/${id}/lessons`
                : `/courses/${id}/lessons`
            }
            className="inline-flex items-center gap-2 px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
          >
            <FaPlay />
            {isCenterCourse
              ? t("courses.viewDetails", "View Details")
              : t("courses.start_learning", "Start Learning")}
          </Link>
        </div>
      </div>
    </section>
  );
}
