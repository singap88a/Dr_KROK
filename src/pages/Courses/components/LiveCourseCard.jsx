import React from "react";
import { FaVideo, FaUserTie, FaClock, FaUsers } from "react-icons/fa";
import RatingStars from "./RatingStars";

export default function LiveCourseCard({ course, onClick }) {
  return (
    <article
      onClick={() => onClick(course)}
      className="group cursor-pointer bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg overflow-hidden transform transition hover:scale-[1.01] hover:shadow-2xl"
      role="button"
      tabIndex={0}
      aria-label={`Open details for ${course.title}`}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full h-40 sm:w-60 sm:h-auto">
          <img src={course.img} alt={course.title} className="object-cover w-full h-full" />
          <div className="absolute flex items-center gap-1 px-2 py-1 text-xs text-white bg-red-500 rounded top-3 left-3">
            <FaVideo /> Live
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{course.title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{course.description}</p>

          <div className="grid grid-cols-1 gap-2 mt-3 text-sm text-gray-600 sm:grid-cols-2 dark:text-gray-300">
            <div className="flex items-center gap-2"><FaUserTie /> {course.instructor}</div>
            <div className="flex items-center gap-2"><FaClock /> {course.date}</div>
            <div className="flex items-center gap-2"><FaClock /> {course.sessionDuration}</div>
            <div className="flex items-center gap-2"><FaUsers /> {course.students} enrolled</div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <RatingStars value={course.rating} />
              <span className="text-sm text-gray-600 dark:text-gray-300">{course.rating}</span>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">${course.price}</div>
              <button
                onClick={(e) => { e.stopPropagation(); /* join placeholder */ }}
                className="px-3 py-1 mt-2 text-sm text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-500"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
