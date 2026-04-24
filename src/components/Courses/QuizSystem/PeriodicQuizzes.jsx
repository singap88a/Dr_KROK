// QuizSystem/PeriodicQuizzes.jsx
import React from "react";
import { FaClock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export const PeriodicQuizzesSection = ({ lesson }) => {
  const { t } = useTranslation();

  if (!lesson.lesson_end_tests || lesson.lesson_end_tests.length === 0) {
    return null;
  }

  const periodicQuizzes = lesson.lesson_end_tests.filter(
    (test) => test.test_type === "Periodic Quiz (Live Session)"
  );

  if (periodicQuizzes.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500 rounded-lg">
          <FaClock className="text-lg text-white" />
        </div>
        <div>
          <h5 className="text-lg font-bold text-text">
            {t("courses.periodicQuizzes", "Periodic Quizzes")}
          </h5>
          <p className="text-sm text-text-muted">
            {t("courses.quickKnowledgeChecks", "Quick knowledge checks during the lesson")}
          </p>
        </div>
      </div>

      <div className="p-4 border-2 border-green-500/20 bg-green-500/5 rounded-xl">
        <div className="text-center">
          <p className="mb-2 text-sm text-text-muted">
            {t("courses.quizzesWillAppear", "Quizzes will appear automatically during the video")}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t("courses.automaticAppearance", "Automatic appearance")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{t("courses.videoPauses", "Video pauses during quiz")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};