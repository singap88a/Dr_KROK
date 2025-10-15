import React from "react";
import { useTranslation } from "react-i18next";
import { 
  FaFolder, 
  FaFolderOpen, 
  FaVideo, 
  FaImage, 
  FaFileAlt, 
  FaChevronDown, 
  FaChevronRight,
  FaLock 
} from "react-icons/fa";
import LessonItem from "./LessonItem";
import SectionProgressBar from "./Progress/SectionProgressBar";

const SectionItem = ({
  section,
  lessons,
  isExpanded,
  isActive,
  hasFree,
  isAccessible,
  lessonStatuses,
  currentLesson,
  sectionProgress,
  calculateTotalProgress,
  calculateSectionProgress,
  onSectionClick,
  onLessonClick,
  onToggleSection,
  isLoggedIn
}) => {
  const { t } = useTranslation();

  return (
    <div className="border rounded-lg bg-surface border-border">
      <div
        onClick={() => onSectionClick(section)}
        className={`p-4 transition-all cursor-pointer group hover:shadow-sm ${
          isActive
            ? "bg-primary/5 border-b border-primary/20"
            : "hover:bg-accent/50"
        }`}
      >
        <div className="flex flex-col">
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  isActive
                    ? "bg-primary/20 text-primary scale-105"
                    : "bg-accent text-text-muted hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {isExpanded ? (
                  <FaFolderOpen className="text-sm transition-transform duration-300 rotate-[5deg]" />
                ) : (
                  <FaFolder className="text-sm" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-semibold text-base tracking-wide ${
                      isActive ? "text-primary" : "text-text"
                    }`}
                  >
                    {section.title
                      .split(" ")
                      .slice(0, 4)
                      .join(" ")}
                    {section.title.split(" ").length > 4 && "..."}
                  </h4>

                  {!isAccessible && (
                    <FaLock
                      className="ml-2 text-sm text-text-muted"
                      title="Premium"
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  <span>
                    {section.lessons_count || 0} {t("courses.lessons", "Lessons")}
                  </span>
                  {section.video && <FaVideo />}
                  {section.images && section.images.length > 0 && <FaImage />}
                  {section.files && section.files.length > 0 && <FaFileAlt />}
                  <span>
                    {hasFree
                      ? t("courses.hasFree", "Has Free")
                      : t("courses.premium", "Premium")}
                  </span>
                </div>

                {isLoggedIn && section.lessons && section.lessons.length > 0 && (
                  <SectionProgressBar 
                    sectionId={section.id}
                    sectionProgress={sectionProgress}
                    calculateSectionProgress={calculateSectionProgress}
                  />
                )}
              </div>
            </div>

            <div className="absolute top-0 right-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSection(section.id);
                }}
                className={`relative p-1 rounded-full border transition-all duration-300 ease-in-out shadow-sm ${
                  isExpanded
                    ? "bg-primary text-white rotate-180 scale-105"
                    : "bg-accent text-text-muted hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {isExpanded ? (
                  <FaChevronDown className="text-lg transition-transform duration-300" />
                ) : (
                  <FaChevronRight className="text-lg transition-transform duration-300" />
                )}
                {isExpanded && (
                  <span className="absolute inset-0 border-2 rounded-full border-primary/40 animate-ping"></span>
                )}
              </button>
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
        </div>
      )}
    </div>
  );
};

export default SectionItem;