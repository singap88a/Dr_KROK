// LiveCourseLessons/CourseHeader.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaBookOpen, FaClock } from "react-icons/fa";

export default function CourseHeader({ 
  course, 
  hasAccess, 
  isLoggedIn, 
  courseProgress, 
  progressLoading, 
  onPurchaseClick,
  renderStars,
  getLevelColor,
  t 
}) {
  return (
    <div className="mb-6">
      <Link
        to={`/live-courses/${course.id}`}
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
                {course.sections?.reduce((acc, section) => acc + (section.lessons?.length || 0), 0) || 0} {t("courses.lessons", "Lessons")}
              </span>
            </div>
            {isLoggedIn && (
              <div className="flex items-center gap-2">
                <FaClock className="text-primary" />
                <span>
                  {t("courses.progress", "Progress")}:{" "}
                  {progressLoading ? "..." : `${Math.round(courseProgress?.overall?.percentage || 0)}%`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(course.avg_rating || 0)}
              </div>
              <span className="text-sm">
                {(course.avg_rating || 0).toFixed(1)} ({course.ratings_count || 0})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelColor(course.level)}`}
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

          {isLoggedIn && (
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
                ₴
                {(
                  Number(course.discount) > 0
                    ? Number(course.price) - (Number(course.price) * Number(course.discount) / 100)
                    : Number(course.price)
                ).toFixed(2)}
              </span>
              {Number(course.discount) > 0 && (
                <>
                  <span className="text-lg line-through text-text-muted">
                    ₴{Number(course.price).toFixed(2)}
                  </span>
                  <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded">
                    {Math.round(Number(course.discount))}%
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
}