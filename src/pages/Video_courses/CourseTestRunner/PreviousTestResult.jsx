import React from "react";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaChartBar } from "react-icons/fa";

export default function PreviousTestResult({ test, previousTestResult, navigate, t, location, id }) {
  const result = previousTestResult.test_result;
  const percentage = result.total_score > 0 ? (parseFloat(result.score) / parseFloat(result.total_score)) * 100 : 0;
  const passed = result.passed === 1;

  return (
    <section className="min-h-screen px-4 py-8 bg-background text-text">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-primary hover:text-secondary"
          >
            <FaArrowLeft /> {t("common.back", "Back")}
          </button>
        </div>

        <div className="overflow-hidden border shadow rounded-2xl bg-surface border-border">
          <div className="p-6 text-white bg-primary">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <h1 className="text-2xl font-bold">
                {test?.name || t("courses.test", "Test")}
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-white/20">
                <FaExclamationTriangle className="text-yellow-300" />
                <span>{t("courses.previouslyTaken", "Previously Taken")}</span>
              </div>
            </div>
          </div>

          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full ${passed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {passed ? <FaCheckCircle size={48} /> : <FaExclamationTriangle size={48} />}
              </div>
            </div>

            <h2 className="mb-4 text-2xl font-bold text-text">
              {passed
                ? t("courses.testPassedBefore", "You have passed this test before")
                : t("courses.testTakenBefore", "You have taken this test before")}
            </h2>

            <p className="mb-8 text-text-muted">
              {previousTestResult.message || t("courses.cannotRetakeTest", "You cannot retake this test.")}
            </p>

            {/* Results Card */}
            <div className="max-w-md mx-auto mb-8 overflow-hidden border rounded-lg shadow-sm bg-gradient-to-br from-surface to-accent border-border">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <FaChartBar className="mr-2 text-primary" />
                  <h3 className="text-lg font-semibold text-text">
                    {t("courses.yourPreviousScore", "Your Previous Score")}
                  </h3>
                </div>

                {/* Percentage Circle */}
                <div className="relative inline-flex items-center justify-center mb-4">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="#E5E7EB" strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={passed ? "#10B981" : "#F59E0B"}
                        strokeWidth="3"
                        strokeDasharray={`${percentage}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Details */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-3 bg-white rounded-lg dark:bg-gray-800">
                    <div className="text-sm text-text-muted">{t("courses.yourScore", "Your Score")}</div>
                    <div className="text-lg font-bold text-text">{result.score}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg dark:bg-gray-800">
                    <div className="text-sm text-text-muted">{t("courses.totalScore", "Total Score")}</div>
                    <div className="text-lg font-bold text-text">{result.total_score}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg dark:bg-gray-800">
                    <div className="text-sm text-text-muted">{t("courses.totalQuestions", "Total Questions")}</div>
                    <div className="text-lg font-bold text-text">{result.total_questions}</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg dark:bg-gray-800">
                    <div className="text-sm text-text-muted">{t("courses.status", "Status")}</div>
                    <div className={`text-lg font-bold ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
                      {passed ? t("courses.passed", "Passed") : t("courses.failed", "Failed")}
                    </div>
                  </div>
                </div>

                {/* Test Date */}
                <div className="p-3 mt-4 bg-white rounded-lg dark:bg-gray-800">
                  <div className="text-sm text-text-muted">{t("courses.testDate", "Test Date")}</div>
                  <div className="font-medium text-text">
                    {new Date(result.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
              >
                {t("common.goBack", "Go Back")}
              </button>
              <button
                onClick={() => {
                  const basePath = location.pathname.includes('live-courses') ? '/live-courses' : '/courses';
                  navigate(`${basePath}/${id}/lessons`);
                }}
                className="px-6 py-3 transition-colors border rounded-lg border-primary text-primary hover:bg-primary hover:text-white"
              >
                {t("courses.returnToLessons", "Return to Lessons")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
