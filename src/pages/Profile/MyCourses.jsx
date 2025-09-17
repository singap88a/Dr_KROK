import React from "react";
import { FaUser, FaClock, FaPlay, FaStar } from "react-icons/fa";

const MyCourses = ({ enrolledCourses, renderStars }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">My Courses</h2>
      <span className="text-sm text-text-secondary">
        {enrolledCourses.length} courses enrolled
      </span>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {enrolledCourses.map((course) => (
        <div
          key={course.id}
          className="overflow-hidden transition-shadow duration-200 border shadow-sm bg-surface border-border rounded-xl hover:shadow-lg"
        >
          <div className="relative">
            <img
              src={course.image}
              alt={course.title}
              className="object-cover w-full h-48"
            />
            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 bg-black/20 hover:opacity-100">
              <button className="px-4 py-2 font-medium transition-colors rounded-lg bg-white/90 text-text hover:bg-white">
                <FaPlay className="inline mr-2" />
                Continue Learning
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="mb-2 text-lg font-semibold line-clamp-2">
              {course.title}
            </h3>

            <div className="flex items-center gap-2 mb-3">
              <FaUser className="text-sm text-primary" />
              <span className="text-sm text-text-secondary">
                {course.instructor}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <FaClock className="text-sm text-primary" />
              <span className="text-sm text-text-secondary">
                {course.duration}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1 text-sm">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 transition-all duration-300 rounded-full bg-primary"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {renderStars(course.rating)}
                <span className="ml-1 text-sm text-text-secondary">
                  {course.rating}
                </span>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary">
                Continue
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MyCourses;
