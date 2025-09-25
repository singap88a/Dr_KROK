import React from "react";
import { FaPlayCircle, FaUserTie, FaClock } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import RatingStars from "./RatingStars";
import { Link } from "react-router-dom";

export default function VideoCourseCard({ course, onClick, isFavorite, onToggleFavorite }) {
  return (
    <article
      onClick={() => onClick(course)}
      className="overflow-hidden transition transform bg-white shadow-md cursor-pointer group dark:bg-gray-800 rounded-2xl hover:-translate-y-2 hover:shadow-xl"
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${course.title}`}
    >
      <div className="relative w-full h-44 sm:h-48 lg:h-40">
        <img
          src={course.img}
          alt={course.title}
          className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-400"
        />
        <div className="absolute px-2 py-1 text-xs text-white rounded top-3 left-3 bg-black/40 backdrop-blur">
          <FaPlayCircle className="inline mr-2" /> Video
        </div>
        <button
          aria-label="toggle favorite"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(course.id);
          }}
          className="absolute z-10 p-2 transition-all duration-200 bg-white rounded-full shadow top-3 right-3 hover:bg-white/90"
        >
          <FiHeart className={`text-xl ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
        </button>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FaUserTie /> <span className="">{course.instructor}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <FaClock /> <span>{course.hours}h</span>
            </div>
          </div>

          <div className="text-right">
            {/* السعر بعد الخصم */}
            <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {course.discount && course.discount > 0
                ? (course.price - course.discount).toFixed(2)
                : course.price.toFixed(2)}
            </div>
            {/* السعر الأصلي */}
            {course.discount && course.discount > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 line-through dark:text-gray-400">
                  ${course.price.toFixed(2)}
                </span>
 
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {course.students} students
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <RatingStars value={course.rating} size={13} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {course.rating}
            </span>
          </div>
          <Link to={`/courses/${course.id}`}>
                    <button
            onClick={(e) => {
              e.stopPropagation(); /* quick-buy placeholder */
            }}
            className="px-3 py-1 text-sm text-white transition rounded-lg bg-primary "
          >
            View
          </button>
          </Link>

        </div>
      </div>
    </article>
  );
}
