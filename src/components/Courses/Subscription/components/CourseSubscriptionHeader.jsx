import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function CourseSubscriptionHeader({
  id,
  isCenterCourse,
  isLiveCourse,
  t,
}) {
  return (
    <div className="mb-8">
      <Link
        to={
          isCenterCourse
            ? `/center-courses/${id}`
            : isLiveCourse
            ? `/live-courses/${id}`
            : `/courses/${id}`
        }
        className="inline-flex items-center gap-2 mb-6 transition-colors text-primary hover:text-secondary"
      >
        <FaArrowLeft />
        <span>{t("courses.backToCourse", "Back to Course")}</span>
      </Link>

      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-text">
          {t("courses.subscribeToCourse", "Subscribe to Course")}
        </h1>
        <p className="text-lg text-text-secondary">
          {t(
            "courses.subscriptionDescription",
            "Get full access to all course content and start your learning journey"
          )}
        </p>
      </div>
    </div>
  );
}
