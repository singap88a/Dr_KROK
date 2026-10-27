import React from "react";
import { Link } from "react-router-dom";
import { FaBook, FaCalendarAlt, FaEye, FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export default function RatingCard({ rating, formatDate }) {
  const { t } = useTranslation();

  const renderStars = (rateNumber) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FaStar
        key={i}
        className={`text-lg ${i < rateNumber ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="relative overflow-hidden transition-all duration-300 border shadow-md bg-surface border-border rounded-2xl hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
      <div className="relative p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Course Image */}
          <div className="relative flex-shrink-0">
            <div className="relative overflow-hidden shadow-sm w-28 h-28 bg-gradient-to-br from-accent to-border rounded-xl">
              {rating.course?.image ? (
                <img
                  src={rating.course.image}
                  alt={rating.course.title}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <FaBook className="text-3xl text-text-muted" />
                </div>
              )}
            </div>
            {/* Rating badge */}
            <div className="absolute px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg -top-2 -right-2 bg-primary">
              {rating.rate_number}/5
            </div>
          </div>

          {/* Rating Content */}
          <div className="flex-1 min-w-0">
            {/* Header with title and date */}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold leading-tight text-text">
                  {rating.course?.title || `Course #${rating.id}` || t("courses.unknownCourse") || "Unknown Course"}
                </h3>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-primary" />
                    {formatDate(rating.created_at)}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-accent text-text-secondary">
                    {t("courses.courseRated") || "Rated"}
                  </span>
                </div>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1">{renderStars(rating.rate_number)}</div>
              <span className="px-2 py-1 text-sm font-semibold rounded-md text-text bg-yellow-50 dark:bg-yellow-900/20">
                {rating.rate_number} out of 5 stars
              </span>
            </div>

            {/* Comment */}
            {rating.rate_comment && (
              <div className="p-4 mb-4 border-l-4 rounded-lg bg-accent border-primary">
                <p className="italic leading-relaxed text-text-secondary">
                  "{rating.rate_comment}"
                </p>
              </div>
            )}

            {/* Course Info */}
            <div className="flex flex-wrap gap-3 mb-4">
              {rating.course?.instructor && (
                <Link
                  to={`/instructors/${rating.course.instructor.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 transition-colors rounded-lg dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  {rating.course.instructor.image && (
                    <img
                      src={rating.course.instructor.image}
                      alt={rating.course.instructor.name}
                      className="object-cover w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{rating.course.instructor.name || rating.course.instructor}</span>
                </Link>
              )}
              {rating.course?.category && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 rounded-lg dark:text-green-300 bg-green-50 dark:bg-green-900/20">
                  <FaBook className="text-green-500" />
                  <span>
                    {typeof rating.course.category === "string"
                      ? rating.course.category
                      : rating.course.category.name}
                  </span>
                </div>
              )}
              {!rating.course && (
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-text-muted bg-accent">
                  <FaBook className="text-text-muted" />
                  <span>Course Information Not Available</span>
                </div>
              )}
            </div>

            {/* View Course Button */}
            <div className="flex justify-end">
              <Link
                to={rating.course?.id ? `/courses/${rating.course.id}` : "/courses"}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 rounded-lg bg-primary hover:bg-secondary hover:shadow-lg hover:scale-105"
              >
                <FaEye />
                <span>{t("courses.viewCourse") || "View Course"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
