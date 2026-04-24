import React from "react";
import { useTranslation } from "react-i18next";
import { FaVideo, FaImage, FaFileAlt, FaCheck, FaLock } from "react-icons/fa";
import { ProgressCircle } from "../ProgressSystem/ProgressCircle";

const LessonItem = ({
  lesson,
  lessonIndex,
  totalLessons,
  lessonStatus,
  isActive,
  isAccessible,
  onLessonClick,
  calculateTotalProgress
}) => {
  const { t } = useTranslation();

  const isFree = lesson.type === "free" || lesson.type === "Free";
  const totalPerc = calculateTotalProgress(lesson, lessonStatus);
  const isCompleted = totalPerc >= 100;

  let displayProgress = totalPerc;
  if (!lessonStatus) {
    displayProgress = 0;
  }

  const hasVideo = !!lesson.video;
  const hasTests = lesson.lesson_end_tests && lesson.lesson_end_tests.length > 0;

  return (
    <div
      onClick={() => onLessonClick(lesson)}
      className={`relative p-4 pl-8 transition-all cursor-pointer group hover:shadow-sm border-l-2 ${
        isActive
          ? "bg-primary/5 border-l-primary"
          : "hover:bg-accent/30 border-l-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1">
          <div
            className={`rounded-full p-[2px] ${
              isActive ? "bg-primary/20" : "bg-accent"
            }`}
          >
            <ProgressCircle
              percent={displayProgress}
              completed={isCompleted}
              active={isActive}
              size={24}
              stroke={3}
            />
          </div>
          {lessonIndex < totalLessons - 1 && (
            <div className="w-px h-4 bg-border"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5
                className={`text-sm font-medium line-clamp-1 ${
                  isActive ? "text-primary" : "text-text"
                }`}
              >
                {lesson.title}
              </h5>
              <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                {hasVideo && <FaVideo />}
                {lesson.images && lesson.images.length > 0 && <FaImage />}
                {lesson.files && lesson.files.length > 0 && <FaFileAlt />}
                {hasTests && <FaCheck />}
                <span>
                  {isFree ? t("courses.free", "Free") : t("courses.paid", "Paid")}
                </span>
                {lesson.duration && (
                  <>
                    <span>•</span>
                    <span>{lesson.duration}min</span>
                  </>
                )}
              </div>
            </div>

            {!isAccessible && (
              <FaLock className="ml-2 text-text-muted" />
            )}
          </div>
          <div className="mt-1 text-xs font-medium">
            {isCompleted ? (
              <span className="text-green-600">
                {t("courses.lessonCompleted", "Lesson Completed")}
              </span>
            ) : (
              <span className="text-text-muted">
                {t("courses.progress", "Progress")}:{" "}
                {Math.min(100, Math.max(0, Math.round(displayProgress)))}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonItem;