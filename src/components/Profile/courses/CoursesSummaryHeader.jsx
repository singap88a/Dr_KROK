import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaGraduationCap,
  FaCheckCircle,
  FaCoins,
  FaTrophy,
} from "react-icons/fa";

export default function CoursesSummaryHeader({ summary }) {
  const { t } = useTranslation();
  if (!summary) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
      {/* 1. Total Enrolled */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
            <FaGraduationCap />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {summary.video_courses_count || 0}V • {summary.live_courses_count || 0}L
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-text">
            {summary.total_enrolled_courses || 0}
          </div>
          <div className="text-xs font-medium text-text-secondary mt-1">
            {t("myCourses.totalEnrolled", "Enrolled Courses")}
          </div>
        </div>
      </div>

      {/* 2. Course Completion */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
            <FaCheckCircle />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            {summary.in_progress_courses_count || 0} {t("myCourses.inProgress", "In Progress")}
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-text">
            {summary.completed_courses_count || 0}
          </div>
          <div className="text-xs font-medium text-text-secondary mt-1">
            {t("myCourses.completed", "Completed Courses")}
          </div>
        </div>
      </div>

      {/* 3. Total Points (Update 15) */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">
            <FaCoins />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {summary.overall_points_percentage || 0}%
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-text">
            {summary.total_earned_points || 0}{" "}
            <span className="text-xs text-text-secondary font-normal">
              / {summary.total_possible_points || 0}
            </span>
          </div>
          <div className="text-xs font-medium text-text-secondary mt-1">
            {t("myCourses.totalPointsEarned", "Points Earned")}
          </div>
        </div>
      </div>

      {/* 4. Tests Solved & Passed */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg">
            <FaTrophy />
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
            {summary.total_tests_solved > 0
              ? `${Math.round(((summary.total_tests_passed || 0) / summary.total_tests_solved) * 100)}%`
              : "0%"}
          </span>
        </div>
        <div>
          <div className="text-2xl font-black text-text">
            {summary.total_tests_passed || 0}{" "}
            <span className="text-xs text-text-secondary font-normal">
              / {summary.total_tests_solved || 0}
            </span>
          </div>
          <div className="text-xs font-medium text-text-secondary mt-1">
            {t("myCourses.testsPassed", "Tests Passed")}
          </div>
        </div>
      </div>
    </div>
  );
}
