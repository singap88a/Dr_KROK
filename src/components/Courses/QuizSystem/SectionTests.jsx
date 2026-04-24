// QuizSystem/SectionTests.jsx
import React from "react";
import { FaUnlock, FaLock, FaBookOpen } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const SectionTestsSection = ({ section, id, course, calculateSectionProgress, sectionProgress }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!section.lesson_end_tests || section.lesson_end_tests.length === 0) {
    return null;
  }

  const sectionProgressData = calculateSectionProgress(section.id);
  const canTakeTest = sectionProgressData.percentage >= 70;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500 rounded-lg">
          <FaBookOpen className="text-lg text-white" />
        </div>
        <div>
          <h5 className="text-lg font-bold text-text">
            {t("courses.sectionTests", "Section Assessment")}
          </h5>
          <p className="text-sm text-text-muted">
            {t("courses.testSectionKnowledge", "Comprehensive test for this entire section")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {section.lesson_end_tests.map((test, idx) => (
          <div
            key={test.id || idx}
            className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
              canTakeTest
                ? "border-purple-500/20 bg-purple-500/5 hover:border-purple-500 hover:shadow-lg hover:bg-purple-500/10"
                : "border-border bg-accent hover:border-border/80"
            }`}
            onClick={() => {
              if (canTakeTest) {
                navigate(`/live-courses/${id}/test/section/${test.id}`, {
                  state: {
                    course,
                    test,
                    sectionId: section.id,
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
                      ? "bg-purple-500 text-white"
                      : "bg-text-muted text-background"
                  }`}
                >
                  {canTakeTest ? <FaUnlock /> : <FaLock />}
                </div>
                <div>
                  <h6 className="font-semibold text-text">
                    {test.name || `${t("courses.sectionTest", "Section Test")} ${idx + 1}`}
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
                    ? "bg-purple-500/10 text-purple-500"
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
                    {t("courses.sectionProgress", "Section Progress")}
                  </span>
                  <span className="text-xs font-bold text-text">
                    {Math.round(sectionProgressData.percentage)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-accent">
                  <div
                    className="h-2 transition-all duration-500 bg-purple-500 rounded-full"
                    style={{
                      width: `${Math.min(sectionProgressData.percentage, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}

            {!canTakeTest && (
              <p className="flex items-center gap-1 mt-2 text-xs text-red-500">
                <FaLock className="text-xs" />
                {t("courses.completeSectionToUnlockTest", "Complete 70% of the section to unlock")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};