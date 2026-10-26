import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaFileAlt,
  FaTimes,
  FaCalendarAlt,
  FaCheck,
} from "react-icons/fa";

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function TestsHistoryModal({ course, isOpen, onClose }) {
  const { t } = useTranslation();
  if (!isOpen || !course) return null;

  const tests = Array.isArray(course.tests) ? course.tests : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
              <FaFileAlt />
            </div>
            <div>
              <h3 className="font-bold text-lg text-text">
                {t("myCourses.testsHistoryModalTitle", "Course Tests History")}
              </h3>
              <p className="text-xs text-text-secondary truncate max-w-sm sm:max-w-md">
                {course.title || course.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text hover:bg-border/40 rounded-xl transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {tests.length === 0 ? (
            <div className="py-12 text-center text-text-secondary">
              <FaFileAlt className="text-3xl mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {t("myCourses.noTestsYet", "No tests solved in this course yet.")}
              </p>
            </div>
          ) : (
            tests.map((test, idx) => {
              const passed = Boolean(test.passed);
              return (
                <div
                  key={test.student_test_id || idx}
                  className="p-4 rounded-xl border border-border/80 bg-background/50 hover:bg-background transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-text">
                        {test.test_name || `Test #${idx + 1}`}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-border text-text-secondary">
                        {test.is_lesson_test
                          ? t("myCourses.lessonTest", "Lesson Quiz")
                          : t("myCourses.finalTest", "Final Exam")}
                      </span>
                    </div>

                    {test.lesson_title && (
                      <p className="text-xs text-text-secondary">
                        {test.lesson_title}
                      </p>
                    )}

                    {test.date && (
                      <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                        <FaCalendarAlt className="text-[10px]" />
                        <span>{formatDate(test.date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Score & Passed Status */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-sm font-bold text-text">
                        {test.student_score} / {test.total_score}
                      </div>
                      <div className="text-[11px] text-text-secondary font-medium">
                        {test.percentage !== undefined ? `${test.percentage}%` : ""}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        passed
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      }`}
                    >
                      {passed ? (
                        <>
                          <FaCheck className="text-[10px]" />
                          {t("myCourses.passed", "Passed")}
                        </>
                      ) : (
                        <>
                          <FaTimes className="text-[10px]" />
                          {t("myCourses.failed", "Failed")}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-surface/80">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-surface border border-border hover:bg-border/50 text-text transition-colors"
          >
            {t("myCourses.close", "Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
