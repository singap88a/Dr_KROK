import React from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import RatingStars from "./RatingStars";

export default function VideoCourseCard({ course, isFavorite, onToggleFavorite }) {
  const hasDiscount = course.discount && course.discount > 0;
  const finalPrice = hasDiscount
    ? (course.price - course.discount).toFixed(2)
    : course.price.toFixed(2);
  const discountPercent = hasDiscount
    ? Math.round((course.discount / course.price) * 100)
    : 0;

  return (
    <div className="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 group">
      <Link
        to={`/courses/${course.id}`}
        style={{ textDecoration: "none" }}
        className="block"
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={course.img}
            alt={course.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute px-2 py-1 text-xs rounded text-[#fff] top-3 left-3 bg-[#0202023f] backdrop-blur">
            <FaPlayCircle className="inline mr-1" /> Video
          </div>
 
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
              <span>{course.lessons} lessons</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <RatingStars value={course.rating} size={12} />
                <span>{course.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-primary">${finalPrice}</span>
                {hasDiscount && (
                  <span className="ml-2 text-sm text-gray-400 line-through">${course.price.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-6 pb-4">
        <Link
          to={`/courses/${course.id}`}
          className="block w-full px-4 py-2 text-sm font-medium text-center text-white rounded-xl bg-primary hover:shadow-md hover:brightness-110"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
