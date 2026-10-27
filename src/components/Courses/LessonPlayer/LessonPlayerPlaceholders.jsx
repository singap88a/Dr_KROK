import React from "react";
import { FaList, FaLock, FaGraduationCap } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Locked overlay when user has no access to the video lesson.
 */
export function LessonPlayerLockedState({ setShowPurchaseModal }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-accent/20 aspect-video">
      <FaLock className="mb-4 text-4xl text-text-muted" />
      <p className="text-lg font-semibold">{t("courses.contentLocked", "Premium Content Locked")}</p>
      <p className="mt-2 text-sm text-text-muted">
        {t("courses.enrollToAccess", "Enroll in this course to access this lesson.")}
      </p>
      <button
        onClick={() => setShowPurchaseModal(true)}
        className="px-6 py-2 mt-4 text-white rounded-lg bg-primary hover:bg-secondary"
      >
        {t("courses.enrollNow", "Enroll Now")}
      </button>
    </div>
  );
}

/**
 * Empty placeholder when no lesson or section is selected.
 */
export function LessonPlayerEmptyState({ course, hasAccess, setShowPurchaseModal }) {
  const { t } = useTranslation();

  return (
    <div className="relative flex items-center justify-center overflow-hidden bg-accent aspect-video">
      {course?.image && (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <img
            src={Array.isArray(course.image) ? course.image[0] : course.image}
            alt={course.title}
            className="object-cover w-full h-full opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px]"></div>
        </div>
      )}
      <div className="relative z-10 text-center p-6">
        <FaList className="mx-auto mb-4 text-6xl text-text-muted drop-shadow-md" />
        <p className="font-medium text-text drop-shadow-md">
          {t("courses.selectContent", "Select a lesson or section to start")}
        </p>
        {!hasAccess && (
          <div className="p-4 mt-4 border border-yellow-300 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2 text-yellow-800">
              <FaLock className="text-yellow-600" />
              <span className="font-medium">{t("liveCourses.premiumContentLocked", "Premium Content Locked")}</span>
            </div>
            <p className="mt-2 text-sm text-yellow-700">
              {t("liveCourses.premiumContentMessage", "You need to enroll in this course to access all premium lessons and materials.")}
            </p>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="px-4 py-2 mt-3 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
            >
              {t("liveCourses.enrollNowToUnlock", "Enroll Now to Unlock")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Live course instructor card displayed below the video player.
 */
export function LiveCoursePlayerInstructor({ course, isLiveCourse }) {
  const { t } = useTranslation();

  if (!isLiveCourse || !course?.instructor) return null;

  return (
    <div className="p-6 border rounded-lg bg-surface border-border">
      <h3 className="mb-4 text-lg font-semibold text-text">
        {t("courses.instructor", "Instructor")}
      </h3>
      <div className="flex items-start gap-4">
        <img
          src={course.instructor.image || "/placeholder-instructor.jpg"}
          alt={course.instructor.name}
          className="object-cover w-16 h-16 border-2 rounded-full border-primary"
        />
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-text">{course.instructor.name}</h4>
          <p className="mb-2 font-medium text-primary">{course.instructor.job_title}</p>
          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <FaGraduationCap />
              <span>{course.instructor.years_of_experience} {t("courses.yearsExp", "years experience")}</span>
            </div>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text line-clamp-3">{course.instructor.bio}</p>
          <Link
            to={`/instructors/${course.instructor.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
          >
            {t("instructors.viewDetails", "View Details")}
          </Link>
        </div>
      </div>
    </div>
  );
}
