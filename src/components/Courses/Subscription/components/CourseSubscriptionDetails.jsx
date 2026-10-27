import React from "react";
import {
  FaPlay,
  FaBookOpen,
  FaClock,
  FaUsers,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaGraduationCap,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import CouponInput from "../../../Common/CouponInput";

export default function CourseSubscriptionDetails({
  course,
  isCenterCourse,
  isLiveCourse,
  handleCouponApply,
  couponDiscount,
  t,
}) {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-sm text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-sm text-text-muted" />);
      }
    }
    return stars;
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="lg:col-span-2">
      <div className="p-6 border rounded-2xl border-border bg-surface">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Course Image */}
          <div className="flex-shrink-0">
            <div className="relative overflow-hidden border rounded-xl border-border">
              <img
                src={course.image || "/logo.png"}
                alt={course.title}
                className="object-cover w-full h-48 md:w-64 md:h-40"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <FaPlay className="text-4xl text-white" />
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1">
            <h2 className="mb-3 text-2xl font-bold text-text">{course.title}</h2>
            <div
              className="mb-4 text-text-secondary line-clamp-3"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              {isCenterCourse ? (
                <>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary shrink-0" />
                    <span className="truncate" title={course.address}>
                      {course.address || t("common.not_specified", "Not Specified")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-primary shrink-0" />
                    <span>
                      {t("center_courses.start_date", "Starts")}:{" "}
                      {course.start_date || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-primary shrink-0" />
                    <span className="truncate" title={course.booking_end_date}>
                      {t("center_courses.booking_end", "Booking ends")}:{" "}
                      {course.booking_end_date || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBookOpen className="text-primary shrink-0" />
                    <span>
                      {course.lectures_count || 0}{" "}
                      {t("center_courses.lectures", "Lectures")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-primary shrink-0" />
                    <span>
                      {course.lecture_duration || 0}{" "}
                      {t("center_courses.min_per_lecture", "mins/lecture")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-primary shrink-0" />
                    <span>
                      {course.max_students || 0}{" "}
                      {t("center_courses.max_students", "Max Students")}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <FaBookOpen className="text-primary shrink-0" />
                    <span>
                      {course.lessons_count || 0} {t("courses.lessons", "Lessons")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-primary shrink-0" />
                    <span>
                      {Math.max(
                        1,
                        Math.round((course.duration_minutes || 0) / 60)
                      )}
                      h {t("courses.duration", "Duration")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-primary shrink-0" />
                    <span>
                      {course.enrolled_count || 0}{" "}
                      {t("courses.students", "Students")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 shrink-0">
                      {renderStars(course.avg_rating || 0)}
                    </div>
                    <span className="text-sm">
                      {(course.avg_rating || 0).toFixed(1)} (
                      {course.ratings_count || 0})
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Course Level & Language */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full border ${getLevelColor(
                  course.level
                )}`}
              >
                {course.level}
              </span>
              <span className="px-3 py-1 text-xs font-semibold border rounded-full bg-surface border-border">
                {course.language}
              </span>
              {course.category && (
                <span className="px-3 py-1 text-xs font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
                  {course.category.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Instructor Card */}
        {course.instructor && (
          <div className="p-4 mt-6 border rounded-lg border-border bg-background/50">
            <h3 className="mb-3 text-lg font-semibold text-text">
              {t("courses.instructor", "Instructor")}
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={course.instructor.image || "/user.png"}
                alt={course.instructor.name}
                className="object-cover w-12 h-12 border-2 rounded-full border-primary"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-text">
                  {course.instructor.name}
                </h4>
                <p className="text-sm text-primary">
                  {course.instructor.job_title}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <FaGraduationCap />
                    <span>
                      {course.instructor.years_of_experience}{" "}
                      {t("courses.yearsExp", "years experience")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Input */}
        <div className="mt-6">
          <CouponInput
            onApply={handleCouponApply}
            t={t}
            initialDiscount={couponDiscount}
            type={isLiveCourse ? "live_course" : "video_course"}
          />
        </div>
      </div>
    </div>
  );
}
