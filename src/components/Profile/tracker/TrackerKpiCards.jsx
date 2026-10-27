import React from "react";
import { FaChartPie, FaClock, FaLayerGroup, FaTrophy } from "react-icons/fa";

export default function TrackerKpiCards({
  commitment = 0,
  reportData,
  formattedTotal = "0h",
  totalHours = 0,
  avgDailyHours = 0,
  bestDay,
  t,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Commitment Rate */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            {t("studyTracker.kpiCommitment", "Commitment Rate")}
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FaChartPie className="text-lg" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
          {commitment}%
        </div>
        <div className="mt-3">
          <div className="w-full bg-emerald-950/20 dark:bg-emerald-950/40 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, commitment))}%` }}
            />
          </div>
          <p className="text-[11px] text-textSecondary mt-2">
            {reportData?.active_study_days ?? 0} {t("studyTracker.of", "of")}{" "}
            {reportData?.days_passed_so_far ?? reportData?.total_days_in_month ?? 0}{" "}
            {t("studyTracker.activeDaysPassed", "days passed active")}
          </p>
        </div>
      </div>

      {/* Card 2: Total Study Time */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            {t("studyTracker.kpiTotalHours", "Total Monthly Study")}
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FaClock className="text-lg" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
          {formattedTotal}
        </div>
        <p className="text-xs text-textSecondary mt-3">
          ≈ {totalHours} {t("studyTracker.hoursStudied", "hours dedicated to your goals")}
        </p>
      </div>

      {/* Card 3: Daily Average */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            {t("studyTracker.kpiDailyAverage", "Daily Average")}
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FaLayerGroup className="text-lg" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
          {avgDailyHours}h
        </div>
        <p className="text-xs text-textSecondary mt-3">
          {t("studyTracker.perActiveDay", "Per active study day this month")}
        </p>
      </div>

      {/* Card 4: Best Day */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/25 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            {t("studyTracker.kpiBestDay", "Best Study Day 🏆")}
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FaTrophy className="text-lg" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
          {bestDay?.formatted_time || (bestDay?.hours ? `${bestDay.hours}h` : "—")}
        </div>
        <p className="text-xs text-textSecondary mt-3 truncate">
          {bestDay?.date
            ? `${t("studyTracker.achievedOn", "Achieved on")} ${bestDay.date}`
            : t("studyTracker.keepGoing", "Start studying today!")}
        </p>
      </div>
    </div>
  );
}
