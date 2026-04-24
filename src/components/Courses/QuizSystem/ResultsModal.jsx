// QuizSystem/ResultsModal.jsx
import React from "react";
import { FaTimes } from "react-icons/fa"; // إضافة هذا الاستيراد
import { useTranslation } from "react-i18next";

export const ResultsModal = ({ resultsModal, setResultsModal }) => {
  const { t } = useTranslation();

  if (!resultsModal.isOpen) return null;

  const { totalQuestions, correctAnswers, score } = resultsModal;
  const isExcellent = score >= 90;
  const isGood = score >= 70;
  const isAverage = score >= 50;

  const getPerformanceMessage = () => {
    if (isExcellent)
      return {
        message: t("courses.excellentMessage", "Outstanding! You've mastered this lesson completely."),
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: "🏆",
      };
    if (isGood)
      return {
        message: t("courses.goodMessage", "Great job! You have a solid understanding of the material."),
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: "⭐",
      };
    if (isAverage)
      return {
        message: t("courses.averageMessage", "Good effort! You understand the main concepts."),
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: "📚",
      };
    return {
      message: t("courses.poorMessage", "Keep practicing! Review the material and try again."),
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      icon: "💪",
    };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#00000086]">
      <div className="flex items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-xs overflow-hidden transition-all transform shadow-xl bg-surface rounded-xl">
          {/* Header */}
          <div className="p-3 text-white bg-primary">
            <div className="text-center">
              <div className="flex justify-center mb-1">
                <div className="p-1 bg-white rounded-full bg-opacity-20">
                  <FaTimes className="text-sm" />
                </div>
              </div>
              <h3 className="text-sm font-bold">
                {t("courses.quizCompleted", "Quiz Completed!")}
              </h3>
              <p className="mt-0.5 text-[10px] text-white text-opacity-90">
                {t("courses.videoCompleted", "Video Completed")}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 bg-surface">
            {/* Score Circle */}
            <div className="flex justify-center mb-3">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                    isExcellent
                      ? "border-green-500"
                      : isGood
                      ? "border-blue-500"
                      : isAverage
                      ? "border-yellow-500"
                      : "border-orange-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-text">{score}%</div>
                    <div className="text-[9px] text-text-muted">
                      {t("courses.score", "Score")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 text-center border rounded-lg bg-background border-border">
                <div className="text-base font-bold text-green-600">{correctAnswers}</div>
                <div className="text-[10px] text-text-muted">
                  {t("courses.correct", "Correct")}
                </div>
              </div>
              <div className="p-2 text-center border rounded-lg bg-background border-border">
                <div className="text-base font-bold text-red-600">
                  {totalQuestions - correctAnswers}
                </div>
                <div className="text-[10px] text-text-muted">
                  {t("courses.incorrect", "Incorrect")}
                </div>
              </div>
            </div>

            {/* Performance Message */}
            <div
              className={`p-2 mb-3 rounded-lg ${performance.bgColor} ${performance.borderColor} border`}
            >
              <div className="flex items-center gap-1">
                <span className="text-base">{performance.icon}</span>
                <div>
                  <p
                    className={`text-[11px] font-medium ${performance.color} leading-tight`}
                  >
                    {performance.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-muted">
                  {t("courses.progress", "Progress")}
                </span>
                <span className="text-[10px] font-bold text-text">
                  {correctAnswers}/{totalQuestions}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-accent">
                <div
                  className={`h-1.5 transition-all duration-500 rounded-full ${
                    isExcellent
                      ? "bg-green-500"
                      : isGood
                      ? "bg-blue-500"
                      : isAverage
                      ? "bg-yellow-500"
                      : "bg-orange-500"
                  }`}
                  style={{
                    width: `${(correctAnswers / totalQuestions) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setResultsModal({ ...resultsModal, isOpen: false })}
              className="w-full px-3 py-2 text-xs font-medium text-white transition-all transform rounded-lg bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95"
            >
              {t("common.continue", "Continue")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};