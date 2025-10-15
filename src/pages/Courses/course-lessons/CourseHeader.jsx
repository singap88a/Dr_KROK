import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  FaBookOpen, 
  FaUsers, 
  FaClock, 
  FaStar, 
  FaRegStar,
  FaArrowLeft 
} from "react-icons/fa";

const CourseHeader = ({ 
  course, 
  courseProgress, 
  progressLoading, 
  hasAccess, 
  onPurchaseClick 
}) => {
  const { t } = useTranslation();

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-sm text-text-muted" />);
      }
    }
    return stars;
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="mb-6">
      <Link
        to={`/courses/${course.id}`}
        className="inline-flex items-center gap-2 mb-4 transition-colors text-primary hover:text-secondary"
      >
        <FaArrowLeft />
        <span>{t("courses.backToCourse", "Back to Course")}</span>
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaBookOpen className="text-primary" />
              <span>
                {course.lessons?.length || 0} {t("courses.lessons", "Lessons")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaUsers className="text-primary" />
              <span>
                {course.enrolled_count || 0} {t("courses.students", "Students")}
              </span>
            </div>
            {courseProgress && (
              <div className="flex items-center gap-2">
                <FaClock className="text-primary" />
                <span>
                  {t("courses.progress", "Progress")}:{" "}
                  {progressLoading
                    ? "..."
                    : `${Math.round(courseProgress?.overall?.percentage || 0)}%`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(course.avg_rating || 0)}
              </div>
              <span className="text-sm">
                {(course.avg_rating || 0).toFixed(1)} (
                {course.ratings_count || 0})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelColor(
                course.level
              )}`}
            >
              {course.level}
            </span>
            <span className="px-3 py-1 text-xs font-semibold border rounded-full bg-surface border-border">
              {course.language}
            </span>
            {course.category && (
              <span className="px-3 py-1 text-xs font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
                {course.category.name}
              </span>
            )}
          </div>

          {courseProgress && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="text-text-muted">
                  {t("courses.overallProgress", "Overall Progress")}
                </span>
                <span className="font-medium">
                  {Math.round(courseProgress?.overall?.percentage || 0)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-accent">
                <div
                  className={`h-2 rounded-full ${
                    Math.round(courseProgress?.overall?.percentage || 0) === 100
                      ? "bg-green-500"
                      : "bg-primary"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, Math.round(courseProgress?.overall?.percentage || 0))
                    )}%`,
                  }}
                />
              </div>
              {Math.round(courseProgress?.overall?.percentage || 0) === 100 && (
                <div className="inline-block px-2 py-1 mt-2 text-xs font-semibold text-green-700 bg-green-100 rounded">
                  {t("courses.completed", "Completed")}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                $
                {(Number(course.discount) > 0
                  ? Number(course.price) - Number(course.discount)
                  : Number(course.price)
                ).toFixed(2)}
              </span>
              {Number(course.discount) > 0 && (
                <>
                  <span className="text-lg line-through text-text-muted">
                    ${Number(course.price).toFixed(2)}
                  </span>
                  <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded">
                    {Math.round(
                      (Number(course.discount) / Number(course.price)) * 100
                    )}
                    %
                  </span>
                </>
              )}
            </div>
          </div>
          {!hasAccess && (
            <button
              onClick={onPurchaseClick}
              className="px-6 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r bg-primary to-secondary hover:shadow-lg hover:scale-105"
            >
              {t("courses.enrollNow", "Enroll Now")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;