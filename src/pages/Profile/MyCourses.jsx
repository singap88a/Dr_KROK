import React from "react";
import { FaUser, FaClock, FaPlay, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MyCourses = ({ enrolledCourses, renderStars }) => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}/lessons`);
  };

  return (
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
            className="overflow-hidden transition-shadow duration-200 border shadow-sm cursor-pointer bg-surface border-border rounded-xl hover:shadow-lg"
            onClick={() => handleCourseClick(course.id)}
          >
            <div className="relative">
              <img
                src={course.image || course.image_url || "/course-placeholder.jpg"}
                alt={course.title || course.name}
                className="object-cover w-full h-48"
                onError={(e) => { e.currentTarget.src = "/course-placeholder.jpg"; }}
              />
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 bg-black/20 hover:opacity-100">
                <button
                  className="px-4 py-2 font-medium transition-colors rounded-lg bg-white/90 text-text hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(course.id);
                  }}
                >
                  <FaPlay className="inline mr-2" />
                  Continue Learning
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold line-clamp-2">
                {course.title || course.name}
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <FaUser className="text-sm text-primary" />
                <span className="text-sm text-text-secondary">
                  {course.instructor || course.instructor_name || "Instructor"}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <FaClock className="text-sm text-primary" />
                <span className="text-sm text-text-secondary">
                  {course.duration || "Duration not specified"}
                </span>
              </div>

              {/* Progress Bar - Show if progress data exists */}
              {course.progress !== undefined && (
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
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {course.rating && renderStars(course.rating)}
                  {course.rating && (
                    <span className="ml-1 text-sm text-text-secondary">
                      {course.rating}
                    </span>
                  )}
                </div>
                <button
                  className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCourseClick(course.id);
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="py-12 text-center">
          <FaPlay className="mx-auto mb-4 text-4xl text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-text-secondary">No courses enrolled yet</h3>
          <p className="text-text-secondary">Browse our courses and start learning today!</p>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
