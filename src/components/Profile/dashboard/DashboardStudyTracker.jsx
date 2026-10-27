import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaFire,
  FaCheckCircle,
  FaBolt,
  FaChartBar,
  FaClock,
  FaTrophy,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

// ── Study Metrics Left Column ─────────────────────────────────────────────────
function StudyMetricsColumn({ streak, today, thisWeek, thisMonth, t }) {
  return (
    <div className="space-y-3 flex flex-col justify-between">
      {/* Today's Study Card */}
      <div className="p-4 rounded-2xl border border-border/80 bg-background/50 flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
            {t("studyTracker.todayStudy", "Today's Study")}
          </span>
          <div className="text-2xl font-black text-text">
            {today.formatted_time || `${today.hours || 0}h`}
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {today.total_seconds > 0
              ? t("studyTracker.activeStudyLogged", "Net focused active time logged today")
              : t("studyTracker.noTimeYet", "Timer running as you browse & learn")}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-lg shrink-0">
          <FaClock />
        </div>
      </div>

      {/* Best Streak & Commitment */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50">
          <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1">
            <FaTrophy className="text-xs" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {t("studyTracker.longestStreak", "Best Streak")}
            </span>
          </div>
          <div className="text-lg font-black text-text">
            {streak.longest_streak || streak.current_streak || 0}{" "}
            <span className="text-xs font-normal text-text-secondary">{t("studyTracker.days", "days")}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50">
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 mb-1">
            <FaChartBar className="text-xs" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {t("studyTracker.monthlyGoal", "Commitment")}
            </span>
          </div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {thisMonth.commitment_percentage || 0}%
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Weekly Activity Bar Chart ─────────────────────────────────────────────────
function WeeklyActivityChart({ thisWeek, t }) {
  const fallbackDays = [
    { day_short: "Mon", total_seconds: 0, is_studied: false },
    { day_short: "Tue", total_seconds: 0, is_studied: false },
    { day_short: "Wed", total_seconds: 0, is_studied: false },
    { day_short: "Thu", total_seconds: 0, is_studied: false },
    { day_short: "Fri", total_seconds: 0, is_studied: false },
    { day_short: "Sat", total_seconds: 0, is_studied: false },
    { day_short: "Sun", total_seconds: 0, is_studied: false },
  ];

  const days = thisWeek.days && thisWeek.days.length > 0 ? thisWeek.days : fallbackDays;
  const maxSeconds = Math.max(...days.map((d) => d.total_seconds || 0), 3600);

  return (
    <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl border border-border/80 bg-background/50 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-text flex items-center gap-1.5">
            <FaChartBar className="text-primary text-xs" />
            <span>{t("studyTracker.weeklyActivity", "Weekly Activity (Last 7 Days)")}</span>
          </h4>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {t("studyTracker.totalThisWeek", "Total:")}{" "}
            <strong className="text-text">{thisWeek.formatted_time || `${thisWeek.total_hours || 0}h`}</strong>{" "}
            {t("studyTracker.across", "across")}{" "}
            <strong className="text-text">{thisWeek.active_days || 0}</strong>{" "}
            {t("studyTracker.activeDays", "active days")}
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-gradient-to-t from-amber-500 to-orange-500" />
            {t("studyTracker.studied", "Studied")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-border" />
            {t("studyTracker.noStudy", "No study")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-4 items-end min-h-[120px]">
        {days.map((day, idx) => {
          const heightPercent = day.is_studied
            ? Math.min(100, Math.max(20, Math.round(((day.total_seconds || 0) / maxSeconds) * 100)))
            : 8;

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-text-secondary select-none">
                {day.formatted_time || (day.hours ? `${day.hours}h` : "0m")}
              </div>
              <div className="w-full max-w-[32px] h-20 bg-surface border border-border/70 rounded-lg flex items-end p-1 overflow-hidden relative">
                <div
                  className={`w-full rounded-md transition-all duration-500 ${
                    day.is_studied
                      ? "bg-gradient-to-t from-amber-500 to-orange-500 shadow-sm"
                      : "bg-border/60"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  day.is_today
                    ? "text-primary font-bold underline"
                    : "text-text-secondary"
                }`}
              >
                {day.day_short || day.day_name?.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function DashboardStudyTracker({ streak, today, thisWeek, thisMonth, setActiveTab, isRtl }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl bg-surface border border-border/80 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all shadow-sm ${
              streak.is_studied_today
                ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white animate-pulse"
                : "bg-background text-gray-400 border border-border"
            }`}
          >
            <FaFire className={streak.is_studied_today ? "text-white" : "text-gray-400"} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-text">
                {streak.current_streak || 0} {t("studyTracker.daysStreak", "Days Streak")}
              </h3>
              {streak.is_studied_today ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <FaCheckCircle className="text-[10px]" />
                  {t("studyTracker.studiedToday", "Active Today 🔥")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <FaBolt className="text-[10px]" />
                  {t("studyTracker.studyNeeded", "Study today to keep streak!")}
                </span>
              )}
            </div>

            <p className="text-xs text-text-secondary mt-0.5">
              {streak.is_studied_today
                ? t("studyTracker.greatStreak", "Keep the momentum going! Great work today.")
                : t("studyTracker.startStudying", "Spend a few minutes studying now to maintain your flame!")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("study_tracker")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto shadow-sm"
        >
          <span>{t("studyTracker.viewFullReport", "Monthly Report & Calendar")}</span>
          {isRtl ? <FaArrowLeft className="text-[10px]" /> : <FaArrowRight className="text-[10px]" />}
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <StudyMetricsColumn streak={streak} today={today} thisWeek={thisWeek} thisMonth={thisMonth} t={t} />
        <WeeklyActivityChart thisWeek={thisWeek} t={t} />
      </div>
    </div>
  );
}
