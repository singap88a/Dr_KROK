import React from "react";
import { FaVideo } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import RatingStars from "./RatingStars";

export default function LiveCourseCard({ course, onClick, isFavorite, onToggleFavorite }) {
  const instructorImg = course.instructorImg || '/user.png';

  return (
    <article
      onClick={() => onClick(course)}
      className="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 group"
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${course.title}`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.img}
          alt={course.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute px-2 py-1 text-xs text-white rounded top-3 left-3 bg-red-500/90 backdrop-blur">
          <FaVideo className="inline mr-1" /> Live
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
      <div className="flex flex-col flex-1 p-6">
        <h3 className="mb-2 text-lg font-bold text-primary line-clamp-1">{course.title}</h3>
        <p className="flex-1 mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{course.description}</p>
        <div className="mb-3 space-y-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={instructorImg}
                alt={course.instructor}
                className="w-5 h-5 rounded-full"
              />
              <span>{course.instructor}</span>
            </div>
            <span>{course.sessionDuration}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <RatingStars value={course.rating} size={12} />
              <span>{course.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">${course.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
