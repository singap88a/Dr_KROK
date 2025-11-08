import React from "react";
import { FiHeart, FiCalendar, FiClock, FiUsers } from "react-icons/fi";

export default function LiveCourses({ courses, favoriteIds, onToggleFavorite, goToDetails, t }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeStatus = (dateString) => {
    const now = new Date();
    const courseDate = new Date(dateString);
    const diffTime = courseDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 0) return { status: 'ended', text: 'ENDED', color: 'bg-gray-500' };
    if (diffHours <= 24) return { status: 'liveToday', text: 'LIVE TODAY', color: 'bg-red-500' };
    if (diffHours <= 168) return { status: 'comingSoon', text: 'COMING SOON', color: 'bg-orange-500' };
    return { status: 'upcoming', text: 'UPCOMING', color: 'bg-blue-500' };
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {courses.map((course) => (
        <div
          key={course.id}
          onClick={() => goToDetails(course)}
          className="flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg sm:flex-row"
        >
          {/* الصورة على اليسار */}
          <div className="relative w-full sm:w-2/5">
            <img
              src={course.img}
              alt={course.title}
              className="object-cover w-full h-full"
            />

            {/* Live Badge */}
            <div className="absolute z-10 top-3 left-3">
              <div className="flex items-center gap-1 px-2 py-1 text-white rounded-full shadow-lg bg-gradient-to-r from-[#FF416C] to-[#FF4B2B]">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-bold">{t("liveCourses.live", "LIVE")}</span>
              </div>
            </div>

            {/* Time Status Badge */}
            <div className="absolute z-10 bottom-3 left-3">
              <div className={`px-2 py-1 text-xs font-semibold text-white rounded-full shadow-lg ${getTimeStatus(course.started_at).color}`}>
                {t(`liveCourses.${getTimeStatus(course.started_at).status}`, getTimeStatus(course.started_at).text)}
              </div>
            </div>
          </div>

          {/* المحتوى على اليمين */}
          <div className="flex flex-col flex-1 w-full p-4 sm:w-3/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium rounded text-primary bg-blue-50 dark:bg-blue-900/30">
                  {course.category}
                </span>
                <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300">
                  {course.level}
                </span>
              </div>

              {/* التعديل الثاني: نقل الخصم إلى اليمين واستبدال مكان القلب */}
              {course.discount > 0 && (
                <div className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full shadow">
                  {Math.round((course.discount / course.price) * 100)}% OFF
                </div>
              )}
            </div>

            <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white line-clamp-2">
              {course.title}
            </h3>

            <p className="flex-1 mb-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {course.description}
            </p>

            {/* Live Session Info */}
            <div className="p-2 mb-2 border border-blue-100 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <FiCalendar className="text-primary" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(course.started_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock className="text-primary" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatTime(course.started_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <FiUsers className="text-xs" />
                <span>Year {course.college_year}</span>
              </div>
              <span className="px-2 py-1 bg-gray-100 rounded dark:bg-gray-700">
                {course.language}
              </span>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  ${(course.price - course.discount).toFixed(2)}
                </span>
                {course.discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ${course.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* زر المفضلة مكان الخصم */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(course.id, "live_course");
                  }}
                  className="p-2 transition-all duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiHeart className={`text-lg ${favoriteIds.includes(course.id) ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                </button>
                <button className="px-3 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:shadow-md hover:brightness-110">
                  {new Date(course.started_at) > new Date() ? t("liveCourses.joinLive", "Join Live") : t("liveCourses.viewDetails", "View Details")}
                </button>
              </div>
            </div>
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
