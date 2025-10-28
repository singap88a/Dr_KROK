// QuizSystem/LessonEndTests.jsx
import React from "react";
import { FaUnlock, FaLock, FaQuestionCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const LessonEndTestsSection = ({ lesson, lessonStatuses, id, course }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!lesson.lesson_end_tests || lesson.lesson_end_tests.length === 0) {
    return null;
  }

  const lessonEndTests = lesson.lesson_end_tests.filter(
    (test) => test.test_type === "Lesson-End Test (Live Session)"
  );

  if (lessonEndTests.length === 0) {
    return null;
  }

  const lessonProgress = lessonStatuses[lesson.id] || {};
  const progressPercentage = lessonProgress.percentage || lessonProgress.lesson_percentage || 0;
  const canTakeTest = progressPercentage >= 50;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500 rounded-lg">
          <FaQuestionCircle className="text-lg text-white" />
        </div>
        <div>
          <h5 className="text-lg font-bold text-text">
            {t("courses.lessonEndTests", "Lesson End Assessment")}
          </h5>
          <p className="text-sm text-text-muted">
            {t("courses.testLessonKnowledge", "Evaluate your understanding of this lesson")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {lessonEndTests.map((test, idx) => (
          <div
            key={test.id || idx}
            className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
              canTakeTest
                ? "border-blue-500/20 bg-blue-500/5 hover:border-blue-500 hover:shadow-lg hover:bg-blue-500/10"
                : "border-border bg-accent hover:border-border/80"
            }`}
            onClick={() => {
              if (canTakeTest) {
                navigate(`/live-courses/${id}/test/lesson/${test.id}`, {
                  state: {
                    course,
                    test,
                    lessonId: lesson.id,
                  },
                });
              }
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    canTakeTest
                      ? "bg-blue-500 text-white"
                      : "bg-text-muted text-background"
                  }`}
                >
                  {canTakeTest ? <FaUnlock /> : <FaLock />}
                </div>
                <div>
                  <h6 className="font-semibold text-text">
                    {test.name || `${t("courses.lessonEndTest", "Lesson End Test")} ${idx + 1}`}
                  </h6>
                  <p className="mt-1 text-xs text-text-muted">
                    {test.description &&
                      test.description.replace(/<[^>]*>/g, "").substring(0, 100)}
                    {test.description && test.description.length > 100 ? "..." : ""}
                  </p>
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  canTakeTest
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-accent text-text-muted"
                }`}
              >
                {canTakeTest ? t("courses.available", "Available") : t("courses.locked", "Locked")}
              </div>
            </div>

            {canTakeTest && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-muted">
                    {t("courses.lessonProgress", "Lesson Progress")}
                  </span>
                  <span className="text-xs font-bold text-text">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-accent">
                  <div
                    className="h-2 transition-all duration-500 bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {!canTakeTest && (
              <p className="flex items-center gap-1 mt-2 text-xs text-red-500">
                <FaLock className="text-xs" />
                {t("courses.watchVideoToUnlockTest", "Watch 50% of the lesson to unlock")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};