import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FaFire,
  FaCalendarAlt,
  FaClock,
  FaTrophy,
  FaChevronLeft,
  FaChevronRight,
  FaBookOpen,
  FaVideo,
  FaBroadcastTower,
  FaQuestionCircle,
  FaCheckCircle,
  FaTimes,
  FaSync,
  FaChartPie,
  FaLayerGroup,
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useStudyTracker } from "../../context/StudyTrackerContext";

export default function StudyTrackerReport() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar" || i18n.dir?.() === "rtl";
  const { getStudyMonthlyReport } = useApi();
  const { streak, refreshSummary } = useStudyTracker();

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDayModal, setSelectedDayModal] = useState(null);

  // Fetch report data for selected month/year
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudyMonthlyReport({ month: selectedMonth, year: selectedYear });
      if (res?.success && res?.data) {
        setReportData(res.data);
      } else {
        setError(res?.message || t("studyTracker.errorLoading", "Failed to load monthly report"));
      }
    } catch (err) {
      console.error("Monthly report fetch error:", err);
      setError(err?.message || t("studyTracker.networkError", "Error connecting to server"));
    } finally {
      setLoading(false);
    }
  }, [getStudyMonthlyReport, selectedMonth, selectedYear, t]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedYear(currentDate.getFullYear());
  };

  const monthNames = [
    t("months.jan", "January"),
    t("months.feb", "February"),
    t("months.mar", "March"),
    t("months.apr", "April"),
    t("months.may", "May"),
    t("months.jun", "June"),
    t("months.jul", "July"),
    t("months.aug", "August"),
    t("months.sep", "September"),
    t("months.oct", "October"),
    t("months.nov", "November"),
    t("months.dec", "December"),
  ];

  const currentMonthLabel = `${monthNames[selectedMonth - 1] || reportData?.month_name || selectedMonth} ${selectedYear}`;

  const formatActivityName = (type) => {
    switch (type) {
      case "video":
        return t("studyTracker.activityVideo", "Recorded Video");
      case "live":
        return t("studyTracker.activityLive", "Live Lecture");
      case "quiz":
        return t("studyTracker.activityQuiz", "Test / Quiz");
      case "reading":
        return t("studyTracker.activityReading", "Article / Reading");
      case "flashcard":
        return t("studyTracker.activityFlashcard", "Flashcards");
      default:
        return t("studyTracker.activityGeneral", "General Study");
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "video":
        return <FaVideo className="text-blue-500" />;
      case "live":
        return <FaBroadcastTower className="text-red-500 animate-pulse" />;
      case "quiz":
        return <FaQuestionCircle className="text-purple-500" />;
      case "reading":
        return <FaBookOpen className="text-emerald-500" />;
      default:
        return <FaClock className="text-amber-500" />;
    }
  };

  const formatSeconds = (sec) => {
    if (!sec || sec <= 0) return "0m";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) {
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${m}m`;
  };

  const commitment = reportData?.commitment_percentage ?? 0;
  const totalHours = reportData?.total_study_hours ?? 0;
  const formattedTotal = reportData?.formatted_total_time || `${totalHours}h`;
  const avgDailyHours = reportData?.average_daily_hours ?? 0;
  const bestDay = reportData?.best_study_day;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Header & Month Navigator ─────────────────────────────────────── */}
      <div className="bg-surface/70 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-500/20">
              <FaFire className="text-amber-500" />
              <span>{t("studyTracker.badge", "Study Analytics & Streak")}</span>
            </div>
            <h2 className="text-2xl font-bold text-text flex items-center gap-3">
              <span>{t("studyTracker.monthlyReportTitle", "Monthly Study Report & Calendar")}</span>
            </h2>
            <p className="text-sm text-textSecondary mt-1">
              {t("studyTracker.monthlyReportDesc", "Track your daily study dedication, active hours, and learning consistency.")}
            </p>
          </div>

          {/* Month Selector Controls */}
          <div className="flex items-center gap-2 bg-background border border-border p-1.5 rounded-xl shadow-inner self-stretch sm:self-auto justify-between sm:justify-end">
            <button
              onClick={isRtl ? handleNextMonth : handlePrevMonth}
              className="p-2 hover:bg-surface rounded-lg text-textSecondary hover:text-text transition-colors"
              title={t("common.previous", "Previous")}
              aria-label="Previous Month"
            >
              <FaChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="font-semibold text-text text-sm sm:text-base px-3 min-w-[140px] text-center select-none">
              {currentMonthLabel}
            </span>

            <button
              onClick={isRtl ? handlePrevMonth : handleNextMonth}
              className="p-2 hover:bg-surface rounded-lg text-textSecondary hover:text-text transition-colors"
              title={t("common.next", "Next")}
              aria-label="Next Month"
            >
              <FaChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                handleCurrentMonth();
                fetchReport();
                refreshSummary();
              }}
              className="p-2 hover:bg-surface rounded-lg text-primary transition-colors ml-1"
              title={t("studyTracker.refresh", "Refresh Report")}
              aria-label="Refresh Report"
            >
              <FaSync className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 4 Top KPI Cards ──────────────────────────────────────────────── */}
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
            {bestDay?.date ? `${t("studyTracker.achievedOn", "Achieved on")} ${bestDay.date}` : t("studyTracker.keepGoing", "Start studying today!")}
          </p>
        </div>
      </div>

      {/* ─── Interactive Calendar Grid (1 to 31) ─────────────────────────── */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-text flex items-center gap-2">
              <FaCalendarAlt className="text-primary" />
              <span>{t("studyTracker.calendarTitle", "Daily Study Calendar Breakdown")}</span>
            </h3>
            <p className="text-xs text-textSecondary mt-1">
              {t("studyTracker.calendarSubtitle", "Click on any active day to inspect detailed course sessions and breakdown.")}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500"></div>
              <span className="text-textSecondary">{t("studyTracker.legendStudied", "Studied")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-surface border border-border"></div>
              <span className="text-textSecondary">{t("studyTracker.legendRest", "Rest Day")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border-2 border-primary"></div>
              <span className="text-textSecondary">{t("studyTracker.legendToday", "Today")}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="h-28 bg-surface/50 border border-border/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center text-textSecondary">
            <p className="text-red-500 mb-3">{error}</p>
            <button
              onClick={fetchReport}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {(reportData?.daily_breakdown || []).map((day) => {
              const isStudied = !!day.is_studied;
              const isToday = !!day.is_today;
              const hasActivities = Array.isArray(day.activities) && day.activities.length > 0;

              return (
                <button
                  key={day.day_number || day.date}
                  type="button"
                  onClick={() => {
                    if (isStudied || hasActivities) {
                      setSelectedDayModal(day);
                    }
                  }}
                  disabled={!isStudied && !hasActivities}
                  className={`relative p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[110px] group ${
                    isToday
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : ""
                  } ${
                    isStudied
                      ? "bg-gradient-to-br from-emerald-500/10 via-surface to-surface border-emerald-500/40 hover:border-emerald-500 hover:shadow-md cursor-pointer"
                      : "bg-surface/30 border-border/60 opacity-75 cursor-default"
                  }`}
                >
                  {/* Top: Day Number and Short Name */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center ${
                        isStudied
                          ? "bg-emerald-500 text-white shadow-sm"
                          : isToday
                          ? "bg-primary text-white"
                          : "bg-surface text-textSecondary border border-border"
                      }`}
                    >
                      {day.day_number}
                    </span>
                    <span className="text-[11px] font-medium text-textSecondary uppercase tracking-wider">
                      {day.day_short || day.day_name?.slice(0, 3)}
                    </span>
                  </div>

                  {/* Middle / Bottom: Time & Status */}
                  <div className="mt-2 w-full">
                    {isStudied ? (
                      <div>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                          <FaFire className="text-xs" />
                          <span>{day.study_formatted || `${day.study_hours}h`}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-textSecondary">
                            {day.sessions_count || (day.activities?.length ?? 1)}{" "}
                            {t("studyTracker.sessions", "sessions")}
                          </span>
                          <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                            {t("common.details", "Details")} →
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-textSecondary/60 italic">
                        {day.is_past ? t("studyTracker.noStudy", "No study") : "—"}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Day Activities Detail Modal ──────────────────────────────────── */}
      {selectedDayModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedDayModal(null)}
        >
          <div
            className="bg-background border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-scaleUp max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FaCalendarAlt className="text-lg" />
                </div>
                <div>
                  <h4 className="font-bold text-text text-lg">
                    {selectedDayModal.day_name}, {selectedDayModal.date}
                  </h4>
                  <p className="text-xs text-textSecondary">
                    {t("studyTracker.totalSessionTime", "Total logged time:")}{" "}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedDayModal.study_formatted || `${selectedDayModal.study_hours}h`}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDayModal(null)}
                className="p-2 text-textSecondary hover:text-text rounded-lg hover:bg-surface transition-colors"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Activities List */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-textSecondary">
                {t("studyTracker.activitiesDone", "Courses & Activities Completed")}
              </h5>

              {selectedDayModal.activities && selectedDayModal.activities.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedDayModal.activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface/60 hover:bg-surface transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-base">
                          {getActivityIcon(act.activity_type)}
                        </div>
                        <div>
                          <div className="font-semibold text-text text-sm line-clamp-1">
                            {act.course_title || t("studyTracker.generalPlatform", "General Platform Study")}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface border border-border text-textSecondary">
                              {formatActivityName(act.activity_type)}
                            </span>
                            {act.sessions && (
                              <span className="text-[11px] text-textSecondary">
                                {act.sessions} {t("studyTracker.sessions", "sessions")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-primary text-sm">
                          {formatSeconds(act.duration_seconds)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center rounded-xl bg-surface/50 text-textSecondary text-sm">
                  {t("studyTracker.generalStudyRecorded", "Study recorded for this day.")}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedDayModal(null)}
                className="px-5 py-2.5 bg-surface hover:bg-surface/80 border border-border rounded-xl text-sm font-semibold text-text transition-colors"
              >
                {t("common.close", "Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
