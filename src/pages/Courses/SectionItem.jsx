import React from "react";
import { useTranslation } from "react-i18next";
import { 
  FaFolder, 
  FaFolderOpen, 
  FaChevronDown, 
  FaChevronRight,
  FaLock,
  FaClipboardList,
  FaUnlock,
  FaCheckCircle,
  FaVideo
} from "react-icons/fa";
import LessonItem from "./LessonItem";
import SectionProgressBar from "./Progress/SectionProgressBar";

const SectionItem = ({
  section,
  lessons,
  isExpanded,
  isActive,
  hasFree,
  lessonStatuses,
  currentLesson,
  sectionProgress,
  calculateTotalProgress,
  calculateSectionProgress,
  onSectionClick,
  onLessonClick,
  onToggleSection,
  isLoggedIn,
  hasAccess,
  navigate,
  course
}) => {
  const { t } = useTranslation();

  // Click handler for opening section content in main area
  const handleContentClick = (e) => {
    e.stopPropagation();
    onSectionClick(section);
  };

  // Click handler for toggling accordion in sidebar
  const handleToggleClick = (e) => {
    e.stopPropagation();
    onToggleSection(section.id);
  };

  // التحقق من وجود دروس مقفولة في السيكشن
  const hasPremiumLessons = lessons && lessons.some(lesson => lesson.type !== "free" && lesson.type !== "Free");

  // حساب نسبة إكمال السيكشن
  const calculateSectionCompletion = () => {
    if (!isLoggedIn || !lessons || lessons.length === 0) return 0;
    
    const completedLessons = lessons.filter(lesson => {
      const status = lessonStatuses[lesson.id];
      return status && (status.progress_status === 'completed' || status.percentage >= 100);
    });
    
    return (completedLessons.length / lessons.length) * 100;
  };

  const sectionCompletionPercentage = calculateSectionCompletion();
  const isSectionCompleted = sectionCompletionPercentage >= 100;



  // عرض اختبارات السيكشن
  const renderSectionTests = () => {
    if (!section.section_tests || section.section_tests.length === 0) return null;

    return (
      <div className="p-4 border-t border-border bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-800">
              <FaClipboardList className="text-lg text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-text">
              {t("courses.sectionTests", "Section Tests")}
            </h4>
          </div>
          <p className="text-sm text-text-muted">
            {t("courses.completeSectionToUnlock", "Complete the section 100% to unlock tests")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {section.section_tests.map((test, idx) => (
            <div
              key={test.id || idx}
              className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                isSectionCompleted
                  ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700 hover:border-green-300 hover:shadow-md cursor-pointer"
                  : "border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-600 cursor-not-allowed opacity-60"
              }`}
              onClick={() => {
                if (isSectionCompleted) {
                  navigate(`/courses/${course.id}/test/section/${test.id}`, {
                    state: { course, test, section }
                  });
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSectionCompleted
                      ? "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}>
                    {isSectionCompleted ? <FaUnlock /> : <FaLock />}
                  </div>
                  <div>
                    <h5 className={`font-semibold ${
                      isSectionCompleted ? "text-green-800 dark:text-green-200" : "text-gray-600 dark:text-gray-400"
                    }`}>
                      {test.name || `${t("courses.sectionTest", "Section Test")} ${idx + 1}`}
                    </h5>
                    <p className="text-xs text-text-muted">
                      {test.number_student_questions} {t("courses.questions", "Questions")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isSectionCompleted ? (
                    <>
                      <FaCheckCircle className="text-green-500" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {t("courses.available", "Available")}
                      </span>
                    </>
                  ) : (
                    <>
                      <FaLock className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">
                        {t("courses.locked", "Locked")}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg bg-surface border-border">
      <div
        className={`p-4 transition-all group cursor-pointer ${
          isActive
            ? "bg-primary/5 border-b border-primary/20"
            : ""
        }`}
        onClick={handleContentClick}
      >
        <div className="flex flex-col">
          <div className="relative flex items-start justify-between">
            <div className="flex items-center flex-1 min-w-0 gap-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  isActive
                    ? "bg-primary/20 text-primary scale-105"
                    : "bg-accent text-text-muted"
                }`}
              >
                {isExpanded ? (
                  <FaFolderOpen className="text-sm transition-transform duration-300 rotate-[5deg]" />
                ) : (
                  <FaFolder className="text-sm" />
                )}
              </div>

              {/* 🔥 التعديل: إعادة تنظيم المحتوى بحيث يكون العنوان والمعلومات في عمود واحد */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1 min-w-0 mr-2">
                    <h4
                      className={`font-semibold text-base tracking-wide truncate ${
                        isActive ? "text-primary" : "text-text"
                      }`}
                      title={section.title}
                    >
                      {section.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-text-muted">
                      <span>
                        {section.lessons_count || 0} {t("courses.lessons", "Lessons")}
                      </span>
                      <span>
                        {hasFree || section.type === "Free" || section.type === "free"
                          ? t("courses.hasFree", "Has Free")
                          : t("courses.premium", "Premium")}
                      </span>

                      {/* {(section.video || section.video_related || section.zoom_link) && (
                        // <div className="flex items-center gap-1 text-primary">
                        //   <FaVideo size={10} />
                        //   <span>{t("courses.video", "Video")}</span>
                        // </div>
                      )} */}
                  
                      {!hasFree && section.type !== "Free" && section.type !== "free" && !hasAccess && (
                        <FaLock
                          className="flex-shrink-0 text-sm text-text-muted"
                          title="Premium"
                        />
                      )}
                    </div>
                  </div>

                  {/* 🔥 نقل السهم إلى هنا بحيث يكون في نفس الصف مع العنوان */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={handleToggleClick}
                      className={`relative p-2 rounded-full border transition-all duration-300 ease-in-out shadow-sm ${
                        isExpanded
                          ? "bg-primary text-white scale-105"
                          : "bg-accent text-text-muted hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {isExpanded ? (
                        <FaChevronDown className="text-sm transition-transform duration-300" />
                      ) : (
                        <FaChevronRight className="text-sm transition-transform duration-300" />
                      )}
                    </button>
                  </div>
                </div>

                {isLoggedIn && section.lessons && section.lessons.length > 0 && (
                  <div className="mt-2">
                    <SectionProgressBar 
                      sectionId={section.id}
                      sectionProgress={sectionProgress}
                      calculateSectionProgress={calculateSectionProgress}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && lessons.length > 0 && (
        <div className="border-t border-border">
          {lessons.map((lesson, lessonIndex) => (
            <LessonItem
              key={lesson.id || lessonIndex}
              lesson={lesson}
              lessonIndex={lessonIndex}
              totalLessons={lessons.length}
              lessonStatus={lessonStatuses[lesson.id]}
              isActive={currentLesson?.id === lesson.id}
              isAccessible={lesson.type === "free" || lesson.type === "Free"}
              onLessonClick={onLessonClick}
              calculateTotalProgress={calculateTotalProgress}
            />
          ))}
          
          {/* عرض اختبارات السيكشن تحت آخر درس */}
          {renderSectionTests()}
        </div>
      )}
    </div>
  );
};

export default SectionItem;