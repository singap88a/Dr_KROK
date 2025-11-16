import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaAward, FaLock } from "react-icons/fa";
import SectionItem from "../SectionItem";
// import SectionProgressBar from "./Progress/SectionProgressBar";

const CourseContentSidebar = ({
  sections,
  course,
  courseProgress,
  expandedSections,
  currentLesson,
  currentSection,
  lessonStatuses,
  hasAccess,
  isLoggedIn,
  sectionProgress,
  calculateTotalProgress,
  calculateSectionProgress,
  onLessonClick,
  onSectionClick,
  onToggleSection,
  hasFreeLessons,
  navigate
}) => {
  const { t } = useTranslation();

  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => (a.id || 0) - (b.id || 0));
  }, [sections]);

  const getSectionLessons = useMemo(() => {
    return (sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section || !section.lessons) return [];
      return [...section.lessons].sort((a, b) => {
        const aFree = a.type === "free" || a.type === "Free";
        const bFree = b.type === "free" || b.type === "Free";
        if (aFree && !bFree) return -1;
        if (!aFree && bFree) return 1;
        return (a.id || 0) - (b.id || 0);
      });
    };
  }, [sections]);

  return (
    <div className="space-y-3 lg:col-span-1">
      <h3 className="text-lg font-semibold">
        {t("courses.courseContent", "Course Content")}
      </h3>

      <div className="space-y-2">
        {sortedSections.map((section) => (
          <SectionItem
            key={`section-${section.id}`}
            section={section}
            lessons={getSectionLessons(section.id)}
            isExpanded={expandedSections.has(section.id)}
            isActive={currentSection?.id === section.id}
            hasFree={hasFreeLessons(section.id)}
            isAccessible={hasFreeLessons(section.id) || hasAccess}
            lessonStatuses={lessonStatuses}
            currentLesson={currentLesson}
            sectionProgress={sectionProgress}
            calculateTotalProgress={calculateTotalProgress}
            calculateSectionProgress={calculateSectionProgress}
            onSectionClick={onSectionClick}
            onLessonClick={onLessonClick}
            onToggleSection={onToggleSection}
            isLoggedIn={isLoggedIn}
            navigate={navigate}
            course={course}
          />
        ))}

        {course.final_tests && course.final_tests.length > 0 && (
          <div className="p-4 mt-4 border rounded-lg bg-surface border-border">
            <div className="mb-2 text-sm font-semibold text-text">
              {t("courses.finalTests", "Final Tests")}
            </div>
            <div className="flex flex-wrap gap-2">
              {course.final_tests.map((test, idx) => {
                const locked =
                  Math.round(courseProgress?.overall?.percentage || 0) < 100;
                return (
                  <button
                    key={test.id || idx}
                    onClick={() =>
                      !locked &&
                      navigate(`/courses/${course.id}/test/final/${test.id}`, {
                        state: { course, test },
                      })
                    }
                    disabled={locked}
                    className={`px-3 py-2 text-xs font-medium rounded ${
                      locked
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "text-white bg-primary hover:bg-secondary"
                    }`}
                  >
                    {test.name ||
                      `${t("courses.finalTest", "Final Test")} ${idx + 1}`}{" "}
                    {locked && <FaLock className="inline ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isLoggedIn && courseProgress?.overall?.percentage >= 100 && (
          <div className="p-4 mt-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-700">
            <button
              onClick={() => navigate(`/courses/${course.id}/certificate`)}
              className="flex items-center w-full gap-3 p-2 text-left transition-all rounded hover:bg-green-100 dark:hover:bg-green-800/50"
            >
              <div className="flex-shrink-0 p-2 bg-green-100 rounded-full dark:bg-green-800">
                <FaAward className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  {t("courses.certificate", "Certificate of Completion")}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t("courses.downloadCertificate", "Download your certificate")}
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContentSidebar;