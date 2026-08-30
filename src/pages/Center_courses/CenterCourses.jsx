import React from "react";
import { FiHeart, FiCalendar, FiClock, FiUsers, FiStar, FiMapPin } from "react-icons/fi";

export default function CenterCourses({ courses, favoriteIds, onToggleFavorite, goToDetails, t, isLoggedIn, navigate }) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeStatus = (course) => {
    if (course.is_full) return { status: 'full', text: 'FULL', color: 'bg-red-500' };
    
    if (!course.start_date && !course.started_at) return { status: 'upcoming', text: 'UPCOMING', color: 'bg-blue-500' };
    
    const now = new Date();
    const courseDate = new Date(course.start_date || course.started_at);
    const diffTime = courseDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 0 || course.status === 'expired') return { status: 'ended', text: 'ENDED', color: 'bg-gray-500' };
    if (diffHours <= 168) return { status: 'comingSoon', text: 'STARTING SOON', color: 'bg-orange-500' };
    return { status: 'upcoming', text: 'UPCOMING', color: 'bg-blue-500' };
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {courses.map((course) => {
        const timeStatus = getTimeStatus(course);
        return (
          <div
            key={course.id}
            onClick={() => goToDetails(course, 'center')}
            className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg sm:flex-row"
          >
            {/* Image Section */}
            <div className="relative w-full sm:w-2/5">
              <img
                src={course.img || course.image}
                alt={course.title}
                className="object-cover w-full h-[300px]"
              />

              <div className="absolute z-10 top-3 left-3">
                <div className="flex items-center gap-1 px-2 py-1 text-white rounded-full shadow-lg bg-gradient-to-r from-teal-500 to-emerald-600">
                  <span className="text-xs font-bold">{t("centerCourses.label", "CENTER COURSE")}</span>
                </div>
              </div>

              <div className="absolute z-10 bottom-3 left-3 flex flex-col gap-2">
                <div className={`px-2 py-1 text-xs font-semibold text-white rounded-full shadow-lg w-max ${timeStatus.color}`}>
                  {t(`centerCourses.${timeStatus.status}`, timeStatus.text)}
                </div>
                {course.is_bestseller && (
                  <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded-full shadow-lg w-max">
                    <FiStar /> {t("courses.bestseller", "Bestseller")}
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 w-full p-4 sm:w-3/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium rounded text-primary bg-blue-50 dark:bg-blue-900/30">
                    {typeof course.category === 'object' ? course.category?.name : (course.category || course.category_name)}
                  </span>
                </div>
                {course.discount > 0 && (
                  <div className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full shadow">
                    {Math.round(course.discount)}% OFF
                  </div>
                )}
              </div>

              <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white line-clamp-2">
                {course.title}
              </h3>

              <div 
                className="flex-1 mb-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />

              {/* Course Info */}
              <div className="p-2 mb-2 border border-teal-100 rounded-lg bg-teal-50 dark:bg-teal-900/20 dark:border-teal-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1">
                    <FiCalendar className="text-teal-600 dark:text-teal-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatDate(course.start_date || course.started_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiUsers className="text-teal-600 dark:text-teal-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {course.max_students ? `${course.seats_left || 0}/${course.max_students} Seats` : t("centerCourses.students", "Students")}
                    </span>
                  </div>
                </div>
                {course.address && (
                  <div className="flex items-center gap-1 text-xs">
                    <FiMapPin className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {course.address}
                    </span>
                  </div>
                )}
              </div>

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600 mt-auto">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    ₴{(course.price - (course.price * (course.discount || 0) / 100)).toFixed(2)}
                  </span>
                  {course.discount > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      ₴{Number(course.price).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLoggedIn) {
                        navigate("/login", { state: { from: window.location.pathname } });
                        return;
                      }
                      onToggleFavorite(course.id, "center_course");
                    }}
                    className="p-2 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiHeart className={`text-lg ${favoriteIds.includes(`center_course_${course.id}`) ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                  </button>
                  <button className={`px-3 py-2 text-sm font-medium text-white rounded-lg hover:shadow-md ${timeStatus.status === 'full' || timeStatus.status === 'ended' ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:brightness-110'}`}>
                    {t("courses.viewDetails", "View Details")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
