import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import StudentDetailsGrid from "./StudentDetailsGrid";
import CourseProgressCard from "./CourseProgressCard";

export default function StudentCard({ student, t, i18n, isExpanded, onToggle, formatDate }) {
  const completedCount = (student.courses || []).filter(
    c => c.is_completed || c.status === "completed" || c.percentage === 100
  ).length;
  const totalCourses = (student.courses || []).length;

  return (
    <div className="border border-border rounded-xl bg-background overflow-hidden transition-all duration-300 hover:shadow-sm">
      {/* Header Row */}
      <div
        onClick={onToggle}
        className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-surface/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={student.image || "/user.png"}
              alt={student.name}
              className={`w-14 h-14 rounded-full object-cover border-2 bg-slate-100 ${
                student.gender === "female" ? "border-pink-400" : "border-cyan-400"
              }`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/user.png";
              }}
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-text">{student.name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              {student.college_year && (
                <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-text-secondary rounded font-medium border border-border">
                  {student.college_year}
                </span>
              )}
              {student.specialization?.name && (
                <span className="px-2 py-0.5 text-xs bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded font-medium border border-teal-500/10">
                  {student.specialization.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact and metrics */}
        <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end">
          {/* Course stats badge */}
          <div className="text-right">
            <span className="text-xs text-text-muted font-semibold block">Courses</span>
            <span className="text-sm font-bold text-text">
              {completedCount} / {totalCourses} Completed
            </span>
          </div>

          {/* Expand trigger */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent double triggering since header is clickable
              onToggle();
            }}
            className={`p-2.5 rounded-full transition-all duration-300 shadow-sm border ${
              isExpanded
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-surface border-border hover:border-primary/30 hover:bg-primary/5 text-text-muted hover:text-primary"
            }`}
            aria-label="Toggle Details"
          >
            {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Detailed info area (expanded) */}
      {isExpanded && (
        <div className="border-t border-border bg-surface/50 p-6 space-y-6 animate-fadeIn">
          {/* Student Details Grid */}
          <StudentDetailsGrid student={student} formatDate={formatDate} />

          {/* Course details sub-list */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-text uppercase tracking-wider text-text-secondary">
              Enrolled Courses Detail
            </h4>
            {totalCourses === 0 ? (
              <p className="text-sm text-text-muted italic py-4">No enrolled courses yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.courses.map((course, idx) => (
                  <CourseProgressCard
                    key={idx}
                    course={course}
                    t={t}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
