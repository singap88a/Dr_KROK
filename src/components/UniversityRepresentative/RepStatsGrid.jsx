import React from "react";
import { FaUser, FaBook, FaCalendarAlt, FaAward } from "react-icons/fa";

export default function RepStatsGrid({
  t,
  totalStudents,
  totalVideoCourses,
  totalLiveCourses,
  completedCoursesCount
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      {/* Card 1: Total Students */}
      <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md hover:-translate-y-0.5 duration-300">
        <div className="p-4 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl">
          <FaUser className="text-2xl" />
        </div>
        <div>
          <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
            {t("universityRepresentative.totalStudents", "Total Students")}
          </p>
          <h3 className="text-2xl font-black text-text mt-1">{totalStudents}</h3>
        </div>
      </div>

      {/* Card 2: Recorded Courses */}
      <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md hover:-translate-y-0.5 duration-300">
        <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <FaBook className="text-2xl" />
        </div>
        <div>
          <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
            Recorded Courses
          </p>
          <h3 className="text-2xl font-black text-text mt-1">{totalVideoCourses}</h3>
        </div>
      </div>

      {/* Card 3: Live Courses */}
      <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md hover:-translate-y-0.5 duration-300">
        <div className="p-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
          <FaCalendarAlt className="text-2xl" />
        </div>
        <div>
          <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
            Live Courses
          </p>
          <h3 className="text-2xl font-black text-text mt-1">{totalLiveCourses}</h3>
        </div>
      </div>

      {/* Card 4: Completed Courses */}
      <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm flex items-center gap-4 transition hover:shadow-md hover:-translate-y-0.5 duration-300">
        <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
          <FaAward className="text-2xl" />
        </div>
        <div>
          <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
            {t("universityRepresentative.completedCourses", "Completed")}
          </p>
          <h3 className="text-2xl font-black text-text mt-1">{completedCoursesCount}</h3>
        </div>
      </div>
    </div>
  );
}
