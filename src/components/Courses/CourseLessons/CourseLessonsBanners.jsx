import React from "react";
import { Link } from "react-router-dom";
import { FaCertificate, FaLock } from "react-icons/fa";

export default function CourseLessonsBanners({
  isCompleted,
  isExpired,
  courseId,
  t,
}) {
  if (isCompleted) {
    return (
      <div className="lg:col-span-3">
        <div className="flex flex-col items-center justify-center p-8 my-8 text-center border shadow-xl bg-surface rounded-3xl border-border animate-fade-in sm:p-12 sm:my-12">
          <div className="flex items-center justify-center w-20 h-20 mb-6 bg-green-100 rounded-full dark:bg-green-900/30 sm:w-24 sm:h-24">
            <FaCertificate className="text-4xl text-green-600 dark:text-green-400 sm:text-5xl" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {t("courses.courseCompletedTitle", "Course Successfully Passed!")}
          </h2>
          <p className="max-w-md mx-auto mb-8 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            {t(
              "courses.courseCompletedMessage",
              "You have successfully completed the requirements for this course. We wish you continued success."
            )}
          </p>
          <Link
            to={`/courses/${courseId}`}
            className="px-6 py-3 font-semibold text-white transition-all sm:px-8 bg-primary rounded-xl hover:bg-secondary hover:scale-105"
          >
            {t("courses.backToDetails", "العودة لتفاصيل الدورة")}
          </Link>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="lg:col-span-3">
        <div className="flex flex-col items-center justify-center p-8 my-8 text-center border shadow-xl bg-surface rounded-3xl border-border animate-fade-in sm:p-12 sm:my-12">
          <div className="flex items-center justify-center w-20 h-20 mb-6 bg-red-100 rounded-full dark:bg-red-900/30 sm:w-24 sm:h-24">
            <FaLock className="text-4xl text-red-600 dark:text-red-400 sm:text-5xl" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {t("courses.courseExpiredTitle", "Course Access Expired")}
          </h2>
          <p className="max-w-md mx-auto mb-8 text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            {t(
              "courses.courseExpiredMessage",
              "Your access period for this course has expired."
            )}
          </p>
          <Link
            to={`/courses/${courseId}`}
            className="px-6 py-3 font-semibold text-white transition-all sm:px-8 bg-primary rounded-xl hover:bg-secondary hover:scale-105"
          >
            {t("courses.backToDetails", "العودة لتفاصيل الدورة")}
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
