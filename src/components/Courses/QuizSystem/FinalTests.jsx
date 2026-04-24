// QuizSystem/FinalTests.jsx
import React from "react";
import { FaUnlock, FaLock, FaAward } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const FinalTestsSection = ({ course, courseProgress, id }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!course || !course.final_tests || course.final_tests.length === 0) {
    return null;
  }

  const overallProgress = Math.round(courseProgress?.overall?.percentage || 0);
  const canTakeTest = overallProgress >= 100;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-emerald-500">
          <FaAward className="text-lg text-white" />
        </div>
        <div>
          <h5 className="text-lg font-bold text-text">
            {t("courses.finalTests", "Final Tests")}
          </h5>
          <p className="text-sm text-text-muted">
            {t("courses.finalAssessment", "Comprehensive final assessment for the entire course")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {course.final_tests.map((test, idx) => (
          <div
            key={test.id || idx}
            className={`p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer ${
              canTakeTest
                ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500 hover:shadow-lg hover:bg-emerald-500/10"
                : "border-border bg-accent hover:border-border/80"
            }`}
            onClick={() => {
              if (canTakeTest) {
                navigate(`/live-courses/${id}/test/final/${test.id}`, {
                  state: { course, test },
                });
              }
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    canTakeTest
                      ? "bg-emerald-500 text-white"
                      : "bg-text-muted text-background"
                  }`}
                >
                  {canTakeTest ? <FaUnlock /> : <FaLock />}
                </div>
                <div>
                  <h6 className="font-semibold text-text">
                    {test.name || `${t("courses.finalTest", "Final Test")} ${idx + 1}`}
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
                    ? "bg-emerald-500/10 text-emerald-500"
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
                    {t("courses.overallProgress", "Overall Progress")}
                  </span>
                  <span className="text-xs font-bold text-text">
                    {overallProgress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-accent">
                  <div
                    className="h-2 transition-all duration-500 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(overallProgress, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {!canTakeTest && (
              <p className="flex items-center gap-1 mt-2 text-xs text-red-500">
                <FaLock className="text-xs" />
                {t("courses.completeCourseToUnlockTest", "Complete the entire course to unlock final exams")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};