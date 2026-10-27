import React from "react";
import {
  FaUser,
  FaLayerGroup,
  FaStethoscope,
  FaCertificate,
  FaGlobe,
  FaBook,
  FaCalendarAlt,
  FaHourglassHalf,
  FaLock,
} from "react-icons/fa";

export default function CourseHeroInfo({
  course,
  isDescriptionExpanded,
  setIsDescriptionExpanded,
  renderStaticStars,
  getLevelTranslation,
  parseDate,
  isCompleted,
  isExpired,
  userHasAccess,
  setShowCompletedModal,
  setShowExpiredModal,
  navigate,
  id,
  t,
}) {
  const safeGetLevelTranslation = typeof getLevelTranslation === "function"
    ? getLevelTranslation
    : (lvl) => lvl || "";

  const safeParseDate = typeof parseDate === "function"
    ? parseDate
    : (d) => (d ? new Date(d) : null);

  const safeRenderStars = typeof renderStaticStars === "function"
    ? renderStaticStars
    : () => null;

  return (
    <div className="flex flex-col justify-between space-y-4 sm:space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">{course.title}</h1>
      <div
        className={`text-sm text-text-secondary sm:text-base ${
          !isDescriptionExpanded ? "line-clamp-4" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: course.description }}
      />
      {course.description && course.description.length > 200 && (
        <button
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          className="mt-1 font-medium underline text-primary hover:text-primary/80 text-start"
        >
          {isDescriptionExpanded ? "Show Less" : "Read More"}
        </button>
      )}

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {safeRenderStars(Math.round(course.avg_rating || 0))}
        </div>
        <span className="ml-2 text-sm text-text-muted">
          ({(course.avg_rating || 0).toFixed(1)} / 5.0)
        </span>
      </div>

      {/* Price Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-primary sm:text-2xl">
            ₴
            {Number(course.discount) > 0
              ? (
                  Number(course.price) -
                  (Number(course.price) * Number(course.discount)) / 100
                ).toFixed(2)
              : Number(course.price || 0).toFixed(2)}
          </span>
          {Number(course.discount) > 0 ? (
            <>
              <span className="text-base line-through text-text-muted sm:text-lg">
                ₴{Number(course.price || 0).toFixed(2)}
              </span>
              <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded">
                {Math.round(Number(course.discount))}%
              </span>
            </>
          ) : null}
        </div>

        {course.is_installment_enabled && (
          <div className="flex items-center flex-wrap gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm">
              <span>💳</span> {t("installments.installmentAvailable", "Installment Available")}
            </span>
            <span>
              {t("installments.payFrom", "Pay from")} <strong>₴{Number(course.installment_monthly_amount || 0).toFixed(2)}</strong>/{t("installments.month", "month")}
              {course.installment_months ? ` (${t("installments.overMonths", "over {{months}} months", { months: course.installment_months })})` : ""}
            </span>
            {course.installment_total_price && (
              <span className="text-text-muted text-[11px]">
                • {t("installments.totalInstallmentPrice", "Total:")} ₴{Number(course.installment_total_price).toFixed(2)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 sm:gap-4">
        <div className="flex items-center gap-2">
          <FaUser className="text-primary" /> {t("courses.instructor", "Instructor")}{" "}
          <span className="font-medium">
            {course.instructor?.name ||
              (typeof course.instructor === "string" ? course.instructor : "")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <FaLayerGroup className="text-primary" /> {t("courses.level", "Level")}{" "}
          <span className="font-medium">
            {safeGetLevelTranslation(course?.level)}
          </span>
        </div>
        {course?.specialization && (
          <div className="flex items-center gap-2">
            <FaStethoscope className="text-primary" />{" "}
            {t("profile.specialization", "Specialization")}{" "}
            <span className="font-medium">
              {typeof course.specialization === "object"
                ? course.specialization?.name
                : course.specialization}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <FaCertificate className="text-primary" />{" "}
          {t("courses.category", "Category")}{" "}
          <span className="font-medium">
            {(() => {
              if (typeof course.category === "string") {
                return course.category;
              }
              if (
                course.category &&
                typeof course.category === "object" &&
                course.category.name
              ) {
                return typeof course.category.name === "string"
                  ? course.category.name
                  : String(course.category.name);
              }
              return "";
            })()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FaGlobe className="text-primary" /> {t("courses.language", "Language")}{" "}
          <span className="font-medium">{course?.language || ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaBook className="text-primary" /> {t("courses.lectures", "Lectures")}{" "}
          <span className="font-medium">{course.lessons_count || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-primary" />{" "}
          {t("courses.courseDate", "Course Date")}{" "}
          <span className="font-medium">
            {course.instructor?.created_at
              ? (() => {
                  const date = safeParseDate(course.instructor.created_at);
                  if (!date) return "";
                  const year = date.getFullYear();
                  const month = (date.getMonth() + 1)
                    .toString()
                    .padStart(2, "0");
                  const day = date.getDate().toString().padStart(2, "0");
                  return `${year}-${month}-${day}`;
                })()
              : ""}
          </span>
        </div>

        {course.course_duration_days > 0 && (
          <div className="flex items-center gap-2 col-span-full">
            <FaHourglassHalf className="text-primary" />
            <span>{t("courses.accessDuration", "Access Duration")}:</span>
            <span className="font-semibold text-primary">
              {course.course_duration_days} {t("courses.days", "days")}
            </span>
            <span className="text-text-muted text-xs">
              ({t("courses.accessDurationNote", "from the date of purchase")})
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        {isCompleted ? (
          <button
            onClick={() => setShowCompletedModal && setShowCompletedModal(true)}
            className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-green-600 hover:bg-green-700 sm:px-6 sm:py-3 flex items-center gap-2"
          >
            <FaCertificate className="w-4 h-4" />
            {t("courses.courseCompleted", "Course Completed")}
          </button>
        ) : isExpired ? (
          <button
            onClick={() => setShowExpiredModal && setShowExpiredModal(true)}
            className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-red-600 hover:bg-red-700 sm:px-6 sm:py-3 flex items-center gap-2"
          >
            <FaLock className="w-4 h-4" />
            {t("courses.courseExpired", "Course Expired")}
          </button>
        ) : userHasAccess ? (
          <button
            onClick={() => (navigate ? navigate(`/courses/${id}/lessons`) : (window.location.href = `/courses/${id}/lessons`))}
            className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-primary hover:bg-secondary sm:px-6 sm:py-3"
          >
            {t("courses.startCourse", "Start Course")}
          </button>
        ) : (
          <button
            onClick={() => (navigate ? navigate(`/courses/${id}/subscribe`) : (window.location.href = `/courses/${id}/subscribe`))}
            className="px-4 py-2 text-sm text-white transition rounded-lg shadow-md bg-primary hover:bg-secondary sm:px-6 sm:py-3"
          >
            {t("courses.subscribeNow", "Subscribe Now")}
          </button>
        )}
        <button
          onClick={() => (navigate ? navigate(`/courses/${id}/lessons`) : (window.location.href = `/courses/${id}/lessons`))}
          className="px-4 py-2 text-sm transition border rounded-lg border-primary text-primary hover:bg-primary hover:text-white sm:px-6 sm:py-3"
        >
          {t("courses.previewCourse", "Preview Course")}
        </button>
      </div>
    </div>
  );
}
