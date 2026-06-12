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
