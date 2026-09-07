import React from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function CourseProgressCard({ course, t, formatDate }) {
  const isCourseCompleted =
    course.is_completed || course.status === "completed" || course.percentage === 100;

  return (
    <div className="p-4 border border-border bg-background rounded-xl flex gap-3 shadow-sm hover:border-primary/20 transition-all">
      <img
        src={course.course_image || "/logo.png"}
        alt={course.course_name}
        className="w-16 h-20 rounded-lg object-cover bg-slate-100 border border-border shrink-0"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/logo.png";
        }}
      />
      <div className="flex-1 min-w-0 space-y-1.5">
        <h5 className="font-bold text-sm text-text line-clamp-1" title={course.course_name}>
          {course.course_name}
        </h5>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide ${
            course.type === "live"
              ? "bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
              : "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400"
          }`}>
            {course.type === "live" ? "Live" : "Recorded"}
          </span>

          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
            isCourseCompleted
              ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
              : course.percentage > 0
              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
              : "bg-slate-100 dark:bg-slate-800 text-text-secondary"
          }`}>
            {isCourseCompleted
              ? "Completed"
              : course.percentage > 0
              ? "In Progress"
              : "Not Started"}
          </span>
        </div>

        {/* Progress details */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Progress</span>
            <span className="font-semibold">{course.percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${course.percentage}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                isCourseCompleted ? "bg-emerald-500" : "bg-primary"
              }`}
            ></div>
          </div>
          <span className="text-[11px] text-text-muted block">
            {t("universityRepresentative.lessonsCount", {
              completed: course.completed_lessons,
              total: course.total_lessons
            })}
          </span>
        </div>

        {/* Test result if available */}
        {course.final_test_result && (
          <div className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
            course.final_test_result.passed
              ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-red-50/50 dark:bg-red-950/10 border-red-500/20 text-red-700 dark:text-red-400"
          }`}>
            <div className="pt-0.5">
              {course.final_test_result.passed ? (
                <FaCheckCircle className="text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-red-500" />
              )}
            </div>
            <div className="space-y-0.5">
              <span className="font-bold">
                {course.final_test_result.passed ? "Test Passed" : "Test Failed"}
              </span>
              <span className="block opacity-90 text-[10px]">
                Score: {course.final_test_result.score} / {course.final_test_result.total_score} ({course.final_test_result.percentage}%)
              </span>
            </div>
          </div>
        )}

        {/* All Tests results if available */}
        {course.tests && course.tests.length > 0 && (
          <details className="mt-3 text-xs group">
            <summary className="px-4 py-2 font-bold text-primary bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors select-none flex items-center justify-between outline-none shadow-sm border border-primary/20">
              <span>View Tests ({course.tests.length})</span>
              <span className="text-[10px] px-2 py-0.5 bg-primary/20 rounded-full font-semibold group-open:bg-primary group-open:text-white transition-colors">
                <span className="group-open:hidden">Expand</span>
                <span className="hidden group-open:inline">Collapse</span>
              </span>
            </summary>
            <div className="mt-2 p-3 border border-border rounded-lg space-y-3 max-h-56 overflow-y-auto custom-scrollbar bg-surface/50 shadow-inner">
              {course.tests.map((test, idx) => (
                <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-border/70 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-text line-clamp-2 leading-tight flex-1" title={test.test_name || test.test_type}>
                      {test.test_name || test.test_type}
                    </span>
                    <div className="shrink-0 mt-0.5">
                      {test.passed ? (
                         <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded text-[10px] border border-emerald-200 dark:border-emerald-900 shadow-sm">Passed</span>
                      ) : (
                         <span className="text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded text-[10px] border border-red-200 dark:border-red-900 shadow-sm">Failed</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bar for score */}
                  <div className="space-y-1.5 mt-1">
                    <div className="flex justify-between text-[10px] text-text-secondary font-medium">
                      <span>Score: {test.score} / {test.total_score}</span>
                      <span>{test.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${test.percentage}%` }}
                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                          test.passed ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                    {test.date && (
                      <div className="text-[9px] text-text-muted text-right mt-0.5">
                        {formatDate(test.date)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Timestamp */}
        {course.last_watched_at && (
          <span className="text-[10px] text-text-muted block italic">
            Last active: {formatDate(course.last_watched_at)}
          </span>
        )}
      </div>
    </div>
  );
}
