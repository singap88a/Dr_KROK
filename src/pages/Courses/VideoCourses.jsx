import React from "react";
import { FiHeart } from "react-icons/fi";
import RatingStars from "./components/RatingStars";

export default function VideoCourses({ courses, favoriteIds, onToggleFavorite, goToDetails, t }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 group"
          onClick={() => goToDetails(course)}
        >
          <div className="relative h-48 overflow-hidden">
            <img
              src={course.img}
              alt={course.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
            <button
              aria-label="toggle favorite"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(course.id, "video");
              }}
              className="absolute z-10 p-2 transition-all duration-200 bg-white rounded-full shadow top-3 right-3 hover:bg-white/90"
            >
              <FiHeart className={`text-xl ${favoriteIds.includes(course.id) ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
            </button>
            {course.discount > 0 && (
              <span className="absolute px-2 py-1 text-xs font-bold text-white bg-red-600 rounded shadow top-3 left-3">
                {Math.round((course.discount / course.price) * 100)}%
              </span>
            )}
          </div>
          <div className="flex flex-col flex-1 px-6 pt-6">
            <h3 className="mb-2 text-lg font-bold text-primary line-clamp-1">{course.title}</h3>
            <p className="flex-1 mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{course.description}</p>
            <div className="mb-3 space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={course.instructorImg}
                    alt={course.instructor}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{course.instructor}</span>
                </div>
                <span>{course.lessons} {t("courses.lessons")}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <RatingStars value={course.rating} size={14} />
                  <span className="text-xs text-gray-500">({course.rating.toFixed(1)})</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl font-bold text-primary">₴{(course.price - course.discount).toFixed(2)}</span>
                  {course.discount > 0 && (
                    <span className="ml-2 text-sm text-gray-400 line-through">₴{course.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 pb-4">
            <button
              onClick={() => goToDetails(course)}
              className="block w-full px-4 py-2 text-sm font-medium text-center text-white rounded-xl bg-primary hover:shadow-md hover:brightness-110"
            >
              {t("courses.details", "تفاصيل")}
            </button>
          </div>
        </div>
      ))}

      {courses.length === 0 && (
        <div className="p-8 text-center bg-white shadow col-span-full dark:bg-gray-800 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("courses.noResults", "No results found")}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {t("courses.tryDifferentSearch", "Try different search keywords or choose another course type.")}
          </p>
        </div>
      )}
    </div>
  );
}
